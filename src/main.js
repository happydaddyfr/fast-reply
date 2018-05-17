// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'

// Load 3rd patry libs
import steem from 'steem'
import sc2 from 'sc2-sdk'
import Cookies from 'js-cookie'
import 'vue-awesome/icons'

// Load Bulma CSS
import 'bulma/css/bulma.css'
import Icon from 'vue-awesome/components/Icon'

// Initialize App
import './utils/filters.js'
import router from './router'
import App from './App'

// Plugin declaration
Vue.use(Vuex)
// Global component declaration
Vue.component('icon', Icon)

Vue.config.productionTip = false

console.log('Initialize SteemConnect')
// initialize SteemConnect v2
var api = sc2.Initialize({
  app: 'fast-reply.app',
  callbackURL: 'http://localhost:8080/#/steemconnect', // Dev localhost URL
  // callbackURL: 'http://fast-reply.surge.sh/steemconnect/',  // Live demo URL
  scope: ['vote', 'comment', 'custom_json']
})

const store = new Vuex.Store({
  state: {
    count: 0,
    ignoreList: {comments: [], users: []},
    steemconnect: {
      api: api,
      user: null,
      metadata: null,
      profile_image: null
    },
    username: '???'
  },
  mutations: {
    increment (state) {
      state.count++
    },
    resetIgnore (state) {
      state.ignoreList = {comments: [], users: []}
    },
    connect (state, result) {
      state.count = 42
      state.steemconnect.user = result.account
      state.steemconnect.metadata = JSON.stringify(result.user_metadata, null, 2)
      state.steemconnect.profile_image = JSON.parse(result.account.json_metadata)['profile']['profile_image']
    }
  },
  actions: {
    increment (context) {
      context.commit('increment')
    },
    connect (context, token) {
      context.state.steemconnect.api.setAccessToken(token)
      // Async commit inside function not working ?!
      context.state.steemconnect.api.me((err, result) => {
        console.log('/me', err, result) // DEBUG
        if (!err) {
          console.log('User connected')
          // Fill the steemconnect placeholder with results
          context.commit('connect', result)
          // app.updateVotingPower();
        }
      })
    }
  },
  getters: {
    getLoginURL: state => {
      return state.steemconnect.api.getLoginURL()
    },
    getSteemConnectApi: state => {
      return state.steemconnect.api
    },
    username: state => {
      if (this.connected) {
        return state.steemconnect.user.name
      } else {
        return '???'
      }
    },
    connected: state => {
      return state.steemconnect.user != null
    }
  }
})

// TEST
// store.commit('increment')
// store.dispatch('increment')
// console.log(store.state.count) // -> 1

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  components: { App },
  template: '<App/>',
  created () {
    console.log('VueJS #vm initialized')

    // TODO remove once used
    console.log(steem)

    console.log('Load settings')
    if (Cookies.get('vote%') != null) {
      this.vote = Cookies.get('vote%')
    } else {
      // Start with a default vote value of 100%
      Cookies.set('vote%', 100, { expires: 7, path: '/' })
    }
    // Load ignore list
    // this.ignore = this.getIgnoreList();

    console.log('Load Steem profile')
    // Request user details if token is available
    let token = Cookies.get('access_token')
    if (token != null) {
      this.$store.dispatch('connect', token)
    }
  }
})
