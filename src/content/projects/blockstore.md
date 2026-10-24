---
title: "BlockStore"
subtitle: "A storage engine that never loses an acknowledged write"
summary: "A multithreaded block storage engine in C++17 for Linux: block reads and writes, atomic batches, snapshots and CRC-32C checksums, with crash recovery from a write-ahead log and double-buffered checkpoints. Validated by 35 fault-injection scenarios that crash it at every file-system call, flip every byte of its metadata, and kill it mid-write with SIGKILL."
cover: "/covers/blockstore.svg"
tech: ["C++17", "Linux", "POSIX I/O", "Write-ahead logging", "Multithreading", "CMake", "Sanitizers"]
featured: true
order: 1.6
github: "https://github.com/sushantlokhande14/blockstore"
---

## Problem

A storage engine has one promise to keep: once a write is acknowledged, a crash must not lose it, and nothing must come back that was never written. Power can fail between any two system calls, writes can land half done, and `fsync` itself can fail. Getting this right is easy to claim and hard to prove.

## Approach

- **Redirect-on-write.** A write goes to a fresh physical block, and the block map is repointed only after the data and a small log record are durable. A torn write never damages live data, every block's checksum stays valid, and snapshots share blocks with the live volume for free.
- **Write-ahead log with group commit.** One commit thread turns every waiting writer's changes into one log group with one fsync. A group only counts on replay if its commit marker is intact, which makes multi-block batches atomic.
- **Recovery that tells a torn tail from damage.** Only the last group can be torn, so a bad record followed by a newer committed group is damage, and recovery refuses to paper over it. Two alternating checkpoint slots mean a crash mid-checkpoint costs a longer replay, not data. A failed fsync stops all writes rather than retrying.
- **Fault injection.** A simulated file system models what survives a power cut (unsynced writes dropped, kept, or torn sector by sector) and crashes the engine at every file-system call of a mixed workload. On top of that, every byte of the metadata and the log is flipped in turn, and real processes are killed mid-write. Every recovery is checked against a reference model and a full consistency check.
- **Read path.** A sharded CLOCK cache with admission control, an I/O thread pool that merges and parallelizes multi-block reads under O_DIRECT, and a block map split into 64 lock partitions, each measured on its own.

## Result

- **Recovery.** 35 fault-injection scenarios, 8,875 checked cases, all passing: torn data and log writes at every crash point, every byte of the checkpoints and the log flipped in turn, real processes killed with SIGKILL mid-write, mid-checkpoint and mid-recovery, and failed fsyncs. No crash lost an acknowledged write, and every recovery passed a full consistency check.
- **Bugs found by the suite.** One flipped header byte could make recovery discard a whole log segment of committed writes; salvaging past damage could name blocks that later writes had reused. Both are fixed and both scenarios now pass.
- **Read throughput** (1 GiB volume, 8 threads, O_DIRECT): **+25%** on uniform random 4 KiB reads, **3.5x** on 16-block batches, **8.6x** on skewed reads. Each technique was measured alone too. Through the kernel's page cache, skewed reads gained 73% but uniform reads lost 14%, since the kernel already holds the data; the benchmark write-up explains when each technique helps.
- **Checked with** ASan, UBSan and TSan in CI, on gcc and clang.
