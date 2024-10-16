#!/usr/bin/env python

import time
import logging
import requests
import json

import queue

from itertools import chain, groupby
from typing import Optional, List


urllib3_logger = logging.getLogger("urllib3")
urllib3_logger.setLevel(logging.CRITICAL)

# logging.basicConfig(
#     format="%(asctime)s %(levelname)s: %%(message)s",
#     datefmt="%Y-%m-%d %H:%M:%S",
#     level=logging.DEBUG,
# )

logger = logging.getLogger(__name__)


def consume_alerts(alert_queue: queue.Queue):
    alerts = []

    while not alert_queue.empty():
        alerts.append(alert_queue.get())

    alerts = list(chain.from_iterable(alerts))

    logger.debug(f"Found {len(alerts)} total police reports")

    unique_alerts = list(
        map(lambda _: _[0], groupby(sorted(alerts, key=(lambda _: _["uuid"]))))
    )

    with open("alerts.json", "w") as f:
        json.dump(unique_alerts, f, indent=4)

    logger.debug(f"Found {len(alerts)} total unique police reports")

    logger.info(
        "Police found on streets: "
        + ", ".join(
            [_["street"] for _ in unique_alerts if "street" in _.keys()]
        )
    )

    logger.info(
        "Police found at coordinates: "
        + ", ".join(
            [
                f"({_["location"]["x"]},{_["location"]["y"]})"
                for _ in unique_alerts
                if "street" not in _.keys() and "location" in _.keys()
            ]
        )
    )


def scan_rectangle(
    session: requests.Session,
    top: float,
    right: float,
    bot: float,
    left: float,
    lvl: int = 1,
    alert_queue: queue.Queue = None,
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
            time.sleep(1)
            scan_rectangle(
                session, t, r, b, l, lvl=(lvl - 1), alert_queue=alert_queue
            )
    else:
        params = {
            "top": str(top),
            "bottom": str(bot),
            "left": str(left),
            "right": str(right),
            "env": "row",
            "types": "alerts,traffic,users",
        }

        body = geo_rss_get(session, params=params)
        alerts = process_geo_rss_body(body)

        if alerts:
            logging.info(
                f"Found {len(alerts)} police alerts in sector N:{top}, S:{bot}, E: {right}, W: {left}"
            )
            alert_queue.put(alerts)


def process_geo_rss_body(body: dict, alert_types=["POLICE"]) -> List:
    if "alerts" not in body.keys():
        return []
    alerts = list(filter(lambda _: _["type"] in alert_types, body["alerts"]))

    if not alerts:
        return []

    return alerts


def geo_rss_get(session: requests.Session, params: dict) -> Optional[dict]:
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

    response = session.get(url, headers=headers, params=params)
    response.raise_for_status()

    try:
        return json.loads(response.text)
    except json.JSONDecodeError as e:
        print(e)
        return None

    print(response.text)


def scrap():

    params = {
        "top": 44.539,
        "bottom": 44.311,
        "left": 25.847,
        "right": 26.302,
        "env": "row",
        "types": "alerts",
    }

    alert_queue = queue.Queue()
    with requests.Session() as session:
        scan_rectangle(
            session,
            params["top"],
            params["right"],
            params["bottom"],
            params["left"],
            alert_queue=alert_queue,
        )

    consume_alerts(alert_queue)


if __name__ == "__main__":
    scrap()
