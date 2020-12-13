---
title: "How to Automatically Refresh OAuth2 Client Credentials in Spring"
date: "2020-12-10T17:28:38.227Z"
description: "How to handle OAuth2's Client Credentials authentication and token 
refresh automatically in Spring"
---

This post is based on this question:

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Does anyone have an example of using <a href="https://twitter.com/springframework?ref_src=twsrc%5Etfw">@springframework</a> WebClient (or RestTemplate) to get an OAuth2 token from a private provider and automatically refresh it before it expires? Ideally I can just call the <a href="https://twitter.com/hashtag/OAuth?src=hash&amp;ref_src=twsrc%5Etfw">#OAuth</a> protected service without worrying about the authn details.</p>&mdash; David Good (@helloworldless) <a href="https://twitter.com/helloworldless/status/1335937905643167750?ref_src=twsrc%5Etfw">December 7, 2020</a></blockquote>

# OAuth2RestTemplate

- How to use it: 
  - Here's a nice blog post which shows how to use it:
    [Secure Server-to-Server Communication with Spring Boot and OAuth 2.0](https://developer.okta.com/blog/2018/04/02/client-creds-with-spring-boot)
- Caveats: 
  - Adding the Spring Security dependency automatically enables basic password authentication, 
    you have to disable it if you don't need it, i.e. using a `WebSecurityConfigurerAdapter` 
  - Apparently doesn't use the context's `ObjectMapper` so Jackson customizations need to be applied again 
    (not completely sure on how this works under the hood). Example: in order to apply a common customizations like 
    Jackson's `WRITE_DATES_AS_TIMESTAMPS` I had to fall back to explicitly
    annotating fields with `@JsonFormat`. In contrast, anywhere I'm using plain old `RestTemplate`, the 
    serialization feature is picked up from application properties: 
    `spring.jackson.serialization.WRITE_DATES_AS_TIMESTAMPS: false`

# WebClient

This is specifically in the context of using Spring Web and just adding Spring WebFlux for the purpose of using the 
WebClient as described below. Take care when reading guides and documentation that you're reading servlet-specific 
docs and not the reactive docs.

- How to use it:
  - Add Spring WebFlux Starter dependency
  - Add OAuth2 dependency 
- Caveats:
  - Adding the Spring OAuth2 Client dependency automatically protects your existing Spring Web endpoints by OAuth, 
    which is not at all what we're after. So just like `OAuth2RestTemplate` 
    this must be disabled, i.e. using a `WebSecurityConfigurerAdapter`
  - This is a much bigger leap if you're not already using WebFlux, and potentially a harder sell for your team.
    There are a lot of new concepts to learn 
    and there seems to be some churn here as well. One solution I found used a class  
    which has already been deprecated.
  - You'll likely have to learn new WebFlux abstractions from an integration testing perspective as well.

References:

- Spring Security Docs: [OAuth 2.0 Client](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#oauth2client)
  - Explains many of the concepts needed with relevant code examples
- Spring Security Docs: [WebClient for Servlet Environments](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#servlet-webclient)

