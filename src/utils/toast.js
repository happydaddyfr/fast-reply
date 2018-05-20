import Vue from 'vue'
import Toasted from 'vue-toasted'

Vue.use(Toasted)

export default {
  createDialog: function (type, data, timeout) {
    Vue.toasted[type](data, {
      position: 'bottom-right',
      duration: timeout
    })
  }
}
