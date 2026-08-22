---
title: We published 36 of our agent skills as open source
date: 2026-08-22
description: Stone Giant Studio's internal skills for AI coding agents are now public - markdown files, no dependencies, portable across Claude Code, Cursor, Codex and Gemini CLI.
author: Franklin Javier
tags: ai, agents, open-source, tooling
lang: en
translationKey: open-source-agent-skills
---

At Stone Giant Studio we built up a private toolchain for AI coding agents. All the "this is how we actually do this here" that we kept re-teaching to every new agent session. We put 36 of those skills under Apache-2.0 at [github.com/stonegiantstudio/skills](https://github.com/stonegiantstudio/skills).

## A skill is a markdown file

That is the entire format. No binaries, no runtime, nothing to install.

It follows the [agentskills.io](https://agentskills.io) spec, so the same file works in Claude Code, Cursor, Codex, Gemini CLI and a long list of others.

Sounds too simple to be useful, I know. But think about where you actually lose time with a coding agent. It is rarely capability. It is that the agent does not know your conventions, your review bar, or the three sharp edges in the library you use. A skill is that knowledge, written down once, somewhere the agent reads on its own.

The portability matters more than it looks. Tooling in this space turns over fast. Knowledge in a markdown file survives you switching agents. Knowledge in one vendor's plugin does not.

## Installing

Claude Code, through the plugin system:

```bash
claude plugin marketplace add stonegiantstudio/skills
claude plugin install stone-giant@stone-giant-studio-skills
```

Commands come namespaced, like `/stone-giant:park`.

Everything else:

```bash
npx skills add stonegiantstudio/skills
```

There they come unprefixed, `/park`. Pick one method, not both, or you get duplicates.

## What is in there

Some you call on purpose:

- `/park` is a shutdown ritual. It captures the state of what you were doing so the unfinished work stops running in your head after you close the laptop. I did not expect to care about this one and I use it most.
- `/score` evaluates an artifact against a rubric and iterates until it hits a target.
- `/eval-npm` looks at maintenance, security and bundle cost together, so "should we add this package" becomes a question with data behind it.
- `/seo-geo-aeo` checks search visibility across Google, GA4 and threat data.

Others load by themselves when the context calls for them. `npm-security-advisory` catches supply-chain anomalies before the threat feeds do. `ci-performance` does critical-path analysis on your pipeline instead of you guessing which job to parallelize. Then `react-router-v7`, `js-ninja`, `zod-ninja`, `testing-ninja`, `design-ninja` for framework and language patterns, `drizzle-migrations` for PostgreSQL migrations across environments, and `signup-signin` for auth UX with OTP, passkeys and recovery flows.

The rest covers database and infrastructure work, writing and product, and a PDF suite for extraction and reports.

## Why publish them

Two reasons, and the second is the real one.

Most of this is not proprietary. The skill explaining how to write a behavioural test is not a competitive advantage. It is good practice, written for a machine reader instead of a human one. Keeping it private helps nobody.

The second reason is that publishing forces quality. A skill only I read can be vague and still work, because I fill in the gaps from memory without noticing. A skill someone else's agent reads cannot. Going through all 36 with that in mind turned up real problems: instructions that only made sense if you already knew things we had never written down anywhere.

If you use them and something is unclear, that is a bug. Issues and pull requests are open.
