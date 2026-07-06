// ===== Awawa Quest — core state, math, save/load =====
'use strict';

const SAVE_KEY = 'awawa-quest-save-v1';
const SAVE_BACKUP_KEY = 'awawa-quest-save-backup';
const SAVE_VERSION = 3;
const PARTY_MAX = 6;

// Deterministic PRNG for daily runs — same seed, same run, for everyone.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const Game = {
  state: null,

  newGame(starterSpecies) {
    this.state = {
      coins: 60,
      items: { 'Pebble': 5, 'Snack': 2 },
      party: [this.makeAwawa(starterSpecies, 5)],
      starter: starterSpecies,
      dex: { seen: {}, caught: {}, golden: {} },
      zone: 'cliffs',
      badges: {},
      milestones: {},
      endingSeen: false,
      time: { phase: 1, steps: 0 }, // start at Day
      rival: { fights: 0 },
      tower: { best: 0 },
      daily: { date: null, bestToday: 0, streak: 0, lastClearDate: null },
      stats: { battles: 0, catches: 0, steps: 0, evolutions: 0, trainerWins: 0 },
      v: SAVE_VERSION,
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
      held: null,
      bond: 0,
      moves: this.movesAtLevel(speciesName, level),
    };
    mon.maxHp = Math.floor(this.statAt(sp.base.hp, level, true) * mon.boost);
    mon.hp = mon.maxHp;
    return mon;
  },

  heldSpec(mon) {
    return (mon && mon.held && ITEMS[mon.held] && ITEMS[mon.held].held) || null;
  },

  // ---- bond (friendship) ----
  addBond(mon, amount) {
    if (!mon) return;
    mon.bond = Math.min(100, (mon.bond || 0) + amount);
  },

  bondMult(mon) {
    const b = mon.bond || 0;
    return b >= 100 ? 1.1 : b >= 50 ? 1.05 : 1;
  },

  bondHearts(mon) {
    const b = mon.bond || 0;
    const full = Math.floor(b / 20);
    return '♥'.repeat(full) + '♡'.repeat(5 - full);
  },

  // ---- daily scream run ----
  // Species + shiny flags are seeded by the date (same for every player);
  // levels scale to the player's strongest awawa so it's always fair.
  dailyRun() {
    const key = todayKey();
    const rng = mulberry32(hashString('awawa-' + key));
    const names = Object.keys(SPECIES).filter(n => !SPECIES[n].legendary);
    const maxLv = this.highestLevel();
    const stages = [];
    for (let i = 0; i < 5; i++) {
      stages.push({
        species: names[Math.floor(rng() * names.length)],
        golden: rng() < 0.1,
        level: Math.max(3, Math.min(48, maxLv - 6 + i * 3)),
      });
    }
    return { date: key, stages };
  },

  dailyState() {
    const d = this.state.daily;
    const key = todayKey();
    if (d.date !== key) {
      d.date = key;
      d.bestToday = 0;
    }
    return d;
  },

  // Records a cleared daily stage (1-5). Returns {coins, clearedAll, streak}.
  dailyStageCleared(stage) {
    const d = this.dailyState();
    let coins = 0;
    if (stage > d.bestToday) {
      coins = 30 + stage * 10;
      this.state.coins += coins;
      d.bestToday = stage;
    }
    let clearedAll = false;
    if (stage >= 5 && d.lastClearDate !== d.date) {
      clearedAll = true;
      this.state.coins += 250;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
      d.streak = d.lastClearDate === yKey ? d.streak + 1 : 1;
      d.lastClearDate = d.date;
    }
    this.save();
    return { coins, clearedAll, streak: d.streak };
  },

  // ---- time of day ----
  phase() {
    return PHASES[this.state.time.phase];
  },

  // Advances the day-cycle counter; returns true when the phase flips.
  advanceTime(phases = 0) {
    const t = this.state.time;
    if (phases > 0) {
      t.steps = 0;
      t.phase = (t.phase + phases) % PHASES.length;
      return true;
    }
    t.steps += 1;
    if (t.steps >= 10) {
      t.steps = 0;
      t.phase = (t.phase + 1) % PHASES.length;
      return true;
    }
    return false;
  },

  // Your rival's team scales with how many times you've beaten them.
  makeRival() {
    const s = this.state;
    const f = RIVAL.fights[Math.min(s.rival.fights, RIVAL.fights.length - 1)];
    const counterRoot = RIVAL.counter[s.starter] || 'Sproutawa';
    const starterSpecies = RIVAL.lines[counterRoot][f.starterStage];
    const team = [...f.fillers, starterSpecies];
    const queue = team.map((sp, i) => this.makeAwawa(sp, Math.max(2, f.level - (team.length - 1 - i))));
    return {
      def: { name: RIVAL.name, avatar: RIVAL.avatar, coins: f.coins, intro: f.intro, winQuip: f.winQuip },
      queue, idx: 0, rival: true,
    };
  },

  // Scream Tower floors: escalating wilds, a heavy-hitter every 5th floor,
  // and better shiny odds. Everything is catchable — that's the draw.
  towerEnemy(floor) {
    const golden = Math.random() < 1 / 30;
    if (floor % 5 === 0) {
      const pool = ['Cliffawa', 'Blazerax', 'Canopawa', 'Echorax', 'Snoozerax', 'Grumpawa'];
      if (floor >= 20) pool.push('The Great Awawa');
      const species = pool[Math.floor(Math.random() * pool.length)];
      return this.makeAwawa(species, Math.min(50, 25 + floor * 2), { golden });
    }
    const names = Object.keys(SPECIES).filter(n => !SPECIES[n].legendary);
    const species = names[Math.floor(Math.random() * names.length)];
    return this.makeAwawa(species, Math.min(50, 22 + floor * 2), { golden });
  },

  // Builds a random trainer encounter for a zone: {def, queue}.
  makeTrainer(zone) {
    const defs = TRAINERS[zone.id];
    if (!defs || !defs.length) return null;
    const def = defs[Math.floor(Math.random() * defs.length)];
    const mid = Math.round((zone.levels[0] + zone.levels[1]) / 2);
    const queue = def.team.map(sp => this.makeAwawa(sp, Math.max(2, mid + Math.floor(Math.random() * 3) - 1)));
    return { def, queue, idx: 0 };
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

  // ---- encounters (time-of-day aware) ----
  rollEncounter(zone) {
    const phase = this.phase();
    const weighted = zone.encounters.map(e => ({
      species: e.species,
      w: e.w * (phase.mods[SPECIES[e.species].type] || 1),
    }));
    const total = weighted.reduce((s, e) => s + e.w, 0);
    let r = Math.random() * total;
    for (const e of weighted) {
      r -= e.w;
      if (r <= 0) {
        const [lo, hi] = zone.levels;
        const level = lo + Math.floor(Math.random() * (hi - lo + 1));
        return this.makeAwawa(e.species, level, { golden: Math.random() < 1 / phase.goldenDiv });
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

  // Validates + migrates a parsed save object; returns it or null.
  migrate(s) {
    if (!s || !Array.isArray(s.party) || !s.party.length || !s.dex) return null;
    s.dex.golden = s.dex.golden || {};
    s.badges = s.badges || {};
    s.milestones = s.milestones || {};
    s.endingSeen = !!s.endingSeen;
    s.stats = s.stats || {};
    for (const k of ['battles', 'catches', 'steps', 'evolutions', 'trainerWins']) s.stats[k] = s.stats[k] || 0;
    s.time = s.time || { phase: 1, steps: 0 };
    s.rival = s.rival || { fights: 0 };
    s.tower = s.tower || { best: 0 };
    s.daily = s.daily || { date: null, bestToday: 0, streak: 0, lastClearDate: null };
    if (!s.starter) {
      s.starter = STARTERS.find(st => RIVAL.lines[st].some(sp => s.dex.caught[sp])) || 'Pebbawa';
    }
    for (const m of s.party) {
      m.bond = m.bond || 0;
      m.boost = m.boost || 1;
      if (m.held && !ITEMS[m.held]) m.held = null;
      m.moves = (m.moves || []).filter(mv => MOVES[mv]);
      if (!m.moves.length) m.moves = this.movesAtLevel(m.species, m.level);
    }
    s.v = SAVE_VERSION;
    return s;
  },

  load() {
    const tryKey = key => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        return this.migrate(JSON.parse(raw));
      } catch (e) {
        return null;
      }
    };
    let s = tryKey(SAVE_KEY);
    if (!s) s = tryKey(SAVE_BACKUP_KEY); // main save corrupt/missing — fall back
    if (!s) return false;
    this.state = s;
    this.save();
    // Snapshot a known-good copy for corruption recovery.
    try { localStorage.setItem(SAVE_BACKUP_KEY, JSON.stringify(s)); } catch (e) { /* ignore */ }
    return true;
  },

  // ---- export / import (shareable save codes) ----
  exportCode() {
    if (!this.state) return null;
    try {
      return 'AWAWA1.' + btoa(unescape(encodeURIComponent(JSON.stringify(this.state))));
    } catch (e) {
      return null;
    }
  },

  importCode(code) {
    try {
      const trimmed = String(code || '').trim();
      if (!trimmed.startsWith('AWAWA1.')) return false;
      const json = decodeURIComponent(escape(atob(trimmed.slice(7))));
      const s = this.migrate(JSON.parse(json));
      if (!s) return false;
      this.state = s;
      this.save();
      try { localStorage.setItem(SAVE_BACKUP_KEY, JSON.stringify(s)); } catch (e) { /* ignore */ }
      return true;
    } catch (e) {
      return false;
    }
  },

  wipeSave() {
    try {
      localStorage.removeItem(SAVE_KEY);
      localStorage.removeItem(SAVE_BACKUP_KEY);
    } catch (e) { /* ignore */ }
    this.state = null;
  },
};

// Backstop saves: leaving the tab or closing the app must never lose progress.
window.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && Game.state) Game.save();
});
window.addEventListener('beforeunload', () => {
  if (Game.state) Game.save();
});
