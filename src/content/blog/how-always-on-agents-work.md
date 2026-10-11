---
title: How an agent loop works
date: 2026-10-11
description: How an always-on agent survives failures, handles interruptions, and keeps context costs down. Lessons from Lee Robinson's Stanford lecture, followed by my own starting plan.
author: Franklin Javier
tags: ai, agents, architecture, llm
lang: en
translationKey: always-on-agents
series: { key: agent-experiments, part: 2 }
toc:
  why-the-agent-cant-live-on-a-machine-you-close: Always-on machine
  a-replaceable-computer-makes-maintenance-possible: Replaceable computer
  corrections-need-priority-over-queued-work: Message queue
  a-retry-must-not-charge-you-again: Safe retries
  your-devices-should-read-the-same-saved-conversation: Conversation across devices
  give-the-agent-an-explicit-way-to-speak: Speaking to users
  load-the-tool-you-need-when-you-need-it: Tools on demand
  long-tasks-shouldnt-take-over-the-main-conversation: Delegating long tasks
  a-stable-prompt-keeps-repeated-input-cheaper: Prompt caching
  remember-preferences-without-carrying-every-conversation: Layered memory
  external-text-must-not-become-permission: Action authorization
  my-proposal-for-getting-started: Where to start
---

[Last time](/blog/old-macbook-context-server/), I wrote about the old MacBook that now stores my agents' context. That gives me somewhere to keep their history. I want to try the other half next: an agent that keeps working on its own there after I leave. Lee Robinson (@leerob)'s lecture [How always-on agents work](https://x.com/leerob/status/2108650243365736855), delivered at Stanford CS146S on October 8, 2026, lays out how that can work.

My other Mac already went to sleep halfway through a task. From my phone, I asked the agent on the server to find where the work had stopped. It retrieved the shared history, then checked GitHub to see what had actually been pushed.

In the [video](https://x.com/leerob/status/2108650243365736855): 2:35 (how we got here); 6:13 (models); 10:06 (architecture); 18:07 (harness); 27:26 (context); 34:26 (where this is going).

The architecture comes from the lecture. The MacBook stories come from my experiences in the previous post; the other examples are hypothetical. The plan at the end is mine.

## Why the agent can't live on a machine you close

A local process needs the computer to stay awake. My MacBook solves that problem by running as a server rather than a laptop: lid shut, plugged in, on all day, with sleep disabled. The lecture starts with the week-1 loop:

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

The model requests tools and uses their results to decide what comes next. The server runs this loop and saves each step. Apps display progress; a separate cloud computer runs tools that need a machine. Lee explains this split in the [video](https://x.com/leerob/status/2108650243365736855) (from 10:06).

<figure data-diagram="architecture"></figure>

There doesn't need to be a process waiting forever. The agent stops after 2 idle minutes, and the next event brings it back with its saved state. The figures throughout this post come from the lecture slides.

Suppose you ask for a comparison of some documents before leaving for the evening. You shut the laptop and check from your phone the next morning. The server can continue overnight, and the conversation comes from saved state rather than a terminal session you kept open.

## A replaceable computer makes maintenance possible

If rebuilding the agent's machine destroys its progress, a security patch becomes a decision about abandoning work. The lecture keeps conversations, memory, routines, and skills in server-side storage so the VM can be rebuilt.

The agent's computer is a Firecracker microVM per user. Agents belonging to that user share it, with separate virtual displays and Chrome instances. Files, installed tools, and browser sessions persist between sessions.

When idle, the VM synchronizes files to cloud storage, snapshots memory and disk, and stops. It never sleeps during a turn. A tool call that needs the computer restores the snapshot; commands still arrive from the server.

<figure data-diagram="lifecycle"></figure>

For a hypothetical example, an agent has prepared a spreadsheet and its computer has gone to sleep. You ask it to change the formatting. The relevant tool wakes the VM with the file and browser session preserved.

## Corrections need priority over queued work

Separate runs let related messages race each other. The agent may act before a correction arrives.

The lecture uses a router to discard duplicates and select a conversation. Each conversation has a queue, with one turn running at a time. Rapid messages form a batch. Slack events, group messages, routines, and helper results wait their turn. Your message in a one-to-one chat can interrupt or stop the current turn and take priority.

<figure data-diagram="wakeups"></figure>

Imagine asking in Slack to add a colleague to a meeting, immediately adding another attendee, then sending a thank-you. The agent can handle the batch as one request. If you then use the direct chat to move the meeting to Thursday, that correction cuts in rather than waiting behind the scheduling work.

## A retry must not charge you again

Restarting a job from scratch can repeat completed work. I rebooted the MacBook and cut its Wi-Fi, and the services came back on their own. Next I want to test whether a task resumes at the right step. With a payment, repeating a step could mean charging twice.

The lecture uses Temporal for durable workflows. The engine records steps so another server can resume from saved progress. It also supplies timers, cancellation, and health checks. Helpers each have their own durable workflow.

The steps must be idempotent too: retrying an operation must preserve its intended result without creating another effect. Recording progress alone can't close every gap between an external action and saving its outcome.

<figure data-diagram="durable"></figure>

Consider a hypothetical authorized purchase. The payment succeeds, but the server crashes before recording the result. Recovery may retry that step. The payment operation needs to recognize the same request and avoid a second charge. Durable execution handles resuming the task; idempotency handles repeating the operation safely.

## Your devices should read the same saved conversation

A weak connection can leave the client unsure whether a message arrived. Meanwhile, another device may miss a notification about new progress.

The client displays the message and saves it locally with a unique identifier. Retries reuse it; the server discards duplicates. Change notifications tell clients to fetch new messages from the database.

Clients apply numbered updates in order and reload from the database if they detect a gap. Notifications carry no conversation data; losing one leaves the stored work intact.

Suppose your phone drops offline just after you submit a task. It can resend the same message without creating another task. When you return to the desktop app, it retrieves the saved conversation, including progress made while the phone was disconnected.

## Give the agent an explicit way to speak

Showing every model response floods the chat with commentary and private reasoning. An event can warrant work without needing a reply.

The harness, the code that coordinates the model and its tools, makes `SendToUser` the only visible output. Ordinary model text stays private. A turn can end quietly. When there is something useful to report, the tool sends text, files, or controls for a user decision. The final send can also finish the turn without another model call.

My server's monitoring already follows a similar rule: it alerts me on Telegram when something changes. I turned off the Wi-Fi to test it, and the alert arrived. I'd test the loop with an approved document check: silence when the document is unchanged, an update when there's a relevant revision.

## Load the tool you need, when you need it

Unused tool definitions consume context. The lecture includes tool names in the prompt and loads descriptions and schemas on demand, as files.

This part of the harness is covered in the [video](https://x.com/leerob/status/2108650243365736855) (from 18:07). Each definition stays below 4,000 characters. The tool set remains stable between turns; an unavailable tool returns a clear error. State changes get a dedicated tool so a reviewer can see what changed. If the model spends 90% of its time repeating a shell pattern, that pattern should become a tool.

Tool selection follows an ascending cost order: existing context and memory, an app API, web search, the logged-in browser, the whole desktop, then asking the user. A broken connector is a reason to report the problem and ask. The agent must not bypass it through the browser.

<figure data-diagram="ladder"></figure>

Suppose you ask whether you're free tomorrow afternoon. The agent can load the calendar tool and query the API. If the connection fails, it tells you and asks how to proceed instead of attempting browser access on its own.

## Long tasks shouldn't take over the main conversation

Screenshots can crowd out useful context. Long tasks also leave the main agent unavailable when you need to redirect it.

The lecture delegates that work to helpers. The main agent supplies a complete task description and receives a short report. A task list tracks requests, and the main agent can check a helper, send it guidance, or stop it.

<figure data-diagram="helpers"></figure>

A computer-use helper handles clicks and screenshots. It can inspect page structure for web interactions; pixel-based work uses a 1280x800 display. When human intervention is needed, it stops and hands over control. The cloud coding helper makes changes **in its own VM, separate from the user’s VM**.

Imagine asking for a video review, then remembering a question about an unrelated deadline. The video helper can continue while the main agent answers you. Its final report brings the relevant findings back without filling the main conversation with all the material it examined.

## A stable prompt keeps repeated input cheaper

An agent repeatedly sends much of the same context to the model. If that prefix changes unnecessarily, it loses the opportunity to reuse cached input. The context engineering chapter starts in the [video](https://x.com/leerob/status/2108650243365736855) (from 27:26).

The lecture assembles the prompt in a fixed order and keeps the prefix identical until the next summary. History grows at the end. The latest message adds the time and brief notes about changes. A deployment that changes a tool description adds a note to an active conversation instead of rewriting its existing tool text.

<figure data-diagram="prompt-cache"></figure>

Lee treats a cache miss as a bug. Each section has a hash to help find what changed. This also shapes compaction: in the case described, the system waits roughly 10 minutes after a turn ends with the prompt above 100k tokens before summarizing. It reuses the prefix while the provider cache remains warm, within a 10–60 minute window.

The latest user-facing agent messages survive word for word. Compaction is skipped if background work is about to wake the agent anyway. Compression loses information, so a smaller prompt still depends on a good summary.

Picture a long research task ending just as you leave the chat. During that pause, the system can summarize using the cached prefix. Your follow-up starts with a shorter history, while the last response you saw remains intact.

## Remember preferences without carrying every conversation

Saving everything doesn't guarantee useful recall. I tell my agents to treat memory as history and check the repository and its change history for the current state. The agent that picked up after my other Mac fell asleep checked GitHub too. Loading all that history would crowd out the current request.

The lecture's profile always enters the prompt, with up to 100 facts in 4,000 characters. A dated log contributes the 30 most relevant and recent events. Notes hold short-lived details, and a memory-search tool retrieves the rest.

After each turn, a memory pass adds facts and replaces old ones. It can remove only facts it was shown. Stored memory supplies information; it doesn't have authority to issue instructions.

For instance, you might say you prefer afternoon meetings. The profile can carry that preference into later scheduling requests. If you ask why an old meeting was moved, the agent searches for the specific history instead of reading every past conversation just to suggest a time.

## External text must not become permission

A phishing email can tell an agent to send money and claim urgency. I already limit each agent's permissions to what it needs. The loop also has to distinguish incoming text from a request I've authorized.

The lecture tags email and webhook content as untrusted. A separate model reviews risky actions before they run. If the model blocks the action, the user receives an approval request. If the user doesn't answer within 15 seconds, the action stays blocked.

Irreversible sends go through a draft and an explicit send confirmation. The agent doesn't message other people without a user request, and new routines need approval. Secrets stay in environment variables, outside the model.

Imagine an incoming email announcing new bank details and requesting a transfer. That text remains external content, with no authority to approve a payment. Any attempted risky action faces review. If the model blocks it, you receive an approval request; if you don't answer within 15 seconds, the action stays blocked. If you ask the agent to reply, you get a draft to inspect before sending.

## My proposal for getting started

In the final part of the [lecture](https://x.com/leerob/status/2108650243365736855) (from 34:26), Lee proposes “Delete the product”: build the minimum around the model and remove what it no longer needs.

This is my proposal, separate from Lee's lecture. I'd build continuity before granting broad access to consequential actions.

1. Run the loop on a server and save conversations and progress in Postgres. Have clients retrieve that state when notified of a change.
2. Use Temporal to resume tasks, with idempotent steps. Add a conversation queue that batches quick messages and lets direct corrections interrupt ongoing work.
3. Make `SendToUser` the visible output boundary. Load tool definitions as needed, preserve the prompt prefix, and combine a short profile with searchable memory.
4. Start computer access with an isolated container per user. Give long tasks to helpers and move toward VM snapshots when idle machine costs justify the work.
5. Review risky actions automatically and require confirmation for irreversible sends. Turn actual failures into evaluation cases that guide the next fix.

I'd begin with an overnight document comparison that I can redirect from my phone. That gives me a concrete task to build around before adding payments or messages to other people.

I now have a way to assess whether a task can keep going after I leave the conversation. I still need to test how it picks up after an interruption, and how agents coordinate their work. Next in the series, I'll turn to the agent workshop, where I plan to have several agents running in loops together.
