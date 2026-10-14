# Chef — Game Design (id: `chef`)

**Title: Six Kitchens.** It says "six cuisines" at a glance and is short enough for a tile. Other options considered (all original; a web search found no game, show or well-known brand with these exact names, but run a trademark and store-name check before shipping):

1. **Six Kitchens** (chosen).
2. **The Warm Pass**: named after the shelf where finished plates wait. It sounds calm, not frantic.
3. **Ladle & Lark**: a nod to Larkspur, the town every studio game shares.

Tile tagline: "Cook your way from student to head chef, then choose your own kitchen."

This is the biggest Maker Studio game, at about **half of ADEEVA's depth**. It follows the studio contract (`work/0003-studio/design.md`) and its safety promise on every screen. You start at the **Larkspur Cookery School**, learn six cuisines from six mentors, then work the line at **Larkspur Market Hall**, a food hall where each mentor runs a counter. You climb to sous chef and then head chef. After that you pick one of three paths: **your own restaurant**, **a food truck on the festival circuit**, or **TV segments and a cookbook**. The game is savoury cooking under the gentle rush of service, so it is deliberately unlike Patisserie Atelier, which is about calm, decorative baking for one order at a time. All names, text, numbers and art are original.

## 1. Fantasy, audience and what it teaches

- **Fantasy:** "Tickets were stacking up, the pan was sizzling, I flipped the chicken at exactly golden, wiped the plate rim and called 'Service!' Then a critic wrote that my jollof rice was the best thing at the Hall." Being trusted with a kitchen, and getting faster and calmer at it.
- **Ages 8–15+.**
  - 8–11 play on Relaxed. Service has no clock (a new ticket arrives only when you send one), Assist toggles are offered at every station, and the business screens have an **Ask Hollis** button (§5.1). They enjoy the chop thunks, flipping things in the pan, building a plate and ringing the pass bell.
  - 12–15+ play Standard or Challenging. They juggle 3–4 tickets, set prices against costs, schedule a team and chase awards.
- **Reading level:** hints are one sentence of 12 words or fewer (about Grade 3; §3.7). Mentor and guest lines are 1–2 short sentences. Every number has an icon: coin, clock, heat dot, plate, star or spoon. Business words have kid labels (below).
- **What it honestly teaches:** steady timing and pointer control; doing several things at once and planning their order (prep before service, the pan keeps cooking while you chop); "taste as you go" as a habit of checking work; simple arithmetic about money (price minus ingredients is what is left, a price that is too high sells almost nothing, and leftover prep still cost coins); that teamwork and kindness are part of skill; and the names, ingredients and home regions of 24 real dishes. It does **not** teach real cooking, knife use, heat or food safety, and it says so.
- **Parent page sentence (exact):** "Chef uses game numbers and pictures, not real recipes, temperatures or knife skills. Real cooking needs an adult."

| Design term                | Label on screen                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| mise en place              | "Get ready" (the screen title "Mise en place" appears once, with "everything in its place") |
| tolerance / window / band  | never shown; green zones are the label                                                      |
| food cost / cost per plate | "Ingredients per plate"                                                                     |
| margin                     | "Left over per plate"                                                                       |
| P&L                        | "This week's money: in, out, left over"                                                     |
| covers                     | "Guests"                                                                                    |
| par level                  | "How many to get ready"                                                                     |
| waste                      | "Ready but not served"                                                                      |
| expediting                 | "Calling the pass"                                                                          |

## 2. Career structure

**Two starts at New Game** (ADEEVA has two starts too): **Cookery Student** (the default, the full ladder) or **Head Chef** (skips to rung 4 with reputation 60, 300 coins, every mentor met and every cuisine at Confident, so older players and testers can reach the paths fast). A Head Chef start opens with `ch-head-chef` instead of `ch-intro`.

**Calendar:** the engine's `dayHours` (10 h a day) and `week` (7 days). Rent or board is charged at the end of day 7 through `weekSettlement.settleWeek`, scaled by `weeklyRent` (×0 Relaxed, ×1 Standard, ×1.5 Challenging). Day 7 of every week is **Family Meal**: no lessons, shifts or tests. The **Practice kitchen** (any unlocked dish, 4 h, no pay, no mastery) and the tool shop are open every day, Family Meal included. **Pot-wash day** (`paidShift`) on every rung: "Washing pots at the Hall" pays 30 for a whole untouched day.

**Hours:** a lesson or private-order dish run takes 4 h. A test dish run takes 3 h (no separate mise hour; mise is folded into the cook stage). A **Hall shift** (one service) takes 6 h, and only one shift can be worked per day. On Head Chef, the 4 h left can hold one private-order dish run. Hours are reserved when a run, shift or test starts; a Graduation Practical or Tasting Day reserves all 9 hours at once, and setting a dish aside never gives hours back.

**Cuisine mastery:** each cuisine has mastery points. The levels are **Learner** (0), **Confident** (4) and **Expert** (10). Lessons, tests and private orders give per dish: a dish of that cuisine at 3★ gives +1, at 4★+ gives +2. A **service** gives mastery once, to its counter's cuisine (or to both cuisines at Sous and above; a head-chef or path service with no counter gives it to the two most-served cuisines): +1 at serviceScore ≥ 75, +2 at ≥ 88. Mastery unlocks that cuisine's dishes (§6.3), and at Expert the cuisine's dishes gain +0.1 appeal on menus.

| Rung              | Where                                                                                | Goal                                                          | Unlock rule (Standard)                                                                               | What changes in play                                                                                                                                                                                                                                                                                                                                              | Engine mapping                                                                                                                                                                                                                                                                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 Cookery Student | Larkspur Cookery School; a shared flat, board 40/week                                | Take one lesson with each of the six mentors                  | Start                                                                                                | Single-dish runs with all five cooking mini-games (§3). Ingredients are free. Lessons pay a stipend (fee 20–30), min quality 55.                                                                                                                                                                                                                                  | Gig board = **Class board**: 1 lesson offer per day (none on Family Meal), from the next mentor not yet met in the order Arjun, Lucia, Haruka, Rafael, Bastien, Efua, so the first lesson (dal tadka) uses all five cooking mini-games. The player can decline and practise; a missed lesson comes back the next day. `gigBoard` with mentor "clients"; `story` beats. |
| — Test            | Graduation Practical                                                                 | Cook 3 dishes from 3 cuisines (player's pick)                 | 6 lessons passed and rep ≥ 15                                                                        | One day: three 3 h test runs, average quality ≥ 66 (+6 Challenging). If it misses, the mentors give kind feedback and it can be retried the next day with no penalty.                                                                                                                                                                                             | A test gig with no fee; a pass sets `career = "line"`.                                                                                                                                                                                                                                                                                                                 |
| 2 Line Cook       | Larkspur Market Hall; a room above the Hall, rent 90                                 | Earn a regular spot on the line                               | —                                                                                                    | Days 1–6 offer **shifts** at mentor counters (one cuisine per shift). A shift is one **service** (§4): rail of 2, 6 tickets, all 5 stations yours. Wage 20, plus a service bonus through `settleReward` (fee 20).                                                                                                                                                 | Gig board = **Shift board** (2 offers a day, a different counter each; one can be worked).                                                                                                                                                                                                                                                                             |
| — Test            | Station Test                                                                         | Run one counter solo                                          | rep ≥ 35, 5 passed Line services, Confident in 2 cuisines                                            | A 4-ticket service at a counter of your choice, serviceScore ≥ 72 (+6).                                                                                                                                                                                                                                                                                           | Test gig.                                                                                                                                                                                                                                                                                                                                                              |
| 3 Sous Chef       | Market Hall, Main Kitchen; rent 120                                                  | Lead a shift and create daily specials                        | —                                                                                                    | Rail of 3, 8 tickets, up to 2 cuisines per service. One helper (**Teo**) can be put on any station. Each shift you set a **Daily Special** (below). Wage 30, bonus fee 30.                                                                                                                                                                                        | Shift board; the special is a field of the shift brief.                                                                                                                                                                                                                                                                                                                |
| — Test            | Tasting Day                                                                          | Cook a three-plate tasting for Hollis Varga, the Hall's owner | rep ≥ 55, 10 passed services in total (Line and Sous), Confident in 4 cuisines                       | One day: 3 plates × 3 h, a small plate, a main and a side from 3 different cuisines, each quality ≥ 78 (+6), plus a plating card for each.                                                                                                                                                                                                                        | Test gig.                                                                                                                                                                                                                                                                                                                                                              |
| 4 Head Chef       | Main Kitchen; rent 150                                                               | Run the Hall's menu                                           | —                                                                                                    | Write a weekly **6-dish menu** from unlocked dishes. Rail of 4, 10 tickets, 2 helpers (from the staff list, §6.5), private event orders on the gig board (§6.4). Wage 45, bonus fee 45.                                                                                                                                                                           | Shift board plus private orders (`MAX_ACTIVE_GIGS` 3).                                                                                                                                                                                                                                                                                                                 |
| — Crossroads      | Story beat `ch-crossroads`                                                           | Choose a path                                                 | rep ≥ 85, 12 passed head-chef services or private orders, and savings to cover the path's start cost | Three doors: Restaurant (start cost 900), Food Truck (600), TV & Cookbook (200, "studio kitchen kit"). Start costs ×0.5 on Relaxed. Before choosing, the player may **peek through each door** once: a read-only walk through that path's hub with Hollis's one-line tour. The choice is permanent for the save, and three save slots let a player try all three. | The rung stays `head`; the save gains `path` (the chosen path's state) and `peeked` (doors already peeked). The `ch-crossroads` beat queues the moment an action brings rep 85 and 12 passes together.                                                                                                                                                                 |
| 5a Own Restaurant | "Your Name's Table" (the player picks from 12 name cards) on Quayside Lane; rent 300 | Earn your 3 path awards                                       | —                                                                                                    | §5.1                                                                                                                                                                                                                                                                                                                                                              | Gig board = private bookings; nights are services.                                                                                                                                                                                                                                                                                                                     |
| 5b Food Truck     | "Clementine", a secondhand truck; parking 60/week                                    | Serve at all 8 festivals and win Festival Favourite at 3      | —                                                                                                    | §5.2                                                                                                                                                                                                                                                                                                                                                              | Gig board = **Festival board** plus private orders.                                                                                                                                                                                                                                                                                                                    |
| 5c TV & Cookbook  | "Spoon & Story" on Radio-and-TV Larkspur; flat rent 150                              | Finish a 4-chapter cookbook and its launch                    | —                                                                                                    | §5.3                                                                                                                                                                                                                                                                                                                                                              | Gig board = segment and book offers plus private orders.                                                                                                                                                                                                                                                                                                               |

**Daily Special (Sous):** pick an unlocked dish and a price (cost + 1 to 2 × fair; the first costing lesson, §5.1). The special has 12 portions and sells `min(12, round(12 × appeal × priceFactor))`, with `appeal` and `priceFactor` as in §5.1. It **sells out** when that is ≥ 12, which needs a price of about ≤ 1.1 × fair at appeal 1.1, or about ≤ fair at appeal 1.0. It pays the player a "special bonus" of `round(0.5 × (price − cost) × sold)` coins, and a sell-out gives +1 reputation.

**Trend tags for `settleTrendReward`:** Line services use the tags of the dishes served; Sous services use the special's tags; Head Chef and path services use the served menu dishes' tags. At most 2 matches count.

**Path chapter goals** give each path an ending scene. Play continues after that with no end, as in ADEEVA. **Pacing targets on Standard** (checked in §7): graduation on day 8, sous chef around day 16, head chef around day 23, and the Crossroads on days 29–34.

## 3. Core cooking loop (one `DishRun`)

`DishRun.stage` = `ticket → mise → cook → plate → pass → done`

| Stage  | Hours (4 h dish run) | What happens                                                                                                                                                                                                                                                                            |
| ------ | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ticket | 0                    | A ticket card shows the dish, any required taste tags or garnish, the minimum quality and (for private orders) the budget, fee and deadline. The live checklist (ADEEVA `checklist`) stays on screen.                                                                                   |
| mise   | 1                    | **Get ready:** drag each of the dish's 3–5 ingredient tiles (from §6.1) into small bowls on the board (a tap also works). Unscored, but a missing tile blocks Cook. It teaches the habit: everything in its place first. In a 3 h test run, mise is folded into the cook stage's hours. |
| cook   | 2                    | The dish's step list (§6.3) runs in order. Each step is one mini-game below.                                                                                                                                                                                                            |
| plate  | 1                    | Plate It (§3.5). Plating is saved as the dish's **plating card** for later services.                                                                                                                                                                                                    |
| pass   | 0                    | Tap the pass bell (64 px). "Service!" The plate slides under the warm lamp. Ringing evaluates once and rewards once (idempotent per run id), then Results show. The plate goes into the **Dish Diary** (the newest 40 are kept) and becomes the dish's plating card.                    |

The steps before the first cook step can be revisited (ADEEVA `canGoBack`).

**Input rules for every mini-game:** Pointer Events only, mouse and touch, with no hover needed. Every target is at least 44×44 px, and the main action buttons are 64 px. Keyboard alternatives are listed. Scoring lives in core: the UI runs the `useTickLoop` animation and sends counts or event logs, and core replays and validates them. Tolerances = **base × trait × upgrade × difficulty**: Perfectionist ×1.2; difficulty `toleranceMultiplier` 1.3 / 1 / 0.85. **Assist caps a step at 0.8** (`assistCap.cappedAccuracy`). Pause is always one tap away and freezes every tick loop.

The five cooking mini-games each use a different skill: **Chop** is rhythm, **Sizzle** is attention to several things, **Simmer** is following, **Taste** is reasoning, and **Plate** is composition. Service Rush (§3.6) is planning.

### 3.1 Chop (knife prep, rhythm)

- **Input:** the ingredient lies on a board. Dashed cut marks scroll toward a fixed knife line at the ingredient's tempo, and you tap anywhere on the board (the whole 320 px board is the target) as each mark crosses the line. **Slice** is one pass of 4–8 marks. **Dice** is two passes: the board turns 90° and a second row follows. **Mince** (herbs and garlic) is a held stretch: press for the green length of the line and release at its end. The knife moves by itself. No hand is ever drawn near the blade, and no hand or grip icon is drawn at all; the player's input is a tap on the board.
- **Tempo:** 60–100 marks per minute by firmness (onion 72, firm squash 60, herbs 100 as a hold). On Challenging the tempo is ×1.1.
- **Scored:** for each mark, `Δ` is the tap offset in ms. `w = 110 ms × trait × upgrade (Knife Roll 1.15) × difficulty`. A mark scores 1 if `|Δ| ≤ w`, 0.5 if `|Δ| ≤ 2w`, otherwise 0; a missed mark scores 0. A mince hold scores the overlap share of the green stretch, falling off over 2w at each end. `chopAccuracy = mean`. On Standard the perfect window is ±110 ms (±143 ms on Relaxed).
- **Record and checks:** `{itemId, offsets: (int ms | null)[], assisted}`, with one entry per mark, each `|Δ| ≤ 1000`, and a fixed length per item. Extra taps between marks are ignored and never penalised.
- **Assist** ("Auto-rhythm"): holding the board chops on the beat by itself. Capped at 0.8. Keyboard: Space taps.
- **Timing:** a board starts with a Start button and two lead-in beats. Dice turns the board for two beats between its passes, and a mince stretch lasts four beats. A tap counts for the nearest unscored mark within 2w.
- **Fun at 8:** a satisfying thunk, and pieces hop apart into a neat pile. **At 15:** firm squash slows the beat, herbs need a held mince, and Challenging speeds it all up.

### 3.2 Sizzle (pan heat and timing; several pieces at once)

- **Input:** a top-down pan with a hot **centre** (inner 55% of the radius, glowing) and a cooler **rim**. Set the heat dial to 1–5 dots (56 px snap knob); the ideal is printed on the dish card. 2–5 pieces go in (chicken pieces, plantain slices, gnocchi, egg layers for tamagoyaki, bread for croque-monsieur). Each piece has a cook ring that fills, side by side. **Tap** a piece (at least 48 px) to flip it; after a piece's flip, further taps on it do nothing. **Drag** it between centre and rim to speed it up or slow it down. Drag it onto the **Done** tray to take it off. **Swipe up** across the pan tosses and flips every piece not yet flipped (good for spice tempering, where the "pieces" are 3 seed clusters).
- **Cook rate:** `heatDots ÷ idealDots × zone (centre 1.0, rim 0.45) × pieceRate`. A side is done at `c = 1` after about 6 s on Standard at the ideal heat. Colour stops: pale < 0.8, light 0.8–0.9, golden 0.9–1.1, deep 1.1–1.3, extra-crispy > 1.3. There is never smoke or flame (§10).
- **Scored:** each side `s = 1` if `|c − 1| ≤ win`, else `max(0, 1 − (|c − 1| − win) ÷ 0.3)`, with `win = 0.10 × trait × upgrade (Heavy Pan 1.2) × difficulty`. `heatFit = 1 − 0.08 × |dots − idealDots|`. `sizzleAccuracy = heatFit × mean of all sides`. So low heat is slower and also scores a little less: the right heat matters.
- **Record and checks:** an event log `{pieceId, events: [{tick, kind: "zone-centre"|"zone-rim"|"flip"|"off"}], heat, assisted}`. Core replays it at 60 ticks/s to compute every `c`. Ticks are whole numbers and strictly increasing; each piece has exactly 1 flip (2 for egg layers) and exactly 1 off; the whole pan lasts at most 3600 ticks. A piece left on is taken off by itself at `c = 1.6`.
- **Assist** ("Pan helper"): the dial is preset, and a bell plus a 48 px arrow mark each piece that is ready to flip or take off. Capped at 0.8. Keyboard: arrows choose a piece, F flips, D takes it off, M moves it.
- **Setup:** pieces go into the centre. The heat dial is set before the pan starts and stays put while it cooks.
- **Fun at 8:** popping sizzle sounds and flipping everything at once. **At 15:** five pieces at different paces, so you park the slow ones in the centre and the fast ones on the rim.

### 3.3 Simmer (sauce and soup; `followRecord`)

- **Input:** a pot from above. A glowing **guide spoon** travels a path (a circle for soups, a figure-eight for sauces, a zigzag "scrape" for risotto and dal) at a steady speed. Hold and keep your spoon inside the guide's halo. A level line on the pot's side falls from the start mark toward the target mark while you stir. When the level is in the target band, press **Off the heat** (64 px).
- **Scored:** at 60 ticks/s while pressed, a tick is inside when the distance to the guide is ≤ `r = 28 units (400-unit canvas) × trait × upgrade (Long Ladle 1.15) × difficulty`. `followAccuracy = insideTicks ÷ ticks`. The level only falls while you hold (the pot waits when you let go; nothing catches or burns). `levelScore = 1` if `|level − target| ≤ 0.06`, else `max(0, 1 − (|level − target| − 0.06) ÷ 0.2)`. `simmerAccuracy = 0.7 × follow + 0.3 × level`. The level falls with stir progress and meets the target line after 80% of the laps, so stirring every lap carries it past the line.
- **Record and checks:** `recordFollow` with `FollowBounds {units: laps (1–4; 1 in the service quick version), minTicksPerUnit 40, maxTicksPerUnit 1200}`, plus `{stoppedLevel (0–1, 2 decimals)}` committed once.
- **Assist** ("Steady ladle"): the halo widens ×1.6 and the pot stops itself at the target. Capped at 0.8. Keyboard: holding Space follows the guide at an in-halo pace.
- **Why it differs from Patisserie's Stir:** Stir keeps a speed in a band; Simmer follows a moving leader along changing shapes, then judges a stopping point.
- **Fun at 8:** chasing the glowing spoon round a bubbling pot. **At 15:** figure-eights at speed with a tight halo, and stopping exactly on the line.

### 3.4 Taste & Season (balance puzzle)

- **Input:** the **Taste Compass**, a 13×13 grid with axes **Bright ↔ Rich** (x) and **Gentle ↔ Warm** (y), plus a **Savoury** row of 3 dots. Each dish has a start point and a target circle. The cuisine's 4 seasoning jars and a **Savoury pinch** jar sit below (each 56 px). Tapping a jar adds one pinch, which moves the hidden taste point by the jar's vector (§6.2). The **Taste** spoon (64 px) reveals the current point with a little steam puff. You can always tap **Undo last pinch**.
- **Scored:** `d` is the distance from the final point to the target centre. `r = 1.0 unit × trait × upgrade (Spice Tin 1.2) × difficulty`. `base = 1` if `d ≤ r`, else `max(0, 1 − (d − r) ÷ 3)`. Savoury: ×0.85 for each dot off the target (target 1–3). Tidy: pinches beyond the minimum + 2 cost 0.05 each (floor 0.6). Tastes: the first 3 are free; on Standard and Challenging each later taste costs 0.03 (floor 0.85), and on Relaxed tastes are free. The savoury row starts at 0, and the minimum for the tidy rule counts the savoury pinches needed too. Every target is reachable in 2–4 pinches with that cuisine's jars (a content test proves it, §6.2). The puzzle is solved by reasoning: "it's too warm, so add something that moves it toward Gentle."
- **Record and checks:** `{pinches: jarId[] (≤ 20), tastes: int ≤ 20, assisted}`. Core replays the vectors, so the UI never sends a position.
- **Assist** ("Taste helper"): the point is always visible and a dotted arrow suggests the next jar. Capped at 0.8. Keyboard: number keys 1–5 pick jars, T tastes.
- **Real lesson:** taste as you go. The hint line says exactly that.
- **Fun at 8:** a "detective" game: taste, guess and fix. **At 15:** solve it in the fewest pinches and tastes.

### 3.5 Plate It (`placedPose` and geometry)

- **Input:** a 400×400 plate, with the rim at radius 190 and the **well** at radius 150. The dish's 2–5 components (base, hero, sauce swoosh stamp, 1–3 garnishes) are dragged on, rotated in **45° steps** (`Rotation`) and scaled 0.8–1.2 (inside `MIN/MAX_PLACED_SCALE`). Scale is applied to the shape before `placedPolygon` by a new engine helper `scaledShape`; `x`/`y` are the top-left of the rotated bounding box, as `placedPolygon` expects. The plate's colour is chosen from 4 (white, slate, sand, glaze-blue). A **Wipe rim** cloth (56 px) clears drips.
- **Scored (composition rules, never taste in art):** `inWell` is the share of components whose placed polygon stays inside the well. `spacing = max(0, 1 − 0.25 × disallowedOverlaps)`, where `polygonsOverlap` counts pairs that may not overlap; a base (a bowl or a bed of rice) may sit under anything, and a sauce may sit under the hero. Each component's scoring shape is a 12-point ellipse of its size, and scale moves in 0.1 steps. `focus = 1` if the hero's centre (the centre of its placed polygon's `polygonBounds`) is within `40 × trait × upgrade (Plating Spoons 1.2) × difficulty` units of the plate centre or of one of 4 "thirds" points (±55, ±55), falling off linearly to 0 at +80 units. `garnish` = 1 if the plating brief's count is met, else 0.7. `plateAccuracy = (0.4 × inWell + 0.3 × spacing + 0.3 × focus) × garnish`, and the drips factor is ×0.95 unless the rim was wiped.
- **Plating card:** the final poses are saved per dish (`PlacedPose` fields `{x, y, rotation, scale, layer}` plus `componentId`, and the plate colour) and are reused in service.
- **Assist** ("Ghost plate"): a faint suggested layout that pieces snap to within 30 units. Capped at 0.8. Keyboard: Tab picks a piece, arrows move it, R rotates.
- **Fun at 8:** building a pretty plate in any style that still scores well. **At 15:** off-centre thirds compositions, contrast with the plate colour, clean rims.

### 3.6 Service Rush (ticket juggling, 2–4 tickets)

This is the service-mode mini-game, described fully in §4. It is scored on dish quality, sending tickets reasonably on time, and handling them yourself. Its skill is **planning order and parallel work**: start the slow pan first, chop while it cooks, and taste while the pot reduces.

### 3.7 Hint lines (≤ 12 words)

Each station shows exactly one instruction line at a time, chosen from its current phase (ready, running, paused or done, plus the cut, flip, level or taste state). The kitchen coach bubble appears only on the ticket, so it never repeats or contradicts a station line.

| Screen                   | Hint                                                       |
| ------------------------ | ---------------------------------------------------------- |
| Get ready                | Drag each ingredient into a bowl. Everything in its place! |
| Get ready (all in bowls) | All in place! Tap Start cooking.                           |
| Chop (slice)             | Tap the board as each mark meets the knife line.           |
| Chop (dice)              | The board turns. Keep tapping on the beat!                 |
| Chop (mince)             | When green reaches the knife, press and hold the board.    |
| Chop (mince, held)       | Keep holding, then let go when the green ends!             |
| Chop (Auto-rhythm)       | Hold the board down and the knife keeps the beat.          |
| Sizzle (before the pan)  | Set the heat to {n} dots, then tap Into the pan!           |
| Sizzle (cooking)         | Flip each piece at golden: tap it, or swipe up for all.    |
| Sizzle (all flipped)     | When each piece is golden, drag it onto Done.              |
| Simmer                   | Keep your spoon in the glow. Stop on the line.             |
| Simmer (on the line)     | On the line! Tap Off the heat now.                         |
| Taste (first)            | Tap Taste to find where the dish is.                       |
| Taste (after a pinch)    | Pinch added. Taste as you go: tap Taste again!             |
| Plate                    | Drag each part from the tray onto the plate.               |
| Plate (all placed)       | Lovely! Now tap Wipe rim to clean the edge.                |
| Pass                     | Tap the bell to send it out. Service!                      |
| Service                  | Start the slow pan first. Chop while it cooks.             |
| Menu & Prices            | Price minus ingredients is what's left over per plate.     |
| How many to get ready    | Get ready about what guests will want, not more.           |
| Schedule                 | Every night needs a cook. Nobody works more than four.     |
| This week's money        | Money in, money out, and what's left over.                 |
| Festival map             | Pick a festival. Match its tastes with your three dishes.  |
| Cue cards                | Put the cards in cooking order, then pick kind tips.       |
| Assist fallback          | Stuck? Turn on the helper. Switch back anytime.            |
| Safety (Board, Hob, Pot) | Real knives, hobs and pots: ask an adult first.            |

### Dish quality

`quality = round(100 × (0.95 × Σ wᵢ·accᵢ + 0.05 × tagFit))`, where `wᵢ` are the dish's step weights (§6.3, summing to 1) and `tagFit` is the share of the brief's required taste tags the dish carries. An unfinished step counts as 0.

## 4. Service mode (Line Cook and up)

- **Shift length:** a Hall shift (one service) takes 6 h of the day, and only one shift can be worked per day. On Head Chef, the 4 h left can hold one private-order dish run.
- **Screen:** the **ticket rail** across the top (paper slips: table number, dishes, a soft progress ribbon). The **five stations** sit as big tabs along the bottom: **Board** (Chop), **Hob** (Sizzle), **Pot** (Simmer), **Spice** (Taste) and **Pass** (Plate). The station view fills the middle. Each dish's steps run in its listed order, every station keeps a queue of dishes waiting for it and opens on the oldest, and a ticket goes out the moment its last dish leaves the pass. Before the restaurant's Second Hob Ring, the hob holds one pan at a time.
- **Rail size and tickets:** Line Cook 2 / 6 tickets, Sous 3 / 8, Head Chef and paths 4 / 10. Each ticket holds 1–2 dishes (Head Chef: up to 3). Arrival times are seeded and spread over the first 70% of the service. When the rail is full, new tickets wait politely in the printer. No one waits visibly, gets angry or leaves.
- **Quick versions** keep a service flowing: Chop has 4 marks per ingredient (the 2 main ingredients only); Sizzle has 1–3 pieces; Simmer is 1 lap; Taste starts from your last solved taste for that dish with a seeded drift of ±1 unit, so one taste and 0–2 pinches fix it. If you have no solved taste for that dish yet, Taste starts at the dish's start point with the Taste helper's arrow shown, uncapped (it does not count as assisted). Plate places your plating card by itself, and you tap **Wipe rim** and **Service!**. If a dish has no plating card yet, Ghost plate is used and plating is scored at 0.75.
- **Parallel work:** pans and pots keep cooking while you are at another station. A station tab pulses (or shows a solid ring with reduced motion) and gives a small chime when a flip, a take-off or an Off the heat is due. A piece left too long goes extra-crispy; it is never burned or on fire, and there is never an alarm.
- **Gentle clock:** the service lasts 4:00 of real time on Standard and 3:20 on Challenging. The clock appears as a lamp slowly dimming over the window. **Pause** (64 px, top right) freezes everything, and a hidden tab pauses by itself. Each ticket has a target of 75 s (Line), 70 s (Sous) or 65 s (Head and paths), counted from when it reaches the rail. `onTime = 1` if it is sent by the target, else `max(0.5, 1 − (t − target) ÷ 120)`. A late ticket never scores below half and is never refused.
- **Relaxed:** there is no clock; a new ticket arrives only when you send one, `onTime = 1` for every ticket, and the warm lamp never decays. A **Let the team finish** button ends the service when you want.
- **Warm lamp:** a finished dish waiting for its ticket-mate holds full quality for 20 s, then loses 1% a second down to a floor of 85% (30 s with the Warming Pass upgrade).
- **End of service:** tickets still open are "finished together by the team" at accuracy 0.6 and onTime 0.4, with the kind line: "Team effort! Everyone got fed."
- **Score:** `serviceScore = round(100 × (0.65 × avgDishQuality ÷ 100 + 0.25 × avgOnTime + 0.10 × handledShare))`. `handledShare` is the share of dishes the player handled: a dish counts as handled when the player played at least half of its step weight (staff and team-finished steps do not count).
- **Staff and helpers:** drag a staff card onto a station tab to assign them. That station's steps then finish by themselves at the staffer's skill (0.65–0.80, never above the assist cap), one at a time: 8 s after the step became ready and 8 s after the staffer's previous step. The player can tap in and take over at any time. Sous has 1 helper, Teo (0.75 on every station). Head Chef picks 2 helpers for each service from Tavi, Lin, Yaw, Esme, Nilufar and Sol, and a restaurant has the scheduled team (§5.1). Restaurant upgrades add a second hob ring (Sizzle runs 2 pans), the Warming Pass, and a Prep Fridge, which starts each service with Chop done for the 2 most-ordered dishes at 0.8.
- **Service minimums (pass gate):** a service passes only if `handledShare ≥ 0.5` (Relaxed: at least 1 dish handled) **and** serviceScore meets the rung's minimum: Line 55, Sous 60, Head 65, paths 65 (+6 on Challenging). Missing the handled share is always a kind soft fail: "The team carried tonight. Let's cook more of it together tomorrow." The reward goes through `settleReward` (§7).

## 5. Business layer per path

### 5.1 Own restaurant ("Your Name's Table", Quayside Lane)

- **Week shape:** days 1 and 7 are closed (day 1 is the Market Run and planning, day 7 is Family Meal); days 2–6 are **service nights** (6 h each). Private bookings from the gig board fill the free daytime hours (4 h dish runs).
- **Menu design:** 4–8 dishes from unlocked dishes, with at least 2 cuisines and at least 3 different taste tags (framed as variety for guests). Each dish card shows **Ingredients per plate** (cost from §6.3), a **Fair price** of `Math.round(3 × cost)` and your price slider (1-coin steps, from cost + 1 to **2 × fair**). The card also shows **Left over per plate** = price − cost, in green.
- **Guests per night:** `guests = min(capacity, round(10 + rep ÷ 5 + buzz ÷ 10 + 2 × hotTagMatches))`. Capacity = 16 + 6 per cook on shift + upgrades (Garden Tables +6, Bigger Dining Room +8). Each guest orders 1.5 plates on average (seeded: 1 or 2).
- **Demand by dish:** `appeal_d = 1 + 0.1 × trendMatches + 0.1 (Expert cuisine) + 0.05 × (stars on its plating card − 3)`. `share_d = appeal_d ÷ Σappeal`. `priceFactor_d = clamp(2 − price ÷ fair, 0.1, 1.3)`. `wanted_d = round(guests × 1.5 × share_d × priceFactor_d)`. Guests who were not tempted "kept it simple tonight", with no anger. With fair = 3 × cost, profit per guest-slot is `(p − c) × (2 − p ÷ f)`: about 2.08 × cost at the sweet spot of 1.17 × fair, 2.0 × cost at fair, 1.43 × cost at 0.7 × fair, and only 0.5 × cost at 2 × fair. The value critic notices above 1.1 × fair. This is the costing lesson: cheaper is not always better, and dearer is not always better.
- **Get ready (par levels):** before each night, set "how many to get ready" per dish (0–30; a new menu dish starts at 8). The portions' ingredients are bought at cost when the doors open (the night's Market Run, rounded up to a whole coin), minus any portions the Walk-in Fridge kept; the coins must cover it, so a low jar means getting ready fewer portions. Plates sold = `min(par_d, wanted_d)`. Wanted plates above par spill 50% to other dishes, up to their par ("Sold out, so they picked the ratatouille"); the other half is simply not sold, with no anger. Portions left over are "Ready but not served": they go to the Larkspur Community Fridge (a kind line), but the coins were spent. The Walk-in Fridge upgrade carries half of them to the next night.
- **Ask Hollis (Relaxed):** one button on Menu & Prices, Get ready and Schedule fills in a fair price for every dish (and, if the menu is not valid yet, a six-dish starter menu across the kitchens), par levels from expected `wanted_d` (capped at 30), and a valid schedule (hiring the first free cooks until there are two, sharing the five nights between the cooks, and putting a host or Clean Team member on Tuesday to Friday). The player can change anything afterwards, so 8–11s can play the path without spreadsheet work.
- **Staff and schedule:** hire up to 4 of the 8 staff (§6.5). The schedule grid is 5 nights × staff, and each staffer works at most 4 nights a week (a kind-workplace rule). Each night needs at least 1 cook (the doors stay shut without one); guests above 20 need a host on shift, or capacity is held at 20. Wages are paid per night worked, when the night ends. Letting someone go is "Thank and part ways": they leave a card and can be rehired later.
- **Service:** the night's first 10 tickets are played as Service Rush (§4: rail 4, up to 3 dishes a ticket, target 65 s, minimum 65), with the cooks on tonight's schedule as helpers, and serviceScore comes from those. The rest of the guests are cooked by the team at the night's average team skill and count as plates sold. `serviceScore` drives reputation, buzz, reviews and tips: Charmer +10%, and every score ≥ 85 adds a "Happy guests" tip of 2 coins per guest.
- **Reviews and reputation:** 3 critics (§6.4), each visiting once in any 2-week block on a seeded night. They are announced on the night only as "a quiet guest with a notebook at Table 7". The critic's ticket is highlighted. The critic nights are rolled for each 2-week season (counted from the day the restaurant opens) among its service nights, and on a critic's night one ticket is seated at Table 7 and marked with a notebook. The review gives `1 + food (2 at quality ≥ 85, 1 at ≥ 70) + warmth (1 at onTime ≥ 0.9) + value (1 when every dish on the ticket is priced ≤ 1.1 × fair)` spoons, with one kind line for each part. Guests leave **kind guest notes** (2 per night, chosen from score bands). Notes are always about the food and the visit, never about people's looks.
- **Weekly money ("This week's money")** runs all week and closes on day 7 (the hub shows this week so far and last week): **In:** plates sold, tips, bookings, shows and book money, and pot-wash days. **Out:** ingredients, team pay, rent (300, +40 with the Bigger Dining Room) and upgrades (and on the truck, pitch fees and helpers). Lines that are 0 are hidden. **Left over:** the difference, with an arrow up or down. "Ready but not served" shows its coin cost as a separate line, with a tip: "Get ready a little less of the quiet dishes." If coins go below 0 on Standard or Challenging, buying is blocked until shifts or a good week refill them, and the Hall always offers a pot-wash day. On a path, a night only opens when the coins cover the Market Run and the plates cover tonight's team pay, and the week's rent never takes coins below 0, so a lean week ends at 0 and a pot-wash day buys the next small Market Run. There is no debt and no game over.
- **Awards (§6.7):** Warmest Kitchen and Best New Table are judged on the first morning after each 2-week season; season money counts every in and out line, including rent. The chapter ends (beat `rs-chapter-end`) when you hold your 3 path awards.

### 5.2 Food truck & festivals ("Clementine")

- **Festival calendar:** 8 festivals (§6.8) on the **Festival board**, with 3 open festival days a week (seeded among days 2–6). The rotation is a seeded fixed cycle, so all 8 festivals appear within 3 weeks. Pick up to 3 a week; a festival costs its pitch fee and takes 6 h. Other days hold private orders (at most 1 open at a time), the Market Run or pot-wash days. There is no weather system and every festival goes ahead.
- **Limited menu:** 3 dishes and their prices, set per festival, using the restaurant's Menu & Prices screen. Each festival's crowd has 2 taste tags (§6.8) that add appeal +0.15 per match. The truck fridge holds 40 portions, split across the 3 dishes on the Get ready screen (the fridge split is the par level).
- **Crowd and demand:** `guests = round(crowd × (0.5 + rep ÷ 200))`. Each dish's `wanted_d` uses the restaurant formula (§5.1), and plates sold = `min(fridge_d, wanted_d)`, with the same 50% sold-out spill.
- **Hatch Rush:** Service Rush with a rail of 3, Board, Hob, Pot, Spice and Pass in one tiny truck kitchen. The first 8 tickets are played as Hatch Rush and give serviceScore; the rest are cooked by you and your helper at the helper's skill and count as plates sold. One helper is hired per festival day from §6.5 at a flat 25 and uses their own skill.
- **Festival Favourite ribbon:** serviceScore ≥ 85 earns the festival's ribbon in the truck's window.
- **Money:** plates × price − portions × cost − pitch fee − helper; weekly parking 60. The pitch fee, the helper and the fridge's Market Run are paid when the hatch opens (the coins must cover them), and plate money arrives when the rush ends. The same "This week's money" card is shown. Truck and TV take one private order at a time.
- **Chapter end:** when Clementine has served at all 8 festivals and holds 3 ribbons, `tr-chapter-end` plays.

### 5.3 TV chef & cookbook ("Spoon & Story")

- **Fame here means skill and kindness.** There are no follower counts, view numbers, likes or looks. Fame shows as **Letters from young cooks** and reputation. Every letter that mentions cooking also mentions an adult ("Your 'taste as you go' tip helped me make soup with my grandad").
- **Segment prep (2 h):** choose an unlocked dish. Then put **3 cue cards** in the right order (tap a card to place it in the next slot; Shuffle back starts again). The cards are "Get ready", the dish's first chop, sizzle or simmer step, and "Taste and season" (or "Plate it" when the dish has no taste step); they are dealt shuffled, never already in order, and the tip choices are listed in the dealt order so they never give the order away (a sequencing puzzle: "Get ready", "Sizzle the plantain", "Taste and season"). Then pick a **Kind tip** for each card from 3 options, one of which is clearly kind and clear (for example "If it's too warm, a squeeze of lime helps" versus "Just guess"). The tip set never includes a heat or knife instruction. A **Cook with an adult** badge always shows in the segment's corner.
- **Live segment (4 h):** the full dish run with a calm studio clock (8:00 of game time, no clock on Relaxed) and the cue cards shown above the stations, the current one lit. Prep and live take 6 h, so a day holds one segment. The studio clock is counted from the run itself: Get ready 1:00, 0:30 a chopped ingredient, 1:30 for the pan, 0:30 a lap of stirring, 0:20 a taste and 0:10 a pinch, and 1:00 to plate; over 8:00, `onClock = max(0.5, 1 − over ÷ 4:00)`. A segment passes at segmentScore 65 (+6 on Challenging). Every segment of 4★ or more brings the next of 8 letters from young cooks. `segmentScore = quality × (0.6 + 0.25 × clarity + 0.15 × onClock)`, with clarity = cue order correct ×0.5 + kind tips ×0.5, so a clear segment on the clock scores its cooking quality and a muddled one keeps at least 60% of it. Fee = 120 + 30 × stars, through `settleReward`. Up to 2 segments a week.
- **Cookbook:** offered after 2 segments of 4★ or more, with an advance of 250. It has **4 chapters**: Weeknight Warmers (comforting, warming or hearty dishes), Festival Food (bold, crunchy, smoky or colourful), Fresh & Bright (fresh, zesty or delicate) and Around the Hall (one dish from each of three different kitchens). A chapter needs 3 **recipe cards**, and a dish can appear on only one card. A card is composed automatically from the dish's plating card (title banner, the plated dish, 3–5 step icons from the dish's steps, and a "Cook with an adult" badge that cannot be removed), and the player picks 1 of the chapter's 3 tip bubbles for it (all three are kind; the choice is the player's own voice). Each card's dish must also be **tested**: cooked at 4★ or better on any dish run after the path begins, or holding a 4★ plating card when the path begins. Cards show icons only, with no amounts, temperatures or times (§10). A finished chapter pays 150 and gets a **kind critic** review (§6.4): 4 spoons, or 5 when all three dishes' plating cards are 5★, with the chapter's own line.
- **Book launch:** when all 4 chapters are done, a launch at the Larkspur Library (6 h). This is a cooking demo for kids, played as a 6-ticket Service Rush of tasting cups (rail 4, one book dish a ticket), scored like any service for reputation and buzz. Then the chapter-end beat plays and the **Golden Page** award is given.

## 6. Content catalog (ids are kebab-case `as const`)

**Taste tags** (Chef's own trend pool for the generic `trendMarket`, 10): `comforting, fresh, zesty, warming, crunchy, hearty, delicate, colourful, smoky, bold`. "Town cravings" picks 2 hot tags a week. ADEEVA's `dreamerFlair` works unchanged, because `bold` is in the pool and garnish colours count as colours.

### 6.1 Ingredients (60; coins per portion)

| Group        | ids (cost per portion)                                                                                                                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared       | `onion` (0.3), `garlic` (0.2), `ginger` (0.3), `tomato` (0.4), `fresh-chilli` (0.2), `lime` (0.3), `lemon` (0.3), `coriander-leaf` (0.2), `butter` (0.4), `eggs` (0.5), `chicken` (1.6), `olive-oil` (0.3) |
| Italian      | `spaghetti` (0.5), `arborio-rice` (0.6), `pumpkin` (0.6), `parmesan` (0.8), `basil` (0.3), `potato` (0.3), `pine-nuts` (0.9), `cannellini-beans` (0.4)                                                     |
| Indian       | `toor-dal` (0.4), `chickpeas` (0.4), `tamarind` (0.3), `curry-leaves` (0.2), `green-peas` (0.3), `basmati-rice` (0.5), `cumin-seeds` (0.2), `garam-masala` (0.2), `turmeric` (0.1), `ghee` (0.4)           |
| Japanese     | `short-grain-rice` (0.5), `nori` (0.3), `miso` (0.4), `dashi` (0.3), `tofu` (0.6), `soy-sauce` (0.2), `spring-onion` (0.2), `salmon-flakes` (1.4)                                                          |
| Mexican      | `corn-tortillas` (0.5), `tomatillo` (0.5), `avocado` (0.9), `corn-cob` (0.5), `queso-fresco` (0.8), `queso-cotija` (0.8), `crema` (0.5), `ancho-chilli` (0.3)                                              |
| French       | `aubergine` (0.5), `courgette` (0.4), `bell-pepper` (0.4), `cream` (0.5), `gruyere` (1.0, shown as "Gruyère"), `bread` (0.3), `ham` (1.0), `fines-herbes` (0.3)                                            |
| West African | `long-grain-rice` (0.4), `scotch-bonnet` (0.2), `plantain` (0.6), `black-eyed-beans` (0.4), `red-palm-oil` (0.4), `mustard` (0.2)                                                                          |

**Dish cost rule:** the sum of its ingredients' costs, **rounded up to the next 0.5**; fair price = `Math.round(3 × cost)`. Costs are stored in tenths of a coin so the sum has no float drift. A content test recomputes every dish's cost and fair price from its ingredients. Nothing spoils in storage; waste only comes from portions got ready and not served (§5.1).

### 6.2 Seasoning jars (Taste Compass vectors: x = Bright+ / Rich−, y = Warm+ / Gentle−)

| id                    | name            | vector   | savoury dot | used by                                    |
| --------------------- | --------------- | -------- | ----------- | ------------------------------------------ |
| `lemon-squeeze`       | Lemon squeeze   | (+2, 0)  | —           | Italian, French                            |
| `lime-squeeze`        | Lime squeeze    | (+2, −1) | —           | Mexican, Indian, West African              |
| `chilli-flakes`       | Chilli flakes   | (0, +2)  | —           | Italian, Mexican                           |
| `black-pepper`        | Black pepper    | (0, +1)  | —           | French                                     |
| `butter-knob`         | Knob of butter  | (−2, −1) | —           | French                                     |
| `parmesan-grate`      | Grated parmesan | (−1, 0)  | +1          | Italian                                    |
| `garam-masala-pinch`  | Garam masala    | (−1, +2) | —           | Indian                                     |
| `ginger-paste`        | Ginger          | (+1, +1) | —           | Indian, Japanese, West African             |
| `soy-dash`            | Soy sauce       | (−1, 0)  | +1          | Japanese                                   |
| `rice-vinegar`        | Rice vinegar    | (+2, −1) | —           | Japanese                                   |
| `scotch-bonnet-pinch` | Scotch bonnet   | (0, +2)  | +1          | West African                               |
| `palm-oil-drizzle`    | Red palm oil    | (−2, 0)  | —           | West African                               |
| `crema-spoon`         | Crema           | (−1, −2) | —           | Mexican                                    |
| `fresh-herbs`         | Fresh herbs     | (+1, −1) | —           | Italian, Indian, Japanese, Mexican, French |
| `savoury-pinch`       | Savoury pinch   | (0, 0)   | +1          | all                                        |

Each cuisine shows exactly 4 jars plus `savoury-pinch`: **Italian** lemon, chilli flakes, parmesan, fresh herbs; **Indian** lime, garam masala, ginger, fresh herbs; **Japanese** ginger, soy, rice vinegar, fresh herbs; **Mexican** lime, chilli flakes, crema, fresh herbs; **French** lemon, black pepper, butter, fresh herbs; **West African** lime, ginger, scotch bonnet, red palm oil. Rice vinegar and lime share a vector on purpose (different cuisines, the same idea of brightness). No cuisine's jars are "hotter" than another's by design: the largest warm step is +2 everywhere. A content test enumerates every dish's start and target and proves a 2–4 pinch solution with that cuisine's jars.

### 6.3 Dishes (24; four per cuisine)

Steps: **C** Chop, **Z** Sizzle, **S** Simmer, **T** Taste, **P** Plate (weights in brackets). Unlock: L = Learner (first lesson dish), C = Confident, E = Expert. Cost and fair price follow the rule in §6.1.

| id                          | name                      | cuisine (home region note)                                                                               | steps                    | ingredients                                                | tags                 | cost | fair | unlock |
| --------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------ | ---------------------------------------------------------- | -------------------- | ---- | ---- | ------ |
| `spaghetti-al-pomodoro`     | Spaghetti al pomodoro     | Italian                                                                                                  | C.20 S.35 T.25 P.20      | spaghetti, tomato, garlic, basil, olive-oil                | comforting, fresh    | 2.0  | 6    | L      |
| `minestrone`                | Minestrone                | Italian                                                                                                  | C.35 S.30 T.20 P.15      | onion, potato, cannellini-beans, tomato, courgette         | hearty, colourful    | 2.0  | 6    | L      |
| `gnocchi-al-pesto`          | Gnocchi al pesto          | Italian (Liguria-style pesto)                                                                            | C.30 Z.20 T.25 P.25      | potato, basil, pine-nuts, parmesan, garlic                 | fresh, comforting    | 2.5  | 8    | C      |
| `risotto-alla-zucca`        | Risotto alla zucca        | Italian (northern)                                                                                       | C.20 S.40 T.20 P.20      | arborio-rice, pumpkin, onion, parmesan, butter             | comforting, hearty   | 3.0  | 9    | E      |
| `dal-tadka`                 | Dal tadka                 | Indian (north)                                                                                           | C.15 S.35 Z.20 T.20 P.10 | toor-dal, ghee, cumin-seeds, garlic, turmeric              | comforting, warming  | 1.5  | 5    | L      |
| `chana-masala`              | Chana masala              | Indian (Punjab)                                                                                          | C.25 S.30 T.30 P.15      | chickpeas, onion, tomato, ginger, garam-masala             | warming, hearty      | 2.0  | 6    | L      |
| `sambar`                    | Sambar                    | Indian (Tamil Nadu and across South India)                                                               | C.30 S.35 T.20 P.15      | toor-dal, tamarind, aubergine, curry-leaves, tomato        | warming, zesty       | 2.0  | 6    | C      |
| `vegetable-biryani`         | Vegetable biryani         | Indian (many regional styles)                                                                            | C.30 Z.20 S.20 T.15 P.15 | basmati-rice, onion, green-peas, garam-masala, ghee        | warming, colourful   | 2.0  | 6    | E      |
| `miso-soup`                 | Miso soup                 | Japanese                                                                                                 | C.30 S.35 T.20 P.15      | dashi, miso, tofu, spring-onion                            | delicate, comforting | 1.5  | 5    | L      |
| `onigiri`                   | Onigiri                   | Japanese                                                                                                 | C.25 T.35 P.40           | short-grain-rice, nori, salmon-flakes                      | delicate, fresh      | 2.5  | 8    | L      |
| `tamagoyaki`                | Tamagoyaki                | Japanese                                                                                                 | Z.55 T.20 P.25           | eggs, dashi, soy-sauce                                     | delicate, comforting | 1.0  | 3    | C      |
| `oyakodon`                  | Oyakodon                  | Japanese                                                                                                 | C.25 S.25 Z.20 T.15 P.15 | chicken, eggs, onion, dashi, short-grain-rice              | hearty, comforting   | 3.5  | 11   | E      |
| `guacamole-con-totopos`     | Guacamole con totopos     | Mexican                                                                                                  | C.45 T.35 P.20           | avocado, lime, onion, coriander-leaf, corn-tortillas       | fresh, crunchy       | 2.5  | 8    | L      |
| `elote`                     | Elote                     | Mexican (street food)                                                                                    | Z.45 T.25 P.30           | corn-cob, crema, queso-cotija, fresh-chilli, lime          | smoky, bold          | 2.5  | 8    | L      |
| `sopa-de-tortilla`          | Sopa de tortilla          | Mexican (central)                                                                                        | C.25 S.35 T.25 P.15      | tomato, ancho-chilli, corn-tortillas, avocado, crema       | warming, crunchy     | 3.0  | 9    | C      |
| `enchiladas-verdes`         | Enchiladas verdes         | Mexican                                                                                                  | C.20 S.30 Z.15 T.15 P.20 | tomatillo, chicken, corn-tortillas, crema, queso-fresco    | zesty, hearty        | 4.0  | 12   | E      |
| `omelette-aux-fines-herbes` | Omelette aux fines herbes | French                                                                                                   | C.25 Z.45 T.10 P.20      | eggs, butter, fines-herbes                                 | delicate, fresh      | 1.5  | 5    | L      |
| `ratatouille`               | Ratatouille               | French (Provence)                                                                                        | C.45 S.25 T.15 P.15      | aubergine, courgette, bell-pepper, tomato, olive-oil       | colourful, fresh     | 2.0  | 6    | L      |
| `croque-monsieur`           | Croque-monsieur           | French (Paris café)                                                                                      | C.15 S.25 Z.40 P.20      | bread, ham, gruyere, butter, cream                         | comforting, crunchy  | 3.5  | 11   | C      |
| `gratin-dauphinois`         | Gratin dauphinois         | French (Dauphiné)                                                                                        | C.45 S.25 T.15 P.15      | potato, cream, garlic, butter                              | comforting, hearty   | 1.5  | 5    | E      |
| `jollof-rice`               | Jollof rice               | West African (with roots in the Senegambia region; Ghana, Nigeria, Senegal and others each have a style) | C.20 S.40 T.25 P.15      | long-grain-rice, tomato, bell-pepper, scotch-bonnet, onion | warming, colourful   | 2.0  | 6    | L      |
| `kelewele`                  | Kelewele                  | West African (Ghana)                                                                                     | C.30 Z.40 T.15 P.15      | plantain, ginger, fresh-chilli                             | bold, crunchy        | 1.5  | 5    | L      |
| `red-red`                   | Red-red                   | West African (Ghana)                                                                                     | C.20 S.35 Z.20 T.15 P.10 | black-eyed-beans, red-palm-oil, tomato, onion, plantain    | hearty, comforting   | 2.5  | 8    | C      |
| `poulet-yassa`              | Poulet yassa              | West African (Senegal)                                                                                   | C.30 Z.25 S.20 T.15 P.10 | chicken, onion, lemon, mustard                             | zesty, bold          | 2.5  | 8    | E      |

The oven parts of the gratin and the croque-monsieur, and the boiling of pasta and rice, are unscored "the oven or pot looks after itself" waits, so the game never shows oven temperatures. In every dish with chicken or eggs, the Taste step comes after that protein's cook step (a content test checks it). Dish names use the spellings above everywhere; dish copy is reviewed by the culture checklist (§10) and never frames any dish as part of a rivalry.

### 6.4 People

**Mentors (6):** warm professionals with their own counters at the Hall. Every counter is named for its chef. They speak plain English with no phonetic accents, use the occasional real dish word, and teach a technique and a value.

| id                | name                 | cuisine and counter      | teaches                                                      | first-lesson line                                                     |
| ----------------- | -------------------- | ------------------------ | ------------------------------------------------------------ | --------------------------------------------------------------------- |
| `lucia-ferrante`  | Chef Lucia Ferrante  | Italian, "Ferrante's"    | simple sauces; few ingredients, done well                    | "Good tomatoes, patience, and a taste at the end. That's the secret." |
| `arjun-mehra`     | Chef Arjun Mehra     | Indian, "Mehra's"        | tempering spices, building layers of flavour                 | "Listen to the cumin. When it crackles, it's ready."                  |
| `haruka-moriyama` | Chef Haruka Moriyama | Japanese, "Moriyama's"   | rice, stock and cooking with the seasons                     | "Rice first. Everything else can wait for the rice."                  |
| `rafael-quintero` | Chef Rafael Quintero | Mexican, "Quintero's"    | fresh salsas, toasting on the comal                          | "Taste it. Now taste it again with lime. See?"                        |
| `bastien-laurier` | Chef Bastien Laurier | French, "Laurier's"      | eggs, butter and neatness                                    | "A clean plate rim is a kind word to your guest."                     |
| `efua-mensah`     | Chef Efua Mensah     | West African, "Mensah's" | slow-cooked stews and rice, heat that warms and doesn't hurt | "Jollof is a celebration. We cook it like one."                       |

**Hall people:** Hollis Varga (owner of the Market Hall, fair and dry-humoured), Teo Akande (a sous helper, cheerful), Wen (the school's head teacher, gives the Graduation Practical), Producer Mo (runs _Spoon & Story_).

**Private-order clients (10; head chef and every path; briefs rolled as in ADEEVA's `rollClientBrief`).** They appear on every path's board, with at most 1 open at a time on Truck and TV. Each dish of an order is one 4 h dish run.

| id                   | who                                                                                     | gate / min rep     | asks for             | required tags             | budget | fee     | days | min Q |
| -------------------- | --------------------------------------------------------------------------------------- | ------------------ | -------------------- | ------------------------- | ------ | ------- | ---- | ----- |
| `netball-supper`     | Coach Imani, Larkspur Under-12s netball                                                 | — / 0              | 2 dishes             | hearty                    | 12–16  | 45–60   | 2–4  | 66    |
| `book-club`          | Ms. Ilse Brandt, library book club                                                      | — / 0              | 2 dishes             | delicate, fresh           | 10–14  | 45–60   | 2–4  | 66    |
| `grandpa-tomasz`     | Grandpa Tomasz (retired postman, Crumb & Comet regular), Sunday family lunch            | — / 65             | 3 dishes             | comforting                | 16–22  | 70–90   | 3–5  | 70    |
| `amara-joel`         | Amara & Joel, housewarming                                                              | — / 70             | 3 dishes, 2 cuisines | colourful                 | 18–24  | 80–100  | 3–5  | 72    |
| `science-fair`       | Larkspur Primary, volunteers' thank-you lunch                                           | — / 75             | 4 dishes             | fresh, crunchy            | 22–30  | 95–120  | 4–6  | 74    |
| `hollis-dinner`      | Hollis Varga, staff thank-you dinner                                                    | — / 80             | 4 dishes, 3 cuisines | bold                      | 26–34  | 110–140 | 4–6  | 78    |
| `isadora-moonlight`  | Isadora Finch, painter: Moonlight Supper at her gallery                                 | Dreamer / 60       | 3 dishes             | colourful, bold           | 18–24  | 90–110  | 3–5  | 72    |
| `mr-kohli`           | Mr. Ishaan Kohli, retired watchmaker: "one perfect tamagoyaki"                          | Perfectionist / 60 | tamagoyaki           | delicate                  | 4–6    | 60–80   | 2–4  | 82    |
| `dami-market-taster` | Dami Ade, organiser of the Riverside Night Market: a taster plate for the market poster | Trendsetter / 60   | 1 dish               | this week's first hot tag | 6–10   | 60–80   | 2–3  | 70    |
| `thursday-table`     | Mrs. Agnes Bell, who started a Thursday lunch for neighbours who eat alone              | Charmer / 60       | 3 dishes             | comforting                | 14–20  | 70–90   | 3–5  | 68    |

Every dish in one order is different. Mr. Kohli's order only appears once tamagoyaki is unlocked, and an order's fit also checks its number of different kitchens.

**Community orders** (for the Community Table award): `netball-supper`, `science-fair` and `thursday-table`. Preferences are taste only ("not a fan of chilli"), never allergies, intolerances or diets.

**Critics (3; restaurant and TV):** Ottoline Reyes (_The Larkspur Ledger_, technique and food), Barnaby Quill (_Radio Larkspur_, warmth and service), Hazel Oduya (_Market Hall Monthly_, value and community). Reviews are kind even at 2 spoons: "The yassa had real zing. Service was slow tonight; I'll be back to try again."

### 6.5 Staff (8)

| id        | name                    | best station (skill)  | others | wage/night | perk                                     |
| --------- | ----------------------- | --------------------- | ------ | ---------- | ---------------------------------------- |
| `tavi`    | Tavi Moana              | Board 0.80            | 0.70   | 30         | Prep Fridge counts 3 dishes instead of 2 |
| `lin`     | Lin Zhao                | Hob 0.80              | 0.70   | 30         | none; the best hob cook                  |
| `yaw`     | Yaw Darko               | Pot 0.80              | 0.70   | 30         | none; the best pot cook                  |
| `esme`    | Esme Hart               | Pass 0.80             | 0.70   | 30         | none; the best pass cook                 |
| `nilufar` | Nilufar Rahimi          | all 0.75              | —      | 32         | none; reliable all-rounder               |
| `bruno`   | Bruno Castell           | host (front of house) | —      | 25         | lifts capacity above 20; +3 guests       |
| `ada`     | Ada Novak               | Clean Team            | —      | 22         | ticket targets ×1.1 on her nights        |
| `sol`     | Sol Ortega (apprentice) | all 0.65              | —      | 18         | none; the lowest wage                    |

On paths, the Food Truck hires one cook per festival from this list at a flat 25; TV uses none. Perks are kept to the ones that change the night's numbers (Tavi's prep, Bruno's seats and guests, Ada's ticket time); the station skills already make Lin, Yaw and Esme the best on their station. Before a restaurant schedules a team, only each cook's station skill matters: wages, perks, Bruno (host) and Ada (Clean Team) come into play with the restaurant.

### 6.6 Upgrades (one-time, reputation-gated; `upgrades.buyUpgrade`)

| id               | name               | price | min rep             | effect                                            | available  |
| ---------------- | ------------------ | ----- | ------------------- | ------------------------------------------------- | ---------- |
| `knife-roll`     | Knife Roll         | 60    | 5                   | Chop window ×1.15                                 | all rungs  |
| `heavy-pan`      | Heavy Pan          | 80    | 12                  | Sizzle window ×1.2                                | all rungs  |
| `long-ladle`     | Long Ladle         | 70    | 20                  | Simmer halo ×1.15                                 | all rungs  |
| `spice-tin`      | Spice Tin          | 70    | 28                  | Taste circle ×1.2                                 | all rungs  |
| `plating-spoons` | Plating Spoons     | 90    | 40                  | Plate focus radius ×1.2                           | all rungs  |
| `second-ring`    | Second Hob Ring    | 150   | restaurant          | 2 Sizzle pans in service                          | restaurant |
| `warming-pass`   | Warming Pass       | 120   | restaurant          | warm-lamp hold 20 → 30 s                          | restaurant |
| `prep-fridge`    | Prep Fridge        | 140   | restaurant          | Chop pre-done for top 2 dishes                    | restaurant |
| `walk-in-fridge` | Walk-in Fridge     | 200   | restaurant          | half of unserved portions carry to the next night | restaurant |
| `garden-tables`  | Garden Tables      | 180   | restaurant          | capacity +6                                       | restaurant |
| `bigger-room`    | Bigger Dining Room | 320   | restaurant, rep 110 | capacity +8, rent +40                             | restaurant |

Kitchen upgrades show only in a restaurant's shop (a Kitchen shop alongside the personal tools). Second Hob Ring lets the hob cook two pans side by side in Service Rush; the Warming Pass raises the warm-lamp hold for the night's plan; the Prep Fridge starts the night with the Chop step of every ticket dish among the two (Tavi: three) most-wanted dishes done by the team at 0.8. Truck and TV upgrades (an awning, a bigger fridge, a faster hatch, a tip-hint apron) are Phase B (§11).

### 6.7 Awards

| id                     | name                              | rule                                                                                                                 |
| ---------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `mentor-pin-<cuisine>` | Mentor's Pin (6, one per cuisine) | reach Expert; the mentor pins it on your apron                                                                       |
| `clean-pass`           | Clean Pass Award                  | 5 services in a row with every played dish ≥ 4★ (on the Truck it counts festival services; on TV it counts segments) |
| `warmest-kitchen`      | Warmest Kitchen (restaurant)      | season average serviceScore ≥ 85 and 3 critic visits ≥ 4 spoons                                                      |
| `best-new-table`       | Best New Table (restaurant)       | season profit > 0 with "Ready but not served" under 10% of ingredient spend                                          |
| `community-table`      | Community Table (any path)        | finish 3 community orders (§6.4) after the path starts                                                               |
| `festival-favourite`   | Festival Favourite (truck)        | ribbons at 3 different festivals                                                                                     |
| `golden-page`          | Golden Page (TV)                  | cookbook launched                                                                                                    |
| `larkspur-ladle`       | Larkspur Ladle                    | all 3 of your path's awards; the Hall gives a big brass ladle for the wall (beat `ch-ladle`)                         |

Before the paths, the ladder already awards the six Mentor's Pins and the Clean Pass Award (counted on Hall services); the hub shows the Clean Pass streak.

**Path awards** (each must be earned after the path starts; the path keeps its own list and its own Clean Pass streak, so a Clean Pass from the ladder does not count):

- **Restaurant:** `warmest-kitchen`, `best-new-table`, `community-table`.
- **Truck:** `festival-favourite`, `community-table`, `clean-pass` (earned on the truck).
- **TV:** `golden-page`, `community-table`, `clean-pass` (earned on segments).

### 6.8 Festivals (8; truck)

| id               | name                       | crowd | taste tags            | pitch fee |
| ---------------- | -------------------------- | ----- | --------------------- | --------- |
| `kite-day`       | Larkspur Kite Day          | 30    | delicate, fresh       | 30        |
| `harvest-fair`   | Harvest Fair               | 45    | hearty, comforting    | 50        |
| `night-market`   | Riverside Night Market     | 55    | bold, smoky           | 70        |
| `music-weekend`  | Seaside Music Weekend      | 60    | crunchy, zesty        | 90        |
| `book-fair`      | Children's Book Fair       | 35    | comforting, colourful | 40        |
| `blossom-market` | Spring Blossom Market      | 40    | fresh, colourful      | 45        |
| `sports-final`   | Under-12s Cup Final Picnic | 50    | hearty, crunchy       | 55        |
| `winter-lights`  | Winter Lights Walk         | 45    | warming, comforting   | 60        |

### 6.9 Story beats (30, plus `ch-bankrupt`; 1–3 lines each)

**You** lines in shared beats are voiced by trait through `storyVoice` `byTrait` (table below). Trait beats play only for their own trait, so their **You** lines are already in that voice.

| id                       | trigger                                    | lines                                                                                                                            |
| ------------------------ | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `ch-intro`               | intro                                      | **Wen:** "Welcome to Larkspur Cookery School. Six chefs, six kitchens, one you." / **You:** (byTrait)                            |
| `ch-first-lesson`        | first-lesson                               | **Narrator:** Your first ticket, clipped above the board. / **Mentor:** their first-lesson line (§6.4)                           |
| `ch-first-taste`         | first-taste-solved                         | **Arjun:** "You tasted before you guessed. That's a cook's habit."                                                               |
| `ch-all-mentors`         | six-lessons                                | **Wen:** "All six. They've all asked to have you on their line."                                                                 |
| `ch-first-week`          | first-week                                 | **Wen:** "Board is due on day seven. The Hall always needs pot-washers."                                                         |
| `ch-graduation`          | graduation-passed                          | **Wen:** "Here's your apron. It's yours now." / **You:** (byTrait)                                                               |
| `ch-first-service`       | first-service                              | **Lucia:** "Tickets come in, plates go out. Breathe between them."                                                               |
| `ch-team-finish`         | first-team-finish                          | **Teo:** "We finished them together. That's what a line is for."                                                                 |
| `ch-station-test`        | station-test-passed                        | **Rafael:** "Your counter tonight, chef. I'll be eating."                                                                        |
| `ch-sous`                | sous-start                                 | **Hollis:** "Sous chef. You'll lead the shift and write the special." / **You:** (byTrait)                                       |
| `ch-first-special`       | first-special-sold-out                     | **Teo:** "Your special sold out! Write it on the board again tomorrow?"                                                          |
| `ch-kind-call`           | sous-service-5                             | **Bastien:** "You said thank you to every plate today. The team noticed."                                                        |
| `ch-tasting-day`         | tasting-day                                | **Hollis:** "Three plates. Show me who you are."                                                                                 |
| `ch-head-chef`           | head-chef-start                            | **Efua:** "Head chef. Your kitchen, your menu. We're all proud." / **You:** (byTrait)                                            |
| `ch-first-menu`          | first-menu-written                         | **Haruka:** "A menu is a promise. Keep it small and keep it well."                                                               |
| `ch-crossroads`          | crossroads                                 | **Hollis:** "Three doors, chef. A table of your own, a truck and the open road, or a studio kitchen and a book." / choice → path |
| `rs-keys`                | restaurant-start                           | **Narrator:** Quayside Lane. Your name, painted over the door. / **You:** (byTrait)                                              |
| `rs-first-critic`        | first-critic-visit                         | **Narrator:** Table 7 has a notebook. / **Esme:** "Same as always, chef. Clean rims."                                            |
| `rs-first-week-money`    | first-restaurant-week                      | **Hollis:** "Money in, money out, and what's left keeps the lights on. You did fine."                                            |
| `rs-chapter-end`         | three-path-awards                          | **All mentors:** "To Quayside Lane!" / **You:** (byTrait)                                                                        |
| `tr-clementine`          | truck-start                                | **Narrator:** Clementine coughs, then purrs. Your truck. / **You:** (byTrait)                                                    |
| `tr-first-ribbon`        | first-festival-favourite                   | **Narrator:** A blue ribbon, tied to the hatch by a kid in a kite hat.                                                           |
| `tr-chapter-end`         | three-ribbons-eight-festivals              | **Rafael:** "Eight festivals. You fed the whole town, chef."                                                                     |
| `tv-first-segment`       | tv-start                                   | **Producer Mo:** "Just cook and talk like you'd teach a friend."                                                                 |
| `tv-first-letter`        | first-letter                               | **Narrator:** A letter in crayon: "My aunt and me tasted as we went. Our soup was good!"                                         |
| `tv-chapter-end`         | book-launched                              | **Haruka:** "Your book is on the library shelf, next to mine." / **You:** (byTrait)                                              |
| `ch-trait-dreamer`       | Isadora's order appears                    | **Isadora:** "Cook me a plate that looks like moonlight." / **You:** "Pale rice, a silver sauce, one bright star of chilli."     |
| `ch-trait-perfectionist` | an unassisted Chop with every mark perfect | **Bastien:** "Every cut on the beat. Again tomorrow?" / **You:** "Every day."                                                    |
| `ch-trait-trendsetter`   | Dami's order appears                       | **Dami:** "You always know what Larkspur's craving. Make the plate for our poster?" / **You:** "I know just the dish."           |
| `ch-trait-charmer`       | Mrs. Bell's order appears                  | **Mrs. Bell:** "It's just a few of us on Thursdays. Would you cook?" / **You:** "I'd love to. I'll bring extra."                 |

Plus `ch-ladle` (all three path awards): **Hollis:** "All three, chef. This brass ladle has been waiting for a wall like yours." And `ch-bankrupt` (Challenging only): **Hollis:** "Coin jar's empty. Pot-washing pays, and it's honest work." / **You:** "A few pot-wash days, then back to the line."

**`byTrait` You lines:**

| beat             | default                                              | Dreamer                                              | Perfectionist                                   | Trendsetter                                           | Charmer                                             |
| ---------------- | ---------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------- |
| `ch-intro`       | "I'm ready to learn all six."                        | "Six kitchens? I want to taste every colour."        | "I'll learn every step until it's right."       | "Six cuisines. I'll learn what Larkspur loves first." | "Six chefs to meet. I'll learn every name."         |
| `ch-graduation`  | "My own apron. I'll look after it."                  | "It's going to collect so many colours."             | "Clean, pressed, and ready for the line."       | "Next stop: the busiest counter at the Hall."         | "Thank you, Wen. Thank you, everyone."              |
| `ch-sous`        | "I'll lead, and I'll listen."                        | "A daily special? I've got ideas already."           | "Every station ready, every ticket on time."    | "The specials board is mine. Watch this space."       | "I'll lead with a thank-you for every plate."       |
| `ch-head-chef`   | "Our kitchen. Let's make it a kind one."             | "My menu is going to look like a sunset."            | "A menu with no weak dish on it."               | "The menu will be what the town craves next."         | "Our kitchen. Everyone gets a seat at family meal." |
| `rs-keys`        | "My name, my table. Let's cook."                     | "I can already see the lamps glowing at night."      | "Every table set the same. Every rim wiped."    | "Quayside Lane is about to get busy."                 | "I hope the neighbours pop in to say hello."        |
| `rs-chapter-end` | "To everyone who cooked here with me."               | "To every plate that looked like a little painting." | "To five good nights a week, every week."       | "To the next thing Larkspur falls for."               | "To every guest who came back and said hi."         |
| `tr-clementine`  | "Come on, Clementine. Let's go feed some festivals." | "She's the colour of a sunrise. Let's go!"           | "Fridge checked, hatch checked. Ready to roll." | "Every festival in town is about to know us."         | "Hello, Clementine. Let's go meet everybody."       |
| `tv-chapter-end` | "Right next to yours? I'll take good care of it."    | "My plates, on paper, on a shelf. Like a dream."     | "Every card tested. Every tip a kind one."      | "I hope every kid in town borrows it."                | "Next to yours. That's the nicest shelf in town."   |

### 6.10 Traits (chef-flavoured perks over ADEEVA's mechanics)

| Trait         | Perk text                                                                                   | Mechanic                                                                                          | Gated content                                       |
| ------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Dreamer       | "Colour on the plate: +15% when you use 3+ garnish colours or a bold dish."                 | `dreamerFlair`                                                                                    | Isadora's Moonlight Supper; beat `ch-trait-dreamer` |
| Perfectionist | "Steady hands: chopping, sizzling, simmering, tasting and plating are all more forgiving."  | ×1.2 on every tolerance                                                                           | Mr. Kohli; beat `ch-trait-perfectionist`            |
| Trendsetter   | "You know Larkspur's next craving: see next week's tags early."                             | +10% fee per trend match; next week's tags show early                                             | Dami's market taster; beat `ch-trait-trendsetter`   |
| Charmer       | "Warm kitchen: 10% tips on happy services, and your team cooks a little better beside you." | Charmer tip; no reputation loss on a soft fail; staff +0.02 skill when scheduled with the Charmer | Mrs. Bell's Thursday Table; beat `ch-trait-charmer` |

## 7. Evaluation and economy

**Dish criteria (lessons, tests and private orders; ADEEVA's criterion shape):**

| Criterion      | Label               | Weight | Pass rule                                       | kindFeedback on a miss                                                        |
| -------------- | ------------------- | ------ | ----------------------------------------------- | ----------------------------------------------------------------------------- |
| `construction` | Every step done     | 3      | All steps finished. Mandatory.                  | "One step was left unfinished. Every step counts."                            |
| `quality`      | Cooked well         | 2      | Quality ≥ the brief minimum.                    | The lowest step's line (below).                                               |
| `fit`          | What they asked for | 2      | Required tags present, no avoided ingredient.   | "They hoped for something more {tag}." / "They're not a fan of {ingredient}." |
| `plating`      | Plated as asked     | 1      | The garnish count on the plating brief.         | "So close! The order asked for {n} garnishes."                                |
| `budget`       | Within budget       | 1      | Ingredient cost ≤ budget (private orders only). | engine `budgetFeedback`                                                       |
| `deadline`     | On time             | 1      | Finished by the deadline day.                   | engine `deadlineFeedback`                                                     |

**Lowest-step lines** (one is shown for a missed quality, chosen from the weakest weighted step): Chop: "The beat ran ahead a little. Tap as the mark meets the line." (a mince: "The green stretch slipped a little. Hold right to its end.") Sizzle: "One piece went extra-crispy. Flip a bit sooner." Sizzle heat: "Try the heat dots printed on the dish card." Simmer: "The guide spoon got away a little. Steady circles next time." Simmer level: "Stop right on the line next time." Taste: "A pinch of {jar} would have balanced it." Plate: "A wipe of the rim makes it shine." Plate well: "Keep everything inside the well." **Service lines:** handled-share miss: "The team carried tonight. Let's cook more of it together tomorrow." Score miss: "Tickets ran a bit slow. Start the slow pan first."

The `ScoreRule` is `{passMixWeight 0.3, qualityWeight 0.7, colourBonusPer 1, maxColourBonus 3}` (garnish colours). Stars use `starsForScore` (90/75/55/35). The pass gate is construction, fit and quality.

**Minimums (Standard; +6 on Challenging):** lessons 55; Graduation average 66; Station Test serviceScore 72; Tasting Day 78 per plate; private orders 66–78 (Mr. Kohli 82); services Line 55, Sous 60, Head and paths 65.

**Rewards (ADEEVA's `settleReward` and `settleTrendReward` constants):**

- **Pass:** `fee × (0.8 + 0.4 × score/100)` plus trait lines; reputation `1 + round(2 × score/100)`; buzz `1 + stars + 3 per trend match`; a trend match adds +10% of the fee.
- **Standard soft fail:** 40% of the fee, reputation −1 (0 for Charmer), and kind feedback.
- **Relaxed:** always a pass, though stars reflect quality, except the handled-share gate, which is a kind soft fail with no reputation loss; tests always pass too; rent ×0; path start costs ×0.5.
- **Challenging:** minimums +6; a fail pays 0 and costs reputation −3; late private orders −50%; rent ×1.5.
- **Service:** the "fee" is the rung's bonus pool (20 / 30 / 45), and the wage (20 / 30 / 45) is always paid in full for a worked shift, because workers are paid for their work. Reputation and buzz follow the same formula with `serviceScore`. Lesson stipends are fees of 20–30. Tests have no fee and give +3 reputation on a pass.

**Rung pacing (Standard, decent player: score about 87, so +3 reputation per pass):**

| Days    | Rung         | Reputation flow                                                     | Unlock reached                                                            |
| ------- | ------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 1–6     | Student      | 6 lessons × 3 = 18                                                  | Graduation open (rep ≥ 15)                                                |
| 7       | Family Meal  | —                                                                   | —                                                                         |
| 8       | Graduation   | +3 → 21                                                             | Line Cook from day 9                                                      |
| 9–13    | Line Cook    | 5 services × 3 → 36 (day 14 Family Meal)                            | Station Test open (rep ≥ 35, 5 services)                                  |
| 15      | Station Test | +3 → 39                                                             | Sous from day 16                                                          |
| 16–20   | Sous         | 5 × (3 + 1 sell-out) → 59 (day 21 Family Meal)                      | Tasting Day open (rep ≥ 55, 10 services)                                  |
| 22      | Tasting Day  | +3 → 62                                                             | Head Chef from day 23                                                     |
| 23–27 → | Head Chef    | 5 services × 3 plus about 2 private orders × 3 → about 83 by day 27 | Crossroads: rep 85 by about day 29, 12 passes by about day 31; days 29–34 |

Mastery keeps pace: lessons give each cuisine +2, Graduation brings 3 cuisines to Confident, and Line and Sous services (+1 each at score 87, both cuisines at Sous) bring a fourth by Tasting Day. The Relaxed pace is the same (score-based reputation still applies); Challenging runs about 2–3 days slower per rung.

**Pass rates (stated honestly).** Decent per-step accuracies are chop 0.88, sizzle 0.85, simmer 0.86, taste 0.88 and plate 0.90, which gives dish quality ≈ 87 with a spread of about ±4 (σ ≈ 0.95 × √Σw² × 0.08 ≈ 4). Service: quality 85 (quick versions), onTime 0.9, handled 0.9 → serviceScore ≈ 87. **Ladder services are tutorial-tuned at about 95%+ passes.** **Private orders and tests target 80–90%**: quality alone clears 66–78 almost always, so the misses come from the named failure sources: a missed required tag, an over-budget order, a late order, and warm-lamp decay when 4 tickets stack on the rail. Phase B's simulated player must confirm these rates per rung and tune ticket targets first.

**A player who touches nothing** in a Line service: every ticket is team-finished at accuracy 0.6 (quality 62) and onTime 0.4, so serviceScore ≈ 0.65 × 0.62 + 0.25 × 0.4 + 0 ≈ 50, and handledShare 0 fails the gate anyway: a kind soft fail.

**Full assist** (0.8 everywhere): quality ≈ 81, which passes every Standard minimum except Mr. Kohli (82), so the Perfectionist client stays a real skill test. Assisted service ≈ 0.65 × 0.81 + 0.25 × 0.85 + 0.10 → 84.

**Money sanity (Standard):**

- **Week 1 (Student):** start 60 coins; 6 stipends at about 27 = 162; board 40 → about 182 at the end of day 7. Knife Roll (60) is affordable.
- **Week 2 (Graduation, then Line):** 5 shifts × (20 + 20 × 1.15 ≈ 23) = 215; rent 90 → about +125 (≈ 307).
- **Week 3 (Station Test, then Sous):** 5 × (30 + 34) = 320 plus 5 special bonuses of about 24 (cost 2, price 6, 12 sold) = 120; rent 120 → about +320 (≈ 627).
- **Week 4 (Tasting Day, then Head Chef):** 5 × (45 + 52) = 485 plus 2 private orders at about 100; rent 150 → about +535 (≈ 1160).
- **At the Crossroads (days 29–34):** after the 370 of personal upgrades and a few more head-chef days, a decent player has about **900–1200**: the Restaurant (900) is a real saving goal, and the Truck (600) or TV (200) are comfortable. A struggling player (some soft fails, score about 70, +2 reputation per pass) reaches the Crossroads about a week later with about **800**, which affords the Truck or TV; the Restaurant needs about one more week. Upgrades and the path start cost now compete for the same coins.
- **Restaurant night (rep 90, buzz 30, 2 hot matches; menu priced near 1.07 × fair):** guests = min(capacity 28, 35) = 28 → 42 plate-slots × priceFactor 0.93 ≈ 39 plates at an average price of 9 and cost 2.8 → in ≈ 351, ingredients for par 40 ≈ 112, 3 staff × 30 = 90 → about +150 a night. Five nights ≈ 750 − rent 300 → about +450 a week before upgrades and bookings. Pricing everything at 2× fair sells about 10% of plates (about 4) and loses coins after rent: the lesson lands.
- **Truck day (Harvest Fair, rep 90, prices at fair):** 45 × 0.95 ≈ 43 guests → 64 plate-slots, fridge 40 → 40 plates × 8 − 40 × 2.6 − 50 pitch − 25 helper ≈ +141. Three festivals ≈ +420 − parking 60 a week.
- **TV week:** 2 segments × (120 + 30 × 4) = 480 − rent 150 = +330; plus the advance of 250 and 150 per chapter.

## 8. Screens and art direction

**Screens:** Title → New Game (avatar from the studio profile, trait, difficulty, start: Student or Head Chef) → `ch-intro` → **Hub**, which changes by rung: School Corridor (class board and the six mentor doors), Market Hall (shift board, counters, rail preview), Main Kitchen office (menu board, staff cards), and then a path hub: the Quayside dining room, Clementine with a fold-out festival map, or the Spoon & Story studio with its book desk. The hub always holds calendar, hours, coins, reputation, buzz, "Town cravings", Dish Diary, upgrades, End Day, Pot-wash day and Save. Then the **Dish run** screens (ticket → mise → stations → pass), **Service Rush**, **Menu & Prices**, **Get ready**, **Schedule**, **This week's money**, **Reviews wall**, **Festival map**, **Cue cards**, **Cookbook** (auto-composed cards), **Results** (the plate under the warm lamp, a criteria list, stars and reward lines) and **Dish Diary** (an SVG card grid from plating cards).

**Look, distinct from Patisserie:** Patisserie is pastel buttercream, doilies and copper rails under daylight. Chef is a **working line at evening service**: brushed steel, deep charcoal, warm pass-lamp light and chalkboard menus. Game accents in `games/chef/ui/theme.css`: charcoal steel `#2e3a40`, pass-lamp amber `#f2a93b`, tomato `#d9472b`, basil `#4f8a3c`, steel `#aeb9bf`, chalk `#f3f0e8`. Display font `"Franklin Gothic Medium", "Arial Narrow", sans-serif` for chalkboard and ticket type (installed fonts only); body `system-ui`.

**Six original counters (one SVG backdrop each).** Every counter has the same modern steel range, extraction hood and prep fridge, plus 2–3 signature tools, so every kitchen reads equally modern and professional. There are no costume clichés, no flags and no people in "traditional dress".

- **Italian (Ferrante's):** a wooden pasta drying rack, an olive-green tile wall, open shelves of jars.
- **Indian (Mehra's):** a steel masala dabba, a kadai and a tawa on the range, an indigo-glazed tile wall.
- **Japanese (Moriyama's):** a pale hinoki counter, a donabe beside a rice cooker, a plain indigo half-curtain.
- **Mexican (Quintero's):** a comal and a molcajete, an original geometric tile band in cobalt and white (not a copy of any specific talavera).
- **French (Laurier's):** a zinc pass counter, enamelled cast-iron pots, a slate menu. No copper (that is Patisserie's).
- **West African (Mensah's):** a large steel stew pot, an earthenware grinding bowl with a wooden pestle, and an ochre tile wall with Chef's own banner (an original pattern, not a copy of a real wax print). Calabash appears only as serving bowls.

**Plating art:** each dish has its own hero piece; bases, sauce stamps and garnishes are shared across dishes (about 40 component SVGs in all).

**Feedback juice (2D SVG):** chop marks pop into piece piles with a crisp "thunk" (a short tone); pans have a heat shimmer, oil-dot pops and rising sizzle lines; the pot bubbles and sends steam ribbons; Taste gives a puff of steam and a small "mm" tone; a perfect step gives a three-spark sparkle; the pass bell rings and the ticket gets torn from the rail and spiked. Sounds are synthesised in-app (WebAudio, generated tones) with a "Kitchen sounds" switch in Settings, remembered on this device; there are no audio files from outside.

**Reduced motion** (`prefers-reduced-motion` or the setting): Chop marks step from slot to slot instead of scrolling, steam and shimmer become static icons, cook rings fill without the colour pulse, station tabs show a solid ring instead of pulsing, the dimming lamp becomes a bar, and the ticket tear becomes a fade.

## 9. Reuse map and build split

**Studio contract:** `reputationOf(rawSave)` = `earnedReputation` minus the start reputation (Student 0, Head Chef 60), so a Head Chef start never hands out free perks. The studio counts at most 24 reputation from any one game (`PER_GAME_REPUTATION_CAP`), so every perk needs play across at least three games.

**Engine (unchanged unless noted):** `rng`, `rngDraw`; `dayHours`, `week`, `weekday`; `standing`; `gigBoard` and `gigBoardState` (class, shift, private, festival and segment boards, all as offers); `difficulty`; `story`, `storyVoice`; `score` (`judgedScore` with Chef's `ScoreRule`); `reward`, `trendReward` (`dreamerFlair` unchanged); `trendMarket` with Chef's 10-tag pool (already generic); `kindFeedback`; `followRecord` (Simmer); `assistCap`; `placedPose` (plating cards); `geometry`, **extended** with `scaledShape` (`placedPolygon` with `Rotation`, `polygonsOverlap` and `polygonBounds` for plating; `traceTrack` for the guide-spoon path); `saveEnvelope`, `parse`, `stateParsers` (`gigBoardParser`, `storyStateParser`, `trendStateParserOf`); `paidShift`; `weekSettlement`; `upgrades`; `earnedReputation`; `actionCheck`; `recordWithout`; `uniqueIds`.

**Shared UI:** `ui/kit` (`Button`, `Card`, `Dialog`, `Meter`, `SegmentedControl`, `StarRating`, `StatChip`, `TagPill`, `ToggleSwitch`, `ToastStack`, `useTickLoop`, `useCountUp`, `useDispatchOnce`, `useArmedAfter`, `useFocusAfterRender`, `clientToSvg`, `useElementSize`); `ui/art` (`Avatar`, `PlacedLayer`, `colourMix`, `useSvgId`, `seedFromText`, tiles); `ui/newGame` steps; and the studio's `useGameSession`, `createSlotStore`, settings, toasts and `ViewLoadBoundary`.

**Promoted into the engine in Stage 2:** `demandShare` (appeal, share, priceFactor, wanted; used by the restaurant, the truck and the Sous special, and usable by Interior's show homes and Thrift-Flip's stall) and `weekMoneyLines` (in/out/left-over lines; named apart from `weekSettlement`'s existing `WeekLedger` type). **Candidates for later:** `eventReplay` (a tick event log → per-object values, used by Sizzle and usable by Jewellery's join timing), `rhythmScore` (offsets → accuracy), `vectorPuzzle` (Taste Compass).

**New code (`src/games/chef`):** `content/` (ingredient, seasoning, dish, mentor, client, critic, staff, upgrade, award, festival, storyBeat, career, trait, difficulty); `core/` (gameState, action, reduce, catalog, career and rung unlocks, mastery, dishRun, stages, chop, sizzle, simmer, taste, plate, dishQuality, evaluate, rewards, service (rail, arrivals, warm lamp, onTime, team finish, handledShare, serviceScore), special, staffing, menu, pricing, parLevels, weekMoney, critics, awards, truck, festivals, segment, cueCards, cookbook, dishDiary, offers, calendar, storyQueue, newGame, save, parsers, testPlaythrough); `ui/` (hubs per rung and path, station screens, service rush, business screens, art). Save keys: `chef.save.1..3`, `chef.lastSlot`, `chef.probe`. Every file stays under 700 lines and has no comments, per the contract.

**Content tests:** every dish's cost and fair price recomputed from its ingredients; every dish's Taste target solvable in 2–4 pinches with its cuisine's 4 jars; every cuisine shows exactly 4 jars; Taste comes after the protein's cook step in every chicken and egg dish; every dish's ingredients exist; every cuisine has 4 dishes with the same unlock spread (L, L, C, E).

**Build split:**

- **Stage 1 (ladder + cooking + service):** Student → Line → Sous → Head Chef, with the Graduation, Station and Tasting tests; all 5 cooking mini-games and Service Rush; 6 mentors; 24 dishes with shared plating art (about 40 component SVGs); the Sous special; personal upgrades; Teo and 2 helpers; the head-chef menu and private orders; story beats through `ch-first-menu` (the Crossroads beat and its doors arrive with Stage 2, and until then the career simply continues at Head Chef with more services and private orders); Dish Diary; both New Game starts; `scaledShape` in the engine. E2E: Arjun's lesson through every station by hand, then save, reload and continue; a head-chef service with a pause and a kind team finish for a service nobody cooked; home → game → back.
- **Stage 2 (the three paths + business):** the Crossroads with door peeks. **Restaurant in full** (menu, prices, demand, par levels, Ask Hollis, staff schedule, kitchen upgrades, critics, reviews, weekly money, awards). **Truck** reuses the restaurant's `demandShare`, Menu & Prices, Get ready and `weekMoneyLines`, with no new screen beyond the festival map (festival board, fridge split, Hatch Rush, ribbons). **TV** (cue cards, segments, letters, a 4 × 3 cookbook with auto-composed cards, launch). Path beats and awards. `demandShare` and `weekMoneyLines` move into the engine. The save moves to schema version 2 with a migration (version 1 saves gain `path: null`, `peeked: []`, and an open service gains `lampHoldSeconds: 20`, `pans: 1` and `spotlight: null`), so Stage 1 saves load and reach the Crossroads. E2E: a version 1 head-chef save reaches the Crossroads, peeks a door once and runs a week at its own restaurant; Clementine serves a festival; a TV segment with cue cards and kind tips is cooked by hand and brings a letter.

## 10. Safety notes

- **No real cooking instruction.** There are no amounts, temperatures (heat is 1–5 dots), cook times in minutes, knife grips or techniques. Recipe cards show icons only, with a fixed "Cook with an adult" badge. The station hint on Board, Hob and Pot is: "Real knives, hobs and pots: ask an adult first."
- **Knives and heat are stylised.** The knife moves by itself, and no hand or grip icon is drawn near a blade. Pans glow and shimmer; there are no open flames, no flambé, no smoke, no burns and no fire or alarm "accidents". Over-cooked food is "extra-crispy" and comes off the pan by itself. Taste always comes after a protein's cook step.
- **No diet, calorie or body talk.** No "healthy/unhealthy", "light", "guilt-free", "cheat" or portion-shaming; the taste tag is `delicate`, and the menu rule speaks only of variety. No one comments on eating, weight or bodies, and guests are never drawn at tables (tickets show table numbers only).
- **No alcohol.** No wine, beer, sake, mirin or spirits in any ingredient, dish, pairing or scene. Dishes that often use them are either left out or shown without them. There is no bar in the restaurant.
- **Allergies are never a gameplay twist.** Preferences are taste only. No dish is ever called "safe" for anyone.
- **No appearance-based fame.** TV fame is built from skill, clarity and kindness (letters, reviews), with no followers, views, likes, makeovers, outfits or looks scoring. Critics review the food and the visit, never the cook. Letters that mention cooking always mention an adult.
- **Gentle pressure.** No guest anger, walk-outs, patience meters or shouting chef tropes. Mentors correct kindly, and no praise line compares the player with anyone ("better than…"). Pause is always allowed. Late tickets still score at least half, and the team finishes leftovers. There is no game over, debt or loans.
- **Fair work.** Staff get rest days, wages are always paid, and parting ways is kind. There is no morale system.
- **Respectful culture checklist (each item reviewed before shipping, ideally by a cook from each tradition):** (1) dish and ingredient names spelled correctly with accents (gratin dauphinois, croque-monsieur, poulet yassa, oyakodon, Gruyère); (2) each dish is credited to its region without implying a single "national" version (jollof's regional styles, with no "rivalry" framing); (3) mentors are professionals with full names and titles, with no phonetic accents, broken English, national-temperament traits or catchphrases about their heritage; (4) the words "exotic", "ethnic", "authentic vs. weird", "spicy foreigners" and similar never appear, and no cuisine is framed as strange; (5) heat is described as "warm", never as a dare, and no cuisine is the "hottest" by design; (6) art uses everyday tools and materials, with no flags, costumes, sombreros, stereotyped music or landmarks as shorthand; (7) the textile and tile patterns are original; (8) no religious items are used as décor; (9) every cuisine gets the same number of dishes, the same mentor depth and the same unlock pace, and regional spread within a cuisine is checked (Indian dishes span north and south); (10) every kitchen reads equally modern and professional.
- **Safe adults and privacy.** Adults never ask the player for secrets or to go anywhere private. The game is offline, with no ads, chat, accounts or purchases; seeded randomness is free, with no rerolls for coins. The Dish Diary and recipe cards stay in the local save.
- **Originality.** No real restaurants, chefs, TV shows, food brands or competition formats (no judges' eliminations, no "mystery basket", no named rounds). References to stay clear of: _Cooking Mama_ (no per-step grading by a parent figure, no "better than…" praise); _Overcooked_ (the ticket rail has no chaos, co-op mess, fires or spills); diner time-management games (no queues, patience or walk-out loops); _Potion Craft_, which also moves a point by ingredient vectors (the Taste Compass differs by a hidden point revealed only by tasting, on a discrete 13×13 grid with a savoury row). Before shipping, check that "Six Kitchens", "Larkspur Market Hall", "Spoon & Story", "Clementine" (truck), the counter names and the critics' publication names are not real trading names.

## 11. Out of scope

- Desserts, baking and pastry (Patisserie's space), and drinks of any kind beyond water.
- Real recipes, printable recipe cards, a free recipe-card designer, image export, online sharing, leaderboards and photo import.
- Switching paths within one save, running two paths at once, multiple restaurant sites, franchises, loans or debt, and investors.
- More than 4 dishes per cuisine, more cuisines, seasonal menus, ingredient spoilage, weather, supplier negotiation, and staff morale or burnout simulation.
- Free-text menus or truck names (presets only), voiced dialogue, and guests drawn as characters at tables.
- A competitive TV cooking-contest mode, and any follower or audience-size metric.
- Phase B depth: truck and TV upgrades (Striped Awning, Big Fridge, Speedy Hatch, Kind Words Apron, a truck Second Hob Ring), more clients, beats and festivals, a fifth cookbook chapter, and a second chapter for each path.
