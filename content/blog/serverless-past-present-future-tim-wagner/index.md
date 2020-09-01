---
title: "Serverless: Past, Present & Future"
date: "2020-07-10T12:00:00.000Z"
description: My notes from Tim Wagner's thought-provoking talk from AWS Serverless Days 2020
---

# Origins of Serverless

1. AWS S3 as a managed storage service (2013)
    - Simple API that didn’t try to emulate traditional, on-prem file storage
    - Serverless for storage

1. PaaS
    - Lift and shift your monolith from on-prem to the cloud
    - Answered the question of how to make deploying a monolith to the cloud easier, but that was the wrong question. What we should have been asking was, how can we make compute more like S3 and less like operating an on-prem datacenter?

1. AWS Lambda (2014-2015)
    - Serverless: the compute equivalent of S3
    - Simple, asynchronous event handlers
    - The idea was that it would be based on events from other AWS services
    - New model for building apps didn’t catch on right away
    - Surprisingly one of the most popular uses from Lambda in the early days was cron jobs (automating repetitive technical tasks)

# Serverless at Present

Lots of new features coming to serverless which are making new types of applications possible and driving adoption of serverless.

Example: [EFS for Lambda](https://aws.amazon.com/blogs/compute/using-amazon-efs-for-aws-lambda-in-your-serverless-applications/) - Matches Lambda’s infinite compute capacity with infinite storage capacity, enabling up to TBs of storage for Lambda functions

The wrong questions to be asking in 2020 are:

- Can I run a function for a week?
- Can I port my Rails monolith to Lambda?
- How do you run serverless on-prem?
- Is Kubernetes Serverless?

The right question is:

> Why do developers still turn to servers and containers even though they’re complicated, even though they’re expensive, even though they’re difficult to own, operate, and maintain?”

And the answer is:

> The search for simplicity and power is far from over.

…and it’s really about finding the right balance between simplicity and flexibility.

# AWS re:invent 2019 Lambda New Features

These are leveling the playing field with containers and tipping the balance in favor of serverless when taking both simplicity and flexibility into account.

- [Provisioned Capacity](https://aws.amazon.com/about-aws/whats-new/2019/12/aws-lambda-announces-provisioned-concurrency/)
    - See also [New – Provisioned Concurrency for Lambda Functions by Danilo Poccia](https://aws.amazon.com/blogs/aws/new-provisioned-concurrency-for-lambda-functions/)
- [Introducing Amazon RDS Proxy (Preview)](https://aws.amazon.com/about-aws/whats-new/2019/12/amazon-rds-proxy-available-in-preview/)
    - See also [Using Amazon RDS Proxy with AWS Lambda by George Mao](https://aws.amazon.com/blogs/compute/using-amazon-rds-proxy-with-aws-lambda/)
- [New for AWS Lambda – Predictable start-up times with Provisioned Concurrency](https://aws.amazon.com/blogs/compute/new-for-aws-lambda-predictable-start-up-times-with-provisioned-concurrency/)
    - See also [Announcing improved VPC networking for AWS Lambda functions](https://aws.amazon.com/blogs/compute/announcing-improved-vpc-networking-for-aws-lambda-functions/)

# Tim’s Lambda Wishlist

https://medium.com/@timawagner/tims-take-re-invent-2020-serverless-wishlist-7f0756da4cd0

# Vendors Innovating in Serverless

- Stackery
- Serverless Framework
- Thundra
- stdlib
- PureSec
- Espagon
- vfunction
- Lumigo

# The Future

- Moore’s Law is dead
    - Dead for compute, but it’s alive for networking
- Makes distributed compute (e.g. AWS Lambda) more attractive

...

Tim covers much more in his talk. Continue watching [here](https://www.youtube.com/watch?v=A1bL4pHuivU&t=336s)!