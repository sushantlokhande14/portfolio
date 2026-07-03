---
title: "Relay"
subtitle: "The LLM gateway that remembers"
summary: "A gateway that remembers what your model already said. It matches prompts by meaning, not exact text, so 78 percent of requests skip the model entirely and the typical answer comes back in 44 milliseconds. The memory runs on Proxima."
cover: "/covers/relay.svg"
tech: ["Python", "FastAPI", "asyncio", "SQLite", "Proxima (C++)", "SSE"]
featured: true
order: 1.5
github: "https://github.com/sushantlokhande14/Relay"
---

## Problem

Calling an LLM provider directly is one function call. Putting that call in front of real traffic is where the gaps show up: you pay for every request even when it's a near-duplicate of one you answered a minute ago, one provider having a bad five minutes takes you down with it, nothing caps a runaway client, and you can't see what's slow or what it costs.

## Approach

Relay is an OpenAI-compatible gateway (`POST /v1/chat/completions`, streaming SSE or not) that adds the layer a raw provider call doesn't give you:

- **Two-tier cache.** An exact cache (sha256 of the normalized prompt + the params that change an answer) is checked first; a **semantic cache** second — it embeds the prompt (MiniLM, 384-d), finds the nearest prompt it has already answered, and serves the stored response if cosine similarity clears the route's threshold.
- **Proxima under the hood.** The nearest-neighbor search runs on Proxima, the HNSW index I wrote in C++. SQLite is the source of truth (prompts, embeddings, responses, tokens); Proxima is a rebuildable index over those embeddings, keyed by SQLite row id. Eviction works around HNSW's no-delete limitation by marking LRU rows dead and rebuilding from the survivors — and because embeddings live in SQLite, a rebuild never re-calls the embedding model.
- **Failover** across OpenAI, Anthropic, and a local mock behind one async `stream()` interface; the chain advances on error or stall, but only before the first token streams (an honest limitation, documented).
- **Token-bucket rate limiting** per API key and route, plus a live metrics page: hit rate, p50/p95 latency, tokens, and modeled cost saved.

## Result

Load test against the mock provider (reproducible, no API spend): 4000 requests, 24 concurrent, traffic mix of 45% exact repeats / 35% paraphrases / 20% genuinely novel — run with and without the cache.

| metric | no cache | with cache |
| :-- | :-- | :-- |
| p50 latency | 759 ms | **44 ms** |
| throughput | 32 req/s | **167 req/s** |
| cache hit rate | 0% | **78%** (54% exact, 24% semantic) |
| provider spend | $0.263 | **$0.062** |

The median request drops ~17× because most calls become a ~10 ms cache read instead of a ~450 ms provider call; spend tracks the hit rate (~76% reduction). The p95 barely moves, and that's the honest part — misses still pay full provider latency, so the cache helps the typical request, not the worst one. The 0.90 similarity threshold is deliberately conservative: 31 of 48 paraphrases land above it against their canonical question, and none of the 4000 novel prompts collide.
