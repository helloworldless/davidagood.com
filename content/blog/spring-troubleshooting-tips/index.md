---
title: "Spring Troubleshooting Tips" 
date: "2020-12-30T14:46:36.294Z"
description: "Tips and ideas for troubleshooting Spring issues, e.g. useful packages and classes 
places to enable debug logging"
tags: "spring,java,tips"

---

# Useful Log Points

```yaml
logging:
  level:
    org.springframework.web: DEBUG
    org.springframework.security: DEBUG
    org.springframework.security.oauth2: DEBUG
    org.springframework.boot.autoconfigure: DEBUG
```

# Circular Bean Dependency

### Example of What Can Trigger This

A `@SpringBootTest` with `@AutoConfigureMockMvc` and a static inner `@TestConfiguration` class. 
The test configuration has a `@Bean` like a customized `RestTemplate` which takes `@MockMvc` as 
a parameter.

### How To Detect It

Enable trace logging for the `DefaultListableBeanFactory`:

```yaml
logging:
  level:
    org.springframework.beans.factory.support.DefaultListableBeanFactory: TRACE
```