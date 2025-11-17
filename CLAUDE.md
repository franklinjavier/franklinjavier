# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a bilingual personal blog built with **Astro** and **Tailwind CSS**. The site is a modern, minimalistic blog focused on front-end development topics. Features a clean, professional design with dark mode support.

### Internationalization (i18n)

- **Default language**: English (EN) at root URLs
- **Secondary language**: Portuguese (PT-BR) at `/pt-br/` URLs
- **Translation dictionary**: `src/i18n/ui.ts` contains all UI strings for both languages
- **IMPORTANT**: NEVER use hardcoded text in components or pages - ALWAYS use the translation dictionary via `useTranslations(lang)` function
- All blog posts must exist in both languages with matching `translationKey` in frontmatter

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
- Required frontmatter: `title`, `date`, `lang` ('en' or 'pt-br'), `translationKey`
- Optional frontmatter: `description`, `author`, `tags`, `draft`
- English posts are at root level (e.g., `my-post.md`)
- Portuguese posts are in subdirectory (e.g., `pt-br/meu-post.md`)
- Both language versions must have the same `translationKey` to link them together

### Routing

- **Homepage EN** (`src/pages/index.astro`): Uses `<HomePage lang="en" />` component
- **Homepage PT-BR** (`src/pages/pt-br/index.astro`): Uses `<HomePage lang="pt-br" />` component
- **Blog Index EN** (`src/pages/blog/index.astro`): Uses `<BlogIndex lang="en" />` component
- **Blog Index PT-BR** (`src/pages/pt-br/blog/index.astro`): Uses `<BlogIndex lang="pt-br" />` component
- **Blog Posts EN** (`src/pages/blog/[...slug].astro`): Dynamic route for English blog posts
- **Blog Posts PT-BR** (`src/pages/pt-br/blog/[...slug].astro`): Dynamic route for Portuguese blog posts
- **RSS Feed** (`src/pages/rss.xml.ts`): Auto-generated RSS feed

### Layouts

- **BaseLayout** (`src/layouts/BaseLayout.astro`): Base HTML structure, meta tags, dark mode script, global styles
- **PostLayout** (`src/layouts/PostLayout.astro`): Blog post template with navigation, title, date, and formatted content

### Components

**IMPORTANT PRINCIPLE**: Create reusable components that accept `lang` prop instead of duplicating code for each language.

- **HomePage** (`src/components/HomePage.astro`): Reusable homepage component, accepts `lang` prop
- **BlogIndex** (`src/components/BlogIndex.astro`): Reusable blog listing component, accepts `lang` prop
- **Navigation** (`src/components/Navigation.astro`): Main navigation with language and theme toggles
- **LanguageToggle** (`src/components/LanguageToggle.astro`): Language switcher (EN/PT-BR)
- **ThemeToggle** (`src/components/ThemeToggle.astro`): Dark mode toggle with sun/moon icons and localStorage persistence

When creating new pages or features:
1. Create a reusable component in `src/components/` that accepts `lang` prop
2. Use the translation dictionary (`useTranslations(lang)`) for all text
3. Create minimal page files in `src/pages/` that import the component with the appropriate lang
4. NEVER duplicate logic between language versions

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

Posts must be created in BOTH languages. Follow these steps:

1. Create English version in `src/content/blog/{slug}.md`:
```markdown
---
title: Post Title
date: 2024-01-15
lang: en
translationKey: post-slug-key
description: Optional description
tags: tag1, tag2
---

Your content here...
```

2. Create Portuguese version in `src/content/blog/pt-br/{slug}.md`:
```markdown
---
title: Título do Post
date: 2024-01-15
lang: pt-br
translationKey: post-slug-key
description: Descrição opcional
tags: tag1, tag2
---

Seu conteúdo aqui...
```

3. Add language identifiers to code blocks for syntax highlighting:
   - JavaScript/TypeScript: ` ```javascript ` or ` ```typescript `
   - CSS: ` ```css `
   - Bash/Shell: ` ```bash `
4. The post will automatically appear on both blog indexes and homepage

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

## Best Practices

### Code Reusability
- **NEVER duplicate code** between language versions
- Always create reusable components with `lang` prop
- Follow the pattern: minimal page files that import shared components

### Internationalization
- **ALWAYS use the translation dictionary** - never hardcode UI text
- Add new translation keys to `src/i18n/ui.ts` for both languages
- Use `useTranslations(lang)` function to access translations
- Ensure all blog posts exist in both EN and PT-BR

### Styling
- Tags should use `rounded-full` class (pill-shaped)
- Maintain consistent dark mode support across all components
- Use Tailwind utility classes for styling

## Notes

- Site uses strict TypeScript configuration
- Build includes type checking via `astro check`
- Service worker and manifest.json in `public/` for PWA support
- Professional content sourced from `public/cv.pdf`
