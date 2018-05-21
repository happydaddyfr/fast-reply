<template>
  <nav class="navbar has-shadow is-fixed-top">
    <div class="container">
      <div class="navbar-brand">
        <router-link class="navbar-item" to="/">
          <img src="../assets/menu/fast-reply-icon.png" alt="Waiting no more">Fast-Reply
        </router-link>
        <router-link class="navbar-item" to="/" v-tooltip.bottom="'Remaining comments'">
          <span v-if="inbox.comments">{{ inbox.comments.length }} <icon name="inbox" scale="0.8"></icon></span>
        </router-link>
        <div class="navbar-item has-dropdown is-hoverable" v-if="user">
          <a class="navbar-link">
            <span class="compose"><icon name="filter" scale="0.8"></icon> Filter <em v-if="inbox.filter">: {{ filterCounters[inbox.filter.id] }} x {{ inbox.filter.title | truncate(50) }}</em></span>
          </a>
          <div class="navbar-dropdown">
            <a class="navbar-item" id="filter-article-all" @click.prevent="selectFilter(null)">All articles</a>
            <a v-for="article in articles" class="navbar-item" :key="article.id" :id="'filter-article-'+article.id" @click.prevent="selectFilter(article)">
              {{ filterCounters[article.id] }} x {{ article.title | truncate(50)}}
            </a>
          </div>
        </div>
      </div>
      <div class="navbar-end" v-if="user">
        <a class="navbar-item" :class="[isSchedulerRunning ? 'green' : 'red']" @click.prevent="toggleScheduler" v-tooltip.bottom="'Start/Stop event sending'">
          <span><icon name="play" scale="0.8"></icon></span>
          <span><icon name="pause" scale="0.8"></icon></span>
        </a>
        <router-link class="navbar-item" to="/pending" v-tooltip.bottom="'Pending comments'">
          <span>{{ pending | countPending('comment') }} <icon name="comment-alt" scale="0.8"></icon></span>
        </router-link>
          <router-link class="navbar-item" to="/pending" v-tooltip.bottom="'Pending votes'">
          <span>{{ pending | countPending('vote') }} <icon name="chevron-circle-up" scale="0.8"></icon></span>
        </router-link>
        <a class="navbar-item" @click.prevent="updateVP" v-tooltip.bottom="'Voting Power'">
          <span>{{ votingPower }} <icon name="bolt" scale="0.8"></icon></span>
        </a>
        <div class="navbar-item has-dropdown is-hoverable">
          <a class="navbar-link">
            {{ user.name }}
          </a>
          <div class="navbar-dropdown">
            <a target="_blank" :href="$options.filters.profile(user.name)" class="navbar-item"><icon name="user" scale="0.6"></icon>&nbsp;Steemit Profile</a>
            <router-link class="navbar-item" to="/mentions" v-tooltip.bottom="'See Mentions'">
              <span><icon name="at" scale="0.6"></icon>&nbsp;Mentions @{{ user.name }}</span>
            </router-link>
            <a target="_blank" href="https://steemconnect.com/dashboard" class="navbar-item"><icon name="cog" scale="0.6"></icon>&nbsp;SteemConnect Dashboard</a>
            <hr class="navbar-divider">
            <a class="navbar-item" @click.prevent="reload"><icon name="sync" scale="0.6"></icon>&nbsp;Reload inbox</a>
            <a class="navbar-item" @click.prevent="clearIgnoreList"><icon name="eraser" scale="0.6"></icon>&nbsp;Clear ignore list</a>
            <hr class="navbar-divider">
            <a href="https://v2.steemconnect.com/sign/transfer?amount=3%20SBD&memo=Donation%20(%20Fast-Reply%20)&to=comprendre-steem" target="_blank" class="navbar-item"><icon name="donate" scale="0.6"></icon>&nbsp;Donate</a>
            <a @click.prevent="logout" href="#" class="navbar-item"><icon name="power-off" scale="0.6"></icon>&nbsp;Logout</a>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import Vue from 'vue'
import Storage from 'vue-ls'
import VTooltip from 'v-tooltip'

Vue.use(Storage)
Vue.use(VTooltip)

export default {
  name: 'top-menu',
  computed: {
    user () {
      return this.$store.getters.user
    },
    votingPower () {
      return this.$store.getters.steemconnect.vp
    },
    inbox () {
      return this.$store.getters.inbox
    },
    filterCounters () {
      let inbox = this.$store.getters.inbox
      let counters = {}
      if (this.articles) {
        this.articles.forEach(function (article) {
          counters[article.id] = inbox.comments.filter(function (comment) {
            return comment.rootId === article.id
          }).length
        })
      }
      return counters
    },
    articles () {
      let inbox = this.$store.getters.inbox
      if (inbox.comments) {
        let articles = inbox.comments
        // Transform in filter
          .map(function (comment) {
            return {id: comment.rootId, title: comment.rootTitle}
          })
          // sort by ID
          .sort((a, b) => a.id - b.id)
          // Remove adjacent with existing id at prev position
          .filter((item, pos, ary) => !pos || item.id !== ary[pos - 1].id)
        return articles
      } else return []
    },
    pending () {
      return this.$store.getters.pending
    },
    isSchedulerRunning () {
      return this.$store.getters.isSchedulerRunning
    }
  },
  filters: {
    countPending: function (pending, type) {
      return pending.filter(action => action.type === type).length
    }
  },
  methods: {
    clearIgnoreList: function () {
      this.$store.dispatch('clearIgnoreList')
    },
    logout: function () {
      let dispatch = this.$store.dispatch
      let ls = this.$ls
      this.$store.getters.steemconnect.api.revokeToken(function (err, result) {
        console.log(err, result)
        if (!err && result.success) {
          console.log('You successfully logged out')
          // Remove all cookies
          ls.remove('access_token')
          ls.remove('username')
          // Reset all steemconnect local data
          dispatch('logout')
        } else {
          console.error(err)
        }
      })
    },
    updateVP: function () {
      this.$store.dispatch('updateVP')
    },
    reload: function () {
      this.$store.dispatch('reload')
    },
    selectFilter: function (article) {
      this.$store.dispatch('selectFilter', article)
    },
    toggleScheduler: function () {
      this.$store.dispatch('toggleScheduler')
    }
  }
}
</script>

<style scoped>

</style>
