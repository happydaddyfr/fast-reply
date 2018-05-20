import Vue from 'vue'
import Router from 'vue-router'

import Inbox from '@/components/Inbox'
import SteemConnect from '@/components/SteemConnect'
import HelloWorld from '@/components/HelloWorld'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Inbox',
      component: Inbox
    },
    {
      path: '/steemconnect',
      name: 'SteemConnect',
      component: SteemConnect
    },
    {
      path: '/hello',
      name: 'HelloWorld',
      component: HelloWorld
    }
  ]
})
