<template>
  <div id="steemconnect"></div>
</template>

<script>
import Cookies from 'js-cookie'

export default {
  name: 'SteemConnect',
  data () {
    return { }
  },
  created () {
    // TODO log with multiple accounts ?

    // Parse URL to look after SC2 returned values
    let params = this.$route.query
    let accessToken = params['access_token']
    let username = params['username']
    let expiresIn = params['expires_in']

    if (accessToken != null && username != null && expiresIn != null) {
      Cookies.set('username', username, { expires: 7, path: '/' })
      Cookies.set('expires_in', expiresIn, { expires: 7, path: '/' })
      Cookies.set('access_token', accessToken, { expires: 7, path: '/' })
      this.$store.dispatch('connect', accessToken)
    }
    this.$router.push('/')
  }
}
</script>
