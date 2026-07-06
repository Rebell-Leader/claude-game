// ===== Awawa Quest — battle engine =====
// Produces a flat list of events per player action; the UI animates them.
'use strict';

const Battle = {
  cur: null,

  start(playerMon, wildMon, opts = {}) {
    this.cur = {
      player: playerMon,
      enemy: wildMon,
      elder: opts.elder || null,     // elder definition when this is a boss trial
      elderZone: opts.elderZone || null,
      trainer: opts.trainer || null, // {def, queue, idx} for trainer battles
      stages: { player: { atk: 0, def: 0 }, enemy: { atk: 0, def: 0 } },
      over: false,
      result: null, // 'win' | 'caught' | 'fled' | 'lose'
    };
    Game.markDex(wildMon.species, false);
    return this.cur;
  },

  enemyLabel() {
    const b = this.cur;
    if (b.elder) return b.elder.name;
    if (b.trainer) return `${b.trainer.def.name}'s ${b.enemy.species}`;
    return (b.enemy.golden ? '✨ Golden ' : 'Wild ') + b.enemy.species;
  },

  isLocked() { // battles you can neither catch in nor flee from
    return !!(this.cur.elder || this.cur.trainer);
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
    const held = Game.heldSpec(atkMon);
    let heldMult = held && held.boost === move.type ? held.mult : 1;
    if (attackerSide === 'player') heldMult *= Game.bondMult(atkMon);
    const critChance = held && held.crit ? held.crit : 0.0625;
    const crit = Math.random() < critChance ? 1.5 : 1;
    const rand = 0.85 + Math.random() * 0.15;
    const raw = (((2 * atkMon.level) / 5 + 2) * move.power * (atk / def)) / 50 + 2;
    return { dmg: Math.max(1, Math.floor(raw * stab * eff * crit * rand * heldMult)), eff, crit: crit > 1 };
  },

  execMove(side, moveName, events) {
    const b = this.cur;
    const mon = b[side];
    const foeSide = side === 'player' ? 'enemy' : 'player';
    const foe = b[foeSide];
    const move = MOVES[moveName];
    const name = side === 'player' ? Game.displayName(mon) : this.enemyLabel();
    const foeName = foeSide === 'player' ? Game.displayName(foe) : this.enemyLabel();

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
      // Trainer with awawas left: award the knockout XP and send out the next one.
      if (b.trainer && b.trainer.idx < b.trainer.queue.length - 1) {
        this.applyXp(events, Game.xpReward(b.enemy));
        b.trainer.idx += 1;
        b.enemy = b.trainer.queue[b.trainer.idx];
        b.stages.enemy = { atk: 0, def: 0 };
        Game.markDex(b.enemy.species, false);
        events.push({ t: 'trainerNext', species: b.enemy.species });
        events.push({ t: 'msg', text: `${b.trainer.def.name} sends out ${b.enemy.species}!` });
        return true;
      }
      b.over = true;
      b.result = 'win';
      Game.state.stats.battles += 1;
      Game.addBond(b.player, b.elder || b.trainer ? 4 : 2);
      let xp = Game.xpReward(b.enemy);
      if (b.trainer) {
        Game.state.stats.trainerWins += 1;
        if (b.trainer.rival) Game.state.rival.fights += 1;
        const coins = b.trainer.def.coins;
        Game.state.coins += coins;
        events.push({ t: 'msg', text: `"${b.trainer.def.winQuip}" — ${b.trainer.def.name}` });
        events.push({ t: 'msg', text: `You beat ${b.trainer.def.name}! +${coins} coins.` });
        this.applyXp(events, xp);
        return true;
      }
      if (b.elder) {
        xp = Math.floor(xp * 1.5);
        const firstWin = !Game.state.badges[b.elderZone];
        if (firstWin) {
          Game.state.badges[b.elderZone] = true;
          Game.state.coins += b.elder.reward.coins;
          for (const [name, n] of Object.entries(b.elder.reward.items || {})) Game.addItem(name, n);
          const itemList = Object.entries(b.elder.reward.items || {}).map(([n, c]) => `${c}× ${n}`).join(', ');
          events.push({ t: 'badge', zone: b.elderZone });
          events.push({ t: 'msg', text: b.elder.win });
          events.push({ t: 'msg', text: `You earned the ${b.elder.icon} ${b.elder.badge}, ${b.elder.reward.coins} coins${itemList ? ' and ' + itemList : ''}!` });
        } else {
          const coins = Math.floor(b.elder.reward.coins / 4);
          Game.state.coins += coins;
          events.push({ t: 'msg', text: `${b.elder.name} concedes the rematch. +${coins} coins.` });
        }
      } else {
        let coins = 5 + Math.floor(b.enemy.level * 1.8) + Math.floor(Math.random() * 6);
        if (b.enemy.golden) coins *= 3;
        Game.state.coins += coins;
        events.push({ t: 'msg', text: `You won! +${coins} coins.${b.enemy.golden ? ' The golden awawa left extra shiny ones.' : ''}` });
      }
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

    // End-of-round regen (Soft Moss and friends).
    const held = Game.heldSpec(b.player);
    if (!b.over && held && held.regen && b.player.hp > 0 && b.player.hp < b.player.maxHp) {
      const gain = Math.max(1, Math.floor(b.player.maxHp * held.regen));
      b.player.hp = Math.min(b.player.maxHp, b.player.hp + gain);
      events.push({ t: 'heal', side: 'player', amount: gain });
      events.push({ t: 'msg', text: `${Game.displayName(b.player)}'s ${b.player.held} restored ${gain} HP.` });
    }
    return events;
  },

  useCatchItem(itemName) {
    const b = this.cur;
    const events = [];
    const item = ITEMS[itemName];
    if (b.elder) {
      events.push({ t: 'msg', text: `${b.elder.name} raises an eyebrow. You cannot catch an Elder.` });
      return events;
    }
    if (b.trainer) {
      events.push({ t: 'msg', text: `${b.trainer.def.name} blocks the throw. "Hey! Get your own awawa!"` });
      return events;
    }
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
      Game.markDex(b.enemy.species, true, b.enemy.golden);
      Game.state.stats.catches += 1;
      events.push({ t: 'caught', species: b.enemy.species });
      events.push({ t: 'msg', text: `Gotcha! ${b.enemy.golden ? '✨ Golden ' : ''}${b.enemy.species} was caught!` });
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
    Game.addBond(mon, 5); // sharing snacks builds trust
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
    if (b.elder) {
      events.push({ t: 'msg', text: 'There is no running from an Elder Trial!' });
      return events;
    }
    if (b.trainer) {
      events.push({ t: 'msg', text: 'Trainers battle to the end. No running!' });
      return events;
    }
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
