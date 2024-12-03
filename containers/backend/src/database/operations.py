from datetime import datetime, timedelta
from logging import getLogger
from os import getenv, environ
from typing import List
from uuid import UUID

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError
from fastapi import Depends, HTTPException, status
from fastapi_users.db import SQLAlchemyUserDatabase
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select, update, or_, and_, union_all

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


async def check_and_create_admin_token(db: AsyncSession) -> None:
    result = await db.execute(select(func.count(SignupToken.id)))
    count = result.scalar()

    if count == 0:
        # Create a new admin token
        admin_token = environ["ADMIN_TOKEN"]
        if admin_token:
            await insert_token(db, SignupTokenModel(token_hash=admin_token))
        else:
            logger.error("Admin token environment variable not set.")


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

    limit_date: datetime = datetime.now() - timedelta(minutes=5)

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

    dwithin_conditions = [
        func.ST_DWithin(
            Report.location,
            func.ST_SetSRID(
                func.ST_MakePoint(user_coord.long, user_coord.lat),
                4326,
            ),
            0.1,
        )
        for user_coord in data.user_coords
    ]

    result_near_user = (
        select(Report)
        .filter(
            and_(
                Report.lastSeenDate > limit_date,
                dwithin_conditions[0],
                # bbox_conditions[0],
            )
        )
        .order_by(
            func.ST_Distance(
                Report.location,
                func.ST_SetSRID(
                    func.ST_MakePoint(
                        data.user_coords[0].long, data.user_coords[0].lat
                    ),
                    4326,
                ),
            )
        )
        .limit(15)
    )

    result_near_destination = (
        select(Report)
        .filter(
            and_(
                Report.lastSeenDate > limit_date,
                dwithin_conditions[1],
                # bbox_conditions[1],
            )
        )
        .order_by(
            func.ST_Distance(
                Report.location,
                func.ST_SetSRID(
                    func.ST_MakePoint(
                        data.user_coords[1].long, data.user_coords[1].lat
                    ),
                    4326,
                ),
            )
        )
        .limit(15)
    )

    result = await db.execute(
        select(Report).from_statement(
            union_all(result_near_user, result_near_destination)
        )
    )
    return result.scalars()


async def on_user_creation(db: AsyncSession, token_id: int) -> None:
    if token_id != 1:
        return

    user_result = await db.execute(select(User).where(User.token_id == 1))

    user = user_result.scalars().all()[0]

    user.is_superuser = True
    await token.save(db)


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)
