---
title: "teller"
subtitle: "Let the model learn a task once, then replay it without one"
summary: "Computer-use automation for back-office web apps that have no API. A model works out how to finish a task in a legacy app once, and the run is recorded as a typed capability that replays deterministically with no model in the loop, tells a business outcome apart from a broken app, and hands the live browser to a person when it meets something it does not know."
cover: "/covers/teller.svg"
tech: ["Python", "Playwright", "Pydantic", "Ollama", "Chrome DevTools Protocol", "pytest"]
featured: true
order: 2.6
github: "https://github.com/sushantlokhande14/teller"
---

## Problem

Banks and credit unions run on servicing consoles built decades ago: framesets, table layouts, no element ids and no API. Letting a model click through them every time is slow, costly and hard to trust. Scripting them by hand breaks the moment a label moves. I built this as a computer-use take-home, and wanted something in between: let the model work a task out once, then never need it for that task again.

## Approach

- **Discovery.** The model is shown every control it may act on, numbered, and drives the app toward a declared goal with typed inputs and outputs. The model layer is a seam with three implementations: Anthropic, any OpenAI-compatible endpoint, and a scripted stand-in for tests. The recorded evidence was produced by `qwen2.5:7b` running locally through Ollama.
- **Recording.** A successful run becomes a parameterized capability: the steps, how each control is found (including the "cell before it" labels legacy table forms use), and what must be true after every step.
- **Replay with an error taxonomy.** Replays run with no model. Every result is classified as a business outcome (the member does not exist), a recoverable fault (session expired), a fatal failure with evidence, or an unknown screen, which hands the live session to a person over CDP and resumes when they are done.
- **Guardrails.** A policy allowlist, approval for risky actions, and redaction in every log.

## Result

The same capability file replays against a second institution running the same product with its own branding, a newer release, a renamed frame and a renamed menu item. A fifteen-line tenant overlay covers the differences, and the run reports that it needed its fallback locator. The README's three animations are built from each run's own screenshots and log, so none of them is staged. 37 tests cover discovery, replay, the fault paths and handoff.
