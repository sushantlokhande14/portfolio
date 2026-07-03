---
title: "Melody Metrics"
subtitle: "What makes a song a hit"
summary: "A million Spotify tracks and a pile of scraped Genius lyrics that shared no keys. I merged them into 139 thousand clean records, engineered features from both the audio and the words, and trained XGBoost to call a hit at 84 percent."
cover: "/covers/melody.svg"
tech: ["Python", "Pandas", "scikit-learn", "XGBoost", "NLP", "Jupyter"]
featured: false
order: 5
github: "https://github.com/sushantlokhande14/Predicting-Song-Popularity-Using-Lyrics"
---

## Problem

Does a song's popularity live in the sound or in the words? Answering that needs both halves in one table — and they arrive from different worlds. Spotify's audio features (a million-plus tracks from Kaggle) and lyrics scraped from Genius share no IDs, inconsistent artist spellings, and different notions of what a "track" even is.

## Approach

![Melody Metrics architecture](/diagrams/melody-arch.svg)

- **The merge is the hard part.** Artist and track names were normalized on both sides and joined, turning two incompatible datasets into 139,433 clean records with 39 columns each.
- **Features from both halves of a song.** Audio: danceability, energy, tempo, valence. Lyrical: unique word counts, sentiment polarity, and Genius page views as a popularity prior.
- **A model ladder, not a lucky pick.** Random Forest set the baseline; Logistic Regression, KNN, SVM, and an MLP were compared against it; XGBoost won.
- **Class imbalance handled honestly.** On the raw imbalanced multiclass problem XGBoost reached 74.28%. Rebalancing the classes and reframing the question as binary — hit or not — pushed it to 84.42%.

## The stack

| Piece | Choice | Why |
| :-- | :-- | :-- |
| Data | Spotify 1M+ tracks (Kaggle) + scraped Genius lyrics | the sound and the words, together |
| Join | normalized artist/track merge (Pandas) | 139,433 records from two keyless datasets |
| Features | audio (danceability, energy, tempo, valence) + lyric sentiment | both halves of every song |
| Models | RF, LR, KNN, SVM, MLP, then XGBoost | a ladder, so the winner earned it |
| Imbalance | class balancing + binary reframing | 74.28% → 84.42%, honestly |
| Workbench | Python, scikit-learn, Jupyter | every step explorable end to end |

## Result

**84.42% accuracy calling hit-or-not**, up from 74.28% on the naive framing — and the feature importances answer the original question: the sound matters most, but the words move the needle.
