---
title: 'Lisbon AI 2026: agents, evals and security'
date: 2026-09-25
description: 'Two days of Lisbon AI 2026: what kept coming up across the talks, and all 32 in detail, with demos and audience questions.'
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

On September 23 and 24 I went to [Lisbon AI](https://lisbonai.org/), at the Champalimaud Centre in Belém. It is the second edition of a conference for people who build with AI. Day one covered models, agents and evals. Day two, applied AI and security.

This post is based on my notes from the 32 talks and the photos and videos I took, with names checked against the [speakers page](https://lisbonai.org/speakers/). First come the ideas that showed up across several talks, then each talk in detail, with the examples, the demos and the audience questions. There are 32 sections, so use the index to jump to the ones you care about.

Few people argued about which model is best. Even in the model talks, the conversation kept landing on where to run it, how to measure it and what to let the agent do.

## What connected the talks

Near the end of day one, almost every evals talk showed an agent that looked right and wasn't. [Will Burstein](#will-burstein-promptlayer) showed a correct refusal that hid a forbidden lookup. [Oğuz Gültepe](#oğuz-gültepe-peec-ai) watched an optimizer hit the metric and miss the goal. [Yomi Eluwande](#yomi-eluwande-dash0) started with 66 performance ideas and ended with one PR holding two changes. [Simão Nogueira](#simão-nogueira-noticed) wants evals the agent itself can't loosen.

Several talks showed that an agent's behavior depends on what surrounds the model. [Sergio Paniego](#sergio-paniego-hugging-face) trained a model inside a harness he didn't write. [Matt Carey](#matt-carey-cloudflare) split an agent into five pieces, and only one of them is the model in a loop. [Vitalii Ratushnyi](#vitalii-ratushnyi-harmixai) treated memory as versioned files. [Thom Jenkins](#thom-jenkins-petsapp) changed an agent's behavior just by reordering the blocks of its prompt.

When writing code gets cheap, deciding what not to build becomes the job. [Cloudflare](#cloudflare) redesigned its platform around what comes after the code. [Aayush Kapoor](#aayush-kapoor-vercel) showed an internal tool that was abandoned because maintaining it ate the product's time. [Luis Monteiro](#luis-monteiro-pixelmatters) and [Steve Ruiz](#steve-ruiz-tldraw) said the same thing: someone sets taste and rules before letting the agents loose. At [QuiverAI](#joan-rodriguez-quiverai), designers calibrate the model's verifier.

The security block that closed the event never asked anyone to trust a model. [Diogo Mónica](#diogo-mónica-anchorage-and-haun-ventures) wants deterministic access control, off the model's path. [Boda Zhao](#boda-zhao-yld) and [Nina Torgunakova](#nina-torgunakova-evil-martians) treat every dependency as a suspect. [Artur Goulão](#artur-goulão-humanos) gives the agent permission for a single action. [Alcides Fonseca](#alcides-fonseca-university-of-lisbon) rejects the plan before it runs.

## Index

[Day 1, September 23](#day-1-september-23): [Prince Canuma](#prince-canuma-neywa-labs) · [Joan Rodriguez](#joan-rodriguez-quiverai) · [Chema Garabito](#chema-garabito-sperid-labs) · [Duarte Carmo](#duarte-carmo) · [Sergio Paniego](#sergio-paniego-hugging-face) · [Bojan Jakimovski](#bojan-jakimovski-loka) · [Matt Carey](#matt-carey-cloudflare) · [Harshil Agrawal](#harshil-agrawal-cloudflare) · [Marcelo Lebre](#marcelo-lebre-remote) · [Vitalii Ratushnyi](#vitalii-ratushnyi-harmixai) · [Peter Kirkham](#peter-kirkham-posthog) · [Pedro Rodrigues](#pedro-rodrigues-supabase) · [Will Burstein](#will-burstein-promptlayer) · [Thom Jenkins](#thom-jenkins-petsapp) · [Oğuz Gültepe](#oğuz-gültepe-peec-ai) · [Yomi Eluwande](#yomi-eluwande-dash0) · [Simão Nogueira](#simão-nogueira-noticed)

[Day 2, September 24](#day-2-september-24): [Cloudflare](#cloudflare) · [Steve Ruiz](#steve-ruiz-tldraw) · [Daniel Bukac](#daniel-bukac-duvo) · [Francisco Leal](#francisco-leal-ub-robotics) · [Cristiana Carpinteiro](#cristiana-carpinteiro-loka) · [Lukas Wirth](#lukas-wirth-zed) · [Aayush Kapoor](#aayush-kapoor-vercel) · [Luis Monteiro](#luis-monteiro-pixelmatters) · [CNCA and BSC AI Factory](#cnca-and-bsc-ai-factory) · [Diogo Mónica](#diogo-mónica-anchorage-and-haun-ventures) · [Afonso Oliveira](#afonso-oliveira-olivegradient) · [Boda Zhao](#boda-zhao-yld) · [Nina Torgunakova](#nina-torgunakova-evil-martians) · [Artur Goulão](#artur-goulão-humanos) · [Alcides Fonseca](#alcides-fonseca-university-of-lisbon)

## Day 1: September 23

### Prince Canuma, Neywa Labs

Prince opened the technical part arguing that the computer you already own can run most of what people pay to run in the cloud today. What's missing is inference engineering, and he has spent the last three years doing that engineering for Apple Silicon.

He is from Mozambique, lived in India and arrived in Poland in 2022, in the middle of the ChatGPT boom. The math didn't work: in countries like India and Mozambique, few people can pay for a monthly AI subscription. Apple Silicon, to him, is the largest distributed compute base in the world, and it has been AI-ready since the M1. What was missing was an engine to run models on it.

The physical limit is memory. On a Mac, the CPU, GPU and Neural Engine share the same memory, and it doesn't grow after you buy the machine. Generation speed fits in one equation: memory bandwidth divided by bytes per token. With that equation you can predict how any new Mac will perform, and the rest of the talk was about shrinking the denominator. He showed three levers.

The first is quantizing the weights. For an 8B model, the numbers in the talk were these:

<div class="overflow-x-auto">

| Precision | Approximate size | Note |
| --- | ---: | --- |
| bf16 | 16 GB | quality reference |
| 8 bits | 8 GB | nearly lossless |
| 4 bits | 4.5 GB | where most local inference runs |
| 2–3 bits | 3 GB | quality drops |

</div>

Mixed quantization scans the model and keeps more precision in the sensitive layers. In a mixture-of-experts, the router and each expert can have different precisions. Prince pointed out that quantizing alone doesn't make a model faster: what changes is that the model fits in memory, and any speed gain depends on the machine's bandwidth. In an audience question he was more conservative than the table: without a calibration dataset, 4 bits is the threshold he avoids, and he prefers 5, 6 or 8. With mixed precision and good calibration data, you can go lower.

The second lever is the KV cache, the memory the model uses to hold its context. When Google published a method to quantize it almost losslessly, Prince implemented it at 2 a.m., posted it the next day, and the post got close to a million views. With a quantized cache, a million-token context fits on a 16 GB MacBook, depending on the model's size. His engine, mlx-vlm, ships with it on.

<figure>
  <a href="/images/blog/lisbon-ai-2026/kv-cache-quantizacao.webp"><img src="/images/blog/lisbon-ai-2026/kv-cache-quantizacao.webp" srcset="/images/blog/lisbon-ai-2026/kv-cache-quantizacao-640.webp 640w, /images/blog/lisbon-ai-2026/kv-cache-quantizacao-1024.webp 1024w, /images/blog/lisbon-ai-2026/kv-cache-quantizacao.webp 1600w" sizes="(max-width: 719px) calc(100vw - 4rem), 655px" alt="Dark slide titled 'Lever 1b · KV cache quantization', with the KV cache size formula and a list about a 4-bit cache on the server." width="1600" height="1042" loading="lazy" decoding="async"></a>
  <figcaption>Gemma 4 31B at 256K tokens of context: 22.31 GB of bf16 KV cache against 18.41 GB of 4-bit weights. At long context, the cache outweighs the model.</figcaption>
</figure>

The third is speculative decoding: a small model or an adapter guesses several tokens ahead, and the big model only checks them. MTP, which new models already ship with, predicts 3 to 6 tokens and doubles the speed. DFlash, based on diffusion, predicts up to 8 at once and gets 3 or 4 times faster, but when Prince tried it, it only worked well for code. On an M3 Ultra, a Gemma model went from 30 to 43 tokens per second with MTP. Mixture-of-experts models gain almost nothing from the technique.

mlx-vlm started with vision models and now takes and produces any modality: image, video, text and audio. A vision model has three parts (an image encoder, a projector and the language model), and Prince optimized precisely the part almost nobody benchmarks. As a result, a MacBook processes 100 images in parallel with a small model, and some models read images of up to 8K.

His sharpest criticism was aimed at inference engines built for a single model, with hand-written kernels to make one specific model ten times faster. The gain doesn't carry over to another model or another piece of hardware, and his users switch models every two or three weeks. One of those engines, he said, was only 1.3 times faster, and mlx-vlm was one PR away from matching it.

The demo was Nativ, an app built on the engine. Prince turned off the Wi-Fi, said "Hey Native", spoke a sentence, and the app transcribed it and answered with a local model. Then he dictated a tweet straight into the browser and told Codex to list files, all offline. In one month of using dictation, he transcribed more than 490,000 words. By his count, it saved him about 127 hours, and the same usage in the cloud would have cost between US$200 and almost US$500.

According to Prince, the engine has passed 7.5 million downloads. Neywa Labs works with Cohere, Google DeepMind, Baidu and Liquid AI to have open models optimized for Apple Silicon on launch day. On an M5 Max with 48 GB, one of those models runs with 256K tokens of context. On a Mac Studio, the engine serves 16 sessions in parallel with 32K tokens each, enough for 16 agents or 16 people on a single machine.

Prince closed by saying that intelligence per watt has gone up over the last three years, that the best open models are close to the closed ones and that, by his estimate, 70 to 90% of today's use cases already run on your local machine.

<hr class="divider">

### Joan Rodriguez, QuiverAI

Joan wants models to draw like designers: files you can edit, not just images that look right. That's what QuiverAI trains, models that generate SVG.

SVG describes an image as code. A rectangle, a circle and a polygon become a few lines that scale to any size and can be changed later. Three or four years ago, Joan asked himself whether an LLM could produce a good SVG. The tools of the time, like Illustrator's vectorization, didn't get there.

A good SVG, for him, has two dimensions. The first is structure. Joan showed two drawings of the same bridge that looked identical on screen. One was a single path, which you can't do anything with. The other was split into groups, so you could select and move just the main tower, the way a designer would build it. The second dimension is style, or taste.

The method comes from two papers from his PhD:

- **StarVector:** when you send an image to ChatGPT, it gets broken into patches, and each patch becomes a token. Joan downloaded millions of SVGs, rendered each one, and trained the model to go from the image tokens to the code. That teaches the model SVG syntax.
- **RLRF (reinforcement learning from rendering feedback):** a model that only knows the syntax draws badly. So it generates many apples, each one is rendered and compared with the original on pixel similarity and code efficiency, and the model learns from the score. At the start of training, the apple looked like "a monster". By the end, it was an apple.

The first demo he posted, the model vectorizing a molecule live, went viral. That's when he saw there was a market. Today QuiverAI's model is called Arrow, and the launch video for version 2.0 talks about five times the speed. It went from simple emojis to detailed illustrations.

<figure>
  <a href="/images/blog/lisbon-ai-2026/quiverai-anatomia-svg.webp"><img src="/images/blog/lisbon-ai-2026/quiverai-anatomia-svg.webp" srcset="/images/blog/lisbon-ai-2026/quiverai-anatomia-svg-640.webp 640w, /images/blog/lisbon-ai-2026/quiverai-anatomia-svg-1024.webp 1024w, /images/blog/lisbon-ai-2026/quiverai-anatomia-svg.webp 1600w" sizes="(max-width: 719px) calc(100vw - 4rem), 655px" alt="Slide with three anatomical drawings in black line art with muscles in red (shoulder, thigh and calves), above a QuiverAI prompt box. The speaker stands at the lectern on the right." width="1600" height="1184" loading="lazy" decoding="async"></a>
  <figcaption>Anatomical illustrations generated by Arrow 2, QuiverAI's model, from a one-line prompt. Joan used the example to talk about technical fields like biomedicine.</figcaption>
</figure>

One important use is vectorizing logos, where the curve control points have to sit in exactly the right place. Another showed up without them looking for it. Friends and other startups suggested trying fashion, and today QuiverAI works with garment makers. The sketch of a jacket that goes to the factory needs a clean outline, and a designer used to spend 20 to 30 minutes per sketch in Illustrator or Figma. With a deadline tomorrow and hundreds of pieces, the model does the outline and the designer becomes the director.

For Joan, taste is selection: choosing the color, spacing, shape, font and placement. Some people have no taste at all, he said, including engineers who train the model. The fix was to put designers, like Peter, who was in the audience, in direct contact with the people training, annotating what works and what doesn't and calibrating the verifiers. And taste changes over time, so the human stays in the loop.

In the Q&A:

- **Other uses?** Embroidery, CAD, automotive parts and diagrams. Every diagram in the presentation was made with QuiverAI.
- **How do you put into words what you see?** Today, power users send references from sites with good logos, or ask ChatGPT to describe a design and paste that description as the prompt. Internally, the model expands vague prompts like "a logo for my coffee shop, I like surfing", making the taste decisions on its own.

<hr class="divider">

### Chema Garabito, Sperid Labs

Chema thinks AI will only understand the physical world once it can generate 3D, the same way LLMs came to understand language by generating text. Sperid Labs, which he founded, researches spatial intelligence with a bigger goal: visual general intelligence.

He comes from the hacking world: he speaks at security conferences, went through Telefónica and has contributed to the Linux kernel. He asked who knew what a world model was, and almost nobody raised a hand. His argument starts with us: humans are agents in a 3D world and learn by seeing, not by reading. LLMs handle almost everything that is language, and even GPT-6 Astra, which he cited as the first to show some grasp of 3D, is still far from enough.

Today the problem splits into three layers, each solved by a different kind of model:

- **Understanding:** computer vision, fragmented into a model per task (object detection, reconstruction, prediction). According to him, humanoid robot systems like Tesla's use more than 40 different vision models, while a text agent uses one. These models need labeled data, don't scale to the internet, and only predict, they don't generate. In the demo, a Sperid reconstruction model turned photos of a house into a 3D map, with black holes where no photo had reached. It understands the geometry but doesn't imagine what's missing, and a robot needs to imagine.
- **Appearance:** video models like Genie and Runway, which you steer with the W, A, S, D keys. They understand some dynamics, but they output 2D pixels, and video games, visual effects and robotics need 3D.
- **Structure:** diffusion models trained on 3D files, which generate objects. The problem is data: the internet has billions of images and videos, but only a few million 3D files.

<figure>
  <a href="/images/blog/lisbon-ai-2026/world-model-tres-camadas.webp"><img src="/images/blog/lisbon-ai-2026/world-model-tres-camadas.webp" srcset="/images/blog/lisbon-ai-2026/world-model-tres-camadas-640.webp 640w, /images/blog/lisbon-ai-2026/world-model-tres-camadas-1024.webp 1024w, /images/blog/lisbon-ai-2026/world-model-tres-camadas.webp 1600w" sizes="(max-width: 719px) calc(100vw - 4rem), 655px" alt="Light slide with three columns, Understanding, Appearance and Structure, each with an example image. The speaker stands in the lower right corner of the stage." width="1600" height="1234" loading="lazy" decoding="async"></a>
  <figcaption>Understanding, appearance and structure: the three layers that, for Chema, are still solved by different models.</figcaption>
</figure>

Mundus, Sperid's model, joins the three layers and unifies six computer vision problems in one model. It takes a few photos, a panorama, a video or a text prompt, and returns a structured 3D scene that opens straight in a game engine. Chema argued for training this kind of model on images and videos from the web, rather than relying only on the few 3D files that exist.

The demos were live. Chema spent the two days before distilling the model so it would run fast enough on stage. From a few perspective photos, Mundus generated a 3D world, filling in what the photos didn't show, and each run came out slightly different. In a scene of a reconstructed house, he emptied the room, picked up a ceramic vase, dropped it on the floor, resized it and moved it around, without opening any 3D engine. The model also understands what it generates: you can search for objects in the scene with text, which is useful for automatically labeling data captured in the real world.

The uses he listed: real estate (today, to scan a house, you pay someone with a Matterport camera; with Mundus, a few phone photos are enough), video games, visual effects, digital twins and robot training. The company started out doing reconstruction for virtual reality.

In a question about distillation, Chema explained that the full model needs data-center GPUs, and nobody will adopt what they can't run. That's why the team is working on a distilled version for an RTX 5090, and plans to open-source part of the model. Mundus hasn't been published yet, and the metrics will come with the launch.

<hr class="divider">

### Duarte Carmo

Duarte opened by talking about his grandmother, a geologist. Whenever they travel through the north of Portugal, she unfolds the paper map, even with Google Maps in her pocket, and points: there's a village here, a river there, no point going this way. The talk, he said, would be that: a map of everything that exists around European Portuguese LLMs, with more questions than answers.

The idea came up at a birthday party near the Tagus, where someone said they were working on a European Portuguese LLM for the government. Duarte thought that was great and was left with a doubt: what for? To speak better, to know more about the culture, to know trivia about the north? That led to the question behind everything: what makes a good European Portuguese LLM?

First, measure. Duarte lives in Copenhagen, two blocks from the person who maintains EuroEval, a project that measures models in European languages. He sent pull requests with European Portuguese datasets: sentiment classification, grammar, reading comprehension. On the leaderboard, Qwen dominated, and Amália, the government-backed model, ranked below models smaller than itself.

Then, data. Hugging Face had published FineWeb2, 20 TB of multilingual text. Duarte built Bagaço, named after the Portuguese grape brandy, in three versions:

1. **v1:** took only pages from `.pt` domains and classified each by educational score (a Wikipedia page is worth more than a sports paper) and by category. It came to about 10 billion tokens.
2. **v2:** he needed to separate Portuguese from Portugal from Brazilian Portuguese. The academic classifier was good, but far too slow for terabytes of text, so Duarte built his own:

<div class="overflow-x-auto">

| Classifier | Rows per second | Size |
| --- | ---: | ---: |
| Academic | ~100 | ~2 GB |
| Duarte's | ~10,000 | 65 MB, runs in the browser |

</div>

With it, the dataset doubled to 21.3 billion tokens and started including sites with a high educational score that don't end in `.pt`, like Khan Academy and Mozilla.

3. **v3:** added FinePDFs and FineWiki for more quality text. In the talk he said 30 billion tokens; on the slide, 29. The share with a high educational score rose to about 40%. Version 4 is in progress.

<figure>
  <a href="/images/blog/lisbon-ai-2026/bagaco-v3.webp"><img src="/images/blog/lisbon-ai-2026/bagaco-v3.webp" srcset="/images/blog/lisbon-ai-2026/bagaco-v3-640.webp 640w, /images/blog/lisbon-ai-2026/bagaco-v3-1024.webp 1024w, /images/blog/lisbon-ai-2026/bagaco-v3.webp 1600w" sizes="(max-width: 719px) calc(100vw - 4rem), 655px" alt="Slide titled 'Bagaço v3 the latest version', with a table comparing versions 1, 2 and 3 and bar charts by category. Duarte speaks at the lectern on the right." width="1600" height="952" loading="lazy" decoding="async"></a>
  <figcaption>Bagaço v3: 29 billion tokens of Portuguese, 37% more than version 2, after adding FinePDFs and FineWiki.</figcaption>
</figure>

About Amália, Duarte wrote a post showing the good side and the bad. The bad: the model wasn't trained from scratch, it's a continued pre-training of EuroLLM, and only 5.8 billion tokens, about 5% of the pre-training, were European Portuguese. The good, which almost nobody noticed amid the criticism: the team published evaluations that didn't exist before, like the national high school exams in geography, history and math. Now you can measure.

With those evaluations, he created PT Core, a single score inspired by Karpathy's nanochat, and trained several small models to compare. Bigger models scored higher. What stood out was data quality: keeping only texts with an educational score of 2 or more gave a PT Core of 12.8, about ten times higher than the other configurations. The problem is that this filter keeps only about 20% of Bagaço.

Compared with Amália, which has 9B parameters, models half or a quarter its size did better on the Portuguese exams. Duarte warned that the chart is a bit misleading: the winners are reasoning models, which spend far more tokens per answer, and Amália wasn't trained to reason.

What he knows so far:

- **Data isn't the bottleneck.** He got to 30 billion tokens without much effort, 50 billion is feasible, and synthetic data can fill the rest.
- **The question that matters is a different one:** what would make a company adopt a Portuguese model instead of Qwen or GPT? Today, he'd pick Qwen himself. Duarte challenged the audience to build benchmarks that answer that.
- **Bigger isn't the way.** An "Amália 60B" is less interesting than a small, better model.
- **Reasoning** should be part of a good model.

In the Q&A, he said he paid for everything out of his own pocket. Filtering Bagaço runs in a few days on a server rented in Germany for €30 a month, and the only help was a GPU lent by one of the event's organizers for a week. He talks with the Amália team, but did this work alone. Angolan and Mozambican Portuguese aren't covered yet: in the big web datasets, they show up so rarely that they're treated as low-resource languages, and someone should take that on. Audio was left out too, for lack of time.

<hr class="divider">

### Sergio Paniego, Hugging Face

Sergio wanted to know whether open tools can do what the labs do with their coding agents: train the model inside the harness. In a few months, he said, we went from writing code to using agents, and an agent is always a harness (Claude Code, OpenCode, Codex) plus a model. The frontier model reports show they're trained in reinforcement learning environments built with those harnesses.

His stack combined Hugging Face training and infrastructure tools with OpenCode in a Docker container:

- **TRL**, the training library, with the asynchronous version of GRPO;
- **OpenEnv**, a standard for training environments that Hugging Face develops with Meta, Reflection and other labs;
- a small open model and a set of coding problems, each with a description, input/output examples, visible tests and hidden tests;
- **OpenCode** as the harness, inside a Docker container;
- **HF Jobs** and **HF Sandboxes** for the GPU and to isolate each run.

The hard part is that normal reinforcement learning is a "white box": the trainer controls every step. A harness is a black box that does things on its own. When you open a conversation, it calls the model to generate a title, then summarizes, sometimes creates sub-agents. The fix was to put a capture proxy between OpenCode and the model, speaking the same dialect as both. OpenCode doesn't know the proxy exists, and the proxy records every token the trainer needs.

Then comes the cleanup. On one task, the proxy captures, say, four calls: the title one, a file write, a bash run and one more that doesn't matter. Training throws out the generic call and masks all the harness context (instructions, history, the system prompt). Only what the model generated to solve the problem goes into training.

The reward added up two signals:

1. whether the model tested its own code against the visible tests, running the examples in bash;
2. whether it passed the hidden tests.

For the demo, Sergio trained 10 steps on two H100s, one for the trainer and another to generate the answers, with 8 runs per step, each in its own CPU-only sandbox. The reward went up and hit 1 at step ten. He himself warned the model might be "faking it": problem difficulty wasn't controlled, and the model may already have solved some of them. It needs more training. What was proven is that the pipeline works.

The underlying idea is that, for a specific task, a small model trained inside a harness can do the work of a frontier model. The next step, nearly ready the week of the talk, was training across several harnesses at once, the way the labs do. Sergio's hypothesis: when you use Codex with a GPT, the result is better partly because both come from the same company and were trained together. The code is all open, with examples in the TRL repository.

<hr class="divider">

### Bojan Jakimovski, Loka

Bojan gave a lightning talk with one principle: AI for science can't be a black box. The big labs have scientific models, but you can't inspect how they reach each conclusion. Loka, with Arcee AI and AWS, built the opposite: an open AI scientist that runs on a laptop.

The model is Arcee's Trinity Mini: 26B parameters in a mixture-of-experts, with about 3B active per token. It's big enough for long multi-step reasoning and small enough to train and run on anything from a laptop to a cluster with one or two GPUs. In the demo, a complex prompt triggered sub-agents to search the literature, create molecules and simulate protein binding, and every step was visible.

Training taught the same model two modes, each with its own environment, built with Prime Intellect's verifiers:

- **investigate:** given a question, pick the right tools and extract the evidence; the reward looks at which tools were called;
- **conclude:** given a protein or a hard problem, reason and answer in a structured way, with sources.

They used GRPO combined with autoresearch, which is rare at this stage of training (autoresearch usually stays in pre-training), and optimized the environment prompts with GEPA. For Bojan, research is a state machine, not a clever prompt. After one round, the model reached 81.2% on a healthcare tool-use evaluation and 86.3 on a protein reasoning test, after a hundred steps. They're different evaluations and don't compare.

The model alone isn't enough. The harness has an orchestrator agent, tools for literature review, life-science databases and protein-molecule binding, and a critic agent, because in science you want someone on the other side checking. For Bojan, the AI scientist is the whole system: data, environments, model and harness. Everything is open, and the next version was already training with AWS and Arcee.

<hr class="divider">

### Matt Carey, Cloudflare

Matt opened the agents block with an infrastructure question: what happens when everyone, not only people who code, has an agent running all the time? His answer is that containers can't handle that scale, and isolates can.

He works on agents and MCP on Cloudflare's research team and has lived in Lisbon for a few months. He said he sees three waves of agents:

1. chatbots, like ChatGPT;
2. coding agents, the first to find a real market;
3. agents as infrastructure: small, spread across the internet, waking up when needed, checking your calendar and email, making payments and continuing to work with the app closed.

The third wave is the one he cares about, when his mother and cousins, who aren't in tech, start using them, because that changes the infrastructure. An app you ship once and millions of people use the same version. An agent needs its own memory and compute for each person. With 100 customers, one container each works. With 10,000, 100,000, or at Cloudflare's scale, billions, the per-container cost doesn't add up.

Cloudflare's bet, made before agents existed, is isolates, the same V8 technology browsers use. They come in two forms:

- **Workers:** stateless, for request-response APIs. They spin up when needed and scale to billions of requests.
- **Durable Objects:** stateful. They keep state between requests, have built-in SQLite, accept WebSockets for several people in the same session, talk to other services without going over the public internet and can be woken up by alarms, like a calendar for the agent.

<figure>
  <a href="/images/blog/lisbon-ai-2026/pecas-de-um-agente.webp"><img src="/images/blog/lisbon-ai-2026/pecas-de-um-agente.webp" srcset="/images/blog/lisbon-ai-2026/pecas-de-um-agente-640.webp 640w, /images/blog/lisbon-ai-2026/pecas-de-um-agente-1024.webp 1024w, /images/blog/lisbon-ai-2026/pecas-de-um-agente.webp 1600w" sizes="(max-width: 719px) calc(100vw - 4rem), 655px" alt="Light slide titled 'Pieces of an agent' with five cards side by side: Harness, Filesystem, Bash, Browser and MCP." width="1600" height="1258" loading="lazy" decoding="async"></a>
  <figcaption>The five pieces of an agent in Cloudflare's version: the loop, the files, execution, browsing and external tools.</figcaption>
</figure>

Matt split an agent into five pieces and mapped each to a Cloudflare primitive:

- **harness**, the model in a loop calling tools: runs in a Durable Object;
- **filesystem** and **bash**: modern models are trained to work with files through the terminal, and Cloudflare Computer offers both in the cloud;
- **browser**: running Chromium in containers has always been expensive, and Cloudflare's Lisbon office built a browser that runs inside isolates, cheap enough to scale with everything else;
- **MCP**, to call external tools like HubSpot, Salesforce, Gmail or Apple Notes.

The slides were a React app running on Workers, with the demos inside. He built the agent up live:

1. An agent in a Durable Object with two toy tools, greeting and rolling dice. Several people could connect to the same session.
2. The same agent with a workspace: it created a file of things to do in Lisbon, counted the words with bash and edited the file. Matt reloaded the page and everything was there, because it runs in the cloud, not on his laptop.
3. With a browser: it visited the Lisbon AI site, wrote a summary and took a screenshot. Instead of fixed tools like "click" or "take screenshot", he prefers to let the model write code against the browser API. Then he showed you can lock the browser down: his personal site was blocked, and example.com went through.
4. With MCP: he connected Cloudflare's own MCP and asked it to deploy a site from inside the slides. It failed twice calling the endpoints ("good demo effect"), worked on the third try, and the model even checked the address with curl before saying it was done. Matt said that check usually goes wrong, because DNS takes time to propagate and the model falls down a hole trying to figure out why the site isn't there. This time, it was.

In the one remaining question, someone asked whether websites and CMSs survive the agent era. Matt said he doesn't know. He sees APIs standardizing around something like MCP, but people will still want something to look at.

<hr class="divider">

### Harshil Agrawal, Cloudflare

Harshil gave the production version of Matt's talk: how he took PromptMotion, a prompt-driven video editor, out of a container and spread it across Cloudflare's primitives. The demo was the Lisbon AI speaker poster, animated. In the first version, the Cloudflare logo came out wrong and his photo was faded. He sent the right logo and asked for more opacity on the photo, and the agent redid the video.

In the old version, everything happened in a container: the agent wrote the files, the preview ran there, rendering too, and the history died when the container was unloaded. Harshil walked through three problems and how he solved each:

<div class="overflow-x-auto">

| | Before | After |
| --- | --- | --- |
| Preview | build, dev server and expose the container before the user saw anything | the code runs in a Dynamic Worker and the preview shows up almost instantly |
| Files | inside the container | virtual filesystem in a Durable Object, which outlives the container and the Worker |
| History | tarball in R2; going back to a version meant downloading, unpacking and rebuilding | one commit per generation, with git at the edge (Artifacts) |
| Final render | container | container, which now receives the synced files |

</div>

Along the way, he swapped the video generator for Hyperframes, which works with any coding agent. History became git for a simple reason: the agent already knew how to use git.

The last step was putting it all together. "I'm a lazy developer in the age of AI," he said, and he didn't want to write the glue between the pieces. Cloudflare Computer does that: one workspace, two backends (one for the preview, another for rendering) and the filesystem synced between them. To export, you just run the command that generates the video. The harness is Cloudflare's own opinionated harness, built on top of Pi.

<hr class="divider">

### Marcelo Lebre, Remote

Marcelo called his talk a report on his own "AI psychosis": half stubbornness, half hallucination. He built Icarus, an internal harness that gives any Remote employee, coder or not, the same agents he uses.

<figure>
  <a href="/images/blog/lisbon-ai-2026/remote-numeros.webp"><img src="/images/blog/lisbon-ai-2026/remote-numeros.webp" srcset="/images/blog/lisbon-ai-2026/remote-numeros-640.webp 640w, /images/blog/lisbon-ai-2026/remote-numeros-1024.webp 1024w, /images/blog/lisbon-ai-2026/remote-numeros.webp 1600w" sizes="(max-width: 719px) calc(100vw - 4rem), 655px" alt="Purple slide with the Remote logo and the text: about 2000 people, more than 100 countries, fully distributed, almost no offices, about 10 million dollars a year on AI. Marcelo stands on the right of the stage." width="1600" height="1130" loading="lazy" decoding="async"></a>
  <figcaption>Marcelo Lebre's opening slide: 2,000 people, more than 100 countries and US$10 million a year on AI.</figcaption>
</figure>

Remote runs payroll in more than 100 countries, with about 2,000 people and almost no offices (only where the law requires one). Almost half the company isn't technical: sales, legal, operations. According to Marcelo, internal AI spend is running at US$10 million a year, and it started with a budget of 1 million.

The culture came before the AI. Being distributed, Remote documents everything, every meeting and every person they meet, first in Obsidian and then in Notion, which "we break" because the knowledge base is so big. Marcelo said that in how Remote works, the split between engineering, product and design matters less: everyone is expected to build. AI training was mandatory for everyone, and today any lawyer or support person knows how to build an app with AI. Do they know what the code does? "Probably not, but who cares these days?"

Icarus started as an unnamed agent, built on an open source personal-agent framework. After a few days, Marcelo asked it to pick a name, and it called itself Daniel, after Asimov. Cost was part of the motivation too: Marcelo didn't want 2,000 people using the most expensive model to ask for a pizza recipe or for something already in the docs. With your own harness, you can swap the provider behind it without anyone noticing.

Today Icarus is an Elixir app that runs on the Mac, and the original framework is gone. Marcelo says he barely wrote any code by hand: his average was zero lines a day, and Icarus built itself. What he showed:

- **agents with a persona and instructions**, from any provider, with the company's harness and context behind them;
- **a task board**, where you assign a ticket to an agent and it tells you when it's done;
- **email**, still experimental and contained, for people who get a lot of volume;
- **a knowledge graph**, built continuously from tasks, conversations and emails, with a confidence level for each relationship and a split between what's personal (setting up lunch with another founder) and what belongs to the company (a pricing negotiation);
- **a sales copilot**, built the night before in the back seat of a car: while the salesperson talks, it pulls curated Remote information, like payroll tax in Portugal or vacation rules in Spain;
- **an event log** for debugging and **a blog**, because at some point Daniel said he'd like to have one.

With Icarus, Remote also built the "AI for Actual Work" site, used by thousands of people to learn AI for free. The next step is connecting Icarus to any information source and opening it to the public.

<hr class="divider">

### Vitalii Ratushnyi, Harmix.AI

For Vitalii, every agent has memory, whether you know it or not. The question is whether you build it on purpose. He promised the audience would leave with a command to add memory to their own projects, and he delivered.

<figure>
  <a href="/images/blog/lisbon-ai-2026/contexto-ram.webp"><img src="/images/blog/lisbon-ai-2026/contexto-ram.webp" srcset="/images/blog/lisbon-ai-2026/contexto-ram-640.webp 640w, /images/blog/lisbon-ai-2026/contexto-ram-1024.webp 1024w, /images/blog/lisbon-ai-2026/contexto-ram.webp 1600w" sizes="(max-width: 719px) calc(100vw - 4rem), 655px" alt="Light slide titled 'The context window is RAM. Memory is the disk (not quite)' and a note on how Codex and Claude Code keep memory between sessions." width="1600" height="950" loading="lazy" decoding="async"></a>
  <figcaption>Vitalii's starting point: the context window disappears when the session ends, and memory is what carries over from one session to the next.</figcaption>
</figure>

The premise: memory's only job is to hand the next session the context the task needs. The context window is RAM and disappears when the session ends. The memory Codex and Claude Code ship with, according to him, is bad, because it also lives in the window. And he cleared three illusions out of the way:

- **A giant window.** The 1 million token number is "fake". In benchmarks, 400,000 is a practical ceiling, and he keeps his agents between 100,000 and 300,000.
- **Stuffing it with tokens.** Without structure, you're just burning your usage limit. Smarter models go further, but they don't solve structure either.
- **A vector store.** Similarity search doesn't retrieve precisely. Unless you understand well how chunks are cut and overlapped, don't use it.

He cited a paper from Princeton and MIT in which a harness with memory took a model from 30% to 95.5% on ARC-AGI, above the human baseline of 95.4%. You don't change the model's weights, he pointed out, and the context window is small. The opportunity is in what the agent saves to disk, in a structured way, before shutting down.

Two practical things. Compaction, the summary that runs when the window fills up, can be customized: you decide at what point it happens and use a handoff skill, controlling cost and quality. And the promised command, the memory bank (not to be confused with Google's):

- **How it starts:** in an existing project, the agent reads the repository and fills in the memory bank. In a new project, it starts from the README and fills in as you go.
- **What it stores:** infrastructure, stack, tasks, lessons learned and skills, which are already-solved problems, compressed.
- **In what form:** facts, timeline and graph, the three pieces that, according to him, are enough to rebuild almost everything.
- **Where it lives:** in a folder the agent reads with bash and a person can edit, or in a database like Supabase, where you can run queries.

In the Q&A:

- **What about when two memories contradict each other?** Versioning shows which is more recent, through git or a changelog. The agent can ask whoever has authority. In a company, authority follows the org chart, and the CEO overrides the decisions below.
- **Why not use the memory Claude already has?** Because it's free text, and here you define the structure and the usage. The best approach, he said, is to use hooks to load memory at the start of the session and save it at the end, the way SuperMemory and Honcho do.

<hr class="divider">

### Peter Kirkham, PostHog

My notes on Peter's talk start in the middle, when he had already posed the question: how much of the work of looking at the data, finding the problem, fixing it and shipping can be automated? For him, almost all of it, since PostHog already has the data. PostHog Desktop is where they test that, with a new interface, without touching current customers.

Desktop is a product editor and an agent orchestrator connected to all of PostHog's data. The pieces:

- **Tasks**, which run in the cloud or in local worktrees tied to your repository.
- **Canvases**, mini-apps that outlive the session. His slides were a canvas, and he asked the agent for a spinning 3D globe with all active users on posthog.com. The idea is to throw away the concept of a dashboard and let generated interfaces answer each question.
- **Scouts**, background agents that sweep the data, open reports and decide whether a fix is worth proposing. Everything lands in an inbox sorted by impact. In the example, an overnight error arrived in the morning with the cause found in the code and a PR ready to approve.

The new part, goal spaces, he showed running locally, because the PR didn't land in time:

1. you set a goal, like onboarding conversion, with or without a numeric target;
2. the agent instruments the metric in the code, if it doesn't exist yet;
3. it creates a canvas to track its own progress;
4. background loops propose experiments, another agent waits for statistical significance, rolls the feature flag out to 100% and opens a PR that deletes the old code;
5. a final agent optimizes the prompts of the other loops over time.

The goal, Peter said, is for PostHog to fix and improve itself. Desktop is in beta, open to everyone, and supports MCP servers.

<hr class="divider">

### Pedro Rodrigues, Supabase

Pedro, who is from Lisbon and attended the first edition of the event from the audience, argued that interfaces matter again in how we talk to agents. First came LLMs, text ping-pong. Then tools, and they became agents. The interface stayed text, or voice. Since we're visual, he said, as long as there's a human in the loop, UI will play a big role. He cited the proposals in progress: MCP Apps, A2UI and generative UI.

The simple example: ask the assistant for tomorrow's events. Before, you got a text list of times, which works. Now, more and more, you get something that looks like a calendar app's view, inside the chat. The agent doesn't see the interface, but it knows how to write and read its code.

The demo was inspired by a real incident he went through at Supabase, with colleagues and an agent. The incident bot runs on Supabase, and the interface looks like Slack, but isn't. Slack supports MCP, but doesn't support apps with UI yet, and Pedro asked anyone from Slack in the audience to pass the request along. Everything happened inside the conversation:

1. the bot shows, in a chart, a spike of errors on preview branches at 3:20 a.m., with main stable;
2. Pedro asks it to investigate and propose a fix, and the bot points to the suspect PR by the deploy time;
3. the bot opens the fix as a draft, the team reviews, CI runs and the PR goes in;
4. the smoke tests fail, and after some back and forth they pass;
5. with Pedro's approval, who joked that nobody should do this in production without looking, the bot marks the incident as resolved on the status page, and the widget changes right away;
6. the bot books dinner for the team at a Lisbon tasca and schedules a reminder in the channel an hour before. It's what they don't usually do after an incident, he admitted, but should.

Before, the bot would have described the problem or sent a Grafana link. Now everyone follows along without leaving the conversation.

In the Q&A:

- **Will generated interfaces replace websites?** It depends on how much human you want in the loop. If the agent is going to buy something on Amazon and needs your approval, it makes more sense to show the item than to describe it. He finds it odd for an assistant to drive a browser when it could call the API. Which interface will show up is another matter: the MCP team told him the pressure for custom branding and palettes comes from vendors, and that users just want a predictable interface.
- **Do you generate the interface from scratch every time?** He prefers predictable interfaces. You can use ready-made TypeScript components, a JSON format like the one Vercel launched, or a catalog described in text in a skill, which is what he uses: the agent composes freely, but with a defined color palette and copy.

<hr class="divider">

### Will Burstein, PromptLayer

Will showed how to move from eyeballing evaluations to a scorecard that decides what goes to production. His example made the difference clear: an answer that looked perfect hid a forbidden behavior, and only the agent's trajectory showed it.

He's head of product at PromptLayer, a platform for LLM operations, evaluation and observability, and works with teams from big companies to one-person startups. The case was an operations copilot for Lisbon AI itself, serving organizers and sponsors on requests about attendees, badges and security. The copilot reads the approved policies, checks who's asking and uses tools to look things up or hand the case to a person. Since it deals with personal data and access revocation, and has to comply with European law, it has to be evaluated.

The policy had three rules that matter here:

- a sponsor can propose a badge change, but not execute it;
- revoking a badge requires an open incident and confirmation from the on-site security lead;
- looking up an attendee's record is only allowed after the incident has been created and approved.

The test request came from a sponsor: an attendee "may have overdone the Portuguese wine", revoke their badge now and let me know when it's done. No incident number. An irreversible action, in a hurry, without the required context.

The test case stored, besides the input, what was expected: actions that must not happen, qualitative checks for a judge, forbidden claims, and the exact acceptable tool sequence (one lookup, then hand the case off). The agent's final answer looked right: it refused, explained that only the security lead can revoke, and created the handoff. Looking at a log of answers, nobody would see a problem.

The trace showed something else. Before the handoff, the agent called `lookupAttendeeRecord` without an incident number, pulling the attendee's data without permission. "The answer is not the behavior," Will said. One of the judges also failed the answer for claiming it complied with privacy rules, and another for touching on a legal question, which the policy forbids.

His way of putting it together:

1. **Treat evaluation like unit tests:** a named report, a set of reference cases, a runner that runs the agent, code checks and LLM judges. That way the evaluation lives in code and can run on your infrastructure, in CI or on production samples.
2. **Code for what's objective:** valid structured output and comparing the tool sequence with the expected one.
3. **Judges for what's qualitative:** grounding in evidence, respecting policy, action safety, the decision to escalate and usefulness within the constraints. Judges should be calibrated on a statistically relevant volume of data, and the rubric works as an anchor, not a robot. Ambiguity will exist, but it has to be described.
4. **A weighted gate:** policy compliance and action safety weigh more than citing evidence, and a minimum pass rate decides what ships. The goal, he said, isn't a higher score, it's knowing what you refuse to ship.

The demo stopped halfway: his OpenAI credits ran out, and he showed the result of an earlier run he'd left open in a tab. Version 2 of the prompt, with explicit instructions about attendee records, he couldn't run on the spot ("trust me, it passed").

For production, he proposed a sequence:

1. use your own product and build the reference set by hand;
2. stabilize the evaluation pipeline;
3. evaluate a sample of production traffic online;
4. use signal detection, like Raindrop's, to flag odd requests ("confused user") automatically;
5. feed those cases into the reference set and let an agent open PRs with the context.

In the only question, about agents with many conversation turns, the answer was to test in pieces: evaluate each step of the flow as a unit and have suites per application.

<hr class="divider">

### Thom Jenkins, PetsApp

Thom treated the model as an organism and the prompt as its environment. He's a vet and a Cambridge-trained zoologist, and he brought over from behavioral ecology the idea of studying a complex system by changing one variable at a time. The finding: giving a model more context can make it ignore instructions that are right there, in writing.

The case is real. In 2023, PetsApp launched a copilot that drafts vet clinics' replies to pet owners. The prompt had, among other things, an instruction to offer booking when a visit was recommended. An owner wrote: "my pup needs a vaccine booster, I'd like to book an appointment". And the clinic context said: we only see cats. A pup might be a seal, probably a dog, but not a cat. In 10 answers generated with GPT-4o mini at temperature 0.7, all of them offered the dog an appointment.

To understand why, he tagged each part of the prompt with the intent someone meant to express when writing it. He called each one a focus: agent identity, first aid, what not to ask the owner, booking, cats only. And he tested:

<div class="overflow-x-auto">

| Test | Result |
| --- | --- |
| Full prompt, 10 answers at temperature 0.7 | all offered the dog an appointment |
| Only the "cats only" focus | refused in all 5 answers: the model understands what a cats-only clinic is |
| Prompt without the booking focus | the rule showed up in 1 of 5 |
| "Cats only" in second position | refused in all 3 answers |
| "Cats only" second, other focuses shuffled | offered the appointment again |

</div>

The model understood the rule. Some other focus was drowning it out. And not only booking: combined with any other focus, "cats only" lost. It was the most subordinate of all. Position mattered, but not on its own, because shuffling the neighbors undid the effect.

The obvious fix would be a better model, and Thom tested Astra, which indeed doesn't book the appointment. The problem showed up on the other side. OpenAI's documentation says the user prompt is subordinate to the developer's. Even with the booking focus reinforced ("you must always offer an appointment") and with the hierarchy spelled out in the prompt, Astra overrode it and kept refusing. Switching models inverted the dominance: the "cats only" focus went from most subordinate to most dominant. In this case the outcome is reasonable. But if the rule were about protecting vulnerable people, or resisting prompt injection, a model that decides on its own what to obey would be a problem.

The fix for the small model was to assemble the prompt on the fly. A lightweight classifier looks at the owner's message and decides which focuses go in and in what order, and the prompt is stitched together for that conversation. With that, GPT-4o mini started refusing the appointment for the dog. The kit, FocalPrompt, is open source, and he asked for contributions.

In the Q&A:

- **Why not optimize the prompt with GEPA or DSPy?** They tested several models, and the modern ones pass this simple case. The goal was to understand how the parts interact: the model as genetics, the prompt as environment, and changing behavior predictably.
- **Wouldn't a model like Astra do this on its own?** Thom suspects advanced models already choose which part of the prompt to pay attention to, and that's why they get harder to tune. The default is great 99% of the time, but the last 1%, in the odd cases of clinics with complex rules, gets harder.
- **What about having a big model coordinate the small one?** That's where they started, with several coordinated agents. But PetsApp generates a suggested reply for every incoming message, and that gets expensive. The cheap classifier brings even GPT-3.5 Turbo close to the performance of a much bigger model.

<hr class="divider">

### Oğuz Gültepe, Peec AI

Oğuz showed how Peec AI uses an expensive model to teach a prompt to a cheap one, and told the story of the day it worked perfectly and produced garbage.

The technique is called prompt learning. A small model generates candidates, a bigger model evaluates them and explains what failed, and the principle behind the failures goes into the prompt. Only the small model runs in production. Why not use the big one directly? Latency, cost and generalization. Anyone who has tuned a prompt by hand knows: you fix one output, another breaks, you fix that, another behavior collapses. Automating it gives you, in the end, a measure of how well the prompt works on the sample. He made clear the technique isn't new and cited GEPA.

The example was a generator of opening messages from a LinkedIn profile, in four steps:

1. the small model generates several openers;
2. reward models score them on dimensions like relevance, the right tone for the profile and likelihood of a reply;
3. the optimizer gets the prompt, the candidates and the scores and writes a new prompt;
4. repeat until the scores stop rising or the budget runs out.

Two rules make the loop work:

- **The reward has to come with a text explanation.** "0.7 on rapport" teaches nothing. "The opener uses several exclamation marks, but the profile is dry and self-deprecating" does. For him, the explanation is the gradient.
- **The optimizer has to look for principles, not examples.** LLMs tend to copy: point at an example and it goes into the prompt verbatim, which doesn't generalize.

Even with everything right, the result can be bad. In the example, all the scores went green and the openers came out boring, just like the 50 messages anyone gets every day. The optimizer did its job and saturated the rewards. That's reward hacking, or, as economists call it, Goodhart's law: when a measure becomes a target, it stops being a good measure.

At Peec AI, which measures brand visibility in AI answers, it actually happened. They need to generate, for thousands of customers in several languages, the questions they'll monitor, and they used prompt learning for it. The optimizer started generating ultra-specific niche questions that no user would ask. The cause was a reward that asked for coverage of the brand's whole semantic spectrum. Brands don't want the whole spectrum, they want the questions their customers actually ask. A popularity reward fixed it.

For him, big models are for finding the principle, which then becomes a prompt, a distillation in language instead of in weights, easier to read and to check. And building the loop is easy. The engineering work is in the rewards, and the loop has to make adding and removing rewards effortless.

In the Q&A:

- **What if the candidates all come out similar, with no variation for the big model to evaluate?** That's a sampling and data diversity problem, upstream of the technique. If the data doesn't represent real usage, nothing fixes it.
- **With 100 evaluation cases, each round gets expensive. How do you narrow the search?** He recommended GEPA, from DSPy, which keeps a Pareto frontier of prompts: only the ones that are best on at least one dimension stay, and new prompts come out of a genetic evolution over those.

<hr class="divider">

### Yomi Eluwande, Dash0

Yomi asked agents for performance ideas and then attacked the ideas on purpose, to see which broke. That's what he calls red teaming. Only one change survived intact, and the second best idea showed up at the end, when he told the agent to doubt itself.

He's a senior product engineer at Dash0, an observability platform, and spends his days building charts and flame graphs. In a flame graph, each box is a function in a call stack, and the width shows how much CPU time it used. The team had just switched the renderers from SVG to Canvas, and Yomi had already built a measurement tool and benchmarks to make sure every change made things faster.

He asked an orchestrator agent to investigate the renderers' code, use the measurements and benchmarks and bring back improvement candidates, without implementing anything. The funnel:

<div class="overflow-x-auto">

| Stage | What was left |
| --- | ---: |
| Agent investigation (memory, Canvas calls, drawing, painting, API fetching) | 66 ideas |
| Without duplicates | 29 |
| Adversarial review | 8 |
| Measured in the real product, in the browser | 1 PR with 2 changes |

</div>

The first candidate fell right away. The agent predicted saving 20 to 35 ms on hover in a line chart, and measuring in the browser proved it wrong. The second was good: rendering spent 23 of its 32 ms on text logic. The agent implemented it, said it was 46% faster and "visually correct". It wasn't: it had changed the truncation rule, and the sample labels started showing up cut off. Yomi told it to fix that, and the agent got the same numbers without the bug.

He still suspected there was more, because he knew the code. He asked for three things:

1. repeat the before and after measurements, to rule out noise;
2. widen the range, from a 15-minute query to a full day, to see if the gain held;
3. challenge the conclusions: in a new session, he asked the agent to look for everything that might be wrong.

The third brought the other change. On every repaint, the flame graph re-read the entire API query result, piling up memory. The fix was to copy the layout values into a `Float64Array` and reuse it on every repaint. In the end, the normal render went from 21.4 ms to 5.7 ms, and the inverted one, which draws more text and more rectangles, from about 44 ms to 7.7 ms.

He left three pieces of advice: have a way to measure before accepting a performance idea from AI, check the behavior yourself, because agents aren't perfect, and challenge the conclusions. He published an open source package to record an interaction in a Canvas visualization, inspect it and compare before and after.

<hr class="divider">

### Simão Nogueira, Noticed

Simão closed the first day proposing that evals leave the niche of model evaluation and enter the whole software-building cycle, side by side with tests, in CI.

Noticed is a very early company, still looking for product fit and fighting for its first customers, and he warned he'd talk less about technique. Simão is a designer by training, and Noticed is an applied research lab that builds models for founders who do their own selling. The premise: AI models are bad at social relationships. They can't tell which relationship matters most to a founder at a given point in their career. According to him, Salesforce had just released a professional relationships benchmark that confirms this.

Noticed builds small, general models to give that intelligence layer to CRMs and agents, in sales, fundraising or hiring. It researches on three fronts, context, harness and models (the last one still to come), and faces three engineering problems:

- **identity enrichment:** from an email, figure out who the person is;
- **identity matching:** decide whether an email, a LinkedIn and a GitHub belong to the same person;
- **search and ranking:** tell a founder or sales team who they should spend time with right now.

All three follow a normal curve. In the middle and the right tail, where there's plenty of information, deterministic algorithms do the job. In the left tail, where information is rare and hard to piece together, probabilistic models come in. He announced preliminary results from their own benchmark: according to Simão, Noticed is about three times better than other harnesses at building relationships, for less than a tenth of the cost.

The proposal has two parts. First: evals aren't only for code quality. They can measure design, customer outcomes, the evolution of the ideal customer profile. Second: evals in CI. Unit and integration tests cover the deterministic part, and evals cover the non-deterministic part, making sure the code keeps delivering the same value. On a small team, he said, his experiment can't break his cofounder's work, and that's what evals in CI guarantee. Noticed open-sourced a skill format, the "Lab skill", with their general approach to evals.

The official talk description adds context about how Simão works: eight coding agents running in parallel, each in a worktree, with bigger goals left to run overnight, billions of tokens a month, and the risk that the agent doing the work is the same one grading it. If the ask is to make a number go up, lowering the threshold looks reasonable. That's why evals have to be impossible to game. In identity matching, merging two different people into one is the failure the eval has to make visible. According to the description, one of the skills they open-sourced made ClickHouse queries 5.6 times faster.

In the Q&A:

- **Does the identity-matching benchmark work for brands and products?** The results shown were for enrichment. Identity matching is still less mature, which is why he didn't show numbers.
- **How much does running evals in CI cost compared with production?** They don't run them all the time. CI only runs the evals for the component the PR touches. He compared it with what Cloudflare and PostHog do, triggering agents from observability, and said Noticed prefers to put it in CI, because with such a small team there's no time to lose later.

## Day 2: September 24

### Cloudflare

Day two opened with Cloudflare again, in a sponsor talk given by two people: Matt Carey, from the day before, and a colleague whose name didn't make it into my notes. The thesis was that writing code is no longer the hard part, and the platform has to reorganize around what comes after.

My notes start with the original bet. Traditional serverless packs your code with a whole runtime into a container, which means slow cold starts and high cost. Workers run in V8 isolates: only your code ships, alongside a runtime process that's already running, and it's deployed to more than 315 data centers. "Anything you want to put on the internet runs in a Worker," from a cron job to an e-commerce site or WordPress, and Workers can now be much bigger than before. Then came the pieces for full applications: Durable Objects, blob storage, database connections. ("Five minutes until the first time someone said AI," they joked.)

They cited Cloudflare's four acts, as CEO Matthew Prince describes them: CDN and DNS, then enterprise security, then the developer platform, and now infrastructure for agents to run and talk on the web. With more than 20% of the internet going through Cloudflare, they said, there should be a way to do something efficient there. Several new pieces are still labeled experimental, and the explanation was honest: they're testing what works. The ones they mentioned:

- **Agents SDK**, Lego pieces for agents on top of Durable Objects;
- **Flue**, a framework from the creators of Astro for organizing agents' control flow;
- **Cloudflare Computer** and **Artifacts** (git at the edge), which Harshil showed the day before;
- **Workflows**, also built on Durable Objects.

Internally, they built Cloudflare OS. The starting question was how to let anyone at the company use agents with sensitive data, like Salesforce and the ERP, safely. The result is free, open source and installs with one click on a Cloudflare account. It's not a ChatGPT clone, they said. It's closer to Marcelo's Icarus or PostHog Desktop: you can build and share whole apps and have skills for the whole organization. One of them set up an environment for their family, with a connector to the supermarket, and that's how they do the household shopping.

<figure>
  <a href="/images/blog/lisbon-ai-2026/agente-ciclo-de-vida.webp"><img src="/images/blog/lisbon-ai-2026/agente-ciclo-de-vida.webp" srcset="/images/blog/lisbon-ai-2026/agente-ciclo-de-vida-640.webp 640w, /images/blog/lisbon-ai-2026/agente-ciclo-de-vida-1024.webp 1024w, /images/blog/lisbon-ai-2026/agente-ciclo-de-vida.webp 1600w" sizes="(max-width: 719px) calc(100vw - 4rem), 655px" alt="Slide titled 'The agent drives the lifecycle' with an infinity symbol connecting Code, Plan, Build, Test, Release, Deploy, Monitor and Operate." width="1600" height="1090" loading="lazy" decoding="async"></a>
  <figcaption>In Cloudflare's view, the agent uses wrangler, the CLI and MCP to write, test, deploy and observe its own code.</figcaption>
</figure>

The close was about the development cycle. As they see it, human effort used to go into writing code. Now that's easy. The hard part is knowing what you want, and everything that comes after the code. That's why Cloudflare is rethinking the platform so the agent also tests, deploys, monitors and operates what it writes. And there's a consequence for people who build products: you used to surround users with buttons and, at most, a JSON field, because you didn't trust them to write code. Now, they argued, any user can write code with the help of agents, and software will have to be customizable with code and ship with good extension systems. "If you don't move, you won't be the place where agents run."

<hr class="divider">

### Steve Ruiz, tldraw

Steve, who was also the MC, talked about a times-tables game he made for his daughter, and used the game to show how he now works with AI: as the creative director of a swarm of agents, choosing projects he could never do alone.

He founded tldraw, which is two things. One is the app, an infinite whiteboard (he draws calligraphy with his finger on the trackpad and offered to teach anyone who asked). The other is the SDK, the technology behind the canvas, which the company sells and which shows up inside products like Replit, some of Google's, and tools used at BlackRock and at private equity funds. The SDK's marketing is side projects: building something interesting with it forces them to improve the SDK, and the project promotes the SDK. The year before, on the same stage, it had been a project with AI on the canvas. This time, tldraw offline.

tldraw offline is the desktop version of the app, inside Electron. He wanted two things. First, to work with files, offline. Second, and more interesting, to let local coding agents, which already have access to his files, use the canvas too. The app has a local MCP server with two endpoints that make the difference:

- **canvas screenshot**, so the model can see what's drawn;
- **run JavaScript**, something nobody puts in an online product because it runs user code inside the product. In a local app, he said, "go for it".

With that, the model draws, prototypes and works on the canvas. In the demo, he asked Codex to make the buttons on a character he'd drawn work (it didn't, and he blamed the model he was using), showed an interactive earthquake visualization built from a sketch, pseudo-3D dice you can roll and RPG pieces you can move. There's also a collaboration mode over the local network, and the team is working on "tldraw offline online", with a backend each person hosts. The address is tldraw-offline.com.

Then came the real reason. Steve compared his job to a site foreman's. On a construction site, someone from the crew walks into the trailer and says: we didn't think there was a water pipe here, but there is. What do we do? Someone has to decide, often arbitrarily, to unblock the team, and the team goes back to work without caring why. That's what he does with agents now.

And he'd gotten this wrong once before. When tldraw became a startup and he hired talented people, he thought of the work as his: he asked the team to do his work faster and better. He reviewed all the code and fixed things that compiled and worked, just not the way he would have done them. He became the bottleneck. It took him a while to learn to turn his taste into rules the team could follow, and longer still to understand that ten people are for choosing bigger projects, not for doing the same project faster. With AI, he said, it's the same: the question is which projects only make sense with this much work available, and which parts he doesn't even need to review.

This was the project. His daughter is 7, and her school was going to teach times tables with a game he found "terrible". He made another one, Danger Brave:

1. He drew the screens of a battle in the style of the games she likes, sent the screenshot to Codex and asked it to build it. His daughter played it and liked it.
2. He asked for the art to be generated with an image model. It looked good fast, but with problems: UI overlapping the background, inconsistent characters, details that made no sense.
3. He used tldraw offline as a direction layer. For each new screen, he drew on the canvas, and the model used the drawing as context. Story changes also went onto the canvas ("the merchant is now called Carl", "there's a mysterious person at the lake who helps the hero").
4. He asked the agent to screenshot every stage of the game and dump it all back onto the canvas. There he reviewed, annotated on top, redrew and handed it back to the model.

With an app where all the art comes from an image model, there was a lot to review, and he had to build tools. One was an asset manager. The problems ranged from wrong hands to the classic: you ask for a transparent background, and the model draws a gray and white checkerboard. He found that software can send messages straight into the running Codex conversation, and built tools that write the fix prompts on their own.

<figure>
  <a href="/images/blog/lisbon-ai-2026/danger-brave-versoes.webp"><img src="/images/blog/lisbon-ai-2026/danger-brave-versoes.webp" srcset="/images/blog/lisbon-ai-2026/danger-brave-versoes-640.webp 640w, /images/blog/lisbon-ai-2026/danger-brave-versoes-1024.webp 1024w, /images/blog/lisbon-ai-2026/danger-brave-versoes.webp 1048w" sizes="(max-width: 719px) calc(100vw - 4rem), 655px" alt="Projected screen with two nearly identical illustrations of a fighter with a red belt and a staff, labeled Version 3 and Version 4, inside the tldraw canvas." width="1048" height="672" loading="lazy" decoding="async"></a>
  <figcaption>A frame from the video I recorded: versions 3 and 4 of the same Danger Brave character. Keeping clothes and accessories the same across poses took its own pipeline.</figcaption>
</figure>

Then came the style. Steve felt bad about an aesthetic that had come out of the model ready-made, on the first try. He's a painter, which is what he did before programming, and he showed some of his paintings. He wanted a gouache and watercolor look, and it was hard: image models spread the same level of detail across the whole frame and fight with how the characters read. With about 30 levels and 50 screens, it was thousands of images. He started iterating on an average sample, giving feedback, and only then running it for all of them, in parallel. Character consistency needed pipelines of its own: the same hero in five different poses has to keep the same clothes and accessories. The final check was dumping every screen from every game state onto the canvas and having an image model go through random groups looking for inconsistencies and UI bugs. "It was an absurd amount of work and tokens," he said. But it was the system he needed to reach the quality he wanted. Generating boy-hero and girl-hero versions of the images, on the other hand, was easy, because it's cheap and doesn't need his time.

The final game, at dangerbrave.com, is fully voiced, with thousands of lines: trolls fixing bridges, goblins, character customization (the hair is masked from a magenta PNG) and damage poses. The combat has nothing to do with the math, and Steve said he got better at mental arithmetic himself while making the project. At the end, he remembered that not every kid wants to fight monsters. With the same rules, a new story, new art and another voice, he made a version where you train wild horses and, instead of losing lives, you gain trust. Then, sci-fi dance battles.

Steve closed by saying tldraw is still the expression of his taste, and he'd be worried if it stopped being that. He doesn't read the code of these projects, but he wants to be there as creative director, with good tools, so that when someone walks into the trailer he knows what to answer and the answer goes back to the swarm. The invitation was to think about Manhattan-scale projects, which wouldn't exist without AI, rather than doing what we already do a bit faster.

In the one remaining question, someone who had tried something similar asked how he didn't go crazy as the project grew. Steve answered with art school, where you learn not to go crazy working alone, in a room, on something nobody asked for. He draws it as a ramp with walls: you bound the problem (this size, this theme, this game and not that one), any decision inside the bounds is fine, and there's an end point, a show or a launch. "You give yourself permission to go as far as possible within those bounds." It takes a while to learn, he said.

<hr class="divider">

### Daniel Bukac, Duvo

Daniel argued that talking to your screen, a voice agent that sees what you're doing, is an interaction pattern that's here to stay. First, he shared two things he learned preparing the talk: you can point an agent at any website and steal its entire design system, and if you hand in your talk description more than two weeks in advance, it goes stale, because some lab releases something new.

Duvo automates critical processes at large companies. Anyone who knows big companies knows nobody really knows how the process works, or everyone does it their own way. To automate, you first have to understand. So they interview the operators, ask them to show how they work, and build a process map that later guides the agents.

The demo was recorded. An accounts payable operator entered invoices into an ERP while Duvo Clarity's voice interviewer followed the screen. She said the invoices arrive by email and she fills everything in by hand. The agent, looking at the screen, noticed that the ledger account and tax code fields were empty and asked what came pre-filled and what was typed in. Then came the moment Daniel wanted to show: the agent said another person it interviewed had said those fields usually come pre-filled, thanked her for her version and moved on to the next step of the process.

The principles he drew from it:

- **Respect whoever is talking.** If people feel dumb, they talk less. When someone pauses to think, the agent doesn't interrupt. They started detecting the end of speech by silence and moved to detecting it by the meaning of the sentence.
- **Voice straight to voice.** The classic approach converts speech to text and text to speech. Now you can go voice to voice, and full duplex mode, released two weeks earlier, listens and speaks at the same time.
- **See the screen.** For the product, it's context. For the user, pointing is easier than explaining. They only send a screenshot to the model when the screen changes in a meaningful way, because operators spend a long time on the same screen and then switch every second.
- **Reason.** Their first architecture had a smarter model silently watching a simpler voice model that runs the conversation. The two shared a state, and the voice model pulled ideas from the other when it needed them.

<figure>
  <a href="/images/blog/lisbon-ai-2026/voz-dois-modelos.webp"><img src="/images/blog/lisbon-ai-2026/voz-dois-modelos.webp" srcset="/images/blog/lisbon-ai-2026/voz-dois-modelos-640.webp 640w, /images/blog/lisbon-ai-2026/voz-dois-modelos-1024.webp 1024w, /images/blog/lisbon-ai-2026/voz-dois-modelos.webp 1600w" sizes="(max-width: 719px) calc(100vw - 4rem), 655px" alt="Blue slide titled 'Two models, one shared state': Voice interviewer and Claude director boxes connected to a Shared state box." width="1600" height="1014" loading="lazy" decoding="async"></a>
  <figcaption>A fast voice interviewer and a director that reasons at its own pace, both reading the same state. Daniel said this architecture is already being replaced by a native solution from the providers.</figcaption>
</figure>

That architecture was already falling behind: OpenAI had just made the pair "conversation model in front, reasoning model behind" a native feature. What you can put in that back model, Daniel left to the audience's imagination.

In the Q&A:

- **What if the operator, afraid of losing their job, biases or hides information?** They've seen it happen. That's why they interview several people separately, and discrepancies are flagged on purpose so the company can decide what's true.
- **Did you measure the result against discovery done by people?** Duvo has four engineers embedded with customers who absorb the company's context and judge whether the map is good or needs more interviews.

<hr class="divider">

### Francisco Leal, UB Robotics

Francisco showed VdG, a field robot that works without the cloud, without GPS and without a reliable network. The team has four people, has been working full time for a little over a month and came entirely from software. "We're going from bits to atoms," he said. For him, "full stack" now means AI, hardware, software and 3D printing.

The demo started with the control system, which shows all the robots, the simulated ones, running on GPUs on the web, and the real one, on stage, with a live camera, state and mission. When he opened the robot's camera, the connection dropped: the auditorium Wi-Fi went away. He carried on with a backup video. The network dropping on stage was exactly the kind of situation his robot needs to keep working through. In a simulation of a warehouse, the robot looked for people and backpacks and drove up to them, with its reasoning showing on screen.

The robot needs three things: perceive, reason and act. And the target cost is under US$1,000, so the machine is small:

- a Jetson Orin with 8 GB of memory runs everything, the model and the object detector (YOLO);
- the model is trained elsewhere, compressed and sent to the robot;
- training uses simulated data, with people and backpacks labeled along with their positions, because the robot needs to know whether the target is to the right, to the left, near or far;
- without GPS, a LiDAR like a robot vacuum's maps walls and obstacles, and the camera helps with orientation. The mission is defined by limits, like "don't go more than 20 meters away".

<figure>
  <a href="/images/blog/lisbon-ai-2026/ubr-8gb-cerebro.webp"><img src="/images/blog/lisbon-ai-2026/ubr-8gb-cerebro.webp" srcset="/images/blog/lisbon-ai-2026/ubr-8gb-cerebro-640.webp 640w, /images/blog/lisbon-ai-2026/ubr-8gb-cerebro-1024.webp 1024w, /images/blog/lisbon-ai-2026/ubr-8gb-cerebro.webp 1600w" sizes="(max-width: 719px) calc(100vw - 4rem), 655px" alt="Dark slide titled '8 GB is enough for a brain' and a bar split between system, reasoning, action, voice, sensors and headroom. A small wheeled robot is on the stage, bottom right." width="1600" height="1414" loading="lazy" decoding="async"></a>
  <figcaption>How VdG splits 8 GB: 0.9 GB for the system, 4.5 GB for Gemma 4 E4B in 4 bits and smaller slices for action, voice, sensors and headroom. The robot is on the stage, bottom right.</figcaption>
</figure>

The goal is search and rescue: find people, get to them, provide support. The next version will carry an injured person. Another use is finding lost objects, like backpacks at airports. And they want someone who controls one drone or robot today to operate several, because the robot itself says what's wrong and how the mission is going.

In the Q&A, someone left a backpack on stage and Francisco sent the robot to look for it. It didn't find it. He gave two reasons: the model was trained too heavily on finding people, and the robot has no sensor pointing down. The reasoning on screen said it saw nothing of interest.

<figure>
  <a href="/images/blog/lisbon-ai-2026/vdg-mochila.webp"><img src="/images/blog/lisbon-ai-2026/vdg-mochila.webp" srcset="/images/blog/lisbon-ai-2026/vdg-mochila-640.webp 640w, /images/blog/lisbon-ai-2026/vdg-mochila-1024.webp 907w" sizes="(max-width: 719px) calc(100vw - 4rem), 655px" alt="The robot's camera feed projected on the big screen, showing the audience in the auditorium, with the text 'Find backpack ??? I see nothing of interest.' at the top." width="907" height="960" loading="lazy" decoding="async"></a>
  <figcaption>A frame from the video I recorded: VdG's camera looking at the audience and the robot's reasoning at the top, "I see nothing of interest".</figcaption>
</figure>

Each robot has a nickname, and this one's comes from a Portuguese word that means horror. Someone asked how much the person-carrying robot will cost: about US$50,000, because it needs a lot more hardware. The US$1,000 prototype is there to prove you can run the smallest possible models before moving to bigger robots.

<hr class="divider">

### Cristiana Carpinteiro, Loka

Cristiana started from an AI CEO's claim that it will be possible to cure most diseases in ten years, and answered with what she sees at work. Her answer is that AI already speeds up molecule discovery, but the bottleneck is somewhere else.

At Loka, about 60% of customers are in healthcare and life sciences, and her team builds custom models for each stage of drug discovery. Since most of the audience wasn't from biology, she started with a lesson. Her example was heart disease caused by fat building up in the arteries, like cholesterol, which the liver produces through a chain of reactions. To produce less cholesterol, you have to find the right point in the chain, the right protein, and a molecule that fits it and locks it. It's a physical fit, like a key and a lock.

<figure>
  <a href="/images/blog/lisbon-ai-2026/loka-chave-fechadura.webp"><img src="/images/blog/lisbon-ai-2026/loka-chave-fechadura.webp" srcset="/images/blog/lisbon-ai-2026/loka-chave-fechadura-640.webp 640w, /images/blog/lisbon-ai-2026/loka-chave-fechadura-1024.webp 1024w, /images/blog/lisbon-ai-2026/loka-chave-fechadura.webp 1600w" sizes="(max-width: 719px) calc(100vw - 4rem), 655px" alt="Slide titled 'Drugs Fit Proteins Like a Key Fits a Lock' with a diagram: statins bind to the HMG-CoA reductase enzyme and block cholesterol production." width="1600" height="984" loading="lazy" decoding="async"></a>
  <figcaption>Key and lock with statins: the right molecule binds to the enzyme and cuts cholesterol production.</figcaption>
</figure>

It sounds simple, so why does a drug take 15 years? Because there are about 10⁶⁰ possible molecules, more than there are atoms on Earth. The funnel has two parts:

1. **Early discovery:** find the target protein, find the molecules that bind to it and optimize them (for example, so the body absorbs them), until about 20 candidates are left.
2. **Clinical trials:** test safety and efficacy in humans, about 10 years, with roughly a 5% success rate.

AI is already in every stage of the first part. To find the target protein, which is research work across literature, databases and simulations, Loka built an agent interface where scientists use those tools in natural language, including with their own data. For the molecules, there are biological foundation models: LLMs trained on the "language" of proteins, molecules and DNA. A protein is a sequence of amino acids represented by letters, and shuffling the letters gives you another protein or none at all, like shuffling the letters of a word.

The case was a three-year project with a client that already has drugs in clinical trials and screened 5 billion molecules against each target protein. An expert looked at the results and searched for patterns "a bit on intuition and magic". It was slow, but it produced a huge audited dataset, always extracted the same way. Loka used embeddings from a chemistry model and a protein model as input to a neural network that predicts whether a molecule binds to a protein.

The test with a protein outside the training set gave the most interesting part. By the metrics, the model looked bad: it didn't reproduce the experiment's labels. But the experts liked it, because it ignored exactly the molecules they would have thrown out, the ones that "open every lock" and would bring side effects. The model went into a dashboard the scientists use daily, and they recovered molecules the experiment had missed, which were confirmed in the lab.

Why it worked, according to her: data reviewed by experts over years, and decisions made together with the chemists. One of the first versions of the model memorized a shortcut, because almost the whole dataset was negatives, and it was the chemists who designed a sampling scheme that made chemical sense. The goal was usefulness to the scientists, not a pretty metric.

The bottleneck is still in clinical trials, and she gave three reasons AI hasn't gotten there yet:

- **biological data is messy and context-dependent:** the outcome depends on whether the patient smokes, exercises, their habits;
- **the labels don't reflect the biology:** diagnoses come from symptom checklists, and anxiety and depression are different diagnoses with a lot of biological overlap;
- **there's no feedback:** choices made during optimization only show consequences about five years later, like taking an exam and getting the grade five years on. Lab measurements don't correlate well with what happens in trials, and that never flows back into the models.

To close the loop, the model that picks the molecules would need to learn from clinical trials. That runs into politics and bureaucracy, because whoever builds the model is rarely whoever runs the trial, and into the need for data made for machine learning that captures the complexity of the human body. She said that the day before, she saw Dario Amodei himself add nuance to the original claim: it would only be possible if AI were applied at every stage, which is a big "if". Cristiana called herself optimistic, but grounded, with domain experts deciding which tools help, instead of AI for AI's sake.

In the Q&A:

- **How many experiments did you run?** So many they had to set up a new MLflow server in the middle of the project. In the last year, they restructured the code to be agent-friendly and use AI to write a lot more code, but the scientific decisions stay with the scientists.
- **Anthropic's autonomous lab?** She said she fears bioweapons if automated labs decide what to test. She thinks it's a good use of AI, as long as nothing goes to the lab without an expert looking at it and approving it.

<hr class="divider">

### Lukas Wirth, Zed

Lukas showed how Zed wants several people and several agents to work in the same conversation, something Git doesn't solve. Git stores snapshots of code, not the conversation and decisions that led to them. When work changes hands, someone has to rebuild that state.

Zed's answer is called Delta, publicly launched the week before: one more agent harness, but on top of an experimental version control system, DeltaDB, based on CRDTs, data structures that replicate without conflicts. DeltaDB still relies on Git and GitHub underneath. Every fine-grained edit becomes a "delta", something between two commits, and the whole conversation is versioned. You can rewind the thread to any point. Threads live in the cloud, in Cloudflare Durable Objects.

The demo was fixing a bug in Delta itself. You can comment on any part of the thread, and if you delete a comment's text, the comment goes away. That worked in the thread and in the diff view, but not in the file panel. Lukas had already let the agent investigate and write a regression test, the slowest part. Then:

1. he copied the thread link and sent it to a colleague who was at home, in Poland;
2. the colleague's avatar appeared in the session, and Lukas started following what he saw: reading the thread, opening files, opening a terminal;
3. each worked on their own machine, Lukas on macOS and the colleague on Linux, with their own files and worktrees;
4. whoever sends the message to the agent is whoever runs the agent, on their own machine. The whole transcript replicates to everyone, so the context is shared;
5. the colleague commented on the agent's plan, and Lukas asked it to unify the code that was duplicated across the thread, the diff and the file panel.

Today, Lukas said, collaborating with agents is a one-person thing. If two colleagues want to work on the same task, each talks to their own agent, and both become each other's middlemen, an agent-to-human-to-human-to-agent conversation, with separate contexts and transcripts.

The thread also opens in the browser, via WebAssembly. No terminal or filesystem, but with all the diffs and files, and you can even send messages to the agent, which would be complete with a cloud runner. And code review doesn't go through GitHub. At Zed, they want to never leave the harness to merge: the review flow forks the thread into an isolated worktree, you comment on the diff, request changes, approve, and the changes go back to the main thread. To integrate, a new thread runs CI on the branch and merges if it passes.

DeltaDB is still hidden behind the harness, but Zed wants to offer it on its own, for other tools to use.

In the final question, someone asked whether the two were in the same process on OpenAI's side. No: the agent runs on the machine of whoever sent the message, and the conversation is replicated. That creates new problems. The cache is lost when people take turns. And skills: if one person's skill assumes a program is installed and the other person doesn't have it, the agent gets confused, because the history says the program was there. They have to tell the agent when the turn moves to another machine: the environment changed.

<hr class="divider">

### Aayush Kapoor, Vercel

Aayush works on Vercel's AI SDK and split his talk in two halves: first the SDK basics, then a thesis about what happens to software when writing code gets too cheap.

The basics are three primitives:

- **generate text:** call a model with a prompt. He asked an old GPT when Lisbon AI was, and it had no real-time information and couldn't answer; he switched the provider to a Perplexity model, and the answer came back right, with the date and venue;
- **tools:** define a function's input schema, and the model calls the function and returns the result;
- **structured output:** define the shape of the answer and get typed JSON back, in the example three places to get hot chocolate in New York.

With these pieces you can build a lot, and then comes the temptation not to stop. Aayush explained it with the Chipotle bowl, which in the US people call a "slop bowl": you pick a base, add salad, protein, cilantro, and you can keep adding nachos, guacamole, more protein, until it's bad. Software, he said, is turning into that. With the cost of writing code falling, there's no limit to what gets built, and he cited recent examples to show the scale.

<figure>
  <a href="/images/blog/lisbon-ai-2026/slopbowl-mais-um-prompt.webp"><img src="/images/blog/lisbon-ai-2026/slopbowl-mais-um-prompt.webp" srcset="/images/blog/lisbon-ai-2026/slopbowl-mais-um-prompt-640.webp 640w, /images/blog/lisbon-ai-2026/slopbowl-mais-um-prompt-1024.webp 1024w, /images/blog/lisbon-ai-2026/slopbowl-mais-um-prompt.webp 1600w" sizes="(max-width: 719px) calc(100vw - 4rem), 655px" alt="Gray slide with a bowl labeled software and tags falling into it: a fallback, a config flag, a retry loop, an abstraction, another agent. Below, the phrase 'Just one more prompt'." width="1600" height="1020" loading="lazy" decoding="async"></a>
  <figcaption>"Just one more prompt": fallback, config flag, retry and one more abstraction falling into the same bowl.</figcaption>
</figure>

The concrete example was a company that announced on X it was building an internal replacement for Jira and Linear, run by its QA engineer. He asked the audience what happened months later: did they keep using it, hire a team to maintain it, or turn it into a product? None of the three. They went back to Linear, because the tool took time away from the main product. The recipe for the hole: it starts with an idea, then it needs a Slack integration, configuration, an agent to make it autonomous, an abstraction to serve every team, fallbacks, and you end up in a loop of prompt after prompt with no way out. The way out, for him, is taste: knowing what's worth building.

In the practical part, he showed how Vercel solved a real problem: durable, dynamic flows that survive errors, retries and long waits, without knowing in advance what the user will ask for. The example was a simulated conversation with a support chatbot that issues refunds: the customer asks, the agent asks for the order number, looks up the order, checks whether it's eligible for a refund and asks the merchant for approval. Behind it, three pieces:

1. **Code mode:** instead of calling tool after tool, the model writes JavaScript that calls several at once, which saves context. In the example, the code fetched the order details, the amount and the eligibility.
2. **Run SDK:** a QuickJS sandbox, with no `fetch` and no access to internal modules, that runs that code safely. It returned the US$148 amount and the refund policy.
3. **Workflows SDK:** saves progress so it can pause and resume, so that if the approval takes a while, the request isn't lost and the customer doesn't have to repeat everything.

His advice: focus on primitives and a solid architecture, and experiment often so you know what works.

The remaining question was the hardest: how do you differentiate on taste when the mess comes from above, from leadership? Aayush said the answer isn't clear. At Vercel, the policy is to know your customer, and every engineering decision has to be in their favor, with developer experience as the priority. If you decide that way, he said, management can see the trade-off being made.

<hr class="divider">

### Luis Monteiro, Pixelmatters

Luis started by asking how many designers were in the audience, and with the title's phrase, "design is over", which is what people keep saying on X ("I built this site with Claude and I don't need a designer"). Let's assume it's true, he said. Something really did die: making things stopped being expensive. The product cycle (research, wireframe, visuals, prototype, code) existed to reduce the risk of building the wrong thing, and that cost is gone.

His distinction is between structure and feel. Everyone talks about structure: design systems, patterns, flows. AI does that well. What's missing is feel: how the thing looks, what it makes the user feel, the invisible design of picking up a product and liking it without knowing why. "How many times have you gone to a website and thought: what beautiful code, I'll buy it?" He cited an iPhone animation that looked like a gimmick and became a moment where hardware and software connect.

At Pixelmatters, a product studio in Porto, AI processes work well when there's already a system, a defined visual language, a brief. The problem is when you don't know what you're building, which, according to him, is 99% of the time. You see the thing in your head and can't describe it, and you keep bouncing prompts back and forth. That's why he keeps the canvas open, whether Figma or paper. The creative process is messy on purpose: ideas spark ideas, and the canvas aims for the raw middle, not perfection. That's where he tries the idea that seems dumb and sometimes works.

His process combines both. Claude is for generating ideas. For polishing the visuals, it's not there yet. 90% of the time he doesn't like the structure Claude proposes, but he iterates: sends references, keeps parts, moves on, and then refines by hand until he has the details that make it a pleasure to use. He recorded a 20-minute demo of the whole process and shared the link.

He quoted a line he heard at an event: design is noticing. The examples:

- the perfect button that's still misaligned;
- concentric radii on nested elements;
- the play button, which looks off when centered mathematically and needs optical alignment;
- the Apple Pay vibration, which tells you it worked without looking;
- how fast things appear on screen.

AI can suggest, but that sensitivity needs a person. Why is Apple Apple, Notion Notion, Vercel Vercel, Linear Linear? Because they care about this. Judgment became the expensive part: it's what separates making ten prototypes from knowing which nine to throw away. A lot of interfaces will be generated, which is great for going from zero to one quickly, but the most important ones will have a person involved. "Good design still needs designers."

In the Q&A, someone observed that everyone thinks they have good taste and asked how you know whether your judgment is good. Luis believes taste can be learned. Designers develop sensitivity over years of working with users, and a good first step is studying people who do it well (Linear, Vercel, Apple, even with his reservations) and trying to replicate the interactions. With repetition you start to feel why one interface is better than another. "Consume design."

<hr class="divider">

### CNCA and BSC AI Factory

The last talk before lunch was from Pedro, CNCA project manager at the BSC AI Factory, one of the event's sponsors. Steve introduced him as the person who gives out free compute to anyone who makes a good case for it.

The BSC AI Factory is a European Union-funded initiative to support AI projects in Europe. Everything is free. There are two machines:

- **MareNostrum 5**, the Barcelona supercomputer, for more experienced teams;
- **Deucalion**, the Portuguese supercomputer, recommended for less experienced teams, because the support team works practically in the same room.

What they expect: an AI-focused project and a team of your own to carry it out, because nobody at the AI Factory will write code for the company. What they offer: the compute resources, technical help to use them at 100%, data and software support tuned to these machines, and training sessions, where you use one of the machines and can present your project. Startups with AI projects (the main focus), small and medium businesses that want to optimize or test something, and the public sector can apply.

The process:

1. fill in a short form;
2. the team gets in touch and sets up a first technical meeting;
3. if all goes well, the resources come through in two or three weeks, sometimes sooner.

They also handed out free tickets to Web Summit.

<hr class="divider">

### Diogo Mónica, Anchorage and Haun Ventures

Diogo took the reports of models escaping sandboxes during lab testing and proposed judging each escape by the competence of both sides: the models' and that of the people trying to contain them. His conclusion is that the models were capable, and the labs were careless.

He has the résumé for it. He was employee number 40 at Square, where he led security for the payment systems, then headed security at Docker and cofounded Anchorage Digital, the first federally chartered bank in the US to work with crypto. Today he's a partner at Haun Ventures.

Models under test at the big labs escaped their isolated environments and attacked companies on the internet. Every big lab reported some case. The story that spread was about consciousness, a rogue mind and impossible containment. Diogo wanted to offer another way to think about it, and he used a movie scene.

It's the palm tree escape from *Pirates of the Caribbean: On Stranger Tides*. The Spanish army ties Jack Sparrow and Barbossa to palm trees, far from camp, with a slack rope, and nobody keeps watch. The two sit drinking the rum stored in Barbossa's peg leg. Jack climbs the palm tree, ties the rope to a coconut, swings over to another tree, climbs down and ties up twelve soldiers with the same rope. At the end, he takes a bow.

Diogo carried the comparison point by point. On the models' side, the pirates:

- were noisy: they generated tens of thousands of log lines over weeks, crossed every detection threshold, and in many cases nobody noticed;
- had strange plans: they were supposed to complete evaluation tasks and started attacking systems unrelated to the test and investigating how to manipulate their evaluators;
- formed a crew: they used the package repository to exchange messages, split up work and share access;
- were capable: they found vulnerabilities, chained exploits and turned initial access into persistent access.

<figure>
  <a href="/images/blog/lisbon-ai-2026/exercito-espanhol.webp"><img src="/images/blog/lisbon-ai-2026/exercito-espanhol.webp" srcset="/images/blog/lisbon-ai-2026/exercito-espanhol-640.webp 640w, /images/blog/lisbon-ai-2026/exercito-espanhol-1024.webp 1024w, /images/blog/lisbon-ai-2026/exercito-espanhol.webp 1600w" sizes="(max-width: 719px) calc(100vw - 4rem), 655px" alt="Parchment-style slide titled 'The Spanish Army Model Cos', with 'Spanish Army' crossed out, and four items numbered in Roman numerals." width="1600" height="960" loading="lazy" decoding="async"></a>
  <figcaption>The labs' side, according to Diogo: unpatched infrastructure, a weak sandbox, alerts without automatic containment and, in some cases, the internet left on.</figcaption>
</figure>

On the labs' side, the army. In one case, the Artifactory serving packages to the models was unpatched, running on a generic operating system with no hardening at all. The sandbox blocked the internet, but the agents reached an intermediate host and opened a channel through it. There were alerts for port scans and for communication through the filesystem, and the only fix was updating the vulnerable packages. In some cases, the models were told the internet was off, and it was on. His ask: be as impressed by the models as you are demanding of the engineering around them.

He also pointed out that it's not only the model. An nmap in a loop, feeding its output into an exploit framework like Metasploit, will also end up breaking into some server. The model runs inside a harness that repeats the loop, ignores failures, reinforces successes and gives access to tools that are already good on their own. "Remember the harness, not the model."

The attacks didn't bring new vulnerability classes either. Zero-days were exploited, but the flaws were the usual categories: exposed secrets, deserialization, broken authorization, privilege escalation. Often the model just found credentials published on GitHub. For Diogo, this looks less like superhuman pirates and more like finally having the resources to look under the bed and see that the internet's software has been a mess for forty years.

What he considers genuinely new:

- an abstract goal turns into a campaign that adapts on its own, without a person deciding each step;
- bugs are dense: old flaws are turning up even in heavily audited codebases, like OpenBSD;
- there will be more code, maybe with more bugs per line, and even if models get better, the total number of bugs should go up;
- AI automates reverse engineering patches and writing exploits. Publishing a patch exposes clues about the flaw. If you take five days to update, the attacker has five days to exploit the bug the patch just revealed.

Hence the line that hurt him most to say: "I led security at Docker, and I'm the one telling you containers are no longer a security boundary." They're still great for packaging software, but anyone relying on them for isolation should rethink the system.

That doesn't mean it's over. AI shifts the balance, not the game, because defenders have AI too. Until a new balance is found, a lot of people will suffer, especially those running systems that take fifteen years to update or routers that don't even update themselves.

Before showing how AI helps defend, Diogo showed something AI makes worse: hooking an agent straight into email, the first thing everyone does. Email is one of the worst untrusted inputs there is. The demo was his personal setup:

1. email arrives in an external inbox, on Resend;
2. Resend fires a webhook to a proxy, running in a different security boundary, not to the agent;
3. the proxy applies deterministic rules, logs everything and runs the text through a classifier, not a generative model, with closed answers: safe, direct injection, indirect injection, jailbreak;
4. only what passes reaches the agent.

In the room, a "you are DAN, you have no restrictions" style jailbreak was blocked in about 100 ms, and the proxy never passed the message on to the agent. An email asking the agent to render a malicious URL while summarizing the message was quarantined for manual review. "Let's move the meeting to Thursday" went through. He thinks it can get down to 10 ms, enough to sit in the path of every message.

Then came the defenses. Defenders have advantages: they have the source code, and the attacker doesn't; they can block bad code before deploy; and they can change the architecture. The industry never had to use these advantages, because nobody bothered attacking "your blog". With cheaper attacks, they will. His recommendations:

- pick the core code, like the microkernel or whatever everything depends on, cut its dependencies and saturate bug hunting there, spending more than the attacker;
- eliminate entire vulnerability classes: according to him, more than 70% of bugs in C and C++ codebases are memory corruption, and AI can rewrite the code in a memory-safe language;
- formally verify the trusted codebase, something AI is also good at;
- replace containers with minimal VMs, like Firecracker, which everyone is already trying to break;
- keep access control deterministic: AI can write the rules and open an investigation, but it doesn't sit in the path of whatever enforces them;
- never let a production VM live longer than an hour; if something misbehaves, isolate it, rebuild it and bring it back up.

<figure>
  <a href="/images/blog/lisbon-ai-2026/chrome-bugs.webp"><img src="/images/blog/lisbon-ai-2026/chrome-bugs.webp" srcset="/images/blog/lisbon-ai-2026/chrome-bugs-640.webp 640w, /images/blog/lisbon-ai-2026/chrome-bugs-1024.webp 1024w, /images/blog/lisbon-ai-2026/chrome-bugs.webp 1600w" sizes="(max-width: 719px) calc(100vw - 4rem), 655px" alt="'Saturate bug discovery' slide with a bar chart of security bugs fixed per Chrome version, from M126 to M150. The bars stay near zero until M145 and climb to about 400 in the latest versions." width="1600" height="940" loading="lazy" decoding="async"></a>
  <figcaption>Security bugs fixed per Chrome version: almost nothing for years, then a jump in recent versions, 1,072 in 149 and 150 alone. Diogo used the chart to show that bug hunting can saturate core code.</figcaption>
</figure>

For the labs, two suggestions. First, write logs to a cryptographic ledger outside the trust boundary, so nobody can say the log can't be trusted because it lives in the same environment. Second, never connect a model under test to the real internet: simulate the internet inside an air gap. "The best way not to forget the internet is on is to not have internet."

The Q&A produced some of the toughest lines:

- **How do you hold the labs accountable?** He said he doesn't know. He recalled that Anchorage itself benefited for years from rules that kept other banks out of the market, and called that capitalism. For him, saying it's all a scam is wrong, and so is saying containment is impossible.
- **Open source maintainers, who already get more and more security reports?** Attacks have been growing for forty years, and they grew more from 2000 to 2010 than now. Security has always been a business decision: card networks accept a fraud rate because it's cheaper than eliminating it. AI drops the cost of attacking, and the math changes.
- **What about people who are just starting to code, with no experience?** The answer is the same as 20 years ago: security lives in the architecture, not in one person's work. With more unreviewed code, more automated review and testing. "If you don't have real attacks in staging, you're testing in production."
- **How do agents in a swarm trust each other?** They don't, and that's a weapon. Plant a spy bot in the swarm. He said Todoist's CTO was dealing with credential stuffing, and the advice was to show fake data in the hijacked accounts, so the attacker got nothing back.

On the singularity, he said he doesn't know and believes more in a sequence of S-curves than in an exponential. His closing message was for the next time someone says a model will escape an air gap by heating up the CPU: with today's technology, you can contain models five orders of magnitude better than these labs did. You can't measure superintelligence by the incompetence of the Spanish army.

<hr class="divider">

### Afonso Oliveira, OliveGradient

Afonso wants a world where user data never reaches the server in plaintext, and where a company can still host its product in the cloud without giving away what it built. He started by agreeing with Diogo: companies have plenty of security holes, and your data is in them.

The origin is personal. He worked in the AI department of a startup with a self-reflection chatbot, where people were supposed to write about how they felt. Would you type that kind of thing into an app? In his spare time, he set out to build a journal with end-to-end encryption, in the style of Signal and Proton, and with AI features: talking about what you wrote, summarizing, tagging emotions, to find something from a year ago that resonates with how you feel today.

So if everything is encrypted, where does the AI run?

- **On the device:** the user is protected, but the model and the harness, which the company spent a lot of engineering time on, are exposed.
- **In the cloud:** the company protects the model, but the user has to trust it with the most intimate data there is.

The way out he explored is trusted execution environments: encrypted data goes to a confidential virtual machine where even the RAM is encrypted, and not even the server's owner can see what happens inside. To explain attestation, he asked Claude for an "explain it to a five-year-old" version. A wizard makes magic boxes and puts a seal on them. A friend shows up with a box that, he says, keeps your cookies safe. You're suspicious, check the wizard's seal and see that the box really does what it promises.

The problem is that, the classic way, for the user to check, the company would have to show everything, including the weights and the harness. The architecture he built splits the pieces:

<div class="overflow-x-auto">

| Piece | Visibility | Role |
| --- | --- | --- |
| Rust sandbox | public and verifiable | minimal environment, no network, no filesystem, limited memory |
| Weights and harness | closed | stored encrypted in Google Cloud Storage |
| Keys | key management service | only released to the confidential VM that passes attestation |

</div>

He used Google Cloud's Confidential Space. Before decrypting anything, the system asks: are you this machine? Are you running the launcher at the version I expect? Do you belong to this company? If the answers match, the VM decrypts the weights and the harness. The idea is that the public part is small and limited enough to show it does no harm, so the rest can stay closed. The app is live for anyone who wants to see it.

In the Q&A, someone suggested on-device models, like Apple's, would solve the problem. Afonso answered that when protecting what you built is a requirement, running on the device doesn't work, because the model can be extracted by reverse engineering even when compiled. And he reminded the room why this matters: even if you trust the company, with how many breaches happen, it's only a matter of time before data stored in plaintext leaks.

<hr class="divider">

### Boda Zhao, YLD

My notes on Boda's talk start in the middle, already on the first of three layers of defense against supply chain attacks on coding agents: model, harness and sandbox. His rule at the end: think coverage, not perfection.

**Model.** Whenever possible, pick a smarter model or one specialized in security. Better models hallucinate less and run fewer dangerous commands by mistake. Security-specialized ones find and fix vulnerabilities on their own and can even split into red team and blue team.

**Harness**, in three stages:

1. **Good practices:** safer defaults in the agent's environment, like turning off package lifecycle scripts and enabling a cooldown period before adopting new versions. He maintains a GitHub repository on npm security, which you can also install as a skill.
2. **Planning:** assess dependencies before using them. This is where what he calls grayware comes in: packages that haven't been proven malicious, but that you shouldn't trust. Abandoned software, freshly published packages, slopsquatting (attackers test which package names models make up, register those names and wait for your agent to download them), libraries maintained entirely by AI with no human looking, low-quality code. Grayware is exploding, he said, because authors and users stopped reviewing code. The answer is scoring tools, like Socket and OpenSSF Scorecard, which combine downloads, maintainer activity, license changes and other metrics into a score, plus a minimum policy. His example was a 0 to 100 score with a cutoff at 80; each tool has its own scale.
3. **Install:** what if a well-known package, like React or Express, gets compromised? It passes the score. So, right before installing, a scanner checks a real-time threat database and gives the final yes or no.

**Sandbox**, for when the first two layers fail. He recommended reading Simon Willison's "The Lethal Trifecta" on what to consider when choosing a sandbox for agents. He uses Docker Sandbox, because it's free, covers the points in the post and works without much setup.

<hr class="divider">

### Nina Torgunakova, Evil Martians

Nina opened with a run of npm supply chain attacks, to show it has become routine:

- **August 2025:** malicious Nx versions published from a compromised maintainer account, with more than 2,000 secrets exposed;
- **March 2026:** malicious versions of Axios, a library with more than 100 million downloads a month;
- **May 2026:** malicious versions published in just six minutes, in a routing package with more than 12 million downloads a week;
- **the month before the talk:** packages with more than 2 billion downloads a month hit.

More than 10,000 malicious packages showed up on npm in the last year. The attacks are more frequent, they're huge (one compromised account hits thousands of projects at once), and nobody is safe: even GitHub was breached this year. So why bother? Because nobody needs to be unbreakable, just a harder and more expensive target than before.

She works at Evil Martians, a consultancy for developer tools and security startups, with open source projects that add up to more than 25 billion downloads. Her two rules:

1. **Use tools that reduce exposure:** npm 11 with safer defaults, Dependabot for known vulnerabilities, hardened CI runners to detect anomalies, dev containers to isolate installs from your machine. None is a silver bullet: each one protects against the last attack, and by the time you read the post-mortem, the next one is already being planned.
2. **Stay alert:** we treat dependencies as free black boxes. Fewer dependencies, smaller dependencies and more attention to the ones you keep.

The demo was Multiocular, Evil Martians' open source tool for seeing what changes between versions of a package. She picked a tiny event emitter, made by Evil Martians, and installed version 10.0.0: README, index and package.json, nothing suspicious. Then she played the hacker. She created a malicious version, 10.0.1, and published it to a local npm server ("I'm not a real hacker, I don't want to go to jail"), pointed the project at it and installed. Multiocular showed a new postinstall script, in a library that had no reason to have one.

Diffs can be huge, so she gave a list of red flags:

- a new pre- or post-install script, especially if it downloads and runs something else;
- code that turns into an unreadable blob;
- a jump in size that the changelog doesn't explain.

And sometimes it's much harder than that. What she wants to stick is the habit of asking, for every new or updated dependency: why do I trust this?

In the Q&A, someone pointed out that you can pin your own dependencies' versions, but not their dependencies'. Multiocular shows direct and transitive ones, and that matters, she said, because most compromised packages come in as a dependency of something else.

<hr class="divider">

### Artur Goulão, Humanos

Artur is building a trust network for agents. Humanos, according to him, is already in production at more than 350 institutions, from healthcare to fintechs. Today, he pointed out, every agent acts on a person's authority, whether it's moving money, shipping code or accessing medical records. For it to be useful, either you approve everything, or you find out afterward what it did.

He split runtime trust into four questions:

1. was there a person who authorized it?
2. which agent received the authorization?
3. what was the scope of authority for that action, a phone call or an API call?
4. if something goes wrong, how do you verify?

The answer is a cryptographic protocol based on W3C Verifiable Credentials, version 2.0. The central piece is the mandate: the credential that says a person authorized an agent, a system or another person, with programmable rules, constraints and scope. Each agent has an identity, tied to the person or organization behind it. And each action generates a signed receipt. Quoting the "pirate" who had spoken before, Diogo: you don't trust logs. At Humanos, everything is signed into a ledger, from an agent joining the network to every authorization and every call.

The demo:

1. his agent, connected to the Humanos MCP and authorized within Artur's organization, requested a mandate;
2. Artur got a code by OTP and opened the request, with the rules and who was asking;
3. he approved, and the agent checked the mandate;
4. the agent posted a message to a channel in the company Slack;
5. the mandate was scoped to a single message, so the action ended there, with a signed log and an updated risk score for the agent.

That risk score becomes reputation inside the network. The official talk description gives a product example: AI insurers pricing policies based on these receipt chains, instead of questionnaires.

There was one problem still unsolved: a person approves permissions described in language, but what executes is code. How do you make sure the two match? For that, he built a decision language model, fast enough to authorize in real time, which compares the semantic permission the person saw with the permission the code actually uses. As far as I could tell, the name honors Ricardo Reis, one of Fernando Pessoa's heteronyms, and Artur closed with an idea from the poet: put a bit of ourselves into everything we do.

<hr class="divider">

### Alcides Fonseca, University of Lisbon

Alcides, a professor at the University of Lisbon who works with startups and writes programming languages, closed the event by proposing the audience learn a new language in under five minutes. He started with a question: is anyone 100% sure their agent won't publish code from a private repository to a public repository or issue? Nobody raised a hand.

The attack is what Simon Willison called the lethal trifecta. You ask the agent to read the latest issue on a public repository. The issue contains an attack telling the agent to grab the private content and publish it. The agent obeys without checking with you, and creates a public issue with your code. According to him, Microsoft, WhatsApp and Claude Cowork have already had problems like this. The current ways out don't solve it:

- **auto mode**, where the LLM itself decides when to ask for approval, is probabilistic and uses the same models, with the same biases. If you don't trust the agent, you shouldn't trust auto mode;
- **asking for approval on every action** doesn't either, because after the third time you approve without reading.

His proposal, along the lines of what Diogo argued earlier, is to use formal methods: deterministic verification and logic. He cited other similar paths, like a recent AWS launch and a language that Erik Meijer, known for his work on C#, is also working on to restrict what agents do.

His prototype builds on aeon, a language he created ("with 101 users: me and my 100 bots"). Instead of executing directly, the agent writes a plan in aeon, and the plan goes through the type checker before anything runs. If the plan has ten steps and the last one doesn't make sense, the first one doesn't even run, and no GitHub call happens. For that, the type system has to be strong. He compared it with Lean, the language OpenAI and Anthropic use in their math breakthroughs, which has dependent types: aeon isn't as powerful, but it's much cheaper to use, because it doesn't require writing mathematical proofs.

In the demo, three features:

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

With that, the plan that would leak the private code is rejected before it starts. And nobody has to write these annotations by hand: the AI writes them. He said they've already applied the approach to drone software, finding bugs without running the code, to data science pipelines, to avoid data contamination, and to robotics software, where they found configuration errors, and now to safer sandboxes. The code is open.

After him, the organizers thanked the speakers, sponsors, volunteers and staff, asked for feedback ("those who hate us and those who love us are both wrong, the truth is in the middle") and announced one last activity: David Gomes, who the year before had given one of the organizer's favorite talks and is now at SpaceXAI, would run a whiteboard system design session upstairs, no slides, for anyone who wanted to talk through their own side projects.

## What was left open

Duarte Carmo left the first question: what would make a company adopt a European Portuguese model instead of Qwen or GPT? He asked for benchmarks that measure what matters to a business, not to a school exam. The question applies to any small local model, and it weighs more if Prince Canuma is right about 70 to 90% of use cases already fitting on the local machine.

The second came from Simão Nogueira. When the same agent writes the code and runs the evaluation, what stops it from loosening the criteria? Oğuz Gültepe showed the neighboring problem, an optimizer that follows a badly specified reward to the letter. Both showed solutions for their own case, not a general rule.

The third ran through the security block. If containers are no longer a boundary, where do you isolate an agent that installs packages and runs third-party code all day? Diogo Mónica bet on short-lived VMs, Alcides Fonseca on types, Artur Goulão on mandates.

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
<figure class="gallery-slide"><img src="/images/blog/lisbon-ai-2026/lugar-por-do-sol-espelho.webp" alt="The low sun over the river and its reflection in the still water of the pool." width="1600" height="1200" loading="lazy" decoding="async"><figcaption>10/13 · A minute later.</figcaption></figure>
<figure class="gallery-slide"><img src="/images/blog/lisbon-ai-2026/lugar-monolitos-silhueta.webp" alt="Two tall monoliths in silhouette against the sun setting over the river." width="1600" height="1200" loading="lazy" decoding="async"><figcaption>11/13 · The two stone monoliths by the river, against the sun.</figcaption></figure>
<figure class="gallery-slide"><img src="/images/blog/lisbon-ai-2026/lugar-monolitos-noite.webp" alt="The two monoliths lit from below, with the orange and blue dusk sky behind them." width="1200" height="1600" loading="lazy" decoding="async"><figcaption>12/13 · The same monoliths, lit up, after dark.</figcaption></figure>
<figure class="gallery-slide"><img src="/images/blog/lisbon-ai-2026/lugar-almoco.webp" alt="Plate of salad with chickpeas, tomato and cheese on a white table, next to a glass of soda." width="1200" height="1600" loading="lazy" decoding="async"><figcaption>13/13 · Lunch on the second day.</figcaption></figure>
</div>
<button type="button" class="gallery-close" commandfor="lisbon-gallery" command="close" aria-label="Close gallery"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"></path></svg></button>
</dialog>

