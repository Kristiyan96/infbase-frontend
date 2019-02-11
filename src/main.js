import Vue from 'vue/dist/vue.js'
import App from './App.vue'
import VueRouter from 'vue-router'
import Vuex from "vuex";
import router from "../src/router";
import store from "../src/store"
import Argon from "../src/plugins/argon-kit";
import axios from 'axios';
import { securedAxiosInstance, plainAxiosInstance } from './backend/axios'
import VueAxios from 'vue-axios';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import Vue2Filters from 'vue2-filters'
import vSelect from 'vue-select';

library.add({ faCaretLeft, faCaretRight });

Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.use(VueRouter);
Vue.use(Vuex);
Vue.use(Argon);
Vue.use(VueAxios, axios);
Vue.use(require('vue-cookies'));
Vue.use(Vue2Filters);
Vue.use(require('vue-moment'));
Vue.component('v-select', vSelect);



Vue.config.productionTip = false
Vue.use(VueAxios, {
  secured: securedAxiosInstance,
  plain: plainAxiosInstance
})

document.addEventListener('DOMContentLoaded', () => {
  let v = new Vue({
    store,
    router,
    securedAxiosInstance,
    plainAxiosInstance,
    components: { App },
    template: '<App/>'
  }).$mount("#app");
  store.$axios = v.axios;
  if (window.$cookies.get('userId') && window.$cookies.get('jwt')){
    v.$store.dispatch('signedIn',[window.$cookies.get('jwt'),window.$cookies.get('userId')])
  }
})
