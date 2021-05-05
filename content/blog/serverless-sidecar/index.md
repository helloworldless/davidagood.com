---
title: "Serverless Sidecar Pattern for Offloading Auxiliary Logic" 
date: "2021-05-05T01:52:06.085Z"

---

Had this idea and just getting it down on paper.

## Concept

- Your core business logic lives in containerized application, running on Kubernetes. 
  (your org or team is not fully bought in to cloud native and serverless :) 
- Your write serverless functions (e.g. AWS Lambda) to handle auxiliary logic
- The serverless functions can be triggered via DynamoDB streams, events, etc.
- How far can or should this be taken?
- Serverless functions calling the core application's REST APIs? 
