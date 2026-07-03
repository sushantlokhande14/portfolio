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
**Stack:** Python, FastAPI, React, TypeScript, Tailwind, Neo4j (Aura), Cypher, Clerk
**GitHub:** github.com/sushantlokhande14/neo4j-social-network-graph-app

A social platform where the connections between people are the database, not just columns in a table. Users and posts are nodes in Neo4j; FOLLOWS and POSTED are directed edges. Cypher traversals answer "people you may know" (2-hop) and mutual connections in a single query, full-text indexing powers search, and follower counts drive popularity ranking. The API is FastAPI with Clerk handling auth; the frontend is React + TypeScript + Tailwind and makes up most of the codebase. The graph is seeded from a real Stanford SNAP Twitter slice.

**Key numbers:** ~1,200 users, nearly 50K FOLLOWS edges of real network topology.

**Why it matters:** Shows graph database thinking (Neo4j, Cypher, multi-hop traversal) which most portfolios skip entirely, running against genuine network structure instead of synthetic fixtures.

---

## 7. AI Learning Aggregator
**Subtitle:** The field, in one feed
**Stack:** Python, Flask, SQLAlchemy, SQLite, OpenAI, BeautifulSoup, Bootstrap 4
**GitHub:** github.com/sushantlokhande14/AILearningHub

A content hub that pulls fresh ML papers, repos, and research into one searchable feed. Source connectors cover arXiv (feedparser), the GitHub API, the Papers with Code API, and Google Scholar (scholarly), with BeautifulSoup scraping where no API exists. Everything normalizes into SQLite through SQLAlchemy (Users, SavedItems, PeerArticles). Flask-Login handles accounts and roles, users keep saved lists, community submissions pass an approval workflow, and an OpenAI chatbot answers questions on top.

**Why it matters:** Real multi-source data integration (four APIs plus scraping), a complete auth/roles/approval product loop, and an LLM feature grounded in an actual application.

---

## 8. Melody Metrics
**Subtitle:** What makes a song a hit
**Stack:** Python, Pandas, scikit-learn, XGBoost, Jupyter
**GitHub:** github.com/sushantlokhande14/Predicting-Song-Popularity-Using-Lyrics

Does popularity live in the sound or the words? Spotify's million-plus track dataset (Kaggle) and lyrics scraped from Genius share no keys, so the first job was the merge: normalized artist/track names joining the two into 139,433 clean records with 39 columns. Features come from both halves (danceability, energy, tempo, valence + lyric sentiment and unique word counts). A model ladder — Random Forest baseline, then LR/KNN/SVM/MLP — ends at XGBoost.

**Key numbers:** 74.28% on the imbalanced multiclass problem; 84.42% after class balancing and a binary hit-or-not framing.

**Why it matters:** The unglamorous reality of data work (merging keyless datasets) plus honest handling of class imbalance — both great interview stories.

---

## 9. Multimodal Palmprint Authentication
**Subtitle:** Show of Hands
**Stack:** Python, PyTorch, OpenCV, EfficientNet-B4, ResNet-152, ViT-B/16, triplet loss
**GitHub:** github.com/sushantlokhande14/Multimodal-contactless-palmprint-verification-using-dual-networks-and-ensemble-scoring

A contactless biometric verification system. Preprocessing (Gaussian smoothing, Otsu ROI extraction, CLAHE) feeds three complementary feature tracks: deep embeddings (EfficientNet-B4, ResNet-152, ViT-B/16), handcrafted texture (LBP, KAZE), and frequency-domain structure (Gabor, DWT, DCT). The fused features train a Siamese dual-network with triplet loss into a 256-dimensional embedding, and a four-stage ensemble (cohort normalization, multi-template fusion, adaptive matcher fusion, quality filtering) scores the final match.

**Key numbers:** 99.75% AUC on verification.

**Why it matters:** Serious metric learning (Siamese, triplet loss) plus multimodal fusion in a high-stakes domain where a confident wrong answer is the worst failure.

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
