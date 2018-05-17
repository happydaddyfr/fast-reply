// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'

import sc2 from 'sc2-sdk'
import Cookies from 'js-cookie'

import router from './router'

import App from './App'
import Login from './components/Login'

Vue.use(Vuex)
Vue.component('fr-login', Login)

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
    connected: false,
    ignoreList: {comments: [], users: []},
    steemconnect: api
  },
  mutations: {
    increment (state) {
      state.count++
    },
    resetIgnore (state) {
      state.ignoreList = {comments: [], users: []}
    },
    connect (state, value) {
      state.connected = value
    }
  },
  getters: {
    selfCount: state => {
      return state.count
    },
    getLoginURL: state => {
      return api.getLoginURL()
    },
    SteemConnect: state => {
      return state.steemconnect
    }
  }
})

store.commit('increment')
console.log(store.state.count) // -> 1

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  components: { App, Login },
  template: '<App/>',
  created () {
    // let app = this;
    console.log('VueJS #vm initialized')

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
    if (Cookies.get('access_token') != null) {
      this.$store.getters.SteemConnect.setAccessToken(Cookies.get('access_token'))
      this.$store.getters.SteemConnect.me(function (err, result) {
        console.log('/me', err, result) // DEBUG
        if (!err) {
          // Fill the steemconnect placeholder with results
          // app.steemconnect.user = result.account;
          // app.steemconnect.metadata = JSON.stringify(result.user_metadata, null, 2);
          // app.steemconnect.profile_image = JSON.parse(result.account.json_metadata)['profile']['profile_image'];
          // app.updateVotingPower();
        }
      })
    }
  }
})
