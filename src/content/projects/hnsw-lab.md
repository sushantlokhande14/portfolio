---
title: "HNSW Lab"
subtitle: "Watch the search walk"
summary: "Vector search does not scan your data, it walks a graph. This runs the real HNSW algorithm on points you can see and replays the walk hop by hop, so you can watch a query fall through the layer stack and land on its neighbors. Click to move the query, drag the sliders, break it on purpose."
cover: "/covers/hnswlab.svg"
tech: ["TypeScript", "Canvas", "HNSW", "Zero dependencies"]
featured: true
order: 2.5
github: "https://github.com/sushantlokhande14/hnsw-lab"
live: "https://sushantlokhande14.github.io/hnsw-lab/"
---

## Problem

I wrote [Proxima](/projects/proxima/), a C++ HNSW engine that serves 12,049 queries a second at 0.999 recall. Explaining why it is fast to someone who has not read the paper is genuinely hard, because the interesting part is a shape: a stack of graphs that gets sparser toward the top, so a search can cross the entire dataset in a few hops before it starts looking around locally.

Static diagrams lose exactly the thing that matters, which is the motion. Nobody has ever understood beam search from a still picture of a graph.

## Approach

- **The real algorithm, not an animation of one.** Geometric level assignment, greedy per-layer search on insert, symmetric linking with degree pruning, and the diversity heuristic for neighbor selection. Nothing is scripted; change a parameter and the graph genuinely rebuilds.
- **Instrumented search.** Every hop, every distance computation, and each layer's entry and exit node get recorded during the query, then replayed one step at a time. The narration line tells you which node it is standing on and how many neighbors it is about to check.
- **Layers as stacked planes.** Drawn in a light isometric skew so the descent is visible instead of happening invisibly inside one flat graph, with a dashed line tracing the fall from each layer's exit to the next layer's entry.
- **Honest numbers, live.** Recall is scored against a brute-force ground truth on every single query, so when you drag `ef` down and watch recall break, you are seeing the real tradeoff rather than a claim about it.
- **Clusters, not noise.** Points are sampled as gaussian blobs, because uniformly random data makes every ANN index look equally good and hides the whole point of graph structure.

Two hundred lines of index code, four small ES modules, no dependencies and no build step.

## Result

A query on 400 points touches about 70 of them, so it skips **83% of the work** brute force would do while still returning all five true nearest neighbors. The layer count is never chosen; it falls out of the level distribution, which is one of those things that is obvious in the paper and surprising on screen.

The best part is breaking it. Drop `M` to 3 and the graph goes sparse and badly connected, hop counts climb, and the walk starts getting stranded in the wrong neighborhood. Drop `ef` to 4 and recall visibly falls below 100%. Put the query out in empty space and watch it wander. Every knob a production vector database exposes is here, doing the thing it actually does.
