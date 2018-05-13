console.log('Initialize SteemConnect');
// initialize SteemConnect v2
sc2.init({
	app: 'fast-reply.app',
	callbackURL: 'http://localhost:8080/steemconnect/', // Dev localhost URL
	//callbackURL: 'http://fast-reply.surge.sh/steemconnect/',  // Live demo URL
	scope: ['vote', 'comment', 'custom_json'],
});

var emptyIgnoreList = function() {
	return {
		comments: [],
		users: []
	};
}

// https://stackoverflow.com/questions/946534/insert-text-into-textarea-with-jquery/2819568#2819568
$.fn.extend({
    insertAtCaret: function(myValue){
        var obj;
        if( typeof this[0].name !='undefined' ) obj = this[0];
        else obj = this;

        if (false) {    //$.browser.msie // Deprecated jquery function
            obj.focus();
            sel = document.selection.createRange();
            sel.text = myValue;
            obj.focus();
        }
        else if (true) {    // $.browser.mozilla || $.browser.webkit
            var startPos = obj.selectionStart;
            var endPos = obj.selectionEnd;
            var scrollTop = obj.scrollTop;
            obj.value = obj.value.substring(0, startPos)+myValue+obj.value.substring(endPos,obj.value.length);
            obj.focus();
            obj.selectionStart = startPos + myValue.length;
            obj.selectionEnd = startPos + myValue.length;
            obj.scrollTop = scrollTop;
        } else {
            obj.value += myValue;
            obj.focus();
        }
    }
})


// Initialize the Vue Model    
var vm = new Vue({
	el: '#vm',
	created() {
		let app = this;
	  	console.log('VueJS #vm initialized');

		console.log('Load settings');	  
		if ($.cookie("vote%") != null) {
			this.vote = $.cookie("vote%");
		} else {
			// Start with a default vote value of 100%
			$.cookie("vote%", 100, { expires: 7, path: '/' });
		}
		// Load ignore list
		this.ignore = this.getIgnoreList();

	  	console.log('Load Steem profile');
		// Request user details if token is available
		if ($.cookie("access_token") != null) {
			sc2.setAccessToken($.cookie("access_token"));
			sc2.me(function(err, result) {
				//console.log('/me', err, result); // DEBUG
				if (!err) {
					// Fill the steemconnect placeholder with results
					app.steemconnect.user = result.account;
					app.steemconnect.metadata = JSON.stringify(result.user_metadata, null, 2);
					app.steemconnect.profile_image = JSON.parse(result.account.json_metadata)['profile']['profile_image'];
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
		messages: null,	// All comments currently shown by the app
		comments: null, // All raw comments
		articles: null, // List of all the filters for articles
		filter: {		// Selected filter
			id: null,
			title: null
		},
		// init with a default vote value of 100%
		vote: 100,		// Default value for voting percentage
		dialog: null,	// Message for the user
		ignore: emptyIgnoreList(),
		selectedComment: null
	},
	computed: { 
		username() { 
			if (this.steemconnect.user != null) { 
				return this.steemconnect.user.name; 
		  	} 
		  	return null; 
		},
    	hasComments() {
    		return (this.messages != null && this.messages.length > 0);
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
			// TODO: check if content is indeed markdown (via API)
			// Transform Markdown markup into HTML
			// ShowDownJS: https://github.com/showdownjs/showdown
			return new showdown.Converter().makeHtml(value);
		},
		date: function(date) {
		  // Format date from UTC to locale Date
		  return new Date(Date.parse(date)).toLocaleDateString();
		},
		steemit: function(path) {
		  return "https://www.steemit.com" + path;
		},
		profile: function(username) {
		  // Creation d'un lien vers le profile steemit d'un utilisateur
		  return "https://www.steemit.com/@" + username;
		},
		avatar: function(username) {
		  // Creation d'un lien vers l'avatar (image) steem d'un utilisateur // Thanks to Busy
		  return "http://img.busy.org/@" + username;
		}
	},
	methods: {
		logout: function() {
			let app = this;
			sc2.revokeToken(function(err, result) {
				console.log('You successfully logged out', err, result);
				// Remove all cookies
				$.removeCookie("access_token", { path: '/' });
				$.removeCookie("username", { path: '/' });
				$.removeCookie("expires_in", { path: '/' });
				// Reset all steemconnect local data
				for (var key in app.steemconnect) {
					app.steemconnect[key] = null;
				}
			});
		},
		showMessage: function(msg) {
			// TODO replace by a VueJS component ?
			$('#message-pane').removeClass('is-hidden');
			$('.card').removeClass('active');
			$('#msg-card-' + msg.id).addClass('active');

			$('#reply').val('@' + msg.from + ' ');
			$('#reply').focus();
			
			this.selectedComment = msg;
			this.vote = $.cookie("vote%");
		},
        addEmoji: function(emoji) {
            $('#reply').insertAtCaret(' ' + emoji);
            $('#reply').focus();
        },
    	setVote: function(value) {
			this.vote = value;
			//console.log('Changing vote value to ' + this.vote);
			$.cookie("vote%", this.vote, { expires: 7, path: '/' });
    	},
    	changeVote: function() {
			let value = $('#vote-slider')[0].value;
			this.setVote(value);
    	},
    	changeFilter: function(articleId, articleTitle) {
    		this.filter = {
    			id: articleId, 
    			title: articleTitle
    		};
    	},
	    createDialog: function(type, data, timeout) {
	    	// Display a message with the given type
	    	// If a timeout is provided (optional) the dialog will close automatically after that duration (in milliseconds)
	      	this.dialog = {type: type, data: data}
	      	let app = this;
	      	if(typeof timeout !== "undefined") {
	      		setTimeout(function() { app.closeDialog() }, timeout);
	      	}
	    },
	    closeDialog: function() {
	      	this.dialog = null
	    },
		reload: function() {
			var name = this.username;
			if (name != null) {

				var url = "http://api.comprendre-steem.fr/getComments?username=roxane&test=" + name;  // TODO: remove 'roxane&test=' to use logged user
				console.log("refreshing " + url);

				// VueJS Ressources plugin: https://github.com/pagekit/vue-resource
				this.$http.get(url).then(response => {
					var comments = response.data.comments;

					this.articles = [];
					let filteredComments = [];
					
					let j = 0;
					let articlesIds = new Set();
					for (let i = 0; i < comments.length; i++) {
						
						let comment = comments[i];
						if (this.getIgnoreList().users.includes(comment.from) || this.getIgnoreList().comments.includes(comment.id)) {
							// Filter comments based on ignore lists
							continue;
						}

						if (!articlesIds.has(comment.rootId)) {
							this.articles[j++] = {
								id: comment.rootId, 
								title: comment.rootTitle
							}
							articlesIds.add(comment.rootId);
						}

						filteredComments.push(comment);
					}					

					this.comments = filteredComments;
					console.log("Found " + this.comments.length + " new comment(s).");
					this.createDialog("is-success", "Found " + comments.length + " comments on " + articlesIds.length + " articles.", 5000);

					this.loadMessages();
				})
			}
		},
		loadMessages: function() {
			// empty the current inbox
			this.messages = [];

			// reload inbox with the new data
			let pos = 0;
			for (var i = 0; i < this.comments.length; i++) {

				let comment = this.comments[i];
				if (this.filter.id == null || this.filter.id == comment.rootId) {
					this.messages[pos++] = {
						articleId: comment.rootId,
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
				}
			}

			if (this.messages.length > 0) {
				this.showMessage(this.messages[0]);
			} else {
				console.log("No comments found for " + this.filter.title);
				this.selectedComment = null;
			}
			
		},

		/// IGNORE LIST HELPERS

		removeComment: function(id) {
			// Find comment based on id and remove it from the list
			for (var i = 0; i < this.comments.length; i++) {
				if (this.comments[i].id == id) {
					// Find the right index and remove it
					this.comments.splice(i, 1);
					return true;
				}
			}
			return false;
		},
		removeCommentsFromUser: function(username) {
			for (var i = 0; i < this.comments.length; i++) {
				if (this.comments[i].from == username) {
					// Find the right index and remove it
					this.comments.splice(i, 1);
				}
			}
			return false;
		},
		getIgnoreList: function() {
			let ignore = window.localStorage.getItem("ignore");
			if (ignore == null) {
				this.clearIgnoreList();
				this.ignore = emptyIgnoreList();
			} else {
				// Check for missing Array in case version changed
				if (!ignore.users) {
					ignore.users = [];
				}
				if (!ignore.comments) {
					ignore.comments = [];
				}
			}
			return JSON.parse(ignore);
		},
		saveIgnoreList: function() {
			// LocalStorage : https://stackoverflow.com/questions/2010892/storing-objects-in-html5-localstorage
			window.localStorage.setItem("ignore", JSON.stringify(this.ignore));
		},
		clearIgnoreList: function() {
			this.ignore = emptyIgnoreList();
			this.saveIgnoreList();
			this.reload();
			this.createDialog("is-success", "Ignore list cleared.", 2000);
		},
		addCommentToIgnore: function(id) {
			if (this.removeComment(id)) {
				this.ignore["comments"].push(id);
				this.saveIgnoreList();
				this.loadMessages();
				this.createDialog("is-success", "Comments ignored.", 2000);
			} else {
				this.createDialog("is-error", "Could not find comment with ID: " + id + ".", 5000);
			}
		},
		addUserToIgnore: function(username) {
			if (this.removeCommentsFromUser(username)) {
				this.ignore["users"].push(username);
				this.saveIgnoreList();
				this.createDialog("is-success", "User ignored: " + username, 2000);
			} else {
				this.createDialog("is-error", "Could not find user with username: " + username + ".", 5000);
			}
		},

		// ACTION on Comments

		ignoreSelectedComment: function() {
			if (this.selectedComment) {
				this.addCommentToIgnore(this.selectedComment.id);
			} else {
				alert('No comment selected');
			}
		},
		voteSelectedComment: function() {
			if (this.selectedComment) {
				this.voteComment(this.selectedComment.from, this.selectedComment.permlink, this.vote * 100);
				this.removeComment(this.selectedComment.id);
				this.loadMessages();
			} else {
				alert('No comment selected');
			}
		},
		replyToSelectedComment: function() {
			if (this.selectedComment) {
				let body = $('.message .control .reply').val();
				if (body.length == 0) {
					alert('Comment is empty');
				} else {
					this.replyComment(this.selectedComment.from, this.selectedComment.permlink, body);
					this.removeComment(this.selectedComment.id);
					this.loadMessages();
				}
			} else {
				alert('No comment selected');
			}
		},
		voteAndReplyToSelectedComment: function() {
			if (this.selectedComment) {
				let body = $('.message .control .reply').val();
				if (body.length == 0) {
					alert('Comment is empty');
				} else {
					this.replyComment(this.selectedComment.from, this.selectedComment.permlink, body);
					if (this.vote > 0) {
						// If vote is defined, also vote on the comment
						this.voteComment(this.selectedComment.from, this.selectedComment.permlink, this.vote * 100);
					}
					this.removeComment(this.selectedComment.id);
					this.loadMessages();
				}
			} else {
				alert('No comment selected');
			}
		},
		shareSelectedComment: function() {
			if (this.selectedComment) {
				this.shareComment(this.selectedComment.from, this.selectedComment.permlink);
				this.removeComment(this.selectedComment.id);
			} else {
				alert('No comment selected');
			}
		},

		// STEEM CONNECT HELPERS

		voteComment: function(author, permlink, weight) {
	      app = this;
	      sc2.vote(this.steemconnect.user.name, author, permlink, weight, function (err, res) {
	        if (!err) {
	          app.createDialog("is-success", 'You successfully voted for @' + author + '/' + permlink, 2000);
	          console.log(app.dialog.data, err, res);
	        } else {
	          console.log(err);
	          app.createDialog("is-danger", err);
	        }
	      });
	    },

		replyComment: function(author, permlink, body) {
	      app = this;
	      sc2.comment(author, permlink, this.steemconnect.user.name, permlink+'-'+ Date.now(), '', body, {app: 'fast-reply'}, function (err, res) {
	        if (!err) {
	          app.createDialog("is-success", 'You successfully commented post @' + author + '/' + permlink, 2000);
	          console.log(app.dialog.data, err, res);
	        } else {
	          console.log(err);
	          app.createDialog("is-danger", err, 5000);
	        }
	      });
	    },
		shareComment: function(author, permlink) {
	      app = this;
	      sc2.reblog(this.steemconnect.user.name, author, permlink, function (err, res) {
	        if (!err) {
	          app.createDialog("is-success", 'You successfully rebloged post @' + author + '/' + permlink, 2000);
	          console.log(app.dialog.data, err, res);
	        } else {
	          console.log(err);
	          app.createDialog("is-danger", err, 5000);
	        }
	      });
	    },
	    followAccount: function(username) {
	      app = this;
	      sc2.follow(this.steemconnect.user.name, username, function (err, res) {
	        if (!err) {
	          app.createDialog("is-success", "You successfully followed @" + username, 2000);
	          console.log(app.dialog.data, err, res);
	        } else {
	          console.log(err);
	          app.createDialog("is-danger", err, 5000);
	        }
	      });
	    },
	    unfollowAccount: function(username) {
	      app = this;
	      sc2.unfollow(this.steemconnect.user.name, username, function (err, res) {
	        if (!err) {
	          app.createDialog("is-warning", "You successfully unfollowed @" + username, 2000);
	          console.log(app.dialog.data, err, res);
	        } else {
	          console.log(err);
	          app.createDialog("is-danger", err, 5000);
	        }
	      });
	    },
	    ignoreAccount: function(username) {
	      app = this;
	      sc2.ignore(this.steemconnect.user.name, username, function (err, res) {
	        if (!err) {
	          app.createDialog("is-warning", "You successfully ignored @" + username, 2000);
	          console.log(app.dialog.data, err, res);
	        } else {
	          console.log(err);
	          app.createDialog("is-danger", err, 5000);
	        }
	      });
	    }
	}
});