import cv2
import numpy as np
import kociemba

FACE_ORDER = ["U", "R", "F", "D", "L", "B"]

def rgb_to_lab(rgb):
    r, g, b = rgb
    pixel = np.uint8([[[b, g, r]]])
    lab = cv2.cvtColor(pixel, cv2.COLOR_BGR2LAB)
    return lab[0][0].astype(float)

def identify_sticker_colors(colors):
    center_colors = {}

    for face in FACE_ORDER:

        if face not in colors or len(colors[face]) != 9:
            raise ValueError(
                f"Face {face} must contain exactly 9 colors"
            )

        center_colors[face] = rgb_to_lab(colors[face][4])

        print(
            f"Face {face} center RGB: {colors[face][4]} "
            f"LAB: {center_colors[face]}"
        )

    for i, face1 in enumerate(FACE_ORDER):

        for face2 in FACE_ORDER[i + 1:]:

            distance = np.linalg.norm(
                center_colors[face1] - center_colors[face2]
            )

            print(
                f"Distance between {face1} and {face2}: "
                f"{distance:.2f}"
            )

            if distance < 15:
                raise ValueError(
                    f"Center colors of {face1} and {face2} are too similar"
                )

    cube_faces = {}

    for face in FACE_ORDER:
        identified_colors = []
        for index, rgb in enumerate(colors[face]):
            sticker_lab = rgb_to_lab(rgb)

            closest_face = min(
                FACE_ORDER,
                key=lambda f: np.linalg.norm(
                    sticker_lab - center_colors[f]
                )
            )

            identified_colors.append(closest_face)

            print(
                f"Face {face}, sticker {index + 1}: "
                f"RGB={rgb} - {closest_face}"
            )

        cube_faces[face] = identified_colors
        print(f"Identified face {face}: {identified_colors}")
    return cube_faces

def solve_cube_state(colors):
    cube_faces = identify_sticker_colors(colors)
    cube_string = ""

    for face in FACE_ORDER:
        cube_string += "".join(cube_faces[face])
        
    print("Face order:", FACE_ORDER)
    print("Generated cube string:", cube_string)
    print("Cube string length:", len(cube_string))

    for face in FACE_ORDER:
        print(
            f"{face}: {''.join(cube_faces[face])}"
        )

    if len(cube_string) != 54:
        raise ValueError(
            f"Cube string must contain 54 characters. "
            f"Current length: {len(cube_string)}"
        )

    for face in FACE_ORDER:
        count = cube_string.count(face)

        print(f"{face}: {count} stickers")

        if count != 9:
            raise ValueError(
                f"Invalid cube: {face} appears {count} times instead of 9"
            )

    try:
        solution = kociemba.solve(cube_string)

        print("Solution:", solution)
        print("Number of moves:", len(solution.split()))
        return solution.split()

    except Exception as error:
        print("Error type:", type(error).__name__)
        print("Error message:", str(error))
        print("Cube string:", cube_string)
        raise ValueError(
            f"Kociemba could not solve the cube: {error}"
        )
