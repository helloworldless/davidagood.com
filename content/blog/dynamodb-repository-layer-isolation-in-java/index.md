---
title: "DynamoDB Repository Layer Isolation in Java" 
date: "2021-01-19T16:30:22.789Z"
description: "A simple strategy for maintaining isolation between a DynamoDB repository layer 
and the rest of the application which permits a seamless transition to a different database provider"
---

This is based on this repo: https://github.com/helloworldless/dynamodb-java-sdk-v2.

Here are the details of how we maintain isolation:

1. The `Repository` interface is public and is implemented by the package-private `DynamoDbRepository`
1. The `Repository` is defined in terms of public, database-agnostic value classes 
   (in other words, nothing related to DynamoDB here)
1. The `DynamoDbRepository` uses [MapStruct](https://mapstruct.org/) to effortlessly convert the 
  database-agnostic value classes into DynamoDB entities (`@DynamoDbBean`)
1. The DynamoDB entities (`@DynamoDbBean`) also live inside the repository package. 
   They are public but should ideally be package-private. However, making them non-public 
   would require switching to manually wiring the DynamoDB schema as opposed to using the 
   SDK's more convenient, annotation-driven schema capability.
