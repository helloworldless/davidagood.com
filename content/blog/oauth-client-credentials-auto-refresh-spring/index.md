---
title: "How to Automatically Request and Refresh OAuth2 Client Credentials Token in Spring"
date: "2020-12-10T17:28:38.227Z"
lastUpdated: "2020-12-14T00:32:02.283Z"
description: "How to transparently handle OAuth2's Client Credentials authorization grant request and subsequent token
refresh requests when making service to service requests from a client to a resource server. One solution uses Spring
WebFlux's WebClient together with Spring Security OAuth2 Client abstractions and is complex but highly configurable.
Another solution uses OAuth2RestTemplate which is simple but not at all customizable."
---

# Background

This post is based on this question:

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Does anyone have an example of using <a href="https://twitter.com/springframework?ref_src=twsrc%5Etfw">@springframework</a> WebClient (or RestTemplate) to get an OAuth2 token from a private provider and automatically refresh it before it expires? Ideally I can just call the <a href="https://twitter.com/hashtag/OAuth?src=hash&amp;ref_src=twsrc%5Etfw">#OAuth</a> protected service without worrying about the authn details.</p>&mdash; David Good (@helloworldless) <a href="https://twitter.com/helloworldless/status/1335937905643167750?ref_src=twsrc%5Etfw">December 7, 2020</a></blockquote>

Here's a more accurate description of my scenario:

Let's say I'm a developer working on Customer Service which needs to request some information from another microservice,
Order Service, which is secured by OAuth2. In OAuth terminology, Order Service is a resource server. Before making a
request to Order Service, Customer Service needs to make an authorization grant request to the OAuth2 authentication
server. The response from the authorization server includes an access token which then must be passed on the request to
Order Service in order to prove that it is authorized to access the resource. This type of service-to-service
authentication is specified
by [OAuth2's Client Credentials Grant Type](https://oauth.net/2/grant-types/client-credentials/).

So far, this is simple enough—it's basically passing a username and password to one service which returns a token which
is then sent on subsequent requests to another service. The tricky part is that the token periodically expires, so
Customer Service needs to periodically request a new token from the authorization server before calling Order Service. I
refer to this as refreshing the token (not to be confused
with [OAuth2's Refresh Grant Type](https://oauth.net/2/grant-types/refresh-token/)), although technically it's not a
refresh but just another request which "exchanges" the client credentials for a new token.

I considered a few ideas of how you to handle the token expiration:

1. Request a new token before every request to the resource server
1. Catch 401 Unauthorized responses from the resource server, assume it was due to the token expiring, request a new
   token, and retry
1. Save the token and expiration time in memory. Before making a request to the resource server, first check if the
   token has already expired or is about to expire. If so, request a new token. Finally, make the request to the
   resource server.
1. Save the token and expiration time in memory, and have a timer which triggers a token refresh some interval before
   expiry

We could go through the exercise of discussing how some of these solutions are better than others, but my whole point
was that **I definitely did not want to rely on a bunch of imperative code to do this or roll my own abstraction**. This
is such a common problem, I thought, it must be already solved within the Spring ecosystem. And indeed it is! Both of
the solutions I describe below use  
strategy #3 from above.

# Solution #1: Using WebClient

**Note:** This solution assumes the use of Servlet-based Spring, **not** Reactive Spring. The Spring WebFlux dependency is added   
in order to use an OAuth2 client-configured `WebClient` in blocking mode. That being said, you may be able to adapt this solution 
for Reactive Spring, but I have not attempted to do so myself.

## How To Use It

**Update:** After about one month of working with this, I created my own repo which demonstrates how to do this and incorporates all the lessons learned:
[Handling OAuth Client Credentials Authorization Transparently with Spring Security](https://github.com/helloworldless/spring-oauth2-client-credentials-webclient)

For quick reference, here are the dependencies you'll need:

- `org.springframework.boot:spring-boot-starter-web`
- `org.springframework.boot:spring-boot-starter-security`
- `org.springframework.boot:spring-boot-starter-oauth2-client`
- `org.springframework:spring-webflux`

### Another Example of How To Use This

Although I ended up creating my own repo to demonstrate how this should be used based on my experience, 
I still think this example is relevant because it's from the Spring team.

The example is in
[this Spring Authorization Server sample](https://github.com/spring-projects-experimental/spring-authorization-server/tree/master/samples/boot/oauth2-integration/client). 
The Authorization Server project is still experimental but not the code in the `client` module.

## Caveats

- This solution is highly configurable, but that comes at the cost of complexity. If you're not experienced with Spring
  Security and OAuth, there are a lot of new abstractions to learn.
- Adding the Spring OAuth2 Client dependency automatically protects your existing Spring Web endpoints by OAuth, which
  is not at all what we're after for this server-to-server request. So Spring Security defaults must be disabled, i.e. using a custom `WebSecurityConfigurerAdapter`. I've written a separate post describing how to do this: 
  [How To Completely Disable HTTP Security in Spring Security](https://davidagood.com/spring-security-disable-http-security/).
- This is a much bigger leap if you're not already using WebFlux, and potentially a harder sell for your team. There are
  a lot of new concepts to learn and there seems to be some churn here as well: one solution I found used a class which
  had already been deprecated.
- You'll have to use new tools from a testing perspective. For example, `ExchangeFunction` for unit testing. Also, you
  won't be able to use `MockRestServiceServer`. The Spring team recommends using 
  OkHttp's `MockWebServer` ([link](https://github.com/square/okhttp/blob/4ebc5f644c92ad08e41908db2ccaff4819cd0cbe/mockwebserver/README.md)) 
  which is what I've used in my [demo repo](https://github.com/helloworldless/spring-oauth2-client-credentials-webclient).

## Dependency on Servlet Environment Causes Unexpected Behavior

By default, the Spring Security OAuth2 configuration is heavily coupled to the Servlet environment. In other words, even
though a service is making a backend-to-backend request to a resource server using OAuth2's Client Credentials grant
type, it is done in the context of the incoming servlet request. If the service is not using any kind of authentication
for its Spring Web MVC controllers, the user is actually considered an authenticated, anonymous user. And in this
scenario,
`AuthenticatedPrincipalOAuth2AuthorizedClientRepository.loadAuthorizedClient`
defers to `HttpSessionOAuth2AuthorizedClientRepository.loadAuthorizedClient`
which—just like it sounds—depends on an HTTP session to maintain a context across multiple requests. This results in the
following unexpected behavior.

Say we start up our service and make one HTTP request to it which under the hood leads to a service-to-service call to
an OAuth resource server. The Spring Security OAuth abstractions will determine that no authorized client exists in its
repository and make the necessary grant request to the authorization server before making the request to the resource
server. All good so far.

Now we make a second HTTP request to our service which will lead to a second service-to-service call to the same OAuth
resource server. Assuming the token has not expired, we would expect the Spring Security OAuth abstractions to re-use
the token to call the resource server. In other words, it should not need to make a second grant request to the
authorization server. However, if we do not use the same HTTP session for both requests, that is exactly what will
happen.

I did find these properties which sound related but did not have the desired outcome of decoupling the client
credentials grant request from the servlet context:

```java
ServletOAuth2AuthorizedClientExchangeFilterFunction oauth2Client=new ServletOAuth2AuthorizedClientExchangeFilterFunction(
        authorizedClientManager);
        oauth2Client.setDefaultClientRegistrationId(REGISTRATION_ID);
// OR
        oauth2Client.setDefaultOAuth2AuthorizedClient(true);
```

Next I found
this, [Provide Servlet equivalent of UnAuthenticatedServerOAuth2AuthorizedClientRepository #6683](https://github.com/spring-projects/spring-security/issues/6683)
, which led to the creation of `AuthorizedClientServiceOAuth2AuthorizedClientManager`
(part of `org.springframework.security:spring-security-oauth2-client`)
which is described as:

> An implementation of an OAuth2AuthorizedClientManager that is capable of operating outside of a HttpServletRequest context, e.g. in a scheduled/background thread and/or in the service-tier

Here's
the [latest version of `AuthorizedClientServiceOAuth2AuthorizedClientManager`](https://github.com/spring-projects/spring-security/blob/5.4.2/oauth2/oauth2-client/src/main/java/org/springframework/security/oauth2/client/AuthorizedClientServiceOAuth2AuthorizedClientManager.java)
from Spring Security 5.4.2.

At last: the `AuthorizedClientServiceOAuth2AuthorizedClientManager` was exactly what I was looking for to eliminate the
coupling of OAuth client credentials authorization to a servlet request and specific HTTP session.

See how to use it here:

[Handling OAuth Client Credentials Authorization Transparently with Spring](https://github.com/helloworldless/spring-oauth2-client-credentials-webclient)

## References

- Spring Security
  Docs: [OAuth 2.0 Client](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#oauth2client)
    - Explains many of the concepts needed with relevant code examples
- Spring Security
  Docs: [WebClient for Servlet Environments](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#servlet-webclient)

# Solution #2: Using OAuth2RestTemplate

## How To Use It

Here's a nice blog post which shows how to use it:
[Secure Server-to-Server Communication with Spring Boot and OAuth 2.0](https://developer.okta.com/blog/2018/04/02/client-creds-with-spring-boot)
.

## Caveats

- `OAuth2RestTemplate` is in no way, shape, or form customizable. To be honest, it seems to have been slapped together
  in an hour or two just to check a box or close out an issue.
- Adding the Spring Security dependency automatically enables basic password authentication, you have to disable it if
  you don't need it, i.e. using a `WebSecurityConfigurerAdapter`. I've written a separate post describing how to do this: 
  [How To Completely Disable HTTP Security in Spring Security](https://davidagood.com/spring-security-disable-http-security/).
- Doesn't pick up Jackson customizations from the context, so they need to be applied again which may not be
  straightforward. For example, in order to apply a common customization like Jackson's `WRITE_DATES_AS_TIMESTAMPS` I
  had to fall back to explicitly annotating fields with `@JsonFormat`. In contrast, anywhere I'm using `RestTemplate`,
  the serialization feature is picked up from application properties:
  `spring.jackson.serialization.WRITE_DATES_AS_TIMESTAMPS: false`.
- Other `RestTeplate` customizations are lost, e.g. connection/read timeouts
    - I haven't confirmed this, but I don't see how they could be carried over

I was actually considering re-implementing `OAuth2RestTemplate` using composition instead of inheritance which would
solve the last two caveats above. It should be pretty straightforward as there really isn't much code
in `OAuth2RestTemplate`, so using composition, almost everything would be delegated to `RestTemplate`. In fact, I'm not
sure why the author(s) of `OAuth2RestTemplate` didn't go with this approach.
