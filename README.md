# 🐹 Awawa Quest

A Pokémon-like web game where you collect **Awawas** — adorable, screaming hyraxes.
Zero dependencies, zero build step: open `index.html` in a browser and play.

## Core game loop

```
        ┌──────────────────────────────────────────────┐
        │                                              │
        ▼                                              │
   ① EXPLORE a zone  ──►  ② ENCOUNTER a wild awawa     │
        │                        │                     │
        │ (find items/coins)     ▼                     │
        │                  ③ BATTLE (turn-based,       │
        │                     type effectiveness)      │
        │                        │                     │
        │              ┌─────────┴─────────┐           │
        │              ▼                   ▼           │
        │         ④ CATCH it          defeat it        │
        │        (fills Awadex)      (earn XP+coins)   │
        │              │                   │           │
        │              └─────────┬─────────┘           │
        │                        ▼                     │
        │              ⑤ TRAIN & EVOLVE your party     │
        │                        │                     │
        │                        ▼                     │
        └──────────── ⑥ PROGRESS: spend coins, ────────┘
                         unlock harder zones,
                         complete the Awadex,
                         find the legendary GREAT AWAWA
```

**Moment-to-moment:** every "Explore" click is a slot-machine pull — a wild awawa,
an item, coins, or flavor. Battles are short (4 moves, type triangle) so the loop
stays snappy.

**Session-to-session:** progress is auto-saved to `localStorage`. Long-term goals:
complete all 18 Awadex entries, evolve every line, hunt ✨ golden variants, and
climb the badge ladder to the finale.

**The arc:** every zone is guarded by an **Elder** — a boss trial you can't flee
or catch. Beating an Elder earns a badge (and unlocks the next zone). The fifth
trial is THE GREAT AWAWA itself; defeating it rolls the ending. **Milestones**
(catch 5 species, evolve one, win 50 battles…) auto-pay coins and items along
the way, so there's always a near-term goal ticking toward completion.

## Systems

| System | Design |
|---|---|
| **Types** | Two triangles: Rock ▶ Sun ▶ Leaf ▶ Rock and Sound ▶ Dream ▶ Wind ▶ Sound (+ Neutral). 2× / 0.5× multipliers, STAB 1.5×. |
| **Species** | 18 awawas, 3 starter lines with 3 evolution stages, rares, and 2 legendaries. Procedurally drawn SVG sprites — no image assets. |
| **Battle** | Turn-based, speed decides order, 4-move slots, stat stages (attack/defense buffs & debuffs), healing and drain moves. |
| **Catching** | Throw Pebbles / Smooth Stones / Comfy Blankets. Catch odds scale with remaining HP and species rarity. |
| **Growth** | Classic stat curves, XP from battles, level-up move learning, level-triggered evolution. |
| **Growth (cont.)** | Move editor: recompose any party member's 4-move set from everything it has ever learned. Nicknames too. |
| **Elder Trials** | One boss per zone (boosted stats, full endgame moveset, no catching/fleeing). First win → badge + big reward; rematches pay smaller purses. All 5 badges + summit win → ending screen. |
| **Milestones** | 13 auto-claiming achievements in the Journal, from "First Friend" to "Awadex Master". |
| **Golden awawas** | 1-in-40 wild encounters are gilded shinies — triple coins if defeated, a permanent ✨ Awadex marker if caught. |
| **Trainers** | 10 wandering rivals (2 per zone) with themed 2–3 awawa teams and personality quips. No catching, no running; XP per knockout, a coin purse on victory, and their own milestones. |
| **Held charms** | 8 equippable items (one per awawa): +25% to a chosen type's moves, 15% crit chance, or 6% HP regen per round. Bought in the shop, managed from the Party screen. |
| **Day/night** | A 4-phase cycle (dawn/day/dusk/night) advances every 10 steps; resting skips a phase. Each phase tints the world and reshapes encounter tables — Dream awawas swarm at night, dawn doubles golden odds. |
| **Rival** | Scree 😼 ambushes you on the first step after every badge, always carrying the starter line that counters yours (it evolves as you progress) plus a growing entourage. Five story fights; loses are re-attempted until beaten. |
| **Scream Tower** | Post-game endless gauntlet (unlocked at 5 badges): escalating floors of catchable high-level wilds, a heavy-hitter every 5th floor (The Great Awawa can appear past floor 20), +20% party HP between floors, better shiny odds, leave-anytime banking. Milestones at floors 10 and 25. |
| **Economy** | Coins from battles & exploration → shop (catch items, snacks). |
| **Zones** | 5 zones with distinct palettes, encounter tables and level ranges; unlock the next zone by beating the previous Elder (or out-leveling it). |
| **Juice** | Animated HP bars, floating damage numbers, hit shakes, badge pop, screen transitions, synthesized "awawawa" cries, and a generative chiptune soundtrack with a distinct theme per zone plus battle/boss themes (WebAudio, toggleable). |

## Play

Open `index.html` directly, or serve the folder:

```sh
python3 -m http.server 8080   # then visit http://localhost:8080
```

## Code layout

```
index.html      shell + script includes
css/style.css   all styling & animations
js/data.js      types, moves, species, zones, items (pure data)
js/sprites.js   parameterized SVG hyrax renderer
js/audio.js     WebAudio cry/SFX synth
js/game.js      state, save/load, stats, XP, catching math
js/battle.js    battle engine (turns, damage, effects, AI)
js/ui.js        screens, rendering, event wiring
```
