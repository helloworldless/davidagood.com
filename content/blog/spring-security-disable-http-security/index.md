---
title: How To Completely Disable HTTP Security in Spring Security 
date: "2020-12-16T16:18:08.998Z"
description: "Spring is known and loved for its convention of configuration approach. But 
this can occasionally cause a challenge when automatically enabled features need to be 
disabled. Here we see how to completely disable Spring Security's HTTP security"
---

_**Warning**: Do not disable HTTP security as described in this post unless you have a good reason to._

Spring is well-known for its convention over configuration approach where features works out of the box 
with sensible defaults. Part of what enables this experience is Spring's auto-configuration whereby adding 
a Spring dependency to 
your classpath automatically enables certain features. You may have noticed this with Spring JDBC. Once you add this 
dependency, you must also add the baseline application properties which it requires like 
database URL, username and password. If you don't add them, the app won't even start!

Here's how auto-configuration is described in the Spring Boot docs:

> Spring Boot auto-configuration attempts to automatically configure your Spring application based on the jar dependencies that you have added. For example, if HSQLDB is on your classpath, and you have not manually configured any database connection beans, then Spring Boot auto-configures an in-memory database.

Source: https://docs.spring.io/spring-boot/docs/2.4.x/reference/htmlsingle/#using-boot-auto-configuration

But what happens when you want to disable such auto-configured features? There may be a common approach you can use, 
like using 
`@SpringBootApplication`'s `exclude` property, e.g. `@SpringBootApplication(exclude = SomeConfigurtionHere.class)`. 
But this `exclude` property only works for configuration which is specifically auto-configuration.

In other cases, the approach required to disable a feature is completely unique to the 
Spring library or abstraction you're dealing with.

With Spring Security, the default behavior enables 
numerous security features (see [here](https://github.com/spring-projects/spring-security/blob/5.3.x/config/src/main/java/org/springframework/security/config/annotation/web/configuration/WebSecurityConfigurerAdapter.java#L210-L221) and [here](https://github.com/spring-projects/spring-security/blob/5.3.x/config/src/main/java/org/springframework/security/config/annotation/web/configuration/WebSecurityConfigurerAdapter.java#L364-L369))
including username and password-based authentication for all requests.

But in my case, the only reason I had added the Spring Security dependency was for service to service 
communication using OAuth2's Client Credentials Grant Type 
(see [this post](/oauth-client-credentials-auto-refresh-spring/) for more info).

But when I enabled `logging.level.org.springframework.security=DEBUG`, I saw that HTTP requests to the app's 
Spring Web MVC endpoints were being chained through 10 security `Filter`s which were irrelevant because 
the app isn't on the public internet and authentication was being handled by Kubernetes ingress.

After trying numerous supposed solutions to disable all these default HTTP security features, 
I came up with the solution the old-fashioned way: by digging through the `WebSecurityConfigurerAdapter` source code. 🙂

_**Warning**: Again, don't do this unless you have a good reason to. This will completely disable 
all HTTP security for your app._

```java
@Configuration
public class HttpSecurityDisabler extends WebSecurityConfigurerAdapter {

    public HttpSecurityDisabler() {
        super(true); // Disable defaults
    }
    
    @Override
    protected void configure(HttpSecurity http) {
        // Do nothing, this is just overriding the default behavior in WebSecurityConfigurerAdapter
        
    }
}
```
