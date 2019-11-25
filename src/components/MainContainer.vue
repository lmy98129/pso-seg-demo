<template>
  <el-container class="main-container">
    <keep-alive>
      <router-view />
    </keep-alive>
  </el-container>
</template>

<script>
export default {
  name: "MainContainer"
}
</script>

<style>
  .main-container {
    max-width: 1280px;
    margin-top: 75px;
    margin-left: auto;
    margin-right: auto;
    padding-left: 10px;
    padding-right: 10px;
  }
</style>