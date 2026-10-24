---
title: "Fleet Guard"
subtitle: "Catching driving regressions before a build ships"
summary: "A validation platform for autonomous-driving software builds. It replays the same seeded scenarios through a known-good build and a release candidate, compares what the two did, classifies every regression, and turns each cluster of failures into a report an engineer can reproduce with one command. One 100,000-drive campaign runs end to end in 52 seconds."
cover: "/covers/fleetguard.svg"
tech: ["C++17", "Python", "PostgreSQL", "FastAPI", "Prometheus", "Grafana", "React", "Ollama"]
featured: true
order: 1.85
github: "https://github.com/sushantlokhande14/fleet-guard"
---

## Problem

A new driving build can pass every unit test and still brake late for a pedestrian, wander in a work zone, or hand control back to the driver more often. The only way to see that is to drive it, many thousands of times, against the build it replaces, and then make the differences small enough for an engineer to act on.

## Approach

- **A deterministic simulator.** `fgsim`, in C++17, drives seven scenario families (highway following, urban cut-ins, pedestrian crossings, S-curves, intersection turns, work-zone lane shifts, stop-and-go) with a vehicle model, a perception model with misses, phantoms and latency, a planner and a controller. Both builds share their random draws, so any difference comes from the build, not from luck.
- **Build-vs-build comparison.** Drives are aligned on route distance and compared on lateral offset, speed, time and the first point where they diverge.
- **SQL classifiers.** Five classifiers over the drive tables catch disengagements, latency spikes, route deviations, perception errors and control instability. The root cause is the earliest signal before the takeover, and failures cluster by signature.
- **Reproducible reports.** Every failure replays bit for bit from its seed and the two build definitions. A local model writes the narrative, and a guard checks it against the facts before it is used.
- **Operations.** A Postgres-backed worker queue (`SKIP LOCKED`), COPY ingest, a FastAPI service, Prometheus alert rules, three Grafana dashboards and a React UI.

## Result

- **Scale.** One 100,000-drive campaign ran end to end in 52 seconds on a 22-thread desktop: 24 s to simulate, 26 s to ingest 100,000 drives and 232,069 events, 2 s to classify.
- **Seeded benchmark.** Fifty injected bugs and ten clean controls, 84,000 drives per run: **38 of 50 reproduced** on a seed range never used for tuning, with 1 of 10 clean controls flagged. Every remaining miss is written up in the results doc.
- **Triage.** For one release candidate, 208 flagged scenarios collapsed into 10 cluster reports to open.
- **Reports.** The guard accepted 28 of 30 model-written narratives; both rejections were the guard's own mistakes, since fixed.
