from datetime import datetime, timedelta
from logging import getLogger
from uuid import UUID
from typing import List

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError
from fastapi import Depends, HTTPException, status
from fastapi_users.db import SQLAlchemyUserDatabase
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select, update, or_, and_

from .models import Report, User, SignupToken
from .schemas import GetAbsoluteBboxReportsRequest, SignupTokenModel
from . import get_async_session


logger = getLogger()
ph = PasswordHasher()


async def insert_token(db: AsyncSession, data: SignupTokenModel) -> None:
    token = SignupToken(
        token_hash=ph.hash(data.token_hash), created_at=datetime.now()
    )

    await token.save(db)


async def invalidate_token(db: AsyncSession, token_id: int) -> None:
    token_result = await db.execute(
        select(SignupToken).where(SignupToken.id == token_id)
    )

    token = token_result.scalars().all()[0]

    token.used_at = datetime.now()
    await token.save(db)


async def get_token_by_id(db: AsyncSession, id: UUID) -> SignupToken | None:
    result = await db.execute(select(SignupToken).filter(SignupToken.id == id))
    return result.one()


async def get_token(db: AsyncSession, cleartext: str) -> SignupToken | None:
    def verify_token(token, cleartext):
        try:
            ph.verify(token.token_hash, cleartext)
            logger.debug(cleartext)
            return token.token_hash
        except (InvalidHashError, VerifyMismatchError):
            return None

    result = await db.execute(
        select(SignupToken).filter(SignupToken.used_at == None)
    )
    logger.info(result.scalars())

    for token in result.scalars():
        if verify_token(token, cleartext):
            return token

    raise HTTPException(401, "Invalid token!")


async def update_report(db: AsyncSession, id: str, **data) -> None:
    await db.execute(
        update(Report)
        .where(Report.id == id)
        .values(lastSeenDate=datetime.now())
    )


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
        firstSeenDate=datetime.now(),
        lastSeenDate=datetime.now(),
    )

    await report.save(db)


async def get_reports(db: AsyncSession, top: int | None = 50):
    result = await db.execute(
        select(Report).order_by(Report.pubDate.desc()).limit(top)
    )
    return result.scalars()


async def get_reports_by_bbox(
    db: AsyncSession,
    bboxes: List[List[List[float]]],  # yes, a list of bbox
    data: GetAbsoluteBboxReportsRequest,
):

    limit_date: datetime = datetime.now() - timedelta(minutes=20)

    bbox_conditions = [
        func.ST_Within(
            Report.location,
            func.ST_MakeEnvelope(
                bbox.lon_min,
                bbox.lon_max,
                bbox.lat_min,
                bbox.lat_max,
                4326,
            ),
        )
        for bbox in bboxes
    ]

    result = await db.execute(
        select(Report)
        .filter(or_(*bbox_conditions), Report.lastSeenDate > limit_date)
        .order_by(
            func.ST_Distance(
                Report.location,
                func.ST_SetSRID(
                    func.ST_MakePoint(
                        data.user_coords[0].lat, data.user_coords[1].long
                    ),
                    4326,
                ),
            )
        )
        .limit(25)
    )

    return result.scalars()
    # return result.scalars().all()


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)
