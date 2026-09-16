# Guido Aspauzo Baez — Portfolio

Personal portfolio site: hero, about, experience timeline, skills, project highlights, and contact — built as a single static page, no build step required.

## Stack

- Plain HTML, CSS, and vanilla JS (no frameworks, no dependencies).
- `css/style.css` — glassmorphism design system (gradient blobs, glass cards, light/dark theme via `data-theme`).
- `js/main.js` — theme toggle (persisted in `localStorage`), mobile menu, scroll-reveal animations, active-section nav highlighting, and the rotating role text in the hero.

## Local preview

Just open `index.html` in a browser, or serve the folder:

```
python3 -m http.server
```

## Deploy

Static files only — works as-is on GitHub Pages or any static host.
