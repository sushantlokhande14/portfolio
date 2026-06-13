---
title: "Multimodal Palmprint Authentication"
summary: "Contactless biometric verification with a four-way deep learning ensemble — 99.75% AUC via late-fusion soft voting."
tech: ["Python", "PyTorch", "OpenCV", "FastAPI", "Docker", "CUDA"]
featured: false
order: 6
github: "https://github.com/sushantlokhande14/Multimodal-contactless-palmprint-verification-using-dual-networks-and-ensemble-scoring"
---

## Problem

Contactless palmprint verification has to cope with rotation, lighting, and scale variance that fingerprint sensors never see — a single model tends to overfit to one invariance and miss others.

## Approach

- **Four-way ensemble** combining CNN backbones with handcrafted texture features, so learned and engineered representations cover for each other's blind spots.
- **Late-fusion soft voting** over the four scorers' outputs for the final verification decision.
- CUDA-accelerated PyTorch training; FastAPI serving layer; Docker for reproducibility.

## Result

**99.75% AUC** on verification — strong evidence that ensemble diversity (deep + handcrafted) beats any single track on biometric robustness.
