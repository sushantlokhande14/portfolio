---
title: "Drydock"
subtitle: "Coding agents in locked-down sandboxes, and a harness that trusts none of them"
summary: "A harness that runs autonomous coding agents in isolated container sandboxes: each agent analyses a repository, edits it, runs its tests and submits a patch, and the patch is then judged in a second, clean sandbox against tests the agent never saw. A Go orchestrator with a warm pool, a repository cache and an append-only event log, and a React control plane that streams every agent's reasoning, terminal and diff live. 128 agents ran at once and all 128 patches were verified."
cover: "/covers/drydock.svg"
tech: ["Go", "Docker Engine API", "Linux cgroups", "React", "TypeScript", "Server-sent events", "Ollama", "Git"]
featured: true
order: 1.54
github: "https://github.com/sushantlokhande14/drydock"
---

## Problem

A coding agent runs commands chosen by a language model that is reading a repository it did not write. That is hostile code by default, and it needs a box it cannot get out of. And an agent's own report of success is worth nothing: a model will describe a fix it never made, or watch tests pass that were passing all along, and say it is done. A harness has to contain the agent and then check its work without believing a word of it.

## Approach

- **A sandbox per run, locked down.** No network, no Linux capabilities, a read-only root, a non-root user, and limits on memory, CPU and process count. Every command has a deadline enforced inside the sandbox, so its background children die with it. Isolation is tested by attacking it from the inside: a fork bomb, a memory hog, a runaway command, attempts to reach the network or write outside the workspace.
- **Fast environments.** Tools are baked into the image. Repositories are mirrored once by a separate fetcher, the only container with network access and the only one that never runs a model-chosen command, and cloned with shared objects so a checkout copies nothing. A warm pool keeps sandboxes started ahead of demand.
- **An agent loop with tools.** The model reads, searches, edits, runs commands and tests, and submits, all inside the sandbox, within a step budget. Backends for a local model through Ollama, any OpenAI-compatible API, and a scripted replay that exercises everything except the model.
- **Verification it cannot influence.** The patch is computed against the read-only mirror rather than anything the agent can write to, applied to a clean checkout in a second sandbox, and run against hidden tests. Tests show an agent cannot hide a change by deleting its .git directory, committing, or rewriting its git configuration.
- **An event log as the source of truth.** Every step is appended to a per-run log. The control plane is a live subscription to it; a browser that drops its connection resumes from the last event it saw, and a restarted server rebuilds every run from disk.

## Result

- **Concurrency.** 128 agents submitted at once on one laptop all ran concurrently (peak 287 containers, counting verification and the pool) and **all 128 produced a patch verified in a second sandbox**, in 41 seconds.
- **Startup.** Time until a command can run against a checkout of a real repository fell from **13.7 s to 159 ms** cold and **60 ms** from the warm pool (p50, one at a time). Under the 128-agent burst with the pool sized to it, every run started from the pool in **under 5 s** (p50 1.8 s, slowest 3.6 s). With a pool of only 16, the 112 runs that missed it waited about 12 s each on the container runtime.
- **Isolation.** 15 tests against real containers, all passing, covering every limit above and the patch-forgery cases.
- **A weak model as the best test.** A local 7B model resolved 0 of 8 seeded tasks at first. Its failures drove the harness changes: refusing a submission when nothing has changed, telling the agent to reproduce the bug when the existing tests already pass, setting the model's context window, scoping cleanup so one server cannot remove another's sandboxes, and making cached repositories immutable. It then resolved 2 of 8.
