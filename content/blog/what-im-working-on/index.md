---
title: "What I'm Working On"
date: "2020-09-06T23:00:20.829Z"
description: "What I'm currently working on: projects, learning, open source, etc."
---

_What I'm currently working on: projects, learning, open source, etc._

# Current

- Reading the [Rust Book](https://doc.rust-lang.org/book/) in its entirety
- Spring Boot OSS: [Sanitize entire value if property is not of URI type #23037](https://github.com/spring-projects/spring-boot/issues/23037)

# Up Next

- Tomasz Łakomy's Egghead course [Build an App with the AWS Cloud Development Kit](https://egghead.io/courses/build-an-app-with-the-aws-cloud-development-kit)
- Systems Programming with Rust
    - Specifically looking at [this guide](https://github.com/pingcap/talent-plan), the PingCAP Talent Plan

# Completed

- Basic CI/CD pipeline (deploy on commit) for davidagood.com
    - Uses AWS CodeBuild and CodePipeline
    - Follow-up: wiping S3 bucket contents is currently a post-build step
       rather than its own step in the pipeline. Looking at Step Functions or just adding a Code Pipeline
      step which calls a lambda.
    - Also need to add CloudFront cache invalidation as part of the pipeline
- [Twitter Unfollower Alerts](https://github.com/helloworldless/twitter-unfollower-alerts)
    - Plenty of follow-ups mentioned in the readme
    
    
# Would Like to Do One Day

- Haskell, specifically looking at [Practical Haskell: A Real World Guide to Programming](https://www.apress.com/gp/book/9781484244791)
