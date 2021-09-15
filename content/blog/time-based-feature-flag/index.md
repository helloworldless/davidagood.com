---
title: "Time-Based Feature Flags (Please Don't)"
date: "2021-09-14T15:30:00.000Z"
---

I recently heard of someone adding a time-based feature 
flag. So for example, it overrides some behavior until 
`2021-09-15T15:30:00.000Z`, after which it is no longer 
effective.

That's way too clever, I thought. But why?

Let's assume you can accurately predict the datetime after which 
the feature flag should no longer be effective, which by the way I 
highly doubt you can accurately predict it. Requirements change. 
All the time.

But here's the more important point: imagine you're troubleshooting 
a production issue. You know it worked yesterday. But today 
it's mysteriously not working. The first thing you would do is 
look for code changes which were released into production since 
yesterday. But with a time-based feature flag, you won't find 
any such change. In that sense, a time-based feature flag is like 
a ticking time bomb. Whoever is troubleshooting that issue will be 
banging their head against the wall.

To prove the point, imagine the time-based feature flag was added one 
year ago by someone who is no longer on the team. The knowledge of that 
feature flag will likely have been lost.

Perhaps the fact that someone is reaching for a time-based 
feature flag is actually a consequence of not having the 
capability to change feature flags at runtime.

By the way, the scenario I described above is a good reminder 
that if you do have the capability to change feature flags 
at runtime, you must keep an audit of all changes and, 
depending on your environment/industry, the ability to change 
feature flags should be locked down to a privileged role.
