---
title: "rtlgen"
subtitle: "Synthesizable Verilog from a structured description"
summary: "A C++ generator that turns JSON design descriptions into synthesizable Verilog: module hierarchy, ports, connectivity, inserted pipeline and adapter logic. Graph checks run before anything is written. 1,200 generated configurations all synthesize in Yosys, and on 1,000 deliberately broken descriptions invalid output drops from 766 files to none."
cover: "/covers/rtlgen.svg"
tech: ["C++17", "CMake", "Verilog", "Yosys", "Icarus Verilog", "Python", "Graph algorithms", "ASan / UBSan"]
featured: true
order: 1.92
github: "https://github.com/sushantlokhande14/rtlgen"
---

## Problem

A lot of RTL is the same structure in different sizes: a datapath at 8 and 16 bits, a hub with four or eight channels, FIFOs of different depths. Generators write that Verilog from a short description, but a naive generator writes whatever the description says. Verilog then accepts more than it should: a width mismatch in a port connection just gets padded with a warning, a misspelled net can become a new implicit wire, and a combinational loop shows up much later, in synthesis or on silicon. I wanted a generator that checks the description as a graph and refuses to write broken RTL.

## Approach

- **Elaboration.** A JSON description lists modules, parameters, ports, instances, connections and tie-offs. Each module is specialized once per parameter set (`lane__W8`, `lane__W16`); widths can be expressions like `W+1` or `clog2(DEPTH)`. Unconnected clock and reset pins are wired automatically, and connections can ask for pipeline stages, zero/sign extension, truncation or inversion.
- **Fifteen checks before any output.** Unknown references, direction, undriven and multiply driven pins, widths and bit slices, parameters, ambiguous clocks, keyword names, recursion, and combinational loops. The loop check runs Tarjan's SCC on a port-level graph, with each submodule contributing an input-to-output summary computed leaves first, so a loop that only exists across two levels of hierarchy is still found. It reports the shortest cycle, so every step in the message is a real connection.
- **Deterministic output.** Names are claimed in description order, keywords and clashes are renamed with a warning, and the file uses `default_nettype none`. The same description gives the same bytes every time.
- **Yosys as the judge.** A Python harness generates configuration sweeps, injects faults into them, and accepts a file only if Yosys passes `hierarchy -check`, `check -assert` and `synth` without resizing any cell port. CI runs it under AddressSanitizer and UBSan.

## Result

1,200 distinct configurations across five design families: **all 1,200 synthesize**, all byte-identical on a second run, from 4 to 10,084 cells (178,827 lines of Verilog, 49 seconds on 12 jobs).

To measure what the checks prevent, I injected ten classes of realistic mistakes (wrong widths, missing or extra drivers, loops, bad parameters, typos, name clashes, swapped inputs) into 1,000 valid designs. With the checks off, Yosys rejected 766 of the outputs and silently accepted 234 broken ones. **With the checks on, no invalid file was written**: 600 were blocked with the right error, 200 were renamed into valid RTL, and the 200 that remain (swapped mux inputs, flipped constants) are structurally fine, which is exactly the limit of a structural check. Faulty output overall went from 1,000 files to 200.

Along the way a round-robin arbiter written with `%` made Yosys build divider trees and get killed for memory; rewriting it with lowest-set-bit isolation took a 50-design sweep from 129 seconds to 2.3.
