---
title: "Autograde AI"
subtitle: "The TA that never sleeps"
summary: "The grading tool I built when 400+ Java and Python submissions landed on my desk. It runs every submission against real test suites, applies one rubric with zero drift, and drafts first pass feedback with a local LLM. Manual grading effort fell 35% and students got answers while the assignment was still fresh."
cover: "/covers/autograde.svg"
tech: ["Python", "FastAPI", "Redis", "Ollama", "Docker", "pytest", "Java", "Prometheus & Grafana"]
featured: true
order: 1.75
github: "https://github.com/sushantlokhande14/autograde-ai"
---

## Problem

Grading at scale is where good feedback goes to die. Across the three CS courses I supported as a TA at SJSU, assignments arrived in batches of hundreds, 400+ Java and Python submissions in a cycle at the peak. Graded by hand, that is days of repetitive work, feedback that lands after students have already moved on, and a rubric that quietly drifts depending on who grades and when.

There is also a failure mode nobody warns you about: student code is adversarial by accident. Submissions crash, loop forever, print megabytes of debug output, or write to paths they should not. Any grader that just runs them in a loop dies on submission twelve.

## Approach

![Autograde AI architecture](/diagrams/autograde-arch.svg)

A batch pipeline with one rule at each stage:

- **Ingest.** A Python CLI takes the course's bulk submission export, normalizes the mess (folder layouts, filenames, duplicate resubmissions, the works) and produces one clean work item per student.
- **Run.** Every submission executes in its own child process against the instructor's real test suites, pytest for Python and JUnit for Java. Each run gets a hard timeout and a cap on captured output, so a crash, an infinite loop, or a print storm costs that one submission its points, never the batch. A worker pool runs submissions in parallel, and a full batch finishes over a coffee instead of an afternoon.
- **Score.** The rubric lives in a config file that maps test outcomes to points, including partial credit. Encoding it once means it is applied identically to student 1 and student 400, and a rubric argument becomes a one-line diff instead of a re-grade meeting.
- **Record.** Every run leaves a structured result: scores, failed cases, and the captured error output. That record is the quiet superpower, because when a rubric needs fixing mid-cycle, every submission can be re-scored from stored results without re-running a single line of student code.
- **Draft feedback, do not decide.** An LLM running locally through Ollama turns each submission's failure pattern into a first pass written comment, pointing at the failing test and the likely cause. Local models matter here for a simple reason: student code never leaves the machine. A TA reviews and edits every comment before a student sees it. The model saves the typing; the human owns the grade.
- **Serve.** Results go out through a small FastAPI layer with Redis caching in front, so the gradebook CSV and per-student breakdowns are one fast request away, and the hot lookups right after grades post never touch the disk.
- **Watch.** Prometheus scrapes the runner and the API, and Grafana dashboards show batch health, run latency, and cache hit rate at a glance, so a stuck batch announces itself instead of being discovered at midnight.
- **Ship.** The whole stack is containerized: the API, Redis, Ollama, Prometheus, and Grafana come up together with one Docker Compose command, so the tool runs the same on a lab machine as on a laptop.

## The stack

| Piece | Choice | Why |
| :-- | :-- | :-- |
| Orchestration | Python CLI | one command grades an entire batch |
| Python tests | pytest | instructor suites run unmodified |
| Java tests | JUnit | the same idea on the Java side |
| Isolation | child processes, hard timeouts, output caps | one bad submission cannot stall 399 others |
| Parallelism | worker pool (`concurrent.futures`) | batches finish in minutes, not hours |
| Run records | SQLite store + CSV export | re-score history without re-running code |
| Feedback LLM | local models via Ollama | drafts never leave the machine, student code stays private |
| API layer | FastAPI on Uvicorn | gradebook and per-student results, one request away |
| Cache | Redis | hot lookups right after grades post skip the disk |
| Metrics | Prometheus | scrapes the runner and the API |
| Dashboards | Grafana | batch health, run latency, cache hit rate at a glance |
| Packaging | Docker + Docker Compose | API, Redis, Ollama, Prometheus, Grafana up in one command |

## Result

Manual evaluation effort dropped 35% across the three courses, and feedback that used to take days started going back while the assignment was still fresh. Consistency stopped being a debate, because the rubric is code, and regrades became cheap, because stored results can be re-scored in seconds. The hours the tooling saved went where they actually matter: mentoring 250+ students through debugging sessions, code reviews, and office hours instead of re-running their code by hand.
