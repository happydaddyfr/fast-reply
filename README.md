# Fast-Reply

This web tool started as a proof of concept. The goal was to find a
way to :

- find unanswered comments
- provide the ability to vote and comment back
- no wait the blockchain delay between actions

It is now growing past those features. Stay tuned for updates !

## Live Demo

A live demo is available: [HERE](http://fast-reply.surge.sh)

## Technical stuff

Fast-Reply is written in Vue.js. This is a client-side only tool,
so all you need is a webserver. For the live demo we are using Surge.sh
(check it out if you do not known it, it's awesome!), but you can also
run it locally (see here under for examples), the application will then 
be available  on [http://localhost:8080](http://localhost:8080)

### npm
``` 
> sudo npm install http-server -g
> http-server -p 8080 .
``` 

### docker
```
> docker run -d \
    --name fast-reply \
    -p 8080:80 \
    -v "$PWD":/usr/local/apache2/htdocs/ \
    httpd
```

### Security

Fast-Reply uses SteemConnect to handle authentication.
The posting role is used since the application only interact with the
Steem blockchain for basic features:

- Vote
- Comment
- Un/Follow
- Mute

## Authors

@comprendre-steem is a collective account which purpose is to 
explain Steem and help with the onboarding process of new french users.

For that purpose, a website has been created to gather all the 
important pieces of information in french. All kind of useful information 
are available on that website from markdown tutorial to Steem whitepapers
translation, but also video tutorial on Steem and its tools.

@roxane is one of the french community leaders, she has been teaching
Steem and its ecosystem for almost one year.

@oroger is more focused on the technical understanding and support
regarding the blockchain and development aspects.

Many french-speaking have participated to @comprendre-steem projects.

## Disclaimer

This application is currently under development.  
Updates are pushed frequently and might provoke instabilities.
This is mainly due to a de-synchronisation of the localstorage.
A button will be provided to clear the localstorage and start with
a new state for those cases.

Also, the interaction with the Steem blockchain rely on the Steem API.
We noticed that sometimes, the API return error but still execute the
requested actions. Safeguards have been put in place to avoid problems
but you could still have cases where a comment or a vote has been sent multiple 
times... 

future versions will allow you to have a better view on what happens...
in the mean time any constructive feedback is welcome.

In any case, usage of this software is you responsibility and the authors
will not take any responsibility of the result of you using it.