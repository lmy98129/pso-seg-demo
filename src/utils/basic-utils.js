let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");

const randomNum = function (minNum, maxNum) {
  let res;
  switch (arguments.length) {
    case 1:
      return Math.random() * minNum + 1;
    case 2:
      res = Math.random() * (maxNum - minNum + 1) + minNum
      return res >= maxNum ? maxNum : res;
    default:
      return 0;
  }
}

const getImageInfo = (imageSrc) => new Promise((resolve) => {
  let imageObj = new Image();
  imageObj.onload = () => {
    let { width, height } = imageObj;
    resolve({ width, height, imageObj });
  }
  imageObj.src = imageSrc;
})

const grey = async (imageSrc) => {
  let { width, height, imageObj } = await getImageInfo(imageSrc);
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(imageObj, 0, 0);
  let greyImage = ctx.getImageData(0, 0, width, height);

  let pix = greyImage.data;
  for (let i = 0; i < pix.length; i += 4) {
    let grayscale = pix[i] * .3 + pix[i + 1] * .59 + pix[i + 2] * .11;
    pix[i] = pix[i + 1] = pix[i + 2] = grayscale;
  }

  return greyImage;
}

const histogram = (greyImage) => {
  let pix = greyImage.data;
  let result = new Array(256);

  for (let i = 0; i < result.length; i++) result[i] = 0;

  for (let i = 0; i < pix.length; i += 4) {
    let grayscale = pix[i];
    result[grayscale] += 1
  }

  return result;
}

const thresholdSegment = (greyImage, thresholds) => {
  let pix = greyImage.data;
  for (let i = 0; i < pix.length; i += 4) {
    let isSetColor = false
    for (let j = 0; j < thresholds.length; j++) {
      if (pix[i] < thresholds[j]) {
        pix[i] = pix[i + 1] = pix[i + 2] = 256 / (j + 1) - 1;
        isSetColor = true;
        break;
      }
    }
    if (!isSetColor) pix[i] = pix[i + 1] = pix[i + 2] = 0;
  }
  ctx.putImageData(greyImage, 0, 0);
  return canvas.toDataURL("image/png");
}

const labelSegment = (greyImage, resultLabels) => {
  let pix = greyImage.data;
  let { width, height } = greyImage
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      let currentIdx = (i * width + j) * 4;
      if (resultLabels[i][j] == 1) pix[currentIdx] = pix[currentIdx + 1] = pix[currentIdx + 2] = 0;
      else pix[currentIdx] = pix[currentIdx + 1] = pix[currentIdx + 2] = 255;
    }
  }
  ctx.putImageData(greyImage, 0, 0);
  return canvas.toDataURL("image/png");
}

export {
  grey,
  histogram,
  randomNum,
  thresholdSegment,
  getImageInfo,
  labelSegment,
}