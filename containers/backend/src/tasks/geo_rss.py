from datetime import datetime
import json
import logging
import time

from asyncio import Queue, sleep
from itertools import chain, groupby
from typing import Optional, List

from asyncpg.exceptions import UniqueViolationError
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from aiohttp import ClientSession

from database import async_session_maker
from database.operations import insert_report, update_report
from database.schemas import ReportBbox
from logger.alerts import log_police_alert

urllib3_logger = logging.getLogger("urllib3")
urllib3_logger.setLevel(logging.CRITICAL)

logger = logging.getLogger(__name__)


async def handle_report_conflict(
    db_session: AsyncSession, ex: IntegrityError, id: str
):
    if not isinstance(ex.orig.__cause__, UniqueViolationError):
        logger.debug(f"Duplicate record: {ex.orig.__cause__}")
        raise ex

    logger.debug(f"Updating Report {id} with last seen: {datetime.now()}")
    update = {"lastSeenDate": datetime.now()}

    try:
        await update_report(db_session, id, **update)
    except SQLAlchemyError as ex:
        logger.exception(f"Save to DB failed for {id}", exc_info=ex)


async def process_alerts(alert_queue: Queue):

    async with async_session_maker() as db_session:
        alerts = []

        while not alert_queue.empty():
            alerts.append(await alert_queue.get())

        alerts = list(chain.from_iterable(alerts))

        unique_alerts = list(
            map(
                lambda _: _[0],
                groupby(sorted(alerts, key=(lambda _: _["uuid"]))),
            )
        )

        for u in unique_alerts:
            try:
                await insert_report(db_session, u)
            except IntegrityError as ex:
                await handle_report_conflict(db_session, ex, u["id"])

        log_police_alert(alerts, unique_alerts)


async def scan_rectangle(
    session: ClientSession,
    top: float,
    right: float,
    bot: float,
    left: float,
    lvl: int = 1,
    alert_queue: Queue = None,
):
    if lvl > 0:
        mid_height = bot + ((top - bot) / 2)
        mid_width = left + ((right - left) / 2)
        rects = [
            (top, mid_width, mid_height, left),
            (top, right, mid_height, mid_width),
            (mid_height, right, bot, mid_width),
            (mid_height, mid_width, bot, left),
        ]
        for t, r, b, l in rects:
            await sleep(1)
            await scan_rectangle(
                session, t, r, b, l, lvl=(lvl - 1), alert_queue=alert_queue
            )
    else:
        params = {
            "top": str(top),
            "bottom": str(bot),
            "left": str(left),
            "right": str(right),
            "env": "row",
            "types": "alerts",
        }

        body = await geo_rss_get(session, params=params)
        alerts = process_geo_rss_body(body)

        if alerts:
            logging.info(
                f"Found {len(alerts)} police alerts in sector N:{top}, S:{bot}, E: {right}, W: {left}"
            )
            await alert_queue.put(alerts)


def process_geo_rss_body(body: dict, alert_types=["POLICE"]) -> List:
    if "alerts" not in body.keys():
        return []
    alerts = list(filter(lambda _: _["type"] in alert_types, body["alerts"]))

    if not alerts:
        return []

    return alerts


async def geo_rss_get(session: ClientSession, params: dict) -> Optional[dict]:
    url = "https://www.waze.com/live-map/api/georss"
    headers = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Referer": "https://www.waze.com/live-map?utm_source=waze_website&utm_campaign=waze_website%27",
        "Alt-Used": "www.waze.com",
        "Connection": "keep-alive",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "TE": "trailers",
    }

    async with session.get(url, headers=headers, params=params) as r:
        try:
            body = await r.json()
            return await r.json()
            return json.loads(body)
        except json.JSONDecodeError as e:
            print(e)
            return None


async def refresh_reports(report_bbox: ReportBbox):

    alert_queue = Queue()

    async with ClientSession() as session:
        await scan_rectangle(
            session,
            report_bbox.top,
            report_bbox.right,
            report_bbox.bottom,
            report_bbox.left,
            alert_queue=alert_queue,
        )

    await process_alerts(alert_queue)
