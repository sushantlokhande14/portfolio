---
title: "Smartphone Fall Detection"
subtitle: "Telling a fall from sitting down"
summary: "Fall detection and activity recognition from raw smartphone accelerometer and gyroscope data, comparing classical models, deep networks on raw windows and transfer learning from spectrograms. A 1D CNN detected falls with 99.35 percent accuracy, and held 98.1 percent when every test subject was unseen."
cover: "/covers/falldetect.svg"
tech: ["Python", "TensorFlow / Keras", "scikit-learn", "XGBoost", "CNN / LSTM", "Spectrograms"]
featured: false
order: 5.5
github: "https://github.com/sushantlokhande14/sensor-spectrogram-har-and-fall-prediction"
---

## Problem

A phone in a pocket feels a fall, but it also feels someone sitting down hard, jumping or dropping onto a bed. The useful question is whether a model can tell those apart on people it has never seen. Built for CS 286 (Wearable AI and mHealth) at SJSU with Mrunal Kotkar, on the MobiFall v2.0 dataset: 24 subjects, 4 fall types and 9 daily activities.

## Approach

- **Three tasks.** Fall vs. not-fall, the four fall types, and all thirteen activities.
- **Three model families.** XGBoost and other classical models on handcrafted features; an ANN, a 1D CNN and an LSTM directly on raw sensor windows; and transfer learning, both from UCI HAR pretraining and from ImageNet models (VGG16, ResNet50) fine-tuned on spectrograms of the signals.
- **Generalization, not just a split.** Every result is checked under leave-one-subject-out (24 folds) and leave-one-event-out (288 folds), not only a stratified split.

## Result

On binary fall detection with three-second windows, **the 1D CNN reached 99.35 percent accuracy (F1 0.993)**, ahead of the spectrogram models (VGG16 at 98.95) and XGBoost (95.09). Under leave-one-subject-out it held **98.14 percent**, so the model was learning falls rather than the people in the training set.
