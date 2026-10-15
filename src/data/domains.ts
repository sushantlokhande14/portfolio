// The domains the /projects index is organised by. A project can sit in as many
// domains as it genuinely belongs to; each listing carries one line on why it is
// there, so the same project reads differently depending on who is looking.
// Every project in src/content/projects must appear at least once (the build
// fails otherwise, see src/lib/domains.ts). The index ranks domains by how many
// projects they hold, so the order here only breaks ties.

export type Glyph =
  | 'spark'
  | 'nodes'
  | 'bolt'
  | 'search'
  | 'window'
  | 'chip'
  | 'eye'
  | 'shield'
  | 'database'
  | 'signal';

export interface DomainDef {
  id: string;
  name: string;
  // what the index headline cycles through: "Looking for <short>?"
  short: string;
  // compact label on the constellation map
  label: string;
  tagline: string;
  // oklch hue for this domain's glyph, glow and links
  hue: number;
  glyph: Glyph;
  // project id -> why it belongs here, in the order the domain page lists them
  projects: Record<string, string>;
}

export const DOMAINS: DomainDef[] = [
  {
    id: 'ai',
    name: 'AI & LLM Systems',
    short: 'AI & LLM systems',
    label: 'AI & LLM',
    tagline: 'Agent pipelines, LLM gateways and assistants, built to run every day rather than demo once.',
    hue: 295,
    glyph: 'spark',
    projects: {
      'autograde-ai':
        'Six specialized agents grade in parallel under Temporal, and a confidence gate sends only the shaky grades to a human.',
      relay: 'An LLM gateway that matches prompts by meaning, so 78 percent of requests never reach the model.',
      reelrank:
        'Answers free-text requests like "Arrival but funnier" with a two-tower retriever and a neural ranker.',
      'ai-learning-aggregator':
        'A study assistant grounded in real sources: every answer carries citations, and it says so when it does not know.',
      kairo: 'An AI patient assistant in text and voice, taken from an empty folder to shipped in under a week.',
      'duo-drops': 'A separate agent on Workers AI writes a brand new mini game every day.',
    },
  },
  {
    id: 'backend',
    name: 'Backend & Distributed Systems',
    short: 'distributed backends',
    label: 'Backend',
    tagline: 'Services, queues and coordinators that keep going when parts of them fail.',
    hue: 250,
    glyph: 'nodes',
    projects: {
      distcompile:
        'A gRPC coordinator schedules the build graph out of PostgreSQL, and workers pull tasks and survive crashes.',
      'autograde-ai': 'Temporal workflows, Kafka and gRPC between services, with Postgres, Redis and Qdrant behind them.',
      relay: 'An async FastAPI gateway with SSE streaming; the typical answer comes back in 44 milliseconds.',
      'duo-drops': 'One Durable Object per room keeps two phones in lockstep over WebSockets, on the free plan.',
      'graph-connect':
        'A FastAPI service over Neo4j and MongoDB that answers who knows who in two hops across 50 thousand connections.',
      'melody-metrics': 'C++ MapReduce on a Hadoop cluster joins a million records that shared no common keys.',
    },
  },
  {
    id: 'systems',
    name: 'Systems & Performance',
    short: 'systems & performance',
    label: 'Systems',
    tagline: 'C++ where every thread and every cache line counts, measured against the libraries people actually use.',
    hue: 38,
    glyph: 'bolt',
    projects: {
      proxima:
        'SIMD distance kernels in C++17: 1.8 times faster than hnswlib and 2.5 times faster than FAISS at 0.999 recall.',
      logicforge:
        'A work-stealing pool runs 3.0 to 3.5 times faster on 16 threads, with identical output at any thread count.',
      distcompile:
        'Content-hash caching ran the compiler 84 percent fewer times than make over a scripted 20-step edit workload.',
      rtlgen: 'C++17 with graph checks before a single file is written, built and tested under ASan and UBSan.',
      clockguard: 'A C++17 static checker with 16 rules, built on Yosys and kept clean under ASan and UBSan.',
    },
  },
  {
    id: 'search',
    name: 'Search, Retrieval & Recommendation',
    short: 'search & retrieval',
    label: 'Search',
    tagline: 'Vector indexes, semantic caches and two-stage retrieval, from the HNSW graph up.',
    hue: 195,
    glyph: 'search',
    projects: {
      proxima: 'My own HNSW index in C++, faster than the libraries everyone imports.',
      'hnsw-lab': 'Runs the real HNSW algorithm on points you can see and replays each query hop by hop.',
      relay: 'A semantic cache: prompts are matched by meaning through Proxima, not by exact text.',
      reelrank: 'Retrieve, then rank: a two-tower model pulls candidates through Proxima and a neural ranker reorders them.',
      'ai-learning-aggregator': 'Retrieval over vector embeddings grounds every answer in real source material.',
    },
  },
  {
    id: 'web',
    name: 'Full-Stack & Real-Time Web',
    short: 'full-stack web',
    label: 'Full-stack',
    tagline: 'End-to-end products with live front ends, shipped and running.',
    hue: 340,
    glyph: 'window',
    projects: {
      'duo-drops': 'A real-time PWA with Web Push written from scratch; surprise games land on both phones at once.',
      reelrank: 'A React and TypeScript front end over FastAPI, including movies in theaters this week.',
      kairo: 'React, TypeScript and FastAPI with voice through Vapi, shipped end to end in a week.',
      'graph-connect': 'A TypeScript front end and FastAPI back end for a social graph, running on AWS.',
      'hnsw-lab': 'A zero-dependency TypeScript and Canvas app you can click, drag and break on purpose.',
    },
  },
  {
    id: 'ml',
    name: 'Machine Learning & Vision',
    short: 'ML & vision',
    label: 'ML & vision',
    tagline: 'Deep learning ensembles for vision and recommendation, with numbers that hold up.',
    hue: 150,
    glyph: 'eye',
    projects: {
      'malware-classification':
        'Three vision models vote on malware rendered as images, across 17 families. Now a first-author paper on arXiv.',
      'palmprint-authentication': 'Four models study every palm scan and vote, reaching 99.75 percent AUC.',
      reelrank: 'A two-tower retrieval model and a neural ranker, built in PyTorch.',
      'melody-metrics': 'XGBoost on the cleaned data to find what actually makes a song popular.',
    },
  },
  {
    id: 'hardware',
    name: 'Hardware & EDA Tooling',
    short: 'hardware & EDA',
    label: 'Hardware',
    tagline: 'Compilers, generators and checkers for RTL, the tools chip teams lean on every day.',
    hue: 82,
    glyph: 'chip',
    projects: {
      logicforge:
        'Compiles SystemVerilog to a smaller gate netlist, cuts an 836K-gate benchmark by 80 percent, and proves it still computes the same thing.',
      rtlgen:
        'Generates synthesizable Verilog from JSON; all 1,200 generated configurations synthesize in Yosys.',
      clockguard:
        'Clock, reset and CDC checks that found all 570 injected bugs with no false alarms, plus a targeted testbench for each.',
    },
  },
  {
    id: 'security',
    name: 'Security & Identity',
    short: 'security',
    label: 'Security',
    tagline: 'Malware and biometric identity, approached as vision problems.',
    hue: 18,
    glyph: 'shield',
    projects: {
      'malware-classification':
        'Recognizes the malware family from a picture of the file instead of a byte signature. My thesis.',
      'palmprint-authentication': 'Contactless identity from a palm scan, verified by a four-model ensemble.',
    },
  },
  {
    id: 'data',
    name: 'Data Engineering & Databases',
    short: 'data engineering',
    label: 'Data',
    tagline: 'Big joins, graph databases and the pipelines in between.',
    hue: 118,
    glyph: 'database',
    projects: {
      'melody-metrics': 'A million messy records joined with C++ MapReduce on Hadoop, then queried in Hive.',
      'graph-connect':
        '50 thousand relationships in Neo4j for two-hop queries, with profiles and content in MongoDB alongside.',
    },
  },
  {
    id: 'networking',
    name: 'Networking & Protocols',
    short: 'networking',
    label: 'Networking',
    tagline: 'Protocols built by hand, from TCP’s sliding window to Web Push encryption.',
    hue: 222,
    glyph: 'signal',
    projects: {
      'tcp-simulator':
        'TCP rebuilt over raw sockets: the handshake, the sliding window and retransmission, with a live packet dashboard.',
      'duo-drops': 'WebSockets for live play, and Web Push message encryption (RFC 8291) written from scratch.',
    },
  },
];
