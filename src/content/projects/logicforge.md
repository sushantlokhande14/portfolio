---
title: "LogicForge"
subtitle: "A parallel compiler that shrinks circuits"
summary: "A C++ compiler that turns SystemVerilog into a smaller gate netlist and proves it still computes the same thing. Six optimization passes cut an 836K-gate benchmark by 80 percent, and optimizing independent logic regions on a work-stealing pool runs 3.0 to 3.5 times faster on 16 threads, with identical output at any thread count."
cover: "/covers/logicforge.svg"
tech: ["C++17", "CMake", "SystemVerilog", "Multithreading", "Work stealing", "ASan / TSan", "Linux"]
featured: true
order: 1.8
github: "https://github.com/sushantlokhande14/logicforge"
---

## Problem

Chip design tools turn a hardware description into logic gates, then spend most of their effort making that logic smaller and shallower without changing what it computes. The classic algorithms for that (constant propagation, structural hashing, balancing, simulation-based sweeping) live deep inside large tools like Yosys and ABC. I wanted to build the whole pipeline myself, make it use every core, and be able to prove every result correct.

## Approach

- **Front end from scratch.** A hand-written lexer and recursive-descent parser for a synthesizable SystemVerilog subset (parameters, `always_comb`, `always_ff`, `case`), then an elaborator that bit-blasts everything, adders, comparators and multipliers included, into a graph of one-bit gates kept in topological order.
- **Six passes, run to a fixpoint.** Constant propagation, Boolean simplification, structural hashing on an open-addressing table, dead-logic elimination (including registers nobody reads), Huffman-style depth balancing, and a sweep that finds gates computing the same function: random simulation proposes candidates, and an exhaustive check over their inputs proves each one before anything is merged.
- **Region-parallel optimization.** Union-find splits the graph into independent logic regions, which may share inputs but never a gate. Regions are optimized on a work-stealing thread pool, biggest first, and merged back in a fixed order, so the netlist is byte-identical for any thread count.
- **A proof and regression net.** Bit-parallel equivalence checking (64 patterns per machine word, exhaustive up to 16 inputs), 300 fuzzed designs per test run, a golden QoR file that fails on any unexplained change, and CI under AddressSanitizer, UBSan and ThreadSanitizer.

## Result

On an 836,371-gate generated benchmark the optimizer removes 80 percent of the gates. With 16 threads **the optimization stage runs 3.47 times faster** (3.02x to 3.47x across three benchmarks, medians of 7 runs), and the region phase inside it about 7 times. End to end the compile is about 2 times faster, because parsing, elaboration and writing the netlist are still single-threaded; the measured serial fraction puts that right at Amdahl's limit.

Getting there took real profiling. A per-thread scratch buffer made 16 threads slower than 8, and glibc's malloc arenas kept growing and trimming until threads were queuing on a kernel lock (page faults dropped from 16.7K to 752 once fixed). The smaller test designs show what the passes do: a deliberately wasteful module goes from 6,218 gates to the optimal 4, and a 16-bit parity tree from depth 15 to 4, every result proven equivalent to the original.
