import asyncio
import json
import os
import time
import logging
from datetime import datetime

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from tasks.geo_rss import refresh_reports
from database import create_db_and_tables


logging.basicConfig(
    format='%(levelname)s %(asctime)s %(module)s %(message)s',
    datefmt='%Y/%m/%d %H:%M:%S',
    level=logging.DEBUG
)

def run_scheduler():
    logging.getLogger("apscheduler").setLevel(logging.DEBUG)
    scheduler = AsyncIOScheduler()
    scheduler.add_job(refresh_reports, "interval", seconds=900,next_run_time=datetime.now())

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


@app.get("/")
def read_json_file():
    with open("alerts.json", "r") as file:
        data = json.load(file)
    return data


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("API_PORT", 80)))
