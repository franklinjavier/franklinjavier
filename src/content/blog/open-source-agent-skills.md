---
title: We published 36 of our agent skills as open source
date: 2026-08-22
description: Stone Giant Studio's internal skills for AI coding agents are now public - markdown files, no dependencies, portable across Claude Code, Cursor, Codex and Gemini CLI.
author: Franklin Javier
tags: ai, agents, open-source, tooling
lang: en
translationKey: open-source-agent-skills
---

At Stone Giant Studio we accumulated a private toolchain for AI coding agents — the accumulated "here is how we actually do this" that we kept re-teaching to every new agent session. We published 36 of those skills under Apache-2.0 at [github.com/stonegiantstudio/skills](https://github.com/stonegiantstudio/skills).

## What a skill actually is

A skill is a markdown file. That is the whole format.

No binaries, no runtime, no dependencies to install. It follows the [agentskills.io](https://agentskills.io) specification, which means the same file works across Claude Code, Cursor, Codex, Gemini CLI and a long list of others.

This sounds almost too simple to be useful, and that reaction is worth examining. The bottleneck when working with a coding agent is rarely capability. It is context: the agent does not know your conventions, your review standards, or the three sharp edges in the library you use. A skill is just that knowledge, written down once, in a place the agent reads automatically.

The portability matters more than it looks. Tooling in this space turns over fast. Knowledge encoded as markdown survives a change of agent; knowledge encoded as a plugin for one vendor does not.

## Installing

For Claude Code, register the marketplace and install the plugin:

```bash
claude plugin marketplace add stonegiantstudio/skills
claude plugin install stone-giant@stone-giant-studio-skills
```

Commands arrive namespaced, as `/stone-giant:park`.

For every other agent:

```bash
npx skills add stonegiantstudio/skills
```

There the commands are unprefixed — `/park`. Use one method or the other, not both, or you get duplicates.

## The two kinds

**Interactive commands** you invoke deliberately:

- `/park` — a shutdown ritual. It captures the state of what you were doing so the unfinished work stops occupying your attention after you close the laptop. This is the one I did not expect to care about and use most.
- `/score` — rubric-based evaluation of an artifact, with auto-iteration until it hits a target quality level.
- `/eval-npm` — dependency analysis across maintenance signals, security and bundle cost, so "should we add this package" becomes a data question.
- `/seo-geo-aeo` — search visibility assessment across Google, GA4 and threat data.

**Auto-triggered skills** that load when the context calls for them, without being asked:

- `npm-security-advisory` — supply-chain anomaly detection that fires before threat feeds catch up.
- `ci-performance` — critical-path analysis for pipelines, instead of guessing which job to parallelize.
- `react-router-v7`, `js-ninja`, `zod-ninja`, `testing-ninja`, `design-ninja` — framework and language patterns.
- `drizzle-migrations`, `signup-signin` — PostgreSQL migrations across environments, and auth UX covering OTP, passkeys and recovery flows.

Beyond those, the repo covers database and infrastructure work (PostgreSQL, SQL Server, Kysely, Lambda, Better Auth, Resend), writing and product, and a PDF suite for extraction, creation and report visualization.

## Why publish them

Two reasons, and the second is the honest one.

The first is that most of this is not proprietary. The skill that explains how to write a behavioural test is not a competitive advantage; it is a description of good practice that happens to be written for a machine reader. Keeping it private helps nobody.

The second is that publishing forces quality. A skill that only I read can be vague and still work, because I fill the gaps from memory. A skill someone else's agent reads cannot. Going through 36 of them with that lens found real problems — instructions that only made sense given context we had never written down.

If you use them and something is unclear, that is a bug. Issues and pull requests are open.
