FROM arm64v8/python:3.12.7-slim-bullseye

WORKDIR /app

COPY requirements.txt ./requirements.txt
RUN pip install -r requirements.txt

# COPY ./src ./

CMD ["python", "api.py"]
