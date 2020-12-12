---
title: "How to Automatically Refresh OAuth2 Client Credentials in Spring"
date: "2020-12-10T17:28:38.227Z"
description: "How to handle OAuth2's `client_credentials` authentication and token 
refresh automatically in Spring"
---

_Work In Progress_

This post is based on this question:

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Does anyone have an example of using <a href="https://twitter.com/springframework?ref_src=twsrc%5Etfw">@springframework</a> WebClient (or RestTemplate) to get an OAuth2 token from a private provider and automatically refresh it before it expires? Ideally I can just call the <a href="https://twitter.com/hashtag/OAuth?src=hash&amp;ref_src=twsrc%5Etfw">#OAuth</a> protected service without worrying about the authn details.</p>&mdash; David Good (@helloworldless) <a href="https://twitter.com/helloworldless/status/1335937905643167750?ref_src=twsrc%5Etfw">December 7, 2020</a></blockquote>

# OAuth2RestTemplate

Add spring security dependency which automatically enables basic password authentication, you have to disable it if you don't need it, e.g. if authentication is already taken care of for you by an API gateway
Doesn't use the context's ObjectMapper so jackson customizations need to be applied again, e.g. write_timestamps_as_strings
I'm not sure why the author(s) have gone with inheritance over composition here. To me, that seems much more natural. Then 
the caller could provide their own RestTemplate, e.g. `new OAuth2RestTemplate(myRestTemplate, otherParam);`

# WebClient

Add webflux and oauth2client dependencies, the latter actually protects your existing Spring Web endpoints by OAuth, so again you have to disable that if you don't need it

This is a much bigger leap if you're not already using WebFlux. There are a lot of new concepts to learn and there seems to be some churn here as well. One solution I 
found had already been deprecated.

It's potentially harder to justify to your team.

You'll likely have to learn new WebFlux abstractions from a testing perspective as well.

