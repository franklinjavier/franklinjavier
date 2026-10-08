---
title: My old MacBook is now a context server
date: 2026-10-08
description: A 2017 MacBook Pro, lid closed and plugged in, now keeps my work context across machines, projects and agents. I start a task on my phone, and any agent picks it up from there with the same context, without me repeating a thing.
author: Franklin Javier
tags: ai, agents, self-hosting, tooling, productivity
lang: en
translationKey: old-macbook-context-server
---

I had a 2017 MacBook Pro sitting around doing nothing. Intel i5, 8 GB of RAM, macOS 13. Now it lives with the lid closed, plugged in, on all day, and it's become the most useful piece of how I work.

It isn't fast. What it does is hold on to something I kept losing: **context**.

I work across more than one machine, on several projects, with several agents: Claude Code, Codex, a personal agent on Telegram, and the grok bot, an autonomous agent that runs in the cloud. Each of them used to start from zero. Now they all read from and write to the same place, and any one of them can pick up where another stopped.

In practice, I don't need to carry a MacBook around to build things. From my phone I open a coding session on the server, and when I sit down at the other Mac, the agent there already knows what happened.

## The hardware

Nothing special:

- 2017 MacBook Pro, i5, 8 GB of RAM, macOS 13;
- lid closed, plugged in, 24/7;
- sleep disabled and a battery charge limit, so the battery doesn't swell.

I was worried it would overheat with the lid shut. So I tested it: more than an hour closed, with everything running, and the CPU never hit thermal throttling. The battery sat around 31 °C, load hovered near 0.7, and 67% of memory was still free.

It replaced a VPS I was renting just to run my personal agent. I switched because I wanted the hardware under my control and everything in one place.

## The architecture, roughly

**Everything in Docker.** I run it through Colima, a lightweight VM on the Mac. That was on purpose: if this "server" ever turns into a Linux desktop at home, the same compose files come up there with no rework. The Mac is a detail. If I want to retire the MacBook, moving to a VPS or a Linux box means restoring the backup and bringing up the same compose files.

**Private network, no open ports.** The server, my other Mac, my phone and the grok bot sit on a private Tailscale network. To talk to the server, you have to be inside it.

**A single public entry point.** A Cloudflare tunnel lets through only the GitHub webhooks that feed the code reviewer, filtered by path and with the signature verified. Everything else stays closed.

The services start on their own at boot, through launchd. I tested rebooting the machine and killing the Wi-Fi, and everything came back without me touching it.

## What runs there

- **A personal agent on Telegram**, with separate profiles: a personal one, a code reviewer, and one for my condo building's business. Each profile gets only the permissions it needs. The condo one, for example, can't see GitHub.
- **An automatic code reviewer.** When a PR requests my review, GitHub calls the webhook and the agent reviews it. The repository clones live on the server and double as a place to develop. `node_modules` is shared across the review worktrees, otherwise the disk can't keep up.
- **Home automation.** A few Shelly relays, exposed to the agents through MCP.
- **Claude Code reachable from my phone**, with Remote Control, surviving reboots. Part of the session where I set all this up was driven from my iPhone.
- **The shared memory**, which is the reason for this post.

## Shared context

A memory server runs on this Mac. Right now it takes in Claude Code on the server itself, Claude Code and Codex on my other Mac, the Telegram agent, and the grok bot, which has its own machine in the cloud and develops with the Claude Code CLI there.

I use [ai-memory](https://github.com/akitaonrails/ai-memory) for this, but the tool could be swapped. What I wanted was the flow.

### Nobody has to say "save this"

Hooks record every coding session automatically. The sessions that matter get summarized by an LLM. I use my ChatGPT/Codex subscription for that, no paid API.

The project is inferred from the repository where the session ran. When the grok bot works on repository X, I see it when I open repository X on any machine, and the reverse holds too.

### Every session starts knowing what came before

When a session opens, the agent gets a summary of what was done on that project, including by another agent on another machine. And there's the handoff: one agent explicitly passes the baton to the next, with what's left to do and what must not be forgotten.

This post started that way. Claude Code on the server left a briefing, and the agent that looks after my site picked it up from there.

Today there was another case. My other Mac went to sleep in the middle of a Codex task. From my phone, I asked Claude Code on the server to figure out where it had stopped. It found in memory the full requests Codex had made to Claude Code, with the exact text of the uncommitted changes, and checked on GitHub what had already made it into the PR and what hadn't.

![One place for context: the other Mac, the grok bot and the Telegram agent read and write the shared memory on the old MacBook; the phone opens Claude Code sessions on that same MacBook](/images/blog/macbook-velho-virou-servidor-de-contexto/fluxo-contexto-en.svg)

### The past came in too

I imported old sessions, including ones from worktrees I had already deleted after merging. To do that, I recreated the folders temporarily. One project alone had about 189 sessions, all summarized without a single error, using a small fraction of the subscription's limit.

That's the kind of thing I want: solve a Stripe integration in one project and have the answer at hand when the same problem shows up in another.

### The rule that keeps memory from lying

Agent memory has an obvious risk: stale information turning into a confident claim.

So every agent gets the same instruction. What comes from memory is **history**, not the current state. Before claiming anything about code, configuration or commands, it checks the repository and `git log`, separates what it just confirmed from what it only remembered, and says so when memory disagrees.

Without that rule, I wouldn't trust the rest.

### Permissions that match the risk

The grok bot can search, read and write memory. It can't delete pages or trigger LLM summaries, which burn through my quota.

In exchange, it reads everything, including context from other projects. I accepted that trade-off knowing what it meant. If it ever stops making sense, the bot is out.

### The ping-pong test

To be sure it worked, each side left a "password" for the other to find.

The grok bot found the one the server left. The server found two: the one the grok bot saved on purpose, and one it had only *mentioned* in a conversation, which the hooks picked up on their own. In the next session, the grok bot already knew about the previous conversation without anyone asking it to save anything. That's when I knew it worked.

## Backups, monitoring and reminders

I set up a **daily, encrypted backup** to object storage. `node_modules` and worktrees are left out. The SQLite databases go in as consistent snapshots. Retention is 7 daily, 4 weekly and 3 monthly, with a hard cap of 8 GB so it never leaves the 10 GB free tier. The first backup came to about 0.75 GB.

**Monitoring every 5 minutes**, with a Telegram alert only when something changes: a container went down, disk, memory, a late backup, the Mac off the charger, temperature, thermal throttling, a failure in the summary LLM. A dead-man switch on [healthchecks.io](https://healthchecks.io) warns me if the whole server disappears. I ran a quick test by turning off the Wi-Fi, and the alert landed in Telegram.

I also set up **scheduled reminders** on Telegram for when it's time to shut down the old VPS (and stop paying for it) and to renew the GitHub tokens.

## What went wrong along the way

- **Homebrew on an Intel Mac.** In September 2026 it stopped installing on Intel Macs. I installed everything from official binaries, checking checksums.
- **False alarm at boot.** The containers take a while to come up after a restart, so the monitor ignores Docker alerts for the first 10 minutes.
- **The grok bot's machine has no systemd.** PID 1 is `tini`, and the machine gets recreated on every update, but the home directory persists. The fix was to install the Tailscale client inside home and start it from a Claude Code hook at the beginning of each session.
- **AI subscriptions.** Using the ChatGPT/Codex account for summaries was painless. Using the Claude subscription outside the official apps I ruled out, because of the terms-of-service risk.

## Where the context lives

Docker, private networks, backups and monitoring have been around for years. None of the pieces here is new.

What I did was put them together around one question: where does the context of my work live? It used to be scattered across sessions that died when I closed the terminal. Now it lives on an old MacBook, lid closed, that every agent checks before starting and updates when it's done. And since each agent verifies what it remembers before stating it, I can trust it.

I open a session from my phone, sit down at another machine later, or leave the grok bot working on its own, and the work picks up where it stopped.
