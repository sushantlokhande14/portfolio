---
title: "TCP Sliding Window Simulator"
subtitle: "TCP, from Scratch"
summary: "I rebuilt TCP by hand over raw sockets. The handshake, the sliding window, the retransmissions when packets vanish, all of it, with a live dashboard watching every packet move."
cover: "/covers/tcp.svg"
tech: ["Python", "Sockets", "TCP"]
featured: false
order: 8
---

## Problem

You don't really understand TCP until you've implemented the parts everyone takes for granted: connection setup, flow control, and what happens when packets vanish.

## Approach

- Implemented the **three-way handshake**, **adaptive sliding-window sizing**, and **packet retransmission** from scratch over Python sockets.
- Built a **real-time telemetry dashboard** charting window size, throughput, and failed packets as the protocol runs.
- Stress-tested under high-bandwidth transfer, artificially lossy links, and abrupt client disconnects.

## Result

A working protocol simulator that demonstrates flow control adapting live to network conditions — and a much deeper mental model of why production TCP behaves the way it does.
