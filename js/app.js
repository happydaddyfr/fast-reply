console.log('Initialize SteemConnect');
// initialize SteemConnect v2
sc2.init({
	app: 'fast-reply.app',
	callbackURL: 'http://localhost:8080/steemconnect/', // Dev localhost URL
	//callbackURL: 'http://steemconnect.surge.sh/steemconnect/',  // Live demo URL
	scope: ['vote', 'comment', 'custom_json'],
	//access: $.cookie("access_token")  // requires latest version // use `npm i sc2-sdk --save`
});

// Initialize the Vue Model    
var vm = new Vue({
	el: '#vm',
	created() {
	  	console.log('VueJS #vm initialized');

		console.log('Load settings');	  
		if ($.cookie("vote%") != null) {
			this.vote = $.cookie("vote%");
		} else {
			// Start with a default vote value of 100%
			$.cookie("vote%", 100, { expires: 7, path: '/' });
		}

	  	console.log('Load Steem profile');
		// Request user details if token is available
		if ($.cookie("access_token") != null) {
			sc2.setAccessToken($.cookie("access_token"));
			sc2.me(function(err, result) {
				console.log('/me', err, result); // DEBUG
				if (!err) {
					// Fill the steemconnect placeholder with results
					vm.$data.steemconnect.user = result.account;
					vm.$data.steemconnect.metadata = JSON.stringify(result.user_metadata, null, 2);
					vm.$data.steemconnect.profile_image = JSON.parse(result.account.json_metadata)['profile']['profile_image'];
				}
			});
		};
	},
	data: {
		loginUrl: sc2.getLoginURL(),
		steemconnect: {
			// Need to define an object that will be observed for changes by Vue.js
			user: null,
			metadata: null,
			profile_image: null
		},
		messages: null,
		comments: null,
		articles: null,
		filter: null,
		paginate: {
			pointer: {
				start: 1,
				end: 10
			},
			total: 0
		},
		// init with a default vote value of 100%
		vote: 100
	},
	computed: { 
		username() { 
			if (this.steemconnect.user != null) { 
				return this.steemconnect.user.name; 
		  	} 
		  	return null; 
		},
    	hasComments() {
    		return (this.messages == null || this.messages.length == 0);
    	}
	}, 
	watch: { 
		username(newUsername, oldUsername) { 
			if (newUsername != null && newUsername != oldUsername) { 
				this.reload(); 
		  	} 
		},
		filter(newFilter, oldFilter) {
			console.log("New filter selected: " + newFilter);
			this.loadMessages();
		}
	},
	filters: {  // https://vuejs.org/v2/guide/filters.html
	  truncate: function (value, length) {
	  	// Remove words making a string larger than a given size
	    if (!value) return '';
	    if (value.length <= length) return value;

	    // https://stackoverflow.com/a/33379772/957103
	    function truncateOnWord(str, limit) {
	        var trimmable = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u2028\u2029\u3000\uFEFF';
	        var reg = new RegExp('(?=[' + trimmable + '])');
	        var words = str.split(reg);
	        var count = 0;
	        return words.filter(function(word) {
	            count += word.length;
	            return count <= limit;
	        }).join('');
	    }

	    return truncateOnWord(value, length) + " [...]";
	  },
	  markdownToHTML: function(value) {
	  	// Transform Markdown markup into HTML
	  	// ShowDownJS: https://github.com/showdownjs/showdown
	  	return new showdown.Converter().makeHtml(value);
	  }
	},
	methods: {
		logout: function() {
			sc2.revokeToken(function(err, result) {
				console.log('You successfully logged out', err, result);
				// Remove all cookies
				$.removeCookie("access_token", { path: '/' });
				$.removeCookie("username", { path: '/' });
				$.removeCookie("expires_in", { path: '/' });
				// Reset all steemconnect local data
				for (var key in this.steemconnect) {
					this.steemconnect[key] = null;
				}
			});
		},
		showMessage: function(msg) {
			$('#message-pane').removeClass('is-hidden');
			$('.card').removeClass('active');
			$('#msg-card-' + msg.id).addClass('active');
			$('.message .avatar img').attr("src", "http://img.busy.org/@" + msg.from);
			$('.message .address .name').text("@" + msg.from);
			$('.message .address .email').text(this.profile(msg.from));
			$('.message .subject').text(msg.subject);
			var msg_body = '<p>' +
				this.$options.filters.markdownToHTML(msg.content) +
				'</p>';
			$('.message .content').html(msg_body);
			$('.message .control .reply').val('');
			$('.message .control .reply').focus();
			this.vote = $.cookie("vote%");
		},
		formatDate: function(date) {
	      // Format date from UTC to locale Date
	      return new Date(Date.parse(date)).toLocaleDateString();
    	},
    	steemitUrl: function(path) {
    	  return "https://www.steemit.com" + path;
    	},
    	profile: function(name) {
    	  // Creation d'un lien vers le profile steemit d'un utilisateur
    	  return "https://www.steemit.com/@" + name;
    	},
    	changeVote: function() {
    	  this.vote = $('#vote-slider')[0].value;
    	  //console.log('Changing vote value to ' + this.vote);
    	  $.cookie("vote%", this.vote, { expires: 7, path: '/' });
    	},
    	changeFilter: function(articleTitle) {
    		this.filter = articleTitle;
    	},
		reload: function() {
			var name = this.username;
			if (name != null) {

				var url = "http://api.comprendre-steem.fr/getComments?username=roxane&test=" + name;  // TODO: remove 'roxane&test=' to use logged user
				console.log("refreshing " + url);

				// VueJS Ressources plugin: https://github.com/pagekit/vue-resource
				this.$http.get(url).then(response => {
					var comments = response.data.comments;
					console.log("Found " + comments.length + " new comment(s).");

					let articlesTitles = new Set();
					for (let i = 0; i < comments.length; i++) {
						articlesTitles.add(comments[i].rootTitle);
					}

					this.articles = Array.from(articlesTitles);
					this.comments = comments;
					this.loadMessages();
				})
			}
		},
		loadMessages: function() {
			// empty the current inbox
			let data = [];

			// TODO adapt pagination values
			this.paginate = {};

			// reload inbox with the new data

			let pos = 0;
			for (var i = 0; i < this.comments.length; i++) {

				let comment = this.comments[i];
				if (this.filter == null || this.filter == comment.rootTitle) {
					data[pos++] = {
						id: comment.id,
						from: comment.author,
						reputation: comment.reputation,
						timestamp: comment.created,
						subject: comment.rootTitle,
						content: comment.body,
						payout: comment.payout,
						url : comment.url,
						permlink: comment.permlink
					};

					if (data.length >= 10) {
						// TODO: Only keep 10 most recent comments until pagination is ready
						break;
					}
				}
			}

			this.messages = data;
			if (data.length > 0) {
				this.showMessage(data[0]);
			} else {
				console.log("No comments found for " + this.filter);
			}
			
		}
	}
});