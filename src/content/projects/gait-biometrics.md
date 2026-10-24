---
title: "Gait Biometrics"
subtitle: "Who you are, from how you walk"
summary: "Identifying and verifying people from the way they walk, using a phone's accelerometer and gyroscope. A feature-based network identified walkers with 90 percent accuracy and verified them at a 3 percent equal error rate; an LSTM on the raw signal verified at 2 percent."
cover: "/covers/gait.svg"
tech: ["Python", "TensorFlow / Keras", "LSTM", "PCA", "NumPy", "scikit-learn"]
featured: false
order: 6.5
github: "https://github.com/sushantlokhande14/Gait-biometrics-using-neural-networks"
---

## Problem

Passwords can be shared and faces can be photographed, but the rhythm of someone's walk is hard to fake and costs nothing to collect from a phone already in their pocket. Built for CS 288 (Biometric Security with AI) at SJSU: can a small network tell ten people apart by their gait, and can it reject impostors?

## Approach

- **Signal preparation.** Accelerometer and gyroscope combined into a six-channel signal, cut into five-second windows with 50 percent overlap, with z-score outlier clipping and a moving-average filter.
- **Two models.** A feedforward network on 78 statistical and frequency features reduced to 10 with PCA, and a stacked LSTM on the raw 250 x 6 windows.
- **Two tasks.** Identification (which of ten people is this) and verification (is this the claimed person), scored with accuracy, AUC and equal error rate under five-fold cross-validation.

## Result

| Model | Task | Accuracy | EER |
| --- | --- | --- | --- |
| Feature network | Identification | 0.90 | n/a |
| LSTM | Identification | 0.57 | n/a |
| Feature network | Verification | 0.98 | 0.03 |
| LSTM | Verification | 0.97 | 0.02 |

The handcrafted features won identification by a wide margin; the LSTM underfit on a dataset this small. For verification both separated users cleanly (AUC 0.99).
