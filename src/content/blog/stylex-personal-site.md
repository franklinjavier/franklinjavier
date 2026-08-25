---
title: A performance experiment with Meta's StyleX
date: 2026-08-25
description: I tried swapping Tailwind for StyleX and nothing got faster.
author: Franklin Javier
tags: performance, css, stylex, tailwind, frontend
lang: en
translationKey: stylex-personal-site
---

I swapped the Tailwind on [franklinjavier.com](https://franklinjavier.com) for StyleX. The site was already 100 on PageSpeed, zero JavaScript in the bundle, system font, one photo. LCP did not move. With the look matching production, CSS dropped 8% raw and 6% gzipped. I reverted the swap.

What I actually shipped was something else: the `@tailwindcss/typography` the home page never asked for, a thinner preflight, three scripts becoming one. All of that in Tailwind. StyleX stayed in the lab.

## Aiden's screenshot

Aiden Bai posted on X a Tailwind → StyleX swap on his site. FCP 20% faster, LCP 7%, CSS cut in half, JS 5% smaller, INP unchanged at 24ms. I wanted the same kind of experiment, on my site, measured several times before and after.

[Aiden's screenshot on X](https://x.com/aidenybai/status/2092021888642085254)

His screenshot is the reference. It is not the result.

## Before the swap

PageSpeed mobile, five times, production with Tailwind: FCP 0.8s, LCP 1.1s, score 100. Desktop once: 0.3s / 0.3s. There is no field INP in CrUX. So I do not cite my INP.

Home CSS: `BaseLayout.B8I3ZO9w.css`, 40325 bytes, 6932–6961 at gzip-6. `_astro` JS bundle: zero. The file starts with `/*! tailwindcss v4.3.3`.

Lighthouse CLI 12.8.2 on the same machine, no CDN, `master` against [`d044686`](https://github.com/franklinjavier/franklinjavier/commit/d044686f53996cfab8fa1a1f763dae12e8b1ce8e): FCP 1051ms against 1052ms, LCP 1351ms against 1352ms. A tie. Neutral, in this case, means revert.

## Apples to apples

The first StyleX preview was not the same site. Measuring there would have been cheating. Before any after-number, the look had to be pixel-perfect. Apples to apples.

Along the way I got an `src/styles/app.ts` of 837 lines, one `stylex.create`, about 80 styles re-exported. Tailwind without Tailwind. That does not stay.

The way the [StyleX docs](https://stylexjs.com/docs/learn/thinking-in-stylex) ask for it is different. Colocate `*.stylex.ts` on each view. Tokens only in `tokens.stylex.ts`. A local `create` becomes a static class. A small CSS file up front. Loading StyleX CSS on demand recalculates the whole page.

## What StyleX moved

Commit [`d044686`](https://github.com/franklinjavier/franklinjavier/commit/d044686f53996cfab8fa1a1f763dae12e8b1ce8e), preview `zub4vcjma`, same look as production. PageSpeed again, five times on mobile: FCP 0.8s on all of them. LCP 1.1s on three, 0.8s on two. Desktop 0.3 / 0.3. Score 100. JS zero.

<div class="overflow-x-auto">
<table>
<thead>
<tr>
<th></th>
<th>Tailwind live</th>
<th>StyleX <a href="https://github.com/franklinjavier/franklinjavier/commit/d044686f53996cfab8fa1a1f763dae12e8b1ce8e"><code>d044686</code></a> <code>zub4vcjma</code></th>
</tr>
</thead>
<tbody>
<tr>
<th scope="row">FCP mobile (PageSpeed ×5)</th>
<td>0.8s</td>
<td>0.8s</td>
</tr>
<tr>
<th scope="row">LCP mobile (PageSpeed ×5)</th>
<td>1.1s</td>
<td>1.1s in 3, 0.8s in 2</td>
</tr>
<tr>
<th scope="row">FCP / LCP desktop</th>
<td>0.3 / 0.3</td>
<td>0.3 / 0.3</td>
</tr>
<tr>
<th scope="row">Score</th>
<td>100</td>
<td>100</td>
</tr>
<tr>
<th scope="row">Raw CSS</th>
<td>40325</td>
<td>36972</td>
</tr>
<tr>
<th scope="row">CSS gzip-6</th>
<td>6932–6961</td>
<td>6499–6519</td>
</tr>
<tr>
<th scope="row">Raw HTML / gzip-6</th>
<td>14829 / 4289</td>
<td>14448 / 4523</td>
</tr>
<tr>
<th scope="row">JS <code>_astro</code></th>
<td>0</td>
<td>0</td>
</tr>
</tbody>
</table>
</div>

Pixel-perfect ate the gain. Preflight, typography, v4 line-height, a grid only on md and lg. All of that came back, and the CSS came with it.

## The rest of the CSS was not StyleX

Home, the blog index and speaking never use `.prose`. Live markdown is `p`, `h2`, `h3`, `ul`, `ol`, `a`, `strong`, `code`, `pre`, `hr`. Even so, the `@tailwindcss/typography` dump went out on every page.

To keep from crediting that to StyleX, I shipped the same cut on Tailwind. Three hosts, same bytes, gzip-6 with `mtime=0`.

<div class="overflow-x-auto">
<table>
<thead>
<tr>
<th></th>
<th>A Tailwind, no cuts</th>
<th>B StyleX + cuts (unpublished)</th>
<th>C Tailwind + cuts (live)</th>
</tr>
</thead>
<tbody>
<tr>
<th scope="row">Home CSS</th>
<td><code>B8I3ZO9w</code> 40325 / 6932</td>
<td><code>0JEitMbP</code> 9475 / 2764</td>
<td><code>ClV8krB3</code> 15304 / 3519</td>
</tr>
<tr>
<th scope="row">Home asks for <code>prose.css</code></th>
<td>yes</td>
<td>no</td>
<td>no</td>
</tr>
<tr>
<th scope="row">Post CSS <code>/blog/avoid-prop-drilling-react/</code></th>
<td>40325 / 6932</td>
<td>12982 / 3693 (prose 3507/929 + BaseLayout)</td>
<td>18811 / 4448 (same prose + BaseLayout)</td>
</tr>
<tr>
<th scope="row">Home HTML</th>
<td>14829 / 4289</td>
<td>13445 / 4357</td>
<td>13909 / 4160</td>
</tr>
<tr>
<th scope="row">Post HTML</th>
<td>14874 / 4429</td>
<td>13491 / 4384</td>
<td>13675 / 4196</td>
</tr>
<tr>
<th scope="row">JS <code>_astro</code></th>
<td>0</td>
<td>0</td>
<td>0</td>
</tr>
</tbody>
</table>
</div>

A to C is the cut that remained, without StyleX. C to B is StyleX against Tailwind with the same cut: smaller CSS, worse HTML gzip.

What went live was C. [PR #45](https://github.com/franklinjavier/franklinjavier/pull/45), commit [`0f4917c`](https://github.com/franklinjavier/franklinjavier/commit/0f4917ce0c647ab17ec200cb8657ed932e418472). Today franklinjavier.com serves `BaseLayout.ClV8krB3.css` 15304/3519. Home does not ask for `prose.css`. The post loads `prose.D-rI_UlP.css` 3507/929 plus BaseLayout. The 40325 dump is no longer production.

The [StyleX PR](https://github.com/franklinjavier/franklinjavier/pull/43) closed without a merge.

I did not run PageSpeed again after the cut. I do not invent LCP, FCP or INP for what is live now.

## A class that does not repeat compresses worse

Home HTML on C: 13909 / 4160. On StyleX with the same cuts: 13445 / 4357. Less raw HTML, worse gzip. The StyleX class name is unique. Tailwind's repeats.

The StyleX docs say CSS settles as the site grows. A one-photo site does not get there. What this site had extra was prose the home page never asked for. That is what I cut. The system swap, not.
