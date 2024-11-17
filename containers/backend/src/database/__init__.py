from datetime import datetime
from typing import AsyncGenerator, Any, Annotated
from logging import getLogger

from asyncpg.exceptions import UniqueViolationError
from fastapi import Depends
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from settings import settings

logger = getLogger(__name__)


class ReportBase(DeclarativeBase):
    id: str
    __name__: str

    async def save(self, db: AsyncSession):
        try:
            db.add(self)
            return await db.commit()
        except IntegrityError as e:
            if not isinstance(e.orig.__cause__, UniqueViolationError):
                logger.debug(f"Duplicate record: {e.orig.__cause__}")
                pass

            logger.debug(f"Updating record {self.id}")
            update = {"lastSeenDate": datetime.now()}
            await self.update(db, **update)
        except SQLAlchemyError as ex:
            logger.exception("Save to DB failed! Rolling back...", exc_info=ex)
            await db.rollback()

    async def update(self, db: AsyncSession, **kwargs):
        try:
            for k, v in kwargs.items():
                setattr(self, k, v)
            return await db.commit()
        except SQLAlchemyError as ex:
            logger.exception("Update on DB failed!", exc_info=ex)
            await db.rollback()

    async def delete(self, db: AsyncSession):
        try:
            await db.delete(self)
            await db.commit()
            return True
        except SQLAlchemyError as ex:
            await db.rollback()
            logger.exception("Update on DB failed!", exc_info=ex)


class Base(DeclarativeBase):
    id: Any
    __name__: str

    async def save(self, db: AsyncSession):
        try:
            db.add(self)
            return await db.commit()
        except IntegrityError as ex:
            # if isinstance(e.orig.exc_type, UniqueViolationError):
            logger.debug(f"Duplicate record: {ex.orig.__cause__}")
            await db.rollback()
            raise ex
        except SQLAlchemyError as ex:
            await db.rollback()
            logger.exception("Save to DB failed!", exc_info=ex)
            raise ex

    async def update(self, db: AsyncSession, **kwargs):
        try:
            for k, v in kwargs.items():
                setattr(self, k, v)
            return await db.commit()
        except SQLAlchemyError as ex:
            logger.exception("Update on DB failed!", exc_info=ex)
            raise ex

    async def delete(self, db_session: AsyncSession):
        try:
            await db_session.delete(self)
            await db_session.commit()
            return True
        except SQLAlchemyError as ex:
            logger.exception("Update on DB failed!", exc_info=ex)
            raise ex


engine = create_async_engine(
    settings.asyncpg_url.unicode_string(), future=True, echo=True
)

async_session_maker = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
    autocommit=False,
)


async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session


SessionDep = Annotated[AsyncSession, Depends(get_async_session)]
