---
title: My old MacBook is now a context server
date: 2026-10-08
description: A 2017 MacBook Pro, lid closed and plugged in, stores session history from my agents across machines and projects. When a task stops halfway, the next agent starts from a summary and is told to check the repository for the current state.
author: Franklin Javier
tags: ai, agents, self-hosting, tooling, productivity
lang: en
translationKey: old-macbook-context-server
---

My other Mac went to sleep halfway through a Codex task. From my phone, I asked Claude Code, which runs on an old MacBook, to work out where things had stopped. In shared memory it found the full requests Codex had sent it, with the exact text of the changes that hadn't been committed. Then it checked GitHub to see what had already made it into the PR and what hadn't.

That MacBook is a 2017 Pro with 8 GB of RAM. It sits with the lid closed, plugged in, on all day, and stores the session history of the agents I work with.

There are a few of them: Claude Code, Codex, a personal agent on Telegram, and the grok bot, an autonomous agent that runs in the cloud. They're spread over more than one machine and several projects, and each one used to start from scratch. Now they all read and write in the same place, and whoever picks up the work gets a summary of what the last one did.

In practice, I don't need to carry a MacBook around to build things: I open a coding session on the server from my phone.

## The hardware

Nothing special:

- 2017 MacBook Pro, i5, 8 GB of RAM, macOS 13;
- lid closed, plugged in, 24/7;
- sleep disabled and a battery charge limit to reduce wear.

I was worried it would overheat with the lid shut. During a test of more than an hour with the lid closed and everything running, the CPU never hit thermal throttling, the battery stayed around 31 °C, load hovered near 0.7, and 67% of memory was still free.

It replaced a VPS I was renting just to run my personal agent. I wanted the hardware under my control and everything in one place.

## The architecture, roughly

**Everything in Docker.** I run it through Colima, a lightweight VM on the Mac. I picked that with the MacBook's retirement in mind: the plan is to restore the backup on a Linux desktop at home or a VPS and bring up the same compose files there. Anything that runs outside the containers, like the launchd services, wouldn't come along with the compose files.

**Private network.** The server, my other Mac, my phone and the grok bot are on a private Tailscale network, and that's how I reach the server. The one public exception is a Cloudflare tunnel that lets through only the GitHub webhooks feeding the code reviewer, filtered by path and with the signature verified.

The services start on their own at boot, through launchd. I tried rebooting the machine and killing the Wi-Fi, and everything came back without me touching it.

## What runs there

- **A personal agent on Telegram**, with separate profiles: a personal one, a code reviewer, and one for my condo building's business. Each profile gets only the permissions it needs. The condo one, for example, can't see GitHub.
- **An automatic code reviewer.** When a PR requests my review, GitHub calls the webhook and the agent reviews it. The repository clones live on the server, and I also use them for my own development work. The review worktrees share one `node_modules`, so the dependencies aren't installed again for every worktree and the disk doesn't fill up.
- **Home automation.** A few Shelly relays, exposed to the agents through MCP.
- **Claude Code reachable from my phone**, with Remote Control, surviving reboots. I drove part of the setup session from my iPhone.
- **The shared memory**, which is why I'm writing this.

## Shared context

A memory server runs on this Mac. It stores session history from Claude Code on the server itself, Claude Code and Codex on my other Mac, the Telegram agent, and the grok bot, which has its own machine in the cloud and develops there with the Claude Code CLI.

I use [ai-memory](https://github.com/akitaonrails/ai-memory) for this, but the tool could be swapped. What I wanted was the flow.

### Nobody has to say "save this"

Hooks record every coding session automatically. The sessions that matter get summarized by an LLM, using my ChatGPT/Codex subscription rather than a paid API.

The project is inferred from the repository the session ran in. When the grok bot works on repository X, I see that work when I open repository X on any machine, and it works the other way too.

### Each session starts with a summary

When a session opens, the agent gets a summary of what was done on that project, including work by another agent on another machine. The summary is short, and the agent can search the memory for more. There's also the handoff: one agent writes down what's left to do and what the next one shouldn't forget.

This post started that way. Claude Code on the server left a briefing, and the agent that looks after my site picked it up.

![One place for context: the other Mac, the grok bot and the Telegram agent read and write the shared memory on the old MacBook; the phone opens Claude Code sessions on that same MacBook](/images/blog/macbook-velho-virou-servidor-de-contexto/fluxo-contexto-en.svg)

### Importing the old sessions

I imported old sessions, including ones from worktrees I had already deleted after merging. To do that, I recreated the folders temporarily. One project alone had about 189 sessions, and every one of them was processed without a failure. That doesn't mean every summary is right.

What I'm after is solving a Stripe integration in one project and having the fix at hand when the same problem shows up in another.

### Checking memory against the repository

Agent memory has an obvious risk: stale information turning into a confident claim.

So every agent gets the same instruction. What comes from memory is **history**, not the current state. Before claiming anything about code, configuration or commands, it should check the repository and `git log`, separate what it just confirmed from what it only remembers, and point out when memory disagrees with the repo. When the other Mac went to sleep, Claude Code checked GitHub against what memory said.

### Permissions that match the risk

The grok bot can search, read and write memory. It can't delete pages or trigger LLM summaries, which eat into my quota.

In exchange, it reads everything, including context from other projects. I accepted that trade-off. If it ever stops making sense, the bot is out.

## Backups, monitoring and reminders

The **backup** runs daily, encrypted, to object storage. It skips `node_modules` and worktrees, and the SQLite databases go in as consistent snapshots. Retention has an 8 GB hard cap so it stays inside the 10 GB free tier. The first backup came to about 0.75 GB.

**Monitoring** runs every 5 minutes and only alerts me on Telegram when something changes: a container going down, disk, memory, temperature, thermal throttling, a late backup, the Mac off the charger, or a failure in the summary LLM. A dead-man switch on [healthchecks.io](https://healthchecks.io) tells me if the whole server disappears. I tested it by turning off the Wi-Fi, and the alert showed up in Telegram.

A couple of **scheduled reminders** on Telegram tell me when to shut down the old VPS and when to renew the GitHub tokens.

## What went wrong along the way

- **Homebrew on an Intel Mac.** [Homebrew 7.0.0](https://brew.sh/2026/09/13/homebrew-7.0.0/), released in September 2026, moved Intel macOS to Tier 3: no support from the project and no new bottles. It's scheduled to stop running on Intel on September 1, 2027. I installed what I needed from official binaries and checked the checksums.
- **False alarm at boot.** The containers take a while to come up after a restart, so the monitor ignores Docker alerts for the first 10 minutes.
- **The grok bot's machine has no systemd.** PID 1 is `tini`, and the machine gets recreated on every update, but the home directory persists. I ended up installing the Tailscale client inside home and starting it from a Claude Code hook at the beginning of each session.
- **AI subscriptions.** Using the ChatGPT/Codex account for summaries was painless. I ruled out using the Claude subscription outside the official apps because of the terms-of-service risk.

## The ping-pong test

To see whether it worked across machines, each side left a "password" for the other to find.

The grok bot found the one the server left. The server found two: the one the grok bot saved on purpose, and one it had only *mentioned* in a conversation, which the hooks picked up on their own. In the next session, the grok bot already knew about that earlier conversation, and nobody had asked it to save anything.
