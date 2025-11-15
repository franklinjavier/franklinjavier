# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal blog built with **Astro** and **Tailwind CSS**. The site is a modern, minimalistic blog focused on front-end development topics, written in Portuguese. Features a clean, professional design with dark mode support.

## Tech Stack

- **Framework**: Astro 5.x (static site generator)
- **Styling**: Tailwind CSS 3.x with Typography plugin
- **Package Manager**: pnpm
- **Language**: TypeScript (strict mode)
- **Content**: Markdown with frontmatter
- **Syntax Highlighting**: Shiki with Vesper theme
- **Dark Mode**: Class-based with localStorage persistence

## Commands

### Development
```bash
pnpm install      # Install dependencies
pnpm dev          # Start development server at http://localhost:4321
pnpm build        # Build for production (outputs to dist/)
pnpm preview      # Preview production build locally
```

## Architecture

### Content Collections

Blog posts are managed using Astro's Content Collections API:
- Located in `src/content/blog/`
- Schema defined in `src/content/config.ts`
- Required frontmatter: `title`, `date`
- Optional frontmatter: `description`, `author`, `tags`, `draft`

### Routing

- **Homepage** (`src/pages/index.astro`): Portfolio-style page with about section, work experience, tech stack, and recent blog posts
- **Blog Posts** (`src/pages/blog/[...slug].astro`): Dynamic route for individual blog posts
- **RSS Feed** (`src/pages/rss.xml.ts`): Auto-generated RSS feed

### Layouts

- **BaseLayout** (`src/layouts/BaseLayout.astro`): Base HTML structure, meta tags, dark mode script, global styles
- **PostLayout** (`src/layouts/PostLayout.astro`): Blog post template with navigation, title, date, and formatted content

### Components

- **ThemeToggle** (`src/components/ThemeToggle.astro`): Dark mode toggle with sun/moon icons and localStorage persistence

### Styling

Uses Tailwind CSS with custom configuration:
- Dark mode enabled with `darkMode: 'class'`
- Typography plugin for prose styling with dark mode support (`prose-invert`)
- Global styles in `src/styles/global.css` with Tailwind directives
- Pure black backgrounds in dark mode (`bg-black`) for Linear-style aesthetic
- All components include dark mode variants

### Dark Mode

- Class-based dark mode toggle
- Theme preference stored in localStorage
- Respects system preference (prefers-color-scheme)
- No flash on page load (theme script in `<head>`)
- Toggle component in navigation

### Syntax Highlighting

- Uses Shiki with Vesper theme
- All code blocks should include language identifiers (e.g., ` ```javascript `, ` ```css `, ` ```bash `)
- Configured in `astro.config.mjs`

## Content Management

### Creating a New Post

1. Create a new markdown file in `src/content/blog/`
2. Add frontmatter:
```markdown
---
title: Post Title
date: 2024-01-15
description: Optional description
tags: tag1, tag2
---

Your content here...
```
3. Add language identifiers to code blocks for syntax highlighting:
   - JavaScript/TypeScript: ` ```javascript ` or ` ```typescript `
   - CSS: ` ```css `
   - Bash/Shell: ` ```bash `
4. The post will automatically appear on the homepage and be available at `/blog/filename/`

### Drafts

Set `draft: true` in frontmatter to exclude from build.

## Build Output

- Static HTML files generated in `dist/`
- Permalink structure: `/blog/{slug}/index.html`
- RSS feed at `/rss.xml`

## Git Commit Guidelines

When creating git commits:
- **DO NOT** include "Generated with Claude Code" or "Co-Authored-By: Claude" in commit messages
- Use concise, descriptive commit messages
- Use bullet points for multiple changes

## Notes

- All blog content is in Portuguese
- Site uses strict TypeScript configuration
- Build includes type checking via `astro check`
- Service worker and manifest.json in `public/` for PWA support
- Professional content sourced from `public/cv.pdf`
