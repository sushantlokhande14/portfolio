---
title: "Connect"
subtitle: "An Android app where every architecture decision has a test or a number behind it"
summary: "A native Android social discovery app in Kotlin and Jetpack Compose: accounts, a swipeable deck, profiles, chat that works offline, and push. Built in clean layers with Hilt, Retrofit and Room, and treated as a test bed: 213 tests drive it through a fault-injecting backend, and a benchmark puts a number on what the loading strategy is worth."
cover: "/covers/connect.svg"
tech: ["Kotlin", "Jetpack Compose", "MVVM", "Hilt", "Coroutines & Flow", "Retrofit", "Room", "Firebase Cloud Messaging", "Robolectric"]
featured: true
order: 1.58
github: "https://github.com/sushantlokhande14/connect-android"
---

## Problem

It is easy to say an Android app uses MVVM, repositories and coroutines. It is harder to say what those choices bought. Does loading five things at once actually make the screen faster, and by how much? What happens when an access token expires while five requests are in flight? When a message is sent twice because the first response was lost? Most sample apps never find out, because nothing in them ever fails.

## Approach

- **Layers that cannot leak.** A pure Kotlin domain module holds the models, repository interfaces and use cases. Feature modules depend on it and on the design system, never on the data layer, so a screen cannot import Retrofit or Room even by accident. Hilt wires the implementations in at the app module.
- **A backend that behaves, and misbehaves on request.** An in-memory implementation of the API with tokens that expire and rotate, a latency model, and fault injection: server errors, timeouts, dropped connections, and responses lost after the server already acted. The demo build runs it inside the app, so the app needs no setup; the tests run it behind a real socket.
- **Loading that is concurrent on purpose.** The discovery screen needs five things. They are started together, and treated differently: three are required and the first to fail cancels the rest, two are optional and the screen is drawn without them.
- **Failure paths with owners.** Token refresh is single-flight, because refresh tokens are single-use and five requests fail together. Chat reads only from Room, so it works offline and survives a restart. A message carries an idempotency key, so a retry can never store it twice.
- **One end-to-end test file, two runtimes.** The same tests drive the real activity on the JVM under Robolectric in half a minute, and on an emulator.

## Result

- **Screen load.** On a simulated LTE profile, loading the discovery screen fell from a median of **1,172 ms to 430 ms (63%)** against a naive sequential loader, over 30 paired runs. Caching the profile and filters removed two of five requests and no time at all, because the slowest request still sets the pace; it only pays off on a quick return, at 170 ms.
- **Tests.** **213 automated tests, all passing**, from use cases on virtual time up to 11 flows through the real UI: sign-in, a failed load with retry, a match, a message, a push, a notification tap, a session ended by the server.
- **Regression scenarios.** **26 of 30** defined behaviours have a passing automated test. The four that do not are listed with the reason: a real process kill, real Firebase delivery, a real radio, a screen-reader walkthrough.
- **What the tests found.** The unread badge was invisible to screen readers. A fast swipe could be decided from a stale position. OkHttp silently replays requests, POSTs included, when a pooled connection drops, which made four "offline" tests pass for the wrong reason. And the first version of the benchmark itself was wrong twice; the write-up says how.
