// initialize SteemConnect v2
sc2.init({
	app: 'fast-reply.app',
	callbackURL: 'http://localhost:8080/steemconnect/', // Dev localhost URL
	//callbackURL: 'http://steemconnect.surge.sh/steemconnect/',  // Live demo URL
	scope: ['vote', 'comment', 'custom_json'],
	//access: $.cookie("access_token")  // requires latest version // use `npm i sc2-sdk --save`
});

// Need to define an object that will be observed for changes by Vue.js
var steemconnect = {};
steemconnect.user = null;
steemconnect.metadata = null;
steemconnect.profile_image = null;

// Request user details if token is available
if ($.cookie("access_token") != null) {
	sc2.setAccessToken($.cookie("access_token"));
	sc2.me(function(err, result) {
		// console.log('/me', err, result); // DEBUG
		if (!err) {
			// Fill the steemconnect placeholder with results
			steemconnect.user = result.account;
			steemconnect.metadata = JSON.stringify(result.user_metadata, null, 2);
			steemconnect.profile_image = JSON.parse(steemconnect.user.json_metadata)['profile']['profile_image'];
		}
	});
};

// Initialize the Vue Model    
var vm = new Vue({
	el: '#vm',
	created() {
	  console.log('VueJS #vm initialized');
	},
	data: {
		loginUrl: sc2.getLoginURL(),
		steemconnect: steemconnect,
		messages: {},
		comments: null,
		paginate: {
			pointer: {
				start: 1,
				end: 10
			},
			total: 100
		}
	},
	computed: { 
		username() { 
			if (this.steemconnect.user != null) { 
				return this.steemconnect.user.name; 
		  	} 
		  	return null; 
		} 
	}, 
	watch: { 
		username(newUsername, oldUsername) { 
			if (newUsername != null) { 
				this.reload(newUsername); 
		  	} 
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
		showMessage: function(msg, index) {
			$('#message-pane').removeClass('is-hidden');
			$('.card').removeClass('active');
			$('#msg-card-' + index).addClass('active');
			$('.message .address .name').text(msg.from);
			$('.message .address .email').text(msg.email);
			var msg_body = '<p>' +
				msg.snippet +
				'</p>' +
				'<br>' +
				'<p>' +
				msg.fullMail +
				'</p>';
			$('.message .content').html(msg_body);
		},
		formatDate: function(date) {
	      // Format date from UTC to locale Date
	      return new Date(Date.parse(date)).toLocaleDateString();
    	},
    	profile: function(name) {
    	  return "https://www.steemit.com/@" + name;
    	},
		showUser: function() {
		  console.log(this.username);
		},
		reload: function(name) {

			var url = "http://api.comprendre-steem.fr/getComments?username=roxane&test=" + name;  // TODO: remove 'roxane&test=' to use logged user
			console.log("refreshing " + url);

			this.$http.get(url).then(response => {
				// empty the current inbox
				this.messages = {};

				// TODO adapt pagination values
				this.paginate = {};
			
				var comments = response.data.comments;
				console.log("Found " + comments.length + " new comment(s).");

				// reload inbox with the new data
				for (var i = 0; i < comments.length && i < 10; i++) {
					this.messages[i] = {
						from: comments[i].author,
						timestamp: null,
						subject: null,
						snippet: comments[i].body,
						fullMail: null,
						email: null,
						payout: comments[i].payout,
						reputation: comments[i].reputation,
						articleTitle: comments[i].rootTitle,
						created: this.formatDate(comments[i].created),
						url : "https://www.steemit.com" + comments[i].url
					};
				}
			})
		}
	}
});