---
title: "Graph Connect"
summary: "A multi-datastore social platform: FastAPI microservices over Neo4j and MongoDB with JWT auth, full-text search, and 50K+ graph relationships."
tech: ["Python", "FastAPI", "TypeScript", "Neo4j", "MongoDB", "Docker", "AWS"]
featured: true
order: 2
github: "https://github.com/sushantlokhande14/neo4j-social-network-graph-app"
---

## Problem

Social features — friend recommendations, mutual connections, follower graphs — are awkward to express in a relational or document store. I wanted to build a platform that uses the right datastore for each job and still behaves like one coherent backend.

## Approach

- **Polyglot persistence:** Neo4j holds the social graph (50K+ relationships); MongoDB holds profiles and content documents.
- **FastAPI microservices** front both stores behind one API surface, with JWT-based auth.
- **Cypher 2-hop traversals** power "people you may know" recommendations; full-text search runs across profiles and posts.
- **Three-layer test suite:** pytest for units, Locust for load, Selenium for end-to-end flows — all containerized with Docker and deployed on AWS.

## Result

A working graph-backed social platform demonstrating multi-datastore architecture, graph query design, and a test pyramid that actually exercises the system under load.
