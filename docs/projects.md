# Projects — Sushant Lokhande

A plain-English summary of every project on the portfolio.
Useful for interview prep, cover letters, or quickly recalling what you built and why.

---

## 1. Proxima
**Subtitle:** The index that beats the libraries
**Stack:** C++17, SIMD/AVX2, pybind11, CMake, Python, NumPy
**GitHub:** github.com/sushantlokhande14/proxima

A vector search engine written from scratch in C++. Most people import hnswlib or FAISS; this is the thing they would import. It uses the HNSW graph algorithm with a two-lane design: a fast int8 lane (SQ8) for traversal and an exact float32 lane for re-ranking the final candidates. AVX2 SIMD instructions cut the per-comparison cost. A pybind11 binding makes it usable from Python.

**Key numbers:** 12,049 queries per second on a single thread at 0.999 recall@10 on 100K x 128-dimensional vectors. 1.8x faster than hnswlib, 2.5x faster than FAISS HNSWFlat at the same recall.

**Why it matters on a resume:** It is the clearest signal of systems and performance engineering in the portfolio. It also anchors two other projects (Relay and Reel Rank) that use it as their retrieval engine.

---

## 2. Relay
**Subtitle:** The LLM gateway that remembers
**Stack:** Python, FastAPI, asyncio, SQLite, Proxima (C++), SSE
**GitHub:** github.com/sushantlokhande14/Relay

An OpenAI-compatible LLM gateway that caches responses at the meaning level, not just the exact text. It embeds each incoming prompt with a sentence model (MiniLM, 384 dimensions) and checks whether a semantically close prompt was already answered. If it was, the stored response goes back immediately. The cache runs on top of Proxima for the nearest-neighbor lookup. On a miss it forwards to the real provider (OpenAI, Anthropic, or a local mock) with failover and per-key token-bucket rate limiting.

**Key numbers:** 78% of requests served from cache (54% exact match, 24% semantic match). Median latency drops from 759ms to 44ms. Provider spend drops 76%. Throughput goes from 32 to 167 requests per second.

**Why it matters:** Real LLM infrastructure problem, real numbers from a reproducible load test. Shows FastAPI, async Python, system design thinking, and ties Proxima to a practical use case.

---

## 3. Autograde AI
**Subtitle:** The TA that never sleeps
**Stack:** Python, pytest, Java (JUnit), Ollama, FastAPI, Redis, Prometheus, Grafana
**GitHub:** github.com/sushantlokhande14/autograde-ai (repo pending push)

The grading automation built during the SJSU Graduate Assistant role. A test harness runs every student submission against instructor test suites (pytest for Python, JUnit for Java), each in an isolated run with a timeout so one crashing or infinite-looping program cannot stall the batch. The rubric is encoded once and applied identically to every submission, with scores and failing cases rolled into a gradebook-ready report. A local LLM served through Ollama drafts first-pass written feedback from each failure pattern (student code never leaves the machine), and a human reviews every comment before it reaches a student. Results are served through a FastAPI layer with Redis caching, and Prometheus + Grafana watch batch health, run latency, and cache hit rate.

**Key numbers:** 400+ Java and Python submissions in a cycle at peak, across 3 courses. Manual evaluation effort down 35%. The freed hours went into mentoring 250+ students.

**Why it matters:** Real tooling with real users (the whole grading team), tied directly to the Graduate Assistant experience entry. Shows pragmatic automation and a disciplined use of LLMs (the model drafts, a human decides) rather than blind AI grading.

---

## 4. Reel Rank
**Subtitle:** Describe a vibe, get movies
**Stack:** PyTorch, FastAPI, React, TypeScript, Proxima, sentence-transformers, TMDB API, Docker
**GitHub:** github.com/sushantlokhande14/reelrank

A two-stage movie recommender built the way production systems are. Stage one is a two-tower neural model: separate encoders for users and items, trained with in-batch negative sampling. At serving time the query (a user ID or free text like "a slow-burn sci-fi like Arrival but funnier") is embedded and the top candidates are retrieved by ANN search over Proxima in int8 SQ8 mode. Stage two is a neural ranker that re-scores those candidates before returning the final list.

Collaborative signal comes from MovieLens. Content embeddings of title, genres, tags, plot, cast, and director come from a sentence-transformer, so a brand-new movie with zero ratings still has a usable representation (cold start). A daily TMDB API job keeps the index current with now-playing and trending titles. Evaluation uses a leakage-free temporal split and reports Recall, NDCG, and MAP against a popularity baseline and a content-similarity baseline.

**Why it matters:** End-to-end ML system (data pipeline, training, serving, frontend). Directly reuses Proxima for retrieval, which ties the two projects together as a coherent story. Covers cold start, live data, and natural-language search.

---

## 5. Image-Based Malware Classification
**Subtitle:** Malware Mugshots
**Stack:** Python, PyTorch, OpenCV, ViT, Docker, CUDA
**GitHub:** github.com/sushantlokhande14/Soft_Voting_Ensembled_Malware_Images_Classification

The CS298 thesis project. Instead of scanning for known byte signatures, the pipeline converts each executable into an image using eight visualization techniques (including Hilbert curve and byteclass color encodings). Three tracks study the image: handcrafted texture features (HOG, Haralick), fine-tuned deep CNNs (VGG16 and ResNet50), and a fine-tuned Vision Transformer. At inference time all three vote and their probability distributions are merged by soft voting. Training ran on GPU with Bayesian hyperparameter sweeps and Dockerized reproducible environments.

**Key numbers:** 94% accuracy across 17 malware families on 50,000+ image samples.
**Publication:** co-authored paper (S. Lokhande, F. Di Troia, M. Stamp), currently under review.

**Why it matters:** Real research output with a published result (under review). Covers computer vision, ensemble learning, CUDA training, and experiment-tracking discipline.

---

## 6. Graph Connect
**Subtitle:** Six Degrees
**Stack:** Python, FastAPI, TypeScript, Neo4j, MongoDB, Docker, AWS
**GitHub:** github.com/sushantlokhande14/neo4j-social-network-graph-app

A social platform where the connections between people are the database, not just columns in a table. Friendships, follows, and mutual connections are stored as edges in a Neo4j graph. A Cypher query finds who knows who in two hops. Profiles and posts live in MongoDB alongside the graph. The API is a FastAPI service with JWT authentication; the frontend is TypeScript.

**Key numbers:** 50,000 connections in the graph.

**Why it matters:** Shows graph database thinking (Neo4j, Cypher, shortest path) which most portfolios skip entirely. Also covers polyglot persistence (graph plus document store in one system).

---

## 7. AI Learning Aggregator
**Subtitle:** Cited, Not Guessed
**Stack:** Python, FastAPI, OpenAI, vector embeddings, Docker, AWS EC2
**GitHub:** github.com/sushantlokhande14/AILearningHub

A study assistant built on RAG (retrieval-augmented generation). It refuses to answer from the model's training memory alone. Instead it retrieves the relevant chunks from a real knowledge base, passes them to the LLM as grounded context, and returns citations alongside every answer. If the knowledge base does not contain a clear answer, it says so rather than hallucinating one.

**Why it matters:** Practical GenAI engineering (RAG, embeddings, retrieval). Addresses the hallucination problem directly, which signals maturity about LLM limitations.

---

## 8. Melody Metrics
**Subtitle:** What makes a song a hit
**Stack:** C++, Python, Hadoop, MapReduce, Hive, XGBoost
**GitHub:** github.com/sushantlokhande14/Predicting-Song-Popularity-Using-Lyrics

A big-data pipeline and popularity prediction model over a million-row music dataset. The raw data came from multiple sources with no common keys. C++ MapReduce jobs running on a Linux Hadoop cluster joined and aggregated the records. The clean data was queried in Hive, then an XGBoost model was trained to predict song popularity from audio features and lyrics.

**Why it matters:** Covers distributed computing (Hadoop, MapReduce) and the full cycle from messy raw data to a trained model. C++ MapReduce is unusual and stands out.

---

## 9. Multimodal Palmprint Authentication
**Subtitle:** Show of Hands
**Stack:** Python, PyTorch, OpenCV, FastAPI, Docker, CUDA
**GitHub:** github.com/sushantlokhande14/Multimodal-contactless-palmprint-verification-using-dual-networks-and-ensemble-scoring

A contactless biometric verification system. Four models examine the same palm scan from different angles: deep learning embeddings, LBP texture features, Gabor frequency-domain features, and a cross-channel comparison between near-infrared and visible light. Their scores are merged by ensemble voting to reach a verification decision. The pipeline runs behind a FastAPI service in a Docker container.

**Key numbers:** 99.75% AUC on the verification benchmark.

**Why it matters:** Computer vision in a high-stakes domain (biometrics). Shows multimodal fusion and understanding of precision-recall tradeoffs where false negatives have real costs.

---

## 10. Kairo
**Subtitle:** Zero to shipped in a week
**Stack:** Python, FastAPI, React, TypeScript, OpenAI, Vapi, AWS EC2
**GitHub:** github.com/sushantlokhande14/kyron-medicalapp

An AI-powered patient intake assistant that handles both text and voice. Patients can type or call in, and the system gathers intake information, routes questions to the right department, and hands off to a human agent when needed. The backend is FastAPI orchestrating OpenAI for conversation and Vapi for voice-call handling. The frontend is React and TypeScript, deployed on AWS EC2. The whole thing went from an empty folder to a deployed product in under a week.

**Why it matters:** Demonstrates full-stack LLM product development (voice, text, LLM orchestration) and shipping speed. Good for roles that care about product thinking alongside engineering.

---

## 11. TCP Sliding Window Simulator
**Subtitle:** TCP, from Scratch
**Stack:** Python, raw sockets
**GitHub:** private / no public repo

A Python implementation of the TCP sliding window protocol built over raw sockets. It covers the full three-way handshake, sliding window flow control, cumulative acknowledgments, and retransmission on timeout or loss. A terminal dashboard shows every packet moving in real time. Built for the Computer Networks course as a way to really understand the protocol rather than just reading about it.

**Why it matters:** Strong fundamentals signal. Not many candidates can say they implemented TCP. Good for systems and infrastructure interviews.

---

## The Bigger Story

Three projects are connected into one system: **Proxima** is the retrieval engine, **Relay** uses it to cache LLM calls, and **Reel Rank** uses it to power a production-style movie recommender. That arc (write the engine, use it in one product, use it in another) is more convincing than three unrelated demos.

For FAANG-level or ML-heavy roles, lead with Proxima and Relay. For product-oriented roles, lead with Relay or Kairo. For ML research roles, lead with the malware paper. For data/distributed work, Melody Metrics covers that ground.
