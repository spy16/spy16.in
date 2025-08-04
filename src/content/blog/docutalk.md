---
title: "DocuTalk"
description: "Tiny story about building & selling a chatbot, and what I learned."
tags: ["SaaS", "ChatGPT", "GenAI", "LLM"]
pubDate: 2023-08-15
publish: true
---

This is the story of DocuTalk—a chatbot platform I built just as LLMs were starting to take off, during my "build a SaaS and become indie-hacker" phase.

Honestly, I just wanted to do something cool with LLMs. I spend a ton of time digging through docs for different programming languages, libraries, and tools, so making it easy to ask questions to documentation felt like an actually useful first idea. Whipped up an MVP: point it at your docs or site, it crawls, chunks, and answers stuff using LLM magic. Felt like a win.

But then I realized: why stop at docs? Business support is a massive hassle, especially if you're a small biz and don't have someone to answer every "what's your pricing?" or "how do I reset my password?" sort of question. Rebranding it for business support turned out to be a great move—instant answers for customers, less work for owners, win-win.

Tech-wise, DocuTalk was super generic under the hood: classic RAG (Retrieval-Augmented Generation) with Pinecone.io for vector storage, Supabase for the database/auth/storage (the backend glue), and TailwindCSS + DaisyUI for the UI. You could plug in docs, support articles, whatever—and it "just worked" for all sorts of use-cases.

On a sidenote: the original build was React/Remix, but over time it became a slow, unmanageable mess (I can't vibe with React—[here's why](https://youtu.be/HyWYpM_S-2c?si=4xVzjAHVb5zlt1Vg) 🤣). I also really wanted to try SvelteKit for a serious project, so I started porting as a learning exercise. What started as weekend tinkering ended up going live in about two days. Honestly, I’m no React expert—maybe that’s why my app turned into spaghetti... but then again, I had exactly one day of SvelteKit knowledge before shipping to prod and it worked better than months of React code. Make of that what you will. Anyway, coming back—

After a few days of this rewrite, I casually dropped a [reddit post](https://www.reddit.com/r/ChatGPT/comments/12n2hso/building_a_tool_to_create_ai_chatbots_with_your/) about DocuTalk—didn’t think much of it. It blew up: over a million views, more than 2,500 likes, and something like 1,000 comments. Tons of folks were super interested and the traffic spiked, but the platform was brand new, still had a bunch of rough edges, and didn’t even have payments hooked up yet. I sort of freaked out and was completely clueless how to respond or handle all this. In my cluelessness, I just started DMing everyone who asked for an invite link in the comments—even though the "invite" was literally just a link to the login page. Reddit flagged this repeated fixed message from my account as spam and blocked me from DMing anyone for 2 days 😂. Meanwhile, a bunch of other builders making similar chatbots started hijacking my post, sneaking their own links into the replies to anyone who showed interest. Annoying, but honestly I'd probably have done the same thing if I were them. It's just business!

But to be honest, I didn’t get much conversion from that Reddit post. What it did help, though, was to surface a bunch of issues that needed fixing in the platform—and give me some user data about how people explored the product.

Over time, I also added Microsoft Clarity to see how users were actually interacting with things. Watching recordings made it super clear: after creating a bot, people were just being dropped into the control panel with zero guidance on what to do next—so they'd aimlessly move their mouse around, get confused, and leave. So I switched onboarding to a step-by-step wizard (create bot → train bot → customize → embed script), and conversion rates shot up after that. Apart from analytics/Clarity, I also tried to talk to a few customers to understand what they wanted and how they were using it—some wanted PDF support, some wanted integration with Freshdesk, some wanted the ability to add team members with different permissions, etc. All that user feedback drove what I built next.

After all this excitement, growth started slowing down. It was just hard for me to keep pushing it. I’m honestly not good at marketing—I tried posting on random subreddits, Quora forums, and other places, but nothing really worked.

I really did want to do the whole build-in-public thing and grow an audience, but being an introvert, putting myself out there in public felt nearly impossible. Plus, over time, I was getting bored of making only small improvements. I missed the thrill of building something totally new from scratch.

So I decided maybe it was time to let someone else take over, use any money from selling DocuTalk to fuel my next project or idea. Luckily, someone who’s great at marketing picked it up, rebranded as [fastbots.ai](https://fastbots.ai), and actually grew it much more than I could have doing it solo.

Not every project needs to be a rocketship. I made some money selling it, and the person who bought it made a lot more by marketing it well—a pretty good outcome for both of us. I’m actually happy with how it worked out, because I’ve proven to myself I can build a business end-to-end. If there’s anything I’ve really learned, it’s that my weakness is marketing—it always felt like the hardest part, and that’s totally fine with me. DocuTalk made life easier for a bunch of people, and is still running strong as [fastbots.ai](https://fastbots.ai). That’s a win in my book.

---

### Lessons Learned

- Use your strengths shamelessly: tech, marketing, or whatever — double down on what you’re good at. 💪
- Big viral spikes are cool 🚀, but product friction kills conversions fast. 🪤
- Measure everything: observe user interactions, talk to users, you can’t improve what you’re not measuring. 📊🕵️‍♂️
- If you get bored or hit a wall, it’s okay to move on and try something new. 🏃‍♂️
- Sometimes passing the baton is the best move for the product and for yourself. 🏅
- Talk to customers—you get real feedback, and honestly, it’s satisfying as hell to know real people are benefiting from something you built. 💬

---

P.S. This post was vibe-written with [Crush](https://github.com/charmbracelet/crush) ✨
