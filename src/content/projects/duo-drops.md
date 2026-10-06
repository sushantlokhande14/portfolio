---
title: "Duo Drops"
subtitle: "Live mini games for two people far apart"
summary: "A real-time multiplayer PWA I built for my long-distance girlfriend and me. Surprise games drop onto both phones at random times when we're both awake, we play live for a minute, and a separate AI agent writes a new game every day. One Durable Object per room, Web Push written from scratch, and it runs for $0 on Cloudflare's free plan."
cover: "/covers/duodrops.svg"
tech: ["Cloudflare Workers", "Durable Objects", "WebSockets", "Workers AI", "Web Push (RFC 8291)", "JavaScript", "PWA"]
featured: true
order: 2.8
github: "https://github.com/sushantlokhande14/duo-drops"
live: "https://duo-drops.duo-drops.workers.dev"
---

## Problem

My girlfriend and I are long distance. Most of our time together isn't long calls, it's small gaps: a few minutes on a break or before bed, in two different time zones. Texting gets repetitive and video calls need both people free at once. I wanted something that fits those gaps, is genuinely fun, works on her Android and my iPhone, and costs nothing to run.

## Approach

Duo Drops schedules a few surprise **Drops** a day, only in hours when both players are awake in their own time zones. Both phones get a push notification, both players tap in, and they play a short live game together: Mind Meld (match answers), Speed Duel (five micro races), Doodle Guess (live drawing) and a This-or-That that's new every day.

- **One Durable Object per room.** Each pair gets its own single-threaded stateful server with SQLite storage and hibernating WebSockets. It owns the room state, plans Drop times and fires them with DO alarms, runs every game server-side (clients never receive an answer before the reveal), and relays doodle strokes live. Rooms share nothing, which is also the isolation boundary.
- **Web Push without libraries.** Notifications are encrypted per RFC 8291 (ECDH P-256, HKDF, AES-128-GCM) and signed with VAPID (RFC 8292) directly on WebCrypto, so it runs inside a Worker with zero dependencies. A test decrypts the output with an independent implementation (`http_ece`) and verifies the ES256 JWT.
- **A separate daily agent.** A second Worker on a cron asks Workers AI (Llama 3.3 70B, falling back to 8B) for a daily pack: a theme, a small real-life task, six This-or-That pairs, and themed prompts and drawing words for the other games. Every pack passes a validation gate (length caps, no links, a word blocklist, emoji and charset checks) before it's stored in KV, and if both models fail it falls back to a deterministic pack seeded by the date. The AI can make the day better but can't break the app.
- **Built for strangers, not just us.** Invites carry a one-time key in the URL fragment so it never reaches a server; device tokens travel in the `Authorization` header or the WebSocket subprotocol, never in URLs; per-IP rate limits, message size caps, a strict CSP, and players only ever see each other's name, avatar, local time and online status. Either player can delete the room, and idle rooms clean themselves up.
- **No build step.** The frontend is plain ES modules, an installable PWA with a pastel, very-not-enterprise UI.

## Result

It's live at the link above and open to anyone. 15 unit tests cover the game rules, the daily-pack gate, the agent's model-fallback chain and the push crypto, and I verified every game end to end with two browsers playing each other, plus the scheduled-Drop path firing from a real alarm.

The whole thing costs $0/month: Workers, Durable Objects, KV and Workers AI all stay inside Cloudflare's free allowances, and on the free plan they stop at the limit instead of billing. One bug worth mentioning because it shipped: a PowerShell 5.1 in-place edit re-encoded a UTF-8 source file as ANSI and garbled every emoji in the server's messages. It went to production before I caught it, and the fix (plus a rule to never edit UTF-8 source through `Get-Content`/`Set-Content`) went out the same day.
