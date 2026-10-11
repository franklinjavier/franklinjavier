---
title: How always-on agents work
date: 2026-10-11
description: The architecture, event handling, tools, and memory behind the agent in Lee Robinson's Stanford lecture. Includes my proposed implementation and acceptance criteria.
author: Franklin Javier
tags: ai, agents, architecture, llm
lang: en
translationKey: always-on-agents
---

I want to give an agent a task over chat, close my laptop, and come back to work that has continued without me. Lee Robinson (@leerob) explains the engineering behind that behavior in [How always-on agents work](https://x.com/leerob/status/2108650243365736855), his Stanford CS146S lecture from October 8, 2026.

The figures shown on the slides are 2 minutes, 15 seconds, 4,000 characters, 100 facts, 30 events, 1280x800, and 100k tokens. The 90% shell rule below, the roughly 10-minute delay, and the 10-to-60-minute cache window also come from the lecture. The final section is my own plan: its example 2-to-3-second batch window, interruption under 1 second, and cache-hit target above 90% are my proposals.

## Start with the loop we already know

The lecture starts with the week-1 terminal loop:

```python
messages = [system_prompt, user_message]
while True:
    reply = llm(messages, tools=TOOLS)
    messages.append(reply)
    if not reply.tool_calls:
        print(reply.text); break
    for call in reply.tool_calls:
        messages.append(run_tool(call))
```

The model reads messages, requests tools, and uses their results to decide what to do next. Running that interaction over months adds requirements the message list alone can't handle.

<div class="overflow-x-auto">
<table>
<thead><tr><th>Concern</th><th>Terminal agent</th><th>Agent in the lecture</th></tr></thead>
<tbody>
<tr><th scope="row">Execution</th><td>Stops when the laptop closes.</td><td>Server execution survives crashes and deployments.</td></tr>
<tr><th scope="row">Computer access</th><td>Uses the user's laptop.</td><td>Uses a cloud VM with a desktop, browser, and files.</td></tr>
<tr><th scope="row">Memory</th><td>Remembers only the message list.</td><td>Saves state, memory, and skills, and summarizes old messages.</td></tr>
<tr><th scope="row">Output</th><td>Prints the model's response.</td><td>Sends messages through a tool when there is something to say.</td></tr>
<tr><th scope="row">Activation</th><td>Waits for terminal input.</td><td>Responds to messages, schedules, and other events.</td></tr>
<tr><th scope="row">Continuity</th><td>Does one task and exits.</td><td>Works for months with the same memory across conversations.</td></tr>
</tbody>
</table>
</div>

The intended interaction feels like messaging a colleague. You direct the work and can change course while it's running. A correction that moves the task to Thursday interrupts the work and continues the same request. The agent should send useful updates and stay quiet otherwise. A separate model reviews risky actions so that routine work doesn't require approval for every command.

## Put the loop on the server

The architecture separates the apps, the agent server, and the agent's computer. Apps accept input and display progress. The server validates and routes events, manages conversation queues, calls the model, and saves state. The VM runs tools that need a computer.

The loop belongs on the server. That lets a user switch from desktop to phone without moving the work, and allows server changes to ship without waiting for App Store review. Heavy work such as transcription and image processing also stays off the client. This separation lets the system scale as it grows rapidly. An agent that works for months can't depend on keeping one device open.

The same separation applies to the VM. Conversations, memory, routines, and skills live in server-side storage. If a zero-day vulnerability needs a patch, the VM must be rebuilt without losing the agent's work. If the loop ran on the VM, rebuilding or shutting down that VM would stop the agent.

### Stop the process when it’s idle

After completing a turn, the agent process stops after 2 idle minutes. The VM saves a disk snapshot when idle and wakes when a tool needs it.

When nothing happens, nothing runs. The saved state lets the next trigger bring the agent back. A scheduled routine that doesn't need computer access can finish while the VM stays asleep.

## Each conversation has a queue

User messages can arrive through different apps. Other triggers include schedules, webhooks, Slack mentions, DMs, and threads, calls, meetings, another agent, a completed background task, and scheduled check-ins.

A router deduplicates those events and chooses the conversation. Each conversation has a queue, with a single turn running at a time. Every activation records its source so the agent can distinguish a user request from a routine or an external service.

The queue treats a direct message from the owner differently from other input. In a one-to-one chat, that message interrupts or stops the current turn and moves to the front. Group messages, Slack events, routines, and helpers go to the back. Rapid messages become one turn. The agent processes one batch at a time.

Once activated, the agent still decides whether it has anything useful to say. Getting an event doesn't mean the agent has to reply.

## Retries and sync

Sending begins on the client. The app displays the message immediately and stores it locally with a unique ID. The server ignores IDs it has already received, allowing the client to retry without creating duplicate messages.

The server queues the message and saves every step of the turn, including model interactions and tool calls. Other open apps receive a small notification that something changed, then fetch new messages from the database. The notification carries no conversation data. A lost notification doesn't take the stored messages with it.

Updates have sequence numbers. Clients apply them in order and reload from the database when they detect a gap.

### A workflow must resume from its recorded progress

A job queue can restart a failed job from the beginning, repeating work that already finished. A durable workflow records each step so any server can resume from the last recorded step, provided those steps are idempotent. The lecture uses Temporal, an open-source workflow engine, for this.

Idempotent steps preserve the intended result when retried. The engine supplies timers, cancellation, and health checks, while recorded progress survives a server failure.

Helpers get their own durable workflows too. A video helper that runs out of memory can restart without discarding everything it has done.

## The VM is the agent's workspace

The computer shown in the lecture is a Firecracker microVM per user. A supervisor keeps a Debian container running inside it. A file server exposes files, app connections, and a live desktop view that the user can watch or take over. A command runner handles shell commands, file operations, screenshots, and clicks.

Agents belonging to the same user share the machine. Each active agent gets a virtual display and its own Chrome instance. Installed tools, files, and browser logins persist across sessions.

After a few minutes without activity, the VM synchronizes files to cloud storage, snapshots memory and disk, and stops. It never sleeps in the middle of a turn. The next tool call that needs the machine restores the snapshot in place, with commands still arriving from the server.

## Control the model through the harness

The harness is the code and tool interface around the model. In the lecture, the harness decides what the user sees, how the model discovers tools, and how work gets delegated.

### Sending is an explicit action

`SendToUser` is the only outbound bridge to the clients, including web, desktop, mobile, Slack, email, and voice. Ordinary model text stays private. A turn can therefore finish without producing a user-facing message.

The tool supports text, files, multiple-choice controls, and secure password input. New clients need to understand that output interface. The final send can also end the turn directly, saving another model call.

The client intercepts the payload and shows a control for that action. The lecture's login flow uses 1Password to fill only the open site; the model never receives the password. A Stripe Link payment waits for the user's allow-or-deny decision. An email draft shows the entire message with send and discard controls. Sometimes an emoji is enough.

### Load tool definitions when needed

The prompt lists tool names. The model loads a tool's schema and description on demand, reading them as a file. Keeping unused definitions out of the prompt leaves room for conversation and reduces cost.

The agent tries available approaches in this order:

1. Existing context and memory.
2. An app API through a connector or MCP.
3. Web search.
4. Its logged-in browser.
5. The full desktop.
6. Asking the user.

Moving down that list increases latency, cost, and risk. A broken connector is an exception to the fallback order: the agent reports the failure and asks, rather than bypassing it through the browser.

For web pages, the agent can inspect the accessibility tree or DOM and target buttons, links, and fields directly. The lecture describes this as faster and more reliable than screenshots. Desktop apps and system dialogs require mouse and keyboard interaction with pixels on a 1280x800 display. Login, verification codes, captchas, and payments can require a handoff: the agent stops, explains where it is, and gives the person control.

### Delegate without losing the conversation

The main agent answers quick questions itself and delegates longer work so it remains available in chat. It sends a complete task description and gets a short report back. Helpers handle general work (shell, web, connectors, and cloud agents), browser and desktop use, and watching and reviewing video files. The cloud coding agent changes code on the same per-user VM. The computer-use helper takes one task at a time, handles clicks, and keeps screenshots out of the main agent's context. A task list tracks requests, and the main agent can check a helper, message it, or stop it.

Keep the tool set stable between turns. An unavailable tool returns a clear error. Each tool's description and schema stay under 4,000 characters. Save state with a dedicated tool instead of shell, so the reviewer sees the change directly. If the model spends 90% of its time on the same shell pattern, that pattern becomes a tool.

Errors should tell the agent how to proceed. The lecture supplies this example:

> The computer is asleep. Use Shell or Read to wake it, then try again.

## Risky actions need a check

A separate model checks risky actions before execution. If it blocks an action, the user receives an approval request. No response within 15 seconds leaves the action blocked.

Email and webhook content are marked as untrusted input. Treat saved memories as information, not instructions.

The agent doesn't email or message other people without a user request, and new routines require approval. Irreversible sends, including email and Slack, go through a draft and an explicit send confirmation. Passwords stay in environment variables, outside the model. Actions on the user's own laptop also require approval.

## Keep the prompt prefix stable

The prompt has a fixed assembly order. Tool definitions come first, followed by the system prompt with a snapshot of memory and routines. The first message contains environment details and the list of tool names. That prefix stays identical until the next summary.

History grows at the end. The newest message adds the current time, short notes about changes, and the user's input. On the next call, the earlier history becomes part of the reusable prefix.

Lee treats a cache miss as a bug. Each prompt section has a hash so engineers can locate the change. Ordering must remain stable, including during A/B tests. If a deployment changes a tool description, an active conversation receives a note instead of a rewritten prefix. Opening the chat or starting to type lets the server prepare the prompt and warm the cache ahead of the request.

Caching helps with repeated input, but the main agent still needs to limit what it carries:

<div class="overflow-x-auto">
<table>
<thead><tr><th>Large input</th><th>What the main agent keeps</th></tr></thead>
<tbody>
<tr><th scope="row">Long tool output</th><td>A path to the file containing it.</td></tr>
<tr><th scope="row">Tool-heavy work</th><td>A short helper report.</td></tr>
<tr><th scope="row">Old messages</th><td>A summary.</td></tr>
<tr><th scope="row">Older memories</th><td>The most important facts; the rest stay searchable.</td></tr>
<tr><th scope="row">Task instructions</th><td>A one-line pointer to a skill.</td></tr>
</tbody>
</table>
</div>

A large turn ends with more than 100k tokens in the prompt. About 10 minutes pass, then the system summarizes while the provider cache is still warm. The lecture gives a cache window of 10 to 60 minutes. The summary is written reusing that same prefix, and the next message starts from the short summary.

This compaction is skipped when background work is about to wake the agent anyway. The latest messages sent to the user remain verbatim, and an excessively long turn can also be compacted before it ends. Compression loses information. The summary algorithm is the hard part.

## Memory needs limits and update rules

The lecture separates memory into layers:

<div class="overflow-x-auto">
<table>
<thead><tr><th>Layer</th><th>Prompt behavior</th></tr></thead>
<tbody>
<tr><th scope="row">Profile</th><td>Core user facts always included, capped at 100 facts in 4,000 characters.</td></tr>
<tr><th scope="row">Log</th><td>Dated events, with the 30 most relevant and recent included.</td></tr>
<tr><th scope="row">Notes</th><td>Short-lived details that expire quickly.</td></tr>
<tr><th scope="row">Remaining memory</th><td>Retrieved by a memory-search tool when needed.</td></tr>
</tbody>
</table>
</div>

After each turn, a memory pass adds new facts and replaces old ones. It may remove only facts it was shown. Important facts rank higher, while older facts gradually move down. User facts are shared across that user's agents, with each agent writing to its own file.

Lee uses the phrase "everything is computer" for knowledge stored as plain text. Both the user and agent can read, search, and edit it. A preference said once goes to memory. Skills load only when needed. A one-line pointer stays in the prompt, and the skill file describes its use with wording such as "Use this when...". Plugins can package skills and MCP servers.

The files have a concrete layout:

```text
memory/
  profile.md        # always in the prompt
  log/2026-10.md    # dated facts, one per line
skills/
  linkedin-sourcing/SKILL.md   # "Use this when..."
  weekly-metrics/SKILL.md
routines/
  morning-brief     # prompt + weekdays at 8:00
```

Routines are prompts with cron-style schedules. Show the agent a task on its computer, and it saves the steps as a skill.

## Training and evaluation keep changing the implementation

The lecture discusses training models for the harness. Supervised fine-tuning teaches the harness's tools and formats, and when to answer quickly. Reinforcement learning teaches the model to follow long instructions, pick the right skill among hundreds, click the right place, and work with other agents. The main agent is tuned to answer in seconds; helpers are tuned to finish hours of work reliably.

Errors feed a daily development cycle: turn a failure into an evaluation case, change the harness, prompt, or inference, run the evaluations, and publish. The next model is trained on that harness and those evals.

"Delete the product" is Lee's direction for reducing the code around the model as the model becomes able to do more of the work itself. The remaining problems include evaluating agents over weeks, replacing stale memories, honoring requests to forget, avoiding invented memories, prompt injection, deciding when to speak, coordinating agents that share a computer and memory (classic distributed-systems problems), and keeping idle costs close to zero.

The building blocks extend beyond the model loop: durable workflows, computer use, memory and skills, scheduled jobs and triggers, connectors and authentication, text and voice channels, payments and identity, evaluations, and observability.

## My implementation proposal, separate from the lecture

**This section is my own plan, not part of Lee's lecture.** I'd start with the pieces needed to test whether work survives failures and whether the user can redirect it.

1. Use a server and Postgres to store conversations, sequenced messages with unique client IDs, events with source and deduplication keys, `memory_facts(tier, agent_id, importance, created_at)`, and routines. Skills could live in versioned files.
2. Give each conversation and helper a Temporal workflow. Process a batch per turn, with each tool call implemented as an idempotent activity. A direct message from the owner would signal cancellation and take priority; other events would use a short batching window, such as 2 to 3 seconds.
3. Build a fixed prompt prefix with a hash per section. Keep `SendToUser` as the only visible output, load tool definitions through `get_tool(name)`, and write long outputs to files.
4. Send only conversation and sequence identifiers through Postgres LISTEN/NOTIFY, SSE, or a websocket. Clients would fetch after their last sequence and reload when they found a gap.
5. Begin with a Debian Docker container per user, Chrome on Xvfb, a display per agent, Playwright using the accessibility tree, and noVNC for the live view. Move to Firecracker snapshots when keeping idle computers running becomes too expensive.
6. Keep the profile within 4,000 characters and include the 30 most relevant log entries. Use notes with a time to live (TTL) and full-text search or embeddings for other memories. A cheaper model would propose additions and replacements after each turn, removing only IDs it had seen.
7. Schedule compaction after large turns, within the cache window, preserving the latest user-facing agent messages verbatim.
8. Put automatic review before shell operations, sends, and payments, with timeouts leaving actions blocked. Mark external input with `<untrusted source=...>`, keep secrets in environment variables, and require drafts and confirmation for irreversible actions.
9. Turn real failures into evaluations from the start: selecting the wrong tool, speaking unnecessarily, breaking the prompt cache, or ignoring an interruption.

I'd accept the implementation, including idle suspension, only when it met these proposed criteria:

- Closing the client during a task and reopening it shows progress without repeated steps.
- Killing the worker during a turn resumes work from the last recorded step.
- A correction that moves the task to Thursday interrupts the active turn in less than 1 second.
- Three rapid messages produce a single turn.
- The prefix cache-hit rate stays above my 90% target over a long conversation: a hit means the next call reuses the prefix. Section hashes identify where the prefix changed.
- An idle agent has no running process or VM.
