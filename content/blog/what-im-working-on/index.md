---
title: "What I'm Working On"
date: "2020-09-06T23:00:20.829Z"
description: "What I'm currently working on: personal projects, learning, open source, etc."
---

_What I'm currently working on: personal projects, learning, open source, etc._

# In Progress

- Tomasz Łakomy's Egghead course [Build an App with the AWS Cloud Development Kit](https://egghead.io/courses/build-an-app-with-the-aws-cloud-development-kit)
- Reading the [Rust Book](https://doc.rust-lang.org/book/) in its entirety

# Up Next

- Systems Programming with Rust
    - Specifically looking at [this guide](https://github.com/pingcap/talent-plan), the PingCAP Talent Plan
- DynamoDB single table design, streams, etc.
    - [DynamoDB Office Hours | Online banking service model with Rick Houlihan](https://www.twitch.tv/videos/689452191)
    - [Alex DeBrie](https://www.alexdebrie.com/) resources
    - [Building aggregations with DynamoDB Streams](https://acloudguru.com/blog/engineering/building-aggregations-with-dynamodb-streams)
- Set up a simple landing page for helloworldless.com
    - Ideally, I'd like to see how far I can push infrastructure-as-code using AWS CDK for DNS, static hosting, and continuous integration, all in one repository

# Completed

- Spring Boot Open Source Contribution
    - [Improve sanitization for list of URI types](https://github.com/spring-projects/spring-boot/commit/775f0fa8613c5360bac2159f4c45089733049587)
- Basic CI/CD pipeline (deploy on commit) for davidagood.com
    - Uses AWS CodeBuild and CodePipeline
    - Completed follow-ups:
        - Wipe S3 bucket via Lambda instead of in CodeBuild buildspec post-build step
        - Invalidate CloudFront distribution via Lambda as part of the pipeline
- [Twitter Unfollower Alerts](https://github.com/helloworldless/twitter-unfollower-alerts)
    - Plenty of follow-ups mentioned in the readme
    
    
# Would Like to Do One Day

- Revisit Haskell, specifically looking at [Practical Haskell: A Real World Guide to Programming](https://www.apress.com/gp/book/9781484244791)
- Revisit Ruby/Rails
- Revisit RedwoodJS
- Create a proof of concept of a declarative, cache-aside in Java, e.g. using RxJava
    - Always wanted to code this up after seeing 1000 lines of imperative code, every single method repeating the same boilerplate: if key in cache return value, else get key from database, update cache, and return value
- Python + Machine Learning
    - Good tweet from @svpino about how to go about it [here](https://twitter.com/svpino/status/1302107301424369664?s=20)
- Build something with Vert.x or Reactive Spring
