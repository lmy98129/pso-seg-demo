import { randomNum, labelSegment } from './basic-utils';

// 分割结果标签数组，用于标注最终得到的特定窗口大小下的前景或背景
let resultLabels;
// 灰度图数组，由于ImageData类型的线性数据结构较难操作，故转换之；
let gGreyImage;
// 全局积分图，便于快速计算邻域内灰度值和以及平方之和
let gIntegralImage, gIntegralSqImage;
// 当前图片的宽度和高度
let gWidth, gHeight;

// 粒子数组
let particles;
// 全局最优邻域大小
let gBestWindowSize;
// 全局最优信息熵
let gBestEntropy;

// 初始化函数: initialize
const initialize = (particleNum, greyImage, maxWindowSize, minVector, maxVector) => {
  particles = new Array(particleNum);
  // 初始化各粒子速度和初值
  for (let i = 0; i < particleNum; i++) {
    // 各粒子数据结构
    particles[i] = {
      // 当前阈值数组
      windowSize: randomNum(0, maxWindowSize),
      // 当前速度
      vects: randomNum(minVector, maxVector),
      // 局部最优阈值
      pBestWindowSize: 0,
      // 局部最优信息熵
      pBestEntropy: 0,
    };
  }

  gWidth = greyImage.width;
  gHeight = greyImage.height;

  // 初始化分割结果标签数组和积分图
  resultLabels = new Array(gWidth);
  gIntegralImage = new Array(gWidth);
  gIntegralSqImage = new Array(gWidth);
  gGreyImage = new Array(gWidth);
  for (let i = 0; i < gWidth; i++) {
    resultLabels[i] = new Array(gHeight);
    gIntegralImage[i] = new Array(gHeight);
    gIntegralSqImage[i] = new Array(gHeight);
    gGreyImage[i] = new Array(gHeight);
  }

  // 将灰度图各像素灰度值放入灰度图像数组中
  let pix = greyImage.data;
  for (let i = 0; i < gWidth; i++) {
    for (let j = 0; j < gHeight; j++) {
      gGreyImage[i][j] = pix[(i * gWidth + j) * 4];
    }
  }
}

// 计算积分图函数，用于加速运算：integral
const integral = () => {
  // 临时的行积分、行平方积分，计算像素左侧一行的灰度和以及灰度积分，加速积分图计算。
  let rowSumImage = new Array(gWidth);
  let rowSumSqImage = new Array(gWidth);
  for (let i = 0; i < gWidth; i++) {
    rowSumImage[i] = new Array(gHeight);
    rowSumSqImage[i] = new Array(gHeight);
  }

  // 先计算第一列的所有元素的行积分
  for (let j = 0; j < gHeight; j++) {
    rowSumImage[0][j] = gGreyImage[0][j];
    rowSumSqImage[0][j] = Math.pow(gGreyImage[0][j], 2);
  }
  
  // 计算其他列的所有元素的行积分
  for (let i = 1; i < gWidth; i++) {
    for (let j = 0; j < gHeight; j++) {
      rowSumImage[i][j] = rowSumImage[i - 1][j] + gGreyImage[i][j];
      rowSumSqImage[i][j] = rowSumSqImage[i - 1][j] + Math.pow(gGreyImage[i][j], 2);
    }
  }

  // 计算第一行所有元素的积分，
  // 可以理解为：第一行所有元素的积分正好是第一行所有元素的行积分
  for (let i = 0; i < gWidth; i++) {
    gIntegralImage[i][0] = rowSumImage[i][0];
    gIntegralSqImage[i][0] = rowSumSqImage[i][0];
  }
  // 剩下的就是递归累加，即可得到积分图
  for (let i = 0; i < gWidth; i++) {
    for (let j = 1; j < gHeight; j++) {
      gIntegralImage[i][j] = gIntegralImage[i][j - 1] + rowSumImage[i][j];
      gIntegralSqImage[i][j] = gIntegralSqImage[i][j - 1] + rowSumSqImage[i][j];
    }
  }
}

// sauvola执行函数: sauvolaExecutor
const sauvolaExecutor = (windowSize, isGetResult = false) => {
  // 修正系数
  let k = 0.3;
  // 中心点到邻域边界的距离
  let wHalf = Math.round(windowSize / 2);

  // 统计前景和背景中各灰度的占比
  let foreground = new Array(256);
  let background = new Array(256);

  for (let i = 0; i < 256; i++) foreground[i] = background[i] = 0;

  for (let i = 0; i < gWidth; i++) {
    for (let j = 0; j < gHeight; j++) {
      // 考虑到边界点的领域坐标选取（左上角点和右下角点）
      let xMin = Math.max(0, i - wHalf);
      let yMin = Math.max(0, j - wHalf);
      let xMax = Math.min(gWidth - 1, i + wHalf);
      let yMax = Math.min(gHeight - 1, j + wHalf);
      // 当前像素邻域的总体大小
      let area = (xMax - xMin + 1) * (yMax - yMin + 1);
      // 当前点邻域范围内的灰度总和、灰度平方总和
      let diff, sqDiff;

      if (xMin == 0 && yMin == 0) {
        // 邻域覆盖到了原点
        diff = gIntegralImage[xMax][yMax];
        sqDiff = gIntegralSqImage[xMax][yMax];
      } else if (xMin == 0 && yMin > 0) {
        // 邻域覆盖到了第一列
        diff = gIntegralImage[xMax][yMax] - gIntegralImage[xMax][yMin - 1];
        sqDiff = gIntegralSqImage[xMax][yMax] - gIntegralSqImage[xMax][yMin - 1];
      } else if (xMin > 0 && yMin == 0) {
        // 邻域覆盖到了第一行
        diff = gIntegralImage[xMax][yMax] - gIntegralImage[xMin - 1][yMax];
        sqDiff = gIntegralSqImage[xMax][yMax] - gIntegralSqImage[xMin - 1][yMax]
      } else {
        // 其他情况
        let diagSum = gIntegralImage[xMax][yMax] + gIntegralImage[xMin - 1][yMin - 1];
        let idiagSum = gIntegralImage[xMax][yMin - 1] + gIntegralImage[xMin - 1][yMax];
        diff = diagSum - idiagSum;

        let sqDiagSum = gIntegralSqImage[xMax][yMax] + gIntegralSqImage[xMin - 1][yMin - 1];
        let sqIdiagSum = gIntegralSqImage[xMax][yMin - 1] + gIntegralSqImage[xMin - 1][yMax];
        sqDiff = sqDiagSum - sqIdiagSum;
      }

      // 邻域均值
      let mean = diff / area;
      // 邻域标准方差
      let std = Math.sqrt((sqDiff - (Math.pow(diff, 2) / area)) / (area - 1));
      // 阈值
      let threshold = mean * (1 + k * ((std / 128) - 1));

      if (gGreyImage[i][j] < threshold) {
        // 小于阈值设为背景
        if (isGetResult) resultLabels[i][j] = 0;
        background[gGreyImage[i][j]]++;
      } else {
        // 大于阈值设为前景
        if (isGetResult) resultLabels[i][j] = 1;
        foreground[gGreyImage[i][j]]++;
      }
    }
  }

  // 计算图像信息熵，事实上是计算前景和背景中各个灰度像素的信息熵
  // 计算前景和背景的像素总和
  let foregroundSum = foreground.reduce((total, value) => total + value);
  let backgroundSum = foreground.reduce((total, value) => total + value);

  let foregroundEntropy = 0;
  let backgroundEntropy = 0;
  for (let i = 0; i < 256; i++) {
    if (foregroundSum > 0 && foreground[i] > 0) foregroundEntropy += - (foreground[i] / foregroundSum) * (Math.log(foreground[i] / foregroundSum) / Math.log(2.0));
    if (backgroundSum > 0 && background[i] > 0) backgroundEntropy += - (background[i] / backgroundSum) * (Math.log(background[i] / backgroundSum) / Math.log(2.0));
  }

  return foregroundEntropy + backgroundEntropy;
}

// pso执行函数: psoExecutor
const psoExecutor = (maxWindowSize, omegaRate, c1Rate, c2Rate, minVector, maxVector) => {
  // 计算各粒子当前的sauvola算法的前景和背景的最大信息熵
  for (let i = 0; i < particles.length; i++) {
    let currentEntropy = sauvolaExecutor(particles[i].windowSize);
    // 更新局部最优
    if (currentEntropy > particles[i].pBestEntropy) {
      particles[i].pBestEntropy = currentEntropy;
      particles[i].pBestWindowSize = particles[i].windowSize;
    }
    // 更新全局最优
    if (currentEntropy > gBestEntropy) {
      gBestEntropy = currentEntropy;
      gBestWindowSize = particles[i].windowSize;
    }
  }

  // 更新各粒子的速度
  for (let i = 0; i < particles.length; i++) {
    let vect = omegaRate * particles[i].vects
      + c1Rate * randomNum(0, 1) * (particles[i].pBestWindowSize - particles[i].windowSize)
      + c2Rate * randomNum(0, 1) * (gBestWindowSize - particles[i].windowSize);

    if (vect < minVector) vect = minVector;
    else if (vect > maxVector) vect = maxVector;

    particles[i].vects = vect;
    let windowSize = particles[i].windowSize + vect

    if (windowSize < 0) windowSize = 0;
    else if (windowSize > maxWindowSize) windowSize = maxWindowSize;

    particles[i].windowSize = windowSize;
  }

}

// pso-sauvola算法主函数
const psoSauvolaSegment = (greyImage, maxWindowSize, particleNum, omegaRate, c1Rate, c2Rate, minVector, maxVector, maxIteration) => {
  // 全局最优阈值
  gBestWindowSize = 0;
  // 全局最优信息熵
  gBestEntropy = 0;

  // 初始化粒子列表和画布
  initialize(particleNum, greyImage, maxWindowSize, minVector, maxVector);

  // 计算积分图
  integral();

  // 开始执行psoExecutor函数
  for (let iter = 0; iter < maxIteration; iter++) {
    psoExecutor(maxWindowSize, omegaRate, c1Rate, c2Rate, minVector, maxVector);
  }

  // 重新使用最佳窗口大小计算，并生成前景背景标签数组
  sauvolaExecutor(gBestWindowSize, true);

  // 输出分割图像结果，其他阈值小数点后两位四舍五入
  return {
    dstImage: labelSegment(greyImage, resultLabels),
    gBestWindowSize: Math.round(gBestWindowSize),
    gBestEntropy: Math.round(gBestEntropy * 100) / 100,
  };
}

export {
  psoSauvolaSegment
}