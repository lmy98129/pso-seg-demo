import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { 
  Container, Header, Main, 
  Row, Col, Slider, Message,
  InputNumber
} from 'element-ui'

import './element-variable.scss'

import Echarts from 'vue-echarts'
import 'echarts/lib/chart/bar'

Vue.component('v-chart', Echarts)

Vue.use(Container)
Vue.use(Header)
Vue.use(Main)
Vue.use(Row)
Vue.use(Col)
Vue.use(Slider)
Vue.use(InputNumber)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

Vue.prototype.$message = Message;