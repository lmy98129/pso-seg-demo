import { thresholdSegment, randomNum, histogram } from './basic-utils';

// 粒子数组
let particles;
// 全局最优阈值
let gBestThreshold;
// 全局最优类间方差
let gBestGap;
// 全局灰度像素占比
let gPixelPercent;

// 各灰度占所有像素的比例
const pixelPercent = (greyImage) => {
  let { width, height } = greyImage
  let total = width * height;
  let greyHist = histogram(greyImage)
  gPixelPercent = greyHist.map((item, idx, arr) => {
    return arr[idx] = item / total;
  })
}

// 初始化函数: initialize
const initialize = (particleNum, thresholdNum, minVector, maxVector) => {
  particles = new Array(particleNum);
  // 初始化各粒子速度和初值
  for (let i = 0; i < particleNum; i++) {
    // 各粒子数据结构
    particles[i] = {
      // 当前阈值数组
      thresholds: new Array(thresholdNum),
      // 当前速度
      vects: new Array(thresholdNum),
      // 局部最优阈值
      pBestThresholds: new Array(thresholdNum),
      // 局部最优类间方差
      pBestGap: 0,
    };

    // 各粒子阈值初值及最优阈值初值
    particles[i].thresholds[0] = randomNum(10, 50);
    particles[i].pBestThresholds[0] = particles[i].thresholds[0]
    for (let j = 1; j < thresholdNum; j++) {
      particles[i].thresholds[j] = particles[i].thresholds[j - 1] + 50;
      if (particles[i].thresholds[j] > 255) particles[i].thresholds[j] = 255;
      particles[i].pBestThresholds[j] = particles[i].thresholds[j]
    }

    // 各粒子速度初值
    for (let j = 0; j < thresholdNum; j++) {
      particles[i].vects[j] = randomNum(minVector, maxVector);
    }
  }
}

// otsu执行函数: otsuExecutor
const otsuExecutor = (curThresholds) => {
  // 拷贝一份
  let thresholds = curThresholds.slice();
  // 升序排序
  thresholds.sort((a, b) => a - b)

  // 创建占比和标准差数组
  let wArray = new Array(thresholds.length + 1);
  let uArray = new Array(thresholds.length + 1);

  for (let i = 0; i < thresholds.length + 1; i++) wArray[i] = uArray[i] = 0;

  // 遍历所有灰度，存入对应的像素占比和总灰度值数组中
  for (let i = 0; i < gPixelPercent.length; i++) {
    let isSet = false
    for (let j = 0; j < thresholds.length; j++) {
      if (i < thresholds[j]) {
        wArray[j] += gPixelPercent[i]
        uArray[j] += i * gPixelPercent[i]
        isSet = true;
        break;
      }
    }
    // 若都没加到，默认加入到大于最大阈值的那一项里
    if (!isSet) {
      wArray[thresholds.length] += gPixelPercent[i]
      uArray[thresholds.length] += i * gPixelPercent[i]
    }
  }

  // 将总灰度值转为平均灰度值
  uArray.forEach((value, idx, arr) => {
    arr[idx] = wArray[idx] != 0 ? value / wArray[idx] : 0;
  })

  // 两两计算类间距离，得到类间总距离
  let currentGap = 0;

  for (let i = 0; i < thresholds.length; i++) {
    for (let j = i + 1; j < thresholds.length + 1; j++) {
      currentGap += wArray[i] * wArray[j] * Math.pow((uArray[i] - uArray[j]), 2);
    }
  }

  return currentGap;
}

// pso执行函数: psoExecutor
const psoExecutor = (thresholdNum, omegaRate, c1Rate, c2Rate, minVector, maxVector) => {
  // 计算各粒子当前的otsu算法类间距离
  for (let i = 0; i < particles.length; i++) {
    let currentGap = otsuExecutor(particles[i].thresholds);
    // 更新局部最优
    if (currentGap > particles[i].pBestGap) {
      particles[i].pBestGap = currentGap;
      particles[i].pBestThresholds = particles[i].thresholds.slice();
    }
    // 更新全局最优
    if (currentGap > gBestGap) {
      gBestGap = currentGap;
      gBestThreshold = particles[i].thresholds.slice();
    }
  }

  // 更新各粒子的速度
  for (let i = 0; i < particles.length; i++) {
    for (let j = 0; j < thresholdNum; j++) {
      let vect = omegaRate * particles[i].vects[j]
        + c1Rate * randomNum(0, 1) * (particles[i].pBestThresholds[j] - particles[i].thresholds[j])
        + c2Rate * randomNum(0, 1) * (gBestThreshold[j] - particles[i].thresholds[j]);

      if (vect < minVector) vect = minVector;
      else if (vect > maxVector) vect = maxVector;

      particles[i].vects[j] = vect;
      let thres = particles[i].thresholds[j] + vect

      if (thres < 0) thres = 0;
      else if (thres > 255) thres = 255;

      particles[i].thresholds[j] = thres;
    }
  }

}

// pso-otsu算法主函数
const psoOtsuSegment = (greyImage, thresholdNum, particleNum, omegaRate, c1Rate, c2Rate, minVector, maxVector, maxIteration) => {
  // 全局最优阈值
  gBestThreshold = new Array(thresholdNum);
  for (let i = 0; i < thresholdNum; i++) gBestThreshold[i] = 0;
  // 全局最优类间方差
  gBestGap = 0;

  // 初始化粒子列表
  initialize(particleNum, thresholdNum, minVector, maxVector);
  // 计算各灰度占总像素的比例
  pixelPercent(greyImage);

  // 开始执行psoExecutor函数
  for (let iter = 0; iter < maxIteration; iter++) {
    psoExecutor(thresholdNum, omegaRate, c1Rate, c2Rate, minVector, maxVector);
  }

  // 重新排序，以免混乱
  gBestThreshold.sort((a, b) => a - b)
  // 小数点后两位四舍五入
  gBestThreshold.forEach((value, idx, arr) => arr[idx] = Math.round(value * 100) / 100);

  return { 
    dstImage: thresholdSegment(greyImage, gBestThreshold), 
    gBestThreshold, 
    gBestGap: Math.round(gBestGap * 100) / 100 
  };
}

export {
  psoOtsuSegment
}