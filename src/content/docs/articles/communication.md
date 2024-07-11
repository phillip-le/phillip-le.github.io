---
title: "Communication is hard"
lastUpdated: 2024-07-11
---

One of the hardest parts of being a software engineer has always been communication. Here are some things that I've found it useful to keep in mind.

### Is it possible to XXX?

Usually, this question is asked by a non-technical audience like your project manager, product manager, or designer. 

`"Is it possible to build a grid view of these items?"`

And the answer, as an engineer, is almost always **yes**. I've found that it's natural to immediately start thinking about ways to implement it, diving into a problem-solving mindset. But, usually, what they're really asking is:

`"How much engineering effort would be required to build a grid view of these items?"`

In a perfect world, we would have as much time as possible to build the most elegant and performant product possible. In reality, we have limited time and must prioritize what we change first. When it comes to customer-facing product changes, engineers are rarely responsible for prioritizing items of work, but we are usually responsible for advising how much it would cost to build something. 

**TL;DR**

`Is it possible to XXX? => How much effort would it be to XXX?`

### Holding off on immediate commitment

Related to the previous tip, one area that I have struggled with has been committing to work on something prematurely.

A common example I encounter is when someone from another team asks me to help them with a change, which might involve reviewing their PR, helping them debug an integration between our teams, or exposing a new field in our API. I am really keen to help others and usually agree to help them out. After all, it is usually **possible** to help them with what they need. 

The main problem is that agreeing to help can set the wrong expectations. Perhaps, when you consult with your team, you realize that you don't want to expose this extra field in the API because it should be an `ID` that is only used internally within your systems, and you don't want other teams to be reliant on it. Perhaps you have now overcommitted, and your current piece of work falls behind schedule because you are busy with an ad-hoc help request. 

That's why I've found it useful to consider consulting with the team or, in general, considering my own workload and how much effort it would take to help out before agreeing to external requests.