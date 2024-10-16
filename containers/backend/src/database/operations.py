from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select, update, or_, and_

from .models import Report


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
    )

    await report.save(db)
