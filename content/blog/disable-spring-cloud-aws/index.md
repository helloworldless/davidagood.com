---
title: "How to Disable Spring Cloud AWS" 
date: "2021-04-25T04:36:34.286Z"

---

If you're using Spring Cloud AWS, it's likely you'll want to disable it when running 
locally and for `@SpringBootTest` integration tests.

The solution depends on which version of Spring Cloud AWS you're using. The difference 
between the current version and "legacy" version of the library is explained really well
[here](https://awspring.io/learn/introduction/#versions).

## Spring Cloud AWS 2.3.0 And Later

A configuration property, `cloud.aws.sqs.enabled`, has been added for this as of 2.3.0. 
Below is the `application.yaml` for disabling this when running locally.

For more details, including how to disable this for `@SpringBootTest`, 
check out the `spring-cloud-aws` module of the
[GitHub repo](https://github.com/helloworldless/disable-spring-cloud-aws).

```yaml
cloud:
  aws:
    stack:
      auto: false
    region:
      # Use this to get the region from the Default Region Provider Chain
      # https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/java-dg-region-selection.html#default-region-provider-chain
      auto: true
      use-default-aws-region-chain: true
      # Use this if you want to set the region manually
      # auto: false
      # static: us-east-1
    credentials:
      # Use this to get the credentials from the Default Credential Provider Chain
      # https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/credentials.html#credentials-default
      use-default-aws-credentials-chain: true
      # Use this if you want to set the credentials manually
      # access-key:
      # secret-key:

logging:
  level:
    io.awspring.cloud: debug
    # Ignore scary but innocuous warnings from these AWS dependencies as recommended in the Spring Cloud AWS Reference Docs
    com.amazonaws.util.EC2MetadataUtils: error
    com.amazonaws.internal.InstanceMetadataServiceResourceFetcher: error

app:
  sqs-queue-name: test-queue

---
spring:
  config:
    activate:
      on-profile: local

cloud:
  aws:
    sqs:
      enabled: false
```

## Spring Cloud AWS 2.2.5 And Before

The easiest way I've found is by disabling the 
`MessagingAutoConfiguration` auto-configuration. Below is the 
`application.yaml` for disabling this when running locally.

There are a few other solutions you can check in
`spring-cloud-aws-legacy` module of the
[GitHub repo](https://github.com/helloworldless/disable-spring-cloud-aws) which also 
includes how to disable this for `@SpringBootTest`.

```yaml
cloud:
  aws:
    stack:
      auto: false
    region:
      # Use this to get the region from the Default Region Provider Chain
      # https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/java-dg-region-selection.html#default-region-provider-chain
      auto: true
      use-default-aws-region-chain: true
      # Use this if you want to set the region manually
      # auto: false
      # static: us-east-1
    credentials:
      # Use this to get the credentials from the Default Credential Provider Chain
      # https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/credentials.html#credentials-default
      use-default-aws-credentials-chain: true
      # Use this if you want to set the credentials manually
      # access-key:
      # secret-key:

logging:
  level:
    org.springframework.cloud.aws: debug
    # Ignore scary but innocuous warnings from these AWS dependencies as recommended in the Spring Cloud AWS Reference Docs
    com.amazonaws.util.EC2MetadataUtils: error
    com.amazonaws.internal.InstanceMetadataServiceResourceFetcher: error

app:
  sqs-queue-name: test-queue

---
spring:
  profiles: local
  autoconfigure:
    exclude: org.springframework.cloud.aws.autoconfigure.messaging.MessagingAutoConfiguration
```

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
