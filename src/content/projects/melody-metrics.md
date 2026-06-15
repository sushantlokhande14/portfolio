---
title: "Melody Metrics"
subtitle: "What makes a song a hit"
summary: "A million messy music records that shared no common keys. I joined them with C++ MapReduce on a Hadoop cluster, then asked the clean data what actually makes a song popular."
cover: "/covers/melody.svg"
tech: ["C++", "Python", "Hadoop", "MapReduce", "Hive", "XGBoost"]
featured: false
order: 5
github: "https://github.com/sushantlokhande14/Predicting-Song-Popularity-Using-Lyrics"
---

## Problem

Music metadata lives in messy, heterogeneous sources that don't share clean keys. Joining a million-plus records across them — and doing it fast enough to iterate — is a distributed-systems problem before it's an ML problem.

## Approach

- **C++ MapReduce jobs** running on a Linux Hadoop cluster process 1M+ records.
- **Fuzzy joins** reconcile entities across heterogeneous sources that lack shared identifiers, producing a clean 140K-row analytical dataset.
- **Hive** sits on top for SQL-style exploration; orchestration is Bash, with a Flask layer for serving results.
- Downstream, **XGBoost** predicts song popularity and **K-means** clusters tracks by audio/lyric features.

## Result

An end-to-end pipeline from raw heterogeneous data to model predictions: 1M+ records in, 140K curated rows out, **84% downstream model accuracy** — and hands-on experience with the unglamorous reality of distributed data engineering in C++.
