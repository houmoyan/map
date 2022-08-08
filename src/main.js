// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI)
import '@/assets/css/style.css'



import axios from 'axios'
import store from './store/store'

Vue.prototype.$http = axios



//引入axios
import VueAxios from 'vue-axios'
Vue.use(VueAxios, axios)

import api from "../config/api.js";
Vue.prototype.api = api;

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
