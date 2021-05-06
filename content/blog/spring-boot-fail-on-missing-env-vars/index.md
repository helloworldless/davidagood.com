---
title: "How to Make Spring Boot Fail on Missing Environment Variables" 
date: "2021-05-06T04:06:49.657Z"

---

## Problem

By default, Spring Boot `@ConfigurationProperties` doesn't fail when there are 
missing/unresolved environment variables defined in application properties. 
Instead, the property will be bound with the placeholder literal, e.g. `"${ENV_VAR}"`.

Here's a simple way to make your app fail to start if a missing/unresolved 
environment variable placeholder is detected using JSR-303 bean validation with 
Hibernate validator.

## Solution

You will need to add dependency: `org.springframework.boot:spring-boot-starter-validation`.

```yaml
app:
  secret: ${ENV_VAR}
```

```java
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;
import javax.validation.constraints.AssertTrue;
import static org.springframework.util.StringUtils.hasText;

@Validated
@ConfigurationProperties("app")
public class Config {

    private String secret;

    @AssertTrue
    boolean isSecretValid() {
        return hasText(secret) && !(secret.startsWith("${") && secret.endsWith("}"));
    }

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

}
```
See full code on GitHub [here](https://github.com/helloworldless/spring-boot-fail-missing-env-var).

## Example Failure Message

```text
2021-05-05 20:48:32.579 ERROR 89318 --- [           main] o.s.b.d.LoggingFailureAnalysisReporter   : 

***************************
APPLICATION FAILED TO START
***************************

Description:

Binding to target org.springframework.boot.context.properties.bind.BindException: Failed to bind properties under 'app' to com.davidagood.Config failed:

    Property: app.secretValid
    Value: false
    Reason: must be true


Action:

Update your application's configuration
```



