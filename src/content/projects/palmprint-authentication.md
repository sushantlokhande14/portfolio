---
title: "Multimodal Palmprint Authentication"
subtitle: "Show of Hands"
summary: "Contactless identity from the palm of your hand. Deep, texture, and frequency features are fused into a Siamese embedding, then a four stage ensemble scores the match, reaching 99.75 percent AUC."
cover: "/covers/palmprint.svg"
tech: ["Python", "PyTorch", "OpenCV", "EfficientNet", "ViT", "Triplet loss"]
featured: false
order: 6
github: "https://github.com/sushantlokhande14/Multimodal-contactless-palmprint-verification-using-dual-networks-and-ensemble-scoring"
---

## Problem

Contactless palmprint verification has to cope with rotation, lighting, and scale variance that fingerprint sensors never see. A single model tends to overfit to one invariance and miss the others — and in biometrics, a confident wrong answer is the worst possible failure.

## Approach

![Palmprint verification architecture](/diagrams/palmprint-arch.svg)

- **Preprocessing earns its keep first:** Gaussian smoothing, Otsu thresholding to extract the palm ROI, and CLAHE enhancement so every scan enters the pipeline looking comparable.
- **Three complementary feature tracks** read the same palm differently: deep embeddings from EfficientNet-B4, ResNet-152, and ViT-B/16; handcrafted texture via LBP and KAZE; and frequency-domain structure via Gabor filters, DWT, and DCT — the ridge patterns live there.
- **Metric learning fuses the tracks:** concatenated features feed a Siamese dual-network trained with triplet loss, producing a 256-dimensional L2-normalized embedding where the same hand lands close and different hands land far.
- **A four-stage ensemble scores the match:** cohort normalization, multi-template fusion, adaptive matcher fusion, and quality-based score filtering — four safeguards before the system says yes.

## The stack

| Piece | Choice | Why |
| :-- | :-- | :-- |
| Preprocess | Gaussian, Otsu ROI extraction, CLAHE (OpenCV) | comparable palms before any feature is computed |
| Deep track | EfficientNet-B4, ResNet-152, ViT-B/16 | three architectures, three ways to read a palm |
| Texture track | LBP, KAZE | classic descriptors still earn a vote |
| Frequency track | Gabor, DWT, DCT | ridge structure is a frequency story |
| Metric learning | Siamese dual-network, triplet loss, 256-d embedding | same hand close, different hands far |
| Scoring | cohort norm · multi-template · adaptive fusion · quality filter | four safeguards before a yes |
| Evaluation | ROC, AUC, EER, TAR protocols | verification measured the standard way |

## Result

**99.75% AUC** on verification — evidence that modality diversity (deep + texture + frequency) plus disciplined score fusion beats any single track on biometric robustness.
