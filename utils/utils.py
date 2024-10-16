from datetime import datetime, timedelta
import json
import time
import pdb

from selenium.webdriver import ActionChains, Firefox
from selenium.webdriver.common.by import By
from selenium.common.exceptions import (
    MoveTargetOutOfBoundsException,
)

import rlcompleter

pdb.Pdb.complete = rlcompleter.Completer(locals()).complete


def format_record(record):
    record["pubTime"] = datetime.utcfromtimestamp(
        record["pubMillis"] / 1000.0
    ).strftime("%Y-%m-%d %H:%M:%S")

    return record


def print_record(record):
    _ = {
        "wazeData": record["wazeData"],
        "pubTime": record["pubTime"],
        "street": record["street"] if "street" in record.keys() else "",
        "uuid": record["uuid"],
        "location": record["location"],
    }

    print(json.dumps(record, indent=4))
    # print(json.dumps(_, indent=4))


def format_response(response):
    try:
        formatted_response = {
            "status_code": response.status_code,
            "reason": response.reason,
            "headers": dict(response.headers),
            "date": response.date.strftime("%Y-%m-%d %H:%M:%S"),
            "body": response.body.decode("utf-8"),
        }
        return formatted_response
    except Exception as e:
        print(
            f"RESPONSE STRUCTURE EXCEPTION: {response.__class__}: ",
            f"{str(dir(response))}",
            f"Original exception: {e}",
        )
    else:
        return None


def process_geojson_response(response):
    if response["body"]:
        data = json.loads(response["body"])
        for record in filter(
            lambda x: x["type"] in ["POLICE"], data["alerts"]
        ):
            record = format_record(record)

            print_record(record)


def cull_request_list(driver):
    current_time = datetime.now()
    one_minute_ago = current_time - timedelta(minutes=5)

    request_list = []

    for r in driver.requests:
        if (
            hasattr(r.response, "body")
            and "live-map/api/georss" in r.url
            # and r.response.date > one_minute_ago
        ):
            request_list.append(r)

    print(f"GeoRSS requests: {len(request_list)}")
    pdb.set_trace()
    return request_list


def get_viewport_latlng(driver: Firefox) -> (int, int):
    el = driver.find_element(By.CLASS_NAME, "wm-attribution-control__latlng")
    el_latlng = el.find_element(By.XPATH, "./child::*")
    lat, lng = [_.strip() for _ in el_latlng.text.split("|")]
    return (lat, lng)


def pan_map(driver: Firefox):

    # pdb.set_trace()
    clientHeight = driver.execute_script(
        "return document.documentElement.clientHeight"
    )
    clientWidth = driver.execute_script(
        "return document.documentElement.clientWidth"
    )
    map_container = driver.find_element(
        By.XPATH, './/div[contains(@class,"wm-map__leaflet wm-map")]'
    )

    try:
        # map_container, window_size['width'] / 2, 0  # pan to left
        # map_container, -1 * window_size['width'] / 2, 0  # pan to right
        # map_container, 0, -1 * window_size['height'] / 2.0  # pan upwards
        # map_container, 0, window_size['height'] / 2.0  # pan downwards

        print(f"Initial position: {get_viewport_latlng(driver)}")
        # pdb.set_trace()
        for _ in range(3):
            ActionChains(driver).drag_and_drop_by_offset(
                map_container, 0, (clientHeight // 2)
            ).perform()
            print(get_viewport_latlng(driver))
            time.sleep(3)

        for _ in range(3):
            ActionChains(driver).drag_and_drop_by_offset(
                map_container, clientWidth // 2, 0
            ).perform()
            print(get_viewport_latlng(driver))
            time.sleep(3)

        for _ in range(3):
            ActionChains(driver).drag_and_drop_by_offset(
                map_container, -1 * (clientWidth // 2), 0
            ).perform()
            print(get_viewport_latlng(driver))
            time.sleep(3)

        for _ in range(3):
            ActionChains(driver).drag_and_drop_by_offset(
                map_container, 0, -1 * (clientHeight // 2)
            ).perform()
            print(get_viewport_latlng(driver))
            time.sleep(3)

        print(f"Final position: {get_viewport_latlng(driver)}")

    except MoveTargetOutOfBoundsException as e:
        print(
            "Could not move mouse from location: ",
            f"{map_container.location['x']},{map_container.location['y']}\n",
            e,
            sep=" ",
        )
        print("Moved mouse!")
