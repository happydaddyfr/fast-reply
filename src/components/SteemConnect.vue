<template>
  <div id="steemconnect"></div>
</template>

<script>
import Cookies from 'js-cookie' // From https://github.com/js-cookie/js-cookie

export default {
  name: 'SteemConnect',
  data () {
    return { }
  },
  created () {
    // Parse URL to look after SC2 returned values
    let params = this.$route.query
    if (params['access_token'] != null && params['username'] != null && params['expires_in'] != null) {
      Cookies.set('access_token', params['access_token'], { expires: 7, path: '/' })
      Cookies.set('username', params['username'], { expires: 7, path: '/' })
      Cookies.set('expires_in', params['expires_in'], { expires: 7, path: '/' })
    }
    this.$router.push('/')
  }
}
</script>
