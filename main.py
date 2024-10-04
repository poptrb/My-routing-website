#!/usr/bin/env python

from seleniumwire import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

import json
from time import sleep

from utils.utils import (
    format_record, format_response, print_record,
    process_geojson_response)


def setup_driver():
    """
    Setup a Chrome driver to Waze's desktop website.
    """

    options = Options()
    # options.add_argument('--headless')
    # options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()), options=options)

    driver.get(
        "https://www.waze.com/live-map?" +
        "utm_source=waze_website&utm_campaign=waze_website%27"
    )

    try:

        def acknowledge_boilerplate(
            driver,
            #html_classes=['wz-cc-disallow'],
            html_classes=['wz-cc-disallow', 'waze-tour-tooltip__acknowledge'],
            css_selectors=['.wz-downloadbar__close-button']):
            """
            Take care of consent banner, and other visual annoyances
             """

            for _ in html_classes:
                element = WebDriverWait(driver, 7).until(
                    EC.presence_of_element_located((By.CLASS_NAME, _)))
                print(f"Found HTML element with class: {_}")
                element.click()

            for _ in css_selectors:
                element = WebDriverWait(driver, 7).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, _)))
                print(f"Found HTML element with CSS selector: {_}")
                element.click()

        acknowledge_boilerplate(driver)
        print('Initalized web driver!')

        return driver
    except Exception as e:
        driver.close()
        raise e


def process_georss_requests(driver):
    georss_requests = [
            x for x in driver.requests if 'live-map/api/georss' in x.url]

    print(f"Total requests: {len(driver.requests)}",
          f"GeoRSS requests: {len(georss_requests)}.")

    for request in georss_requests:
        if 'live-map/api/georss' in request.url and hasattr(
                request.response, 'body'):

            response = format_response(request.response)

            if response:
                process_geojson_response(response)


def main_loop(driver):

    while True:

        sleep(4)
        process_georss_requests(driver)


def main():
    driver = setup_driver()
    main_loop(driver)


if __name__ == '__main__':
    main()
