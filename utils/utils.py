import math
import json
from datetime import datetime, timedelta

from selenium.webdriver import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def format_record(record):
    record['pubTime'] = datetime.utcfromtimestamp(record['pubMillis']/1000.0)
    record['pubTime'] = record['pubTime'].strftime('%Y-%m-%d %H:%M:%S')

    return record


def print_record(record):
    _ = {
        'wazeData': record['wazeData'],
        'pubTime': record['pubTime'],
        'street': record['street'] if 'street' in record.keys() else '',
        'uuid': record['uuid'],
        'location': record['location']
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
            "body": response.body.decode('utf-8')
        }
        return formatted_response
    except Exception as e:
        print(f"RESPONSE STRUCTURE EXCEPTION: {response.__class__}: ",
              f"{str(dir(response))}",
              f"Original exception: {e}")
    else:
        return None


def process_geojson_response(response):
    data = json.loads(response['body'])
    for record in filter(lambda x: x['type'] in ['POLICE'], data['alerts']):
        record = format_record(record)

        print_record(record)


def cull_request_list(driver):
    current_time = datetime.now()
    one_minute_ago = current_time - timedelta(minutes=1)
    filtered_list = [entry for entry in driver.requests if datetime.fromtimestamp(entry['pubMillis']) < one_minute_ago]
    print(
      len(filtered_list),
      [format_response(req)['date'] for req in driver.requests])


def pan_map(driver):
    _ = WebDriverWait(driver, 30).until(
        EC.presence_of_element_located(
            (By.XPATH, './/img[contains(@class, "leaflet-tile-loaded")]')))

    leaflet_tiles = driver.find_elements(
        By.XPATH, './/img[contains(@class, "leaflet-tile-loaded")]')

    print(f"Found {len(leaflet_tiles)} Leaflet tiles!")

    tiles_pos = [
        (tile.location['x'], tile.location['y']) for tile in leaflet_tiles ]

    c_x, c_y = find_central_point(tiles_pos)
    t_x, t_y = find_bounding_points(tiles_pos)[1]

    center_tile = list(filter(
        lambda x: x.location['x'] == c_x and x.location['y'] == c_y,
        leaflet_tiles))[0]

    target_tile = list(filter(
        lambda x: x.location['x'] == t_x and x.location['y'] == t_y,
        leaflet_tiles))[0]

    ActionChains(driver).\
        drag_and_drop_by_offset(
            center_tile,
            (target_tile.location['x'] - center_tile.location['x']) / 2,
            (target_tile.location['y'] - center_tile.location['y']) / 2).\
        perform()
#
    print("Moved mouse!")


def find_bounding_points(points):
    farthest_up = max(points, key=lambda point: point[1])
    farthest_down = min(points, key=lambda point: point[1])
    farthest_east = max(points, key=lambda point: point[0])
    farthest_west = min(points, key=lambda point: point[0])

    print( f"Farthest points: {[farthest_down, farthest_up, farthest_west, farthest_east]}")
    return [farthest_down, farthest_up, farthest_west, farthest_east]


def find_central_point(points):
    center_x = sum(x for x, y in points) / len(points)
    center_y = sum(y for x, y in points) / len(points)

    def distance(point):
        x, y = point
        return math.sqrt((x - center_x) ** 2 + (y - center_y) ** 2)

    result = min(points, key=distance)
    print(f"Center point of tiles is {result}")
    return result

# action.pointer_action.move_to_location(8, 0)
# draggable = driver.find_element(By.ID, "draggable")
# map = driver.find_element(By.CLASS_NAME, "wm-map__leaflet wm-map leaflet-container leaflet-touch leaflet-fade-anim leaflet-grab leaflet-touch-drag leaflet-touch-zoom wm-map--zoom-medium wm-map--zoom-14")
#
# map_location = map.location
#
# finish = driver.find_element(By.ID, "droppable").location
#
# action = ActionBuilder(driver)
# action.pointer_action.=
# ActionChains(driver).drag_and_drop_by_offset(
#     draggable,
#     finish['x'] - start['x'], finish['y'] - start['y']
# ).perform()
