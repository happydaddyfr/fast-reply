import Vue from 'vue'
import Router from 'vue-router'

import HelloWorld from '@/components/HelloWorld'
import SteemConnect from '@/components/SteemConnect'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/steemconnect',
      name: 'SteemConnect',
      component: SteemConnect
    }
  ]
})
