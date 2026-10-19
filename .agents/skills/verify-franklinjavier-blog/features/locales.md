# Read in Portuguese or English

## Sub-features

Home, blog index, tags, translated articles, and fallback for an article without a translation.

## How to get to it (user POV)

Click the flag link in navigation. On English its name is PT, Mudar para Português.
On Portuguese its name is EN, Switch to English. Articles can also link their translation.

## Driving it with IAB

Click the labelled language link. Check the new URL, `html[lang]`, heading, and translated text.
Repeat the reverse transition. Follow an actual translated article pair in both directions.
All published articles are required to have translations. Verify fallback only if an unpaired entry exists.
Drive a tag entry in each locale when tags or locale resolution change.

## Gotchas

Portuguese routes begin `/pt-br/`; the default English locale has no prefix.
Article translation uses content translationKey, not necessarily matching slugs.
Do not assume a tag page or untranslated article has an identical translated URL.
