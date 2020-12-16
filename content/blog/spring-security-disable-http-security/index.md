---
title: How To Completely Disable HTTP Security in Spring Security 
date: "2020-12-16T16:18:08.998Z"
description: "Spring is known and loved for its convention of configuration approach. But 
this can occasionally cause a challenge when automatically enabled features need to be 
disabled. Here we see how to completely disable Spring Security's HTTP security"
---

_**Warning**: Don't do this unless you have a good reason to._

Spring is well-known for its convention over configuration approach where features works out of the box 
with sensible defaults. Part of what enables that experience is auto-configuration. Adding a Spring dependency to 
your classpath automatically enables certain features. You may have noticed this with Spring JDBC. Once you add this 
dependency, you must also add the baseline application properties which it requires like 
database URL, username and password. If you don't add them, the app won't even start!

But what happens when you want to disable said features? There may be a common approach you can use, like using 
`@SpringBootApplication`'s `exclude` property. But the `exclude` property only works for auto-configuration (which 
is a distinct, full fledged, soverign concept in Spring).

In other cases, the approach required to disable a feature is completely unique to the 
Spring library or abstraction you're dealing with.

With Spring Security, the default behavior is to enable basic, form-based, username and password authentication 
for all requests. But in my case, I just need to add the Spring Security dependency for service to service 
communication using OAuth2's Client Credentials Grant Type 
(see [this post](/oauth-client-credentials-auto-refresh-spring/) for more info).

After trying numerous supposed solutions. here's the only thing I found 
(digging through the `WebSecurityConfigurerAdapter` source) that actually works:

_**Warning**: Don't do this unless you have a good reason to._

```java
@Configuration
public class HttpSecurityDisabler extends WebSecurityConfigurerAdapter {

    public HttpSecurityDisabler() {
        super(true); // Disable defaults
    }
    
    // Do nothing
    // This just overrides the default behavior
    @Override
    protected void configure(HttpSecurity http) {
    }
}
```