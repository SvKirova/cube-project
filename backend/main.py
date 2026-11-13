import cv2
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from color_detection import extract_sticker_colors

app = FastAPI(title="Rubik's Cube Scanner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


async def read_face(upload: UploadFile, face_id: str):
    data = await upload.read()
    image = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)
    if image is None:
        raise HTTPException(status_code=400, detail=f"Face {face_id}: not a valid image")
    return image


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/extract-colors")
async def extract_colors(
    U: UploadFile = File(...),
    R: UploadFile = File(...),
    F: UploadFile = File(...),
    D: UploadFile = File(...),
    L: UploadFile = File(...),
    B: UploadFile = File(...),
):
    faces = {"U": U, "R": R, "F": F, "D": D, "L": L, "B": B}
    result = {}
    for face_id, upload in faces.items():
        image = await read_face(upload, face_id)
        result[face_id] = extract_sticker_colors(image)
    return {"colors": result}  # raw RGB only; classification comes later