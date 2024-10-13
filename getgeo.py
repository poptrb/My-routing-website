#!/usr/bin/env python


#     'Cookie': '_web_visitorid=c7cd2e57-c885-4a33-ae94-8c2476e2b72e;
# _web_session=UzFZRjZCTXhVQWFEYVRlSTR0aHZheFBsWG1wb25QOWFYOVJrOUV0Y0FSYUJOQ2IwTmt1N1ZwaVFia04vSDR1QS0tVGZrRlpLTDJCczJmL2kzdm8
# m9vdz09--d809d352dd2328959c267c5ba6c64994dac94c94; _csrf_token=OCtIBACLdlCEXo8OLO1WxHrxykOVGtmv-O6vDmeOoYI',

import time
import logging
import requests
import json

from typing import Optional, List


urllib3_logger = logging.getLogger('urllib3')
urllib3_logger.setLevel(logging.CRITICAL)

logging.basicConfig(
    format="%(asctime)s %(levelname)s:%(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    level=logging.DEBUG,
)

logger = logging.getLogger(__name__)


def scan_rectangle(
    session: requests.Session,
    top: float,
    right: float,
    bot: float,
    left: float,
    lvl: int = 2,
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
            scan_rectangle(session, t, r, b, l, lvl=(lvl - 1))
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
                f"Found {len(alerts)} in sector N:{top}, S:{bot}, E: {right}, W: {left}"
            )


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


def main():
    params = {
        "top": 44.435618668754174,
        "bottom": 44.417965537803,
        "left": 26.011831283569336,
        "right": 26.193311691284183,
        "env": "row",
        "types": "alerts,traffic,users",
    }

    params = {
        "top": 44.539,
        "bottom": 44.311,
        "left": 25.847,
        "right": 26.302,
        "env": "row",
        "types": "alerts",
    }

    with requests.Session() as session:
        scan_rectangle(
            session,
            params["top"],
            params["right"],
            params["bottom"],
            params["left"],
        )


if __name__ == "__main__":
    main()
