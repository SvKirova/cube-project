import cv2
import numpy as np


def extract_sticker_colors(face_bgr, center_ratio=0.4):
    """Return 9 [R, G, B] values (left to right, top to bottom) from a corrected face image."""
    h, w = face_bgr.shape[:2]
    cell_h, cell_w = h // 3, w // 3
    margin_y = int(cell_h * (1 - center_ratio) / 2)
    margin_x = int(cell_w * (1 - center_ratio) / 2)

    colors = []
    for row in range(3):
        for col in range(3):
            y0 = row * cell_h + margin_y
            y1 = (row + 1) * cell_h - margin_y
            x0 = col * cell_w + margin_x
            x1 = (col + 1) * cell_w - margin_x
            patch = face_bgr[y0:y1, x0:x1]
            b, g, r = np.median(patch.reshape(-1, 3), axis=0)  # median resists glare
            colors.append([int(r), int(g), int(b)])
    return colors