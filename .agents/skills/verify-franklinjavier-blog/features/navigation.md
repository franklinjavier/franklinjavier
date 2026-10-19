# Navigate secondary pages and change appearance

## Sub-features

Home, Blog, About, CV, contact, privacy, speaking, footer links, and light/dark theme.

## How to get to it (user POV)

Use visible navigation and footer links; CV is linked from the home contact section.
The theme control is the button labelled Toggle dark mode.

## Driving it with IAB

Click each affected internal link and verify its heading and URL in both locales.
Click Toggle dark mode, observe background/text and the html dark class, then reload.
Confirm the chosen appearance persists and navigation still works at both widths.
Restore the starting theme before closing the owned tab.

## Gotchas

External social, project, and mail links need href inspection only; do not send messages.
Theme is stored in localStorage, so a fresh tab can inherit an earlier run's preference.
Some footer-only routes need scrolling; keep the visible click as proof.
CV has its own layout without the standard footer. Use its visible return-home link before
continuing footer journeys. Its language switch is named English or Português.
