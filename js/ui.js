// ===== Awawa Quest — UI: screens, rendering, battle presentation =====
'use strict';

const UI = {
  app: document.getElementById('app'),
  busy: false, // true while battle events are animating

  // ---------- helpers ----------
  esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  },

  delay(ms) {
    return new Promise(r => setTimeout(r, ms));
  },

  setZoneTheme(zone) {
    const r = document.documentElement.style;
    r.setProperty('--zone-a', zone.palette[0]);
    r.setProperty('--zone-b', zone.palette[1]);
    r.setProperty('--zone-ground', zone.ground);
  },

  currentZone() {
    return ZONES.find(z => z.id === Game.state.zone) || ZONES[0];
  },

  chip(type) {
    return `<span class="chip" style="background:${TYPES[type].color}">${TYPES[type].icon} ${type}</span>`;
  },

  toast(text) {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2800);
  },

  topbar() {
    const s = Game.state;
    return `<div class="topbar">
      <span class="logo">🐹 Awawa Quest</span>
      <span class="coins">🪙 ${s ? s.coins : 0}</span>
      <span class="mini-btns">
        <button data-action="toggle-mute">${Sound.muted ? '🔇' : '🔊'}</button>
        <button data-action="go-title" title="Title screen">🏠</button>
      </span>
    </div>`;
  },

  hpBarHtml(mon, withXp) {
    const pct = Math.round((mon.hp / mon.maxHp) * 100);
    const cls = pct <= 25 ? 'low' : pct <= 55 ? 'mid' : '';
    let html = `<div class="hpbar"><div class="fill ${cls}" style="width:${pct}%"></div></div>
      <div style="font-size:0.72rem;text-align:right;font-weight:700">${mon.hp}/${mon.maxHp}</div>`;
    if (withXp) {
      const xpPct = Math.min(100, Math.round((mon.xp / Game.xpToNext(mon.level)) * 100));
      html += `<div class="xpbar" title="XP"><div class="fill" style="width:${xpPct}%"></div></div>`;
    }
    return html;
  },

  // ---------- screens ----------
  render(html) {
    this.app.innerHTML = html;
    this.app.classList.remove('screen-fade');
    void this.app.offsetWidth; // restart the fade-in animation
    this.app.classList.add('screen-fade');
  },

  showTitle() {
    const hasSave = (() => { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } })();
    document.documentElement.style.setProperty('--zone-a', '#ffd89b');
    document.documentElement.style.setProperty('--zone-b', '#f2994a');
    this.render(`
      <div class="title-screen">
        <div class="hero">${awawaSVG('The Great Awawa', { size: 210 })}</div>
        <h1 class="logo-big">AWAWA QUEST</h1>
        <p class="tagline">Catch. Train. Scream. Collect all 18 awawas!</p>
        <div class="menu">
          ${hasSave ? `<button class="primary big" data-action="continue-game">▶ Continue</button>` : ''}
          <button class="${hasSave ? 'ghost' : 'primary'} big" data-action="new-game">✨ New Game</button>
          ${hasSave ? `<button class="ghost" data-action="wipe-save">🗑 Delete Save</button>` : ''}
        </div>
      </div>`);
  },

  showStarterPick() {
    this.render(`
      ${this.topbar()}
      <div class="panel" style="text-align:center">
        <h2>Choose your first awawa!</h2>
        <p class="muted">An elder hyrax squints at you approvingly. "Pick one. They all scream."</p>
      </div>
      <div class="starter-grid">
        ${STARTERS.map(name => `
          <div class="starter-card" data-action="pick-starter" data-arg="${name}">
            ${awawaSVG(name, { size: 110 })}
            <div class="nm">${name}</div>
            ${this.chip(SPECIES[name].type)}
            <p class="muted" style="margin-top:6px">${SPECIES[name].desc}</p>
          </div>`).join('')}
      </div>`);
  },

  showHub(flash) {
    const s = Game.state;
    const zone = this.currentZone();
    this.setZoneTheme(zone);
    this.render(`
      ${this.topbar()}
      <div class="panel zone-banner">
        <div class="zone-name">${zone.icon} ${zone.name}</div>
        <p class="muted">${zone.blurb}</p>
        ${flash ? `<p class="event-flash" style="font-weight:800;margin-top:6px">${flash}</p>` : ''}
        <div class="explore-wrap">
          <button class="primary big" data-action="explore">👣 Explore</button>
        </div>
        <p class="muted">Wild awawas: Lv ${zone.levels[0]}–${zone.levels[1]}</p>
      </div>
      <div class="panel">
        <div class="hub-nav">
          <button data-action="show-zones"><span class="ico">🗺️</span>Travel</button>
          <button data-action="show-party"><span class="ico">🎒</span>Party</button>
          <button data-action="show-dex"><span class="ico">📔</span>Awadex</button>
          <button data-action="show-shop"><span class="ico">🛒</span>Shop</button>
          <button data-action="rest"><span class="ico">🛏️</span>Rest</button>
        </div>
        <div class="party-strip">
          ${s.party.map(m => `
            <div class="party-slot ${m.hp <= 0 ? 'fainted' : ''}">
              ${awawaSVG(m.species, { size: 56 })}
              <div>${this.esc(Game.displayName(m)).slice(0, 10)}</div>
              <div class="lv">Lv ${m.level} · ${m.hp}/${m.maxHp}</div>
            </div>`).join('')}
        </div>
      </div>`);
  },

  showZones() {
    const maxLv = Game.highestLevel();
    this.render(`
      ${this.topbar()}
      <div class="back-row"><button data-action="go-hub">← Back</button></div>
      <div class="panel"><h2>🗺️ Travel</h2><p class="muted">Higher zones need a stronger party.</p></div>
      ${ZONES.map(z => {
        const locked = maxLv < z.minLevel;
        return `<div class="zone-card ${locked ? 'locked' : ''}" ${locked ? '' : `data-action="travel" data-arg="${z.id}"`}
            style="background:linear-gradient(120deg, ${z.palette[0]}, ${z.palette[1]})">
          <div class="zc-name">${z.icon} ${z.name}</div>
          <div class="zc-sub">${z.blurb}</div>
          <div class="zc-badge">${locked ? `🔒 needs Lv ${z.minLevel}` : `Lv ${z.levels[0]}–${z.levels[1]}`}</div>
        </div>`;
      }).join('')}`);
  },

  showParty(selectedIdx) {
    const s = Game.state;
    this.render(`
      ${this.topbar()}
      <div class="back-row"><button data-action="go-hub">← Back</button></div>
      <div class="panel">
        <h2>🎒 Your Party</h2>
        <p class="muted">The leader (first slot) battles first. Snacks in bag: ${s.items['Snack'] || 0} 🥕 / ${s.items['Big Snack'] || 0} 🍉</p>
      </div>
      ${s.party.map((m, i) => {
        const sp = SPECIES[m.species];
        const st = Game.stats(m);
        const sel = selectedIdx === i;
        return `<div class="list-row ${sel ? 'selected' : ''}">
          <div>${awawaSVG(m.species, { size: 64 })}</div>
          <div class="grow">
            <div class="nm">${this.esc(Game.displayName(m))} <span class="muted">Lv ${m.level}</span> ${this.chip(sp.type)}</div>
            ${this.hpBarHtml(m, true)}
            ${sel ? `<div class="sub" style="margin-top:4px">ATK ${st.atk} · DEF ${st.def} · SPD ${st.spd}<br>Moves: ${m.moves.join(', ')}</div>` : ''}
          </div>
          <div style="display:flex;flex-direction:column;gap:4px">
            <button data-action="party-detail" data-arg="${i}">${sel ? 'Hide' : 'Info'}</button>
            ${i > 0 ? `<button data-action="party-lead" data-arg="${i}">Lead</button>` : ''}
            <button data-action="party-snack" data-arg="${i}" ${m.hp >= m.maxHp || m.hp <= 0 || !s.items['Snack'] ? 'disabled' : ''}>🥕</button>
            ${s.party.length > 1 ? `<button class="danger" data-action="party-release" data-arg="${i}">Free</button>` : ''}
          </div>
        </div>`;
      }).join('')}`);
  },

  showDex(detailName) {
    const s = Game.state;
    const names = Object.keys(SPECIES).sort((a, b) => SPECIES[a].dex - SPECIES[b].dex);
    const caughtCount = Object.keys(s.dex.caught).length;
    let detail = '';
    if (detailName && s.dex.seen[detailName]) {
      const sp = SPECIES[detailName];
      const caught = s.dex.caught[detailName];
      detail = `<div class="panel dex-detail">
        ${awawaSVG(detailName, { size: 130 })}
        <h2>#${String(sp.dex).padStart(2, '0')} ${detailName}</h2>
        ${this.chip(sp.type)} ${sp.legendary ? '<span class="chip" style="background:#c9a227">⭐ Legendary</span>' : ''}
        <p class="desc">${caught ? sp.desc : 'Catch one to learn more…'}</p>
        ${caught ? `<p class="muted">Base — HP ${sp.base.hp} · ATK ${sp.base.atk} · DEF ${sp.base.def} · SPD ${sp.base.spd}</p>` : ''}
      </div>`;
    }
    this.render(`
      ${this.topbar()}
      <div class="back-row"><button data-action="go-hub">← Back</button></div>
      <div class="panel"><h2>📔 Awadex</h2><p class="muted">Caught ${caughtCount} / ${names.length} · Battles won: ${s.stats.battles} · Steps: ${s.stats.steps}</p></div>
      ${detail}
      <div class="dex-grid">
        ${names.map(n => {
          const seen = s.dex.seen[n], caught = s.dex.caught[n];
          const cls = !seen ? 'unseen' : (caught ? '' : 'seen-only');
          return `<div class="dex-card ${cls}" ${seen ? `data-action="dex-detail" data-arg="${n}"` : ''}>
            ${awawaSVG(n, { size: 74 })}
            <div class="num">#${String(SPECIES[n].dex).padStart(2, '0')}</div>
            <div>${seen ? n : '???'}</div>
          </div>`;
        }).join('')}
      </div>`);
  },

  showShop() {
    const s = Game.state;
    this.render(`
      ${this.topbar()}
      <div class="back-row"><button data-action="go-hub">← Back</button></div>
      <div class="panel"><h2>🛒 Rock Bottom Prices</h2><p class="muted">A shrewd-looking awawa runs this stall. All sales final.</p></div>
      ${Object.entries(ITEMS).map(([name, it]) => `
        <div class="list-row">
          <div style="font-size:1.8rem">${it.icon}</div>
          <div class="grow">
            <div class="nm">${name} <span class="muted">×${s.items[name] || 0} owned</span></div>
            <div class="sub">${it.desc}</div>
          </div>
          <button class="primary" data-action="buy" data-arg="${name}" ${s.coins < it.price ? 'disabled' : ''}>🪙 ${it.price}</button>
        </div>`).join('')}`);
  },

  // ---------- battle ----------
  showBattle() {
    const b = Battle.cur;
    const zone = this.currentZone();
    this.setZoneTheme(zone);
    this.render(`
      ${this.topbar()}
      <div class="battle-stage">
        <div class="combatant enemy"><div class="sprite" id="enemy-sprite">${awawaSVG(b.enemy.species, { facing: 'left', size: 130 })}</div></div>
        <div class="combatant player"><div class="sprite" id="player-sprite">${awawaSVG(b.player.species, { size: 150 })}</div></div>
        <div class="statbox statbox-pos-enemy" id="enemy-box"></div>
        <div class="statbox statbox-pos-player" id="player-box"></div>
      </div>
      <div class="battle-log" id="battle-log"><p>A wild <b>${b.enemy.species}</b> (Lv ${b.enemy.level}) appeared!</p></div>
      <div id="battle-actions"></div>`);
    this.updateStatboxes();
    this.renderBattleActions('main');
    Sound.cry(b.enemy.species);
  },

  updateStatboxes() {
    const b = Battle.cur;
    if (!b) return;
    const eBox = document.getElementById('enemy-box');
    const pBox = document.getElementById('player-box');
    if (eBox) eBox.innerHTML = `<div class="row1"><span>${b.enemy.species}</span><span>Lv ${b.enemy.level}</span></div>${this.hpBarHtml(b.enemy)}`;
    if (pBox) pBox.innerHTML = `<div class="row1"><span>${this.esc(Game.displayName(b.player))}</span><span>Lv ${b.player.level}</span></div>${this.hpBarHtml(b.player, true)}`;
  },

  renderBattleActions(mode) {
    const b = Battle.cur;
    const box = document.getElementById('battle-actions');
    if (!box || !b) return;

    if (b.over) {
      box.innerHTML = `<div style="text-align:center"><button class="primary big" data-action="battle-end">Continue ➜</button></div>`;
      return;
    }
    if (mode === 'main') {
      box.innerHTML = `
        <div class="action-grid">
          ${b.player.moves.map(mv => {
            const m = MOVES[mv];
            return `<button class="move-btn" data-action="battle-move" data-arg="${mv}" title="${m.flavor}">
              ${TYPES[m.type].icon} ${mv}
              <span class="mv-meta">${m.power > 0 ? 'PWR ' + m.power : 'status'} · ACC ${m.acc}</span>
            </button>`;
          }).join('')}
        </div>
        <div class="action-row">
          <button data-action="battle-menu" data-arg="catch">🪨 Catch</button>
          <button data-action="battle-menu" data-arg="snack">🥕 Snack</button>
          <button data-action="battle-menu" data-arg="switch">🔄 Switch</button>
          <button data-action="battle-flee">🏃 Run</button>
        </div>`;
    } else if (mode === 'catch') {
      const opts = Object.entries(ITEMS).filter(([n, it]) => it.ballBonus && Game.state.items[n]);
      box.innerHTML = `
        <div class="action-grid">
          ${opts.length ? opts.map(([n, it]) => {
            const pct = Math.round(Game.catchChance(b.enemy, it.ballBonus) * 100);
            return `<button data-action="battle-catch" data-arg="${n}">${it.icon} ${n} ×${Game.state.items[n]}<span class="mv-meta">~${pct}% chance</span></button>`;
          }).join('') : '<p class="muted" style="grid-column:1/-1;text-align:center">No catching items! Visit the shop.</p>'}
        </div>
        <div class="action-row"><button data-action="battle-menu" data-arg="main">← Back</button></div>`;
    } else if (mode === 'snack') {
      const opts = Object.entries(ITEMS).filter(([n, it]) => it.heal && Game.state.items[n]);
      box.innerHTML = `
        <div class="action-grid">
          ${opts.length ? opts.map(([n, it]) =>
            `<button data-action="battle-snack" data-arg="${n}">${it.icon} ${n} ×${Game.state.items[n]}<span class="mv-meta">${it.desc}</span></button>`
          ).join('') : '<p class="muted" style="grid-column:1/-1;text-align:center">No snacks! Visit the shop.</p>'}
        </div>
        <div class="action-row"><button data-action="battle-menu" data-arg="main">← Back</button></div>`;
    } else if (mode === 'switch' || mode === 'forced-switch') {
      const forced = mode === 'forced-switch';
      const options = Game.state.party
        .map((m, i) => ({ m, i }))
        .filter(({ m }) => m.hp > 0 && m !== b.player);
      box.innerHTML = `
        ${forced ? '<p style="font-weight:800;text-align:center;margin-bottom:6px">Choose your next awawa!</p>' : ''}
        <div class="action-grid">
          ${options.length ? options.map(({ m, i }) =>
            `<button data-action="battle-switch" data-arg="${i}" data-free="${forced ? 1 : 0}">
              ${SPECIES[m.species].sprite ? TYPES[SPECIES[m.species].type].icon : ''} ${this.esc(Game.displayName(m))}
              <span class="mv-meta">Lv ${m.level} · ${m.hp}/${m.maxHp} HP</span></button>`
          ).join('') : '<p class="muted" style="grid-column:1/-1;text-align:center">Nobody else can fight!</p>'}
        </div>
        ${forced ? '' : '<div class="action-row"><button data-action="battle-menu" data-arg="main">← Back</button></div>'}`;
    }
  },

  log(text) {
    const el = document.getElementById('battle-log');
    if (!el) return;
    const p = document.createElement('p');
    p.innerHTML = text;
    el.appendChild(p);
    el.scrollTop = el.scrollHeight;
  },

  spriteEl(side) {
    return document.getElementById(side === 'player' ? 'player-sprite' : 'enemy-sprite');
  },

  animate(el, cls, ms) {
    if (!el) return Promise.resolve();
    el.classList.add(cls);
    return this.delay(ms).then(() => el.classList.remove(cls));
  },

  async playEvents(events) {
    this.busy = true;
    const box = document.getElementById('battle-actions');
    if (box) box.innerHTML = '<p class="muted" style="text-align:center;padding:10px">…</p>';
    let needSwitch = false;

    for (const ev of events) {
      switch (ev.t) {
        case 'msg':
          this.log(ev.text);
          await this.delay(650);
          break;
        case 'attack': {
          Sound.fx(ev.eff > 1 ? 'superhit' : 'hit');
          await this.animate(this.spriteEl(ev.target), 'hit', 420);
          this.updateStatboxes();
          break;
        }
        case 'heal':
          Sound.fx('heal');
          this.updateStatboxes();
          await this.delay(350);
          break;
        case 'faint':
          Sound.fx('faint');
          await this.animate(this.spriteEl(ev.side), 'faint-anim', 700);
          this.updateStatboxes();
          break;
        case 'levelup':
          Sound.fx('levelup');
          this.updateStatboxes();
          await this.delay(400);
          break;
        case 'evolve': {
          Sound.fx('evolve');
          const el = this.spriteEl('player');
          await this.animate(el, 'evolve-anim', 1400);
          if (el) el.innerHTML = awawaSVG(ev.to, { size: 150 });
          el && el.classList.remove('faint-anim');
          Sound.cry(ev.to);
          this.updateStatboxes();
          await this.delay(400);
          break;
        }
        case 'switch': {
          const el = this.spriteEl('player');
          if (el) {
            el.classList.remove('faint-anim');
            el.innerHTML = awawaSVG(ev.species, { size: 150 });
            el.classList.add('appear-anim');
            setTimeout(() => el.classList.remove('appear-anim'), 500);
          }
          Sound.cry(ev.species);
          this.updateStatboxes();
          await this.delay(300);
          break;
        }
        case 'throw': {
          Sound.fx('throw');
          const stage = document.querySelector('.battle-stage');
          if (stage) {
            const p = document.createElement('div');
            p.className = 'pebble-fly';
            p.textContent = ITEMS[ev.item].icon;
            stage.appendChild(p);
            await this.delay(750);
            p.remove();
          }
          break;
        }
        case 'shake':
          Sound.fx('shake');
          await this.animate(this.spriteEl('enemy'), 'wobble', 520);
          await this.delay(280);
          break;
        case 'caught':
          Sound.fx('catch');
          await this.animate(this.spriteEl('enemy'), 'catch-anim', 650);
          break;
        case 'fled':
          Sound.fx('flee');
          break;
        case 'needSwitch':
          needSwitch = true;
          break;
      }
    }

    this.busy = false;
    Game.save();
    this.renderBattleActions(needSwitch ? 'forced-switch' : 'main');
  },

  endBattle() {
    const result = Battle.cur ? Battle.cur.result : null;
    Battle.cur = null;
    if (result === 'lose') {
      const lost = Math.floor(Game.state.coins / 2);
      Game.state.coins -= lost;
      Game.healParty();
      Game.save();
      this.showHub(`😵 You blacked out and woke at the resting rock. Lost 🪙 ${lost}. Party healed.`);
    } else {
      Game.save();
      this.showHub();
    }
  },

  // ---------- exploration ----------
  explore() {
    const s = Game.state;
    const zone = this.currentZone();
    s.stats.steps += 1;
    const roll = Math.random();

    if (roll < 0.62) {
      const lead = Game.firstHealthy();
      if (!lead) {
        this.toast('Your whole party has fainted! Rest first.');
        return;
      }
      // Leader battles; if the actual leader fainted, first healthy steps up.
      Battle.start(lead, Game.rollEncounter(zone));
      Game.save();
      this.showBattle();
    } else if (roll < 0.74) {
      const coins = 4 + Math.floor(Math.random() * (10 + zone.levels[1]));
      s.coins += coins;
      Sound.fx('coin');
      Game.save();
      this.showHub(`✨ You found 🪙 ${coins} between the rocks!`);
    } else if (roll < 0.84) {
      const pool = ['Pebble', 'Pebble', 'Snack', 'Smooth Stone'];
      const item = pool[Math.floor(Math.random() * pool.length)];
      Game.addItem(item);
      Sound.fx('coin');
      Game.save();
      this.showHub(`🎁 You found a ${ITEMS[item].icon} ${item}!`);
    } else {
      const flavor = [
        'A distant "awawawa" echoes off the cliffs.',
        'You watch a hyrax yawn for a full minute. Inspiring.',
        'The sun is warm. The rocks are warm. All is well.',
        'Something rustles… but it was just the wind.',
        'You find a rock shaped exactly like an awawa. You leave it be.',
        'A pile of awawas naps in the sun. You tiptoe past.',
      ];
      Game.save();
      this.showHub(`👀 ${flavor[Math.floor(Math.random() * flavor.length)]}`);
    }
  },

  // ---------- actions ----------
  handleAction(action, arg, el) {
    if (this.busy) return;
    const s = Game.state;
    switch (action) {
      case 'toggle-mute': {
        Sound.toggleMute();
        el.textContent = Sound.muted ? '🔇' : '🔊';
        break;
      }
      case 'go-title': this.showTitle(); break;
      case 'new-game': this.showStarterPick_orConfirm(); break;
      case 'continue-game':
        if (Game.load()) this.showHub();
        else this.toast('No save found — starting fresh!') || this.showStarterPick();
        break;
      case 'wipe-save':
        if (confirm('Delete your save? All your awawas will scamper off.')) {
          Game.wipeSave();
          this.showTitle();
        }
        break;
      case 'pick-starter': {
        Game.newGame(arg);
        Sound.cry(arg);
        this.showHub(`🎉 ${arg} joined you! Your journey begins.`);
        break;
      }
      case 'go-hub': this.showHub(); break;
      case 'explore': Sound.fx('click'); this.explore(); break;
      case 'rest':
        Game.healParty();
        Sound.fx('heal');
        Game.save();
        this.showHub('🛏️ Your party napped on a warm rock. Fully healed!');
        break;
      case 'show-zones': this.showZones(); break;
      case 'travel': {
        s.zone = arg;
        Game.save();
        const z = this.currentZone();
        this.showHub(`${z.icon} You arrived at ${z.name}.`);
        break;
      }
      case 'show-party': this.showParty(); break;
      case 'party-detail': this.showParty(this._partySel === +arg ? (this._partySel = undefined) : (this._partySel = +arg)); break;
      case 'party-lead': {
        const [mon] = s.party.splice(+arg, 1);
        s.party.unshift(mon);
        Game.save();
        this.showParty(0);
        break;
      }
      case 'party-snack': {
        const mon = s.party[+arg];
        if (mon && mon.hp > 0 && mon.hp < mon.maxHp && Game.useItem('Snack')) {
          mon.hp = Math.min(mon.maxHp, mon.hp + ITEMS['Snack'].heal);
          Sound.fx('heal');
          Game.save();
        }
        this.showParty(+arg);
        break;
      }
      case 'party-release': {
        const mon = s.party[+arg];
        if (mon && s.party.length > 1 && confirm(`Set ${Game.displayName(mon)} free? It will be very happy (and very loud) about it.`)) {
          s.party.splice(+arg, 1);
          Game.save();
          this.toast(`${Game.displayName(mon)} scampered off with a grateful AWAWA!`);
        }
        this.showParty();
        break;
      }
      case 'show-dex': this.showDex(); break;
      case 'dex-detail': Sound.cry(arg); this.showDex(arg); break;
      case 'show-shop': this.showShop(); break;
      case 'buy': {
        const it = ITEMS[arg];
        if (it && s.coins >= it.price) {
          s.coins -= it.price;
          Game.addItem(arg);
          Sound.fx('coin');
          Game.save();
          this.toast(`Bought ${it.icon} ${arg}!`);
        }
        this.showShop();
        break;
      }
      // battle
      case 'battle-move': this.playEvents(Battle.playerMove(arg)); break;
      case 'battle-menu': this.renderBattleActions(arg); break;
      case 'battle-catch': this.playEvents(Battle.useCatchItem(arg)); break;
      case 'battle-snack': this.playEvents(Battle.useHealItem(arg)); break;
      case 'battle-switch': {
        const mon = s.party[+arg];
        if (mon && mon.hp > 0) this.playEvents(Battle.switchTo(mon, el.dataset.free === '1'));
        break;
      }
      case 'battle-flee': this.playEvents(Battle.flee()); break;
      case 'battle-end': this.endBattle(); break;
    }
  },

  showStarterPick_orConfirm() {
    let hasSave = false;
    try { hasSave = !!localStorage.getItem(SAVE_KEY); } catch (e) { /* ignore */ }
    if (hasSave && !confirm('Starting a new game will overwrite your existing save. Continue?')) return;
    this.showStarterPick();
  },

  init() {
    this.app.addEventListener('click', e => {
      const el = e.target.closest('[data-action]');
      if (!el || el.disabled) return;
      this.handleAction(el.dataset.action, el.dataset.arg, el);
    });
    this.showTitle();
  },
};

UI.init();
