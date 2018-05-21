<template>
  <div class="pending">
    <table class="table is-bordered is-hoverable is-narrow is-fullwidth is-striped">
      <thead>
      <tr>
        <th><abbr title="Position">#</abbr></th>
        <th>Type</th>
        <th>Author</th>
        <th>Permlink</th>
        <th>Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="action in pending" :key="pending.indexOf(action)">
        <th>{{ pending.indexOf(action) }}</th>
        <td>{{ action.type }} {{ action.type == 'vote' ? '(' + action.vote + '%)' : '' }}</td>
        <td>{{ action.author }}</td>
        <td>{{ action.permlink }}</td>
        <td class="center"><icon name="play" scale="0.8"></icon> <icon name="window-close" class="red" scale="0.8"></icon></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'Pending',
  data () {
    return {
      msg: 'Overview'
    }
  },
  computed: {
    pending () {
      return this.$store.getters.pending
    }
  }
}
</script>

<style scoped>
.pending {
  margin: 20px;
  padding-top: 50px;
}
.center {
  text-align: center;
}
</style>
