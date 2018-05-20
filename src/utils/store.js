// https://stackoverflow.com/questions/40564071/how-do-i-break-up-my-vuex-file
import Vue from 'vue'
import Vuex from 'vuex'
import VueResource from 'vue-resource' // https://github.com/pagekit/vue-resource
import VueStorage from 'vue-ls'

import steem from 'steem'
import sc2 from 'sc2-sdk'

import toast from '@/utils/toast.js'

// Plugin declaration
Vue.use(Vuex)
Vue.use(VueResource)
Vue.use(VueStorage)

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
    config: Vue.ls.get('config', defaultConfig),
    timers: {},
    inbox: {
      comments: null, // All raw comments (filtered)  // TODO store all and filter using computed props
      filter: null, // selected filter
      selectedComment: null // Comments currently selected
    }
  },
  mutations: {
    clearIgnoreList (state) {
      state.config.ignoreList = {comments: [], users: []}
    },
    connect (state, result) {
      state.steemconnect.user = result.account
    },
    updateVP (state, vp) {
      console.log('VP: ', vp, '%')
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
    },
    timer (state, timer) {
      if (state.timers[timer]) {
        // Remove previous interval, if set
        clearInterval(state.timers[timer.name])
      }
      state.timers[timer.name] = timer.value
    },
    reload (state, result) {
      let ignoreList = state.config.ignoreList
      let comments = result.data.comments

      let filteredComments = []
      for (let i = 0; i < comments.length; i++) {
        let comment = comments[i]
        if (ignoreList.users.includes(comment.from) || ignoreList.comments.includes(comment.id)) {
          // Filter comments based on ignore lists
          continue
        }
        filteredComments.push(comment)
      }
      // Persist result to state
      // TODO move to computed
      state.inbox.comments = filteredComments

      console.log('Found ' + filteredComments.length + ' new comment(s)')
      toast.createDialog('success', 'Found ' + filteredComments.length + ' comments', 5000)
    },
    selectFilter (state, article) {
      state.inbox.filter = article
    },
    loadMessages (state, messages) {
      state.inbox.messages = messages
    },
    selectComment (state, comment) {
      state.inbox.selectedComment = comment
    }
  },
  actions: {
    async connect ({ dispatch, commit, state }, token) {
      // wait for async call to resolve using await, then use result
      state.steemconnect.api.setAccessToken(token)
      commit('connect', await state.steemconnect.api.me())
      // Force reload on login
      dispatch('reload')
      // Retrieve user VP
      dispatch('updateVP')
    },
    updateVP ({ dispatch, commit, state }) {
      if (state.steemconnect.user) {
        steem.api.getAccounts([state.steemconnect.user.name], function (err, response) {
          if (!err) {
            let secondsago = (new Date() - new Date(response[0].last_vote_time + 'Z')) / 1000
            let vpow = response[0].voting_power + (10000 * secondsago / 432000)
            vpow = Math.min(vpow / 100, 100).toFixed(2)
            commit('updateVP', vpow)
          }
        })
      }
    },
    clearIgnoreList ({ commit }) {
      commit('clearIgnoreList')
    },
    logout ({ commit }) {
      commit('logout')
    },
    timer ({dispatch, commit, state}, timer) {
      commit('timer', timer)
    },
    async reload ({dispatch, commit, state}) {
      let user = state.steemconnect.user
      if (user) {
        const url = 'http://api.comprendre-steem.fr/getComments?username=roxane&test=' + user.name // TODO: remove 'roxane&test=' to use logged user
        commit('reload', await Vue.http.get(url))
      }
    },
    selectFilter ({dispatch, commit}, article) {
      commit('selectFilter', article)
    },
    selectComment ({dispatch, commit, state}, comment) {
      commit('selectComment', comment)
    },
    setVotePower ({dispatch, commit, state}, value) {
      commit('config', {name: 'vote', value: value})
    }
  },
  getters: {
    user: state => {
      return state.steemconnect.user
    },
    steemconnect: state => {
      return state.steemconnect
    },
    config: state => {
      return state.config
    },
    inbox: state => {
      return state.inbox
    }
  }
})
