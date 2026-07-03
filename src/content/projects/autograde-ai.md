---
title: "Autograde AI"
subtitle: "The TA that never sleeps"
summary: "The grading tool I built when 400+ Java and Python submissions landed on my desk. It runs every submission against real test suites, applies one rubric with zero drift, and drafts first pass feedback for review. Manual grading effort fell 35% and students got answers while the assignment was still fresh."
cover: "/covers/autograde.svg"
tech: ["Python", "pytest", "Java", "LLMs"]
featured: true
order: 1.75
---

## Problem

Grading at scale is where good feedback goes to die. Across the three CS courses I supported as a TA at SJSU, assignments arrived in batches of hundreds, 400+ Java and Python submissions in a cycle at the peak. Graded by hand, that is days of repetitive work, feedback that lands after students have already moved on, and a rubric that quietly drifts depending on who grades and when.

## Approach

- **A test harness runs every submission.** Python work runs against pytest suites, Java work against instructor unit tests, each submission in its own isolated run with a timeout, so one crashing or infinite looping program cannot stall the batch.
- **The rubric is encoded once** and applied identically to every student. Scores, failed cases, and error output roll up into a gradebook ready report per submission, so a grader reviews results instead of reproducing them.
- **An LLM drafts the first pass of written feedback** from each submission's failure pattern, pointing at the failing test and the likely cause. Every comment is reviewed by a human before it reaches a student; the model drafts, it does not decide.

## Result

Manual evaluation effort dropped 35% across the three courses, and feedback that used to take days started going back while the assignment was still fresh. The hours the tooling saved went where they actually matter: mentoring 250+ students through debugging sessions, code reviews, and office hours instead of re-running their code by hand.
