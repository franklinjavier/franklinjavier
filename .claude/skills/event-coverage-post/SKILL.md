---
name: event-coverage-post
description: Turn notes, transcripts and photos from a conference or event into a bilingual (PT-BR first, then EN) blog post on this site, one detailed section per talk. Use when the user wants to write up an event they attended, like the Lisbon AI 2026 post.
---

# Event coverage post

Builds a long, per-talk write-up of an event from the author's notes, transcripts, photos and videos. The reference result is `src/content/blog/pt-br/lisbon-ai-2026.md` and its English twin: read it before starting, it is the approved format.

## Inputs and privacy

- Source material lives in `research/<event>/` (one folder per talk with the transcript and a summary, plus `media/`). Scratch output goes to `work/<event>/`. Both folders are gitignored. **Never commit them**, and never commit original media, transcripts or private share links from the notes app.
- The repo is public. Published images must be derived WebP files with no metadata (see "Images").
- The post says it is "based on my notes". Do not name the notes app or mention recordings in the text.

## Process

1. **Catalog the media first.** Run `scripts/inventory.py <media-dir> <out.json>`: dimensions, capture time and timezone for photos (`sips`, `mdls`), duration and rotation for videos (`ffprobe`), and Live Photo pairs (same base name, same minute, video under 4 s, `live-photo.auto` tag). Live Photo videos are not videos. Run it on the original files: a copied file gets a new Spotlight date, and the photo timezone comes out as unknown. Don't install anything; macOS tools plus ffmpeg and cwebp are enough.
2. **Contact sheets.** `scripts/contact-sheets.sh <media-dir> <out-dir>` makes 20-per-sheet photo grids and 3 frames (10%, 50%, 90%) per video. Look at the sheets, and open full resolution only for candidates.
3. **Match photos to talks** by capture time against the talk's time, confirmed by what the slide says. Never identify a person by their face.
4. **Editorial map** before writing: one line per talk with speaker, thesis, example, implication and evidence.
5. **Check names once** against the event's official speakers page. The transcripts got 16 names or companies wrong in the reference event (e.g. "Spirit Labs" was Sperid Labs, "Duo" was Duvo). Photographed slides also fix names.
6. **Read each talk's full transcript before writing its section.** Automatic summaries distort: in the reference event they invented a quote, inverted a piece of advice, turned "zero-days were exploited" into "no zero-days" and rounded 29B to 30B.
7. **Write PT-BR first**, one talk at a time, and validate the level of detail on one talk with the author before doing the rest. Translate to English only once the PT-BR is stable, keeping facts, tables, figures and markup identical.
8. **Adversarial review** by other models with a brief in a file: AI-style tells (human-writing skill), facts against the transcript, depth. Both reviewers found real and different factual errors. Check every finding against the transcript before accepting it.

## Level of detail (approved by the author)

- No word limit. The index lets readers pick talks. The reference post is about 19,500 words, and that is intentional.
- Per talk, in the order of the talk: the thesis in 1–2 sentences, who the speaker is, context, development, the demo step by step, striking lines, the full Q&A, the close. As a rule of thumb, about 20–30% of the transcript's length.
- Tables or lists when the talk has numbers, steps or comparisons; prose otherwise.
- Separate what was said on stage from what is only in the official talk description, and say so in the text when using the description.
- The MC's introductions and closing remarks carry useful facts (who gave a sponsor talk, venue details, closing activities).
- Transcription errors are often recoverable from context ("RCAI" = Arcee AI, "Nyx" = Nx). When a name can't be recovered safely, omit it and describe instead.
- A first version with `<details>` per talk was rejected: the hidden content was the best part of the post. Full content is the default.

## Post structure

1. Frontmatter with `draft: true`, same `translationKey` in both languages.
2. Cover figure, a short intro (what, where, based on my notes, how to use the index).
3. "What connected the talks": short paragraphs with anchor links to the talks.
4. Index by day, with anchors.
5. `## Day N: <date>`, then one `### Name, Company` per talk. Between talks of the same day: `<hr class="divider">` (not before the first talk of a day).
6. "What was left open", then the venue gallery.

Headings generate anchors from their text, so accented names keep their accents in the anchor (`#simão-nogueira-noticed`). After translating, check every `](#...)` link against the built HTML.

## Markdown and HTML rules

- Raw HTML blocks must have **no blank lines inside**, or the markdown parser breaks them.
- Wrap every table so it scrolls on mobile, with blank lines around the table:

```markdown
<div class="overflow-x-auto">

| Column | Column |
| ------ | ------ |
| a      | b      |

</div>
```

- Slide figures link to the full image (the `ImageViewer` component zooms any `.prose img` in a native `<dialog>`):

```html
<figure>
  <a href="/images/blog/<event>/<name>.webp"
    ><img
      src="/images/blog/<event>/<name>.webp"
      srcset="
        /images/blog/<event>/<name>-640.webp   640w,
        /images/blog/<event>/<name>-1024.webp 1024w,
        /images/blog/<event>/<name>.webp      1600w
      "
      sizes="(max-width: 719px) calc(100vw - 4rem), 655px"
      alt="..."
      width="1600"
      height="..."
      loading="lazy"
      decoding="async"
  /></a>
  <figcaption>Why this slide matters.</figcaption>
</figure>
```

- The cover has no link, no `loading="lazy"` and gets `fetchpriority="high"`.
- Use slide photos only when they help understanding. The caption says why the slide matters, not what it shows (the alt text does that).
- Venue gallery: copy the `photo-stack` + `dialog.gallery` block from the reference post. It is HTML and CSS only (`commandfor`/`command="show-modal"`, `closedby="any"`, scroll-snap, `::scroll-button`, `::scroll-marker`, fade via `scroll-state`), styled in `src/styles/prose.css`. Gallery labels (`data-prev`, `data-next`, `aria-label`, the "See all N photos" pill) are written in each post's language.

## Images

- `scripts/derive-images.sh <media-dir> <out-dir> <list-file>` converts, crops and exports each image at 1600, 1024 and 640 px wide (WebP q78). The list file has one line per image: `name source x0 x1 y0 y1`, with crop bounds as fractions of the source.
- `cwebp` ignores EXIF orientation, so portrait photos come out sideways. The script goes HEIC → JPEG (`sips`) → `ffmpeg` (applies the rotation) → `cwebp`.
- `cwebp` doesn't copy EXIF or GPS by default. Confirm with `webpmux -info <file>` before committing.
- Gallery thumbnails for the photo stack are 480×640 or 640×480. Images inside a closed `<dialog>` with `loading="lazy"` only download when it opens.
- For the reference post, `srcset` on the cover alone took local mobile Lighthouse LCP from 2.3 s to 1.5 s and page weight from 211 to 60 KiB.

## Preview

Drafts get no route. To review:

1. Copy the project to a scratch folder and set `draft: false` in the copy only (`sed 's/^draft: true$/draft: false/'`).
2. Run a real `bun install` in the copy (a symlinked `node_modules` breaks Astro).
3. For text review, `bunx astro dev --port 4399 --host 127.0.0.1` (it runs in the background; `bunx astro dev stop` stops it). For performance measurement, `bunx astro build` and `bunx astro preview`, since dev injects scripts and unoptimized assets.
4. Browsers cache aggressively: add `?v=N` to the URL.
5. Check at 375 px that `document.documentElement.scrollWidth` equals the viewport width.

## Pitfalls

- zsh doesn't word-split `$(...)` in loops; run file loops with `bash -c '...'`.
- `%` inside ffmpeg `drawtext` breaks the filter.
- In a worktree, write only inside the worktree; the main checkout may be write-protected.
- Grok's `--sandbox read-only` can fail on machines where `/var/run/docker.sock` is a symlink; `--tools "read_file,grep,list_dir"` is a safe alternative. Codex can run out of quota mid-review, so don't depend on a second round.

## Author preferences

- Human, plain writing (human-writing skill): no AI vocabulary, no em dashes, first person where true. Keep terms devs actually use in English ("evals", "harness", "skills") instead of literal translations.
- Body text at 16 px, white background, every post image zooms without leaving the site, fade (not slide) between gallery photos.
- Commits with explicit paths (never `git add .`) and no AI attribution lines.
