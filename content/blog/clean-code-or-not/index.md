---
title: "To Code Clean or Not To Code Clean"
date: "2021-08-23T03:33:21.037Z"

---

I recently came across a post on Blind which was phrased like this: "From my experience, 
the code at XYZ top-tier tech company is garbage. So why do top-tier tech companies even 
bother hiring top talent?"

The range of responses was quite fascinating. But for the purposes of this post, I'll focus 
on the majority of responses which focused on whether clean code matters.

You see, it was only recently in my career that I became aware that clean, quality code and 
design are a topic of debate. Before, I assumed that these were universally agreed upon best 
practices.

So for a time, I was questioning: does clean code really matter? Is it a waste of time? 
Merely a hindrance to moving fast and meeting deadlines?

Well here's what I say: **clean code is the only way***. Engineers who do not believe this are simply 
ignorant.

*I can only think of a few exceptions:

1. Some early stage startup where shipping fast is an existential matter
1. Writing throwaway code
1. All the stakeholders coming to a decision to kick the can down the road 
  and make this someone else's problem for another day. This is a slippery slope. For me, the engineering team should make a strong argument against 
  in such a discussion.

I will concede that there is a tradeoff between quality and timeliness. Perfect is the enemy of 
good. In the real world, there are deadlines. The project management triangle is real. There is 
scope, quality, and timeline. That's it. Those are the only variables you have control over.

## Product Is What Natters, Not Code, Right?

This is one argument which was raised a lot in said Blind post. It sounds good at face value. 
If a company produces a great product, who cares what the code looks like, right? 

Actually, there are a few problems with this argument...

A great product should have a great user experience, which means it should have predicatable 
behavior and not have a lot of bugs. To support this, it should be well tested (bonus points 
because tests also document behavior). Quality code is by definition easy to test, and I 
would argue that part of quality code is having good test coverage. But more importantly, 
it's easier to change quality code without breaking things.

Which is a good segue into the next point: a great product may be great today, but more than 
likely it will continue to be iterated upon and improved. Poorly written code is not 
flexible. It is difficult to change and test. Therefore, future changes are likely to require 
refactors, take longer than expect, and are likely to cause other parts of the system to be 
broken unwittingly.

## Other Interesting Comments from Blind Post

If core is built well enough, or if other processes are in place, it doesn't matter if there's 
poor quality code in some places, it can be tolerated and had limited impact

They have to hire top talent, mediocre talent would not be productive, would not be able to work 
on poor quality codebase. Similarly they have to pay top dollar for the engineers to tolerate 
working on a poor quality codebase

## Bloopers

I couldn't resist incluidng a few bloopers from the Blinkd comments :)

> If you think the code is bad at {top tier tech company} then never come to X top tier tech company, it's way worse. X has the worst code ive ever seen

> all code is shit
