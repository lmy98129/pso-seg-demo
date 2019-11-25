<template>
  <!-- <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view/>
  </div>-->
  <el-container id="app">
    <nav-bar />
    <main-container />
  </el-container>
</template>

<script>
import NavBar from "@/components/NavBar.vue";
import MainContainer from "@/components/MainContainer.vue";

export default {
  name: "App",
  components: {
    "nav-bar": NavBar,
    "main-container": MainContainer
  }
};
</script>

<style>
@font-face {
  font-family: "iconfont"; /* project id 1269840 */
  src: url("//at.alicdn.com/t/font_1269840_u0zqp7e8t.eot");
  src: url("//at.alicdn.com/t/font_1269840_u0zqp7e8t.eot?#iefix")
      format("embedded-opentype"),
    url("//at.alicdn.com/t/font_1269840_u0zqp7e8t.woff2") format("woff2"),
    url("//at.alicdn.com/t/font_1269840_u0zqp7e8t.woff") format("woff"),
    url("//at.alicdn.com/t/font_1269840_u0zqp7e8t.ttf") format("truetype"),
    url("//at.alicdn.com/t/font_1269840_u0zqp7e8t.svg#iconfont") format("svg");
}

.iconfont {
  font-family: "iconfont" !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.icon-menu:before {
  content: "\e61d";
}

body,
ul,
p {
  margin: 0;
  padding: 0;
}

a {
  text-decoration: none;
}

#app {
  font-family: Montserrat, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.button {
  padding: 8px 18px;
  border-radius: 30px;
  cursor: pointer;
  font-size: 15px;
  max-width: 70px;
  text-align: center;
  user-select: none;
}

.button.plain-btn {
  border: 1px solid #bbb;
}

#upload-input {
  display: none;
}

.previewer {
  width: 400px;
  height: 500px;
  border: 1px #ccc solid;
  border-radius: 5px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.no-select {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.success-msg {
  z-index: 5000 !important;
}
</style>
