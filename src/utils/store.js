// https://stackoverflow.com/questions/40564071/how-do-i-break-up-my-vuex-file
import Vue from 'vue'
import Vuex from 'vuex'
import Storage from 'vue-ls'

import steem from 'steem'
import sc2 from 'sc2-sdk'

// Plugin declaration
Vue.use(Vuex)
Vue.use(Storage)

// Initialize SteemConnect v2
var api = sc2.Initialize({
  app: 'fast-reply.app',
  callbackURL: 'http://localhost:8080/#/steemconnect', // Dev localhost URL
  // callbackURL: 'http://fast-reply.surge.sh/steemconnect/',  // Live demo URL
  scope: ['vote', 'comment', 'custom_json']
})

let defaultConfig = {
  ignoreList: {comments: [], users: []},
  vote: 100
}

// Create Global Store
export default new Vuex.Store({
  state: {
    steemconnect: {
      api: api,
      user: null,
      vp: null
    },
    config: Vue.ls.get('config', defaultConfig)
  },
  mutations: {
    resetIgnore (state) {
      state.config.ignoreList = {comments: [], users: []}
    },
    connect (state, result) {
      state.steemconnect.user = result.account
    },
    updateVP (state, vp) {
      state.steemconnect.vp = vp
    },
    logout (state) {
      // clear steemconnect state
      state.steemconnect.user = null
      state.steemconnect.vp = null
    },
    config (state, {name, value}) {
      state.config[name] = value
      Vue.ls.set('config', state.config)
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
    logout ({ commit }) {
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
    },
    config: state => {
      return state.config
    }
  }
})
