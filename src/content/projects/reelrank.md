---
title: "reelrank"
subtitle: "Describe a vibe, get movies"
summary: "A two-stage hybrid movie recommender, built the way production systems are. A two-tower neural model retrieves candidates through Proxima, my own C++ vector search engine; a neural ranker reorders them. It answers free-text requests like 'a slow-burn sci-fi like Arrival but funnier' and includes movies in theaters this week."
cover: "/covers/reelrank.svg"
tech: ["PyTorch", "FastAPI", "React", "TypeScript", "Proxima (C++ HNSW)", "sentence-transformers", "TMDB API", "Docker"]
featured: true
order: 2
github: "https://github.com/sushantlokhande14/reelrank"
# live: add the Vercel URL here after deploying (renders the "Live demo" button)
---

## Problem

Most recommender demos are a content-similarity cosine over a frozen dataset. I wanted the real thing: a two-stage retrieve-and-rank system the way production recommenders are built, running on live data, usable by a first-time visitor with no history, and able to answer a feeling rather than an id.

## Approach

- **Two stages.** Stage one is a two-tower neural model with separate user and item encoders, trained with in-batch-negative sampled softmax. At serving time the user (or a text query) is embedded and the top few hundred candidates are pulled by approximate nearest-neighbor search. The index is Proxima, my own C++ HNSW engine, running its int8 SQ8 mode to keep the serving memory small. Stage two is a neural ranker that re-scores those candidates.
- **Hybrid signals and cold start.** Collaborative signal comes from MovieLens; content embeddings of title, genres, tags, and the TMDB plot, cast, and director come from a sentence-transformer. A content-aware item tower means a brand-new movie with zero ratings still gets a usable embedding.
- **Live and current.** A daily job pulls trending and now-playing titles from the TMDB API and folds them into the index, so recommendations include movies released after the dataset froze.
- **Natural-language search.** A free-text request is embedded into the same item space and used as the retrieval query, so the system answers vibes, not just ids.
- **Honest evaluation.** A leakage-free temporal split, with Recall, NDCG, and MAP reported against a popularity baseline and a content-similarity baseline.

## Result

The hybrid two-tower beats both baselines on the held-out split. On items withheld from training entirely it recovers roughly ten times the recall of a collaborative-only system, which is the cold-start mechanism doing its job. The whole thing serves behind a FastAPI backend and a React frontend, Dockerized for a small always-on host, with a "pick a few you like" onboarding so a first-time visitor gets good results immediately. The ranker taught the most: the usual hard-negative advice quietly sabotages a re-ranker on sparse implicit feedback, because the retrieved negatives contain the user's own held-out future positives, so it learns to bury exactly what the eval rewards.
