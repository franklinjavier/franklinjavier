---
title: What web performance actually means in e-commerce
date: 2026-08-22
description: Generic performance advice does not survive contact with a storefront. What to measure, where the time really goes, and why the biggest wins are usually deletions.
author: Franklin Javier
tags: performance, frontend, e-commerce, core-web-vitals
lang: en
translationKey: web-performance-ecommerce
---

Most performance advice is written for a generic web page. A storefront is not a generic web page. It has a funnel, money attached to every step of it, and a pile of third-party scripts that nobody on the engineering team asked for.

I worked on this for years, and talked about it on [Hipsters Ponto Tech #114 and in a talk on e-commerce performance](/speaking/). Here is the part the generic advice leaves out.

## Stop optimizing the Lighthouse score

Lighthouse runs a simulated device on a simulated network. Great for debugging, terrible as a target.

What matters is field data: what real people on real devices got. CrUX, or better, your own RUM.

The two rarely agree, and the field is almost always worse. Your team builds on fast laptops over office fibre. A big chunk of your traffic is a mid-range Android on a mobile network, in a browser full of extensions, on a phone that has been thermally throttled since 10am.

So before optimizing anything, look at the p75 of your field data split by device class. It usually tells a different story than the lab did.

## Every metric belongs to a screen

"Improve LCP" is not a task. Improve LCP *where* is.

On the product page, LCP is the product image, almost every time. So the fix is almost never JavaScript. It is the image pipeline: right dimensions, modern format, a real `sizes` attribute, `fetchpriority="high"` on the hero. And remove the `loading="lazy"` that someone applied to every image on the site, including the one above the fold. I see this one a lot. It costs a full round trip.

On listing pages the problem is CLS, and the cause is usually something that arrives late: a promo banner, a discount badge, a personalization widget that decides after hydration that the card needs one more line. Reserve the space before you know what goes in it.

In the cart and checkout, INP is what hurts. It replaced FID for a good reason. FID only measured the delay before the first interaction, which flattered pages that were slow exactly when it counted. In a storefront the interactions that count are add to cart, pick a size, apply a filter, and those are the ones running the most JavaScript. A page can have a great LCP and still feel broken because tapping a size takes 400ms to paint.

## Most of the main thread is not yours

Open a real product page, record a trace, and group main-thread time by origin.

On most storefronts your own code is the minority. The rest is the tag manager, the chat widget, the A/B testing snippet, analytics, a recommendation engine, a pixel from a campaign that ended two years ago.

Which makes this an ownership problem more than a technical one. Those scripts were added by people who get measured on what the scripts enable, never on what they cost. Nobody removes them because nobody answers for the total.

Two things that work:

- **An inventory with an owner and a review date per tag.** Not a performance review. An existence review: is this still doing anything? A lot of them are not.
- **Move them off the critical path and prove they still fire.** Deferring a marketing script only becomes a real conversation once you can show the marketing team it still works.

## A budget without an owner is a dashboard

Performance budgets die the same way every time. Someone sets them, CI starts warning, the warnings become wallpaper, and six months later the budget is decoration.

A budget works when it fails the build instead of warning. When it is scoped to a route, because a bundle budget for "the app" tells you nothing about which page regressed. And when a specific team owns the number, so a regression has somebody to go to.

## Delete things

The biggest improvements almost always come from removing, not optimizing. A polyfill bundle for browsers with no measurable traffic. A date library imported whole for one `format` call. An icon set imported as a barrel file. A homepage carousel that analytics says nobody scrolls past slide one. A font weight the design system never uses.

Tree-shaking will not save you from a barrel import. Code-splitting will not save you from a feature nobody uses; it will just ship it later.

So before the clever optimization, do the boring audit: what is in the bundle, who put it there, does anything still depend on it. That audit has paid off every single time I ran it.

## Where to start

You inherited a slow storefront and need somewhere to begin:

1. Get field data. Without it you are guessing, and you will optimize the wrong page.
2. Take your highest-revenue template, usually the product page, and fix its LCP element properly.
3. Group main-thread time by origin and take that number to whoever owns the tags.
4. Put a route-scoped budget in CI, failing the build, with a team name on it.
5. Delete something.

None of this is clever. Performance is a problem that crosses teams and gets handed to one of them, and measurement is how that team gets anyone else to move.
