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
import toast from './utils/toast.js'
import router from './router'
import App from './App'

// Global component declaration
Vue.component('icon', Icon)

Vue.config.productionTip = false

toast.createDialog('show', 'test', 5000)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  components: { App },
  template: '<App/>',
  created () {
    console.log('Load Steem profile')
    // Request user details if token is available
    let token = this.$ls.get('access_token')
    if (token != null) {
      this.$store.dispatch('connect', token)
    }
  },
  mounted () {
    const SECOND = 1000
    const MINUTE = 60 * SECOND

    // refresh VP every minute
    // https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setInterval
    let vpTimer = setInterval(this.$store.dispatch, MINUTE, 'updateVP')
    this.$store.dispatch('timer', {name: 'updateVP', value: vpTimer})
  }
})
