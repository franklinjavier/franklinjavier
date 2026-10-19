# Bottega UI receipt contract

This additive adapter targets Bottega's version 1 `ui-evidence.ts` contract.
Recheck that contract and trusted project policy before each governed delivery.
The pure validator checks structure and coverage. It cannot establish that a journey was driven.
The coordinator independently checks artifacts, exact source identity, and execution provenance.
An agent's receipt cannot grant approval, deployment, or merge authority.

## Freeze and bind

Use the complete reviewed delivery base, never assume `HEAD^` for a multi-commit task.
Record the exact candidate commit and tree. The checkout and built output must match them.
Read the trusted policy's application ID, verifySkill path/hash, files, journeys,
assertion IDs, required states, and prototype source. Do not invent policy from this example.
If the trusted verifySkill differs from the candidate skill, preserve both identities in the report.
The receipt binds the trusted source hash expected by the gate, not a convenient local substitute.

Keep artifacts under `.bottega-task/` inside an external evidence root such as `$BLOG_PROOF`.
Keep that evidence root outside Git so captures cannot change the source identity.
The receipt is `$BLOG_PROOF/.bottega-task/ui-evidence/<application>.json`.
The coordinator supplies the same evidence root when validating artifact bytes.

## Receipt fields

Use exactly the version 1 schema, without extra keys:

- `version: 1`, `outcome: "passed"`, `commit`, `tree`, `base`, `application`.
- `verifySkill: {path, sha256}` and the exact selected `files` array.
- `journeys`, each with `id`, exact `files`, `steps`, `assertions`, and `screenshots`.
- Each step has `action`, observed `consequence`, and a `proof` artifact.
- Each assertion has policy `id`, `outcome: "passed"`, observed `actual`, and `proof`.
- Each screenshot has `state`, `width`, `phase`, and a PNG `proof` artifact.
- Every artifact is `{path, sha256, mediaType}` with a real SHA-256 of retained bytes.
- Media types are `image/png`, `application/json`, or `text/plain`.

For each required state capture distinct real screenshots at width 1440 and 400,
each in `before` and `after` phases. PNG pixel width must equal its declared width.
Only use `default` or contract-supported state identifiers from trusted policy.
Open image-viewer evidence remains required when that interaction is in scope, even though
version 1 has no dialog state identifier. Keep it as additional action proof and disclose this limit.
Never mislabel a dialog as a popover or add unsupported screenshot states.

When trusted prototype is null, record `prototype: {kind: "absent"}` and explain its absence.
Search tracked files and task context first. When a versioned approved prototype exists,
use `kind: "comparison"`, its exact `source: {path, sha256}`, and two comparison
screenshots with `width` 1440 and 400 plus their PNG `proof` artifacts.
Do not claim visual comparison if the prototype was not rendered and inspected.

## Capture native PNG bytes in IAB

The ordinary IAB screenshot API can return JPEG bytes. Check the actual format before naming
or declaring an artifact; a `.png` extension does not establish PNG encoding.
Read the tab CDP capability documentation first. Use an explicit CSS viewport clip for PNG:

```js
const cdp = await tab.capabilities.get('cdp')
const { cssLayoutViewport: view } = await cdp.send('Page.getLayoutMetrics')
const capture = await cdp.send('Page.captureScreenshot', {
  format: 'png',
  fromSurface: true,
  captureBeyondViewport: true,
  clip: { x: view.pageX, y: view.pageY, width: view.clientWidth, height: view.clientHeight, scale: 1 },
})
```

Save the returned base64 `data` as raw bytes. Decode them with the existing `sharp` dependency
and verify PNG format and actual dimensions. Inspect pixels against the visible viewport too;
correct dimensions alone cannot detect a cropped image on a device with a higher pixel ratio.
Never use `fromSurface: false`: the observed backend can capture the desktop instead of the tab.
Do not convert JPEG inspection images into receipt PNGs; capture the tab natively again.

## Refuse false completion

Run the core pure validator with independently established expectations when available.
Its success proves schema/coverage only. Record artifact byte hashes and actual browser observations.
A failed link, missing assertion, unrun journey, unavailable browser, or dirty candidate prevents
an `outcome: "passed"` receipt. Save a failure report outside the success schema instead.
Do not fabricate skipped journeys, screenshots, timings, token counts, or performance metrics.
After cleanup verify the retained evidence and unchanged candidate commit/tree.

The scoped `uiEvidence` policy in `.bottega/config.json` covers footer RSS and header controls.
Only the policy and verification source on the trusted integration ref establish gate expectations.
A candidate policy or this adapter alone grants no approval: retain real exact-source receipts and
independent coordinator attestations after the policy is canonically integrated.
