<template>
  <nav class="navbar has-shadow"> <!-- is-fixed-top -->
    <div class="container">
      <div class="navbar-brand">
        <a class="navbar-item" href="#/">
          <img src="../assets/menu/fast-reply-icon.png" alt="Waiting no more">Fast-Reply
        </a>
        <div class="navbar-item has-dropdown is-hoverable" v-if="user">
          <a class="navbar-link">
            <span class="compose"><i class="fa fa-filter"></i> Filter <!--em v-if="filter.id">: {{ filterCounters[filter.id] }} x {{ filter.title | truncate(50) }}</em--></span>
          </a>
          <div class="navbar-dropdown">
            <a class="navbar-item" id="filter-article-all" @click.prevent="changeFilter(null,null)">All articles</a>
            <!--a v-for="article in articles" class="navbar-item" :id="'filter-article-'+article.id" @click.prevent="changeFilter(article.id, article.title)">
              {{ filterCounters[article.id] }} x {{ article.title | truncate (50)}}
            </a-->
          </div>
        </div>
      </div>
      <div class="navbar-end" v-if="user">
        <!--a class="navbar-item">
          <span v-if="comments">{{ comments.length }} <i class="fa fa-inbox"></i></span>
        </a-->
        <a class="navbar-item" @click.prevent="updateVP">
          <span>{{ votingPower }} <icon name="bolt" scale="0.8"></icon></span>
        </a>
        <!--a class="navbar-item">
          <span>{{ pending.comments }} <i class="fas fa-comment-alt"></i></span>
        </a>
        <a class="navbar-item">
          <span>{{ pending.votes }} <i class="fas fa-chevron-circle-up"></i></span>
        </a>
        <a class="navbar-item" @click.prevent="reload">
          <span><i class="fa fa-refresh"></i> Reload</span>
        </a-->
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
import Cookies from 'js-cookie'

export default {
  name: 'top-menu',
  computed: {
    user () {
      return this.$store.getters.user
    },
    votingPower () {
      return this.$store.getters.steemconnect.vp
    }
  },
  methods: {
    clearIgnoreList: function () {
      this.$store.dispatch('clearIgnoreList')
    },
    logout: function () {
      let dispatch = this.$store.dispatch
      this.$store.getters.steemconnect.api.revokeToken(function (err, result) {
        console.log(err, result)
        if (!err && result.success) {
          console.log('You successfully logged out')
          // Remove all cookies
          Cookies.remove('access_token', {path: '/'})
          Cookies.remove('username', {path: '/'})
          Cookies.remove('expires_in', {path: '/'})
          // Reset all steemconnect local data
          dispatch('logout')
        } else {
          console.error(err)
        }
      })
    },
    updateVP: function () {
      this.$store.dispatch('updateVP')
    }
  }
}
</script>

<style scoped>

</style>
