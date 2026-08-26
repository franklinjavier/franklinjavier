---
title: Oficina is a Grok Bot template you install with shadcn add
date: 2026-08-25
description: One item so far, orchestrator. The official CLI pulls it from GitHub. I did not ship a custom installer.
author: Franklin Javier
tags: grok-bot, shadcn, oficina, registry
lang: en
translationKey: oficina-template-shadcn
---

I put a Grok Bot template registry at [github.com/franklinjavier/oficina](https://github.com/franklinjavier/oficina). The installer is the official [shadcn CLI](https://ui.shadcn.com/docs/cli). Not mine.

```bash
npx shadcn@latest add franklinjavier/oficina/orchestrator
```

That writes `oficina/bots/orchestrator/*` in the directory you ran it from. In a shadcn `files[].target`, `~/` means project cwd. It does not mean `$HOME`.

The [skills post](/blog/open-source-agent-skills/) was markdown for coding agents. This is a bot snapshot you paste into Grok Bot by hand.

## One item, on purpose

The registry has one item today: `orchestrator`, type `registry:item`. It is a made-up snapshot of a fleet coordinator named Helm. Profile, a geometric avatar, skill pointers (plus a generic `route-work` body), two disabled routine templates.

No chat history. No memory. No tokens. No real names.

I almost built a CLI. I almost bought a hostname. Both are gone. Anyone can publish the same way on their own GitHub. Oficina is the worked example.

## Look before you write

```bash
npx shadcn@latest view franklinjavier/oficina/orchestrator
npx shadcn@latest search franklinjavier/oficina
npx shadcn@latest list franklinjavier/oficina
npx shadcn@latest add franklinjavier/oficina/orchestrator --dry-run
npx shadcn@latest add franklinjavier/oficina/orchestrator#main
```

`#main` pins a revision. `--dry-run` prints the files and stops. The CLI reads `registry.json` at the root of the public repo. No custom domain.

[PR #1](https://github.com/franklinjavier/oficina/pull/1) merged on 25 August 2026, commit [`2bc4973`](https://github.com/franklinjavier/oficina/commit/2bc4973cea33d076000a1a2d930f8dea0577d3ed).

## After add, you still copy

The files land in `oficina/bots/orchestrator/`. Then, in Grok Bot:

1. Create a bot.
2. Click the name in the chat header, or Cmd+Shift+I. The gear next to the pane X opens Settings: avatar, name, title, description.
3. Copy `name`, `title`, and `description` from `profile.json`. Optional avatar from `avatar.svg`.
4. Enable the skills that match. A pointer with no body is a hint, not a dump.
5. Create routines from the templates after you attach local sources. Leave them off until a test run is safe.

A starter kit. Not an export of a live agent.

## What this registry will not ship

- Secrets, tokens, sign-ins
- A live agent database or the state of a machine
- Memory logs or conversation history
- Real people's names

There is a second pull request on the repo. It is not live. It is not this post.
