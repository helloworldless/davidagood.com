---
title: "How to Automatically Refresh OAuth2 Client Credentials in Spring"
date: "2020-12-10T17:28:38.227Z"
lastUpdated: "2020-12-14T00:32:02.283Z"
description: "How to handle OAuth2's Client Credentials authentication and token 
refresh automatically in Spring using traditional RestTemplate and the newer, 
reactive-centric WebClient"
---

This post is based on this question:

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Does anyone have an example of using <a href="https://twitter.com/springframework?ref_src=twsrc%5Etfw">@springframework</a> WebClient (or RestTemplate) to get an OAuth2 token from a private provider and automatically refresh it before it expires? Ideally I can just call the <a href="https://twitter.com/hashtag/OAuth?src=hash&amp;ref_src=twsrc%5Etfw">#OAuth</a> protected service without worrying about the authn details.</p>&mdash; David Good (@helloworldless) <a href="https://twitter.com/helloworldless/status/1335937905643167750?ref_src=twsrc%5Etfw">December 7, 2020</a></blockquote>

Here's a more accurate description of my scenario:

Let's say I'm a developer working on Customer Service which needs to request some information 
from another microservice, Order Service, which is secured by OAuth2. 
In OAuth terminology, Order Service is 
a resource server. So before making the request to Order Service, Customer Service 
needs to be authenticated by the OAuth2 authentication server and pass an access token on any 
request to Order Service to prove its identity. 
This type of service-to-service authentication is 
specified by [OAuth2's Client Credentials Grant Type](https://oauth.net/2/grant-types/client-credentials/). 

So far, this is 
simple enough—it's basically passing a username and password to one service which returns a 
token which is then sent on subsequent requests to another service. The tricky part is that 
the token periodically expires, so Customer Service needs to periodically request a new 
token from the authorization server before calling Order Service. I refer to this as 
refreshing the token, not to be confused with [OAuth2's Refresh Grant Type](https://oauth.net/2/grant-types/refresh-token/). 

I considered a few ideas of how you to handle the token expiration:

1. Request a new token before every request to the resource server
1. Catch 401 Unauthorized responses from the resource server, assume it was due to the 
token expiring, request a new token, and retry
1. Save the token and expiration time in memory. Before making a request to the 
resource server, first check if the token has already expired or is about to expire. 
If so, request a new token. Finally, make the request to the resource server.
1. Save the token and expiration time in memory, and have a timer which triggers a token 
refresh some interval before expiry
    
We could go through the exercise of discussing how some of these solutions are better 
than others, but my whole point was that **I definitely 
did not want to rely on a bunch of imperative code to do this or roll my own abstraction**. 
This is such a common problem, I thought, it must be already solved within the 
Spring ecosystem. And indeed it is! Both of the solutions I describe below use  
strategy #3 from above.

# OAuth2RestTemplate

## How To Use It 

Here's a nice blog post which shows how to use it:
[Secure Server-to-Server Communication with Spring Boot and OAuth 2.0](https://developer.okta.com/blog/2018/04/02/client-creds-with-spring-boot).

## Caveats
- Adding the Spring Security dependency automatically enables basic password authentication, 
  you have to disable it if you don't need it, i.e. using a `WebSecurityConfigurerAdapter` 
- Doesn't pick up Jackson customizations from the context, so they need to be applied again which may not 
  be straightforward. For example, in order to apply a common customization like 
  Jackson's `WRITE_DATES_AS_TIMESTAMPS` I had to fall back to explicitly
  annotating fields with `@JsonFormat`. In contrast, anywhere I'm using `RestTemplate`, the 
  serialization feature is picked up from application properties: 
  `spring.jackson.serialization.WRITE_DATES_AS_TIMESTAMPS: false`.
- Other `RestTeplate` customizations are lost, e.g. connection/read timeouts
  - I haven't confirmed this, but I don't see how they could be carried over
    
I was actually considering re-implementing `OAuth2RestTemplate` using composition instead of 
inheritance which would solve the last two caveats above. It should be pretty straightforward as there really isn't 
much code in `OAuth2RestTemplate`, so using composition, almost everything would be delegated to `RestTemplate`. 
In fact, I'm not sure why the author(s) of `OAuth2RestTemplate` didn't go with this approach.

# WebClient

This is specifically in the context of using Spring Web and just adding Spring WebFlux for the purpose of using the 
WebClient as described below. Take care when reading guides and documentation that you're reading servlet-specific 
docs and not the reactive docs.

## How To Use It

There's a good example of using this in 
[this Spring Authorization Server sample](https://github.com/spring-projects-experimental/spring-authorization-server/tree/master/samples/boot/oauth2-integration/client). 
The Authorization Server 
project is still experimental but not the code in the `client` module.

For reference, here are the dependencies you'll need:

- org.springframework.boot:spring-boot-starter-web
- org.springframework.boot:spring-boot-starter-security
- org.springframework.boot:spring-boot-starter-oauth2-client
- org.springframework:spring-webflux

## Caveats
  - Adding the Spring OAuth2 Client dependency automatically protects your existing Spring Web endpoints by OAuth, 
    which is not at all what we're after. So just like `OAuth2RestTemplate` 
    this must be disabled, i.e. using a `WebSecurityConfigurerAdapter`
  - This is a much bigger leap if you're not already using WebFlux, and potentially a harder sell for your team.
    There are a lot of new concepts to learn 
    and there seems to be some churn here as well. One solution I found used a class 
    which has already been deprecated.
  - You'll likely have to learn new WebFlux abstractions from an integration testing perspective as well

## References

- Spring Security Docs: [OAuth 2.0 Client](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#oauth2client)
  - Explains many of the concepts needed with relevant code examples
- Spring Security Docs: [WebClient for Servlet Environments](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#servlet-webclient)
