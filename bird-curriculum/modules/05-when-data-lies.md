# Module 5 — When Data Lies
**Time:** 45–55 min · **Mode:** Hands-on + discussion · **Handouts:** `handouts/biased-dataset.pdf`, optional bird ID “trick” cards

## Hook (3 min)
“Yesterday’s AI was pretty good. Today we feed it **bad data** on purpose.”

## Goals
- See how biased samples create misleading rules.  
- Connect to real citizen science / AI limits.  
- Prefer **AI + human** over AI alone.

## Part A — Biased nest data (20 min)
Use `biased-dataset.md`: almost every “Nest = Yes” is from **Riverside Park** (high trees, low noise). Few samples from farmland or city.

Students rebuild a rule → it overfits Riverside (“nests need river + playground nearby” nonsense features).

Ask: “Can your AI still make good predictions for the whole region?”

Land the line: **AI doesn’t know what’s true. It finds patterns in what we gave it.**

## Part B — Look-alike trick (15 min) — “Sick plants” energy, bird version
Show cards / photos:
- Bright yellow bird that is **healthy** (e.g., goldfinch-style) vs yellow = “sick” rule from a bad model.  
- Or flightless / swimming birds that break “birds fly” rules (penguin).  
- Bat vs bird (if you want classification chaos).

Ask: “Did the AI fail, or did we teach it the wrong thing?”

## Part C — Tool, not boss (8 min)
Prompt: “Would you rather one person check 10,000 trees for nests, or cameras flag 200 suspicious spots for a human to check?”

Emphasize: **AI helps humans look closer — it doesn’t replace care or fieldwork.**

## Wrap (5 min)
Exit ticket: “One way data can lie is ___.”

## Assessment
Short paragraph: describe the biased set + one fix (sample more places, remove useless features, keep a human in the loop).
