#!/usr/bin/env python

from time import sleep

from seleniumwire import webdriver
from selenium.webdriver.chrome.options import Options, DesiredCapabilities
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.actions.mouse_button import MouseButton
from selenium.webdriver.support.wait import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.firefox import GeckoDriverManager

from utils.utils import (
    cull_request_list,
    format_response,
    process_geojson_response,
    pan_map,
)


def setup_driver():
    """
    Setup a Chrome driver to Waze's desktop website.
    """

    options = Options()
    # options.add_argument('--headless')
    # options.add_argument('--no-sandbox')
    options.add_argument("--disable-dev-shm-usage")
    # driver = webdriver.Chrome(
    #         service=Service(ChromeDriverManager().install()), options=options)
    driver = webdriver.Firefox(service=Service(GeckoDriverManager().install()))

    driver.maximize_window()
    driver.get(
        "https://www.waze.com/live-map?"
        + "utm_source=waze_website&utm_campaign=waze_website%27"
    )

    try:

        def acknowledge_banners(
            driver,
            html_classes=["wz-cc-disallow", "waze-tour-tooltip__acknowledge"],
            css_selectors=[".wz-downloadbar__close-button"],
        ):
            """
            Take care of consent banner, and other visual annoyances
            """

            for _ in html_classes:
                element = WebDriverWait(driver, 7).until(
                    EC.presence_of_element_located((By.CLASS_NAME, _))
                )
                print(f"Found HTML element with class: {_}")
                element.click()

            for _ in css_selectors:
                element = WebDriverWait(driver, 7).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, _))
                )
                print(f"Found HTML element with CSS selector: {_}")
                element.click()

        acknowledge_banners(driver)

        plus_icon = driver.find_element(
            By.XPATH, './/i[contains(@class, "w-icon-plus")]'
        )
        plus_icon.click()
        sleep(2)

        print("Initalized web driver!")

        return driver
    except Exception as e:
        driver.close()
        raise e


def process_georss_requests(driver):
    georss_requests = [
        x for x in driver.requests if "live-map/api/georss" in x.url
    ]

    print(
        f"Total requests: {len(driver.requests)}",
        f"GeoRSS requests: {len(georss_requests)}.",
    )

    for request in georss_requests:
        if "live-map/api/georss" in request.url and hasattr(
            request.response, "body"
        ):

            response = format_response(request.response)

            if response:
                process_geojson_response(response)


def main_loop(driver):

    while True:

        process_georss_requests(driver)
        # cull_request_list(driver)
        # breakpoint()
        clientHeight = driver.execute_script(
            "return document.documentElement.clientHeight"
        )
        clientWidth = driver.execute_script(
            "return document.documentElement.clientWidth"
        )
        pan_map(
            driver,
            viewport_size={"width": clientWidth, "height": clientHeight},
        )
        sleep(4.5)


def main():
    driver = setup_driver()
    main_loop(driver)


if __name__ == "__main__":
    main()
