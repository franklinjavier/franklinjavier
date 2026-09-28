---
title: 'Lisbon AI 2026: agents, evals and security'
date: 2026-09-25
description: 'My notes from all 32 talks at Lisbon AI 2026, with the demos, the numbers and the audience questions.'
author: Franklin Javier
tags: ai, agents, evals, security, conference
lang: en
translationKey: lisbon-ai-2026
image: /images/blog/lisbon-ai-2026/og.jpg
draft: false
---

<figure>
  <img src="/images/blog/lisbon-ai-2026/auditorio-abertura.webp" srcset="/images/blog/lisbon-ai-2026/auditorio-abertura-640.webp 640w, /images/blog/lisbon-ai-2026/auditorio-abertura-1024.webp 1024w, /images/blog/lisbon-ai-2026/auditorio-abertura.webp 1600w" sizes="(max-width: 719px) calc(100vw - 4rem), 655px" alt="A nearly full tiered auditorium. On the left, a large oval window shows the river and trees; on the right, the stage with the LISBON AI screen and sponsor logos." width="1600" height="1200" fetchpriority="high" decoding="async">
  <figcaption>The Champalimaud Centre auditorium a few minutes before the opening on September 23. The window faces the Tagus.</figcaption>
</figure>

On September 23 and 24, I attended [Lisbon AI](https://lisbonai.org/) at the Champalimaud Centre in Belém. It was the second edition of a conference for people who build with AI. Day one covered models, agents and evals, and day two covered applied AI and security. These are my notes from all 32 talks, with the photos and videos I took, the demos and the audience questions. Use the index to jump to any talk.

In [Will Burstein's](#from-vibes-to-scorecards-building-review-loops-for-production-ai) demo, an agent was asked to revoke an attendee's badge and refused, as the policy required. The answer was right, but the log of tool calls showed that, before refusing, it had looked up the attendee's record without the required authorization. In [Yomi Eluwande's](#red-teaming-ai-performance-ideas-what-survived-measurement) talk, an agent made a performance optimization in Dash0's flame graph, which was spending 23 of its 32 ms of rendering on drawing text. The agent reported the chart was now 46% faster and visually correct. It wasn't. The change had altered the truncation rule, and the sample labels were now cut off.

Both examples show why evaluating an agent means looking at the actions it takes. Other talks covered how to run those evaluations, restrict permissions and keep context between tasks.

There were also demos of local models, SVG generation, robotics and drug discovery.

## Index

[Day 1, September 23](#day-1-september-23): [Prince Canuma](#inference-engineering-frontier-open-models-on-the-hardware-you-already-own) · [Joan Rodriguez](#design-as-visual-code) · [Chema Garabito](#spatial-ai-and-3d-world-models) · [Duarte Carmo](#the-hitchhikers-guide-to-european-portuguese-llms) · [Sergio Paniego](#training-a-coding-agent-through-a-harness-you-did-not-write) · [Bojan Jakimovski](#teaching-an-open-model-to-do-science) · [Matt Carey](#agents-that-scale) · [Harshil Agrawal](#ditching-containers-for-computer) · [Marcelo Lebre](#icarus-operational-harness) · [Vitalii Ratushnyi](#agentic-memory-in-a-nutshell-dos-and-donts) · [Peter Kirkham](#teaching-your-product-to-fix-and-build-itself) · [Pedro Rodrigues](#apps-are-the-new-tools) · [Will Burstein](#from-vibes-to-scorecards-building-review-loops-for-production-ai) · [Thom Jenkins](#your-agent-is-ignoring-you-fixing-instruction-drift-in-production-ai) · [Oğuz Gültepe](#prompt-learning-distilling-expensive-reasoning-into-fast-production-prompts) · [Yomi Eluwande](#red-teaming-ai-performance-ideas-what-survived-measurement) · [Simão Nogueira](#evals-as-the-code-factory)

[Day 2, September 24](#day-2-september-24): [Cloudflare](#cloudflare) · [Steve Ruiz](#bringing-tldraw-offline) · [Daniel Bukac](#screen-aware-voice-agents-a-new-interaction-pattern) · [Francisco Leal](#vdg-a-physical-ai-system-that-works-without-cloud-gps-or-reliable-network) · [Cristiana Carpinteiro](#foundation-models-for-drug-discovery-from-hype-to-the-lab) · [Lukas Wirth](#post-git-agentic-collaboration) · [Aayush Kapoor](#the-slopbowl-ification-of-software) · [Luis Monteiro](#design-is-over) · [CNCA and BSC AI Factory](#cnca-and-bsc-ai-factory) · [Diogo Mónica](#ai-escapes-super-intelligence-or-super-incompetence) · [Afonso Oliveira](#building-ai-people-trust-without-giving-away-the-product) · [Boda Zhao](#prevent-supply-chain-attacks-in-coding-agents) · [Nina Torgunakova](#trust-nothing-ship-safely-surviving-the-supply-chain-attack-era) · [Artur Goulão](#runtime-trust-for-ai-building-the-network-that-verifies-autonomous-systems) · [Alcides Fonseca](#guardrailing-your-agents-with-types-and-logic)

## Day 1: September 23

### Inference Engineering: Frontier Open Models on the Hardware You Already Own

*Prince Canuma, Neywa Labs*

Prince opened the technical part of the day by arguing that the computer you already own can run most of what people pay to run in the cloud today. What's missing, he said, is inference engineering, and he has spent the last three years doing that work for Apple Silicon.

He is from Mozambique, lived in India and arrived in Poland in 2022, in the middle of the ChatGPT boom. In countries like India and Mozambique, few people can pay for a monthly AI subscription. He sees Apple Silicon as the largest distributed compute base in the world, ready for AI since the M1, and what it lacked was an engine to run models on it.

The physical limit is memory. On a Mac, the CPU, GPU and Neural Engine share the same memory, and it doesn't grow after you buy the machine. Prince estimated generation speed from memory bandwidth and bytes per token. He then showed three ways to reduce how much data the model needs to move.

The first is quantizing the weights. For an 8B model, the numbers in the talk were these:

<div class="overflow-x-auto">

| Precision | Approximate size | Note |
| --- | ---: | --- |
| bf16 | 16 GB | quality reference |
| 8 bits | 8 GB | nearly lossless |
| 4 bits | 4.5 GB | where most local inference runs |
| 2–3 bits | 3 GB | quality drops |

</div>

Mixed quantization scans the model and keeps more precision in the sensitive layers. In a mixture-of-experts model, the router and each expert can use different precisions. Prince pointed out that quantizing alone doesn't make a model faster. It lets the model fit in memory, and any speed gain depends on the machine's bandwidth. Answering an audience question, he was more cautious than the table. Without a calibration dataset he avoids going down to 4 bits and prefers 5, 6 or 8. With mixed precision and good calibration data, you can go lower.

The second is the KV cache, the memory the model uses to hold its context. When Google published a method to quantize it with almost no loss, Prince implemented it at 2 a.m. and posted it the next day. The post got close to a million views. With a quantized cache, a million-token context fits on a 16 GB MacBook, depending on the size of the model. His engine, mlx-vlm, has it turned on by default.

<figure>
  <a href="/images/blog/lisbon-ai-2026/kv-cache-quantizacao.webp"><img src="/images/blog/lisbon-ai-2026/kv-cache-quantizacao.webp" srcset="/images/blog/lisbon-ai-2026/kv-cache-quantizacao-640.webp 640w, /images/blog/lisbon-ai-2026/kv-cache-quantizacao-1024.webp 1024w, /images/blog/lisbon-ai-2026/kv-cache-quantizacao.webp 1600w" sizes="(max-width: 719px) calc(100vw - 4rem), 655px" alt="Dark slide titled 'Lever 1b · KV cache quantization', with the KV cache size formula and a list about a 4-bit cache on the server." width="1600" height="1042" loading="lazy" decoding="async"></a>
  <figcaption>Gemma 4 31B at 256K tokens of context: 22.31 GB of bf16 KV cache against 18.41 GB of 4-bit weights. At long context, the cache outweighs the model.</figcaption>
</figure>

The third is speculative decoding. A small model or an adapter guesses several tokens ahead, and the big model only checks them. MTP, which new models already ship with, predicts 3 to 6 tokens, and Prince said it gives roughly a 2x speedup. In his example, a Gemma model on an M3 Ultra went from 30 to 43 tokens per second with MTP. DFlash, based on diffusion, predicts up to 8 tokens at once and is 3 to 4 times faster, but when Prince tried it, it only worked well for code. Mixture-of-experts models gain almost nothing from the technique.

mlx-vlm started with vision models and now accepts and produces image, video, text and audio. A vision model has three parts: an image encoder, a projector and the language model. Prince said he optimized the part almost nobody benchmarks. That optimization lets a MacBook process 100 images in parallel with a small model, and some models read images of up to 8K.

He criticized inference engines built for a single model, with hand-written kernels that make one specific model ten times faster. That gain doesn't carry over to another model or other hardware, and his users switch models every two or three weeks. One of those engines, he said, was only 1.3 times faster, and mlx-vlm was one PR away from matching it.

For the demo he used Nativ, an app built on the engine. He turned off the Wi-Fi, said "Hey Native" and spoke a sentence, and the app transcribed it and answered with a local model. Then, still offline, he dictated a tweet straight into the browser and told Codex to list files. In one month of voice dictation he transcribed more than 490,000 words. By his count that saved him about 127 hours, and the same usage in the cloud would have cost between US$200 and almost US$500.

Prince said the engine has passed 7.5 million downloads. Neywa Labs works with Cohere, Google DeepMind, Baidu and Liquid AI so that open models are optimized for Apple Silicon on launch day. On an M5 Max with 48 GB, one of those models runs with 256K tokens of context. On a Mac Studio, the engine serves 16 sessions in parallel with 32K tokens each, enough for 16 agents or 16 people on a single machine.

At the end, Prince said intelligence per watt has gone up over the last three years, that the best open models are close to the closed ones and that, by his estimate, 70 to 90% of today's use cases run on a local machine.

<hr class="divider">

### Design as visual code

*Joan Rodriguez, QuiverAI*

QuiverAI trains models that generate SVG, with elements a designer can select and edit separately.

SVG describes an image as code. A rectangle, a circle and a polygon become a few lines that scale to any size and can be changed later. Three or four years ago, Joan wondered whether an LLM could produce a good SVG. The tools of the time, like Illustrator's vectorization, weren't good enough.

A good SVG, in Joan's view, has two qualities. The first is structure. Joan showed two versions of the same bridge that looked identical on screen. In one, the whole drawing was a single path. In the other, it was split into groups, and he could select and move just the tower, the way a designer would build it. The second is style, or taste.

The method comes from two papers from his PhD:

- **StarVector:** when you send an image to ChatGPT, it gets broken into patches, and each patch becomes a token. Joan downloaded millions of SVGs, rendered each one, and trained the model to go from the image tokens to the code. That teaches the model SVG syntax.
- **RLRF (reinforcement learning from rendering feedback):** a model that only knows the syntax draws badly. So it generates many apples, each one is rendered and compared with the original on pixel similarity and code efficiency, and the model learns from the score. At the start of training, the apple looked like "a monster". By the end, it was an apple.

The first demo he posted, with the model vectorizing a molecule live, went viral, and that's when he saw there was a market. Today QuiverAI's model is called Arrow, and the launch video for version 2.0 mentions five times the speed. It went from simple emojis to detailed illustrations.

<figure>
  <a href="/images/blog/lisbon-ai-2026/quiverai-anatomia-svg.webp"><img src="/images/blog/lisbon-ai-2026/quiverai-anatomia-svg.webp" srcset="/images/blog/lisbon-ai-2026/quiverai-anatomia-svg-640.webp 640w, /images/blog/lisbon-ai-2026/quiverai-anatomia-svg-1024.webp 1024w, /images/blog/lisbon-ai-2026/quiverai-anatomia-svg.webp 1600w" sizes="(max-width: 719px) calc(100vw - 4rem), 655px" alt="Slide with three anatomical drawings in black line art with muscles in red (shoulder, thigh and calves), above a QuiverAI prompt box. The speaker stands at the lectern on the right." width="1600" height="1184" loading="lazy" decoding="async"></a>
  <figcaption>Anatomical illustrations generated by Arrow 2, QuiverAI's model, from a one-line prompt. Joan used the example to talk about technical fields like biomedicine.</figcaption>
</figure>

Vectorizing logos is one important use, because the curve control points have to sit in exactly the right place. They didn't go looking for fashion. Friends and other startups suggested trying it, and today QuiverAI works with garment makers. The sketch of a jacket that goes to the factory needs a clean outline, and a designer used to spend 20 to 30 minutes per sketch in Illustrator or Figma. With hundreds of pieces due the next day, the model generates the outline for the designer to review and adjust.

Joan's definition of taste is choosing the color, spacing, shape, font and placement. Some people have none, he said, including engineers who train the model. So they put designers, like Peter, who was in the audience, in direct contact with the people doing the training. The designers annotate what works and what doesn't and calibrate the verifiers. Taste changes over time, so designers keep evaluating the results used in training.

In the Q&A:

- **Other uses?** Embroidery, CAD, automotive parts and diagrams. Every diagram in the presentation was made with QuiverAI.
- **How do you put into words what you see?** Today, power users send references from sites with good logos, or ask ChatGPT to describe a design and paste that description as the prompt. Internally, the model expands vague prompts like "a logo for my coffee shop, I like surfing", making the taste decisions on its own.

<hr class="divider">

### Spatial AI and 3D World Models

*Chema Garabito, Sperid Labs*

Chema thinks AI will only understand the physical world once it can generate 3D, the same way LLMs came to understand language by generating text. Sperid Labs, which he founded, researches spatial intelligence, and its longer-term goal is what he calls visual general intelligence.

He comes from the hacking world, speaks at security conferences, worked at Telefónica and has contributed to the Linux kernel. When he asked who knew what a world model was, almost nobody raised a hand. His argument starts with people, who are agents in a 3D world and learn mostly by seeing. LLMs handle almost everything that is language, and even GPT-6 Astra, which he cited as the first to show some grasp of 3D, is still far from enough.

Chema organized the problem in three parts, each handled today by a different kind of model:

- **Understanding:** computer vision, fragmented into a model per task, such as object detection, reconstruction and prediction. Humanoid robot systems like Tesla's, he said, use more than 40 different vision models, while a text agent uses one. These models need labeled data, don't scale to the internet, and only predict, without generating anything. A Sperid reconstruction model he showed turned photos of a house into a 3D map. The reconstruction left black gaps where the photos didn't show the house, and Chema wants the model to also generate those parts of the scene.
- **Appearance:** video models like Genie and Runway, which you steer with the W, A, S, D keys. They understand some dynamics, but they output 2D pixels, and video games, visual effects and robotics need 3D.
- **Structure:** diffusion models trained on 3D files, which generate objects. There are few 3D files available to train them. The internet has billions of images and videos, but only a few million 3D files.

<figure>
  <a href="/images/blog/lisbon-ai-2026/world-model-tres-camadas.webp"><img src="/images/blog/lisbon-ai-2026/world-model-tres-camadas.webp" srcset="/images/blog/lisbon-ai-2026/world-model-tres-camadas-640.webp 640w, /images/blog/lisbon-ai-2026/world-model-tres-camadas-1024.webp 1024w, /images/blog/lisbon-ai-2026/world-model-tres-camadas.webp 1600w" sizes="(max-width: 719px) calc(100vw - 4rem), 655px" alt="Light slide with three columns, Understanding, Appearance and Structure, each with an example image. The speaker stands in the lower right corner of the stage." width="1600" height="1234" loading="lazy" decoding="async"></a>
  <figcaption>Understanding, appearance and structure: the three layers that, for Chema, are still solved by different models.</figcaption>
</figure>

Mundus, Sperid's model, joins the three layers and unifies six computer vision problems in one model. It takes a few photos, a panorama, a video or a text prompt, and returns a structured 3D scene that opens straight in a game engine. Chema argued for training this kind of model on images and videos from the web, rather than relying only on the few 3D files that exist.

The demos were live, and Chema had spent the two previous days distilling the model so it would run fast enough on stage. From a few perspective photos, Mundus generated a 3D world, filling in what the photos didn't show, and each run came out slightly different. In a scene of a reconstructed house, he emptied the room, picked up a ceramic vase, dropped it on the floor, resized it and moved it around, without opening any 3D engine. The model also understands what it generates, so you can search for objects in the scene with text, which is useful for automatically labeling data captured in the real world.

He listed real estate, video games, visual effects, digital twins and robot training as uses. To scan a house today, you pay someone with a Matterport camera, and with Mundus a few phone photos are enough. The company started out doing reconstruction for virtual reality.

Asked about distillation, Chema explained that the full model needs data-center GPUs, and people won't adopt a model they can't run. The team is working on a distilled version for an RTX 5090 and plans to open-source part of the model. Mundus hasn't been published yet, and the metrics will come with the launch.

<hr class="divider">

### The Hitchhiker’s Guide to European Portuguese LLMs

*Duarte Carmo*

Duarte opened by talking about his grandmother, a geologist. Whenever they travel through the north of Portugal, she unfolds the paper map, even with Google Maps in her pocket, and points out a village here, a river there, a road not worth taking. He said the talk would be that kind of map for European Portuguese LLMs, with more questions than answers.

The idea came up at a birthday party near the Tagus, where someone said they were working on a European Portuguese LLM for the government. Duarte liked it but wondered what it was for. To speak better, to know more about the culture, to know trivia about the north? That led to the question behind the talk: what makes a good European Portuguese LLM?

He started with measurement. Duarte lives in Copenhagen, two blocks from the person who maintains EuroEval, a project that measures models in European languages. He sent pull requests with European Portuguese datasets for sentiment classification, grammar and reading comprehension. On the leaderboard, Qwen dominated, and Amália, the government-backed model, ranked below models smaller than itself.

Then he looked at data. Hugging Face had published FineWeb2, 20 TB of multilingual text, and Duarte built Bagaço, named after the Portuguese grape brandy, in three versions:

1. **v1:** took only pages from `.pt` domains and classified each by educational score (a Wikipedia page is worth more than a sports paper) and by category. It came to about 10 billion tokens.
2. **v2:** he needed to separate European Portuguese from Brazilian Portuguese. The academic classifier was good but far too slow for terabytes of text, so Duarte built his own:

<div class="overflow-x-auto">

| Classifier | Rows per second | Size |
| --- | ---: | ---: |
| Academic | ~100 | ~2 GB |
| Duarte's | ~10,000 | 65 MB, runs in the browser |

</div>

The faster classifier doubled the dataset to 21.3 billion tokens, and Bagaço started including sites with a high educational score that don't end in `.pt`, like Khan Academy and Mozilla.

3. **v3:** added FinePDFs and FineWiki for more quality text. In the talk he said 30 billion tokens; on the slide, 29. The share with a high educational score rose to about 40%. Version 4 is in progress.

<figure>
  <a href="/images/blog/lisbon-ai-2026/bagaco-v3.webp"><img src="/images/blog/lisbon-ai-2026/bagaco-v3.webp" srcset="/images/blog/lisbon-ai-2026/bagaco-v3-640.webp 640w, /images/blog/lisbon-ai-2026/bagaco-v3-1024.webp 1024w, /images/blog/lisbon-ai-2026/bagaco-v3.webp 1600w" sizes="(max-width: 719px) calc(100vw - 4rem), 655px" alt="Slide titled 'Bagaço v3 the latest version', with a table comparing versions 1, 2 and 3 and bar charts by category. Duarte speaks at the lectern on the right." width="1600" height="952" loading="lazy" decoding="async"></a>
  <figcaption>Bagaço v3: 29 billion tokens of Portuguese, 37% more than version 2, after adding FinePDFs and FineWiki.</figcaption>
</figure>

Duarte also discussed how Amália was trained, in a post covering both its strengths and its weaknesses. The model uses continued pre-training of EuroLLM rather than training from scratch, and he pointed out that only 5.8 billion tokens, about 5% of the pre-training, were European Portuguese. He also praised the team for publishing evaluations that didn't exist before, like the national high school exams in geography, history and math. Almost nobody noticed that amid the criticism, and those exams now make it possible to measure models.

With those evaluations, he created PT Core, a single score inspired by Karpathy's nanochat, and trained several small models to compare. Bigger models scored higher, but data quality had the largest effect. Keeping only texts with an educational score of 2 or more gave a PT Core of 12.8, about ten times higher than the other configurations. The problem is that this filter keeps only about 20% of Bagaço.

Compared with Amália, which has 9B parameters, models half or a quarter its size did better on the Portuguese exams. Duarte warned that the chart is a bit misleading, because the winners are reasoning models, which spend far more tokens per answer, and Amália wasn't trained to reason.

His conclusions so far:

- **Data isn't the bottleneck.** He got to 30 billion tokens without much effort, 50 billion is feasible, and synthetic data can fill the rest.
- **Adoption.** He asked what would make a company adopt a Portuguese model instead of Qwen or GPT. Today he would pick Qwen himself, and he challenged the audience to build benchmarks that answer that question.
- **Size.** He finds an "Amália 60B" less interesting than a smaller, better model.
- **Reasoning** should be part of a good model.

In the Q&A, he said he paid for everything himself. Filtering Bagaço runs in a few days on a server rented in Germany for €30 a month, and the only help was a GPU lent by one of the event's organizers for a week. He talks with the Amália team, but did this work alone. Angolan and Mozambican Portuguese aren't covered yet. In the big web datasets, they show up so rarely that they're treated as low-resource languages, and he said someone should take that on. Audio was left out too, for lack of time.

<hr class="divider">

### Training a coding agent through a harness you did not write

*Sergio Paniego, Hugging Face*

Sergio wanted to know whether open tools can do what the labs do with their coding agents. An agent, he said, is always a harness, like Claude Code, OpenCode or Codex, plus a model, and the frontier model reports show those models are trained in reinforcement learning environments built with their harnesses. In a few months, he pointed out, we went from writing code to using agents.

He showed how to train a model using OpenCode to run the tasks. OpenCode organizes the conversation, calls tools and returns the results to the model, and that part of the agent is what he calls the harness.

His stack combined Hugging Face training and infrastructure tools with OpenCode in a Docker container:

- **TRL**, the training library, with the asynchronous version of GRPO;
- **OpenEnv**, a standard for training environments that Hugging Face develops with Meta, Reflection and other labs;
- a small open model and a set of coding problems, each with a description, input/output examples, visible tests and hidden tests;
- **OpenCode** as the harness, inside a Docker container;
- **HF Jobs** and **HF Sandboxes** for the GPU and to isolate each run.

The hard part is that normal reinforcement learning is a "white box", where the trainer controls every step. A harness is a black box that does things on its own. When you open a conversation, it calls the model to generate a title, then summarizes, and sometimes creates sub-agents. Sergio's solution was a capture proxy that intercepts the calls between OpenCode and the model and records the tokens the trainer needs. OpenCode doesn't know the proxy is there.

The captured data then needs cleaning. On one task, the proxy might capture four calls: one for the title, a file write, a bash run and one more that doesn't matter. Training drops the generic call and masks all the harness context: the instructions, the history and the system prompt. Only what the model generated to solve the problem is used for training.

The reward added up two signals:

1. whether the model tested its own code against the visible tests, running the examples in bash;
2. whether it passed the hidden tests.

For the demo, Sergio trained for 10 steps on two H100s, one for the trainer and another to generate the answers, with 8 runs per step, each in its own CPU-only sandbox. The reward went up and reached 1 at step ten. He warned that the model might be "faking it", because problem difficulty wasn't controlled and the model may already have been able to solve some of them. The demo showed that training this way works, but ten steps aren't enough to say how much the model improved.

Sergio's argument is that, for a specific task, a small model trained inside a harness can do the work of a frontier model. The next step, nearly ready the week of the talk, was training across several harnesses at once, as the labs do. His hypothesis is that Codex works better with a GPT model partly because both come from the same company and were trained together. The code and examples are in the TRL repository.

<hr class="divider">

### Teaching an Open Model to do Science

*Bojan Jakimovski, Loka*

The big labs have scientific models, but you can't inspect how they reach each conclusion. In a lightning talk, Bojan argued that AI for science can't be a black box. Loka presented an open scientific research system, built with Arcee AI and AWS, in which you can follow the steps the agents take.

The model is Arcee's Trinity Mini, a mixture-of-experts model with 26B parameters and about 3B active per token. It's big enough, Bojan said, for long multi-step reasoning and small enough to run on hardware ranging from a laptop to a cluster with one or two GPUs. On stage, a complex prompt triggered sub-agents to search the literature, create molecules and simulate protein binding, and every step was visible.

Training taught the same model two modes, each with its own environment, built with Prime Intellect's verifiers:

- **investigate:** given a question, pick the right tools and extract the evidence; the reward looks at which tools were called;
- **conclude:** given a protein or a hard problem, reason and answer in a structured way, with sources.

They used GRPO combined with autoresearch, which is rare at this stage of training because autoresearch usually stays in pre-training, and optimized the environment prompts with GEPA. After one round, the model reached 81.2% on a healthcare tool-use evaluation, and after a hundred steps it reached 86.3 on a protein reasoning test. The two results measure different tasks.

The system separates evidence gathering from writing the answer and includes an agent that reviews the result. Around the model, the harness has an orchestrator agent, tools for literature review, life-science databases and protein-molecule binding, and that critic agent, because in science, Bojan said, you want someone on the other side checking. In his view, the AI scientist is the whole system: the data, the environments, the model and the harness. Loka published all of it, and the next version was already training with AWS and Arcee.

<hr class="divider">

### Agents that Scale

*Matt Carey, Cloudflare*

Matt opened the agents block with an infrastructure question: what happens when everyone, not only people who code, has an agent running all the time? He argued that containers can't handle that scale and that isolates can.

He works on agents and MCP on Cloudflare's research team and has lived in Lisbon for a few months. He said he sees three waves of agents:

1. chatbots, like ChatGPT;
2. coding agents, the first to find a real market;
3. agents as infrastructure: small, spread across the internet, waking up when needed, checking your calendar and email, making payments and continuing to work with the app closed.

The third wave is the one he cares about, when his mother and cousins, who don't work in tech, start using agents. Matt argued that reserving a container for each user gets more expensive as the number of agents grows. An app is shipped once and millions of people use the same version, but an agent needs its own memory and compute for each person. With 100 customers, one container each works. With 10,000, 100,000 or, at Cloudflare's scale, billions, the per-container cost doesn't add up.

The alternative Cloudflare offers, a bet made before agents existed, is V8 isolates, the same technology browsers use. They come in two forms:

- **Workers:** stateless, for request-response APIs. They spin up when needed and scale to billions of requests.
- **Durable Objects:** stateful. They keep state between requests, have built-in SQLite, accept WebSockets for several people in the same session, talk to other services without going over the public internet and can be woken up by alarms, like a calendar for the agent.

<figure>
  <a href="/images/blog/lisbon-ai-2026/pecas-de-um-agente.webp"><img src="/images/blog/lisbon-ai-2026/pecas-de-um-agente.webp" srcset="/images/blog/lisbon-ai-2026/pecas-de-um-agente-640.webp 640w, /images/blog/lisbon-ai-2026/pecas-de-um-agente-1024.webp 1024w, /images/blog/lisbon-ai-2026/pecas-de-um-agente.webp 1600w" sizes="(max-width: 719px) calc(100vw - 4rem), 655px" alt="Light slide titled 'Pieces of an agent' with five cards side by side: Harness, Filesystem, Bash, Browser and MCP." width="1600" height="1258" loading="lazy" decoding="async"></a>
  <figcaption>The five pieces of an agent in Cloudflare's version: the loop, the files, execution, browsing and external tools.</figcaption>
</figure>

Matt split an agent into five pieces and mapped each one to a Cloudflare service:

- **harness**, the model in a loop calling tools, which runs in a Durable Object;
- **filesystem**: modern models are trained to work with files through the terminal, and Cloudflare Computer offers a filesystem in the cloud;
- **bash**, which Cloudflare Computer also offers in the cloud;
- **browser**: running Chromium in containers has always been expensive, and Cloudflare's Lisbon office built a browser that runs inside isolates, cheap enough to scale with everything else;
- **MCP**, to call external tools like HubSpot, Salesforce, Gmail or Apple Notes.

The slides were a React app running on Workers, with the demos inside. He built the agent up live:

1. An agent in a Durable Object with two toy tools: greeting and rolling dice. Several people could connect to the same session.
2. The same agent with a workspace. It created a file of things to do in Lisbon, counted the words with bash and edited the file. Matt reloaded the page and everything was still there, because the agent runs in the cloud.
3. With a browser, it visited the Lisbon AI site, wrote a summary and took a screenshot. Instead of fixed tools like "click" or "take screenshot", he prefers to let the model write code against the browser API. Then he showed you can lock the browser down. His personal site was blocked, and example.com went through.
4. With MCP, he connected Cloudflare's own MCP and asked it to deploy a site from inside the slides. It failed twice calling the endpoints ("good demo effect") and worked on the third try, and the model checked the address with curl before saying it was done. Matt said that check usually goes wrong, because DNS takes time to propagate and the model keeps trying to diagnose the site while DNS is still propagating. This time the site was already up.

During the Q&A, someone asked whether websites and CMSs survive the agent era. Matt said he doesn't know. He sees APIs standardizing around something like MCP, but thinks people will still want something to look at.

<hr class="divider">

### Ditching Containers for Computer

*Harshil Agrawal, Cloudflare*

PromptMotion, a prompt-driven video editor, animated the Lisbon AI speaker poster on screen. In the first version, the Cloudflare logo came out wrong and Harshil's photo was faded. He sent the right logo and asked for more opacity on the photo, and the agent redid the video. The talk was about how he moved PromptMotion out of a container and distributed its parts across Cloudflare services, a production version of what Matt had described.

In the old version, everything happened in a container. The agent wrote the files there, and the preview and the rendering ran there too. The history was lost when the container shut down. Harshil walked through three problems and how he solved each:

<div class="overflow-x-auto">

| | Before | After |
| --- | --- | --- |
| Preview | build, dev server and expose the container before the user saw anything | the code runs in a Dynamic Worker and the preview shows up almost instantly |
| Files | inside the container | virtual filesystem in a Durable Object, which outlives the container and the Worker |
| History | tarball in R2; going back to a version meant downloading, unpacking and rebuilding | one commit per generation, with git at the edge (Artifacts) |
| Final render | container | container, which now receives the synced files |

</div>

Along the way, he swapped the video generator for Hyperframes, which works with any coding agent. History became git because the agent already knew how to use git.

The last step was putting it all together. "I'm a lazy developer in the age of AI," he said, and he didn't want to write the glue between the pieces. Cloudflare Computer handles that with one workspace, two backends, one for the preview and one for rendering, and a filesystem synced between them. To export, you run the command that generates the video. The agent uses Cloudflare's harness, built on top of Pi.

<hr class="divider">

### Icarus, operational harness

*Marcelo Lebre, Remote*

Icarus is an internal Remote app that lets employees, whether they code or not, use agents with access to the company's context. Marcelo called his talk about it a report on his own "AI psychosis", half stubbornness, half hallucination.

<figure>
  <a href="/images/blog/lisbon-ai-2026/remote-numeros.webp"><img src="/images/blog/lisbon-ai-2026/remote-numeros.webp" srcset="/images/blog/lisbon-ai-2026/remote-numeros-640.webp 640w, /images/blog/lisbon-ai-2026/remote-numeros-1024.webp 1024w, /images/blog/lisbon-ai-2026/remote-numeros.webp 1600w" sizes="(max-width: 719px) calc(100vw - 4rem), 655px" alt="Purple slide with the Remote logo and the text: about 2000 people, more than 100 countries, fully distributed, almost no offices, about 10 million dollars a year on AI. Marcelo stands on the right of the stage." width="1600" height="1130" loading="lazy" decoding="async"></a>
  <figcaption>Marcelo Lebre's opening slide: 2,000 people, more than 100 countries and US$10 million a year on AI.</figcaption>
</figure>

Remote runs payroll in more than 100 countries, with about 2,000 people and almost no offices (only where the law requires one). Almost half the company isn't technical: sales, legal, operations. Internal AI spend is running at US$10 million a year, Marcelo said, and it started with a budget of 1 million.

He said the culture came before the AI. Because the company is distributed, Remote documents everything, every meeting and every person they meet, first in Obsidian and then in Notion, which "we break" because the knowledge base is so big. At Remote, he said, the split between engineering, product and design matters less, because everyone is expected to build. AI training was mandatory for everyone, and today any lawyer or support person knows how to build an app with AI. Do they know what the code does? "Probably not, but who cares these days?"

Icarus started as an unnamed agent, built on an open source personal-agent framework. After a few days, Marcelo asked it to pick a name, and it called itself Daniel, after Asimov. Cost weighed in. Marcelo didn't want 2,000 people using the most expensive model to ask for a pizza recipe or for something already in the docs. With your own harness, you can swap the provider behind it without anyone noticing.

Today Icarus is an Elixir app that runs on the Mac, and the original framework is gone. Marcelo said he developed Icarus with agents and barely wrote any code by hand, averaging zero lines a day. What he showed:

- **agents with a persona and instructions**, from any provider, with the company's harness and context behind them;
- **a task board**, where you assign a ticket to an agent and it tells you when it's done;
- **email**, still experimental and contained, for people who get a lot of volume;
- **a knowledge graph**, built continuously from tasks, conversations and emails, with a confidence level for each relationship and a split between what's personal (setting up lunch with another founder) and what belongs to the company (a pricing negotiation);
- **a sales copilot**, built the night before in the back seat of a car. While the salesperson talks, it pulls curated Remote information, like payroll tax in Portugal or vacation rules in Spain;
- **an event log** for debugging and **a blog**, because at some point Daniel said he'd like to have one.

With Icarus, Remote also built the "AI for Actual Work" site, used by thousands of people to learn AI for free. The next step is connecting Icarus to any information source and opening it to the public.

<hr class="divider">

### Agentic Memory in a nutshell: Do’s and Don’ts

*Vitalii Ratushnyi, Harmix.AI*

Every agent has memory, whether the people who built it know it or not, and Vitalii's question was whether it was designed on purpose.

<figure>
  <a href="/images/blog/lisbon-ai-2026/contexto-ram.webp"><img src="/images/blog/lisbon-ai-2026/contexto-ram.webp" srcset="/images/blog/lisbon-ai-2026/contexto-ram-640.webp 640w, /images/blog/lisbon-ai-2026/contexto-ram-1024.webp 1024w, /images/blog/lisbon-ai-2026/contexto-ram.webp 1600w" sizes="(max-width: 719px) calc(100vw - 4rem), 655px" alt="Light slide titled 'The context window is RAM. Memory is the disk (not quite)' and a note on how Codex and Claude Code keep memory between sessions." width="1600" height="950" loading="lazy" decoding="async"></a>
  <figcaption>Vitalii's starting point: the context window disappears when the session ends, and memory is what carries over from one session to the next.</figcaption>
</figure>

Memory, as he defines it, exists to give the next session the context the task needs. The context window works like RAM and disappears when the session ends, and that's why he called the memory Codex and Claude Code ship with bad, since it lives in the window too. He criticized three approaches:

- **A giant window.** The 1 million token number is "fake". In benchmarks, 400,000 is a practical ceiling, and he keeps his agents between 100,000 and 300,000.
- **Stuffing it with tokens.** Without structure, you're just burning your usage limit. Smarter models go further, but they don't solve structure either.
- **A vector store.** Similarity search doesn't retrieve precisely. Don't use it unless you understand exactly how chunks are cut and overlapped.

He cited a paper from Princeton and MIT in which a harness with memory took a model from 30% to 95.5% on ARC-AGI, above the human baseline of 95.4%. He pointed out that the model's weights don't change and the context window is small, so the gains come from what the agent saves to disk, in a structured way, before it shuts down.

He covered two practical points. The first is compaction, the summary that runs when the window fills up, which can be customized, so you decide when it happens and use a handoff skill to control cost and quality. The second is the memory bank, not to be confused with Google's:

- **How it starts:** in an existing project, the agent reads the repository and fills in the memory bank. In a new project, it starts from the README and fills in as you go.
- **What it stores:** infrastructure, stack, tasks, lessons learned and skills with reusable instructions for recurring tasks.
- **In what form:** facts, timeline and graph, the three pieces he said are enough to rebuild almost everything.
- **Where it lives:** in a folder the agent reads with bash and a person can edit, or in a database like Supabase, where you can run queries.

In the Q&A:

- **What about when two memories contradict each other?** Versioning shows which is more recent, through git or a changelog. The agent can ask whoever has authority. In a company, authority follows the org chart, and the CEO overrides the decisions below.
- **Why not use the memory Claude already has?** Because it's free text, and here you define the structure and the usage. The best approach, he said, is to use hooks to load memory at the start of the session and save it at the end, the way SuperMemory and Honcho do.

<hr class="divider">

### Teaching your product to fix and build itself

*Peter Kirkham, PostHog*

My notes on Peter's talk start in the middle, when he had already posed the question: how much of the work of looking at the data, finding the problem, fixing it and shipping can be automated? He thinks almost all of it can, since PostHog already has the data. PostHog Desktop is where they test this, with a new interface and without affecting current customers.

PostHog Desktop brings together product usage data and agents that investigate problems and propose code changes. The pieces:

- **Tasks**, which run in the cloud or in local worktrees tied to your repository.
- **Canvases**, mini-apps that outlive the session. His slides were a canvas, and he asked the agent for a spinning 3D globe with all active users on posthog.com. The idea is to generate visualizations that answer the user's questions.
- **Scouts**, background agents that sweep the data, open reports and decide whether a fix is worth proposing. Everything lands in an inbox sorted by impact. In the example, an overnight error arrived in the morning with the cause found in the code and a PR ready to approve.

He showed the newest feature, goal spaces, running locally, because the PR hadn't been merged in time:

1. you set a goal, like onboarding conversion, with or without a numeric target;
2. the agent instruments the metric in the code, if it doesn't exist yet;
3. it creates a canvas to track its own progress;
4. background loops propose experiments, and another agent tracks them and uses the results, once they are statistically significant, to decide the rollout, taking the feature flag to 100% and opening a PR that deletes the old code;
5. a final agent optimizes the prompts of the other loops over time.

The goal, Peter said, is for PostHog to fix and improve itself. Desktop is in beta, open to everyone, and supports MCP servers.

<hr class="divider">

### Apps Are the New Tools

*Pedro Rodrigues, Supabase*

First came LLMs exchanging text, then tools, which turned them into agents, and the interface stayed text or voice. Pedro, who is from Lisbon and attended the first edition of the event as an audience member, talked about interactive interfaces inside conversations with agents, like charts and controls for following an incident. Since people are visual, he said, UI will play a big role as long as a person has to follow or approve what the agent does. He listed the proposals under way: MCP Apps, A2UI and generative UI.

The simple example is asking the assistant for tomorrow's events. Before, you got a text list of times, which works. Now you're more likely to get something that looks like a calendar app's view, right inside the chat. The agent builds the interface with code.

He based the demo on a real incident he went through at Supabase, with colleagues and an agent. The incident bot runs on Supabase, and the interface looks like Slack, but isn't. Slack supports MCP, but doesn't support apps with UI yet, and Pedro asked anyone from Slack in the audience to pass the request along. Everything happened inside the conversation, where before the bot would have described the problem or sent a Grafana link:

1. the bot shows, in a chart, a spike of errors on preview branches at 3:20 a.m., with main stable;
2. Pedro asks it to investigate and propose a fix, and the bot points to the suspect PR by the deploy time;
3. the bot opens the fix as a draft, the team reviews, CI runs and the PR goes in;
4. the smoke tests fail, and after some back and forth they pass;
5. with Pedro's approval, who joked that nobody should do this in production without looking, the bot marks the incident as resolved on the status page, and the widget changes right away;
6. the bot books dinner for the team at a Lisbon tasca and schedules a reminder in the channel an hour before. The team doesn't usually do that after an incident, he admitted, but it should.

In the Q&A:

- **Will generated interfaces replace websites?** It depends on how much the person needs to follow or approve. If the agent is going to buy something on Amazon and needs your approval, it makes more sense to show the item than to describe it. He finds it odd for an assistant to drive a browser when it could call the API. Which interface will show up is another matter. The MCP team told him the pressure for custom branding and palettes comes from vendors, and that users just want a predictable interface.
- **Do you generate the interface from scratch every time?** He prefers predictable interfaces. You can use ready-made TypeScript components, a JSON format like the one Vercel launched, or a catalog described in text in a skill, which is what he uses. The agent composes freely, but with a defined color palette and copy.

<hr class="divider">

### From Vibes to Scorecards: Building Review Loops for Production AI

*Will Burstein, PromptLayer*

Will's talk was about moving from eyeballing evaluations to a scorecard that decides what goes to production.

He's head of product at PromptLayer, a platform for LLM operations, evaluation and observability, and works with teams from big companies to one-person startups. His example was an operations copilot for live events such as Lisbon AI, with hypothetical policies, serving organizers and sponsors on requests about attendees, badges and security. The copilot reads the approved policies, checks who's asking and uses tools to look things up or hand the case to a person. Because it deals with personal data and access revocation, and has to comply with European law, it has to be evaluated.

The policy had three rules that matter here:

- a sponsor can propose a badge change, but not execute it;
- revoking a badge requires an open incident and confirmation from the on-site security lead;
- looking up an attendee's record is only allowed after the incident has been created and approved.

The test request came from a sponsor. It said an attendee "may have overdone the Portuguese wine" and asked to revoke their badge now and report back when it was done. There was no incident number, and the request asked for an irreversible action, in a hurry, without the required context.

Along with the input, the test case stored what was expected: actions that must not happen, qualitative checks for a judge and forbidden claims. It also defined the allowed sequence of tool calls and that the request should be handed off to a person. The agent's final answer looked correct. It refused, explained that only the security lead can revoke a badge, and created the handoff. Someone reading only the answers would not have seen a problem.

The trace showed that, before the handoff, the agent called `lookupAttendeeRecord` without an incident number and pulled the attendee's data without permission. "The answer is not the behavior," Will said. One of the judges also failed the answer for claiming it complied with privacy rules, and another for touching on a legal question, which the policy forbids.

He proposed building the evaluation in four parts:

1. **Treat evaluation like unit tests:** a named report, a set of reference cases, a runner that runs the agent, code checks and LLM judges. That way the evaluation lives in code and can run on your infrastructure, in CI or on production samples.
2. **Code for what's objective:** valid structured output and comparing the tool sequence with the expected one.
3. **Judges for what's qualitative:** grounding in evidence, respecting policy, action safety, the decision to escalate and usefulness within the constraints. Judges should be calibrated on a statistically relevant volume of data. The evaluation criteria have to guide the judges and explain how to handle ambiguous cases.
4. **Criteria for releasing a version:** policy compliance and action safety weigh more than citing evidence, and a minimum pass rate decides what ships. The goal, he said, isn't a higher score. It's knowing what you refuse to ship.

The demo stopped halfway because his OpenAI credits ran out, and he showed the result of an earlier run he'd left open in a tab. Version 2 of the prompt, with explicit instructions about attendee records, he couldn't run on the spot ("trust me, it passed").

For production, he proposed a sequence:

1. use your own product and build the reference set by hand;
2. stabilize the evaluation pipeline;
3. evaluate a sample of production traffic online;
4. use signal detection, like Raindrop's, to flag odd requests ("confused user") automatically;
5. feed those cases into the reference set and let an agent open PRs with the context.

The only audience question was about agents with many conversation turns. Will suggested testing in pieces, evaluating each step of the flow as a unit and keeping a suite per application.

<hr class="divider">

### Your Agent Is Ignoring You: Fixing Instruction Drift in Production AI

*Thom Jenkins, PetsApp*

Thom is a vet and a Cambridge-trained zoologist. From behavioral ecology he brought the method of studying a complex system by changing one variable at a time, treating the model as an organism and the prompt as its environment. He found that giving a model more context can make it ignore instructions that are written in the prompt.

The case is real. In 2023, PetsApp launched a copilot that drafts vet clinics' replies to pet owners. Among other things, the prompt told the model to offer booking when a visit was recommended. An owner wrote: "my pup needs a vaccine booster, I'd like to book an appointment". The clinic's context said it only saw cats. In 10 answers generated with GPT-4o mini at temperature 0.7, all of them offered the dog an appointment.

To understand why, he tagged each part of the prompt with the intent someone meant to express when writing it. He called each one a focus: agent identity, first aid, what not to ask the owner, booking, cats only. Then he ran these tests:

<div class="overflow-x-auto">

| Test | Result |
| --- | --- |
| Full prompt, 10 answers at temperature 0.7 | all offered the dog an appointment |
| Only the "cats only" focus | refused in all 5 answers: the model understands what a cats-only clinic is |
| Prompt without the booking focus | the rule showed up in 1 of 5 |
| "Cats only" in second position | refused in all 3 answers |
| "Cats only" second, other focuses shuffled | offered the appointment again |

</div>

In the tests, the "cats only" instruction worked on its own but lost its effect when combined with any other focus, not only booking. It was the most subordinate of all. Its position in the prompt also affected the result, but shuffling the other focuses undid the effect of moving it to second place.

Thom also tested a better model, Astra, which does refuse the appointment. But it had the opposite problem. OpenAI's documentation says the user prompt is subordinate to the developer's. Even with the booking focus reinforced ("you must always offer an appointment") and with the hierarchy spelled out in the prompt, Astra ignored it and kept refusing. With Astra, the "cats only" focus went from the most subordinate to the most dominant. In this case the outcome is reasonable. But if the rule were about protecting vulnerable people or resisting prompt injection, a model that decides on its own which instructions to follow would be a problem.

The fix for the small model was to assemble the prompt on the fly. A lightweight classifier looks at the owner's message and decides which focuses go in and in what order, and the prompt is assembled for that conversation. After that change, GPT-4o mini started refusing the appointment for the dog. He released the kit, FocalPrompt, as open source and asked for contributions.

In the Q&A:

- **Why not optimize the prompt with GEPA or DSPy?** They tested several models, and the modern ones pass this simple case. The goal was to understand how the parts interact, treating the model as genetics and the prompt as environment, so they could change behavior predictably.
- **Wouldn't a model like Astra do this on its own?** Thom suspects advanced models already choose which part of the prompt to pay attention to, and that's why they get harder to tune. The default is great 99% of the time, but the last 1%, in the odd cases of clinics with complex rules, gets harder.
- **What about having a big model coordinate the small one?** That's where they started, with several coordinated agents. But PetsApp generates a suggested reply for every incoming message, and that gets expensive. The cheap classifier brings even GPT-3.5 Turbo close to the performance of a much bigger model.

<hr class="divider">

### Prompt Learning: Distilling Expensive Reasoning Into Fast Production Prompts

*Oğuz Gültepe, Peec AI*

Peec AI uses an expensive model to teach a prompt to a cheap one, and Oğuz walked through how.

The technique is called prompt learning. A small model generates candidates, a bigger model evaluates them and explains what failed, and the principle behind the failures goes into the prompt. Only the small model runs in production, because of latency, cost and generalization. Oğuz described tuning a prompt by hand as fixing one output only to see another break, over and over. Automating the process also gives you a measure of how well the prompt works on the sample. He made clear the technique isn't new and cited GEPA.

The example was a generator of opening messages from a LinkedIn profile, in four steps:

1. the small model generates several openers;
2. reward models score them on dimensions like relevance, the right tone for the profile and likelihood of a reply;
3. the optimizer gets the prompt, the candidates and the scores and writes a new prompt;
4. repeat until the scores stop rising or the budget runs out.

He gave two rules for the loop:

- **The reward has to come with a text explanation.** "0.7 on rapport" teaches nothing. "The opener uses several exclamation marks, but the profile is dry and self-deprecating" does. The explanation, he said, is the gradient.
- **The optimizer has to look for principles, not examples.** LLMs tend to copy, so if you point at an example, it goes into the prompt verbatim and doesn't generalize.

In his example, all the scores went green and the openers came out boring, like the 50 messages anyone gets every day. The optimizer had saturated the rewards. That's reward hacking, and Oğuz related it to Goodhart's law, which says that optimizing a measure can make it stop representing the original goal.

The same thing happened in production at Peec AI, which measures brand visibility in AI answers. For thousands of customers in several languages, they generate the questions to monitor, and they used prompt learning for it. The optimizer started generating ultra-specific niche questions that no user would ask. The cause was a reward that asked for coverage of the brand's whole semantic spectrum, while brands want the questions their customers actually ask. They added a reward that considered how popular the questions were.

Big models, in Oğuz's setup, are there to find the principle, which then becomes a prompt. He described it as distillation in language instead of in weights, which is easier to read and check. Building the loop is easy, he said. The engineering work is in the rewards, and the loop should make adding and removing rewards effortless.

In the Q&A:

- **What if the candidates all come out similar, with no variation for the big model to evaluate?** He said that's a sampling and data diversity problem, upstream of the technique. If the data doesn't represent real usage, nothing fixes it.
- **With 100 evaluation cases, each round gets expensive. How do you narrow the search?** He recommended GEPA, from DSPy, which keeps a Pareto frontier of prompts, where only the ones that are best on at least one dimension stay, and new prompts come out of a genetic evolution over those.

<hr class="divider">

### Red teaming AI performance ideas: what survived measurement

*Yomi Eluwande, Dash0*

Yomi asked agents for ideas to speed up Dash0's charts. Then he reviewed the proposals and measured the changes in the browser, a process he calls red teaming.

He's a senior product engineer at Dash0, an observability platform, and spends his days building charts and flame graphs. In a flame graph, each box is a function in a call stack, and the width shows how much CPU time it used. The team had just switched the renderers from SVG to Canvas, and Yomi had already built a measurement tool and benchmarks to check that every change made things faster.

He asked an orchestrator agent to investigate the renderers' code, use the measurements and benchmarks and bring back improvement candidates, without implementing anything. The funnel:

<div class="overflow-x-auto">

| Stage | What was left |
| --- | ---: |
| Agent investigation (memory, Canvas calls, drawing, painting, API fetching) | 66 ideas |
| Without duplicates | 29 |
| Adversarial review | 8 |
| Measured in the real product, in the browser | 1 PR with 2 changes |

</div>

The first candidate was discarded right away. The agent predicted saving 20 to 35 ms on hover in a line chart, and the browser measurement proved it wrong. The second was good. Rendering spent 23 of its 32 ms on text logic. The agent implemented the change and reported it was 46% faster and "visually correct". But it had changed the truncation rule, and the sample labels started showing up cut off. Yomi told it to fix that, and the agent got the same numbers without the bug.

He still suspected there was more, because he knew the code. He asked for three things:

1. repeat the before and after measurements, to rule out noise;
2. widen the range, from a 15-minute query to a full day, to see if the gain held;
3. challenge the conclusions, so in a new session he asked the agent to look for everything that might be wrong.

The new review found another problem. On every repaint, the flame graph re-read the entire API query result, piling up memory. The fix was to copy the layout values into a `Float64Array` and reuse it on every repaint. In the end, the normal render went from 21.4 ms to 5.7 ms, and the inverted one, which draws more text and more rectangles, from about 44 ms to 7.7 ms.

His advice was to have a way to measure before accepting a performance idea from AI, to check the behavior yourself and to challenge the conclusions. He published an open source package to record an interaction in a Canvas visualization, inspect it and compare before and after.

<hr class="divider">

### Evals as the code factory

*Simão Nogueira, Noticed*

Simão closed the first day with a proposal to use evals beyond model evaluation, across the whole software-building cycle, alongside tests in CI.

Noticed is still validating its product with its first customers, and he warned he'd talk less about technique. Simão is a designer by training, and Noticed is an applied research lab that builds models for founders who do their own selling. Its premise is that AI models are bad at social relationships and can't tell which relationship matters most to a founder at a given point in their career. He pointed to a professional relationships benchmark Salesforce had just released as confirmation.

Noticed builds small, general models to give that intelligence layer to CRMs and agents, in sales, fundraising or hiring. It researches on three fronts: context, harness and models, the last one still to come. It also faces three engineering problems:

- **identity enrichment:** from an email, figure out who the person is;
- **identity matching:** decide whether an email, a LinkedIn and a GitHub belong to the same person;
- **search and ranking:** tell a founder or sales team who they should spend time with right now.

He said all three follow a normal curve. In the middle and the right tail, where there's plenty of information, deterministic algorithms do the job. In the left tail, where information is rare and hard to piece together, probabilistic models come in. Simão presented preliminary identity enrichment results from their own benchmark and reported performance about three times better than other harnesses, for less than a tenth of the cost.

His proposal had two parts. First, evals aren't only for code quality and can measure design, customer outcomes or how the ideal customer profile changes. Second, evals belong in CI. Unit and integration tests cover the deterministic part, and evals cover the non-deterministic part, checking that the code keeps delivering the same value. On a small team, he said, his experiment can't break his cofounder's work, and evals in CI help detect those regressions. Noticed open-sourced a skill format, the "Lab skill", with their general approach to evals.

The official talk description adds context about how Simão works. He runs eight coding agents in parallel, each in its own worktree, leaves bigger goals running overnight and uses billions of tokens a month. The description warns about the risk of the agent changing the evaluation criteria so that its own result passes. If the task is to make a number go up, lowering the threshold looks reasonable to the agent. In identity matching, merging two different people into one is the failure the eval has to make visible. The description also says one of the skills they open-sourced made ClickHouse queries 5.6 times faster.

In the Q&A:

- **Does the identity-matching benchmark work for brands and products?** The results shown were for enrichment. Identity matching is still less mature, which is why he didn't show numbers.
- **How much does running evals in CI cost compared with production?** They don't run them all the time. CI only runs the evals for the component the PR touches. He compared it with what Cloudflare and PostHog do, triggering agents from observability, and said Noticed prefers to put it in CI, because with such a small team there's no time to lose later.

## Day 2: September 24

### Cloudflare

Day two opened with Cloudflare again, in a sponsor talk given by two people. One was Matt Carey, from the day before, and the other a colleague whose name didn't make it into my notes. They presented tools for agents to carry out development steps, including testing, deploying and monitoring.

My notes start with Cloudflare's original bet. Traditional serverless packs your code with a whole runtime into a container, which means slow cold starts and high cost. Workers run in V8 isolates. Only your code ships, alongside a runtime process that's already running, and it's deployed to more than 315 data centers. "Anything you want to put on the internet runs in a Worker," they said, whether it's a cron job, an e-commerce site or WordPress, and Workers can now be much bigger than before. Next were the pieces for full applications: Durable Objects, blob storage, database connections. ("Five minutes until the first time someone said AI," they joked.)

They described Cloudflare's four acts, as CEO Matthew Prince puts them: CDN and DNS, then enterprise security, then the developer platform, and now infrastructure for agents to run and communicate on the web. With more than 20% of the internet going through Cloudflare, they said, there should be a way to do something efficient there. They said several of the new pieces were still experimental and that they were testing what worked. The ones they mentioned:

- **Agents SDK**, Lego pieces for agents on top of Durable Objects;
- **Flue**, a framework from the creators of Astro for organizing agents' control flow;
- **Cloudflare Computer** and **Artifacts** (git at the edge), which Harshil showed the day before;
- **Workflows**, also built on Durable Objects.

Internally, they built Cloudflare OS. The starting question was how to let anyone at the company use agents with sensitive data, like Salesforce and the ERP, safely. The result is free, open source and installs with one click on a Cloudflare account. It's not a ChatGPT clone, they said. It's closer to Marcelo's Icarus or PostHog Desktop, where you can build and share whole apps and have skills for the whole organization. One of them set up an environment for their family, with a connector to the supermarket, and that's how they do the household shopping.

<figure>
  <a href="/images/blog/lisbon-ai-2026/agente-ciclo-de-vida.webp"><img src="/images/blog/lisbon-ai-2026/agente-ciclo-de-vida.webp" srcset="/images/blog/lisbon-ai-2026/agente-ciclo-de-vida-640.webp 640w, /images/blog/lisbon-ai-2026/agente-ciclo-de-vida-1024.webp 1024w, /images/blog/lisbon-ai-2026/agente-ciclo-de-vida.webp 1600w" sizes="(max-width: 719px) calc(100vw - 4rem), 655px" alt="Slide titled 'The agent drives the lifecycle' with an infinity symbol connecting Code, Plan, Build, Test, Release, Deploy, Monitor and Operate." width="1600" height="1090" loading="lazy" decoding="async"></a>
  <figcaption>In Cloudflare's view, the agent uses wrangler, the CLI and MCP to write, test, deploy and monitor the application.</figcaption>
</figure>

At the end they came back to the development cycle. In their view, the hard part now is knowing what you want, and then testing, deploying, monitoring and operating what gets built. Cloudflare is rethinking the platform so the agent also does those steps for the code it writes. They also saw a consequence for people who build products. Software used to surround users with buttons and, at most, a JSON field, because nobody trusted them to write code. Now, they argued, any user can write code with the help of agents, so software will have to be customizable with code and ship with good extension systems. "If you don't move, you won't be the place where agents run."

<hr class="divider">

### Bringing tldraw offline

*Steve Ruiz, tldraw*

Steve, who was also the MC, used a times-tables game he made for his daughter to show how he works with AI now. He described his role as the creative director of a swarm of agents, choosing projects he could never do alone.

He founded tldraw, which is two things. One is the app, an infinite whiteboard (he draws calligraphy with his finger on the trackpad and offered to teach anyone who asked). The other is the SDK, the technology behind the canvas, which the company sells and which shows up inside products like Replit, some of Google's, and tools used at BlackRock and at private equity funds. Side projects are the SDK's marketing. Building something interesting with it forces the team to improve the SDK, and the project promotes it. The year before, on the same stage, he had shown a project with AI on the canvas. This time it was tldraw offline.

tldraw offline is the desktop version of the app, inside Electron. He wanted two things. First, to work with files, offline. Second, to let local coding agents, which already have access to his files, use the canvas too. The app has a local MCP server with two important endpoints:

- **canvas screenshot**, so the model can see what's drawn;
- **run JavaScript**, something nobody puts in an online product because it runs user code inside the product. In a local app, he said, "go for it".

Through those endpoints, the model draws, prototypes and works on the canvas. He asked Codex to make the buttons on a character he'd drawn work (it didn't, and he blamed the model he was using), showed an interactive earthquake visualization built from a sketch, pseudo-3D dice you can roll and RPG pieces you can move. There's also a collaboration mode over the local network, and the team is working on "tldraw offline online", with a backend each person hosts. The address is tldraw-offline.com.

Steve compared his job to a site foreman's. On a construction site, someone from the crew walks into the trailer and says they found a water pipe where nobody expected one, and asks what to do. Someone has to make a decision, often an arbitrary one, to unblock the team, and the team goes back to work without caring why. He said that's what he does with agents now.

He had gotten this wrong once before. When tldraw became a startup and he hired talented people, he thought of the work as his, so he asked the team to do his work faster and better. He reviewed all the code and fixed things that compiled and worked, just not the way he would have done them. He became the bottleneck. It took him a while to learn to turn his taste into rules the team could follow, and longer still to understand that ten people are for choosing bigger projects, not for doing the same project faster. With AI, he said, it's the same. The question is which projects only make sense with this much work available, and which parts he doesn't even need to review.

For his 7-year-old daughter, he made a game called Danger Brave. Her school was going to teach times tables with a game he found "terrible", so he made another one:

1. He drew the screens of a battle in the style of the games she likes, sent the screenshot to Codex and asked it to build it. His daughter played it and liked it.
2. He asked for the art to be generated with an image model. It looked good fast, but with problems: UI overlapping the background, inconsistent characters, details that made no sense.
3. He used tldraw offline as a direction layer. For each new screen, he drew on the canvas, and the model used the drawing as context. Story changes also went onto the canvas ("the merchant is now called Carl", "there's a mysterious person at the lake who helps the hero").
4. He asked the agent to screenshot every stage of the game and dump it all back onto the canvas. There he reviewed, annotated on top, redrew and handed it back to the model.

Since all the art came from an image model, there was a lot to review, and he had to build tools. One was an asset manager. The problems included wrong hands and the classic one where you ask for a transparent background and the model draws a gray and white checkerboard. He found that software can send messages straight into the running Codex conversation, and built tools that write the fix prompts on their own.

<figure>
  <a href="/images/blog/lisbon-ai-2026/danger-brave-versoes.webp"><img src="/images/blog/lisbon-ai-2026/danger-brave-versoes.webp" srcset="/images/blog/lisbon-ai-2026/danger-brave-versoes-640.webp 640w, /images/blog/lisbon-ai-2026/danger-brave-versoes-1024.webp 1024w, /images/blog/lisbon-ai-2026/danger-brave-versoes.webp 1048w" sizes="(max-width: 719px) calc(100vw - 4rem), 655px" alt="Projected screen with two nearly identical illustrations of a fighter with a red belt and a staff, labeled Version 3 and Version 4, inside the tldraw canvas." width="1048" height="672" loading="lazy" decoding="async"></a>
  <figcaption>A frame from the video I recorded: versions 3 and 4 of the same Danger Brave character. Keeping clothes and accessories the same across poses took its own pipeline.</figcaption>
</figure>

Then he worked on the style. Steve felt bad about an aesthetic that had come out of the model ready-made, on the first try. He painted before he programmed, and he showed some of his paintings. He wanted a gouache and watercolor look, which was hard to get because image models spread the same level of detail across the whole frame, and that competes with how the characters read.

With about 30 levels and 50 screens, the game needed thousands of images. He started with a set of test images, gave feedback, and only then generated all of them in parallel. A single hero could appear in five different poses.

For the final review, he put every screen from every game state on the canvas and had an image model go through random groups looking for inconsistencies and UI bugs. "It was an absurd amount of work and tokens," he said, but it was the system he needed to reach the quality he wanted. Generating boy-hero and girl-hero versions of the images was easy, because it's cheap and doesn't need his time.

The final game, at dangerbrave.com, is fully voiced, with thousands of lines. It has trolls fixing bridges, goblins, character customization (the hair is masked from a magenta PNG) and damage poses. Steve said the combat is completely arbitrary and unrelated to the rest of the game, and that he got better at mental math himself while making it. He also remembered that not every kid wants to fight monsters. With the same rules, a new story, new art and another voice, he made a version where you train wild horses and gain trust instead of losing lives. Sci-fi dance battles followed.

Steve said tldraw is still the expression of his taste, and he'd be worried if it stopped being that. He doesn't read the code of these projects, but he wants to be there as creative director, with good tools, so that when someone walks into the trailer he knows what to answer and the answer goes back to the swarm. He invited the audience to think about projects that would take far too much work to do alone and wouldn't exist without AI, rather than doing what we already do a bit faster.

During the Q&A, someone who had tried something similar asked how he kept from going crazy as the project grew. Steve pointed to art school, where you learn not to go crazy working alone, in a room, on something nobody asked for. He draws it as a ramp with walls. You set the bounds of the problem, like this size, this theme, this game and not another one. Any decision inside the bounds is fine, and there's an end point, a show or a launch. "You give yourself permission to go as far as possible within those bounds." It takes a while to learn, he said.

<hr class="divider">

### Screen-aware voice agents: a new interaction pattern

*Daniel Bukac, Duvo*

Duvo's voice agent watches the screen while it interviews a person about their work. Daniel started his talk with two things he learned preparing the talk. You can point an agent at any website and steal its entire design system, and if you hand in your talk description more than two weeks in advance, it goes stale, because some lab releases something new.

Duvo automates critical processes at large companies. In Duvo's experience, people at the same company do the same process in different ways, and the interviews help record those differences before automating. They interview the operators, ask them to show how they work, and build a process map that later guides the agents.

He played a recorded demo. An accounts payable operator entered invoices into an ERP while Duvo Clarity's voice interviewer followed the screen. She said the invoices arrive by email and she fills everything in by hand. The agent, looking at the screen, noticed that the ledger account and tax code fields were empty and asked what came pre-filled and what was typed in. The part Daniel wanted to show came next. The agent said another person it interviewed had said those fields usually come pre-filled, thanked her for her version and moved on to the next step of the process.

The principles he took from building it:

- **Respect whoever is talking.** If people feel dumb, they talk less. When someone pauses to think, the agent doesn't interrupt. They started detecting the end of speech by silence and moved to detecting it by the meaning of the sentence.
- **Voice straight to voice.** The classic approach converts speech to text and text to speech. Now you can go voice to voice, and full duplex mode, released two weeks earlier, listens and speaks at the same time.
- **See the screen.** For the product, it's context. For the user, pointing is easier than explaining. They only send a screenshot to the model when the screen changes in a meaningful way, because operators spend a long time on the same screen and then switch every second.
- **Reason.** Their first architecture had a smarter model silently watching a simpler voice model that runs the conversation. The two shared a state, and the voice model pulled ideas from the other when it needed them.

<figure>
  <a href="/images/blog/lisbon-ai-2026/voz-dois-modelos.webp"><img src="/images/blog/lisbon-ai-2026/voz-dois-modelos.webp" srcset="/images/blog/lisbon-ai-2026/voz-dois-modelos-640.webp 640w, /images/blog/lisbon-ai-2026/voz-dois-modelos-1024.webp 1024w, /images/blog/lisbon-ai-2026/voz-dois-modelos.webp 1600w" sizes="(max-width: 719px) calc(100vw - 4rem), 655px" alt="Blue slide titled 'Two models, one shared state': Voice interviewer and Claude director boxes connected to a Shared state box." width="1600" height="1014" loading="lazy" decoding="async"></a>
  <figcaption>A fast voice interviewer and a second model that analyzes the context of the conversation, both reading the same state. Daniel said this architecture is already being replaced by a native solution from the providers.</figcaption>
</figure>

OpenAI had just made that pairing, a conversation model in front and a reasoning model behind it, a native feature.

In the Q&A:

- **What if the operator, afraid of losing their job, biases or hides information?** They've seen it happen. That's why they interview several people separately, and discrepancies are flagged on purpose so the company can decide what's true.
- **Did you measure the result against discovery done by people?** Duvo has four engineers embedded with customers who absorb the company's context and judge whether the map is good or needs more interviews.

<hr class="divider">

### VdG: a Physical AI system that works without cloud, GPS, or reliable network

*Francisco Leal, UB Robotics*

VdG is a field robot that works without the cloud, without GPS and without a reliable network. Francisco's team has four people, has been working full time for a little over a month and came entirely from software. "We're going from bits to atoms," he said. "Full stack," he added, now means AI, hardware, software and 3D printing.

The control panel showed the simulated robots, running on GPUs on the web, and the prototype on stage, with the camera, state and mission of each one. When Francisco opened the prototype's camera, the auditorium Wi-Fi went down and the connection dropped, so he carried on with a recorded video. In a simulation of a warehouse, the robot looked for people and backpacks and drove up to them, with its reasoning showing on screen.

The robot needs to perceive, reason and act, and the target cost is under US$1,000, so the hardware is small:

- a Jetson Orin with 8 GB of memory runs everything, the model and the object detector (YOLO);
- the model is trained elsewhere, compressed and sent to the robot;
- training uses simulated data, with people and backpacks labeled along with their positions, because the robot needs to know whether the target is to the right, to the left, near or far;
- without GPS, a LiDAR like a robot vacuum's maps walls and obstacles, and the camera helps with orientation. The mission is defined by limits, like "don't go more than 20 meters away".

<figure>
  <a href="/images/blog/lisbon-ai-2026/ubr-8gb-cerebro.webp"><img src="/images/blog/lisbon-ai-2026/ubr-8gb-cerebro.webp" srcset="/images/blog/lisbon-ai-2026/ubr-8gb-cerebro-640.webp 640w, /images/blog/lisbon-ai-2026/ubr-8gb-cerebro-1024.webp 1024w, /images/blog/lisbon-ai-2026/ubr-8gb-cerebro.webp 1600w" sizes="(max-width: 719px) calc(100vw - 4rem), 655px" alt="Dark slide titled '8 GB is enough for a brain' and a bar split between system, reasoning, action, voice, sensors and headroom. A small wheeled robot is on the stage, bottom right." width="1600" height="1414" loading="lazy" decoding="async"></a>
  <figcaption>How VdG splits 8 GB: 0.9 GB for the system, 4.5 GB for Gemma 4 E4B in 4 bits and smaller slices for action, voice, sensors and headroom. The robot is on the stage, bottom right.</figcaption>
</figure>

The goal is search and rescue: finding people, getting to them and providing support. The team plans to build a version that can carry an injured person. Another use is finding lost objects, like backpacks at airports. They also want someone who controls one drone or robot today to be able to operate several, because the robot itself reports what's wrong and how the mission is going.

In the Q&A, someone left a backpack on stage and Francisco sent the robot to look for it. It didn't find it. He gave two reasons. The model was trained too heavily on finding people, and the robot has no sensor pointing down. The reasoning on screen said it saw nothing of interest.

<figure>
  <a href="/images/blog/lisbon-ai-2026/vdg-mochila.webp"><img src="/images/blog/lisbon-ai-2026/vdg-mochila.webp" srcset="/images/blog/lisbon-ai-2026/vdg-mochila-640.webp 640w, /images/blog/lisbon-ai-2026/vdg-mochila-1024.webp 907w" sizes="(max-width: 719px) calc(100vw - 4rem), 655px" alt="The robot's camera feed projected on the big screen, showing the audience in the auditorium, with the text 'Find backpack ??? I see nothing of interest.' at the top." width="907" height="960" loading="lazy" decoding="async"></a>
  <figcaption>A frame from the video I recorded: VdG's camera looking at the audience and the robot's reasoning at the top, "I see nothing of interest".</figcaption>
</figure>

Someone asked how much the person-carrying robot will cost. The answer was about US$50,000, because it needs more hardware. The US$1,000 prototype is there to prove the smallest possible models can run before moving to bigger robots.

<hr class="divider">

### Foundation Models for Drug Discovery: from Hype to the Lab

*Cristiana Carpinteiro, Loka*

Cristiana started from Dario Amodei's claim that it will be possible to cure most diseases in ten years and compared it with what she sees at work. She said AI already speeds up molecule discovery, but the bottleneck is in clinical trials.

At Loka, about 60% of customers are in healthcare and life sciences, and her team builds custom models for each stage of drug discovery. Since most of the audience had no biology background, she started with the basics. Her example was heart disease caused by fat building up in the arteries, like cholesterol, which the liver produces through a chain of reactions. To produce less cholesterol, you have to find the right point in the chain, the right protein, and a molecule that fits it and locks it. It's a physical fit, like a key and a lock.

<figure>
  <a href="/images/blog/lisbon-ai-2026/loka-chave-fechadura.webp"><img src="/images/blog/lisbon-ai-2026/loka-chave-fechadura.webp" srcset="/images/blog/lisbon-ai-2026/loka-chave-fechadura-640.webp 640w, /images/blog/lisbon-ai-2026/loka-chave-fechadura-1024.webp 1024w, /images/blog/lisbon-ai-2026/loka-chave-fechadura.webp 1600w" sizes="(max-width: 719px) calc(100vw - 4rem), 655px" alt="Slide titled 'Drugs Fit Proteins Like a Key Fits a Lock' with a diagram: statins bind to the HMG-CoA reductase enzyme and block cholesterol production." width="1600" height="984" loading="lazy" decoding="async"></a>
  <figcaption>In Cristiana's example, statins inhibit the HMG-CoA reductase enzyme, which is involved in producing cholesterol.</figcaption>
</figure>

Cristiana put the time to develop a drug at about 15 years and the number of possible molecules at about 10⁶⁰, more than there are atoms on Earth. She split the process into two parts:

1. **Early discovery:** find the target protein, find the molecules that bind to it and optimize them (for example, so the body absorbs them), until about 20 candidates are left.
2. **Clinical trials:** test safety and efficacy in humans, about 10 years, with roughly a 5% success rate.

AI is already in every stage of the first part, she said. To find the target protein, which is research work across literature, databases and simulations, Loka built an agent interface where scientists use those tools in natural language, including with their own data. For the molecules, there are biological foundation models, LLMs trained on the "language" of proteins, molecules and DNA. A protein is a sequence of amino acids represented by letters, and shuffling the letters gives you another protein or none at all, like shuffling the letters of a word.

The case was a three-year project with a client that already has drugs in clinical trials and screened 5 billion molecules against each target protein. An expert looked at the results and searched for patterns "a bit on intuition and magic". It was slow, but it produced a huge audited dataset, always extracted the same way. Loka used embeddings from a chemistry model and a protein model as input to a neural network that predicts whether a molecule binds to a protein.

The most interesting result came from a test with a protein outside the training set. By the metrics, the model looked bad, because it didn't reproduce the experiment's labels. But the experts liked it, because it ignored exactly the molecules they would have thrown out, the ones that "open every lock" and would cause side effects. The model went into a dashboard the scientists use daily, and they recovered molecules the experiment had missed, which were confirmed in the lab.

She credited the result to data reviewed by experts over years and to decisions made together with the chemists. One of the first versions of the model memorized a shortcut, because almost the whole dataset was negatives, and the chemists designed a sampling scheme that made chemical sense.

She gave three reasons AI hasn't gotten to clinical trials yet:

- **biological data is messy and context-dependent:** the outcome depends on whether the patient smokes, exercises, their habits;
- **the labels don't reflect the biology:** diagnoses come from symptom checklists, and anxiety and depression are different diagnoses with a lot of biological overlap;
- **there's no feedback:** choices made during optimization only show consequences about five years later, like taking an exam and getting the grade five years on. Lab measurements don't correlate well with what happens in trials, and that never flows back into the models.

To close the loop, the model that picks the molecules would need to learn from clinical trials. That runs into politics and bureaucracy, because whoever builds the model is rarely whoever runs the trial. It also requires data made for machine learning that captures the complexity of the human body. She said that the day before, she saw Amodei qualify the original claim, saying it would only be possible if AI were applied at every stage. She argued that domain experts should decide which tools to use and approve what goes to the lab.

In the Q&A:

- **How many experiments did you run?** So many they had to set up a new MLflow server in the middle of the project. In the last year, they restructured the code to be agent-friendly and use AI to write a lot more code, but the scientific decisions stay with the scientists.
- **Anthropic's autonomous lab?** She said she fears bioweapons if automated labs decide what to test. She thinks it's a good use of AI, as long as nothing goes to the lab without an expert looking at it and approving it.

<hr class="divider">

### Post-Git Agentic Collaboration

*Lukas Wirth, Zed*

Zed wants several people and several agents to work in the same conversation. Git doesn't cover this, Lukas said, because it stores snapshots of code and leaves out the conversation and decisions that led to them. When work changes hands, someone has to rebuild that state.

Zed's answer is Delta, publicly launched the week before. Delta combines the agent with a shared history of edits and conversations. It uses DeltaDB, an experimental version control system based on CRDTs, data structures that replicate without conflicts, which still relies on Git and GitHub underneath. Every fine-grained edit becomes a "delta", something between two commits, and the whole conversation is versioned. You can rewind the thread to any point. Threads live in the cloud, in Cloudflare Durable Objects.

For the demo, he fixed a bug in Delta itself. You can comment on any part of the thread, and if you delete a comment's text, the comment goes away. That worked in the thread and in the diff view, but not in the file panel. Lukas had already let the agent investigate and write a regression test, the slowest part. Then:

1. he copied the thread link and sent it to a colleague who was at home, in Poland;
2. the colleague's avatar appeared in the session, and Lukas started following what he saw: reading the thread, opening files, opening a terminal;
3. each worked on their own machine, Lukas on macOS and the colleague on Linux, with their own files and worktrees;
4. the agent runs on the machine of whoever sends it the message. The whole transcript replicates to everyone, so the context is shared;
5. the colleague commented on the agent's plan, and Lukas asked it to unify the code that was duplicated across the thread, the diff and the file panel.

Lukas described how it works today. Two people on the same task each talk to their own agent and pass context to each other, an agent-to-human-to-human-to-agent conversation, with separate contexts and transcripts.

The thread also opens in the browser, via WebAssembly. There's no terminal or filesystem there, but you see all the diffs and files and can send messages to the agent. For the browser version to be complete, it would need a cloud runner. Code review doesn't go through GitHub either, because Zed wants merging to happen without leaving the harness. The review flow forks the thread into an isolated worktree, you comment on the diff, request changes, approve, and the changes go back to the main thread. To integrate, a new thread runs CI on the branch and merges if it passes.

DeltaDB is still hidden behind the harness, but Zed wants to offer it on its own, for other tools to use.

In the Q&A, someone asked whether the two were in the same process on OpenAI's side. They weren't. The agent runs on the machine of whoever sent the message, and the conversation is replicated. That creates new problems. The cache is lost when people take turns. And with skills, if one person's skill assumes a program is installed and the other person doesn't have it, the agent gets confused, because the history says the program was there. When the turn moves to another machine, they have to tell the agent that the environment changed.

<hr class="divider">

### The Slopbowl-ification of Software

*Aayush Kapoor, Vercel*

Aayush works on Vercel's AI SDK and split his talk into two halves: the SDK basics, then his view of what happens to software when writing code gets very cheap.

The basics are three primitives:

- **generate text:** call a model with a prompt. He asked an old GPT when Lisbon AI was, and it had no real-time information and couldn't answer; he switched the provider to a Perplexity model, and the answer came back right, with the date and venue;
- **tools:** define a function's input schema, and the model calls the function and returns the result;
- **structured output:** define the shape of the answer and get typed JSON back, in the example three places to get hot chocolate in New York.

Aayush said the temptation with these pieces is to keep building. He compared it to a Chipotle bowl, which people in the US call a "slop bowl". You pick a base and add salad, protein and cilantro, and you can keep adding nachos, guacamole and more protein until it's bad. He said software is turning into that. As the cost of writing code falls, there's no limit to what gets built. To show the scale, he cited recent examples: OpenAI solving the Navier-Stokes Millennium Prize problem, RSA-260 being solved and GPU engines for building shaders.

<figure>
  <a href="/images/blog/lisbon-ai-2026/slopbowl-mais-um-prompt.webp"><img src="/images/blog/lisbon-ai-2026/slopbowl-mais-um-prompt.webp" srcset="/images/blog/lisbon-ai-2026/slopbowl-mais-um-prompt-640.webp 640w, /images/blog/lisbon-ai-2026/slopbowl-mais-um-prompt-1024.webp 1024w, /images/blog/lisbon-ai-2026/slopbowl-mais-um-prompt.webp 1600w" sizes="(max-width: 719px) calc(100vw - 4rem), 655px" alt="Gray slide with a bowl labeled software and tags falling into it: a fallback, a config flag, a retry loop, an abstraction, another agent. Below, the phrase 'Just one more prompt'." width="1600" height="1020" loading="lazy" decoding="async"></a>
  <figcaption>"Just one more prompt": fallback, config flag, retry and one more abstraction falling into the same bowl.</figcaption>
</figure>

His concrete example was a company that announced on X it was building an internal replacement for Jira and Linear, run by its QA engineer. He asked the audience what happened months later. Did they keep using it, hire a team to maintain it, or turn it into a product? None of the three. They went back to Linear. The tool kept gaining integrations, settings and maintenance work, like a Slack integration, an agent to make it autonomous, an abstraction to serve every team and fallbacks, until it competed for time with the main product. Aayush's answer is taste, in the sense of knowing what's worth building. He also advised experimenting often to learn what works.

The hands-on half started with a refund demo, a simulated conversation with a support chatbot. The customer asks for a refund, and the agent asks for the order number, looks up the order, checks whether it's eligible and asks the merchant for approval. Vercel built the flow to be durable and dynamic, surviving errors, retries and long waits without knowing in advance what the user will ask for. Behind it, three pieces:

1. **Code mode:** instead of calling tool after tool, the model writes JavaScript that calls several at once, which saves context. In the example, the code fetched the order details, the amount and the eligibility.
2. **Run SDK:** a QuickJS sandbox, with no `fetch` and no access to internal modules, that runs that code safely. It returned the US$148 amount and the refund policy.
3. **Workflows SDK:** saves progress so it can pause and resume, so that if the approval takes a while, the request isn't lost and the customer doesn't have to repeat everything.

In the Q&A, someone asked how you differentiate on taste when the mess comes from leadership. Aayush said the answer isn't clear. At Vercel, the policy is to know your customer, and every engineering decision has to favor them, with developer experience as the priority. If you decide that way, he said, management can see the trade-off being made.

<hr class="divider">

### Design is over

*Luis Monteiro, Pixelmatters*

Luis started by asking how many designers were in the audience, then quoted the talk's title, "design is over", which people keep saying on X ("I built this site with Claude and I don't need a designer"). He said to assume it's true. Luis argued that AI made prototypes cheap, but that someone still has to choose what to build and review the result. The product cycle of research, wireframe, visuals, prototype and code existed to reduce the risk of paying to build the wrong thing, and now building is cheap.

He separates structure from feel. Structure is design systems, patterns and flows. Everyone talks about it, and AI does it well. What's missing is feel, which covers how the thing looks, what it makes the user feel, the invisible design that makes you like a product without knowing why. "How many times have you gone to a website and thought: what beautiful code, I'll buy it?" He cited an iPhone animation that looked like a gimmick and became a moment where hardware and software connect.

At Pixelmatters, a product studio in Porto, AI works well when there's already a system, a defined visual language and a brief. The problem is when you don't know what you're building, which he put at 99% of the time. You see the thing in your head, can't describe it and keep going back and forth with prompts. He uses Figma or paper to test ideas before choosing a visual direction. The creative process is messy on purpose, and one idea leads to another. That's where he tries the idea that seems dumb and sometimes works.

His process uses both. Claude is for generating ideas, but not yet for polishing the visuals. 90% of the time he doesn't like the structure Claude proposes, but he iterates, sending references and keeping some parts, and then refines by hand until he has the details that make the product a pleasure to use. He recorded a 20-minute demo of the whole process and shared the link.

He quoted a line he heard at an event: design is noticing. The examples:

- the perfect button that's still misaligned;
- concentric radii on nested elements;
- the play button, which looks off when centered mathematically and needs optical alignment;
- the Apple Pay vibration, which tells you it worked without looking;
- how fast things appear on screen.

He said AI can suggest, but that sensitivity needs a person. A lot of interfaces will be generated, which is great for going from zero to one quickly, but he believes the most important ones will have a person involved. "Good design still needs designers."

In the Q&A, someone observed that everyone thinks they have good taste and asked how you know whether your judgment is good. Luis believes taste can be learned. Designers develop sensitivity over years of working with users, and a good first step is studying people who do it well (Linear, Vercel, Apple, even with his reservations) and trying to replicate the interactions. With repetition you start to feel why one interface is better than another. "Consume design."

<hr class="divider">

### CNCA and BSC AI Factory

The last talk before lunch was from Pedro, CNCA project manager at the BSC AI Factory, one of the event's sponsors. Steve introduced him as the person who gives out free compute to anyone who makes a good case for it.

The BSC AI Factory is a European Union-funded initiative to support AI projects in Europe. Pedro presented free access to computing resources and support for eligible projects. There are two machines:

- **MareNostrum 5**, the Barcelona supercomputer, for more experienced teams;
- **Deucalion**, the Portuguese supercomputer, recommended for less experienced teams, because the support team works practically in the same room.

They expect an AI-focused project and your own team to carry it out, because nobody at the AI Factory will write code for the company. They offer compute resources, help adapting the project to the machines, data and software support tuned to these machines, and training sessions, where you use one of the machines and can present your project. Startups with AI projects are the main focus, but small and medium businesses that want to optimize or test something and the public sector can apply too.

The process:

1. fill in a short form, reached through the QR code on the slide;
2. the team gets in touch and sets up a first technical meeting;
3. if all goes well, the resources come through in two or three weeks, sometimes sooner.

They also handed out free tickets to Web Summit.

<hr class="divider">

### AI Escapes: Super Intelligence or Super Incompetence

*Diogo Mónica, Anchorage and Haun Ventures*

Diogo's subject was the reports of models that escaped test environments at the labs, and he criticized the security of those environments. He proposed judging each escape by the competence of both sides, the models and the people trying to contain them. His conclusion was that the models were capable and the labs were careless.

He was employee number 40 at Square, where he led security for the payment systems, then headed security at Docker and cofounded Anchorage Digital, the first federally chartered bank in the US to work with crypto. Today he's a partner at Haun Ventures.

Models under test at the big labs, Diogo said, escaped their isolated environments and attacked companies on the internet, and every big lab reported some case. The story that spread was about consciousness, a rogue mind and impossible containment. Diogo offered another way to think about it, using a movie scene.

It's the palm tree escape from *Pirates of the Caribbean: On Stranger Tides*. The Spanish army ties Jack Sparrow and Barbossa to palm trees, far from camp, with a slack rope, and nobody keeps watch. The two sit drinking the rum stored in Barbossa's peg leg. Jack climbs the palm tree, ties the rope to a coconut, swings over to another tree, climbs down and ties up twelve soldiers with the same rope. At the end, he takes a bow.

He went through the comparison point by point. On the models' side, the pirates:

- were noisy: they generated tens of thousands of log lines over weeks, crossed every detection threshold, and in many cases nobody noticed;
- had strange plans: they were supposed to complete evaluation tasks and started attacking systems unrelated to the test and investigating how to manipulate their evaluators;
- formed a crew: they used the package repository to exchange messages, split up work and share access;
- were capable: they found vulnerabilities, chained exploits and turned initial access into persistent access.

<figure>
  <a href="/images/blog/lisbon-ai-2026/exercito-espanhol.webp"><img src="/images/blog/lisbon-ai-2026/exercito-espanhol.webp" srcset="/images/blog/lisbon-ai-2026/exercito-espanhol-640.webp 640w, /images/blog/lisbon-ai-2026/exercito-espanhol-1024.webp 1024w, /images/blog/lisbon-ai-2026/exercito-espanhol.webp 1600w" sizes="(max-width: 719px) calc(100vw - 4rem), 655px" alt="Parchment-style slide titled 'The Spanish Army Model Cos', with 'Spanish Army' crossed out, and four items numbered in Roman numerals." width="1600" height="960" loading="lazy" decoding="async"></a>
  <figcaption>The labs' side, according to Diogo: unpatched infrastructure, a weak sandbox, alerts without automatic containment and, in some cases, the internet left on.</figcaption>
</figure>

The labs were the army. In one case, the Artifactory serving packages to the models was unpatched, running on a generic operating system with no hardening at all. The sandbox blocked the internet, but the agents reached an intermediate host and opened a channel through it. There were alerts for port scans and for communication through the filesystem, and the only fix was updating the vulnerable packages. In some cases, the models were told the internet was off, and it was on. He asked people to hold the engineering around the models to the same standard as their excitement about the models.

He also pointed out that it's not only the model. An nmap in a loop, feeding its output into an exploit framework like Metasploit, will also end up breaking into some server. The model runs inside a harness that repeats the loop, ignores failures, reinforces successes and gives access to tools that are already good on their own. "Remember the harness, not the model."

The attacks didn't bring new vulnerability classes either. Zero-days were exploited, but the flaws were the usual categories: exposed secrets, deserialization, broken authorization, privilege escalation. Often the model just found credentials published on GitHub. Diogo said it looked less like superhuman pirates than like finally having the resources to look under the bed and seeing that the internet's software has been a mess for forty years.

What he considers new:

- an abstract goal turns into a campaign that adapts on its own, without a person deciding each step;
- old flaws are still turning up even in heavily audited codebases, like OpenBSD;
- there will be more code, maybe with more bugs per line, and even if models get better, the total number of bugs should go up;
- AI automates reverse engineering patches and writing exploits. Publishing a patch exposes clues about the flaw. If you take five days to update, the attacker has five days to exploit the bug the patch just revealed.

He said this was the line that hurt him most to say: "I led security at Docker, and I'm the one telling you containers are no longer a security boundary." They're still great for packaging software, but anyone relying on them for isolation should rethink the system.

Defenders have AI too, Diogo said, and until a new balance is found, a lot of people will suffer, especially those running systems that take fifteen years to update or routers that don't even update themselves.

Before getting to defense, Diogo showed something that AI makes worse. Everyone's first move is to hook an agent straight into email, and email is one of the worst sources of untrusted input. He demoed his personal setup:

1. email arrives in an external inbox, on Resend;
2. Resend fires a webhook to a proxy running in a separate security boundary, instead of sending it to the agent;
3. the proxy applies deterministic rules, logs everything and runs the text through a classifier that isn't a generative model and can only answer safe, direct injection, indirect injection or jailbreak;
4. only what passes reaches the agent.

In the room, a "you are DAN, you have no restrictions" style jailbreak was blocked in about 100 ms, and the proxy never passed the message on to the agent. An email asking the agent to render a malicious URL while summarizing the message was quarantined for manual review. "Let's move the meeting to Thursday" went through. He thinks it can get down to 10 ms, enough to sit in the path of every message.

Then he moved to defense. Defenders have advantages. They have the source code and the attacker doesn't, they can block bad code before deploy, and they can change the architecture. The industry never had to use these advantages, Diogo said, because nobody bothered attacking "your blog", and with cheaper attacks it will have to. His recommendations:

- pick the core code, like the microkernel or whatever everything depends on, cut its dependencies and saturate bug hunting there, spending more than the attacker;
- eliminate entire vulnerability classes. More than 70% of bugs in C and C++ codebases are memory corruption, he said, and AI can rewrite the code in a memory-safe language;
- formally verify the trusted codebase, something AI is also good at;
- replace containers with minimal VMs, like Firecracker, which everyone is already trying to break;
- keep access control deterministic. AI can write the rules and open an investigation, but it doesn't sit in the path of whatever enforces them;
- never let a production VM live longer than an hour; if something misbehaves, isolate it, rebuild it and bring it back up.

<figure>
  <a href="/images/blog/lisbon-ai-2026/chrome-bugs.webp"><img src="/images/blog/lisbon-ai-2026/chrome-bugs.webp" srcset="/images/blog/lisbon-ai-2026/chrome-bugs-640.webp 640w, /images/blog/lisbon-ai-2026/chrome-bugs-1024.webp 1024w, /images/blog/lisbon-ai-2026/chrome-bugs.webp 1600w" sizes="(max-width: 719px) calc(100vw - 4rem), 655px" alt="'Saturate bug discovery' slide with a bar chart of security bugs fixed per Chrome version, from M126 to M150. The bars stay near zero until M145 and climb to about 400 in the latest versions." width="1600" height="940" loading="lazy" decoding="async"></a>
  <figcaption>Diogo's slide lists 1,072 security bugs fixed in Chrome versions 149 and 150.</figcaption>
</figure>

For the labs, two suggestions. First, write logs to a cryptographic ledger outside the trust boundary, so nobody can say the log can't be trusted because it lives in the same environment. Second, never connect a model under test to the real internet. Simulate the internet inside an air gap. "The best way not to forget the internet is on is to not have internet."

In the Q&A:

- **How do you hold the labs accountable?** He said he doesn't know. He recalled that Anchorage itself benefited for years from rules that kept other banks out of the market, and called that capitalism. He thinks both extremes are wrong: that it's all a scam, and that containment is impossible.
- **Open source maintainers, who are getting a growing number of security reports?** Attacks have been growing for forty years, and they grew more from 2000 to 2010 than now. Security has always been a business decision. Card networks accept a fraud rate because it's cheaper than eliminating it. AI drops the cost of attacking, and the math changes.
- **What about people who are just starting to code, with no experience?** The answer is the same as 20 years ago. Security lives in the architecture, not in one person's work. With more unreviewed code, more automated review and testing. "If you don't have real attacks in staging, you're testing in production."
- **How do agents in a swarm trust each other?** They don't, and that's a weapon. Plant a spy bot in the swarm. He said Todoist's CTO was dealing with credential stuffing, and the advice was to show fake data in the hijacked accounts, so the attacker got nothing back.

On the singularity, he said he doesn't know and believes more in a sequence of S-curves than in an exponential. His last message was for the next time someone says a model will escape an air gap by heating up the CPU. With today's technology, he said, you can contain models five orders of magnitude better than these labs did. He closed by saying "we are not going to judge whether this is super intelligence by the fact that the Spanish army is super incompetent."

<hr class="divider">

### Building AI people trust without giving away the product

*Afonso Oliveira, OliveGradient*

Afonso presented an AI journal that protects what users write while keeping the company's model weights and software private. He started by agreeing with Diogo that companies have plenty of security holes, and user data sits in them.

The idea came from his previous job. He worked in the AI department of a startup with a self-reflection chatbot, where people were supposed to write about how they felt. He asked the audience whether they would type that kind of thing into an app. In his spare time, he set out to build a journal with end-to-end encryption, in the style of Signal and Proton, and with AI features: talking about what you wrote, summarizing, tagging emotions, to find something from a year ago that resonates with how you feel today.

If everything is encrypted, where does the AI run? He compared two options:

- **On the device:** the user is protected, but the model and the harness, which the company spent a lot of engineering time on, are exposed.
- **In the cloud:** the company protects the model, but the user has to trust it with the most intimate data there is.

The third option he explored is trusted execution environments. Encrypted data goes to a confidential virtual machine where even the RAM is encrypted, and not even the server's owner can see what happens inside. The machine proves what it is running through attestation.

In the classic setup, the user can only verify the machine if the company shows everything, weights and harness included. The architecture he built splits the pieces:

<div class="overflow-x-auto">

| Piece | Visibility | Role |
| --- | --- | --- |
| Rust sandbox | public and verifiable | minimal environment, no network, no filesystem, limited memory |
| Weights and harness | closed | stored encrypted in Google Cloud Storage |
| Keys | key management service | only released to the confidential VM that passes attestation |

</div>

He used Google Cloud's Confidential Space. Before decrypting anything, the system asks: are you this machine? Are you running the launcher at the version I expect? Do you belong to this company? If the answers match, the VM decrypts the weights and the harness; only the sandbox that restricts execution is public. The app is live for anyone who wants to see it.

In the Q&A, someone suggested on-device models, like Apple's, would solve the problem. Afonso answered that running on the device doesn't work when protecting what you built is a requirement, because the model can be extracted by reverse engineering even when compiled. He also argued that data stored in plaintext is exposed if the company is breached, even if you trust the company.

<hr class="divider">

### Prevent supply chain attacks in coding agents

*Boda Zhao, YLD*

My notes on Boda's talk start in the middle, when he was already on the first of three layers of defense against supply chain attacks on coding agents: the model, the harness and the sandbox. His recommendation was to use all three together. His closing rule was to aim for coverage instead of perfection.

**Model.** He recommended picking, whenever possible, a smarter model or one specialized in security. Better models hallucinate less and run fewer dangerous commands by mistake. Security-specialized ones find and fix vulnerabilities on their own and can even split into red team and blue team.

**Harness**, in three stages:

1. **Good practices:** safer defaults in the agent's environment, like turning off package lifecycle scripts and enabling a cooldown period before adopting new versions. He maintains a GitHub repository on npm security, which you can also install as a skill.
2. **Planning:** assess dependencies before using them. This is where what he calls grayware comes in, packages that haven't been proven malicious but that you shouldn't trust.

   His examples were abandoned software, freshly published packages, slopsquatting (attackers test which package names models make up, register those names and wait for your agent to download them), libraries maintained entirely by AI with no human looking, and low-quality code. Grayware is exploding, he said, because authors and users stopped reviewing code.

   To evaluate dependencies, he pointed to scoring tools like Socket and OpenSSF Scorecard, which combine downloads, maintainer activity, license changes and other metrics into a score, plus a minimum policy. His example was a 0 to 100 score with a cutoff at 80; each tool has its own scale.
3. **Install:** a well-known package, like React or Express, can meet the reputation criteria and still have a compromised version. So right before installing, a scanner checks a real-time threat database and gives the final yes or no.

**Sandbox**, for when the first two layers fail. He recommended reading Simon Willison's "The Lethal Trifecta" on what to consider when choosing a sandbox for agents. He uses Docker Sandbox, because it's free, covers the points in the post and works without much setup.

<hr class="divider">

### Trust nothing, ship safely: surviving the supply chain attack era

*Nina Torgunakova, Evil Martians*

Nina opened with a list of recent npm supply chain attacks:

- **August 2025:** malicious Nx versions published from a compromised maintainer account, with more than 2,000 secrets exposed;
- **March 2026:** malicious versions of Axios, a library with more than 100 million downloads a month;
- **May 2026:** malicious versions published in just six minutes, in a routing package with more than 12 million downloads a week;
- **the month before the talk:** packages with more than 2 billion downloads a month hit.

More than 10,000 malicious packages showed up on npm in the last year. The attacks are more frequent and bigger, since one compromised account hits thousands of projects at once, and even GitHub was breached this year. Nina used these cases to argue for reviewing dependencies and the changes between versions.

She works at Evil Martians, a consultancy for developer tools and security startups, with open source projects that add up to more than 25 billion downloads. Her two rules:

1. **Use tools that reduce exposure:** npm 11 with safer defaults, Dependabot for known vulnerabilities, hardened CI runners to detect anomalies, dev containers to isolate installs from your machine. She recommended combining tools, because each one covers different risks.
2. **Stay alert:** she said we treat dependencies as free black boxes, and recommended fewer dependencies, smaller ones and more attention to the ones you keep.

She demoed Multiocular, Evil Martians' open source tool for seeing what changes between versions of a package. She picked a tiny event emitter, made by Evil Martians, and installed version 10.0.0: README, index and package.json, nothing suspicious. Then she played the hacker. She created a malicious version, 10.0.1, and published it to a local npm server ("I'm not a real hacker, I don't want to go to jail"), pointed the project at it and installed. Multiocular showed a new postinstall script, in a library that had no reason to have one.

Diffs can be huge, so she gave a list of red flags:

- a new pre- or post-install script, especially if it downloads and runs something else;
- code that turns into an unreadable blob;
- a jump in size that the changelog doesn't explain.

She said it's sometimes much harder than that, and asked the audience to get in the habit of asking, for every new or updated dependency, why they trust it.

In the Q&A, someone asked how to review indirect dependencies too, since you can pin your own dependencies' versions but not theirs. Multiocular shows direct and transitive dependencies, and she said that matters because most compromised packages come in as a dependency of something else.

<hr class="divider">

### Runtime Trust for AI: Building the Network That Verifies Autonomous Systems

*Artur Goulão, Humanos*

Every agent acts on a person's authority, Artur pointed out, whether it's moving money, shipping code or accessing medical records. His talk was about how to define what an agent can do and record who authorized each action. He said Humanos is already in production at more than 350 institutions, including healthcare companies and fintechs.

He split runtime trust into four questions:

1. was there a person who authorized it?
2. which agent received the authorization?
3. what was the scope of authority for that action, a phone call or an API call?
4. if something goes wrong, how do you verify?

Humanos answers them with a cryptographic protocol based on W3C Verifiable Credentials, version 2.0. The central piece is the mandate, the credential that says a person authorized an agent, a system or another person, with programmable rules, constraints and scope. Each agent has an identity, tied to the person or organization behind it. And each action generates a signed receipt. Referring to Diogo, the "pirate" who had spoken before him, he said you can't simply trust logs. Humanos uses signed records so the authorizations and actions can be verified. Everything goes into a ledger, including an agent joining the network, every authorization and every call.

The demo:

1. his agent, connected to the Humanos MCP and authorized within Artur's organization, requested a mandate;
2. Artur got a code by OTP and opened the request, with the rules and who was asking;
3. he approved, and the agent checked the mandate;
4. the agent posted a message to a channel in the company Slack;
5. the mandate was scoped to a single message, so the action ended there, with a signed log and an updated risk score for the agent.

That risk score becomes reputation inside the network. The official talk description gives a product example: AI insurers pricing policies based on these receipt chains instead of questionnaires.

Another problem is checking whether the permission shown to the person matches the action the code executes. A person approves permissions described in language, but what runs is code. Artur presented a decision language model, fast enough to authorize in real time, that compares the semantic permission the person saw with the permission the code actually uses.

<hr class="divider">

### Guardrailing your Agents with Types and Logic

*Alcides Fonseca, University of Lisbon*

Alcides, a professor at the University of Lisbon who works with startups and writes programming languages, closed the event by proposing the audience learn a new language in under five minutes. He started with a question: is anyone 100% sure their agent won't publish code from a private repository to a public repository or issue? Nobody raised a hand.

In his example, you ask the agent to read the latest issue on a public repository. The issue contains an attack telling the agent to grab the private content and publish it. The agent obeys without checking with you and creates a public issue with your code. The example combines access to private data, reading untrusted content and a way to send information out. Alcides related this combination to the lethal trifecta described by Simon Willison. He named Microsoft, WhatsApp and Claude Cowork as products that have already had problems like this. He said the current options don't solve it:

- **auto mode**, where the LLM itself decides when to ask for approval, is probabilistic and uses the same models, with the same biases. If you don't trust the agent, you shouldn't trust auto mode;
- **asking for approval on every action** doesn't either, because after the third time you approve without reading.

His proposal, along the lines of what Diogo argued earlier, is to use formal methods, which rely on deterministic verification and logic. He cited other similar paths, like a recent AWS launch and a language that Erik Meijer, known for his work on C#, is also working on to restrict what agents do.

His prototype builds on aeon, a language he created ("with 101 users: me and my 100 bots"). Instead of executing directly, the agent writes a plan in aeon, and the plan goes through the type checker before anything runs. If a step violates the constraints expressed in the types, the plan is rejected before execution. Even if the violation is in the tenth step, the first one doesn't run and no GitHub call happens. For that, the type system has to be strong. He compared it with Lean, the language OpenAI and Anthropic use in their math breakthroughs, which has dependent types. By comparison, aeon isn't as powerful, but it's much cheaper to use, because it doesn't require writing mathematical proofs.

Three features came up in the demo:

- **linear types:** the session has to be consumed exactly once. Using it twice is an error, and so is not using it. Rust's ownership system, he said, is only half a linear system. This stops the agent from grabbing an old version of the session and reusing it later;
- **liquid types:** you annotate the function with a logical constraint, like "absolute value returns an integer greater than or equal to zero", and the implementation has to meet the spec;
- **tainted sessions**, the core of the system:

<div class="overflow-x-auto">

| Action | Session state |
| --- | --- |
| New session | clean |
| Read from a public repository | unchanged |
| Read from a private repository | tainted |
| Write to a public repository | only with a clean session |

</div>

Under these rules, the plan that would leak the private code is rejected before it starts. Alcides said AI can also generate the annotations, and the checker verifies the plan against the constraints they express. He said they've applied the approach to drone software, finding bugs without running the code, to data science pipelines, to avoid data contamination, and to robotics software, where they found configuration errors, and now to safer sandboxes. Alcides has made the code public.

After him, the organizers thanked the speakers, sponsors, volunteers and staff, asked for feedback ("those who hate us and those who love us are both wrong, the truth is in the middle") and announced one last activity. David Gomes, who the year before had given one of the organizer's favorite talks and is now at SpaceXAI, would run a whiteboard system design session upstairs, no slides, for anyone who wanted to talk through their own side projects.

## What was left open

Duarte called for evaluations that show when a European Portuguese model is worth adopting. Simão discussed the risk of an agent changing the criteria used to evaluate its own work. Oğuz showed a different problem: evaluation scores can improve while the answers become less useful to customers.

On security, Diogo discussed isolation and access control. Alcides showed how to check a plan before execution. Artur presented scoped authorizations and signed records of actions. You can use all three together. Artur's mandate records who authorized an action but doesn't isolate the agent, and Alcides's checker only blocks what the constraints written in the types forbid.

## The venue

Lisbon AI took place at the Champalimaud Centre, on the banks of the Tagus, in Belém. Between talks, I kept taking photos of the building, the river and the sunset.

<div class="photo-stack">
<button type="button" class="photo-stack-trigger" commandfor="lisbon-gallery" command="show-modal">
<img src="/images/blog/lisbon-ai-2026/lugar-janela-oval-thumb.webp" alt="" width="480" height="640" loading="lazy" decoding="async">
<img src="/images/blog/lisbon-ai-2026/lugar-monolitos-noite-thumb.webp" alt="" width="480" height="640" loading="lazy" decoding="async">
<img src="/images/blog/lisbon-ai-2026/lugar-fachada-thumb.webp" alt="" width="640" height="480" loading="lazy" decoding="async">
<img src="/images/blog/lisbon-ai-2026/lugar-por-do-sol-espelho-thumb.webp" alt="" width="640" height="480" loading="lazy" decoding="async">
<img src="/images/blog/lisbon-ai-2026/lugar-por-do-sol-thumb.webp" alt="" width="640" height="480" loading="lazy" decoding="async">
<span class="photo-stack-label">See all 13 photos</span>
</button>
</div>
<dialog id="lisbon-gallery" class="gallery" closedby="any" aria-label="Photos of the Champalimaud Centre">
<div class="gallery-track" tabindex="0" autofocus data-prev="Previous photo" data-next="Next photo">
<figure class="gallery-slide"><img src="/images/blog/lisbon-ai-2026/lugar-fachada.webp" alt="Curved facade of the Champalimaud Centre under a blue sky, with a glass walkway coming out of the building and the sun overhead." width="1600" height="1200" loading="lazy" decoding="async"><figcaption>1/13 · Arriving on the morning of the first day: the Champalimaud Centre facade.</figcaption></figure>
<figure class="gallery-slide"><img src="/images/blog/lisbon-ai-2026/lugar-totem.webp" alt="Dark totem at the entrance with the text LISBON AI [for builders] and sponsor logos." width="1200" height="1600" loading="lazy" decoding="async"><figcaption>2/13 · The event totem at the entrance.</figcaption></figure>
<figure class="gallery-slide"><img src="/images/blog/lisbon-ai-2026/lugar-auditorio.webp" alt="Nearly full tiered auditorium, with a large oval window on the left and the stage at the back." width="1600" height="1200" loading="lazy" decoding="async"><figcaption>3/13 · The auditorium minutes before the opening.</figcaption></figure>
<figure class="gallery-slide"><img src="/images/blog/lisbon-ai-2026/lugar-janela-oval-auditorio.webp" alt="Dark, empty auditorium, with light coming through the oval window and the silhouette of a person walking down the stairs." width="1200" height="1600" loading="lazy" decoding="async"><figcaption>4/13 · The auditorium during the morning break. The window faces the Tagus.</figcaption></figure>
<figure class="gallery-slide"><img src="/images/blog/lisbon-ai-2026/lugar-arco-fachada.webp" alt="Curved white wall with huge round windows, against a deep blue sky." width="1200" height="1600" loading="lazy" decoding="async"><figcaption>5/13 · The facade's round windows, at lunchtime.</figcaption></figure>
<figure class="gallery-slide"><img src="/images/blog/lisbon-ai-2026/lugar-terraco-almoco.webp" alt="Terrace with umbrellas and tables full of people, with the river in the background." width="1200" height="1600" loading="lazy" decoding="async"><figcaption>6/13 · Lunch on the terrace, facing the river.</figcaption></figure>
<figure class="gallery-slide"><img src="/images/blog/lisbon-ai-2026/lugar-espelho-dagua.webp" alt="Shallow reflecting pool in the foreground that seems to run into the river, under a clear sky." width="1600" height="900" loading="lazy" decoding="async"><figcaption>7/13 · The reflecting pool that seems to run into the Tagus.</figcaption></figure>
<figure class="gallery-slide"><img src="/images/blog/lisbon-ai-2026/lugar-janela-oval.webp" alt="The oval window seen from inside the dark auditorium, framing trees and blue sky." width="1200" height="1600" loading="lazy" decoding="async"><figcaption>8/13 · The same window from inside, late in the afternoon.</figcaption></figure>
<figure class="gallery-slide"><img src="/images/blog/lisbon-ai-2026/lugar-por-do-sol.webp" alt="Sunset over the river, reflected in the pool, with the dark edge of the building on the right." width="1600" height="1200" loading="lazy" decoding="async"><figcaption>9/13 · Sunset on the first day, from the edge of the reflecting pool.</figcaption></figure>
<figure class="gallery-slide"><img src="/images/blog/lisbon-ai-2026/lugar-por-do-sol-espelho.webp" alt="The low sun over the river and its reflection in the still water of the pool." width="1600" height="1200" loading="lazy" decoding="async"><figcaption>10/13 · Another photo of the sunset.</figcaption></figure>
<figure class="gallery-slide"><img src="/images/blog/lisbon-ai-2026/lugar-monolitos-silhueta.webp" alt="Two tall monoliths in silhouette against the sun setting over the river." width="1600" height="1200" loading="lazy" decoding="async"><figcaption>11/13 · The two stone monoliths by the river, against the sun.</figcaption></figure>
<figure class="gallery-slide"><img src="/images/blog/lisbon-ai-2026/lugar-monolitos-noite.webp" alt="The two monoliths lit from below, with the orange and blue dusk sky behind them." width="1200" height="1600" loading="lazy" decoding="async"><figcaption>12/13 · The same monoliths, lit up, after dark.</figcaption></figure>
<figure class="gallery-slide"><img src="/images/blog/lisbon-ai-2026/lugar-almoco.webp" alt="Plate of salad with chickpeas, tomato and cheese on a white table, next to a glass of soda." width="1200" height="1600" loading="lazy" decoding="async"><figcaption>13/13 · Lunch on the second day.</figcaption></figure>
</div>
<button type="button" class="gallery-close" commandfor="lisbon-gallery" command="close" aria-label="Close gallery"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"></path></svg></button>
</dialog>

