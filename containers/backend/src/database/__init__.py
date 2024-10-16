from typing import AsyncGenerator, Any, Annotated, AsyncIterator
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


class Base(DeclarativeBase):
    id: Any
    __name__: str

    async def save(self, db_session: AsyncSession):
        try:
            db_session.add(self)
            return await db_session.commit()
        except IntegrityError as e:
            # if isinstance(e.orig.exc_type, UniqueViolationError):
            exc = e.orig
            logger.debug(f"Duplicate record: {exc}")
            await db_session.rollback()
        except UniqueViolationError:
            await db_session.rollback()
        except SQLAlchemyError as ex:
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

    # try:
    #     session = async_session_maker().session()
    #     if session is None:
    #         raise Exception('DBSessionManager not initalized')

    #     yield session
    # except SQLAlchemyError as e:
    #     logger.exception(e)
    #     await session.rollback()
    # finally:
    #     session.close()


SessionDep = Annotated[AsyncSession, Depends(get_async_session)]
