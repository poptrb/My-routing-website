FROM python:3.12.7-slim-bookworm


COPY requirements.txt ./requirements.txt
RUN pip install -r requirements.txt

WORKDIR /app
COPY ./src ./

CMD ["uvicorn", "api:app", "--reload", "--host", "0.0.0.0", "--port", "80"]
