// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'

// Load 3rd patry libs
import 'vue-awesome/icons'

// Load Bulma CSS
import 'bulma/css/bulma.css'
import Icon from 'vue-awesome/components/Icon'

// Initialize App
import './utils/filters.js'
import store from './utils/store.js'
import router from './router'
import App from './App'

// Global component declaration
Vue.component('icon', Icon)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  components: { App },
  template: '<App/>',
  created () {
    // Load ignore list
    // this.ignore = this.getIgnoreList();

    console.log('Load Steem profile')
    // Request user details if token is available
    let token = this.$ls.get('access_token')
    if (token != null) {
      this.$store.dispatch('connect', token)
    }
  },
  methods: {

  }
})
