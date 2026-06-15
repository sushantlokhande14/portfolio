---
title: "Proxima"
subtitle: "The index that beats the libraries"
summary: "Everyone imports a vector search library. I wrote my own in C++ and made it win. It answers nearest neighbor queries 1.8 times faster than hnswlib and 2.5 times faster than FAISS, at 0.999 recall, on a single thread."
cover: "/covers/proxima.svg"
tech: ["C++17", "SIMD/AVX2", "pybind11", "CMake", "Python", "NumPy"]
featured: true
order: 1
github: "https://github.com/sushantlokhande14/proxima"
---

## Problem

Approximate nearest-neighbor search powers every vector database and RAG system, and nearly everyone imports the same two libraries for it (hnswlib, FAISS). I wanted to own the whole stack — the HNSW graph algorithm, the SIMD distance kernels, the memory layout, the Python bindings, and the benchmark methodology — and then find a real edge over the references, not just match them.

## Approach

- **Full HNSW from the paper** (Malkov & Yashunin, TPAMI 2018): probabilistic layer assignment, beam search, and the diversity-preserving neighbor-selection heuristic — implemented, not wrapped, in header-only C++17.
- **The thesis: graph ANN is memory-bandwidth-bound, not compute-bound.** Every hop drags 512 bytes of float32 through the cache hierarchy for one distance.
- **SQ8 fast lane:** traversal runs entirely on int8 codes with AVX2 integer kernels (`vpmaddwd`), cutting bytes-per-hop 4× — then the candidate pool is re-ranked with exact float32 distances, so returned results are exact. Quantization steers the walk; floats judge the answer.
- **Cache-aware relabeling:** `index.reorder()` renumbers nodes in BFS order so graph neighbors share cache lines — a pure permutation, bit-identical results.
- **pybind11 bindings** (zero-copy NumPy, GIL released, threaded batch queries), versioned binary serialization, pytest + native test suites, and a 5-way single-threaded benchmark harness with exact ground truth.

## Result

On 100K×128d vectors at ≈0.999 recall@10, **proxima-sq8 serves 12,049 queries/sec single-threaded — 1.8× hnswlib and 2.5× FAISS HNSWFlat** — and builds its index faster than both. The control group proves the design: FAISS's own int8 HNSW variant, which ranks by quantized distances instead of re-ranking, hits a permanent recall ceiling of 0.902; proxima reaches the same 0.9996 ceiling as full-float indexes. Honest limitations (where the float path wins, synthetic-data caveats) are documented in the repo alongside a from-zero explainer of the whole algorithm.
