# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static website for Vegas Pizza Las Originales, a pizza restaurant in Guatemala. Hosted on GitHub Pages at `vegaspizzalasoriginales.com`. No build system.

## Branches & Deployment

There are 3 branches. GitHub Pages deploys exclusively from the `deployProduccion` branch (root `/`). Pushing to `main` or other branches does **not** trigger a deploy — changes must be merged into `deployProduccion` to go live. No CI/CD pipeline.

## Tech Stack

- Vanilla HTML/CSS/JavaScript (no framework, no bundler)
- Bootstrap 5.3.3 via CDN
- Google Fonts (Fredoka, Poppins) via CDN
- Google Analytics GA4 (ID: G-3GY0Y6ZDL9)

## Architecture

**`productos.json`** is the product database. All product catalog changes go here. Key fields:
- `mostrarProducto: "si"/"no"` — toggles product visibility without deleting it
- `precio_descuento` — optional sale price (renders with strikethrough original + green discount)
- `promocion: "si"/"no"` — shows "OFERTA!" badge overlay on the card
- `categoria` / `subcategoria` — controls grouping and filter tabs

**`script.js`** fetches `productos.json`, filters by `mostrarProducto`, groups by category/subcategory, and renders the entire product grid dynamically. Category filter tabs are built from the data (not hardcoded). The "Pollo y Hamburguesas" section uses static placeholder images (`pollo1-4.jpg`).

**`style.css`** / **`styleMin.css`** — `style.css` is the source of truth for development. Only update `styleMin.css` when merging to `deployProduccion` (production). Do not minify during development.

## Image Conventions

- All images live in `img/`
- Every product image should exist in both `.jpg` and `.webp` formats
- Product cards use `<picture>` tags with WebP source + JPG fallback
- Reference only the filename (without path) in `productos.json`; `script.js` prepends `img/`

## Language & Locale

- Site is entirely in Spanish
- Currency is Guatemalan Quetzales (Q prefix)
- Phone: +502 country code
