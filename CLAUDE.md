# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static website for Vegas Pizza Las Originales, a pizza restaurant in Guatemala. Hosted on GitHub Pages at `vegaspizzalasoriginales.com`. No build system.

## Branches & Deployment

There are 2 branches. GitHub Pages deploys exclusively from the `deployProduccion` branch (root `/`). Pushing to `main` does **not** trigger a deploy — changes must be merged into `deployProduccion` to go live. No CI/CD pipeline.

Workflow: develop and commit on `main` → merge into `deployProduccion` to publish.

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
- `opciones` — optional string array (e.g. `["Pepperoni","Jamón","Carne"]`); triggers a selection modal before adding to cart. Products with variants (multiple ingredient choices) must use this field.

**`script.js`** fetches `productos.json`, filters by `mostrarProducto`, groups by category/subcategory, and renders the entire product grid dynamically. Category filter tabs are built from the data (not hardcoded).

**Shopping cart** is fully client-side with `localStorage` persistence (key: `vp_carrito`). Cart state lives in a module-level `carrito` array. Each cart item has a `key` field (`id_opcion`) as unique identifier to support the same product with different ingredient options as separate line items. Key functions: `agregarAlCarrito(producto, opcion?)`, `cambiarCantidad(key, delta)`, `quitarDelCarrito(key)`, `vaciarCarrito`, `generarMensajeWhatsApp`. The cart panel is a fixed bottom drawer on mobile and a right sidebar (420px) on desktop, toggled via CSS classes `abierto`/`visible`. Ordering sends a pre-formatted WhatsApp message with chosen options included (`wa.me/50255727562`).

**Ingredient selection modal** (`crearModalOpciones` / `mostrarModalOpciones`) — generated once on DOMContentLoaded and appended to `<body>`. Appears automatically when clicking "+ Agregar" on a product that has `opciones`. Controlled via `#opciones-overlay` with class `visible`.

**Sticky order bar** (`#carrito-barra`) — fixed at bottom, hidden when cart is empty, slides up when items are added. Shows item count and total; clicking anywhere opens the cart panel. Toggled via class `visible` in `actualizarHeaderCarrito`. Also adds `carrito-barra-activa` to `<body>` to push footer up (`padding-bottom: 68px`) and hide the WhatsApp float button via CSS.

**WhatsApp float button** (`.whatsapp-float`) — visible only when the cart is empty. Hidden automatically via CSS rule `body.carrito-barra-activa .whatsapp-float { opacity:0; pointer-events:none }` when the sticky bar is active.

**`style.css`** / **`styleMin.css`** — `style.css` is the source of truth for development. `styleMin.css` is the **only stylesheet loaded by the browser** (via `<link rel="preload">` in `index.html`). Keep both in sync — any CSS change in `style.css` must be reflected in `styleMin.css` or it will have no effect in the browser. Do not minify during active development sessions; sync `styleMin.css` when merging to `deployProduccion`.

## Image Conventions

- All images live in `img/`
- Every product image should exist in both `.jpg` and `.webp` formats
- Product cards use `<picture>` tags with WebP source + JPG fallback
- Reference only the filename (without path) in `productos.json`; `script.js` prepends `img/`

## Language & Locale

- Site is entirely in Spanish
- Currency is Guatemalan Quetzales (Q prefix)
- Phone: +502 country code
