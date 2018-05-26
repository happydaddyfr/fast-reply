import steem from 'steem'
import toast from '@/utils/toast.js'

export default {
  loadAccounts: function (username) {
    const chunkSize = 100
    // Recursive function to go through all the following by chunk
    let loadFollowing = function (username, type, pos, accounts) {
      steem.api.getFollowing(username, pos, type, chunkSize, function (err, result) {
        if (!err) {
          for (let follows of result) {
            if (follows.what.length > 0 && follows.what[0] === type) {
              accounts.add(follows.following)
            }
          }
          // Check if there is more to process
          if (result.length === chunkSize) {
            loadFollowing(username, type, result[result.length - 1].following, accounts)
          } else {
            console.log(type, accounts)
            return accounts
          }
        } else {
          console.log(err)
          toast.createDialog('error', 'Could not load related accounts: ' + err, 2000)
        }
      })
    }

    let followers = new Set() // TODO
    let following = loadFollowing(username, 'blog', 0, new Set())
    let muted = loadFollowing(username, 'ignore', 0, new Set())

    return {
      followers: followers,
      following: following,
      muted: muted
    }
  }
}
