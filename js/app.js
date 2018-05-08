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
            /* 
              désactivé temporairement car erreur :
              Uncaught (in promise) TypeError: Cannot read property 'steemconnect' of undefined
              at app.js:31
              at eval (sc2.js?72ee:106)
            */

            // steemconnect.profile_image = JSON.parse(vm.$data.steemconnect.user.json_metadata)['profile']['profile_image'];

        }
    });
};


/* à intégrer dans le modèle vue vm afin de pouvoir modifier l'username */

$.getJSON("http://api.comprendre-steem.fr/getComments?username=roxane", function(data) {
    window.inbox = {};
    window.paginate = {
        total: Math.random() * (54236 - 100) + 3
    }
    for (var i = 0; i < data.comments.length && i < 10; i++) {
        window.inbox[i] = {
            from: data.comments[i].author,
            timestamp: null,
            subject: null,
            snippet: data.comments[i].body,
            fullMail: null,
            email: null
        };
    }

// Initialize the Vue Model    
var vm = new Vue({
    el: '#vm',
    created() {
      console.log('lol');
    },
    data: {
        loginUrl: sc2.getLoginURL(),
        steemconnect: steemconnect,
        messages: window.inbox,
        comments: null,
        paginate: {
            pointer: {
                start: 1,
                end: 10
            },
            total: 100
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
        showUser: function() {
          console.log(steemconnect.user.name);
        }
    }
});
});