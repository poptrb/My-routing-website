from datetime import datetime, timedelta

from argon2 import PasswordHasher
from fastapi import Depends, HTTPException, status
from fastapi_users.db import SQLAlchemyUserDatabase
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select, update, or_, and_

from .models import Report, User, Token
from .schema import GetReportsRequest
from . import get_async_session


async def insert_token(db: AsyncSession, data: dict) -> None:
    pass


async def get_token(db: AsyncSession, data: dict) -> Token:
    pass


async def insert_report(db: AsyncSession, data: dict) -> None:
    report = Report(
        id=data["id"],
        uuid=data["uuid"],
        nThumbsUp=data["nThumbsUp"] if "nThumbsUp" in data.keys() else 0,
        reliability=data["reliability"],
        d_type=data["type"],
        street=data["street"] if "street" in data.keys() else None,
        wazeData=data["wazeData"],
        location=f"POINT({data['location']['x']} {data['location']['y']})",
        pubDate=datetime.fromtimestamp(data["pubMillis"] // 1000),
    )

    await report.save(db)


async def get_reports(db: AsyncSession, top: int | None = 50):
    result = await db.execute(
        select(Report).order_by(Report.pubDate.desc()).limit(top)
    )
    return result.scalars()


async def get_reports_two(db: AsyncSession, data: GetReportsRequest):

    limit_date: datetime = datetime.now() - timedelta(minutes=60 * 5)

    result = await db.execute(
        select(Report)
        .filter(
            Report.location.ST_Within(
                func.ST_MakeEnvelope(
                    data.bbox.lon_min,
                    data.bbox.lon_max,
                    data.bbox.lat_min,
                    data.bbox.lat_max,
                    4326,
                )
            )
        )
        .filter(Report.pubDate > limit_date)
    )

    return result.scalars()
    # return result.scalars().all()


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)
