// ===== Awawa Quest — battle engine =====
// Produces a flat list of events per player action; the UI animates them.
'use strict';

const Battle = {
  cur: null,

  start(playerMon, wildMon) {
    this.cur = {
      player: playerMon,
      enemy: wildMon,
      stages: { player: { atk: 0, def: 0 }, enemy: { atk: 0, def: 0 } },
      over: false,
      result: null, // 'win' | 'caught' | 'fled' | 'lose'
    };
    Game.markDex(wildMon.species, false);
    return this.cur;
  },

  stageMult(stage) {
    return stage >= 0 ? (2 + stage) / 2 : 2 / (2 - stage);
  },

  effectiveStats(side) {
    const b = this.cur;
    const mon = b[side];
    const s = Game.stats(mon);
    return {
      atk: s.atk * this.stageMult(b.stages[side].atk),
      def: s.def * this.stageMult(b.stages[side].def),
      spd: s.spd,
    };
  },

  damage(attackerSide, moveName) {
    const b = this.cur;
    const atkMon = b[attackerSide];
    const defSide = attackerSide === 'player' ? 'enemy' : 'player';
    const defMon = b[defSide];
    const move = MOVES[moveName];
    const atk = this.effectiveStats(attackerSide).atk;
    const def = this.effectiveStats(defSide).def;
    const stab = SPECIES[atkMon.species].type === move.type ? 1.5 : 1;
    const eff = typeMult(move.type, SPECIES[defMon.species].type);
    const crit = Math.random() < 0.0625 ? 1.5 : 1;
    const rand = 0.85 + Math.random() * 0.15;
    const raw = (((2 * atkMon.level) / 5 + 2) * move.power * (atk / def)) / 50 + 2;
    return { dmg: Math.max(1, Math.floor(raw * stab * eff * crit * rand)), eff, crit: crit > 1 };
  },

  execMove(side, moveName, events) {
    const b = this.cur;
    const mon = b[side];
    const foeSide = side === 'player' ? 'enemy' : 'player';
    const foe = b[foeSide];
    const move = MOVES[moveName];
    const name = side === 'player' ? Game.displayName(mon) : 'Wild ' + mon.species;
    const foeName = foeSide === 'player' ? Game.displayName(foe) : 'Wild ' + foe.species;

    if (Math.random() * 100 > move.acc) {
      events.push({ t: 'msg', text: `${name} used ${moveName}… but it missed!` });
      return;
    }

    if (move.power > 0) {
      const { dmg, eff, crit } = this.damage(side, moveName);
      foe.hp = Math.max(0, foe.hp - dmg);
      events.push({ t: 'attack', side, target: foeSide, move: moveName, dmg, eff, crit });
      let tail = '';
      if (crit) tail += ' A critical hit!';
      if (eff > 1) tail += " It's super effective!";
      if (eff < 1) tail += " It's not very effective…";
      events.push({ t: 'msg', text: `${name} used ${moveName}! ${dmg} damage.${tail}` });
      const fx = move.effect;
      if (fx && fx.drain) {
        const gain = Math.max(1, Math.floor(dmg * fx.drain));
        mon.hp = Math.min(mon.maxHp, mon.hp + gain);
        events.push({ t: 'msg', text: `${name} sapped ${gain} HP!` });
      }
      if (fx && fx.debuff && Math.random() < (fx.chance || 1)) {
        b.stages[foeSide][fx.debuff] = Math.max(-4, b.stages[foeSide][fx.debuff] - fx.stages);
        events.push({ t: 'msg', text: `${foeName}'s ${fx.debuff === 'atk' ? 'Attack' : 'Defense'} fell!` });
      }
    } else {
      const fx = move.effect || {};
      events.push({ t: 'msg', text: `${name} used ${moveName}!` });
      if (fx.heal) {
        const gain = Math.max(1, Math.floor(mon.maxHp * fx.heal));
        mon.hp = Math.min(mon.maxHp, mon.hp + gain);
        events.push({ t: 'heal', side, amount: gain });
        events.push({ t: 'msg', text: `${name} restored ${Math.min(gain, mon.maxHp)} HP!` });
      }
      if (fx.buff) {
        b.stages[side][fx.buff] = Math.min(4, b.stages[side][fx.buff] + fx.stages);
        events.push({ t: 'msg', text: `${name}'s ${fx.buff === 'atk' ? 'Attack' : 'Defense'} rose!` });
      }
      if (fx.debuff) {
        b.stages[foeSide][fx.debuff] = Math.max(-4, b.stages[foeSide][fx.debuff] - fx.stages);
        events.push({ t: 'msg', text: `${foeName}'s ${fx.debuff === 'atk' ? 'Attack' : 'Defense'} fell!` });
      }
    }

    if (foe.hp <= 0) {
      events.push({ t: 'faint', side: foeSide });
      events.push({ t: 'msg', text: `${foeName} fainted!` });
    }
  },

  enemyPickMove() {
    const enemy = this.cur.enemy;
    const moves = enemy.moves.filter(m => MOVES[m]);
    // Simple AI: prefer damaging moves; heal when hurt.
    const hurt = enemy.hp / enemy.maxHp < 0.35;
    const healing = moves.filter(m => MOVES[m].effect && MOVES[m].effect.heal);
    if (hurt && healing.length && Math.random() < 0.6) return healing[0];
    const damaging = moves.filter(m => MOVES[m].power > 0);
    const pool = damaging.length ? damaging : moves;
    return pool[Math.floor(Math.random() * pool.length)];
  },

  movePriority(moveName) {
    const fx = MOVES[moveName].effect;
    return fx && fx.priority ? fx.priority : 0;
  },

  finishIfOver(events) {
    const b = this.cur;
    if (b.enemy.hp <= 0) {
      b.over = true;
      b.result = 'win';
      const xp = Game.xpReward(b.enemy);
      const coins = 5 + Math.floor(b.enemy.level * 1.8) + Math.floor(Math.random() * 6);
      Game.state.coins += coins;
      Game.state.stats.battles += 1;
      events.push({ t: 'msg', text: `You won! +${coins} coins.` });
      this.applyXp(events, xp);
      return true;
    }
    if (b.player.hp <= 0) {
      const next = Game.firstHealthy();
      if (next) {
        events.push({ t: 'needSwitch' });
      } else {
        b.over = true;
        b.result = 'lose';
        events.push({ t: 'msg', text: 'Your whole party fainted…' });
      }
      return true;
    }
    return false;
  },

  applyXp(events, xp) {
    const mon = this.cur.player;
    if (mon.hp <= 0) return;
    events.push({ t: 'msg', text: `${Game.displayName(mon)} gained ${xp} XP.` });
    const before = mon.species;
    for (const ev of Game.grantXp(mon, xp)) {
      if (ev === 'level') {
        events.push({ t: 'levelup', level: mon.level });
        events.push({ t: 'msg', text: `${Game.displayName(mon)} grew to level ${mon.level}!` });
      } else if (ev.startsWith('move:')) {
        events.push({ t: 'msg', text: `${Game.displayName(mon)} learned ${ev.slice(5)}!` });
      } else if (ev.startsWith('evolve:')) {
        events.push({ t: 'evolve', from: before, to: ev.slice(7) });
        events.push({ t: 'msg', text: `What?! ${before} evolved into ${ev.slice(7)}!` });
      }
    }
  },

  // ---- player actions; each returns an events array ----
  playerMove(moveName) {
    const b = this.cur;
    const events = [];
    const enemyMove = this.enemyPickMove();
    const pSpd = this.effectiveStats('player').spd;
    const eSpd = this.effectiveStats('enemy').spd;
    const pPrio = this.movePriority(moveName);
    const ePrio = this.movePriority(enemyMove);
    const playerFirst = pPrio !== ePrio ? pPrio > ePrio : (pSpd === eSpd ? Math.random() < 0.5 : pSpd > eSpd);

    const order = playerFirst
      ? [['player', moveName], ['enemy', enemyMove]]
      : [['enemy', enemyMove], ['player', moveName]];

    for (const [side, mv] of order) {
      if (b[side].hp <= 0) continue;
      this.execMove(side, mv, events);
      if (this.finishIfOver(events)) break;
    }
    return events;
  },

  useCatchItem(itemName) {
    const b = this.cur;
    const events = [];
    const item = ITEMS[itemName];
    if (!Game.useItem(itemName)) {
      events.push({ t: 'msg', text: `No ${itemName} left!` });
      return events;
    }
    events.push({ t: 'throw', item: itemName });
    events.push({ t: 'msg', text: `You threw a ${itemName}!` });
    const chance = Game.catchChance(b.enemy, item.ballBonus);
    const shakes = Math.random() < chance ? 3 : Math.floor(Math.random() * 3);
    for (let i = 0; i < shakes; i++) events.push({ t: 'shake', n: i + 1 });

    if (shakes === 3) {
      b.over = true;
      b.result = 'caught';
      Game.markDex(b.enemy.species, true);
      Game.state.stats.catches += 1;
      events.push({ t: 'caught', species: b.enemy.species });
      events.push({ t: 'msg', text: `Gotcha! ${b.enemy.species} was caught!` });
      if (Game.addToParty(b.enemy)) {
        events.push({ t: 'msg', text: `${b.enemy.species} joined your party!` });
      } else {
        Game.state.coins += 20;
        events.push({ t: 'msg', text: 'Party full — it waved goodbye and left 20 coins.' });
      }
    } else {
      events.push({ t: 'msg', text: `Aww… ${b.enemy.species} wriggled free!` });
      this.execMove('enemy', this.enemyPickMove(), events);
      this.finishIfOver(events);
    }
    return events;
  },

  useHealItem(itemName, targetMon) {
    const b = this.cur;
    const events = [];
    const item = ITEMS[itemName];
    const mon = targetMon || b.player;
    if (mon.hp <= 0) {
      events.push({ t: 'msg', text: `${Game.displayName(mon)} has fainted — snacks won't help now.` });
      return events;
    }
    if (mon.hp >= mon.maxHp) {
      events.push({ t: 'msg', text: `${Game.displayName(mon)} is already at full HP!` });
      return events;
    }
    if (!Game.useItem(itemName)) {
      events.push({ t: 'msg', text: `No ${itemName} left!` });
      return events;
    }
    const gain = Math.min(item.heal, mon.maxHp - mon.hp);
    mon.hp += gain;
    events.push({ t: 'heal', side: 'player', amount: gain });
    events.push({ t: 'msg', text: `${Game.displayName(mon)} ate the ${itemName}. +${gain} HP!` });
    this.execMove('enemy', this.enemyPickMove(), events);
    this.finishIfOver(events);
    return events;
  },

  switchTo(mon, freeSwitch) {
    const b = this.cur;
    const events = [];
    b.player = mon;
    b.stages.player = { atk: 0, def: 0 };
    events.push({ t: 'switch', species: mon.species });
    events.push({ t: 'msg', text: `Go, ${Game.displayName(mon)}!` });
    if (!freeSwitch) {
      this.execMove('enemy', this.enemyPickMove(), events);
      this.finishIfOver(events);
    }
    return events;
  },

  flee() {
    const b = this.cur;
    const events = [];
    const pSpd = this.effectiveStats('player').spd;
    const eSpd = this.effectiveStats('enemy').spd;
    const odds = Math.min(0.95, 0.5 + (pSpd - eSpd) / 60 + 0.15);
    if (Math.random() < odds) {
      b.over = true;
      b.result = 'fled';
      events.push({ t: 'fled' });
      events.push({ t: 'msg', text: 'You scampered away safely!' });
    } else {
      events.push({ t: 'msg', text: "Couldn't escape!" });
      this.execMove('enemy', this.enemyPickMove(), events);
      this.finishIfOver(events);
    }
    return events;
  },
};
