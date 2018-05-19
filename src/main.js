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
      vp: null
    }
  },
  mutations: {
    resetIgnore (state) {
      state.ignoreList = {comments: [], users: []}
    },
    connect (state, result) {
      state.steemconnect.user = result.account
    },
    updateVP (state, vp) {
      state.steemconnect.vp = vp
    },
    logout (state) {
      state.steemconnect.user = null
      state.steemconnect.vp = null
    }
  },
  actions: {
    async connect ({ dispatch, commit, state }, token) {
      // wait for async call to resolve using await, then use result
      state.steemconnect.api.setAccessToken(token)
      commit('connect', await state.steemconnect.api.me())
      dispatch('updateVP')
    },
    updateVP ({ dispatch, commit, state }) {
      steem.api.getAccounts([state.steemconnect.user.name], function (err, response) {
        if (!err) {
          let secondsago = (new Date() - new Date(response[0].last_vote_time + 'Z')) / 1000
          let vpow = response[0].voting_power + (10000 * secondsago / 432000)
          vpow = Math.min(vpow / 100, 100).toFixed(2)
          // console.log('VP = ' + vpow + '%')
          commit('updateVP', vpow)
        }
      })
    },
    logout ({ dispatch, commit, state }) {
      commit('logout')
    }
  },
  getters: {
    getLoginURL: state => {
      return state.steemconnect.api.getLoginURL()
    },
    user: state => {
      return state.steemconnect.user
    },
    steemconnect: state => {
      return state.steemconnect
    }
  }
})

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
  },
  methods: {

  }
})
