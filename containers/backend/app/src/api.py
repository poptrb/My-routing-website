from fastapi import FastAPI
import json
import os

app = FastAPI()


@app.get("/")
def read_json_file():
    with open("alerts.json", "r") as file:
        data = json.load(file)
    return data


# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=int(os.getenv('PORT', 8001)))
