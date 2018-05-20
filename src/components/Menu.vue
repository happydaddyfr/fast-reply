<template>
  <nav class="navbar has-shadow is-fixed-top">
    <div class="container">
      <div class="navbar-brand">
        <a class="navbar-item" href="#/">
          <img src="../assets/menu/fast-reply-icon.png" alt="Waiting no more">Fast-Reply
        </a>
        <div class="navbar-item has-dropdown is-hoverable" v-if="user">
          <a class="navbar-link">
            <span class="compose"><i class="fa fa-filter"></i> Filter <em v-if="inbox.filter">: {{ filterCounters[inbox.filter.id] }} x {{ inbox.filter.title | truncate(50) }}</em></span>
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
        <a class="navbar-item">
          <span v-if="inbox.comments">{{ inbox.comments.length }} <icon name="inbox" scale="0.8"></icon></span>
        </a>
        <a class="navbar-item" @click.prevent="updateVP">
          <span>{{ votingPower }} <icon name="bolt" scale="0.8"></icon></span>
        </a>
        <!--a class="navbar-item">
          <span>{{ pending.comments }} <i class="fas fa-comment-alt"></i></span>
        </a>
        <a class="navbar-item">
          <span>{{ pending.votes }} <i class="fas fa-chevron-circle-up"></i></span>
        </a-->
        <a class="navbar-item" @click.prevent="reload">
          <span>Reload <icon name="sync" scale="0.8"></icon></span>
        </a>
        <div class="navbar-item has-dropdown is-hoverable">
          <a class="navbar-link">
            {{ user.name }}
          </a>
          <div class="navbar-dropdown">
            <a target="_blank" href="https://steemconnect.com/dashboard" class="navbar-item">SteemConnect Dashboard</a>
            <a target="_blank" :href="$options.filters.profile(user.name)" class="navbar-item">Steemit Profile</a>
            <a class="navbar-item" @click.prevent="clearIgnoreList">Clear ignore list</a>
            <hr class="navbar-divider">
            <a @click.prevent="logout" href="#" class="navbar-item">Logout</a>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import Vue from 'vue'
import Storage from 'vue-ls'

Vue.use(Storage)

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
      let articles = inbox.comments
        // Transform in filter
        .map(function (comment) { return {id: comment.rootId, title: comment.rootTitle} })
        // sort by ID
        .sort((a, b) => a.id - b.id)
        // Remove adjacent with existing id at prev position
        .filter((item, pos, ary) => !pos || item.id !== ary[pos - 1].id)
      return articles
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
    }
  }
}
</script>

<style scoped>

</style>
