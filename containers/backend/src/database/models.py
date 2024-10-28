from datetime import datetime
from typing import Tuple
from uuid import UUID

from sqlalchemy import (
    func,
    Boolean,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    TIMESTAMP,
    DateTime,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geometry
from fastapi_users.db import (
    SQLAlchemyBaseUserTableUUID,
    SQLAlchemyUserDatabase,
)

from database import Base


class SignupToken(Base):
    __tablename__ = "signup_token"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )
    token_hash: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime)
    user_id: Mapped["User"] = relationship(back_populates="fastapi_user")
    used_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)


class User(SQLAlchemyBaseUserTableUUID, Base):
    __tablename__ = "fastapi_user"

    role: Mapped[str] = mapped_column(String)
    signup_date: Mapped[datetime] = mapped_column(DateTime)
    token_id: Mapped[int] = mapped_column(ForeignKey("signup_token.id"))
    token: Mapped["SignupToken"] = relationship(back_populates="user_id")


class Report(Base):
    __tablename__ = "report"
    __table_args__ = (
        Index('idx_report_pubDate', 'pubDate', postgresql_using="btree"),
    )

    id: Mapped[str] = mapped_column(
        String, primary_key=True, autoincrement=False
    )
    nThumbsUp: Mapped[int] = mapped_column(Integer, nullable=True)
    reportRating: Mapped[int] = mapped_column(Integer, nullable=True)
    reliability: Mapped[int] = mapped_column(Integer, nullable=True)
    d_type: Mapped[str] = mapped_column(String)
    uuid: Mapped[UUID] = mapped_column(String)
    street: Mapped[str] = mapped_column(String, nullable=True)
    wazeData: Mapped[str] = mapped_column(String)
    location: Mapped[str] = mapped_column(Geometry("POINT", srid=4326))
    pubDate: Mapped[datetime] = mapped_column(DateTime)
