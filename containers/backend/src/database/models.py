from datetime import datetime
from typing import Tuple
from uuid import UUID

from sqlalchemy import func, Float, ForeignKey, Integer, String, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geometry

from database import Base


class Report(Base):
    __tablename__ = "report"

    id: Mapped[str] = mapped_column(String, primary_key=True, autoincrement=False)
    nThumbsUp: Mapped[int] = mapped_column(Integer, nullable=True)
    reportRating: Mapped[int] = mapped_column(Integer, nullable=True)
    reliability: Mapped[int] = mapped_column(Integer, nullable=True)
    d_type: Mapped[str] = mapped_column(String)
    uuid: Mapped[UUID] = mapped_column(String)
    street: Mapped[str] = mapped_column(String, nullable=True)
    wazeData: Mapped[str] = mapped_column(String)
    location: Mapped[str] = mapped_column(Geometry("POINT", srid=4326))
