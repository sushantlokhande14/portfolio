---
title: "clockguard"
subtitle: "Clock, reset and CDC checks with targeted testbenches"
summary: "A static checker for clock domains, reset trees, synchronizers, clock gating and cross-domain paths in Verilog, with 16 rules and a fix for each finding. For every violation it writes and runs a targeted testbench and draws the waveform at the first hazard. It found all 570 bugs injected into 870 generated designs with no false alarms, and the tests reproduced 89 percent of them."
cover: "/covers/clockguard.svg"
tech: ["C++17", "Yosys", "Verilog", "Icarus Verilog", "Python", "Clock-domain crossing", "Reset design", "ASan / UBSan"]
featured: true
order: 1.95
github: "https://github.com/sushantlokhande14/clockguard"
---

## Problem

Most chips run on several unrelated clocks. A signal that crosses between them without a synchronizer, a reset released without one, or a clock gate whose enable can change mid-pulse produces failures that are rare, timing dependent, and invisible to ordinary simulation, because RTL simulation never goes metastable. These bugs have to be found from the structure of the design, and once found, someone still has to understand them. I wanted a checker that does both: finds them before implementation, and shows each one happening.

## Approach

- **Netlist from Yosys.** Yosys reads and flattens the design and maps memories to flops; a C++ engine analyzes the result at bit level.
- **Clocks.** Every clock pin is traced back through buffers, inverters, gates and muxes to a primary input, a divider flop, or logic. Clock gates are checked for enable timing: an AND gate needs a latch closed while the clock is high, or a negedge flop, on the same clock.
- **Resets.** Every async reset is traced to its source, reset synchronizers are recognized from their D chains, and each consumer is checked against the domain its reset releases in. Reset-domain crossings are flagged too.
- **Crossings.** Synchronizers are recognized structurally, gray-coded buses from their `x ^ (x >> 1)` logic, and handshakes and async FIFO reads through a qualification rule: data is safe if every path from it passes a mux whose select depends on a synchronized signal from the same domain. Everything else is classified by shape into five CDC rules.
- **Debug output.** Each finding comes with its path, its clocks and a fix, plus text, Markdown and HTML reports of every domain, reset, synchronizer and crossing. With `--sim`, a testbench per violation runs unrelated clocks, releases resets 0.25 ns before a capture edge, and flags the moment hardware would be at risk; the first hazard is drawn as an SVG waveform.

## Result

On the example corpus, 8 correct designs (synchronizers, handshake, async FIFO, gray counter, clock gates, divided clock, combined resets) come back clean, and 19 broken ones each report exactly their rule. On **870 generated multi-clock designs**, there were no false alarms on the 300 clean ones, and **all 570 injected bugs** (19 variants over 15 rules) were reported at the block they were put in, at about 0.05 seconds per design.

The targeted testbenches **reproduced a hazard for 508 of the 570 bugs (89 percent)**, a median of 21 cycles after reset. The misses are glitches that need gate delays, which zero-delay RTL simulation can't produce, and the same monitors stayed quiet on 469 correct structures. For crossing bugs, the report points at a median of 2 nets instead of the 12 in the destination's fan-in cone. The bug classes and the checker are both mine, so this shows the checks hold up inside larger random designs, not that they catch everything.
