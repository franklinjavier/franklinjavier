# Read and browse posts

## Sub-features

Home recent posts, `/blog/`, article prose, dates, tag links, filtered lists, and image zoom.

## How to get to it (user POV)

Start on `/`. Click a recent article title, or Blog in the navigation then an article.
Click an article tag to reach `/blog/tag/<tag>/`; choose a result and use Back to blog.

## Driving it with IAB

Read the DOM, select the visible article link by its exact title, and click it.
Confirm `main h1`, `time`, and `.prose` match the selected article.
Click an observed tag href and confirm the filtered heading, count, and matching results.
For an eligible `.prose img[data-zoomable]`, click and inspect `#image-viewer[open]`.
Capture before, open, and closed states at both widths. Verify close button and Escape.

## Gotchas

Article and tag sets depend on published content. Record the titles and URLs chosen at run time.
Images inside galleries or linked to non-image URLs are intentionally excluded from zoom.
A result card's tags can be plain spans; use article-header tag links or blog-index tag links.
