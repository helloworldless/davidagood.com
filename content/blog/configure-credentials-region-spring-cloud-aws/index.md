---
title: "How to Configure AWS Credentials and Region in Spring Cloud AWS" 
date: "2021-04-30T15:47:10.108Z"

---

When using Spring Cloud AWS, getting the AWS credentials and region configuration 
properties right can be tricky.

The preferred option is to use the AWS 
[Default Credential Provider Chain](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/credentials.html#credentials-default) 
and [Default Region Provider Chain](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/java-dg-region-selection.html#default-region-provider-chain) 
which results in the required properties 
being sourced just like the AWS SDK does by default.


```yaml
cloud:
  aws:
    stack:
      auto: false
    region:
      auto: true
      use-default-aws-region-chain: true
    credentials:
      use-default-aws-credentials-chain: true
```

Alternatively, you can manually configure the required properties directly in your application 
properties like this:

```yaml
cloud:
  aws:
    stack:
      auto: false
    region:
       auto: false
       static: <region-here>
    credentials:
       access-key: <access-key-here>
       secret-key: <secret-key-here>
```