---
title: Basics of Using DynamoDB with Java
date: "2020-12-01T01:30:00.000Z"
description: "A work in progress: open questions, lessons learned, tips, etc. 
from working with DynamoDB and Java"
---

_WIP: open questions, lessons learned, tips, etc. from working with DynamoDB in Java._

# Different SDKs

Below are the official SDKs and clients available for Java. Beware of 
different SDKs especially when researching issues, e.g. before digging 
into documentation, check which SDK or which version it is for.
 
- AWS SDK for Java v2
    - [GitHub](https://github.com/aws/aws-sdk-java-v2)
    - [AWS SDK for Java 2.x Developer Guide](https://docs.aws.amazon.com/sdk-for-java/v2/developer-guide/welcome.html)
- Enhanced Client for v2 SDK
    - [GitHub](https://github.com/aws/aws-sdk-java-v2/tree/master/services-custom/dynamodb-enhanced)
- AWS SDK for Java v1
    - [GitHub](https://github.com/aws/aws-sdk-java)
    - [Set up the AWS SDK for Java](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/setup-install.html)
- DynamoDBMapper for v1 SDK
    - [Developer Guide](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBMapper.html)
    - [GitHub](https://github.com/aws/aws-sdk-java/blob/master/aws-java-sdk-dynamodb/src/main/java/com/amazonaws/services/dynamodbv2/datamodeling/DynamoDBMapper.java)

Watch out for transactional operations as well. They have their own classes, like `Get` and `Put`

Just as with Java, NodeJS and Python have older, lower-level SDKs which require you 
to write DynamoDB JSON, like `{'Name': {'S': 'Jack}}`, and newer SDKs which take 
care of the datatype "wrapping" for you so you can just write: `{'Name': 'Jack'}`

# AWS SDK v2 Java

## Feature Requests

### Open

- [DynamoDB Enhanced Client: Provide JSON Attribute Converter Out of the Box](https://github.com/aws/aws-sdk-java-v2/issues/2162)
    - Working on this myself
- [Enhanced DynamoDB annotations are incompatible with Lombok](https://github.com/aws/aws-sdk-java-v2/issues/1932#issuecomment-733174524)
    - Specifically, I added onto this feature request to support derived fields on immutable value class entities

### Resolved

- [DynamoDB Enhanced Client: Support Querying and Marshalling Heterogeneous Item Collections](https://github.com/aws/aws-sdk-java-v2/issues/2151)
  - Once I understand the SDK codebase better, I would ideally like to contribute this myself
  - See how to do this here: 