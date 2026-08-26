---
title: I replaced Tailwind with StyleX. The site didn't get faster.
date: 2026-08-25
description: I migrated a site that already scored 100 on PageSpeed to StyleX, measured the result, and found the real performance win somewhere else.
author: Franklin Javier
tags: performance, css, stylex, tailwind, frontend
lang: en
translationKey: stylex-personal-site
---

I replaced Tailwind CSS with StyleX on [franklinjavier.com](https://franklinjavier.com) to answer a narrow question: **could a different styling system make an already fast site faster?**

It did not.

The site already scored 100 on PageSpeed, shipped no JavaScript in its Astro bundle, used the system font, and had one meaningful image on the homepage. Once the StyleX version matched production pixel for pixel, FCP stayed at 0.8 seconds and LCP showed no consistent improvement. CSS was smaller—about 8% raw and 6% gzipped—but the reduction did not translate into a measurable loading win.

So I reverted the migration.

The experiment was still useful. It exposed work that had nothing to do with StyleX: `@tailwindcss/typography` was being sent to pages that never used it, the preflight could be trimmed, and three client scripts could become one. Those changes shipped on Tailwind.

## Why I ran the experiment

[Aiden Bai shared a Tailwind-to-StyleX migration](https://x.com/aidenybai/status/2092021888642085254) with compelling numbers: FCP improved by 20%, LCP by 7%, CSS dropped by half, and JavaScript fell by 5%. INP remained at 24 ms.

That was enough to make the experiment worth trying, but not enough to predict the outcome. Different sites have different content, build pipelines, and bottlenecks. Aiden's result gave me a test to reproduce, not a conclusion to borrow.

My plan was straightforward: measure the production site several times, migrate the styling system, make the output visually equivalent, and run the same measurements again.

## Establishing the baseline

Before changing any code, I ran PageSpeed five times against the production site using the mobile profile.

| Metric | Result |
| --- | ---: |
| Mobile FCP | 0.8 s |
| Mobile LCP | 1.1 s |
| Desktop FCP | 0.3 s |
| Desktop LCP | 0.3 s |
| PageSpeed score | 100 |
| JavaScript in the `_astro` bundle | 0 |

The property does not have field INP data in CrUX, so there is no honest INP number for me to report.

The homepage CSS was `BaseLayout.B8I3ZO9w.css`: 40,325 bytes raw and between 6,932 and 6,961 bytes at gzip level 6. Its header identified Tailwind CSS 4.3.3.

I also compared `master` with commit [`d044686`](https://github.com/franklinjavier/franklinjavier/commit/d044686f53996cfab8fa1a1f763dae12e8b1ce8e) using Lighthouse CLI 12.8.2 on the same machine with no CDN involved.

| Version | FCP | LCP |
| --- | ---: | ---: |
| Tailwind | 1,051 ms | 1,351 ms |
| StyleX | 1,052 ms | 1,352 ms |

That is a tie for any practical purpose.

## The first StyleX version did not count

The first preview looked promising, but it did not yet reproduce the production site. Measuring it would have mixed the effect of StyleX with changes to layout, typography, and styles that had disappeared during the rewrite.

I needed the pixels to match before the numbers meant anything.

The first implementation also produced an 837-line `src/styles/app.ts`: one large `stylex.create` call with roughly 80 re-exported styles. It was Tailwind's centralized vocabulary recreated with different syntax. I discarded it.

I rebuilt the migration around the approach described in the [StyleX documentation](https://stylexjs.com/docs/learn/thinking-in-stylex):

- colocate `*.stylex.ts` files with their views;
- keep shared tokens in `tokens.stylex.ts`;
- use local `stylex.create` calls that compile to static classes;
- load a small CSS file up front instead of introducing late CSS that forces another page-wide style calculation.

Only after the implementation and the rendered output were comparable did I measure again.

## Once the pixels matched, performance did not move

Commit [`d044686`](https://github.com/franklinjavier/franklinjavier/commit/d044686f53996cfab8fa1a1f763dae12e8b1ce8e), deployed as preview `zub4vcjma`, matched the production design. I ran another five mobile PageSpeed tests.

<div class="overflow-x-auto">
<table>
<thead>
<tr>
<th>Metric</th>
<th>Production Tailwind</th>
<th>StyleX <a href="https://github.com/franklinjavier/franklinjavier/commit/d044686f53996cfab8fa1a1f763dae12e8b1ce8e"><code>d044686</code></a></th>
</tr>
</thead>
<tbody>
<tr><th scope="row">Mobile FCP, five runs</th><td>0.8 s</td><td>0.8 s</td></tr>
<tr><th scope="row">Mobile LCP, five runs</th><td>1.1 s</td><td>1.1 s in three; 0.8 s in two</td></tr>
<tr><th scope="row">Desktop FCP/LCP</th><td>0.3/0.3 s</td><td>0.3/0.3 s</td></tr>
<tr><th scope="row">Score</th><td>100</td><td>100</td></tr>
<tr><th scope="row">Raw CSS</th><td>40,325 B</td><td>36,972 B</td></tr>
<tr><th scope="row">CSS at gzip-6</th><td>6,932–6,961 B</td><td>6,499–6,519 B</td></tr>
<tr><th scope="row">Raw HTML</th><td>14,829 B</td><td>14,448 B</td></tr>
<tr><th scope="row">HTML at gzip-6</th><td>4,289 B</td><td>4,523 B</td></tr>
<tr><th scope="row">JavaScript in <code>_astro</code></th><td>0</td><td>0</td></tr>
</tbody>
</table>
</div>

StyleX reduced the CSS, but FCP did not change. Two LCP runs were faster, while three matched production. That was not consistent enough to attribute the difference to the migration, especially with the local Lighthouse result also showing a tie.

There was another trade-off hiding in the transfer sizes: the StyleX version produced less raw HTML but more gzipped HTML.

On a site that already scored 100, saving a few hundred compressed bytes was not a strong enough reason to replace the styling system without a measurable user-facing improvement.

## The bigger win had nothing to do with StyleX

The migration uncovered a separate problem. The homepage, blog index, and speaking page never use `.prose`, yet all three received the full `@tailwindcss/typography` output.

Only article pages need the Markdown styles for elements such as `p`, `h2`, `h3`, `ul`, `ol`, `a`, `strong`, `code`, `pre`, and `hr`. The homepage was paying for CSS it never used.

To avoid crediting StyleX for an unrelated cleanup, I made the same cut in the Tailwind build. That gave me three states to compare:

- **A:** the original Tailwind build;
- **B:** StyleX with the cleanup, never published;
- **C:** Tailwind with the same cleanup, now in production.

I measured the files across three hosts using the same byte calculations and gzip level 6 with `mtime=0`.

<div class="overflow-x-auto">
<table>
<thead>
<tr>
<th>Resource</th>
<th>A: Original Tailwind</th>
<th>B: StyleX + cleanup</th>
<th>C: Tailwind + cleanup</th>
</tr>
</thead>
<tbody>
<tr><th scope="row">Homepage CSS</th><td>40,325 / 6,932 B</td><td>9,475 / 2,764 B</td><td>15,304 / 3,519 B</td></tr>
<tr><th scope="row">Homepage requests <code>prose.css</code></th><td>Yes</td><td>No</td><td>No</td></tr>
<tr><th scope="row">Article CSS</th><td>40,325 / 6,932 B</td><td>12,982 / 3,693 B</td><td>18,811 / 4,448 B</td></tr>
<tr><th scope="row">Homepage HTML</th><td>14,829 / 4,289 B</td><td>13,445 / 4,357 B</td><td>13,909 / 4,160 B</td></tr>
<tr><th scope="row">Article HTML</th><td>14,874 / 4,429 B</td><td>13,491 / 4,384 B</td><td>13,675 / 4,196 B</td></tr>
<tr><th scope="row">JavaScript in <code>_astro</code></th><td>0</td><td>0</td><td>0</td></tr>
</tbody>
</table>
</div>

Each size cell shows raw bytes followed by gzip-6 bytes.

The move from **A to C** isolates the cleanup that survived without StyleX. Comparing **C with B** is more useful for evaluating the styling systems because both versions exclude the same unnecessary CSS.

With that variable controlled, StyleX still produced less CSS. The homepage HTML, however, compressed to 4,357 bytes with StyleX and 4,160 bytes with Tailwind.

## Raw bytes and transferred bytes tell different stories

The homepage in version C generated 13,909 bytes of raw HTML and 4,160 bytes after gzip. StyleX with the same cleanup generated less raw HTML—13,445 bytes—but compressed to 4,357 bytes.

Tailwind utility classes repeat throughout the document, and repetition is exactly what gzip handles well. StyleX class names are more unique, so the smaller source did not become the smaller transfer.

Looking only at raw HTML would have produced the wrong conclusion.

StyleX is designed so that CSS growth levels off as an application gets larger. That can matter in a large product with many components and style combinations. A small personal site with one photo is unlikely to reach the scale where that characteristic becomes decisive.

## What shipped

The StyleX migration stayed in the lab. [PR #43](https://github.com/franklinjavier/franklinjavier/pull/43) closed without a merge.

Version C shipped on Tailwind in [PR #45](https://github.com/franklinjavier/franklinjavier/pull/45), commit [`0f4917c`](https://github.com/franklinjavier/franklinjavier/commit/0f4917ce0c647ab17ec200cb8657ed932e418472):

- `@tailwindcss/typography` now loads only on article pages;
- the preflight is smaller;
- three client scripts became one;
- the `_astro` bundle still contains no JavaScript.

The homepage now serves `BaseLayout.ClV8krB3.css` at 15,304 raw bytes and 3,519 bytes gzipped. It no longer requests `prose.css`. Article pages load `prose.D-rI_UlP.css` at 3,507 raw bytes and 929 bytes gzipped alongside the base stylesheet.

I did not rerun PageSpeed after that cleanup, so I am not assigning new LCP, FCP, or INP numbers to the live version. The claim I can support is narrower: it transfers fewer unnecessary resources.

## Bottom line

This experiment does not show that StyleX is slow or that Tailwind is always the better choice. It shows that **for this site, with this content and this baseline**, changing the styling system did not produce enough of a performance improvement to justify the migration.

StyleX generated less CSS. But the site already had a perfect PageSpeed score, no JavaScript bundle, and low loading times. Once the rendered output was genuinely comparable, the CSS advantage narrowed, compressed HTML became larger, and the loading metrics were effectively unchanged.

The useful outcome was finding waste in the existing Tailwind build and removing it without replacing the styling system.

When the performance result is neutral, reverting is also an optimization decision—especially when the migration adds complexity without improving the experience for the person loading the page.
