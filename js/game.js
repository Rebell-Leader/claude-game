// ===== Awawa Quest — core state, math, save/load =====
'use strict';

const SAVE_KEY = 'awawa-quest-save-v1';
const PARTY_MAX = 6;

const Game = {
  state: null,

  newGame(starterSpecies) {
    this.state = {
      coins: 60,
      items: { 'Pebble': 5, 'Snack': 2 },
      party: [this.makeAwawa(starterSpecies, 5)],
      dex: { seen: {}, caught: {}, golden: {} },
      zone: 'cliffs',
      badges: {},
      milestones: {},
      endingSeen: false,
      stats: { battles: 0, catches: 0, steps: 0, evolutions: 0 },
    };
    this.markDex(starterSpecies, true);
    this.save();
  },

  // ---- creature factory ----
  makeAwawa(speciesName, level, opts = {}) {
    const sp = SPECIES[speciesName];
    const mon = {
      uid: 'a' + Math.random().toString(36).slice(2, 9),
      species: speciesName,
      nickname: null,
      level,
      xp: 0,
      golden: !!opts.golden,
      boost: opts.boost || 1,
      moves: this.movesAtLevel(speciesName, level),
    };
    mon.maxHp = Math.floor(this.statAt(sp.base.hp, level, true) * mon.boost);
    mon.hp = mon.maxHp;
    return mon;
  },

  makeElderMon(elder) {
    const mon = this.makeAwawa(elder.species, elder.level, { boost: elder.boost });
    // Elders punch slightly above their level (10-level move preview), but the
    // first trials must stay winnable — no endgame nukes at Lv 8.
    mon.moves = this.movesAtLevel(elder.species, elder.level + 10);
    return mon;
  },

  movesAtLevel(speciesName, level) {
    const learned = SPECIES[speciesName].learnset.filter(e => e.lvl <= level).map(e => e.move);
    return learned.slice(-4);
  },

  statAt(base, level, isHp) {
    const core = Math.floor((2 * base * level) / 100) + 5;
    return isHp ? core + level + 10 : core;
  },

  stats(mon) {
    const b = SPECIES[mon.species].base;
    const boost = mon.boost || 1;
    return {
      atk: Math.floor(this.statAt(b.atk, mon.level, false) * boost),
      def: Math.floor(this.statAt(b.def, mon.level, false) * boost),
      spd: Math.floor(this.statAt(b.spd, mon.level, false) * boost),
    };
  },

  displayName(mon) {
    return mon.nickname || mon.species;
  },

  // ---- XP & leveling ----
  xpToNext(level) {
    return 15 + level * 12;
  },

  xpReward(enemy) {
    return Math.max(8, Math.floor(SPECIES[enemy.species].baseXp * enemy.level / 18));
  },

  // Applies XP; returns array of event strings ('level', 'move:NAME', 'evolve:SPECIES').
  grantXp(mon, amount) {
    const events = [];
    if (mon.level >= 50) return events;
    mon.xp += amount;
    while (mon.xp >= this.xpToNext(mon.level) && mon.level < 50) {
      mon.xp -= this.xpToNext(mon.level);
      mon.level += 1;
      const prevMax = mon.maxHp;
      mon.maxHp = this.statAt(SPECIES[mon.species].base.hp, mon.level, true);
      mon.hp = Math.min(mon.maxHp, mon.hp + (mon.maxHp - prevMax));
      events.push('level');

      const sp = SPECIES[mon.species];
      for (const e of sp.learnset) {
        if (e.lvl === mon.level && !mon.moves.includes(e.move)) {
          if (mon.moves.length >= 4) mon.moves.shift();
          mon.moves.push(e.move);
          events.push('move:' + e.move);
        }
      }
      if (sp.evolvesTo && mon.level >= sp.evolveLevel) {
        events.push('evolve:' + sp.evolvesTo);
        this.evolve(mon);
        this.state.stats.evolutions += 1;
      }
    }
    return events;
  },

  evolve(mon) {
    const to = SPECIES[mon.species].evolvesTo;
    if (!to) return;
    const hpFrac = mon.hp / mon.maxHp;
    mon.species = to;
    mon.maxHp = this.statAt(SPECIES[to].base.hp, mon.level, true);
    mon.hp = Math.max(1, Math.round(mon.maxHp * hpFrac));
    // Pick up any moves the new form knows by now.
    for (const e of SPECIES[to].learnset) {
      if (e.lvl <= mon.level && !mon.moves.includes(e.move) && mon.moves.length < 4) {
        mon.moves.push(e.move);
      }
    }
    this.markDex(to, true);
  },

  // ---- catching ----
  catchChance(wild, ballBonus) {
    const sp = SPECIES[wild.species];
    const hpFactor = 1 - 0.72 * (wild.hp / wild.maxHp);
    return Math.min(0.95, sp.catchRate * (0.28 + hpFactor) * ballBonus);
  },

  // ---- dex & party ----
  markDex(speciesName, caught, golden) {
    this.state.dex.seen[speciesName] = true;
    if (caught) this.state.dex.caught[speciesName] = true;
    if (caught && golden) this.state.dex.golden[speciesName] = true;
  },

  // Returns milestones that just completed, applying their rewards.
  checkMilestones() {
    const done = [];
    for (const m of MILESTONES) {
      if (this.state.milestones[m.id]) continue;
      let hit = false;
      try { hit = m.check(this.state); } catch (e) { /* defensive: a bad check must not break saves */ }
      if (!hit) continue;
      this.state.milestones[m.id] = true;
      if (m.reward.coins) this.state.coins += m.reward.coins;
      if (m.reward.items) for (const [name, n] of Object.entries(m.reward.items)) this.addItem(name, n);
      done.push(m);
    }
    if (done.length) this.save();
    return done;
  },

  addToParty(mon) {
    if (this.state.party.length < PARTY_MAX) {
      this.state.party.push(mon);
      return true;
    }
    return false; // party full — released with a snack, dex still counts
  },

  healParty() {
    for (const mon of this.state.party) {
      mon.hp = mon.maxHp;
    }
  },

  firstHealthy() {
    return this.state.party.find(m => m.hp > 0) || null;
  },

  partyWiped() {
    return this.state.party.every(m => m.hp <= 0);
  },

  highestLevel() {
    return Math.max(...this.state.party.map(m => m.level));
  },

  // ---- items ----
  addItem(name, n = 1) {
    this.state.items[name] = (this.state.items[name] || 0) + n;
  },

  useItem(name) {
    if (!this.state.items[name]) return false;
    this.state.items[name] -= 1;
    if (this.state.items[name] <= 0) delete this.state.items[name];
    return true;
  },

  // ---- encounters ----
  rollEncounter(zone) {
    const total = zone.encounters.reduce((s, e) => s + e.w, 0);
    let r = Math.random() * total;
    for (const e of zone.encounters) {
      r -= e.w;
      if (r <= 0) {
        const [lo, hi] = zone.levels;
        const level = lo + Math.floor(Math.random() * (hi - lo + 1));
        return this.makeAwawa(e.species, level, { golden: Math.random() < 1 / 40 });
      }
    }
    return this.makeAwawa(zone.encounters[0].species, zone.levels[0]);
  },

  // ---- persistence ----
  save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
    } catch (e) { /* storage unavailable (private mode) — play on without saving */ }
  },

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const s = JSON.parse(raw);
      if (!s || !Array.isArray(s.party) || !s.party.length) return false;
      // Migrate saves from earlier versions of the game.
      s.dex.golden = s.dex.golden || {};
      s.badges = s.badges || {};
      s.milestones = s.milestones || {};
      s.endingSeen = !!s.endingSeen;
      s.stats.evolutions = s.stats.evolutions || 0;
      this.state = s;
      return true;
    } catch (e) {
      return false;
    }
  },

  wipeSave() {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ }
    this.state = null;
  },
};
