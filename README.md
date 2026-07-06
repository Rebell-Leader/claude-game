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
complete all 18 Awadex entries, evolve every line, reach the level-gated
Great Rock Summit and catch the two legendaries.

## Systems

| System | Design |
|---|---|
| **Types** | Two triangles: Rock ▶ Sun ▶ Leaf ▶ Rock and Sound ▶ Dream ▶ Wind ▶ Sound (+ Neutral). 2× / 0.5× multipliers, STAB 1.5×. |
| **Species** | 18 awawas, 3 starter lines with 3 evolution stages, rares, and 2 legendaries. Procedurally drawn SVG sprites — no image assets. |
| **Battle** | Turn-based, speed decides order, 4-move slots, stat stages (attack/defense buffs & debuffs), healing and drain moves. |
| **Catching** | Throw Pebbles / Smooth Stones / Comfy Blankets. Catch odds scale with remaining HP and species rarity. |
| **Growth** | Classic stat curves, XP from battles, level-up move learning, level-triggered evolution. |
| **Economy** | Coins from battles & exploration → shop (catch items, snacks). |
| **Zones** | 5 zones with distinct palettes, encounter tables and level ranges; the last two are gated by party level. |
| **Juice** | Animated HP bars, hit shakes, screen transitions, synthesized "awawawa" cries via WebAudio. |

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
