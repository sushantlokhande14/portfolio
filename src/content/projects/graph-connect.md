---
title: "Graph Connect"
subtitle: "Six Degrees"
summary: "A social platform that thinks in relationships. It keeps a real Twitter slice, twelve hundred users and nearly fifty thousand follows, in a graph database and answers who knows who in two hops."
cover: "/covers/graph.svg"
tech: ["Python", "FastAPI", "React", "TypeScript", "Neo4j", "Cypher", "Clerk"]
featured: true
order: 3
github: "https://github.com/sushantlokhande14/neo4j-social-network-graph-app"
---

## Problem

Social features — friend recommendations, mutual connections, follower graphs — are awkward to express in a relational or document store. Every "people you may know" becomes a pile of self-joins that gets slower as the network grows. The graph is the data; the datastore should think in graphs too.

## Approach

![Graph Connect architecture](/diagrams/graph-arch.svg)

- **Graph-native model:** users and posts are nodes; FOLLOWS and POSTED are directed edges in Neo4j (Aura). Relationships aren't foreign keys here, they are the schema.
- **Cypher traversals do the social math:** "people you may know" is a 2-hop walk, mutual connections are a single traversal, and N-hop queries stay fast because the storage matches the shape of the question.
- **FastAPI backend** fronts the graph with a thin Python layer; **Clerk** handles authentication so sessions are solved, not reinvented.
- **React + TypeScript frontend** (Tailwind, Vite) — the product surface is most of the codebase.
- **Search and ranking:** full-text indexing over user attributes for lookup, follower counts for popularity ranking.
- **Real topology:** the graph is seeded from a Stanford SNAP Twitter slice — about 1,200 users and nearly 50K FOLLOWS edges — so recommendations run against genuine network structure, not synthetic fixtures.

## The stack

| Piece | Choice | Why |
| :-- | :-- | :-- |
| Frontend | React + TypeScript, Tailwind, Vite | the product surface, and most of the code |
| API | FastAPI | a thin Python layer speaking Cypher |
| Auth | Clerk | sessions and identity solved, not reinvented |
| Store | Neo4j Aura | relationships are the schema, not foreign keys |
| Queries | Cypher 1/2/N-hop traversals | recommendations and mutuals in one query |
| Search | full-text index on user attributes | find people fast |
| Data | Stanford SNAP Twitter slice | ~1,200 users, ~50K edges of real topology |

## Result

A working graph-backed social platform where the interesting features — recommendations, mutual connections, popularity — fall out of the graph's shape instead of join gymnastics. Two hops on real Twitter topology answers "who should I know" in a single Cypher query.
