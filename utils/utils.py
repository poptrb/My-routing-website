from datetime import datetime, timedelta
import json
import math
import time
import pdb

from selenium.webdriver import ActionChains, Firefox
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    StaleElementReferenceException,
    MoveTargetOutOfBoundsException,
)


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

        # print_record(record)


def cull_request_list(driver):
    current_time = datetime.now()
    one_minute_ago = current_time - timedelta(minutes=1)
    filtered_list = [
        entry
        for entry in driver.requests
        if datetime.fromtimestamp(entry["pubMillis"]) < one_minute_ago
    ]
    print(
        len(filtered_list),
        [format_response(req)["date"] for req in driver.requests],
    )


def find_tile_by_loc(tiles, p):
    try:
        return list(
            filter(
                lambda _: _.location["x"] == p[0] and _.location["y"] == p[1],
                tiles,
            )
        )[0]
    except Exception as e:
        print(
            f"Could not find tile with location {(p[0], p[1])} in tile list!",
            e,
        )
        return None


def get_viewport_latlng(driver: Firefox) -> (int, int):
    el = driver.find_element(By.CLASS_NAME, "wm-attribution-control__latlng")
    el_latlng = el.find_element(By.XPATH, "./child::*")
    lat, lng = [_.strip() for _ in el_latlng.text.split("|")]
    return (lat, lng)


def pan_map(driver: Firefox, viewport_size: dict = None):

    map_container = driver.find_element(
        By.XPATH, './/div[contains(@class,"wm-map__leaflet wm-map")]'
    )

    try:
        # map_container, window_size['width'] / 2, 0  # pan to left
        # map_container, -1 * window_size['width'] / 2, 0  # pan to right
        # map_container, 0, -1 * window_size['height'] / 2.0  # pan upwards
        # map_container, 0, window_size['height'] / 2.0  # pan downwards

        # pdb.set_trace()
        for _ in range(3):
            ActionChains(driver).drag_and_drop_by_offset(
                map_container, 0, (viewport_size["height"] // 2)
            ).perform()
            print(get_viewport_latlng(driver))
            time.sleep(1)

        for _ in range(3):
            ActionChains(driver).drag_and_drop_by_offset(
                map_container, viewport_size["width"] // 2, 0
            ).perform()
            time.sleep(1)

    except MoveTargetOutOfBoundsException as e:
        print(
            "Could not move mouse from location: ",
            f"{map_container.location['x']},{map_container.location['y']}\n",
            e,
            sep=" ",
        )
        print("Moved mouse!")
