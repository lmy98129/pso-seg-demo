<template>
  <div id="single-threshold-wrap">
    <div class="controller">
      <div class="controller-line button-line">
        <div class="button plain-btn" @click="handleSelectFileClick">
          <input
            ref="upload-input"
            type="file"
            id="upload-input"
            accept="image/png, image/jpeg"
            @change="handleSelectFile($event, 'src')"
            name="upload"
          />
          <span>上传图片</span>
        </div>
        <div class="button plain-btn" @click="handelSegmentation">分割图像</div>
      </div>
      <div class="controller-line-group">
        <div class="controller-line">
          <div class="controller-line-tag">阈值个数:</div>
          <el-input-number v-model="thresholdNum" :min="1" :max="5"></el-input-number>
        </div>
        <div class="controller-line">
          <div class="controller-line-tag">PSO粒子数:</div>
          <el-input-number v-model="particleNum" :min="3" :max="20"></el-input-number>
        </div>
        <div class="controller-line">
          <div class="controller-line-tag">惯性系数ω:</div>
          <el-input-number v-model="omegaRate" :min="0" :max="1" :step="0.1"></el-input-number>
        </div>
        <div class="controller-line">
          <div class="controller-line-tag">学习因子c1:</div>
          <el-input-number v-model="c1Rate" :min="0" :max="5" :step="0.1"></el-input-number>
        </div>
        <div class="controller-line">
          <div class="controller-line-tag">学习因子c2:</div>
          <el-input-number v-model="c2Rate" :min="0" :max="5" :step="0.1"></el-input-number>
        </div>
        <div class="controller-line">
          <div class="controller-line-tag">速度下限:</div>
          <el-input-number v-model="minVector" :min="1" :max="4" :step="1"></el-input-number>
        </div>
        <div class="controller-line">
          <div class="controller-line-tag">速度上限:</div>
          <el-input-number v-model="maxVector" :min="5" :max="10" :step="1"></el-input-number>
        </div>
        <div class="controller-line">
          <div class="controller-line-tag">最大迭代次数:</div>
          <el-input-number v-model="maxIteration" :min="100" :step="100"></el-input-number>
        </div>
      </div>
    </div>
    <div class="image-preview-block">
      <div
        ref="src-img"
        class="previewer src-img-previewer"
        :style="'background-image: url('+ srcImage + ')'"
      ></div>
      <div
        ref="dst-img"
        class="previewer dst-img-previewer"
        :style="'background-image: url('+ dstImage + ')'"
      ></div>
    </div>
    <div class="result-block" v-if="gBestThreshold && gBestThreshold.length > 0">
      当前阈值为：
      <span
        v-for="(value, idx) in gBestThreshold"
        :key="idx"
      >{{value}}{{ (idx != gBestThreshold.length - 1) ? ", " : "。" }}</span>
      最大类间方差为：{{ gBestGap }}
    </div>
    <v-chart
      id="hist-chart"
      :style="{height: isChartShow ? '400px' : '0px'}"
      :options="histogramOpt"
      :autoresize="true"
    />
  </div>
</template>

<script>
import { grey, histogram } from "../utils/basic-utils";
import { psoOtsuSegment } from "../utils/pso-otsu-algorithm";

export default {
  name: "OTSU",
  data() {
    return {
      srcImage: "",
      srcFile: "",
      omegaRate: 0.8,
      c1Rate: 2.0,
      c2Rate: 2.0,
      dstImage: "",
      thresholdNum: 2,
      particleNum: 15,
      maxIteration: 100,
      minVector: 3,
      maxVector: 5,
      histogramOpt: {},
      isChartShow: false,
      gBestThreshold: [],
      gBestGap: 0,
    };
  },
  methods: {
    handleSelectFile(e, fileType) {
      let file = e.target.files[0];
      if (file) {
        this[`${fileType}File`] = file;
        let reader = new FileReader();
        reader.onload = async e => {
          this[`${fileType}Image`] = e.target.result;
          let greyImage = await grey(e.target.result);
          let greyHist = histogram(greyImage);
          this.histogramOpt.series[0].data = greyHist;
          this.isChartShow = true;
        };
        reader.readAsDataURL(file);
      }
    },

    handleSelectFileClick() {
      const uploadInput = this.$refs["upload-input"];
      uploadInput.click();
    },

    async handelSegmentation() {
      if (this.srcFile !== "") {
        let greyImage = await grey(this.srcImage);
        let { dstImage, gBestThreshold, gBestGap } = psoOtsuSegment(
          greyImage,
          this.thresholdNum,
          this.particleNum,
          this.omegaRate,
          this.c1Rate,
          this.c2Rate,
          this.minVector,
          this.maxVector,
          this.maxIteration
        );
        this.dstImage = dstImage;
        this.gBestThreshold = gBestThreshold;
        this.gBestGap = gBestGap;

        this.$message({
          message: "PSO-OTSU分割完成",
          type: "success",
          customClass: "success-msg",
          duration: 2000,
          showClose: true,
        });
      }
    }
  },

  mounted() {
    let xAxisData = new Array(256);
    for (let i = 0; i < xAxisData.length; i++) xAxisData[i] = i;

    this.histogramOpt = {
      xAxis: {
        type: "category",
        data: xAxisData
      },
      yAxis: {
        splitLine: { show: false },
        type: "value"
      },
      series: [
        {
          data: [],
          type: "bar",
          smooth: true,
          itemStyle: {
            normal: {
              color: "#666"
            }
          }
        }
      ]
    };
  }
};
</script>

<style>
@import "./common.css";

.result-block {
  width: 80%;
  margin: 0 auto 20px;
  text-align: center;
}
</style>
