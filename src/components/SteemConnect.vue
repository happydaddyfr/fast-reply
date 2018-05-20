<template>
  <div id="steemconnect"></div>
</template>

<script>
import Cookies from 'js-cookie'

export default {
  name: 'SteemConnect',
  created () {
    // TODO log with multiple accounts ?

    // Parse URL to look after SC2 returned values
    let params = this.$route.query
    let accessToken = params['access_token']
    let username = params['username']
    let expiresIn = params['expires_in']

    if (accessToken != null && username != null && expiresIn != null) {
      // Compute expiration in day
      // https://github.com/js-cookie/js-cookie/wiki/Frequently-Asked-Questions#expire-cookies-in-less-than-a-day
      let expiration = expiresIn / (24 * 60 * 60)
      Cookies.set('username', username, { expires: expiration, path: '' })
      Cookies.set('access_token', accessToken, { expires: expiration, path: '' })
      this.$store.dispatch('connect', accessToken)
    }
    this.$router.push('/')
  }
}
</script>
