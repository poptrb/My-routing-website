import os

from pydantic import PostgresDsn
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    asyncpg_url: PostgresDsn = (
        "postgresql+asyncpg://"
        + f"{os.getenv("POSTGIS_USER")}:{os.getenv("POSTGIS_PASSWORD")}@"
        + f"{os.getenv("POSTGIS_HOST")}:{os.getenv("POSTGIS_PORT")}/"
        + f"{os.getenv("POSTGIS_DB")}"
    )
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM")
    jwt_expire: int = os.getenv("JWT_EXPIRE")
    jwt_secret: str = os.getenv("JWT_SECRET")
    reset_pwd_token: str = os.getenv("RESET_PASSWORD_TOKEN")
    verification_token: str = os.getenv("VERIFICATION_TOKEN")


settings = Settings()
