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
**Stack:** Python, FastAPI + GraphQL (Apollo), gRPC, Kafka, Temporal, Postgres 16 (RLS), Redis, Qdrant, MinIO, Docker + gVisor, Ollama/vLLM (Qwen 2.5 32B), Next.js 15, OpenTelemetry, Prometheus, Grafana
**GitHub:** github.com/sushantlokhande14/autograde-ai

The multi-agent grading platform (internal name GradeMesh) that grew out of the SJSU Graduate Assistant role. A parser pool normalizes seven file formats into a canonical artifact stream, an LLM-assisted QuestionMapper assigns artifacts to rubric questions (gated on confidence), and a Kafka + Temporal backbone dispatches six specialized grading agents in parallel: theory (RAG over Qdrant), sandboxed code execution (Docker + gVisor), code style, derivation, figure, and plagiarism — plus a CrossChecker and FeedbackSynthesizer. Every grade carries calibrated confidence; high auto-approves, low lands in a review queue with a three-click audit to the exact prompt, retrieval, and sandbox run. Local-first: Qwen 2.5 32B via Ollama/vLLM, hashed student IDs, identity behind Postgres row-level security. Evaluated against a hand-graded 100-submission gold set with a zero-shot baseline.

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

## 5. HNSW Lab
**Subtitle:** Watch the search walk
**Stack:** TypeScript, Canvas, ES modules, zero dependencies
**GitHub:** github.com/sushantlokhande14/hnsw-lab
**Live:** https://sushantlokhande14.github.io/hnsw-lab/

An interactive visualizer for HNSW, the algorithm behind almost every vector database. It runs the real index (geometric level assignment, diversity heuristic, degree pruning) on 2-D points you can see, then replays the query hop by hop: layers drawn as stacked isometric planes, the current node in white, computed distances in green, returned neighbors in amber, and a dashed line tracing the descent from each layer's exit to the next layer's entry. Click to move the query; sliders control points, M, ef, and k. Recall is scored against brute force on every query.

**Key numbers:** a query on 400 points computes ~70 distances, skipping 83% of brute-force work at 100% recall@5.

**Why it matters:** it is the live demo the portfolio otherwise lacks, and it is the visual explainer for Proxima — it shows *why* the C++ engine is fast, which no static diagram does. Drop M to 3 or ef to 4 and you can watch the speed/accuracy tradeoff break in real time.

---

## 6. Image-Based Malware Classification
**Subtitle:** Malware Mugshots
**Stack:** Python, PyTorch, OpenCV, ViT, Docker, CUDA
**GitHub:** github.com/sushantlokhande14/Soft_Voting_Ensembled_Malware_Images_Classification

The CS298 thesis project. Instead of scanning for known byte signatures, the pipeline converts each executable into an image using eight visualization techniques (including Hilbert curve and byteclass color encodings). Three tracks study the image: handcrafted texture features (HOG, Haralick), fine-tuned deep CNNs (VGG16 and ResNet50), and a fine-tuned Vision Transformer. At inference time all three vote and their probability distributions are merged by soft voting. Training ran on GPU with Bayesian hyperparameter sweeps and Dockerized reproducible environments.

**Key numbers:** 94% accuracy across 17 malware families on 50,000+ image samples.
**Publication:** co-authored paper (S. Lokhande, F. Di Troia, M. Juracek, M. Stamp), currently under review.

**Why it matters:** Real research output with a published result (under review). Covers computer vision, ensemble learning, CUDA training, and experiment-tracking discipline.

---

## 7. Graph Connect
**Subtitle:** Six Degrees
**Stack:** Python, FastAPI, TypeScript, Neo4j, MongoDB, Docker, AWS
**GitHub:** github.com/sushantlokhande14/neo4j-social-network-graph-app

A social platform where the connections between people are the database, not just columns in a table. Friendships, follows, and mutual connections are stored as edges in a Neo4j graph. A Cypher query finds who knows who in two hops. Profiles and posts live in MongoDB alongside the graph. The API is a FastAPI service with JWT authentication; the frontend is TypeScript.

**Key numbers:** 50,000 connections in the graph.

**Why it matters:** Shows graph database thinking (Neo4j, Cypher, shortest path) which most portfolios skip entirely. Also covers polyglot persistence (graph plus document store in one system).

---

## 8. AI Learning Aggregator
**Subtitle:** Cited, Not Guessed
**Stack:** Python, FastAPI, OpenAI, vector embeddings, Docker, AWS EC2
**GitHub:** github.com/sushantlokhande14/AILearningHub

A study assistant built on RAG (retrieval-augmented generation). It refuses to answer from the model's training memory alone. Instead it retrieves the relevant chunks from a real knowledge base, passes them to the LLM as grounded context, and returns citations alongside every answer. If the knowledge base does not contain a clear answer, it says so rather than hallucinating one.

**Why it matters:** Practical GenAI engineering (RAG, embeddings, retrieval). Addresses the hallucination problem directly, which signals maturity about LLM limitations.

---

## 9. Melody Metrics
**Subtitle:** What makes a song a hit
**Stack:** C++, Python, Hadoop, MapReduce, Hive, XGBoost
**GitHub:** github.com/sushantlokhande14/Predicting-Song-Popularity-Using-Lyrics

A big-data pipeline and popularity prediction model over a million-row music dataset. The raw data came from multiple sources with no common keys. C++ MapReduce jobs running on a Linux Hadoop cluster joined and aggregated the records. The clean data was queried in Hive, then an XGBoost model was trained to predict song popularity from audio features and lyrics.

**Why it matters:** Covers distributed computing (Hadoop, MapReduce) and the full cycle from messy raw data to a trained model. C++ MapReduce is unusual and stands out.

---

## 10. Multimodal Palmprint Authentication
**Subtitle:** Show of Hands
**Stack:** Python, PyTorch, OpenCV, FastAPI, Docker, CUDA
**GitHub:** github.com/sushantlokhande14/Multimodal-contactless-palmprint-verification-using-dual-networks-and-ensemble-scoring

A contactless biometric verification system. Four models examine the same palm scan from different angles: deep learning embeddings, LBP texture features, Gabor frequency-domain features, and a cross-channel comparison between near-infrared and visible light. Their scores are merged by ensemble voting to reach a verification decision. The pipeline runs behind a FastAPI service in a Docker container.

**Key numbers:** 99.75% AUC on the verification benchmark.

**Why it matters:** Computer vision in a high-stakes domain (biometrics). Shows multimodal fusion and understanding of precision-recall tradeoffs where false negatives have real costs.

---

## 11. Kairo
**Subtitle:** Zero to shipped in a week
**Stack:** Python, FastAPI, React, TypeScript, OpenAI, Vapi, AWS EC2
**GitHub:** github.com/sushantlokhande14/kyron-medicalapp

An AI-powered patient intake assistant that handles both text and voice. Patients can type or call in, and the system gathers intake information, routes questions to the right department, and hands off to a human agent when needed. The backend is FastAPI orchestrating OpenAI for conversation and Vapi for voice-call handling. The frontend is React and TypeScript, deployed on AWS EC2. The whole thing went from an empty folder to a deployed product in under a week.

**Why it matters:** Demonstrates full-stack LLM product development (voice, text, LLM orchestration) and shipping speed. Good for roles that care about product thinking alongside engineering.

---

## 12. TCP Sliding Window Simulator
**Subtitle:** TCP, from Scratch
**Stack:** Python, raw sockets
**GitHub:** private / no public repo

A Python implementation of the TCP sliding window protocol built over raw sockets. It covers the full three-way handshake, sliding window flow control, cumulative acknowledgments, and retransmission on timeout or loss. A terminal dashboard shows every packet moving in real time. Built for the Computer Networks course as a way to really understand the protocol rather than just reading about it.

**Why it matters:** Strong fundamentals signal. Not many candidates can say they implemented TCP. Good for systems and infrastructure interviews.

---

## 13. EdgeCast
**Subtitle:** Media over QUIC, WebRTC and HLS on the same bad network
**Stack:** Go, quic-go, Pion WebRTC, HLS, Docker Compose, Prometheus, Grafana
**GitHub:** github.com/sushantlokhande14/edgecast

A single-command testbed (one Go binary, 21 containers) that compares three live media delivery models under the same network impairment: a five-region Media over QUIC relay tree, a WebRTC SFU and an HLS origin. Impairment is a userspace emulator because Docker Desktop's WSL2 kernel has no netem. An experiment controller runs a protocol x profile x repetition matrix and writes per-second session timelines.

**Key numbers:** 72 matrix runs, a 9-run A/B and a relay-failure experiment. MoQ reached first media fastest in 7 of 8 profiles (239 / 688 / 1,269 ms on a clean network). Pinning the publisher from 5,000 to 1,000 kbps cut stalled time 72 to 83 percent with goodput unchanged. Found and fixed a relay bug where a publisher restart blackholed every edge region.

**Why it matters:** Real networking and distributed-systems work with an experimental method, honest caveats and a non-obvious finding (publisher-side adaptation cannot see the last mile).

---

## 14. portcullis
**Subtitle:** A policy gateway between AI agents and their tools
**Stack:** Rust, Tokio, MCP / JSON-RPC, TOML policy
**GitHub:** github.com/sushantlokhande14/portcullis

A Rust gateway for the Model Context Protocol. It fronts several MCP servers as one, applies a default-deny policy to every tool call, scans tool output before the model reads it (credential redaction, instruction-shaped text fenced, hidden Unicode tag text decoded and stripped), and writes a JSONL audit record per decision. `portcullis explain` shows what a policy would do without running anything. Five crates with one-way dependencies.

**Key numbers:** 224 tests; CI on Linux, Windows and macOS plus an MSRV build and a dependency audit. Known gaps (heuristic injection detectors, resources and prompts refused rather than mediated) are stated in the README and filed as issues.

**Why it matters:** AI agent security is a live problem, and this is a working, tested answer in Rust. Covers both the security and the AI infrastructure angle.

---

## 15. Fleet Guard
**Subtitle:** Catching driving regressions before a build ships
**Stack:** C++17, Python, PostgreSQL, FastAPI, Prometheus, Grafana, React, Ollama
**GitHub:** github.com/sushantlokhande14/fleet-guard

A validation platform for autonomous-driving builds. A deterministic C++17 simulator replays the same seeded scenarios through a baseline and a candidate build (shared random draws, so differences come from the build), drives are compared on route distance, five SQL classifiers find disengagements, latency spikes, route deviations, perception errors and control instability, and each failure cluster becomes a report that replays bit for bit from its seed. A local model writes the narrative and a guard checks it against the facts.

**Key numbers:** one 100,000-drive campaign end to end in 52 s on 22 threads. Seeded benchmark: 38 of 50 injected bugs reproduced on unseen seeds, 1 of 10 clean controls flagged. 208 flagged scenarios collapsed into 10 cluster reports for one release candidate. The guard accepted 28 of 30 narratives.

**Why it matters:** Test infrastructure at scale with a measured benchmark, which is exactly what autonomy and robotics validation teams build.

---

## 16. teller
**Subtitle:** Let the model learn a task once, then replay it without one
**Stack:** Python, Playwright, Pydantic, Ollama, Chrome DevTools Protocol
**GitHub:** github.com/sushantlokhande14/teller

Computer-use automation for legacy web apps with no API, built as a take-home. A model works a task out once inside a fictional legacy banking console; the run is recorded as a typed capability that replays with no model, classifies every result (business outcome, recoverable fault, fatal failure, unknown screen), and hands the live browser to a person over CDP when it meets something new. Policy allowlist, risky-action approval and redaction are built in.

**Key numbers:** the same capability replays at a second institution with a fifteen-line tenant overlay; 37 tests. Evidence recorded with qwen2.5:7b through local Ollama.

**Why it matters:** A grounded take on computer-use agents: the model is used once, and the system around it handles reliability.

---

## 17. Smartphone Fall Detection
**Subtitle:** Telling a fall from sitting down
**Stack:** Python, TensorFlow / Keras, scikit-learn, XGBoost
**GitHub:** github.com/sushantlokhande14/sensor-spectrogram-har-and-fall-prediction

CS 286 (Wearable AI and mHealth) project with Mrunal Kotkar on MobiFall v2.0. Compares classical models on handcrafted features, deep networks on raw sensor windows, and transfer learning from UCI HAR and from ImageNet models on spectrograms, with leave-one-subject-out and leave-one-event-out evaluation.

**Key numbers:** 1D CNN at 99.35 percent accuracy on binary fall detection, 98.14 percent under leave-one-subject-out.

**Why it matters:** Shows evaluation discipline (subject-level generalization) on a health problem.

---

## 18. Gait Biometrics
**Subtitle:** Who you are, from how you walk
**Stack:** Python, TensorFlow / Keras, scikit-learn
**GitHub:** github.com/sushantlokhande14/Gait-biometrics-using-neural-networks

CS 288 (Biometric Security with AI) project: identify and verify ten people from phone accelerometer and gyroscope data, comparing a feature network (78 features, PCA to 10) with an LSTM on raw windows.

**Key numbers:** feature network 90 percent identification and 3 percent EER for verification; LSTM 57 percent identification (underfit) and 2 percent EER.

**Why it matters:** Pairs with palmprint authentication as a second biometrics project.

---

## The Bigger Story

Three projects are connected into one system: **Proxima** is the retrieval engine, **Relay** uses it to cache LLM calls, and **Reel Rank** uses it to power a production-style movie recommender. That arc (write the engine, use it in one product, use it in another) is more convincing than three unrelated demos.

For FAANG-level or ML-heavy roles, lead with Proxima and Relay. For product-oriented roles, lead with Relay or Kairo. For ML research roles, lead with the malware paper. For data/distributed work, Melody Metrics covers that ground.
