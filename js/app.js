const FACE_SIZE = 300;
const FACES = [
    { id: "U", name: "Up", color: "#e5e7eb" },
    { id: "R", name: "Right", color: "#dc2626" },
    { id: "F", name: "Front", color: "#16a34a" },
    { id: "D", name: "Down", color: "#facc15" },
    { id: "L", name: "Left", color: "#f97316" },
    { id: "B", name: "Back", color: "#2563eb" },
];

const faceData = {};

FACES.forEach(
    function (face) {
        faceData[face.id] = { photo: null, corners: [], straightenedUrl: null };
    });

let activeFaceId = "U";
let draggedCornerIndex = -1;

const facesNav = document.getElementById("faces");
const chooseButton = document.getElementById("pick");
const resetButton = document.getElementById("reset");
const fileInput = document.getElementById("file");
const emptyText = document.getElementById("empty");
const sendButton = document.getElementById("send");
const statusText = document.getElementById("status");
const hintText = document.getElementById("hint");

const stage = document.getElementById("stage");

const editorCanvas = document.getElementById("editor");
const editorCtx = editorCanvas.getContext("2d");

const resultCanvas = document.getElementById("out");
const resultCtx = resultCanvas.getContext("2d");


function drawFaceList() {
    facesNav.innerHTML = "";

    FACES.forEach(function (face) {
        const data = faceData[face.id];

        let statusLabel = "No photo";
        let thumbnail = "none";

        if (data.straightenedUrl) {
            statusLabel = "Done";
            thumbnail = "url(" + data.straightenedUrl + ")";
        } else if (data.photo) {
            statusLabel = data.corners.length + " of 4 corners";
        }

        const button = document.createElement("button");
        button.className = "face-btn";
        if (face.id === activeFaceId) {
            button.classList.add("is-active");
        }

        button.innerHTML =
            '<span class="h-9 w-9 shrink-0 rounded-md border-2 bg-cover bg-center" ' +
            'style="border-color:' + face.color + '; background-image:' + thumbnail + '"></span>' +
            "<span>" +
            '<span class="block font-poppins">' + face.name + "</span>" +
            '<span class="block text-xs font-poppins text-stone-500">' + statusLabel + "</span>" +
            "</span>";

        button.addEventListener("click", function () {
            selectFace(face.id);
        });

        facesNav.appendChild(button);
    });

    const allDone = FACES.every(
        function (face) {
            return faceData[face.id].straightenedUrl !== null;
        });

    sendButton.disabled = !allDone;
}

function selectFace(faceId) {
    activeFaceId = faceId;

    if (faceData[activeFaceId].photo) {
        sizeEditorToPhoto();
        editorCanvas.classList.remove("hidden");
        emptyText.classList.add("hidden");
        drawEditor();
    } else {
        editorCanvas.classList.add("hidden");
        emptyText.classList.remove("hidden");
    }

    updateResult(false);
    updateHint();
    drawFaceList();
}

chooseButton.addEventListener("click", function () {
        fileInput.click();
    });

fileInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const photo = new Image();
    photo.onload = function () {
        const face = faceData[activeFaceId];
        face.photo = photo;
        face.corners = [];
        face.straightenedUrl = null;
        fileInput.value = "";
        selectFace(activeFaceId);
    };
    photo.src = URL.createObjectURL(file);
});

resetButton.addEventListener("click", function () {
    const face = faceData[activeFaceId];
    face.corners = [];
    face.straightenedUrl = null;
    selectFace(activeFaceId);
});

function sizeEditorToPhoto() {
    const photo = faceData[activeFaceId].photo;
    const width = Math.min(stage.clientWidth - 2, photo.naturalWidth, 720);
    editorCanvas.width = width;
    editorCanvas.height = Math.round(width * photo.naturalHeight / photo.naturalWidth);
}

function editorScale() {
    return editorCanvas.width / faceData[activeFaceId].photo.naturalWidth;
}

function drawEditor() {
    const face = faceData[activeFaceId];
    if (!face.photo) return;

    const scale = editorScale();
    editorCtx.drawImage(
        face.photo,
        0,
        0,
        editorCanvas.width,
        editorCanvas.height
    );

    drawCornerLines(face, scale);
    drawCornerMarkers(face, scale);
}

function drawCornerLines(face, scale) {
    if (face.corners.length <= 1) return;

    editorCtx.beginPath();

    face.corners.forEach(function (corner, i) {
        const x = corner.x * scale;
        const y = corner.y * scale;

        if (i === 0) {
            editorCtx.moveTo(x, y);
        } else {
            editorCtx.lineTo(x, y);
        }
    });

    if (face.corners.length === 4) {
        editorCtx.closePath();
    }

    editorCtx.strokeStyle = "#10b981";
    editorCtx.lineWidth = 2;
    editorCtx.stroke();
}

function drawCornerMarkers(face, scale) {
    face.corners.forEach(function (corner, i) {
        const x = corner.x * scale;
        const y = corner.y * scale;

        editorCtx.beginPath();
        editorCtx.arc(x, y, 9, 0, Math.PI * 2);

        editorCtx.fillStyle = "#ffffff";
        editorCtx.fill();

        editorCtx.strokeStyle = "#10b981";
        editorCtx.lineWidth = 3;
        editorCtx.stroke();

        editorCtx.fillStyle = "#065f46";
        editorCtx.font = "bold 11px sans-serif";
        editorCtx.textAlign = "center";
        editorCtx.textBaseline = "middle";
        editorCtx.fillText(i + 1, x, y + 0.5);
    });
}

function updateHint() {
    const face = faceData[activeFaceId];
    if (!face.photo) {
        hintText.textContent = "Choose a photo of this face to get started.";
    } else if (face.corners.length < 4) {
        hintText.textContent = "Click on corner " + (face.corners.length + 1) + " of 4.";
    } else {
        hintText.textContent = "You can drag the points to adjust them.";
    }
}

function refreshAfterCornerChange(saveResult) {
    drawEditor();
    updateHint();
    updateResult(saveResult);
    if (saveResult) drawFaceList();
}

function mousePositionInPhoto(event) {
    const box = editorCanvas.getBoundingClientRect();
    const canvasX = (event.clientX - box.left) * editorCanvas.width / box.width;
    const canvasY = (event.clientY - box.top) * editorCanvas.height / box.height;
    return { x: canvasX / editorScale(), y: canvasY / editorScale() };
}

editorCanvas.addEventListener("pointerdown", function (event) {
    const face = faceData[activeFaceId];
    const mouse = mousePositionInPhoto(event);
    const grabDistance = 16 / editorScale(); 

    draggedCornerIndex = -1;
    face.corners.forEach(function (corner, i) {
        const distance = Math.hypot(corner.x - mouse.x, corner.y - mouse.y);
        if (distance < grabDistance) draggedCornerIndex = i;
    });

    if (draggedCornerIndex === -1 && face.corners.length < 4) {
        face.corners.push(mouse);
        draggedCornerIndex = face.corners.length - 1;
    }

    if (draggedCornerIndex !== -1) {
        editorCanvas.setPointerCapture(event.pointerId);
        refreshAfterCornerChange(false);
    }
});

editorCanvas.addEventListener("pointermove", function (event) {
    if (draggedCornerIndex === -1) return;

    const photo = faceData[activeFaceId].photo;
    const mouse = mousePositionInPhoto(event);

    mouse.x = Math.max(0, Math.min(photo.naturalWidth, mouse.x));
    mouse.y = Math.max(0, Math.min(photo.naturalHeight, mouse.y));

    faceData[activeFaceId].corners[draggedCornerIndex] = mouse;
    refreshAfterCornerChange(false);
});

editorCanvas.addEventListener("pointerup", function () {
    if (draggedCornerIndex === -1) return;
    draggedCornerIndex = -1;
    refreshAfterCornerChange(true);
});

window.addEventListener("resize", function () {
    if (faceData[activeFaceId].photo) {
        sizeEditorToPhoto();
        drawEditor();
    }
});

function updateResult(saveResult) {
    const face = faceData[activeFaceId];
    resultCtx.clearRect(0, 0, FACE_SIZE, FACE_SIZE);
    if (face.corners.length < 4) return;

    const straightened = straightenPhoto(face.photo, face.corners, FACE_SIZE);
    resultCtx.drawImage(straightened, 0, 0);
    drawGridLines();

    if (saveResult) {
        face.straightenedUrl = straightened.toDataURL("image/png");
    }
}

function drawGridLines() {
    resultCtx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    resultCtx.lineWidth = 2;
    for (let i = 1; i < 3; i++) {
        const position = (i * FACE_SIZE) / 3;
        resultCtx.beginPath();
        resultCtx.moveTo(position, 0);
        resultCtx.lineTo(position, FACE_SIZE);
        resultCtx.moveTo(0, position);
        resultCtx.lineTo(FACE_SIZE, position);
        resultCtx.stroke();
    }
}

selectFace("U");