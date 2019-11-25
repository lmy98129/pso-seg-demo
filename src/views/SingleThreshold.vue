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
      <div class="controller-line slider-line">
        <div class="controller-line-tag">分割阈值</div>
        <el-slider class="controller-line-content" :min="0" :max="255" v-model="threshold" />
        <div class="controller-line-value">{{threshold}}</div>
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
    <v-chart
      id="hist-chart"
      :style="{height: isChartShow ? '400px' : '0px'}"
      :options="histogramOpt"
      :autoresize="true"
    />
  </div>
</template>

<script>
import { grey, thresholdSegment, histogram } from "../utils/basic-utils";

export default {
  name: "SingleThreshold",
  data() {
    return {
      srcImage: "",
      srcFile: "",
      dstImage: "",
      threshold: 64,
      histogramOpt: {},
      isChartShow: false
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
        this.dstImage = thresholdSegment(greyImage, [this.threshold]);
        this.$message({
          message: "单一阈值分割完成",
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

<style scoped>
@import "./common.css";

.slider-line {
  max-width: 80%;
  margin: 10px auto
}
</style>
