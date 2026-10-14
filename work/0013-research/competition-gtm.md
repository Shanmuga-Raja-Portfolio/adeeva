# Maker Studio: competition and go-to-market study (itch.io and Steam)

Study and reference only. No accounts, wishlists, store pages or contacts were made. **Everything was fetched on 2026-10-14** unless a source says otherwise. Source IDs in square brackets, such as [A12] or [D3], point to the **Sources** list at the end. Lines marked **Analysis** are my reading of the data, not data. Lines marked **Unverified** have only a secondary or community source.

## 0. Method and caveats

- **Steam numbers** come from Steam's own endpoints for each app [A*]:
  - `api/appdetails` gives US price, release date, platforms, age ratings and demo flag.
  - `appreviews?language=all&purchase_type=all` gives the review label, percent positive and total reviews.
  - `appreviews?language=english&filter=all` gives the most helpful English review texts. These are paraphrased below.
  - The store page HTML gives user tags (first 6 shown).
  - `ISteamNews/GetNewsForApp` gives developer announcements, used for update cadence and launch history.
  - Prices are US prices at fetch time. "list" means a sale was running.
- **Estimated units** use the Boxleiter method: units ≈ Steam reviews × multiplier. I use **30× to 65×**. Jake Birkett's dataset on Game Developer (May 2018) reports [E1]:
  - range about 30–150×
  - median 77× overall, 65× for 2017 launches, about 38× for games in their first 3 days
  - the result can be off by about 2× either way
  - it "can't be used directly for revenue"

  These figures are **estimates**. My review counts include all purchase types, while Birkett used Steam's "All Reviews". **No revenue estimates are given.**

- **Estimators tried and not used:**
  - Gamalytic's API returned "requires an API key" (paid plan).
  - SteamSpy returned 0 reviews and "0 .. 20,000" owners for Thrifty Business, which contradicts the 1,425 reviews on Steam [E2]. Not used.
- **itch.io data** comes from the public game pages (stars, rating count, comments) [B*].

---

## 1. Direct competitors per game

Column key:

- **Rating**: Steam label, % positive and total reviews, all languages.
- **Est. units**: Boxleiter estimate (see §0).
- **Cadence**: what the Steam announcements show.

### 1.1 ADEEVA: fashion design career and runway shows

| Title                               | Price               | Rating                  | Released                        | Top tags                                                                 | Est. units   | Cadence                                                                                                                        |
| ----------------------------------- | ------------------- | ----------------------- | ------------------------------- | ------------------------------------------------------------------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Tailor Simulator [A1]               | $9.99               | Very Positive 90% / 517 | Feb 5 2026, Early Access        | Shop Keeper, Economy, Management, Life Sim, Relaxing, Family Friendly    | ~15.5k–33.6k | Hotfixes or updates every 1–3 weeks Jun–Aug 2026; last patch Aug 5; "Very Important Message" on Sep 28 2026                    |
| Historical Fashion Dress Up [A2]    | $7.99               | Positive 90% / 39       | Mar 21 2024 (has demo)          | Cozy, Historical, Design & Illustration, Hand-drawn, 2D, Family Friendly | ~1.2k–2.5k   | Very active: era updates such as Gilded Age (Jul 2026), scene composer (Aug 2026), Kickstarter for an 1860s pack (Sep 29 2026) |
| My Universe – Fashion Boutique [A3] | $24.99              | Mixed 56% / 48          | Nov 23 2020                     | Casual, Simulation, Cute, Management, 3D                                 | ~1.4k–3.1k   | No Steam announcements returned                                                                                                |
| Sewing Stuff [A4]                   | $4.99               | Mixed 69% / 16          | Sep 19 2024                     | Casual, Simulation, Character Customization                              | ~0.5k–1k     | No announcements                                                                                                               |
| Candy's Closet (itch.io) [B1]       | Free, donation link | 4.7★ / 167 ratings      | 2024 (made as a Christmas gift) | Cozy, Dress Up, fashion, outfits                                         | n/a          | No devlog posts                                                                                                                |

What players praise and complain about:

- **Tailor Simulator** [A1]:
  - Praise: designing and sewing outfits for customers, many fabrics, the town and its shops.
  - Complaints: the most-helpful negative review alleges undisclosed AI-made assets. Others call it "half finished", say promises were broken, and object to an in-game link to the developer's next game.
  - **Unverified**: these are reviewer claims.
- **Historical Fashion Dress Up** [A2]: praised for era-accurate clothing and its aesthetics. The review sample is small.
- **My Universe – Fashion Boutique** [A3]: "So many bugs you cannot progress".
- **Sewing Stuff** [A4]: the top review alleges that a banned developer is circumventing the ban, plus review manipulation (**Unverified**). Others call the gameplay "primitive" and "mobile-like".
- **Candy's Closet** [B1]: praised for cute art and ambience. The main complaint is "need more options".

**Possible gap (Analysis):** no well-reviewed 2D _career_ fashion game on Steam combines design, sewing, collections and runway shows. The 3D Early Access sim is drawing trust and AI complaints. The dress-up titles have no career loop.

### 1.2 Thrift-Flip Studio: upcycling secondhand clothes

| Title                       | Price                | Rating                              | Released                  | Top tags                                                            | Est. units                                                                                        | Cadence                                                                                              |
| --------------------------- | -------------------- | ----------------------------------- | ------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Thrifty Business [A5]       | $11.04 (list $12.99) | Overwhelmingly Positive 98% / 1,425 | May 18 2026               | Cozy, Shop Keeper, Organizing, Decorating, Pixel Graphics, Relaxing | ~42.8k–92.6k                                                                                      | Demo Feb 2026, launch May 18, free QoL update Jul 30, patch Aug 4, mobile port announced Oct 12 2026 |
| Tiny Bookshop [A6]          | $12.99 (list $19.99) | Overwhelmingly Positive 96% / 7,923 | Aug 7 2025                | Cozy, Management, Life Sim, Shop Keeper, Hand-drawn, Story Rich     | ~238k–515k. The developer itself reported 300k+ copies across Steam and Switch by Sep 3 2025 [C3] | Winter update 1.1.0 (Dec 2025), 1.1.6 (May 2026)                                                     |
| A Little to the Left [A7]   | $14.99               | Very Positive 92% / 19,378          | Nov 8 2022                | Puzzle, Organizing, Cleaning, Cozy, Family Friendly, 2D             | ~581k–1.26M                                                                                       | "Packed" update (Jun 2025, called the final content update), bugfix patches 2026, paid DLC           |
| Thrift Shop [A8]            | n/a                  | no reviews                          | Coming soon (has demo)    | Casual, Simulation, Crafting                                        | n/a                                                                                               | Last news Sep 2023                                                                                   |
| Thrift Store Simulator [A9] | n/a                  | no reviews                          | Coming soon, Early Access | 3D, Immersive Sim, Physics                                          | n/a                                                                                               | none                                                                                                 |

What players praise and complain about:

- **Thrifty Business** [A5]:
  - Praise: decorating, story and dialogue, "perfect for fans of Unpacking".
  - Complaints: "super short" (one player got 100% achievements in 14 h). Players want custom prices, wall items and layout options.
- **Tiny Bookshop** [A6]: praised as cozy, with real-book recommendations. Some found it "repetitive" or "too peaceful".
- **A Little to the Left** [A7]: some puzzles are seen as "read the developer's mind". Achievements locked behind paid DLC.

**Possible gap (Analysis):** existing titles are about _sorting and selling_. None found centres on _transforming_ garments (mending, dyeing, patching, restyling) as a creative craft with a fashion-sustainability theme. The thrift-specific competitors are unreleased.

### 1.3 Patisserie Atelier: cakes and pastry

| Title                          | Price                | Rating                       | Released                                           | Top tags                                                                 | Est. units    | Cadence                                                                              |
| ------------------------------ | -------------------- | ---------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------ | ------------- | ------------------------------------------------------------------------------------ |
| Lemon Cake [A10]               | $2.99 (list $14.99)  | Very Positive 84% / 2,077    | Feb 18 2021                                        | Simulation, Cute, Farming Sim, Time Management, Cooking, Family Friendly | ~62k–135k     | Patches Feb–Apr 2021, console port 2022; since then only the studio's next-game news |
| Tiny Bakery [A11]              | $9.99                | Very Positive 90% / 90       | 1.0 Sep 2026 (Early Access from Apr 20 2026; demo) | Cooking, Relaxing, Family Friendly, Crafting, Cute, Management           | ~2.7k–5.9k    | Updates every few days, Sep–Oct 2026                                                 |
| The Witch's Bakery [A12]       | $17.99 (list $19.99) | 9 reviews, 100% (launch day) | Oct 14 2026                                        | Cozy, Story Rich, 2D, Hand-drawn, Wholesome, Visual Novel                | n/a (too new) | Launched today, see §2                                                               |
| Bakery Simulator [A13]         | $1.11 (list $15.99)  | Mixed 66% / 2,459            | May 3 2022                                         | Simulation, Time Management, Realistic, First-Person, Cooking            | ~74k–160k     | Publisher news only                                                                  |
| Bakery Cafe Simulator [A14]    | $9.59 (list $11.99)  | Mixed 69% / 427              | Jul 8 2025, Early Access                           | Cooking, First-Person, Online Co-Op, Physics                             | ~12.8k–27.8k  | Patch #10 on Oct 12 2026 (Steam Cooking Fest)                                        |
| Cookie's Bakery (itch.io) [B2] | Free                 | 4.5★ / 233 ratings           | not shown                                          | baking, Cozy, Wholesome, Pixel Art, Game Boy                             | n/a           | v1.0.3                                                                               |

What players praise and complain about:

- **Lemon Cake** [A10]: praised for cute art and a fun loop. Complaints: "becomes a huge slog", grindy and repetitive after the upgrades.
- **Tiny Bakery** [A11]: praised as relaxing and for its Calm Mode with no timer. Complaints: physics clunkiness and items "flopping on the floor".
- **Bakery Simulator** [A13]: "satisfying when it works", with many bugs.
- **Cookie's Bakery** [B2]:
  - Praise: palette, music, warmth.
  - Complaints: hard-to-read font, unclear cookie names, confusing onboarding and controls.

**Possible gap (Analysis):** most bakery titles are either 3D physics or first-person sims (clunkiness complaints) or time-management games (grind complaints). A calm 2D _pastry-craft_ game with decoration and design focus and no timer pressure is less served. Calm Mode in Tiny Bakery was singled out as a positive.

### 1.4 Workshop & Wood: furniture making (thin genre)

| Title                       | Price  | Rating                              | Released                                                              | Top tags                                                     | Est. units | Cadence                                                  |
| --------------------------- | ------ | ----------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------ | ---------- | -------------------------------------------------------- |
| Little Big Workshop [A15]   | $19.99 | Very Positive 84% / 3,403           | Oct 17 2019                                                           | Simulation, Strategy, Management, Automation, Crafting, Cute | ~102k–221k | Last game-specific post 2021; publisher sale posts since |
| Master Of Pottery [A16]     | $5.99  | Overwhelmingly Positive 97% / 2,949 | 1.0 Sep 10 2026 (news back to Nov 2019; Early Access tag still shown) | Simulation, Casual, Crafting, Relaxing, Realistic            | ~88k–192k  | 3 updates Sep–Oct 2026                                   |
| The Lilliput Workshop [A17] | $7.99  | Very Positive 93% / 81              | Aug 6 2025 (demo)                                                     | Puzzle, Programming, Cozy, Automation                        | ~2.4k–5.3k | Launch with "Complete the Set" bundle                    |
| The Woodworking Game [A18]  | n/a    | none                                | Coming soon                                                           | Cozy, Crafting, Decorating, Voxel                            | n/a        | none                                                     |

What players praise and complain about:

- **Master Of Pottery** [A16]:
  - Praise: relaxing shaping, clients send photos of your pots in their homes.
  - Complaints: lacks polish, spelling errors, wants more story and unlocks.
- **Little Big Workshop** [A15]: the most-helpful review is still positive ("still in love … over 5 years").

**Possible gap (Analysis):** at fetch time no released, well-reviewed woodworking or furniture-making game was found. On-genre titles are unreleased. The closest proof of demand is Master Of Pottery's 97% on about 2.9k reviews for a hands-on craft-and-showroom loop.

### 1.5 Jewellery Bench: jewellery (thin genre)

| Title                                   | Price  | Rating                     | Released                            | Top tags                                                          | Est. units   | Cadence                                                 |
| --------------------------------------- | ------ | -------------------------- | ----------------------------------- | ----------------------------------------------------------------- | ------------ | ------------------------------------------------------- |
| LAPIDARY: Jewel Craft Simulator [A19]   | $7.99  | Very Positive 81% / 137    | Mar 25 2024                         | Simulation, Crafting, Relaxing, 3D, Cozy                          | ~4.1k–8.9k   | Sale posts; developer moved to the next game (MINERALS) |
| Trinket Bag Maker [A20]                 | $2.99  | Very Positive 100% / 75    | Mar 2026 (demo; Next Fest Feb 2026) | Sandbox, Design & Illustration, Decorating, Crafting, Retro, Cute | ~2.3k–4.9k   | Spring (Apr) and Summer (Jul) updates, patch Sep 1 2026 |
| Potion Craft: Alchemist Simulator [A21] | $19.99 | Very Positive 93% / 45,004 | Dec 13 2022                         | Crafting, Relaxing, Management, 2D, Sandbox                       | ~1.35M–2.93M | Devlogs on new content through Oct 2025                 |
| Master of Jewelry [A22]                 | n/a    | none                       | 2027 (public demo Oct 10 2026)      | Crafting, First-Person, Realistic                                 | n/a          | Demo updates                                            |
| Jeweler Simulator [A23]                 | n/a    | none                       | Coming soon                         | FPS, Realistic, "Gambling" (dev diary)                            | n/a          | Dev diaries in 2025                                     |

What players praise and complain about:

- **LAPIDARY** [A19]: "therapeutic gem crafting and that's all there is".
- **Trinket Bag Maker** [A20]: praised as "pocket-sized, adorable" and "nostalgic". Players want more content and size options.
- **Potion Craft** [A21]: art and concept praised. Complaints: grindy mid-game, harder modes are "routine grind".
- **Jeweler Simulator** [A23]: a dev diary title mentions "Auction, Gambling & More". That is a kid-suitability note.

**Possible gap (Analysis):** no released 2D jewellery _design_ game (beads, wire, settings, collections) with a career arc was found. The released options are a minimal 3D gem-cutter and a charm-bag sandbox.

### 1.6 Interior Studio: room makeovers and show homes

| Title                                 | Price                | Rating                              | Released           | Top tags                                                             | Est. units   | Cadence                                                                    |
| ------------------------------------- | -------------------- | ----------------------------------- | ------------------ | -------------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------- |
| Unpacking [A24]                       | $19.99               | Very Positive 93% / 41,092          | Nov 1 2021         | Relaxing, Cute, Pixel Graphics, Organizing, Puzzle, Story Rich       | ~1.23M–2.67M | Fixes Oct 2025, bundle with A Little to the Left Sep 2025, collab Jun 2026 |
| House Flipper 2 [A25]                 | $23.99 (list $39.99) | Very Positive 87% / 20,269          | Dec 14 2023        | Co-op, Relaxing, Decorating, First-Person, Cleaning, Family Friendly | ~608k–1.32M  | Pets DLC due Dec 3 2026, community contests                                |
| Mini Cozy Room: Lo-Fi [A26]           | $4.99                | Overwhelmingly Positive 97% / 3,849 | Mar 30 2025 (demo) | Cozy, Idler, Pixel Graphics, Desktop Companion, Family Friendly      | ~115k–250k   | Very frequent: content update Oct 13 2026, hotfix Oct 14, Mac playtest     |
| Interior Designer [A27]               | $9.99                | Mixed 56% / 63                      | Oct 25 2024 (demo) | Simulation, Building, Sandbox, Cozy, Family Friendly, 3D             | ~1.9k–4.1k   | 10% launch discount, hotfix Nov 2024, then nothing                         |
| My Universe – Interior Designer [A28] | $14.99               | Mostly Negative 33% / 15            | Dec 3 2021         | Simulation, Family Friendly, Decorating                              | ~0.5k–1k     | none                                                                       |
| Homemaking: Build & Decorate [A29]    | n/a                  | none                                | Q4 2026            | Decorating, Cozy, Wholesome, Isometric                               | n/a          | Pre-launch posts                                                           |

What players praise and complain about:

- **Unpacking** [A24]: environmental storytelling praised. Complaints: price versus length, and rigid "unpacked" rules.
- **House Flipper 2** [A25]: creativity praised. Complaints: no new content "in months" except DLC and store items, and awkward placement.
- **Mini Cozy Room** [A26]: productivity features and music praised.
- **Interior Designer** [A27]: crashes, no snapping or measurements, campaign of about 2 hours.
- **My Universe – Interior Designer** [A28]: "not playable on PC" (console-first controls).

**Possible gap (Analysis):** the big titles are 3D or puzzle-based. Kid-targeted licensed titles review poorly on PC because of controls and bugs. A 2D, mouse-friendly _client-brief makeover → show home_ career loop is not clearly served.

### 1.7 Six Kitchens: chef career, six cuisines

| Title                                   | Price               | Rating                     | Released                                        | Top tags                                                   | Est. units   | Cadence                                                               |
| --------------------------------------- | ------------------- | -------------------------- | ----------------------------------------------- | ---------------------------------------------------------- | ------------ | --------------------------------------------------------------------- |
| Venba [A30]                             | $3.74 (list $14.99) | Very Positive 93% / 3,830  | Jul 31 2023                                     | Cooking, Narrative, Puzzle, Emotional, Visual Novel        | ~115k–249k   | Mac support Jul 2025, Unity security hotfix Oct 2025                  |
| Cook, Serve, Delicious! 3?! [A31]       | $4.99 (list $19.99) | Very Positive 91% / 2,315  | Oct 14 2020                                     | Typing, Management, Difficult, Arcade, 2D, Family Friendly | ~69k–150k    | Cooking Fest news Oct 12 2026, sequel announced                       |
| Good Pizza, Great Pizza [A32]           | $4.99 (list $9.99)  | Very Positive 88% / 6,809  | Jan 6 2023                                      | Funny, Management, Time Management, Cooking, Cozy          | ~204k–443k   | Timed events about every 2 weeks, Aug–Oct 2026                        |
| Chef Life: A Restaurant Simulator [A33] | $2.99 (list $29.99) | Very Positive 84% / 2,845  | Feb 23 2023                                     | Simulation, Cooking, Management, Family Friendly           | ~85k–185k    | Tokyo DLC Mar 2024, patch Apr 2024, then sale posts                   |
| Little Chef: Cozy Cooking [A34]         | $7.19 (list $7.99)  | Very Positive 97% / 376    | 1.0 Aug 26 2026 (Early Access from Mar 16 2026) | Cozy, Cooking, Physics, Wholesome, Family Friendly, 2D     | ~11.3k–24.4k | Roughly weekly changelogs during Early Access; trading cards Sep 2026 |
| Overcooked! 2 [A35]                     | $24.99              | Very Positive 90% / 84,980 | Aug 7 2018                                      | Local Co-Op, Cooking, Funny, Family Friendly               | ~2.55M–5.52M | Anniversary post Aug 2026                                             |

What players praise and complain about:

- **Venba** [A30]: moving story and cuisine detail. "very short" (~2 h).
- **Good Pizza, Great Pizza** [A32]: addictive. Complaints: repetitive, and "micro transactions" despite being a paid game.
- **Chef Life** [A33]: kitchen expansion becomes "unbearable", poor tutorial, an unobtainable achievement.
- **Little Chef** [A34]: one parent says it is "intuitive enough that my 5 year old can play it … no timer, no penalties".
- **Overcooked! 2** [A35]: great co-op, but stressful by design, plus online multiplayer complaints.

**Possible gap (Analysis):** Venba (story) and Little Chef (puzzle) show demand for gentle, culturally specific cooking. Mainstream cooking titles lean on time pressure. A no-IAP, multi-cuisine _career_ arc (school → head chef → restaurant, food truck or TV) is not clearly covered. GPGP's paid-plus-microtransactions model draws complaints.

---

## 2. Launch patterns of comparable family-friendly cozy games

| Game                                             | Demo / Next Fest                                                                                                                                                                | Wishlists before launch (public)                                                                 | Price and launch discount                                                                 | Early Access or full                                                | Events and creators                                                                                                                     | Early signals                                                                                          |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Tiny Bookshop** [A6][C1–C3]                    | Public demo Jun 8 2024; demo refresh for **Next Fest Jun 9–16 2025**                                                                                                            | not stated                                                                                       | $19.99 list [A6]; launch discount not found                                               | Full release Aug 7 2025                                             | Wholesome Direct (Jun 2023), Gamescom demo (2023), Cozy Quest (2023, 2024), Steam "Cozy & Family Friendly Games Celebration" (May 2024) | "Over 200,000 copies" by Aug 19 2025; "over 300,000 … across both Steam and Switch" by Sep 3 2025 [C3] |
| **Thrifty Business** [A5][C4–C7]                 | Demo Feb 4 2026, ~30 min intended, some played 5–50 h; Twitch integration and 9 languages added to demo Feb 19 2026. Next Fest participation **not confirmed** in announcements | **18,000** about 9 days after the Dec 9 2025 announcement [C5]                                   | $12.99 [A5]                                                                               | Full release May 18 2026                                            | Release date first revealed on Wholesome Games socials [C6]; Twitch chat integration aimed at streamers [C7]                            | 98% of 1,425 reviews by Oct 14 2026 [A5]; mobile port announced [A5 news]                              |
| **The Witch's Bakery** [A12][C8–C11]             | Next Fest Feb 2026, time-limited demo: "20,000 of you have played"; demo re-opened for Backed by Backers and Games Made in France events                                        | 10k (Jun 2024) → 50k (May 2025) → 60k (Sep 2025) → 150k (Apr 2026) → **200k (Jul 24 2026)** [C9] | $19.99, **10% launch discount** [C10]                                                     | Full release Oct 14 2026; consoles and physical                     | Kickstarter (2024), Gamescom 2026 Indie Arena Booth; publisher Silver Lining Interactive [A12]                                          | Launch day: 9 reviews, 100% [A12]                                                                      |
| **Little Chef: Cozy Cooking** [A34][B3][C12–C14] | Free itch.io prototype first (PWYW, 4.7★ / 1,488 ratings) [B3]; **Next Fest Feb 2026** with a creator livestream (Juliette's Gaming Corner) [C12]                               | not stated                                                                                       | Lower price during Early Access, plus 10% for the first 2 weeks [C13]; $7.99 at 1.0 [A34] | **Early Access** Mar 16 2026 → 1.0 Aug 26 2026                      | Collaborative Steam bundles with "friends" (Sep 2026) [C14]                                                                             | 97% of 376 reviews [A34]                                                                               |
| **Tiny Bakery** [A11][C15]                       | Demo since Oct 2025; demo saves carry over to the full game                                                                                                                     | not stated                                                                                       | $9.99                                                                                     | **Early Access** Apr 20 2026 → 1.0 Sep 7 2026 (delayed from Aug 24) | Twitch integration (per a review) [A11]                                                                                                 | 90% of 90 reviews [A11]                                                                                |
| **Trinket Bag Maker** [A20][C16]                 | Demo Feb 2026; **Next Fest Feb 2026**                                                                                                                                           | not stated                                                                                       | $2.99                                                                                     | Full release Mar 2026                                               | —                                                                                                                                       | 100% of 75 reviews                                                                                     |
| **Interior Designer** [A27]                      | Demo                                                                                                                                                                            | not stated                                                                                       | $9.99 with a **10% launch discount**                                                      | Full release                                                        | Steam Awards nomination push                                                                                                            | Mixed 56% of 63 reviews                                                                                |

Bundles seen:

- Unpacking + A Little to the Left: cross-publisher Steam bundle, Sep 2025 [A7][A24].
- The Lilliput Workshop launched with a "Complete the Set" bundle [A17].
- Dress-up Pups' publisher sells 30-game Match-3 bundles at 60–75% off [A3b].

Third-party benchmarks (industry commentary, **not Valve data**):

- About **7,000–10,000 wishlists** is commonly cited as the floor for Steam's "Popular Upcoming" list, and "the algorithm isn't based on a raw number" [E3].
- presskit.gg lists median first-week wishlist conversion of about 15% under 5k wishlists and about 20% at 5k–40k [E4]. **Unverified**: methodology not checked.

---

## 3. Store mechanics and rules (solo developer, kid-friendly)

### 3.1 Steam

- **App fee:** "$100 USD … for each new app". It is non-refundable and "recoupable … after your product has at least $1,000.00 Adjusted Gross Revenue" [D1].
- **Onboarding:** first titles have a **21-day waiting period** between paying the fee and release. Identity and tax checks are required, and tax verification "may take 10 to 15 business days" [D2].
- **Revenue share:** 30% standard. 25% applies after $10M and 20% after $50M per game, for sales from Oct 1 2018 [D3]. **Secondary source**: Valve's announcement page did not render its body. Not relevant at indie scale.
- **Review process:**
  - Store page and build are each reviewed, typically in 3–5 business days. Plan for 7 business days [D4].
  - Capsules need a readable title or logo. Screenshots must show only gameplay. Every listed OS must launch [D4].
  - A **Coming Soon page must be live at least 2 weeks** before release [D5].
- **Store assets** [D6]:
  - Header 920×430, Small 462×174, Main 1232×706, Vertical 748×896.
  - At least **5 screenshots** at 1920×1080 or larger. Mark at least 4 as suitable for all ages.
  - No text on capsules beyond the title.
- **Content Survey (mandatory)** [D7]:
  - The general section **generates regional ratings** shown on the store.
  - The mature section controls visibility against each customer's preferences.
  - A **Generative-AI disclosure** section covers shipped AI content.
  - Observed in the data: every competitor shows auto-generated `steam_germany`, `dejus` (Brazil) and `igrs` (Indonesia) ratings [A*].
- **Germany:** since Nov 15 2024 Steam hides games without a valid rating in Germany. A rating comes from USK or from Valve's process based on the content survey. Do not enter an IARC-derived USK rating from another store [D8].
- **Next Fest** [D9][D10]:
  - Requires a public store page and a public demo, and the game must be unreleased.
  - Each title can participate **only once**. Prologues and other versions of a title that already took part are excluded.
  - Submit the demo for review 3 weeks before (5 weeks to be live for Press Preview, which starts 11 days before the Fest).
  - Dates: **Oct 19–26 2026, Feb 22–Mar 1 2027, Jun 14–21 2027**.
  - Also listed: Steam Cooking Fest Oct 12–19 2026, Desktop Companion Fest Jan 14–18 2027, Couch Co-Op Fest Feb 8–15 2027.
- **Demos** [D11]:
  - Free, with a separate App ID linked to the base game.
  - An optional separate demo page can collect user reviews.
  - One wishlist notification is allowed when the demo first launches (within 2 weeks).
  - A demo can be deactivated later.
- **Early Access** [D12]:
  - Must be playable at purchase, with at least a gameplay trailer.
  - "Do not make specific promises."
  - The Steam price must be no higher than elsewhere, and Steam must not launch later than other stores.
  - No permanent discounts.
  - The store page shows a notice after 12 months without updates.
- **Discounts** [D13]:
  - Launch discount: 10–40%, running 7–14 days. Valve suggests 10–15%.
  - Then a 30-day cooldown after release and between discounts (seasonal sales are exempt).
  - Price increases also block discounts for 30 days.
- **Bundles** [D14]:
  - Up to 95% off the contained items.
  - "Complete the set" charges buyers only for the items they don't own.
  - Bundles across developers are possible.
  - No review step is described.
- **Refunds:** within **14 days and under 2 hours** of playtime. Any Early Access playtime counts toward the 2 hours [D15].
- **Account age:** "You may not become a Subscriber if you are under the age of 13" [D16]. Purchases for younger children therefore go through a parent's account.
  - Steam Families child-member controls are described only in community posts (**Unverified**) [D17].

### 3.2 itch.io

- **Revenue share:** "open revenue sharing". The default is **10%**, and the seller can set anything from 0% to 100% [D18][D19].
  - Processor fees (PayPal or Stripe): $0.30 + 2.9% per transaction [D19].
- **Pricing:** a free option is available. "You can optionally put a minimum price on your page (which can be 0)" (pay-what-you-want) [D18].
- **Payout modes** [D19]:
  - _Direct to you_ (PayPal or Stripe; you are merchant of record), or
  - _Collected by itch.io_ (itch is merchant of record and handles EU VAT).
  - In collected mode, revenue is available 7 days after purchase. Payouts are reviewed ≥7 days after request and typically take 10–14 days.
  - Minimum payout $5. Payout methods are PayPal or Payoneer.
  - A tax interview is required. The default withholding is 30% without a tax ID, plus a $3 fee.
- **HTML5 hosting** [D20]:
  - ZIP containing `index.html`.
  - Limits: ≤1,000 files, ≤500 MB extracted, ≤200 MB per file, paths ≤240 characters.
  - Served from a CDN subdirectory, so **absolute `/` paths break**. Use relative paths.
  - File names are case-sensitive. HTML, JS, CSS and SVG are gzipped automatically.
  - Display modes: embed or click-to-fullscreen, with a "Mobile Friendly" flag.
- **Community and devlogs:** game pages carry comment threads and a Devlog section, as seen on Candy's Closet (42 comments) and Little Chef (devlog May 28 2025) [B1][B3].
- **Bundles** [D21]:
  - Any developer can host a co-op bundle. Revenue is split by participant weights, and every participant must accept.
  - Charity bundles need itch.io staff to add the recipient.
  - A bundle of only your own games uses Sales & Promotions instead.
- **Age:** "Users affirm that they are over the age of 13". The Terms show **no content-rating system** [D22].
  - Whether browser play needs an account was not verified.

### 3.3 Age ratings (IARC, PEGI, ESRB)

- **Steam:** ratings come from the Content Survey (regional) or are entered by the developer if issued directly by a board. See [D7][D8].
  - Some competitors show official ESRB/PEGI ratings, for example House Flipper 2 (PEGI 3, ESRB E) and Chef Life (ESRB E, PEGI 3) [A25][A33].
  - Most show only Steam-generated ratings [A*].
- **itch.io:** no rating system found in its Terms [D22].
- **IARC** is a questionnaire-based system that some storefronts use to issue local ratings such as ESRB and PEGI [E5]. I could not fetch an official list of participating stores (globalratings.com page returned 404), so **whether IARC is relevant on either store is unverified**. Steam's German page says not to reuse IARC-derived USK ratings [D8].

### 3.4 Under-13 audience and privacy

- **COPPA (US)** covers websites and online services, including apps, that are directed to children under 13 _and_ "collect, use, or disclose personal information". "COPPA applies only to those websites and online services that collect … personal information" [D23].
  - Persistent identifiers (cookie IDs, IP addresses, device serials) count as personal information [D23].
  - The FTC still recommends a privacy policy even when no data is collected [D23].
  - The amended Rule (published Apr 22 2025) had a **full compliance date of Apr 22 2026** [D24]. That is a secondary source (Toy Association and law firms).
  - **Analysis:** a fully offline build with no analytics, crash reporting, accounts, chat or network calls appears to fall outside COPPA's collection trigger. Every SDK still needs checking:
    - Steamworks
    - Electron auto-update
    - font or CDN fetches
    - itch.io's own site analytics, which fall under itch's own policies (**Unverified**)
- **UK Children's Code (ICO):** applies to online "information society services" likely to be accessed by under-18s [D25]. A law-firm reading says it does not generally cover offline or downloaded games that need no internet connection [D26]. That is an **interpretation, not ICO text**.
- **Store accounts** on both stores are 13+ [D16][D22]. Children under 13 would play on a parent's account or download.

---

## 4. Shipping a React/Vite web game on each store

- **itch.io HTML5:** upload the Vite `dist/` as a ZIP [D20].
  - **Analysis:** set Vite `base: './'` so asset paths are relative, as required by the CDN-subdirectory rule.
  - Keep under 1,000 files and 500 MB.
  - Browser saves would sit in the itch CDN origin's storage. Behaviour not verified.
- **Steam via Electron:**
  - Electron v44.7.2 (released Oct 14 2026) runtime ZIPs are **157.9 MB** (Windows x64), **123.0 MB** (Linux x64) and **130.5 MB** (macOS arm64) before your app [D27].
  - Steamworks access is usually through **steamworks.js**, an alternative to the unmaintained greenworks [D28]. Its README:
    - needs `contextIsolation: false` and `nodeIntegration: true` for renderer access (security trade-off)
    - needs `electronEnableSteamOverlay()` for the overlay
    - needs the Steamworks redistributable files copied into the build
    - lists 52 open issues at fetch time
- **Steam via Tauri 2** (v2.12.3, Oct 10 2026) [D29]:
  - "a minimal Tauri app can be less than 600KB" because it uses the system webview [D30].
  - Windows uses WebView2 (self-updating Chromium; the installer handles older Windows) [D31].
  - macOS uses WKWebView, tied to the OS version [D31].
  - Linux uses WebKitGTK, which varies by distribution (for example Ubuntu 22.04 ships 2.36) [D31].
  - **Known pitfall:** the Steam overlay over WebView2 is reported as unreliable or "appears to be impossible" (Construct's engineer) [D32]. A WebView2 issue thread discussing Tauri reached no conclusion [D33].
- **Store rule reminder:** Steam's build review checks that the game launches on **every OS listed** [D4].

---

## 5. Possible paths for Shan to discuss (options, not recommendations)

Costs are from §3. Effort figures are **Analysis** (rough).

| Path                                                                                           | Pros                                                                                                                                                                        | Cons                                                                                                                                                  | Direct costs                                                                          | Effort                                                                                                                             |
| ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **A. Stay private** (family only, local build)                                                 | No exposure, no compliance surface, no store work                                                                                                                           | No feedback beyond family, no revenue                                                                                                                 | $0                                                                                    | None beyond current                                                                                                                |
| **B. Free itch.io web builds** (one page per game or a "Maker Studio" page)                    | Fast; matches the existing web stack; PWYW or donations possible; devlog and comments; precedent: Little Chef's free itch prototype reached 1,488 ratings before Steam [B3] | itch accounts are 13+ [D22]; public comments need moderating; small discovery compared with Steam; browser save behaviour unverified                  | $0 hosting; 10% default share (adjustable) + PayPal/Stripe fees on any payments [D19] | Low: relative-path build, page art, screenshots                                                                                    |
| **C. Free itch web demo → Steam Coming Soon page → Steam demo + one Next Fest → full release** | The pattern seen in Little Chef, Thrifty Business and Witch's Bakery; wishlists and Next Fest exposure [C5][C9][C12]                                                        | Wrapper work (Electron or Tauri pitfalls, §4); per-OS testing; only one Next Fest per title; ≥2 weeks Coming Soon; 21-day first-app wait [D2][D5][D9] | $100 per Steam app (recoupable after $1k) [D1]; 30% share [D3]                        | Medium–high: capsules and screenshots [D6], content survey [D7], build reviews (~7 business days each) [D4], tax and ID onboarding |
| **D. Steam Early Access first**                                                                | Revenue and feedback during development; precedent: Little Chef and Tiny Bakery went Early Access → 1.0 within about 5 months [C13][C15]                                    | Must be playable at purchase; Early Access playtime counts toward refunds; public update expectations; "no promises" rule [D12][D15]                  | As C                                                                                  | High: ongoing patches and communication                                                                                            |
| **E. One Steam app containing all 7 games** vs **7 separate apps (+ Steam bundle)**            | One app means one $100 fee and one review track. Separate apps mean their own pages, demos and Next Fests, and can be bundled "complete the set" [D14]                      | One app means a single page, one Next Fest, and harder discovery per theme. Separate apps mean 7× assets, reviews and surveys                         | $100 vs $700 in app fees [D1]                                                         | One app: lower. Separate: higher                                                                                                   |
| **F. itch.io paid downloads** (Electron/Tauri builds) alongside or instead of Steam            | Keeps 90–100% minus fees; pay-what-you-want or a minimum price; co-op bundles possible [D18][D21]                                                                           | Smaller audience; if also on Steam Early Access, Steam must not launch later or cost more [D12]                                                       | Processor fees; tax interview for collected mode [D19]                                | Medium: packaging per OS                                                                                                           |

Common considerations across paths (Analysis, from §1 reviews):

- **Players punish** undisclosed AI assets [A1], buggy or console-first PC controls [A28], short content at full price [A5][A24], and paid games that add microtransactions [A32].
- **Players praise** calm or no-timer modes [A11][A34], accessibility toggles such as a non-pixel font and saturation slider [C6], and steady free updates [A5][A26].

---

## Sources (all fetched 2026-10-14)

**A. Steam store data.** For each app ID below I fetched four endpoints:

- `https://store.steampowered.com/api/appdetails?appids=<ID>&cc=us`
- `https://store.steampowered.com/appreviews/<ID>?json=1&language=all&purchase_type=all` (plus `&language=english&filter=all` for review text)
- the store page `https://store.steampowered.com/app/<ID>/`
- `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=<ID>&feeds=steam_community_announcements`

[A*] means all of these.

| ID  | App ID  | Title                             |
| --- | ------- | --------------------------------- |
| A1  | 3484750 | Tailor Simulator                  |
| A2  | 2692430 | Historical Fashion Dress Up       |
| A3  | 1365410 | My Universe – Fashion Boutique    |
| A3b | 1658370 | Dress-up Pups                     |
| A4  | 3203860 | Sewing Stuff                      |
| A5  | 3693650 | Thrifty Business                  |
| A6  | 2133760 | Tiny Bookshop                     |
| A7  | 1629520 | A Little to the Left              |
| A8  | 2355270 | Thrift Shop                       |
| A9  | 3075460 | Thrift Store Simulator            |
| A10 | 1338330 | Lemon Cake                        |
| A11 | 3951340 | Tiny Bakery                       |
| A12 | 2967950 | The Witch's Bakery                |
| A13 | 1031120 | Bakery Simulator                  |
| A14 | 3444080 | Bakery Cafe Simulator             |
| A15 | 574720  | Little Big Workshop               |
| A16 | 1160490 | Master Of Pottery                 |
| A17 | 1791580 | The Lilliput Workshop             |
| A18 | 5115030 | The Woodworking Game              |
| A19 | 2539820 | LAPIDARY: Jewel Craft Simulator   |
| A20 | 4247070 | Trinket Bag Maker                 |
| A21 | 1210320 | Potion Craft: Alchemist Simulator |
| A22 | 3494290 | Master of Jewelry                 |
| A23 | 2849290 | Jeweler Simulator                 |
| A24 | 1135690 | Unpacking                         |
| A25 | 1190970 | House Flipper 2                   |
| A26 | 3511030 | Mini Cozy Room: Lo-Fi             |
| A27 | 2844910 | Interior Designer                 |
| A28 | 1591900 | My Universe – Interior Designer   |
| A29 | 3451250 | Homemaking: Build & Decorate      |
| A30 | 1491670 | Venba                             |
| A31 | 1000030 | Cook, Serve, Delicious! 3?!       |
| A32 | 770810  | Good Pizza, Great Pizza           |
| A33 | 1122340 | Chef Life: A Restaurant Simulator |
| A34 | 3376500 | Little Chef: Cozy Cooking         |
| A35 | 728880  | Overcooked! 2                     |

Discovery searches used `https://store.steampowered.com/api/storesearch/?term=<q>&cc=US`.

**B. itch.io pages**

- B1 https://cutegamesclub.itch.io/candys-closet
- B2 https://leafthief.itch.io/cookies-bakery
- B3 https://truebiger.itch.io/little-chef

**C. Developer announcements (Steam news)**

- C1 Tiny Bookshop, public demo (2024-06-08): https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/5746109972556610022
- C2 Tiny Bookshop, Next Fest demo refresh (2025-06-06): https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/1801617199432588
- C3 Tiny Bookshop:
  - 200k copies (2025-08-19): https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/1808061939506518
  - 300k copies (2025-09-03): https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/1809869180001140
- C4 Thrifty Business, demo out (2026-02-04): https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/1823825466494104
- C5 Thrifty Business, 18,000 wishlists (2025-12-18): https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/1819386365089280
- C6 Thrifty Business, release date and accessibility options (2026-04-02): https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/1828894815557507
- C7 Thrifty Business, Twitch integration (2026-02-19): https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/1825093633184787
- C8 The Witch's Bakery, 20,000 Next Fest demo players (2026-03-04): https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/1826362059919003
- C9 The Witch's Bakery wishlist milestones:
  - 200k (2026-07-24): https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/1839041357030276
  - 150k (2026-04-20): https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/1830163047266785
  - 60k (2025-10-02): https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/1811772772477301
  - 10k (2024-06-06): https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/5746109972549202498
- C10 The Witch's Bakery, "Before You Buy", 10% launch discount (2026-10-08): https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/1846018067931252
- C11 The Witch's Bakery, Backed by Backers demo (2026-04-14): https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/1829528821318452
- C12 Little Chef, Next Fest livestream (2026-02-23): https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/1825093633193820
- C13 Little Chef:
  - Early Access launch (2026-03-16): https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/1826992588602209
  - why Early Access (2026-02-27): https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/1825727806711559
- C14 Little Chef, bundles (2026-09-25): https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/1844751498224023
- C15 Tiny Bakery, 1.0 date and first demo Oct 2025 (2026-07-29): https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/1839676055883497 (Early Access release post 2026-04-20 via [A11] news feed)
- C16 Trinket Bag Maker, Next Fest demo (2026-02-23): via [A20] news feed

**D. Platform rules and law**

- D1 https://partner.steamgames.com/doc/gettingstarted/appfee
- D2 https://partner.steamgames.com/doc/gettingstarted/onboarding
- D3 https://www.neowin.net/news/valve-introduces-new-revenue-share-tiers-for-steam-promising-bigger-cuts-for-studios/ (secondary). Primary, which did not render: https://steamcommunity.com/groups/steamworks/announcements/detail/1697191267930157838
- D4 https://partner.steamgames.com/doc/store/review_process
- D5 https://partner.steamgames.com/doc/store/coming_soon
- D6 https://partner.steamgames.com/doc/store/assets/standard
- D7 https://partner.steamgames.com/doc/gettingstarted/contentsurvey
- D8 https://partner.steamgames.com/doc/gettingstarted/contentsurvey/germany (contents via search summary)
- D9 https://partner.steamgames.com/doc/marketing/upcoming_events/nextfest
- D10 https://partner.steamgames.com/doc/marketing/upcoming_events
- D11 https://partner.steamgames.com/doc/store/application/demos
- D12 https://partner.steamgames.com/doc/store/earlyaccess
- D13 https://partner.steamgames.com/doc/marketing/discounts
- D14 https://partner.steamgames.com/doc/store/application/bundles
- D15 https://store.steampowered.com/steam_refunds/
- D16 https://store.steampowered.com/subscriber_agreement/
- D17 https://steamcommunity.com/discussions/forum/1/6679473922617404661 (community, unverified)
- D18 https://itch.io/docs/creators/faq
- D19 https://itch.io/docs/creators/payments
- D20 https://itch.io/docs/creators/html5
- D21 https://itch.io/docs/creators/bundles
- D22 https://itch.io/docs/legal/terms
- D23 https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions
- D24 https://toyassociation.org/PressRoom2/News/2026-News/updated-coppa-rule-requirements-take-effect-april-22.aspx (secondary)
- D25 https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/introduction-to-the-childrens-code (via search summary)
- D26 https://www.taylorwessing.com/fr/insights-and-events/insights/2020/11/the-childrens-code-what-does-it-mean-for-the-games-industry (law-firm interpretation, 2020)
- D27 https://api.github.com/repos/electron/electron/releases/latest (asset sizes)
- D28 https://github.com/ceifa/steamworks.js
- D29 https://api.github.com/repos/tauri-apps/tauri/releases
- D30 https://v2.tauri.app/start/
- D31 https://v2.tauri.app/reference/webview-versions/
- D32 https://www.construct.net/en/blogs/ashleys-blog-2/trying-show-steam-overlay-1861 (via search summary)
- D33 https://github.com/MicrosoftEdge/WebView2Feedback/discussions/4019 (via search summary)

**E. Estimators and commentary**

- E1 Jake Birkett, "Using Steam reviews to estimate sales", Game Developer, 2018-05-04: https://www.gamedeveloper.com/business/using-steam-reviews-to-estimate-sales
- E2 SteamSpy API, checked and rejected: https://steamspy.com/api.php?request=appdetails&appid=3693650. Gamalytic API, checked: https://api.gamalytic.com/game/3693650
- E3 https://howtomarketagame.com/2024/01/29/do-wishlists-matter-any-more/ (via search summary)
- E4 https://presskit.gg/field-guides/how-many-wishlists-to-launch (via search summary; unverified methodology)
- E5 https://en.wikipedia.org/wiki/International_Age_Rating_Coalition (secondary)
