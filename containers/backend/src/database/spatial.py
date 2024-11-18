import math
from typing import List
from .schemas import Bbox


def create_absolute_bbox(lon: float, lat: float, side_length_km: float):
    """
    Create an absolute bbox in world coordinates with a given side length in kilometers.

    Parameters:
        lon (float): Longitude of the point.
        lat (float): Latitude of the point.
        side_length_km (float): Side length of the bbox in kilometers.

    Returns:
        list: Bbox as [(min_lon, min_lat), (max_lon, min_lat), (max_lon, max_lat), (min_lon, max_lat)]
    """
    # Earth's approximate radius in kilometers
    EARTH_RADIUS_KM = 6371.0

    # Convert side length in km to degrees latitude
    delta_lat = (side_length_km / EARTH_RADIUS_KM) * (180 / math.pi)

    # Convert side length in km to degrees longitude, accounting for latitude
    delta_lon = (
        side_length_km / (EARTH_RADIUS_KM * math.cos(math.radians(lat)))
    ) * (180 / math.pi)

    # Calculate the absolute bbox corners

    # Return bbox in a format suitable for PostGIS/SQLAlchemy
    lon_min = math.floor(lon / delta_lon) * delta_lon
    lon_max = lon_min + delta_lon
    lat_min = math.floor(lat / delta_lat) * delta_lat
    lat_max = lat_min + delta_lat

    return Bbox(
        lon_min=lon_min, lon_max=lon_max, lat_min=lat_min, lat_max=lat_max
    )


def create_relative_bbox(lon: float, lat: float, side_length_km: float):
    """
    Create a relative bbox in world coordinates with a given side length in kilometers.

    Parameters:
        lon (float): Longitude of the point.
        lat (float): Latitude of the point.
        side_length_km (float): Side length of the bbox in kilometers.

    Returns:
        list: Bbox as [(min_lon, min_lat), (max_lon, min_lat), (max_lon, max_lat), (min_lon, max_lat)]
    """
    # Earth's approximate radius in kilometers
    EARTH_RADIUS_KM = 6371.0

    # Convert side length in km to degrees latitude
    delta_lat = (side_length_km / EARTH_RADIUS_KM) * (180 / math.pi)

    # Convert side length in km to degrees longitude, accounting for latitude
    delta_lon = (
        side_length_km / (EARTH_RADIUS_KM * math.cos(math.radians(lat)))
    ) * (180 / math.pi)

    # Calculate the relative bbox corners

    # Return bbox in a format suitable for PostGIS/SQLAlchemy
    lon_min = lon - delta_lon / 2
    lon_max = lon + delta_lon / 2
    lat_min = lat - delta_lat / 2
    lat_max = lat + delta_lat / 2

    return Bbox(
        lon_min=lon_min, lon_max=lon_max, lat_min=lat_min, lat_max=lat_max
    )
