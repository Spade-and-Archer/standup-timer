# Standup Timer

A minimal, single-page timer for keeping daily standups on track. No build step, no dependencies — plain HTML, CSS, and JavaScript.

## Features

- **Per-speaker time**, saved to your browser (`localStorage`) so it's remembered next time.
- **Counts down, then counts up** — shows time remaining, then `+MM:SS` once a speaker goes over.
- **Color cues** — turns **orange** in the last minute, **red** once over time.
- **`Space`** (or the **Next speaker** button) advances to the next speaker and resets the clock.
- **Pause / resume** the timer at any point.
- **End-of-meeting items** — jot down follow-ups during the meeting; they persist locally.

## Running locally

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server
```

then visit http://localhost:8000.

## Deployment

Hosted with GitHub Pages, served from the `main` branch root.
