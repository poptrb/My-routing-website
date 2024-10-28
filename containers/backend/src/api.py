import asyncio
import json
import os
import time
import logging
from datetime import datetime, timedelta

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from tasks.geo_rss import refresh_reports
from database import create_db_and_tables, SessionDep
from database.operations import get_reports, get_reports_two
from database.schemas import ReportBase
from database.schema import GetReportsRequest
from auth.users import auth_backend, current_active_user, fastapi_users


logging.basicConfig(
    format="%(levelname)s %(asctime)s %(module)s %(message)s",
    datefmt="%Y/%m/%d %H:%M:%S",
    level=logging.DEBUG,
)


def run_scheduler():
    logging.getLogger("apscheduler").setLevel(logging.DEBUG)
    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        refresh_reports,
        "interval",
        seconds=60 * 60,
        # next_run_time=(datetime.now())
    )

    scheduler.start()


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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


@app.get("/", response_model=list[ReportBase])
async def get_top_reports(db_session: SessionDep):
    result = await get_reports(db_session)
    return result


@app.post("/reports", response_model=list[ReportBase])
async def get_reports_by_bbox(
    request: GetReportsRequest, db_session: SessionDep
):
    result = await get_reports_two(db_session, request)
    return result


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("API_PORT", 80)))
