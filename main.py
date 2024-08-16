from typing import Union

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import numpy as np

app = FastAPI()

app.mount("/static", StaticFiles(directory="static", html=True), name="static")


@app.get("/")
def read_root1(req: Request):
    return FileResponse("Cathode.html")


@app.get("/dashboard")
def read_root2(req: Request):
    return FileResponse("dashboard.html")


@app.get("/weeks")
def read_root3(req: Request):
    return FileResponse("weeks.html")


@app.get("/search")
def read_root4(req: Request):
    return FileResponse("search.html")
