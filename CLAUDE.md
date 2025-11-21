# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vietnamese educational web project documenting the seven maritime voyages of Admiral Zheng He (Trịnh Hòa, 1405-1433). The project uses a hybrid architecture combining Vite + React with vanilla JavaScript for content rendering.

## Build Commands

### Development
```bash
npm run dev
```
Starts the Vite development server with HMR (Hot Module Replacement).

### Production Build
```bash
npm run build
```
Builds the project for production using Vite (with Rolldown bundler).

### Preview Production Build
```bash
npm run preview
```
Locally preview the production build.

### Linting
```bash
npm run lint
```
Runs ESLint to check code quality. Configuration is in `eslint.config.js`.

## Architecture

### Hybrid Rendering System

The project uses **two separate HTML entry points** with different rendering approaches:

1. **index.html** - Main landing page
   - Uses vanilla JavaScript (`diary-loader.js`)
   - Dynamically loads voyage data from `src/data/journal.json`
   - Implements hash-based routing (`#v1`, `#v2`, etc.)
   - Renders chapter cards and lists without React

2. **voyage.html** - Detail page for individual voyages
   - Uses vanilla JavaScript (`voyage-loader.js`)
   - Query parameter-based routing (`?v=1`, `?v=2`, etc.)
   - Renders full voyage content with inline images
   - Navigation between voyages

3. **React components** - Currently minimal
   - `src/main.jsx` and `src/App.jsx` are boilerplate
   - React is loaded but not actively used for content rendering
   - Available for future interactive features

### Data Architecture

**Single Source of Truth**: `src/data/journal.json`
- Array of voyage objects with structure:
  - `id`: voyage identifier (e.g., "v1", "v2")
  - `title`: voyage title
  - `date`: voyage period (e.g., "1405 - 1407")
  - `content`: full narrative text (supports `\n` for line breaks, `\n\n` for paragraphs)
  - `images`: array of image paths
  - `imageCaptions`: optional array of image captions

**Image Inline Rendering**: `voyage-loader.js` implements a paragraph-to-image interleaving system where images are inserted after corresponding paragraphs (split by `\n\n`). Remaining images are displayed in a media grid.

### Navigation Flow

```
index.html (landing)
  └─> Shows voyage cards (1-7)
      └─> Click card → voyage.html?v=1
          └─> voyage-loader.js fetches journal.json
              └─> Renders specific voyage by ID
                  └─> Prev/Next buttons → voyage.html?v=N
```

### Configuration

`src/config.js` centralizes path constants:
- `VOYAGE_PAGE`: Points to "voyage.html" for cross-page navigation

### Styling

- **Bootstrap 5.3.0** via CDN for grid and utilities
- **Font Awesome 6.4.0** for icons
- **Google Fonts**: Noto Serif + Noto Sans for Vietnamese text
- Custom CSS:
  - `src/styles/diary.css` for index.html
  - `src/styles/voyage.css` for voyage.html

## Key Development Patterns

### Adding New Voyages

1. Add entry to `src/data/journal.json` with sequential ID (e.g., "v8")
2. Place images in `src/assets/image/chuong8/` (following existing naming convention)
3. Update image paths in the JSON entry
4. Navigation buttons will automatically include the new voyage

### Modifying Content

- All text content lives in `journal.json`
- HTML escaping is handled automatically by `voyage-loader.js`
- Newlines are preserved and converted to `<br>` or `<p>` tags

### Working with Images

- Images paths are relative to project root (e.g., `src/assets/image/chuong1/h1.jpg`)
- Images are lazy-loaded (`loading="lazy"`)
- Captions are optional via `imageCaptions` array
- Default caption fallback: "Hình ảnh chuyến đi"

## Important Notes

- **Do not remove React**: While currently unused, React infrastructure is in place for future interactive features
- **Vite uses Rolldown**: This project uses `rolldown-vite@7.1.14` (Vite experimental bundler) instead of standard Vite
- **Vietnamese language**: All user-facing content is in Vietnamese; preserve encoding and diacritics
- **Hash vs Query routing**: `index.html` uses hash routing (`#v1`), `voyage.html` uses query params (`?v=1`) - do not mix these
- **Image organization**: Each voyage has a dedicated folder (`chuong1`, `chuong2`, etc.) for images

## Project Structure Context

```
src/
├── assets/image/          # Voyage images organized by chapter (chuong1-7)
├── data/journal.json      # Single source of truth for all voyage data
├── styles/                # CSS files for different pages
├── config.js              # Centralized configuration
├── diary-loader.js        # Index page rendering logic
├── voyage-loader.js       # Detail page rendering logic
├── main.jsx               # React entry point (minimal usage)
└── App.jsx                # React root component (boilerplate)
```
