<template>
  <div class="column is-4 messages hero is-fullheight" id="message-feed">
    <div class="inbox-messages" id="inbox-messages">
      <!-- https://vuejs.org/v2/guide/transitions.html -->
      <!--<transition-->
        <!--name="custom-classes-transition"-->
        <!--enter-active-class="animated bounceInRight"-->
        <!--leave-active-class="animated bounceOutRight">-->
        <!--<div v-if="dialog != null" class="notification" :class="dialog.type">-->
          <!--<button class="delete" @click.prevent="closeDialog"></button>-->
          <!--{{ dialog.data }}-->
        <!--</div>-->
      <!--</transition>-->
      <div v-for="msg in messages" class="card" :class="[(selectedComment && selectedComment.id === msg.id) ? 'active' : '']" :key="msg.id" :id="'msg-card-'+msg.id" @click="selectComment(msg)" :data-preview-id="msg.id">
        <div class="card-content" :class="[msg.reputation < 25 ? 'low-reputation': '']">
          <div class="msg-header">
            <a target="_blank" :href="$options.filters.profile(msg.author)">
              <span class="steem-username">@{{ msg.author }} ({{ parseInt(msg.reputation) }})</span>
            </a>
            <span class="msg-attachment">&nbsp;<a @click="addCommentToIgnore(msg.id)"><icon name="window-close" class="red" scale="0.8"></icon></a></span>
            <span class="msg-timestamp">{{ msg.created | date }}</span>
          </div>
          <div class="msg-subject">
            <span class="msg-subject"><strong>{{ msg.rootTitle }}</strong></span>
            <span class="msg-attachment">(${{ msg.payout }})&nbsp;
                <a target="_blank" :href="$options.filters.steemit(msg.url)"><icon name="paperclip" scale="0.8"></icon></a>
            </span>
          </div>
          <div class="msg-snippet">
            <!-- Balise v-html : https://fr.vuejs.org/v2/guide/syntax.html#Interpretation-du-HTML -->
            <!-- Usage des filtres : https://github.com/vuejs/vue/issues/4352 -->
            <p v-html="$options.filters.truncate($options.filters.markdownToHTML(msg.body), 250)"></p>
          </div>
        </div>
      </div>
      <div class="card-content" v-show="messages.isEmpty">
        <div class="msg-subject">
          <span class="msg-subject"><strong>No comments</strong></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'message-feed',
  computed: {
    messages () {
      let inbox = this.$store.getters.inbox
      return (inbox.comments) ? inbox.comments.filter(comment => (inbox.filter == null || inbox.filter.id === comment.rootId)) : []
    },
    selectedComment () {
      return this.$store.getters.inbox.selectedComment
    },
    filter () {
      return this.$store.getters.inbox.filter
    }
  },
  watch: {
    filter (after, before) {
      if (this.messages.length > 0) {
        // Select first message from list
        this.$store.dispatch('selectComment', this.messages[0])
      } else {
        // No message available
        this.$store.dispatch('selectComment', null)
      }
    }
  },
  methods: {
    selectComment (comment) {
      this.$store.dispatch('selectComment', comment)
    }
  }
}
</script>

<style scoped>

</style>
