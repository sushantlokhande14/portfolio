---
title: "portcullis"
subtitle: "A policy gateway between AI agents and their tools"
summary: "A Rust gateway for the Model Context Protocol. It sits between an agent and its MCP servers, refuses any tool call its policy did not permit, reads tool output before the model does to redact credentials and fence off injected instructions, and writes an audit record for every decision. Default deny, 224 tests, CI on Linux, Windows and macOS."
cover: "/covers/portcullis.svg"
tech: ["Rust", "Tokio", "MCP", "JSON-RPC", "TOML policy", "GitHub Actions"]
featured: true
order: 1.55
github: "https://github.com/sushantlokhande14/portcullis"
---

## Problem

When an agent connects to an MCP server, two things happen that nothing checks. Every tool the server exposes becomes callable by the model, and every byte the server returns goes straight into the model's context. The first is an authorization problem. The second is an injection problem, and it is the one that gets overlooked, because tool output looks like data right up until the model reads it as instructions.

## Approach

- **A proxy that speaks MCP both ways.** The client points at portcullis instead of the real servers. It starts and supervises several upstream servers, presents them as one, and namespaces their tools so names never collide.
- **Policy first, default deny.** Rules match on tool name, upstream server and argument values, and the first rule that applies decides. `portcullis explain` shows what a policy would do to a call without starting anything, and `validate --strict` fails CI on a risky rule.
- **Scanners on the way back.** Credentials in tool output are redacted, instruction-shaped text is fenced as untrusted data, and text hidden in Unicode tag characters is decoded, judged like visible text, and stripped.
- **An audit trail.** One JSONL record per decision, with the deciding rule, argument digests and scanner findings.
- **Five crates, one direction.** Core protocol types, policy, scanners, proxy and CLI, with core at the bottom, so policy and scanners are tested against plain values.

## Result

The gateway runs in front of real MCP clients over stdio, with 224 tests and CI running fmt, clippy, docs and tests on three operating systems, an MSRV build and a dependency audit. Its own tests caught a race where a request issued just after an upstream exited hung for the full two-minute timeout.

The README states plainly what it does not do yet: the injection detectors are heuristics, resources and prompts are refused rather than mediated, non-text content is passed through uninspected, and a shell tool defeats any argument policy. Those gaps are filed as open issues for contributors.
