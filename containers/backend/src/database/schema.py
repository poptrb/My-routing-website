from datetime import datetime
from typing import List, Optional
from uuid import UUID

from fastapi_users import schemas
from pydantic import BaseModel


class UserRead(schemas.BaseUser[UUID]):
    pass


class UserCreate(schemas.BaseUserCreate):
    pass


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


class Bbox(BaseModel):
    lat_min: float
    lat_max: float
    lon_min: float
    lon_max: float


class GetReportsRequest(BaseModel):
    bbox: Bbox
    top: int | None
    since: datetime | None
