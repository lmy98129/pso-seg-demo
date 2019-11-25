<template>
  <el-header class="el-header" height="75px">
    <div class="nav-bar">
      <!-- NavBar Title -->
      <div class="navbar-title">PSO SEG 🌈</div>
      <!-- NavBar List -->
      <div class="navbar-list-wrapper">
        <ul class="navbar-list">
          <!-- Main Links-->
          <li class="navbar-item">
            <router-link class="navbar-link" to="/">单一阈值</router-link>
          </li>
          <li class="navbar-item">
            <router-link class="navbar-link" to="/otsu">OTSU法</router-link>
          </li>
          <li class="navbar-item">
            <router-link class="navbar-link" to="/sauvola">Sauvola法</router-link>
          </li>
        </ul>
      </div>
      <!-- NavBar Right Button -->
      <div>
        <a href="http://github.com/lmy98129">
          <div class="nav-bar-right button github-btn">GitHub</div>
        </a>
        <div class="menu-btn iconfont icon-menu" style="display: none" @click="switchMenuVisible"></div>
      </div>
    </div>
    <!-- Mobile Menu -->
    <ul class="menu-wrap" id="menu" :style="{'display' : isMenuVisible ? 'block': 'none'}">
      <li class="navbar-item">
        <router-link class="navbar-link" to="/">单一阈值</router-link>
      </li>
      <li class="navbar-item">
        <router-link class="navbar-link" to="/otsu">OTSU法</router-link>
      </li>
      <li class="navbar-item">
        <router-link class="navbar-link" to="/sauvola">Sauvola法</router-link>
      </li>
    </ul>
  </el-header>
</template>

<script>
export default {
  name: "NavBar",
  data() {
    return {
      isMenuVisible: false,
    }
  },

  mounted() {
    // 窗口改变尺寸回调
    window.onresize = () => {
      if (document.documentElement.clientWidth > 768) {
        this.isMenuVisible = false;
      }
    }
  },

  methods: {
    switchMenuVisible() {
      this.isMenuVisible = !this.isMenuVisible;
    }
  }
}
</script>

<style lang="scss">
@import '../element-variable.scss';

.nav-bar {
  text-align: center;
  align-items: center;
  height: 100%;
  display: flex;
  justify-content: space-between;
  max-width: 1280px;
  margin: 0 auto;
}

.el-header {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 3000;
  background: #fff;
  border-bottom: 1px solid #ccc;
  font-size: 20px;
}

.navbar-list {
  display: flex;
  justify-content: space-around;
  font-size: 17px;
}

.navbar-list-wrapper.active .navbar-list {
  flex-direction: column;
  align-items: center;
}

.navbar-list-wrapper .navbar-item {
  padding-left: 20px;
  padding-right: 20px;
}

.navbar-item,
.navbar-link {
  display: block;
  position: relative;
  color: #333;
  cursor: pointer;
}

.navbar-item.active,
.navbar-item:hover,
.navbar-link.active,
.navbar-link:hover {
  color: #000;
}

.github-btn {
  background: $--color-primary;
  color: #fff;
}

@media (max-width: 1024px) {
  .navbar-list-wrapper,
  .nav-bar-right {
    display: none;
  }
  .menu-btn {
    font-size: 23px !important;
    display: block !important;
    cursor: pointer;
  }
  .menu-wrap {
    position: relative;
    top: 0px;
    margin-left: -20px;
  }
  .menu-wrap li {
    width: 100%;
    text-align: center;
    padding: 20px;
    background: #fff;
    cursor: pointer;
    border-bottom: solid 0.1px #ccc;
  }
  .menu-wrap li:first-child {
    border-top: solid 0.1px #ccc;
  }
}
</style>