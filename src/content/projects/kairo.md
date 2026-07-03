---
title: "Kairo"
subtitle: "Zero to shipped in a week"
summary: "An AI patient assistant that talks back, in text and in voice. I took it from an empty folder to a shipped product in under a week, working entirely AI native."
cover: "/covers/kairo.svg"
tech: ["Python", "FastAPI", "React", "TypeScript", "OpenAI", "Vapi", "AWS EC2"]
featured: false
order: 7
github: "https://github.com/sushantlokhande14/kyron-medicalapp"
---

## Problem

Patient-facing healthcare tools are usually slow to build and clunky to use. The goal: a working LLM-powered patient service experience — chat plus voice — shipped fast enough to validate the idea.

## Approach

![Kairo architecture](/diagrams/kairo-arch.svg)

- **FastAPI backend** orchestrating OpenAI for the conversational layer, with **Vapi** handling voice-call handoff.
- **React + Vite + TypeScript** frontend.
- Deployed on AWS EC2.
- Built AI-native: Cursor and Claude Code drove the development loop, which is how a one-person team ships a full-stack LLM product in days.

## The stack

| Piece | Choice | Why |
| :-- | :-- | :-- |
| Frontend | React + Vite + TypeScript | a chat UI patients can actually use |
| Voice | Vapi | phone-call handoff without telephony plumbing |
| Backend | FastAPI | one orchestrator for both channels |
| LLM | OpenAI | the conversational layer |
| Deploy | AWS EC2 | live, not localhost |
| Workflow | AI-native (Cursor, Claude Code) | how one engineer ships in days |

## Result

End-to-end patient service app — chat, voice handoff, deployed — **0 → shipped in under a week.** A case study in how much one engineer can ship with an AI-native workflow.
