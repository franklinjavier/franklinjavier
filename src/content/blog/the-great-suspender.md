---
title: The Great Suspender
date: 2015-06-25
description: A 2015 tip about a Chrome extension that later turned into malware. Use Chrome Memory Saver instead.
updated: 2026-11-02
author: Franklin Javier
tags: tooling
lang: en
translationKey: the-great-suspender
---

<aside class="callout" role="note" aria-label="Warning">

**Update, November 2026:** don't install The Great Suspender. In 2020 the original developer handed the extension over to an unknown owner, and in February 2021 Google pulled it from the Chrome Web Store and disabled it in users' browsers as malware. Chrome now does the same job on its own: Memory Saver, under Settings → Performance, discards inactive tabs. The post below is how I wrote it in 2015.

</aside>

Many people have been complaining about Google Chrome's memory consumption.
Depending on usage, the software can consume up to 1GB. The situation gets even worse when using many extensions.

I have the habit of opening several tabs when I'm studying,
and throughout the day I analyze and close them. Even though my machine's configuration is good,
there comes a time when it gets quite slow.

To try to alleviate this situation, [The Great Suspender](https://chrome.google.com/webstore/detail/the-great-suspender/klbibkeccnjlkjkiokjodocebajanakg)
is an extension that suspends the process of tabs that are inactive for X time.
That is, if I configured the time to 30 minutes, tabs that remain inactive for that time are suspended. Simple as that!

![The Great Suspender settings page: suspend tabs after 1 hour, skip pinned tabs and tabs with unsaved forms, plus a whitelist field](/images/blog/the-great-suspender/settings.webp)

Pinned tabs or those defined in a whitelist don't fall under the above condition, preventing pages
from being suspended.

Another cool feature is the history of suspended pages. Each entry includes a timestamp of when
the suspension occurred. If you want, you can suspend again or reload all pages from a previous day.

Found a better way to keep tabs under control? Tell me on [X](https://x.com/franklinjavier).

To learn more:

- [Project page](https://github.com/greatsuspender/thegreatsuspender) (archived)
