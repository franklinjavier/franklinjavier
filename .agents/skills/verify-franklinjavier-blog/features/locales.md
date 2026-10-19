# Read in Portuguese or English

## Sub-features

Home, blog index, tags, translated articles, and fallback for an article without a translation.

## How to get to it (user POV)

Click the flag link in navigation. On English it is labelled Mudar para Português.
On Portuguese it is labelled Switch to English. Articles can also link their translation.

## Driving it with IAB

Click the labelled language link. Check the new URL, `html[lang]`, heading, and translated text.
Repeat the reverse transition. Follow an actual translated article pair in both directions.
For an unpaired article, inspect its offered destination and verify the implemented fallback.
Drive a tag entry in each locale when tags or locale resolution change.

## Gotchas

Portuguese routes begin `/pt-br/`; the default English locale has no prefix.
Article translation uses content translationKey, not necessarily matching slugs.
Do not assume a tag page or untranslated article has an identical translated URL.
