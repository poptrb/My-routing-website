from datetime import datetime
from logging import getLogger
from typing import List, Optional
from uuid import UUID

from fastapi_users import schemas
from geoalchemy2.elements import WKBElement
from geoalchemy2.shape import to_shape
from pydantic import BaseModel, field_validator, ConfigDict


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
    firstSeenDate: datetime
    lastSeenDate: datetime

    @field_validator("location", mode="before")
    @classmethod
    def transform(cls, raw: WKBElement) -> LatLng:
        shape = to_shape(raw)
        return LatLng(lat=shape.x, long=shape.y)


class UserRead(schemas.BaseUser[UUID]):
    signup_date: datetime
    token_id: int


class UserCreate(schemas.BaseUserCreate):
    signup_date: datetime = datetime.now()
    token_cleartext: str

    model_config = ConfigDict(extra="allow")


class UserUpdate(schemas.BaseUserUpdate):
    pass


class ReportData(BaseModel):
    country: str
    nThumbsUp: int
    city: str
    reportRating: int
    reportByMunicipalityUser: str
    reliability: int
    d_type: str
    fromNodeId: int
    uuid: str
    speed: int
    reportMood: int
    subtype: Optional[str]
    street: Optional[str]
    additionalInfo: Optional[str]
    toNodeId: int
    id: str
    nComments: int
    reportBy: str
    inscale: bool
    comments: List[dict]
    confidence: int
    roadType: int
    magvar: int
    wazeData: str
    location: dict
    pubMillis: int


class ReportBbox(BaseModel):
    top: float
    right: float
    left: float
    bottom: float
    env: str
    types: str


class Bbox(BaseModel):
    lat_min: float
    lat_max: float
    lon_min: float
    lon_max: float


class GetAbsoluteBboxReportsRequest(BaseModel):
    top: int | None = 50
    user_coords: List[LatLng]
    newer_than: datetime | None


class GetReportsRequest(BaseModel):
    bbox: Bbox
    top: int | None
    user_coords: LatLng
    newer_than: datetime | None


class SignupTokenModel(BaseModel):
    token_hash: str


class SignupTokenModelRead(SignupTokenModel):
    created_at: datetime
    used_at: datetime | None
