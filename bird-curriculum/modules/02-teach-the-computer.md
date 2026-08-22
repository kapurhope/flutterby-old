# Module 2 — Teach the Computer Which Beak Wins
**Time:** 45–55 min · **Mode:** Computer optional (paper first) · **Depends on:** Module 1 data (or sample table below)

Use a projector or shared spreadsheet only to display the class table faster — the “AI” is still the students’ rules.

## Hook (3 min)
“You already made a dataset. Now you *are* the AI.”

## Goals
- Find patterns that predict a good **habitat** from beak performance.  
- Predict for mystery birds.  
- Notice useless features (noise) and wrong predictions.

## Step 1 — Pattern hunt (12 min)
Project or hand out a combined class table, or this sample:

| Beak | Seed | Worm | Fruit | Water | Best habitat |
|------|------|------|-------|-------|--------------|
| Spoon | 18 | 4 | 12 | 20 | Wetland |
| Tongs | 12 | 19 | 15 | 5 | Forest |
| Fork | 7 | 21 | 8 | 3 | Forest |
| Tweezers | 4 | 17 | 10 | 2 | Forest |
| Cup | 20 | 2 | 5 | 25 | Wetland |
| Chopsticks | 8 | 16 | 9 | 4 | Forest |

Ask: “If you were a computer, what **rule** predicts habitat?”

Example student rule: *If Water score ≥ 18 → Wetland; else Forest.*

Students write rules on `handouts/rule-card.pdf`.

## Step 2 — Mystery birds (10 min)
Use `handouts/mystery-birds.pdf`. Groups predict habitat; class votes; reveal.

## Step 3 — Choose features (10 min)
List on board: beak length, beak width, **beak color**, wing length, seed score, worm score, habitat temperature…

Ask: “Which would you give an AI? Which is probably useless?”

Push: beak color often doesn’t predict food niche — that’s **noise**.

## Step 4 — Bad AI (10 min)
Show a “model” that always picks Wetland if the bird is *pretty* or *blue*.  
Or a mystery bird that breaks their rule (high water score but lives in forest because of nesting sites — a **hidden factor**).

Ask: “Did the AI fail, or did we train it with the wrong idea?”

## Wrap (5 min)
Exit ticket: “One thing AI needs from us is ___.”

## 5th–6th vs 7th–8th
- Younger: one rule, oral discussion of the trick.  
- Older: define **feature**, **training examples**, **prediction**; calculate how many mystery birds their rule got right.

## Assessment
Rule card + 3 mystery predictions + one sentence on a miss.
