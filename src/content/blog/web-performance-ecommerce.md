---
title: What web performance actually means in e-commerce
date: 2026-08-22
description: Generic performance advice does not survive contact with a storefront. What to measure, where the time really goes, and why the biggest wins are usually deletions.
author: Franklin Javier
tags: performance, frontend, e-commerce, core-web-vitals
lang: en
translationKey: web-performance-ecommerce
---

Most performance advice is written for a generic web page. E-commerce is not a generic web page. It has a funnel, it has revenue attached to every step of that funnel, and it has a long tail of third-party scripts that nobody on the engineering team chose to add.

I spent years working on this problem at scale, and talked about it publicly on [Hipsters Ponto Tech #114 and in a talk on e-commerce performance](/speaking/). What follows is the part that generic advice tends to miss.

## Your Lighthouse score is not the metric

The single most common mistake is optimizing for the number in the lab.

Lighthouse runs a simulated device on a simulated network. It is a useful debugging tool and a terrible target. What actually matters is field data — what real people on real devices experienced. That means CrUX, or better, your own RUM.

The gap between the two is usually not small, and it usually points the same way: the field is worse. Your team develops on fast laptops over office fibre. A meaningful share of e-commerce traffic is mid-range Android over mobile networks, often with a browser full of extensions and a device that has been thermally throttled since 10am.

A useful habit: before optimizing anything, look at the p75 of your field data segmented by device class. The story it tells is frequently different from the story the lab tells.

## Map the metrics to actual surfaces

"Improve LCP" is not an action. Improve LCP *where* is.

**Product detail page.** LCP is almost always the product image. Which means the fix is almost never JavaScript — it is the image pipeline. Correct dimensions, modern format, a real `sizes` attribute, `fetchpriority="high"` on the hero, and removing the `loading="lazy"` that someone applied to every image on the site including the one above the fold. That last one is remarkably common and costs a full round trip.

**Listing pages.** CLS is the metric that bites here, and the cause is usually something injected late: a promotional banner, a discount badge, a personalization widget that decides after hydration that the card needs another line of text. Reserve the space before you know the content.

**Cart and checkout.** INP is the one that hurts. It replaced FID for a good reason — FID measured the delay before the first interaction, which flattered pages that were slow at exactly the moments that matter. The interactions that matter in a storefront are add-to-cart, variant selection, filter application. Those are precisely the ones running the most JavaScript. A page can have an excellent LCP and still feel broken because tapping a size selector takes 400ms to paint.

## The main thread belongs to third parties

Here is the uncomfortable measurement to run: open a real product page, record a performance trace, and attribute main-thread time by origin.

On most storefronts, the majority of it is not your code. It is the tag manager, the chat widget, the A/B testing snippet, the analytics, the recommendation engine, the pixel from a campaign that ended two years ago.

This is not primarily a technical problem. It is an ownership problem. Those scripts were added by people who are measured on what the scripts enable, not on what they cost. Nobody removes them because nobody is accountable for the aggregate.

Two things that work:

- **An inventory with an owner and a review date per tag.** Not a performance review — an existence review. "Is this still doing anything?" A surprising number are not.
- **Load them off the critical path and prove they still work.** Deferring a marketing script is only a real conversation once you can show the marketing team it still fires.

## Budgets need owners, not dashboards

Performance budgets fail in a predictable way: someone sets them, CI starts warning, the warnings become normal, and six months later the budget is a decoration.

A budget only works when three things are true. It is enforced in CI as a failure, not a warning. It is scoped to a route, not to the whole site — a bundle budget for "the app" tells you nothing about which page regressed. And a specific team owns the number, so a regression has an addressee.

Without the third one, you have a dashboard.

## The biggest wins are deletions

This is the part that surprises people who expect performance work to be clever.

Over and over, the largest improvements come from removing rather than optimizing: a polyfill bundle for browsers that no longer have measurable traffic, a date library imported in full for one `format` call, an icon set imported as a barrel file, a carousel on the homepage that analytics shows nobody scrolls past slide one, a font weight nobody uses in the design system.

Tree-shaking will not save you from a barrel import. Code-splitting will not save you from shipping a feature nobody uses — it will just ship it later.

Before you reach for a clever optimization, run the boring audit: what is in the bundle, who put it there, and does anything still depend on it. That audit has paid for itself every time I have run it.

## Where to start

If you inherit a slow storefront and need somewhere to begin:

1. Get field data. Without it you are guessing, and you will optimize the wrong page.
2. Pick the single highest-revenue template — usually the PDP — and fix its LCP element properly.
3. Attribute main-thread time by origin and take that number to whoever owns the tags.
4. Put a route-scoped budget in CI, as a failure, with a name attached.
5. Delete something.

None of this is exotic. The hard part was never the technique — it is that performance is a cross-team problem being solved by one team, and the measurement is what gives that team leverage.
