---
title: "DistCompile"
subtitle: "A build farm that never compiles the same thing twice"
summary: "A distributed build engine for C and C++. A gRPC coordinator schedules the build graph out of PostgreSQL, workers pull tasks and survive crashes, and every result is cached by content hash. Over a scripted 20-step edit workload it ran the compiler 84 percent fewer times than make, and never recompiled code it had already built."
cover: "/covers/distcompile.svg"
tech: ["C++17", "gRPC", "Protocol Buffers", "PostgreSQL", "Docker", "CMake"]
featured: true
order: 1.9
github: "https://github.com/sushantlokhande14/distcompile"
---

## Problem

C and C++ builds spend a surprising share of their time recompiling things that were already compiled: after a revert, a branch switch, a touched header, a comment-only edit, or a fresh CI checkout. make decides by timestamps, so it can't tell the difference. Distributed build systems (distcc, Bazel remote execution) solve this with content-addressed caching and a shared task graph. I wanted to build that core myself: the scheduling, the cache, and the failure handling.

## Approach

- **Three programs.** `dcc` preprocesses sources locally and fingerprints them; a coordinator keeps builds, tasks, dependencies and the action cache in PostgreSQL; workers claim tasks over gRPC, run gcc and ar, and upload their results.
- **Content-addressed caching.** Every object, archive and binary is stored under its SHA-256. A compile's key covers the toolchain, flags and preprocessed text (normalized for C, kept exact for C++, where raw string literals make normalization unsafe); archive and link keys are built from their inputs' digests.
- **Incremental invalidation.** The client records every header each file read and skips the preprocessor when none of them changed; the cache then catches edits that don't change the preprocessed text at all.
- **Dependency-aware scheduling.** Critical-path priorities (upward rank), partitions that keep each library's objects on one worker for locality, and pull-based claims with work stealing, built on Postgres `FOR UPDATE SKIP LOCKED`.
- **Retry-safe execution.** Leases with heartbeats and a reaper, idempotent completions guarded in SQL, compile errors that are never retried, and a flaky worker kept away from its own failures.

## Result

Against real GNU make (with `-MMD` header tracking) on a scripted 20-step workload of edits, reverts, branch switches, touched files and clean CI builds, **DistCompile ran the compiler 194 times to make's 1,235, 84 percent fewer**, with both binaries checked for identical output after every step. On genuinely new code the two do the same work; every compile it saved was a repeat.

Profiling a 2,001-file build turned up five database bottlenecks. Fixing them cut per-task scheduling overhead from 4.0 to 1.8 ms and build submission from 539 to 45 ms, and partitioning cut cross-worker downloads from 393 to 115. An end-to-end suite runs in CI against a real PostgreSQL: a worker killed mid-task, a worker failing half its tasks, and four concurrent builds with no task ever claimed twice.
