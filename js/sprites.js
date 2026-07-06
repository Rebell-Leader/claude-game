// ===== Awawa Quest — procedural SVG hyrax sprites =====
'use strict';

// Every awawa is drawn from the same cuddly base blob; species differ by
// palette, eye style, scale and one signature feature overlay.
function awawaSVG(speciesName, opts = {}) {
  const sp = SPECIES[speciesName];
  // Golden (shiny) variants keep their species feature but get a gilded coat.
  const s = opts.golden
    ? Object.assign({}, sp.sprite, { body: '#f0c750', belly: '#fff3c9', ear: '#cf9f2a' })
    : sp.sprite;
  const facing = opts.facing || 'right';
  const size = opts.size || 160;
  const big = s.big || 1;
  const shade = shadeColor(s.body, -18);

  const eyes = {
    normal: `<circle cx="118" cy="78" r="6.5" fill="#2b2420"/><circle cx="152" cy="78" r="6.5" fill="#2b2420"/>
             <circle cx="120.5" cy="75.5" r="2.2" fill="#fff"/><circle cx="154.5" cy="75.5" r="2.2" fill="#fff"/>`,
    sparkle: `<circle cx="118" cy="78" r="7.5" fill="#2b2420"/><circle cx="152" cy="78" r="7.5" fill="#2b2420"/>
              <circle cx="121" cy="75" r="3" fill="#fff"/><circle cx="155" cy="75" r="3" fill="#fff"/>
              <circle cx="115.5" cy="81" r="1.4" fill="#fff"/><circle cx="149.5" cy="81" r="1.4" fill="#fff"/>`,
    sleepy: `<path d="M111 78 q7 6 14 0" stroke="#2b2420" stroke-width="3.4" fill="none" stroke-linecap="round"/>
             <path d="M145 78 q7 6 14 0" stroke="#2b2420" stroke-width="3.4" fill="none" stroke-linecap="round"/>`,
    closed: `<path d="M111 80 q7 -6 14 0" stroke="#2b2420" stroke-width="3.4" fill="none" stroke-linecap="round"/>
             <path d="M145 80 q7 -6 14 0" stroke="#2b2420" stroke-width="3.4" fill="none" stroke-linecap="round"/>`,
    angry: `<circle cx="118" cy="80" r="6" fill="#2b2420"/><circle cx="152" cy="80" r="6" fill="#2b2420"/>
            <path d="M108 68 L128 74" stroke="#2b2420" stroke-width="4" stroke-linecap="round"/>
            <path d="M162 68 L142 74" stroke="#2b2420" stroke-width="4" stroke-linecap="round"/>`,
    shout: `<path d="M111 76 q7 -7 14 0" stroke="#2b2420" stroke-width="3.6" fill="none" stroke-linecap="round"/>
            <path d="M145 76 q7 -7 14 0" stroke="#2b2420" stroke-width="3.6" fill="none" stroke-linecap="round"/>`,
  }[s.eyes || 'normal'];

  // Shouty species get a wide-open screaming mouth.
  const mouth = (s.eyes === 'shout')
    ? `<ellipse cx="135" cy="103" rx="12" ry="9" fill="#5e3128"/><ellipse cx="135" cy="106" rx="7" ry="4.5" fill="#e08585"/>`
    : `<path d="M129 100 q6 5 12 0" stroke="#4a3a30" stroke-width="3" fill="none" stroke-linecap="round"/>`;

  const features = {
    spikes: `<path d="M52 62 L62 40 L74 58 L86 34 L98 56 L110 38 L118 58 Z" fill="${shade}" opacity="0.9"/>`,
    crag: `<path d="M42 66 L54 30 L70 56 L84 22 L100 52 L114 28 L124 56 Z" fill="${shade}"/>
           <path d="M60 52 L68 40 L76 54 Z" fill="${shadeColor(s.body, -34)}"/>`,
    rays: `<g stroke="#ffd25e" stroke-width="6" stroke-linecap="round" opacity="0.9">
             <line x1="100" y1="14" x2="100" y2="0"/><line x1="60" y1="26" x2="50" y2="14"/>
             <line x1="140" y1="24" x2="150" y2="12"/><line x1="34" y1="58" x2="20" y2="52"/></g>`,
    corona: `<g stroke="#ffca3a" stroke-width="7" stroke-linecap="round">
              <line x1="100" y1="16" x2="100" y2="-2"/><line x1="58" y1="26" x2="46" y2="10"/>
              <line x1="142" y1="24" x2="154" y2="8"/><line x1="30" y1="60" x2="12" y2="52"/>
              <line x1="168" y1="52" x2="184" y2="44"/></g>
             <circle cx="100" cy="80" r="86" fill="#ffca3a" opacity="0.14"/>`,
    sprout: `<path d="M96 34 q0 -18 -2 -24" stroke="#4e8a3a" stroke-width="4.5" fill="none" stroke-linecap="round"/>
             <ellipse cx="84" cy="8" rx="12" ry="7" fill="#67b04b" transform="rotate(-28 84 8)"/>
             <ellipse cx="104" cy="6" rx="12" ry="7" fill="#7ec75f" transform="rotate(24 104 6)"/>`,
    fern: `<g fill="#4e8a3a"><ellipse cx="66" cy="34" rx="22" ry="9" transform="rotate(-32 66 34)"/>
           <ellipse cx="92" cy="26" rx="24" ry="9" transform="rotate(-8 92 26)"/>
           <ellipse cx="118" cy="30" rx="20" ry="8" transform="rotate(16 118 30)"/></g>`,
    canopy: `<g><ellipse cx="80" cy="34" rx="34" ry="20" fill="#4e8a3a"/><ellipse cx="110" cy="26" rx="30" ry="18" fill="#67b04b"/>
             <ellipse cx="56" cy="44" rx="22" ry="14" fill="#5d9e45"/>
             <circle cx="98" cy="18" r="4" fill="#e56a97"/><circle cx="70" cy="30" r="4" fill="#e56a97"/></g>`,
    waves: `<g stroke="#b3a4f5" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.95">
             <path d="M172 88 q8 12 0 24"/><path d="M182 82 q12 18 0 36"/></g>`,
    megawaves: `<g stroke="#c9befa" stroke-width="5" fill="none" stroke-linecap="round">
             <path d="M170 84 q9 14 0 28"/><path d="M181 76 q14 22 0 44"/><path d="M192 68 q19 30 0 60"/></g>`,
    swirl: `<path d="M46 40 q22 -18 40 -2 q-16 -2 -22 8" stroke="#bfe9f0" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    bigswirl: `<g stroke="#bfe9f0" stroke-width="5.5" fill="none" stroke-linecap="round">
             <path d="M36 42 q26 -22 48 -4 q-18 -3 -26 9"/><path d="M148 30 q20 -12 34 2"/></g>`,
    stars: `<g fill="#ffe08a">${star(58, 26, 8)}${star(150, 20, 6)}${star(34, 60, 5)}</g>`,
    moonstars: `<path d="M52 18 a16 16 0 1 0 14 24 a13 13 0 0 1 -14 -24" fill="#ffe08a"/>
             <g fill="#ffe08a">${star(150, 18, 7)}${star(178, 44, 5)}</g>`,
    brow: `<path d="M100 60 q35 -14 70 2" stroke="#4a4438" stroke-width="9" fill="none" stroke-linecap="round"/>`,
    crown: `<g><path d="M76 26 L84 2 L98 20 L112 -4 L126 20 L140 2 L148 26 Z" fill="#ffd25e" stroke="#e0a91f" stroke-width="3"/>
            <circle cx="112" cy="12" r="4" fill="#e05c7a"/></g>
            <circle cx="100" cy="80" r="90" fill="#fff5d6" opacity="0.22"/>`,
  }[s.feature] || '';

  const flip = facing === 'left' ? `transform="translate(200,0) scale(-1,1)"` : '';
  return `<svg viewBox="-10 -14 220 190" width="${size}" height="${size * 0.86}" class="awawa-svg" aria-label="${speciesName}">
  <g ${flip}>
    <g transform="translate(100,86) scale(${big}) translate(-100,-86)">
      ${['rays', 'corona', 'crown', 'stars', 'moonstars', 'swirl', 'bigswirl'].includes(s.feature) ? features : ''}
      <ellipse cx="100" cy="152" rx="62" ry="10" fill="#000" opacity="0.14"/>
      ${['spikes', 'crag', 'fern', 'canopy', 'sprout'].includes(s.feature) ? features : ''}
      <path d="M30 108 Q28 40 100 38 Q172 40 170 108 Q170 148 100 148 Q30 148 30 108 Z" fill="${s.body}"/>
      <path d="M30 108 Q29 74 44 58 Q36 96 52 128 Q38 124 30 108 Z" fill="${shade}" opacity="0.5"/>
      <ellipse cx="60" cy="42" rx="12" ry="14" fill="${s.body}"/>
      <ellipse cx="60" cy="44" rx="6.5" ry="8" fill="${s.ear}"/>
      <ellipse cx="140" cy="42" rx="12" ry="14" fill="${s.body}"/>
      <ellipse cx="140" cy="44" rx="6.5" ry="8" fill="${s.ear}"/>
      <ellipse cx="135" cy="118" rx="34" ry="24" fill="${s.belly}"/>
      ${eyes}
      <path d="M128 90 Q135 86 142 90 L138 96 Q135 98 132 96 Z" fill="#4a3a30"/>
      ${mouth}
      <g stroke="${shadeColor(s.body, -30)}" stroke-width="1.6" opacity="0.75">
        <line x1="122" y1="92" x2="104" y2="88"/><line x1="122" y1="95" x2="103" y2="95"/>
        <line x1="148" y1="92" x2="166" y2="88"/><line x1="148" y1="95" x2="167" y2="95"/>
      </g>
      <ellipse cx="66" cy="146" rx="13" ry="8" fill="${shade}"/>
      <ellipse cx="134" cy="146" rx="13" ry="8" fill="${shade}"/>
      ${['waves', 'megawaves', 'brow'].includes(s.feature) ? features : ''}
      ${opts.golden ? `<g fill="#fff1b8">${star(38, 34, 7)}${star(168, 26, 6)}${star(180, 96, 5)}${star(24, 96, 5)}</g>` : ''}
    </g>
  </g>
</svg>`;
}

// Convenience: render a specific creature instance (respects golden flag).
function monSVG(mon, opts = {}) {
  return awawaSVG(mon.species, Object.assign({ golden: mon.golden }, opts));
}

function star(cx, cy, r) {
  let p = '';
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.45;
    p += `${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)} `;
  }
  return `<polygon points="${p}"/>`;
}

function shadeColor(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const clamp = v => Math.max(0, Math.min(255, v + amt));
  const r = clamp(n >> 16), g = clamp((n >> 8) & 255), b = clamp(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
