---
title: "Cited, Not Guessed"
summary: "A study assistant that refuses to make things up. Every answer is pulled from real source material and arrives with citations, and it stays quiet when it genuinely does not know."
cover: "/covers/rag.svg"
tech: ["Python", "FastAPI", "OpenAI", "Vector embeddings", "Docker", "AWS EC2"]
featured: false
order: 4
github: "https://github.com/sushantlokhande14/AILearningHub"
---

## Problem

LLMs answer confidently whether or not they know the material. For a learning assistant that aggregates course content, wrong-but-confident is worse than useless — every answer needs to be traceable to a source.

## Approach

Full retrieval-augmented generation pipeline, built as an async (asyncio) FastAPI service:

- **Ingestion** chunks and embeds source material into a vector store.
- **Semantic retrieval** pulls the most relevant chunks per query.
- **Grounded generation** feeds retrieved context to the LLM through prompt templates with explicit context-window management.
- **Citations + guardrails:** every answer cites its source chunks, and guardrails reject responses unsupported by retrieved context rather than letting the model improvise.

Deployed with Docker on AWS EC2.

## Result

A working end-to-end RAG product covering the parts that actually matter in production LLM apps: retrieval quality, grounding, citation, and refusing to hallucinate.
