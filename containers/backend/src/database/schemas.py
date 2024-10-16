from uuid import UUID
from geoalchemy2.elements import WKBElement
from geoalchemy2.shape import to_shape
from datetime import datetime
from logging import getLogger

from typing import Annotated
from pydantic import BaseModel, PlainSerializer, field_validator


logger = getLogger()


class LatLng(BaseModel):
    lat: float
    long: float


class ReportBase(BaseModel):
    id: str
    nThumbsUp: int | None
    reportRating: int | None
    reliability: int | None
    d_type: str
    uuid: UUID
    street: str | None
    wazeData: str | None
    location: LatLng
    pubDate: datetime

    @field_validator("location", mode="before")
    @classmethod
    def transform(cls, raw: WKBElement) -> LatLng:
        shape = to_shape(raw)
        return LatLng(lat=shape.x, long=shape.y)
