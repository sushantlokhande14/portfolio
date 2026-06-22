---
title: "Encore"
subtitle: "Your next favorite, before you ask"
summary: "A movie recommender that learns from the films themselves, not your history. It turns each movie's genres, cast, director, and plot into a vector and serves up the closest matches by similarity, all through a simple Streamlit app."
cover: "/covers/encore.svg"
tech: ["Python", "scikit-learn", "Pandas", "Streamlit"]
featured: false
order: 9
github: "https://github.com/sushantlokhande14/MovieRecommendationUsingML"
---

## Problem

Most recommenders need a pile of user ratings before they can say anything useful, which leaves new users and new titles out in the cold. I wanted something that could recommend a movie from the movie itself, with no account and no history to fall back on.

## Approach

Encore is a content-based recommender. It takes each film's genres, cast, director, and plot summary, turns that text into a bag-of-words vector with scikit-learn's CountVectorizer, and measures how close two movies are with cosine similarity. Ask for one title and it returns the nearest matches. The whole thing runs as a small Streamlit app over the TMDB 5000 dataset.

## Result

A working recommender you can try in the browser: type in a movie you like and get a ranked list of similar ones in about a second. It is simple on purpose, and it is the base I plan to fork into something bigger that pulls in live ratings and current titles.
