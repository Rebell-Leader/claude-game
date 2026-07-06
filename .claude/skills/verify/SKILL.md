---
name: verify
description: Build/launch/drive recipe for verifying Awawa Quest (static browser game) end-to-end.
---

# Verifying Awawa Quest

Static site, no build step. Everything is plain script tags (no ES modules), so it
also works from `file://`, but drive it over HTTP:

```sh
http-server -p 8123 -s   # or: python3 -m http.server 8123
```

Drive with Playwright + the preinstalled Chromium
(`executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'`,
global module at `/opt/node22/lib/node_modules/playwright`).

## Flows worth driving

1. Title → `[data-action="new-game"]` → pick a starter card
   (`[data-action="pick-starter"][data-arg="Sunnyrax"]`).
2. Hub → click `[data-action="explore"]` repeatedly until `.battle-stage` exists
   (~62% chance per click; cap at ~15 tries).
3. Battle → click `[data-action="battle-move"]`; wait for the action buttons to
   re-render before the next click (battle events animate for a few seconds):
   `waitForFunction(() => document.getElementById('battle-actions')?.querySelector('[data-action]'))`.
   Battle is over when `[data-action="battle-end"]` appears.
4. Catch: `battle-menu` arg `catch` → `battle-catch`. Menus: dex/shop/party/zones
   via `show-dex` / `show-shop` / `show-party` / `show-zones`.
5. Persistence probe: `page.reload()` → `[data-action="continue-game"]` should
   exist and restore coins/party (localStorage key `awawa-quest-save-v1`).
6. Elder Trial: `[data-action="elder-challenge"]` on the hub. Catch/Run are
   disabled buttons during trials. First win grants `state.badges[zoneId]`; a
   rematch win logs "concedes the rematch". To win the cliffs elder reliably,
   seed a save with a Leaf attacker (type advantage vs Rock).
7. Golden variants are 1/40 — for deterministic tests force one via
   `page.evaluate(() => { Battle.start(Game.firstHealthy(), Game.makeAwawa('Pebbawa', 3, {golden:true})); UI.showBattle(); })`.
8. Journal/milestones: `show-journal`; milestones auto-claim via
   `Game.checkMilestones()` and surface as toasts. Move editor:
   party → Info → `party-moves` → `moveedit-toggle`/`moveedit-save`.
9. Old-save migration: writing a pre-badges save (no `badges`/`milestones`/
   `dex.golden` keys) then Continue must not throw — `Game.load()` migrates.
10. Trainer battles: ~12% of explores; force deterministically via
    `page.evaluate(() => { const t = { def: TRAINERS.cliffs[0], queue: TRAINERS.cliffs[0].team.map(sp => Game.makeAwawa(sp, 4)), idx: 0 };
    Battle.start(Game.firstHealthy(), t.queue[0], { trainer: t }); UI.showBattle(); })`.
    Assert: `.team-pips` renders, catch/run disabled, defeating a mon logs
    "sends out" + per-knockout XP, final win pays `def.coins` and bumps
    `stats.trainerWins`.
11. Held charms: buy under the shop's "Held Charms" section, equip via
    party → Info → `party-held` → `held-set` (arg `idx|Item Name`).
    Swapping must return the previous charm to the bag.

## Gotchas

- Collect `console` type=error and `pageerror` — the game has no error overlay.
- `confirm()` dialogs guard new-game-over-save, release, and save wipe; register
  a dialog handler if driving those paths.
- Audio is WebAudio behind a user gesture; harmless headless.
