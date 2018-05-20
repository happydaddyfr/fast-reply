<template>
  <div class="column is-8 message hero is-fullheight" id="message-pane" v-show="selectedComment">
    <div class="box message-preview">
      <div v-if="selectedComment" class="top">
        <div class="avatar">
          <img :src="$options.filters.avatar(selectedComment.author)">
        </div>
        <div class="address">
          <div class="steem-username">
            <a target="_blank" :href="$options.filters.profile(selectedComment.author)">
              @{{ selectedComment.author }} ({{ parseInt(selectedComment.reputation) }})
            </a>
          </div>
          <button @click.prevent="followAccount(selectedComment.author)" class="button is-success is-small">
            Follow @{{ selectedComment.author }}
          </button>
          <button @click.prevent="unfollowAccount(selectedComment.author)" class="button is-warning is-small">
            Unfollow @{{ selectedComment.author }}
          </button>
          <button @click.prevent="ignoreAccount(selectedComment.author)" class="button is-danger is-small">
            Ignore @{{ selectedComment.author }}
          </button>
        </div>
        <div>
          <span class="msg-attachment">
              <a target="_blank" :href="$options.filters.steemit(selectedComment.url)">
                  <icon name="paperclip" scale="0.8"></icon>
              </a>
          </span>
          <span class="subject"><strong>{{ selectedComment.rootTitle }}</strong></span>
        </div>
        <hr>
        <div class="content" v-html="$options.filters.markdownToHTML(selectedComment.body)">
        </div>
      </div>
    </div>
    <div class="control">
      <div class="field">
        <label class="label">Your Vote ({{ vote }}%)</label>
        <div class="control">
          <input id="vote-slider" class="slider is-fullwidth is-info is-large" step="1" min="0" max="100" :value="vote" @change.prevent="changeVote" type="range">
          <div class="buttons has-addons is-centered">
            <span v-for="votePercent in voteQuickSelector" :key="votePercent" class="button is-large" :class="{'is-selected': (vote == votePercent),'is-info': (vote == votePercent)}" @click.prevent="setVote(votePercent)">
              {{votePercent}}%
            </span>
          </div>
        </div>
      </div>
      <div class="field">
        <label class="label">Your Fast Reply</label>
        <div class="control">
          <textarea id="reply" class="textarea reply" type="text" placeholder="Reply here..."></textarea>
        </div>
      </div>
      <div class="buttons has-addons is-grouped is-centered">
        <span v-for="emoji in emojiQuickSelector" :key="emoji" class="button is-large" @click.prevent="addEmoji(emoji)">
          {{ emoji }}
        </span>
      </div>
      <div class="field is-grouped is-grouped-right">
        <div class="control">
          <button class="button is-large is-link is-rounded" @click.prevent="replyToSelectedComment">Reply</button>
        </div>
        <div class="control">
          <button class="button is-large is-success is-rounded" @click.prevent="voteAndReplyToSelectedComment">Vote and Reply</button>
        </div>
        <div class="control">
          <button id="vote" class="button is-large is-warning is-rounded" @click.prevent="voteSelectedComment">Vote</button>
        </div>
        <div class="control">
          <button id="ignore" class="button is-large is-danger is-rounded" @click.prevent="ignoreSelectedComment">Ignore</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'message-pane',
  watch: {
    selectedComment (after, before) {
      if (after != null) {
        let reply = document.getElementById('reply')
        reply.value = '@' + after.author + ' '
        reply.focus()
      }
    }
  },
  computed: {
    selectedComment () {
      return this.$store.getters.inbox.selectedComment
    },
    vote () {
      return this.$store.getters.config.vote
    },
    voteQuickSelector () {
      return [0.5, 1, 5, 10, 25, 50, 75, 100]
    },
    emojiQuickSelector () {
      return ['👍', '😀', '😘', '😍', '😆', '😎', '😅', '😂', '😱', '🙏', '🙄', '😭', '🇧🇪']
    }
  },
  methods: {
    // TODO regroup vote methods
    setVote (value) {
      this.$store.dispatch('setVotePower', value)
    },
    changeVote (event) {
      this.$store.dispatch('setVotePower', event.target.value)
    }
  }
}
</script>

<style scoped>

</style>
