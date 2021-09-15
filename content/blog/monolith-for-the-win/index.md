---
title: "Monolith For The Win"
date: "2021-09-02T02:11:00.000Z"

---

All the common wisdom says to start with a monolith and 
evolve into microservices once you know you need it. So 
why does everyone ignore this advice and reach for 
microservices, even when building a system from scratch? 
Is microservices the engineer's hammer?

// TODO - add quotes/sources

A few things come to mind:

- Default: microservices has become the default architecture. People 
don't even question it. Slight variation on this: people are used 
to working on mature systems which have already evolved to 
microservices. So when they build from scratch, they forget that 
they're making a mistake my front-loading all the complexities of 
distributed systems, the burden of maintaining N microservices 
instead of one monolith, etc. instead of focusing on business 
logic.
- Hiring: it seems obligatory these days that every job posting 
countains the word "microservices". Surely no one would dare 
create a job posting which mentions "monolith". Ironically, if 
the system were rightfully built as a monolith, it would make the 
engineers' jobs much easier than working microservices. But then 
again, those engineers may consider it bad for their careers to 
spend even a year working on a monolith before it's inevitable 
transition to microservices.

One more thing, microservices may be beneficial from the engineer's 
perspective because each engineer may feel that they are building 
their own slice of the system which they own. Similarly, if each 
engineer is given freedom to make their own design/technical decisions, 
they may feel more empowered.
