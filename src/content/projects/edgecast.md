---
title: "EdgeCast"
subtitle: "Media over QUIC, WebRTC and HLS on the same bad network"
summary: "A single-command testbed that runs three live media delivery models side by side under controlled network impairment: a five-region Media over QUIC relay tree, a WebRTC SFU and HLS. MoQ reached first media fastest in seven of eight network profiles, and a controlled A/B showed that pinning the publisher's bitrate cut stalls by 72 to 83 percent with goodput unchanged."
cover: "/covers/edgecast.svg"
tech: ["Go", "QUIC (quic-go)", "WebRTC (Pion)", "HLS", "Docker Compose", "Prometheus", "Grafana"]
featured: true
order: 1.65
github: "https://github.com/sushantlokhande14/edgecast"
---

## Problem

Media over QUIC is the IETF's bet on what comes after WebRTC and HLS for live video, but most comparisons between them are anecdotes measured on different networks with different clients. I wanted the three delivery models on the same footing, under the same impairments, measured the same way, so the differences would belong to the architectures rather than to the test setup.

## Approach

- **One Go binary, 21 containers.** A MoQ-style relay tree over quic-go (an origin and four regional edges with stream-per-group delivery, late-join group caching, pull-through and backpressure), a Pion v4 WebRTC SFU, and a live HLS origin with ABR players, all started by `docker compose up`.
- **A userspace network emulator.** Docker Desktop's WSL2 kernel has no `sch_netem`, so impairment runs inside the processes: an impairing `PacketConn` under QUIC and WebRTC, and a modeled TCP wrapper under HLS. That made the testbed portable to any Docker host with no privileged containers.
- **An experiment controller.** It runs a protocol x network profile x repetition matrix, restarts sessions for every run, injects loss bursts and relay failures, and writes CSV and markdown summaries with per-second session timelines. Prometheus scrapes every component and Grafana dashboards ship with the repo.

## Result

Across 72 matrix runs, a 9-run controlled A/B and a fault-injection experiment:

- **Startup.** MoQ reached first media fastest in seven of eight profiles (239 ms against WebRTC's 688 and HLS's 1,269 on a clean network), because the relay serves a joining viewer the group already in flight, keyframe first. The eighth, mobile 3G, was a statistical tie.
- **Adaptation.** MoQ viewers stalled badly on constrained profiles while the publisher held its top bitrate: it was adapting to its own uplink and could not see the viewers' last mile. Pinning the publisher from 5,000 to 1,000 kbps, the only change, **cut stalled time by 72 to 83 percent with goodput unchanged**. Offering five times the bitrate bought nothing. That is why the IETF design adapts at the subscriber, by switching tracks.
- **Honest accounting.** WebRTC's stall metric barely moved while millions of its packets were destroyed at the bottleneck, so its loss shows up in the network, not in the metric. The relay drops whole groups and keeps its degradation visible.
- **A real bug.** One A/B run reported 458 seconds of end-to-end latency. A publisher restart reset group sequence numbers, and the relay's "only newer groups" filter then silently blackholed all four edge regions. Each track now carries a generation number, and the A/B was rerun on the fixed build.
