import uuid
from datetime import datetime
from typing import Optional
from logging import getLogger

from fastapi import Depends, Request, HTTPException
from fastapi_users import (
    BaseUserManager,
    FastAPIUsers,
    UUIDIDMixin,
    models,
)

from fastapi_users.authentication import (
    AuthenticationBackend,
    CookieTransport,
    BearerTransport,
    JWTStrategy,
)
from fastapi_users.db import SQLAlchemyUserDatabase
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_async_session, async_session_maker
from database.models import User
from database.schemas import UserRead, UserCreate
from database.operations import get_token, invalidate_token, on_user_creation
from settings import settings

logger = getLogger()


class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = settings.reset_pwd_token
    verification_token_secret = settings.verification_token

    async def create(
        self,
        user_create: UserCreate,
        safe: bool = False,
        request: Optional[Request] = None,
    ) -> User:

        async with async_session_maker() as db_session:
            token = await get_token(db_session, user_create.token_cleartext)

            if not token:
                raise HTTPException(401, detail="Invalid token!")

            user_create.token_id = token.id
            user_create.is_active = True
            user_create.is_verified = True
            user_create.is_superuser = 1 if token.id in (1, "1") else 0
            user_create.signup_date = datetime.now()

            del user_create.token_cleartext

        created_user = await super().create(
            user_create, safe=False, request=request
        )
        return created_user

    async def on_after_register(
        self, user: User, request: Optional[Request] = None
    ):

        async with async_session_maker() as db_session:
            await invalidate_token(db_session, User.token_id)

        logger.info(f"User {user.id} has registered.")

    async def on_after_forgot_password(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        print(
            f"User {user.id} has forgot their password. Reset token: {token}"
        )

    async def on_after_request_verify(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        print(
            f"Verification requested for user {user.id}. Verification token: {token}"
        )


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)


async def get_user_manager(
    user_db: SQLAlchemyUserDatabase = Depends(get_user_db),
):
    yield UserManager(user_db)


bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")
cookie_transport = CookieTransport(
    cookie_max_age=settings.jwt_expire,
    cookie_secure=True,
    cookie_httponly=True,
    cookie_samesite="none",
)


def get_jwt_strategy() -> JWTStrategy[models.UP, models.ID]:
    return JWTStrategy(
        secret=settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
        lifetime_seconds=settings.jwt_expire,
    )


auth_backend = AuthenticationBackend(
    name="jwt",
    transport=cookie_transport,
    get_strategy=get_jwt_strategy,
)

fastapi_users = FastAPIUsers[User, uuid.UUID](get_user_manager, [auth_backend])

current_active_user = fastapi_users.current_user(active=True)
current_superuser = fastapi_users.current_user(active=True, superuser=True)
