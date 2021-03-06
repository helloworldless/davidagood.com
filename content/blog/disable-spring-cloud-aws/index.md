---
title: "How to Disable Spring Cloud AWS" 
date: "2021-04-25T04:36:34.286Z"

---

If you're using Spring Cloud AWS, it's likely you'll want to disable it when running 
locally and for `@SpringBootTest` integration tests.

The solution depends on which version of Spring Cloud AWS you're using. The difference 
between the current version and "legacy" version of the library is explained really well
[here](https://awspring.io/learn/introduction/#versions).

As a pre-requisite, make sure you have your AWS credentials and AWS region 
configured properly in the Spring Cloud AWS application properties. 
See [How to Configure AWS Credentials and Region in Spring Cloud AWS](https://davidagood.com/configure-credentials-region-spring-cloud-aws).

## Spring Cloud AWS 2.3.0 And Later

Configuration properties have been added for this exact purpose since 2.3.0. Here are the properties which are currently availbable:

- `cloud.aws.sqs.enabled`
- `cloud.aws.sns.enabled`
- `cloud.aws.rds.enabled`
- `cloud.aws.elasticache.enabled`
- `cloud.aws.mail.enabled` (or `spring.cloud.aws.ses.enabled`)
- `cloud.aws.stack.enabled`
- `cloud.aws.instance.data.enabled`
- `spring.cloud.aws.security.cognito.enabled`

For example, here is how to disable SQS when running locally.

Add these properties to your `application.yaml`:

```yaml
spring:
  config:
    activate:
      on-profile: local

cloud:
  aws:
    sqs:
      enabled: false
```

Use `@Profile` to enable/disable configuration conditionally based on the Spring active profiles:

```java
import io.awspring.cloud.messaging.config.QueueMessageHandlerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.handler.annotation.support.PayloadMethodArgumentResolver;

import java.util.Collections;

@Profile("!(local | test)")
@Configuration
class SqsConfig {

    @Bean
    QueueMessageHandlerFactory queueMessageHandlerFactory() {
        QueueMessageHandlerFactory factory = new QueueMessageHandlerFactory();
        MappingJackson2MessageConverter messageConverter = new MappingJackson2MessageConverter();
        messageConverter.setStrictContentTypeMatch(false);
        factory.setArgumentResolvers(Collections.singletonList(new PayloadMethodArgumentResolver(messageConverter)));
        return factory;
    }

}
```

For an example of how to disable this for `@SpringBootTest`, 
check out the `spring-cloud-aws` module of the
[GitHub repo](https://github.com/helloworldless/disable-spring-cloud-aws).

## Spring Cloud AWS 2.2.5 And Before

The easiest way I've found is to exclude auto-configuration for the service you want to disable. You will need to find the appropriate auto-configuration class in this package: `org.springframework.cloud.aws.autoconfigure`.

Here's an example of how to disable SQS when running locally.

Add these properties to your `application.yaml`:

```yaml
spring:
  profiles: local
  autoconfigure:
    exclude: org.springframework.cloud.aws.autoconfigure.messaging.MessagingAutoConfiguration
```

Use `@Profile` to enable/disable configuration conditionally based on the Spring active profiles:

```java
import org.springframework.cloud.aws.messaging.config.QueueMessageHandlerFactory;
import org.springframework.cloud.aws.messaging.config.annotation.EnableSqs;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.handler.annotation.support.PayloadMethodArgumentResolver;

import java.util.Collections;

@EnableSqs
@Profile("!(local | test)")
@Configuration
class SqsConfig {

    @Bean
    QueueMessageHandlerFactory queueMessageHandlerFactory() {
        QueueMessageHandlerFactory factory = new QueueMessageHandlerFactory();
        MappingJackson2MessageConverter messageConverter = new MappingJackson2MessageConverter();
        messageConverter.setStrictContentTypeMatch(false);
        factory.setArgumentResolvers(Collections.singletonList(new PayloadMethodArgumentResolver(messageConverter)));
        return factory;
    }

}
```

There are a few other solutions you can check in
`spring-cloud-aws-legacy` module of the
[GitHub repo](https://github.com/helloworldless/disable-spring-cloud-aws) which also 
includes how to disable this for `@SpringBootTest`.

## Errors Which I've Come Across While Attempting to Disable Spring Cloud AWS 

```text
Caused by: org.springframework.messaging.core.DestinationResolutionException: The queue does not exist.; nested exception is com.amazonaws.services.sqs.model.QueueDoesNotExistException: The specified queue does not exist for this wsdl version. (Service: AmazonSQS; Status Code: 400; Error Code: AWS.SimpleQueueService.NonExistentQueue; Request ID: 1710081b-446b-5ec5-a4d5-50e5b560aaf1; Proxy: null)
	at io.awspring.cloud.messaging.support.destination.DynamicQueueUrlDestinationResolver.toDestinationResolutionException(DynamicQueueUrlDestinationResolver.java:105)

```

```text
Caused by: com.amazonaws.services.sqs.model.QueueDoesNotExistException: The specified queue does not exist for this wsdl version. (Service: AmazonSQS; Status Code: 400; Error Code: AWS.SimpleQueueService.NonExistentQueue; Request ID: 1710081b-446b-5ec5-a4d5-50e5b560aaf1; Proxy: null)
	at com.amazonaws.http.AmazonHttpClient$RequestExecutor.handleErrorResponse(AmazonHttpClient.java:1819)
```

```text
Caused by: org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 'simpleMessageListenerContainer' defined in class path resource [org/springframework/cloud/aws/messaging/config/annotation/SqsConfiguration.class]: Unsatisfied dependency expressed through method 'simpleMessageListenerContainer' parameter 0; nested exception is org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'amazonSQS' defined in class path resource [org/springframework/cloud/aws/messaging/config/annotation/SqsClientConfiguration.class]: Bean instantiation via factory method failed; nested exception is org.springframework.beans.BeanInstantiationException: Failed to instantiate [com.amazonaws.services.sqs.buffered.AmazonSQSBufferedAsyncClient]: Factory method 'amazonSQS' threw exception; nested exception is java.lang.IllegalStateException: There is no EC2 meta data available, because the application is not running in the EC2 environment. Region detection is only possible if the application is running on a EC2 instance
	at org.springframework.beans.factory.support.ConstructorResolver.createArgumentArray(ConstructorResolver.java:799)
```

```text
Caused by: org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'simpleMessageListenerContainer' defined in class path resource [org/springframework/cloud/aws/messaging/config/annotation/SqsConfiguration.class]: Invocation of init method failed; nested exception is com.amazonaws.SdkClientException: Unable to load AWS credentials from any provider in the chain: [com.amazonaws.auth.EC2ContainerCredentialsProviderWrapper@1405c7dc: Failed to connect to service endpoint: , com.amazonaws.auth.profile.ProfileCredentialsProvider@552b20e: profile file cannot be null]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.initializeBean(AbstractAutowireCapableBeanFactory.java:1799)
```

```text
Caused by: org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'simpleMessageListenerContainer' defined in class path resource [org/springframework/cloud/aws/messaging/config/annotation/SqsConfiguration.class]: Bean instantiation via factory method failed; nested exception is org.springframework.beans.BeanInstantiationException: Failed to instantiate [org.springframework.cloud.aws.messaging.listener.SimpleMessageListenerContainer]: Factory method 'simpleMessageListenerContainer' threw exception; nested exception is org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'queueMessageHandler' defined in class path resource [org/springframework/cloud/aws/messaging/config/annotation/SqsConfiguration.class]
```

```text
org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'simpleMessageListenerContainer' defined in class path resource [io/awspring/cloud/autoconfigure/messaging/SqsAutoConfiguration$SqsConfiguration.class]: Invocation of init method failed; nested exception is com.amazonaws.services.sqs.model.AmazonSQSException: The security token included in the request is invalid (Service: AmazonSQS; Status Code: 403; Error Code: InvalidClientTokenId; Request ID: ...; Proxy: null)
    at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.initializeBean(AbstractAutowireCapableBeanFactory.java:1786)
```

```text
org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'simpleMessageListenerContainer' defined in class path resource [org/springframework/cloud/aws/messaging/config/annotation/SqsConfiguration.class]: Invocation of init method failed; nested exception is com.amazonaws.services.sqs.model.AmazonSQSException: The security token included in the request is invalid (Service: AmazonSQS; Status Code: 403; Error Code: InvalidClientTokenId; Request ID: ...; Proxy: null)
```