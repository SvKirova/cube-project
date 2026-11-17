function orderCorners(corners) {
  let centerX = 0;
  let centerY = 0;
  corners.forEach(function (corner) {
    centerX += corner.x / 4;
    centerY += corner.y / 4;
  });

  const clockwise = corners.slice().sort(function (a, b) {
    const angleA = Math.atan2(a.y - centerY, a.x - centerX);
    const angleB = Math.atan2(b.y - centerY, b.x - centerX);
    return angleA - angleB;
  });

  let startIndex = 0;
  clockwise.forEach(function (corner, i) {
    if (corner.x + corner.y < clockwise[startIndex].x + clockwise[startIndex].y) {
      startIndex = i;
    }
  });
  return clockwise.slice(startIndex).concat(clockwise.slice(0, startIndex));
}

function findTransform(photoCorners, size) {
  const squareCorners = [
    { x: 0, y: 0 },
    { x: size, y: 0 },
    { x: size, y: size },
    { x: 0, y: size },
  ];

  const rows = [];
  for (let i = 0; i < 4; i++) {
    const x = squareCorners[i].x;
    const y = squareCorners[i].y;
    const u = photoCorners[i].x;
    const v = photoCorners[i].y;
    rows.push([x, y, 1, 0, 0, 0, -u * x, -u * y, u]);
    rows.push([0, 0, 0, x, y, 1, -v * x, -v * y, v]);
  }

  for (let col = 0; col < 8; col++) {
    let best = col;
    for (let r = col + 1; r < 8; r++) {
      if (Math.abs(rows[r][col]) > Math.abs(rows[best][col])) best = r;
    }
    const temp = rows[col];
    rows[col] = rows[best];
    rows[best] = temp;

    for (let r = 0; r < 8; r++) {
      if (r === col) continue;
      const factor = rows[r][col] / rows[col][col];
      for (let c = col; c < 9; c++) {
        rows[r][c] -= factor * rows[col][c];
      }
    }
  }

  const h = [];
  for (let i = 0; i < 8; i++) h.push(rows[i][8] / rows[i][i]);
  return h;
}

let rememberedPhoto = null;
let rememberedPixels = null;

function getPhotoPixels(photo) {
  if (rememberedPhoto !== photo) {
    const canvas = document.createElement("canvas");
    canvas.width = photo.naturalWidth;
    canvas.height = photo.naturalHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(photo, 0, 0);
    rememberedPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    rememberedPhoto = photo;
  }
  return rememberedPixels;
}

function straightenPhoto(photo, corners, size) {
  const photoPixels = getPhotoPixels(photo);
  const photoWidth = photoPixels.width;
  const photoHeight = photoPixels.height;
  const photoData = photoPixels.data;

  const h = findTransform(orderCorners(corners), size);

  const result = document.createElement("canvas");
  result.width = size;
  result.height = size;
  const resultCtx = result.getContext("2d");
  const resultPixels = resultCtx.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const divisor = h[6] * x + h[7] * y + 1;
      const photoX = (h[0] * x + h[1] * y + h[2]) / divisor;
      const photoY = (h[3] * x + h[4] * y + h[5]) / divisor;

      const outIndex = (y * size + x) * 4;
      resultPixels.data[outIndex + 3] = 255;

      const left = Math.floor(photoX);
      const top = Math.floor(photoY);
      const outsidePhoto = left < 0 || top < 0 || left >= photoWidth - 1 || top >= photoHeight - 1;
      if (outsidePhoto) continue;

      const fx = photoX - left;
      const fy = photoY - top;
      const topLeft = (top * photoWidth + left) * 4;
      const topRight = topLeft + 4;
      const bottomLeft = topLeft + photoWidth * 4;
      const bottomRight = bottomLeft + 4;

      for (let channel = 0; channel < 3; channel++) {
        resultPixels.data[outIndex + channel] =
          photoData[topLeft + channel] * (1 - fx) * (1 - fy) +
          photoData[topRight + channel] * fx * (1 - fy) +
          photoData[bottomLeft + channel] * (1 - fx) * fy +
          photoData[bottomRight + channel] * fx * fy;
      }
    }
  }

  resultCtx.putImageData(resultPixels, 0, 0);
  return result;
}