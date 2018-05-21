import Vue from 'vue'
import Router from 'vue-router'

import Inbox from '@/components/Inbox'
import SteemConnect from '@/components/SteemConnect'
import Pending from '@/components/Pending'

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
      path: '/pending',
      name: 'Pending',
      component: Pending
    }
  ]
})
