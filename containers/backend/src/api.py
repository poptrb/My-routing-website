import os
import logging
import json
from datetime import datetime, timedelta

from aiohttp import ClientSession
from aiohttp import ClientResponseError
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI, Depends, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware


from tasks.geo_rss import refresh_reports
from database import create_db_and_tables, SessionDep
from database.spatial import create_absolute_bbox
from database.operations import (
    get_reports,
    get_reports_by_bbox,
    insert_token,
    get_token,
)
from database.schemas import (
    ReportBbox,
    SignupTokenModel,
    SignupTokenModelRead,
    ReportBase,
    UserRead,
    UserCreate,
    UserUpdate,
    GetReportsRequest,
    GetAbsoluteBboxReportsRequest,
)

from database.models import User
from auth.users import auth_backend, current_active_user, fastapi_users

logging.basicConfig(
    format="%(levelname)s %(asctime)s %(module)s %(message)s",
    datefmt="%Y/%m/%d %H:%M:%S",
    level=logging.DEBUG,
)

logger = logging.getLogger()


brasov_report_bbox = ReportBbox(
    top=45.763,
    bottom=45.561,
    left=25.363,
    right=25.839,
    env="row",
    types="alerts",
)

bucuresti_report_bbox = ReportBbox(
    top=44.539,
    bottom=44.311,
    left=25.847,
    right=26.302,
    env="row",
    types="alerts",
)


def run_scheduler():
    logging.getLogger("apscheduler").setLevel(logging.DEBUG)
    scheduler = AsyncIOScheduler()

    scheduler.add_job(
        refresh_reports,
        "interval",
        seconds=60 * 60,
        args=[bucuresti_report_bbox],
        next_run_time=(datetime.now() + timedelta(minutes=3)),
    )

    scheduler.add_job(
        refresh_reports,
        "interval",
        seconds=60 * 60,
        args=[brasov_report_bbox],
        next_run_time=(datetime.now() + timedelta(minutes=2)),
    )

    scheduler.start()


app = FastAPI(root_path="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://localhost", "localhost"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "HEAD", "OPTIONS", "PUT", "PATCH"],
    allow_headers=["Content-Type"],
)


@app.on_event("startup")
async def on_startup():
    logging.getLogger("database").setLevel(logging.DEBUG)
    logging.getLogger("tasks.geo_rss").setLevel(logging.DEBUG)
    await create_db_and_tables()
    run_scheduler()


app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth/jwt",
    tags=["auth"],
)

app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)

app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)

app.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/auth",
    tags=["auth"],
)

app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/auth",
    tags=["auth"],
)


@app.get("/reports_latest", response_model=list[ReportBase])
async def get_top_reports(
    db_session: SessionDep, user: User = Depends(current_active_user)
):
    result = await get_reports(db_session)
    return result


@app.post("/geo/{full_path}")
async def proxy_valhalla(
    full_path: str,
    request: Request,
    response: JSONResponse,
    user: User = Depends(current_active_user),
):
    url = f"http://valhalla:8002/{full_path}?json="
    async with ClientSession() as session:
        body = await request.json()
        async with session.post(url, json=body) as r:
            if r.status != 200:
                response.status_code = r.status

            body = await r.json()
            return body


@app.post(
    "/reports_absolute_bbox",
    response_model=list[ReportBase],
)
async def get_reports_by_absolut_bbox(
    db_session: SessionDep,
    request: GetAbsoluteBboxReportsRequest,
    user: User = Depends(current_active_user),
):

    logger.info(request.user_coords)
    bboxes = map(
        lambda x: create_absolute_bbox(x.long, x.lat, 5), request.user_coords
    )

    result = await get_reports_by_bbox(db_session, bboxes, request)
    return result


@app.post(
    "/create_token",
    response_model=SignupTokenModelRead,
)
async def create_token(
    request: SignupTokenModel,
    db_session: SessionDep,
    user: User = Depends(current_active_user),
):
    await insert_token(db_session, request)

    result = await get_token(db_session, request.token_hash)
    return result


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=int(os.getenv("API_PORT", 80)))
