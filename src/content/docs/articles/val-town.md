---
title: 'Getting started with programming'
lastUpdated: 2025-02-17
---

How to get started with programming is always an interesting question to me. For context, I did a classic three year computer science degree. While I was an avid gamer and played around with networking while trying to setup my own Minecraft servers as a kid, I never really learned to program.

So, you could go to university and do a three year degree in computer science and learn how to program. Harvard offers similar free online courses like the classic [CS50](https://cs50.harvard.edu/x/2025/) covering the fundamentals of computer science.

<details>
<summary>CS50 Course Summary</summary>

- Week 0 Scratch
- Week 1 C
- Week 2 Arrays
- Week 3 Algorithms
- Week 4 Memory
- Week 5 Data Structures
- Week 6 Python
- Week 7 SQL
- Week 8 HTML, CSS, JavaScript
- Week 9 Flask

</details>

But, how did I actually learn at university? I think for me, it was about being presented with a structured problem in the form of assignments and having the curiosity to want to solve the problems. While the theory presented in lectures was somewhat useful, I think they aren't the most important thing when getting started.

So, how else could you get started?

I think one of the things that experienced software engineers underestimate now is how inaccessible programming can be for beginners. One of the things that makes it inaccessible is the strictness of the syntax. For a beginner, I would relate it to learning to use a calculator. Fundamentally, a calculator is a very dumb device. If you are missing a bracket then the calculator won't understand what you mean.

```sh
>(5 + 3 =
Error
```

When your computer is interpreting your code, it is also very dumb and will not understand what you mean. A classic example is missing a semicolon.

```sh
>print("Hello, world!")
Error
```

In some programming languages, semicolons denote the end of a statement. Without it, the computer will assume that the statement is not complete.

Not only is programming very strict with syntax, it is also very unforgiving in its error messages. They are often confusing and without experience it's very hard to know how to fix the problem. In university, this is usually where we would get stuck and ask a tutor for help or spend a while googling error messages.

Nowadays, an LLM like ChatGPT or Claude could serve as the tutor when helping you debug the problem. But, perhaps one of the problems with this approach is that it encourages people to glaze over the error messages and not actually understand the problem. A mistake I see a lot is when someone comes to me with an error message which is actually very helpful but they have not tried to understand the problem.

At a conference I attended, there was a great talk on a platform called [Hedy](https://www.hedy.org/). Here's a [link to a recording of the talk](https://youtu.be/ztdxlkmxpIQ?feature=shared). It's a platform that gradually introduces the syntax of Python over a series of short exercises. What's interesting is that they've made the initial levels incredibly simple and intuitive, with the basic syntax following natural language with no case sensitivity or need for brackets. Gradually, the platform introduces the syntax of Python such as requiring brackets or needing specific casing. The platform also has custom error messages which are specifically tailored for beginners so that they can understand where they went wrong. By the end, the student is writing proper Python code. What's really nice as well is that this platform is purely a web application and so doesn't require any installation, making it even more accessible.

After learning the syntax of Python, I think you would gain a deeper appreciation for attention to detail. After this, I'm not sure how you would transition into learning JavaScript but I think a really cool platform to fuel your curiosity is [Val Town](https://www.val.town/). It's a free web based platform that lets you write JavaScript snippets and they handle running the code for you. This means that you don't need to worry about setting up your own environment and it solves one of the biggest problems I had with my university courses: you can actually deploy your code.

For context, the ultimate outcome for most assignments in university is a program that might be a little toy game that fundamentally can only run on your own computer. It's just not exciting to share with your friends if you have to bring them to your computer. The art of deploying your code is a skill that is definitely useful to learn but is likely way too challenging for a beginner to figure out.

So, Val Town solves the fundamental problem of how to deploy your code by making it simple. All you need to do is write the code snippet and how to run it. Val Town supports a number of different types of ways to run the code including:

- Scripts which are manually run
- HTTP which can be used to build websites
- Cron which can be used to run code on a schedule
- Email which can be used to handle incoming emails
