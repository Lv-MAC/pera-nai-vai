# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Pera nai Vai** is a collection of browser-based utility tools designed primarily for users in Bangladesh. All tools run entirely client-side with no server processing, ensuring privacy and instant results. The project is built with Vite as the build tool and uses vanilla JavaScript (no framework).

## Development Commands

### Running the Development Server
```bash
npm run dev
```
Starts Vite development server with hot module replacement.

### Building for Production
```bash
npm run build
```
Optimizes and bundles all assets for production deployment.

### Preview Production Build
```bash
npm run preview
```
Serves the production build locally for testing before deployment.

## Architecture & Code Structure

### Multi-Page Application Pattern
This is a **multi-page application (MPA)**, not a single-page app. Each tool has:
- Its own HTML file (e.g., `jpeg-compressor.html`, `qr-generator.html`)
- Its own JavaScript module (e.g., `jpeg-compressor.js`, `qr-generator.js`)
- Shared global assets (`theme.js`, `tools.css`)

The landing page (`index.html`) serves as the tool directory.

### Tool Architecture
Each tool follows a class-based pattern:
1. **Class constructor** initializes state and DOM references
2. **`initializeElements()`** caches DOM element references
3. **`attachEventListeners()`** sets up event handlers
4. **Tool-specific methods** implement core functionality
5. **Client-side processing** - all data processing happens in the browser using Canvas API, Web APIs, or pure JavaScript

Example structure:
```javascript
class ToolName {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        // Cache DOM elements
    }

    attachEventListeners() {
        // Bind event handlers
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ToolName();
});
```

### Theme System

**Color Palette: Black, White & Red**
The site uses a minimalist black, white, and red color scheme:

**Light Mode:**
- Background: White (#ffffff)
- Text: Black (#000000)
- Primary accent: Red (#DC2626)
- Secondary accent: Light red (#EF4444)

**Dark Mode:**
- Background: Pure black (#000000)
- Text: White (#ffffff)
- Primary accent: Red (#DC2626)
- Card backgrounds: Dark gray (#1a1a1a)

**Special Case - Burger Menu:**
- Light mode: Black text
- Dark mode: Red text (#DC2626 for headings, #EF4444 for descriptions)

**Implementation:**
- `data-theme` attribute on `<html>` element (managed by `theme.js`)
- CSS custom properties defined in `tools.css`:
  - `--primary-color`, `--primary-hover`, `--secondary-color`
  - `--bg-color`, `--card-bg`, `--text-primary`, `--text-secondary`
- localStorage persistence (`localStorage.getItem('theme')`)
- Tweet-to-image page uses both `tools.css` and `style.css` for layout-specific styles

**CSS Files:**
- `tools.css`: Global theme and shared component styles (used by all pages)
- `style.css`: Tweet-to-image specific layout styles (aliases theme variables for compatibility)

### Key Technologies Used
- **Canvas API**: For image manipulation (JPEG compressor, photo resizer, tweet-to-image)
- **QR Code Libraries**: External QR generation libraries for QR code tool
- **Regex Processing**: For email extraction and text parsing
- **Unicode Character Mapping**: For Bangla converter (Unicode to Bijoy encoding)
- **External APIs**: Tweet-to-image uses Twitter oEmbed API with CORS proxy fallback

### Bangladesh-Specific Features
Several tools are designed for Bangladesh use cases:
- **Photo Resizer**: Presets for Passport, NID, Visa, and government job applications
- **MFS Helper**: Fee calculators for bKash, Nagad, and Rocket
- **Land Converter**: Bangladeshi land units (Bigha, Katha, Shotok, Acre)
- **Financial Calculators**: EMI, DPS, and FDR calculators for Bangladeshi banks
- **Bangla Converter**: Converts modern Unicode (Avro) to legacy Bijoy Classic format for DTP work

## Adding a New Tool

When creating a new tool:

1. **Create the HTML file** (`tool-name.html`):
   - Copy structure from existing tool HTML
   - Include `<link rel="stylesheet" href="tools.css?v=1.0.0">`
   - Include `<script src="theme.js" defer></script>`
   - Include `<script src="tool-name.js" defer></script>`

2. **Create the JavaScript module** (`tool-name.js`):
   - Use the class-based pattern shown above
   - Implement client-side processing only
   - Follow privacy-first principles (no data uploads)

3. **Add to landing page** (`index.html`):
   - Add a new `<div class="tool-card">` in the tools grid
   - Include icon, title, description, feature tags, and link

4. **Styling**:
   - Use existing CSS custom properties from `tools.css`
   - Ensure dark theme compatibility

## Privacy-First Principles

All tools MUST:
- Process data entirely in the browser (client-side only)
- Never upload user data to external servers
- Work offline where possible
- Use CORS proxies only when absolutely necessary (e.g., fetching public data)

## Development Notes

- **No build step required for development**: Vite serves files directly
- **No framework dependencies**: Pure vanilla JavaScript
- **Browser compatibility**: Modern browsers with ES6+ support
- **File naming**: Use kebab-case for HTML/JS files (e.g., `photo-resizer.html`)
- **Class naming**: Use PascalCase for JavaScript classes (e.g., `JPEGCompressor`)
