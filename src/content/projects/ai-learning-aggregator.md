---
title: "AI Learning Aggregator"
subtitle: "The field, in one feed"
summary: "Keeping up with ML means checking five sites before breakfast. This hub pulls fresh papers, repos, and research from arXiv, GitHub, Papers with Code, and Google Scholar into one searchable feed, with saved lists, peer submissions, and a chatbot that answers from the hub."
cover: "/covers/rag.svg"
tech: ["Python", "Flask", "SQLAlchemy", "SQLite", "OpenAI", "BeautifulSoup", "Bootstrap"]
featured: false
order: 4
github: "https://github.com/sushantlokhande14/AILearningHub"
---

## Problem

The ML field moves daily and lives everywhere: new papers on arXiv, trending implementations on GitHub, benchmarks on Papers with Code, citations on Google Scholar. Keeping up means a morning ritual of five tabs, each with its own format, and no way to save what matters in one place.

## Approach

![AI Learning Aggregator architecture](/diagrams/aggregator-arch.svg)

- **Source connectors do the rounds so you don't.** The arXiv feed comes in through feedparser, repositories through the GitHub API, benchmarks through the Papers with Code API, and scholarly metadata through the `scholarly` library, with BeautifulSoup scraping where no API exists.
- **One schema for five formats.** Everything is normalized and stored in SQLite through SQLAlchemy — three core tables: Users, SavedItems, and PeerArticles.
- **Accounts that do something.** Flask-Login handles authentication and roles; signed-in users keep saved lists of papers, repos, and courses.
- **A community layer with a gate.** Anyone can submit an article; peer submissions pass through an approval workflow before they publish, so the feed stays useful.
- **An OpenAI-powered chatbot** sits on top, so you can ask the hub a question instead of paging through the feed.

## The stack

| Piece | Choice | Why |
| :-- | :-- | :-- |
| App | Flask + Jinja templates | server-rendered and simple |
| Data | SQLite via SQLAlchemy | Users, SavedItems, PeerArticles in one file |
| Sources | arXiv, GitHub API, Papers with Code, Google Scholar | the field, first-hand |
| Collection | feedparser, `scholarly`, BeautifulSoup | APIs where they exist, scraping where they don't |
| Auth | Flask-Login with roles | saved lists per user, gated submissions |
| Assistant | OpenAI chatbot | ask the hub, not a search bar |
| UI | Bootstrap 4 | responsive without a build step |

## Result

One place to track a fast-moving field: fresh content from four sources on every visit, personal saved lists worth coming back for, and a peer-review gate that keeps community submissions from turning into noise.
