# Module 4 — Habitat Detective: Where Do Songbirds Nest?
**Time:** 45–55 min · **Mode:** Computer optional · **Handout:** `handouts/habitat-dataset.md`

Print the table, or project / share a doc so the class votes on mystery sites together.

## Hook (3 min)
“You work for a bird conservation group. Only a few pairs of **Azure Warblers** (fictional) are left. Where should we protect habitat?”

## Goals
- Find patterns in a nest-site table (unplugged ML).  
- Predict mystery sites.  
- Meet an exception that breaks the model.

## Step 1 — Training data (15 min)
Students get sites A–H (known nest / no nest).  
Prompt: “If you were a computer, what rules predict a nest?”

Likely pattern: cooler-moderate temp, high cover, high insects, low disturbance → Yes.

Capture class rules on the board (keep them short).

## Step 2 — Mystery sites (10 min)
Sites X–Z (and F/G style unknowns). Vote nest / no nest; then reveal.

## Step 3 — Mess with them (12 min)
Give a site that **has** high disturbance but **still has nests** (e.g., quiet courtyard inside a city, or a factor you didn’t measure: nest boxes).

Ask:
- “Our model said no. What went wrong?”  
- Possible answers: hidden factor, small dataset, birds adapted, biased sampling, luck.

Write the big idea: **Data isn’t the whole world. Models only know what we measured.**

## Wrap (5–8 min)
Preview Module 5: “What if almost all our ‘yes’ nests came from one park?”

## 5th–6th vs 7th–8th
- Younger: qualitative High/Low columns only.  
- Older: add a “confidence” rating (sure / kind of sure / guessing) before reveals.

## Assessment
Written rule + predictions for 3 mystery sites + one hypothesis for the exception.
