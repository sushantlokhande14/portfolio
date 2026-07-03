---
title: "Autograde AI"
subtitle: "The TA that never sleeps"
summary: "The grading platform I designed after 400+ Java and Python submissions landed on my desk as a TA. Six specialized agents grade in parallel under Temporal orchestration, a confidence gate routes only the shaky grades to a human, and it runs local-first, so student work never leaves the machine."
cover: "/covers/autograde.svg"
tech: ["Python", "FastAPI", "Temporal", "Kafka", "gRPC", "Postgres", "Redis", "Qdrant", "Ollama", "Next.js", "Docker"]
featured: true
order: 1.75
github: "https://github.com/sushantlokhande14/grademesh"
---

## Problem

Grading at scale is where good feedback goes to die. Across the three CS courses I supported as a TA at SJSU, assignments arrived in batches of hundreds, 400+ Java and Python submissions in a cycle at the peak — and each zip is structurally chaos: nested folders, inconsistent filenames, PDFs next to notebooks next to raw code next to photos of handwritten work. Graded by hand, that is days of repetitive work, feedback that lands after students have moved on, and a rubric that quietly drifts depending on who grades and when.

There is also a failure mode nobody warns you about: student code is adversarial by accident. Submissions crash, loop forever, print megabytes of debug output, or write to paths they should not. Any grader that just runs them in a loop dies on submission twelve.

## Approach

![Autograde AI architecture](/diagrams/autograde-arch.svg)

A local-first, agent-orchestrated pipeline. The design rule everywhere: deterministic where possible, LLM where necessary.

- **Normalize before anything grades.** A parser pool (gRPC services) turns seven file formats — PDF, notebooks, code, images, docx, text, and the "something weird" bucket — into one canonical artifact stream. An LLM-assisted QuestionMapper decides which rubric question each artifact answers, and low-confidence mappings stop for instructor confirmation, because mis-mapping an answer is the worst error in the whole system.
- **Orchestrate like production.** A Kafka event bus (replayable, multi-consumer — re-run an entire batch through a new grader version without re-ingesting) feeds Temporal, which runs one durable workflow per student: retries, timeouts, and human-in-the-loop pauses handled by the engine instead of hand-rolled state machines.
- **Six specialized agents grade in parallel:** theory (RAG-grounded against course materials in Qdrant), code execution (sandboxed in Docker + gVisor — untrusted student code never touches the host), code style (Ruff and mypy plus LLM judgment), derivation (SymPy where possible, LLM for the rest), figures, and plagiarism (n-gram overlap plus embedding similarity). A CrossChecker flags inconsistencies and a FeedbackSynthesizer writes the student-facing narrative.
- **Confidence is a first-class output.** Every grade carries a calibrated confidence. High-confidence grades auto-approve; the rest land in a review queue sorted by doubt, where the TA approves, edits, or triggers a regrade. Every grade is a three-click audit: which agent, which prompt, which retrieval, which sandbox run.
- **Privacy at the perimeter.** Local models by default — Qwen 2.5 32B served through Ollama or vLLM — with a hosted-Claude toggle that is off unless explicitly enabled. Real names never enter the grading pipeline: hashed IDs everywhere, with the identity mapping in a separate Postgres schema behind row-level security.
- **Measured, not vibes.** A 100-submission gold set, hand-graded twice, benchmarks every grader on agreement, Brier-scored confidence calibration, auto-approve rate, and cost per grade — against a zero-shot single-call baseline, so the architecture has to earn its complexity.

## The stack

| Piece | Choice | Why |
| :-- | :-- | :-- |
| Frontend | Next.js 15 + Tailwind + shadcn/ui | review pages must feel instant; server components help |
| API | GraphQL (Apollo) over FastAPI, WebSocket subscriptions | grading data is deeply nested; one schema beats a dozen REST endpoints |
| Inter-service | gRPC + Protobuf | typed, high-volume orchestrator-to-agent traffic; the schema is the contract |
| Event bus | Kafka (Redpanda in dev) | multi-consumer replay: re-run a batch through a new grader version |
| Workflow engine | Temporal | retries, timeouts, human-in-the-loop pauses, one durable workflow per student |
| Primary DB | Postgres 16, two schemas, row-level security | real names never enter the grading pipeline |
| Cache | Redis | prompt cache, retrieval cache, rate limits, sandbox locks |
| Vector store | Qdrant | RAG-grounded rubric scoring over course materials |
| Object store | MinIO (S3 API) | raw uploads, artifacts, sandbox logs — immutable after write |
| Sandbox | Docker + gVisor (Firecracker as target) | untrusted student code, no network, hard wall-clock limits |
| LLM runtime | Qwen 2.5 32B via Ollama / vLLM, Claude toggle | local-first: student work never leaves the machine |
| Observability | OpenTelemetry → Prometheus + Grafana (Loki, Tempo) | every LLM call is a span with tokens, latency, cost, cache status |
| Packaging | Docker Compose · uv + pnpm workspaces | the whole stack comes up in one command |

## Result

The pipeline this grew out of already cut manual evaluation effort 35% across three real courses — hours that went back into mentoring 250+ students through debugging sessions and code reviews instead of re-running their code by hand. The platform version is built to a production bar and graded like one: a hand-built gold eval set holds every agent to 90%+ agreement on theory and 95%+ on code execution, Brier-scored calibration under 0.15, and a 70–80% auto-approve rate — with any grade an instructor doubts one click from the exact prompt, retrieval, and sandbox run that produced it. Built local-first on synthetic and self-generated coursework; real student data never enters the system.
