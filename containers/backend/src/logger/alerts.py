from logging import getLogger
from typing import List

logger = getLogger()


def log_police_alert(alerts: List[dict], unique_alerts: List[dict]):
    logger.info(
        f"Found {len(alerts)} total police reports, {len(unique_alerts)} unique alerts"
    )

    logger.debug(
        "Police found on streets: "
        + ", ".join(
            [_["street"] for _ in unique_alerts if "street" in _.keys()]
        )
        + "\n"
        + "Police found at coordinates: "
        + ", ".join(
            [
                f"({_["location"]["x"]},{_["location"]["y"]})"
                for _ in unique_alerts
                if "street" not in _.keys() and "location" in _.keys()
            ]
        )
        )
