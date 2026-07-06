// ===== Awawa Quest — game data =====
'use strict';

// Two type triangles: Rock > Sun > Leaf > Rock, Sound > Dream > Wind > Sound.
const TYPES = {
  Neutral: { color: '#9aa0a6', icon: '⚪', strong: null,    weak: null },
  Rock:    { color: '#b08d57', icon: '🪨', strong: 'Sun',   weak: 'Leaf' },
  Sun:     { color: '#f6a821', icon: '☀️', strong: 'Leaf',  weak: 'Rock' },
  Leaf:    { color: '#5cab52', icon: '🌿', strong: 'Rock',  weak: 'Sun' },
  Sound:   { color: '#8a6ff0', icon: '📣', strong: 'Dream', weak: 'Wind' },
  Dream:   { color: '#e06fc0', icon: '🌙', strong: 'Wind',  weak: 'Sound' },
  Wind:    { color: '#57b8c9', icon: '🌀', strong: 'Sound', weak: 'Dream' },
};

function typeMult(moveType, defType) {
  if (TYPES[moveType] && TYPES[moveType].strong === defType) return 2;
  if (TYPES[defType] && TYPES[defType].strong === moveType) return 0.5;
  return 1;
}

// effect: heal (fraction of max HP), drain (fraction of damage dealt),
// buff/debuff (stat stage change on self/enemy), priority (moves first).
const MOVES = {
  'Bonk':           { type: 'Neutral', power: 40, acc: 100, flavor: 'A friendly headfirst bonk.' },
  'Headbutt':       { type: 'Neutral', power: 65, acc: 95,  flavor: 'A determined skull charge.' },
  'Fluff Up':       { type: 'Neutral', power: 0,  acc: 100, effect: { buff: 'def', stages: 1 }, flavor: 'Puffs its fur to raise Defense.' },
  'Battle Squeak':  { type: 'Neutral', power: 0,  acc: 100, effect: { buff: 'atk', stages: 1 }, flavor: 'A tiny war cry. Raises Attack.' },
  'Pebble Toss':    { type: 'Rock',   power: 45, acc: 100, flavor: 'Flings a well-chosen pebble.' },
  'Rock Roll':      { type: 'Rock',   power: 65, acc: 95,  flavor: 'Tucks in and rolls like a boulder.' },
  'Boulder Slam':   { type: 'Rock',   power: 95, acc: 85,  flavor: 'Drops the whole cliff on them.' },
  'Sunbeam':        { type: 'Sun',    power: 45, acc: 100, flavor: 'A focused ray of warm light.' },
  'Warm Glow':      { type: 'Sun',    power: 0,  acc: 100, effect: { heal: 0.4 }, flavor: 'Basks and restores HP.' },
  'Heat Wave':      { type: 'Sun',    power: 65, acc: 95,  flavor: 'A shimmering wall of heat.' },
  'Solar Blast':    { type: 'Sun',    power: 95, acc: 85,  flavor: 'Unleashes stored sunshine.' },
  'Leaf Flick':     { type: 'Leaf',   power: 45, acc: 100, flavor: 'Flicks razor leaves.' },
  'Vine Snap':      { type: 'Leaf',   power: 65, acc: 95,  flavor: 'Snaps a springy vine.' },
  'Photosynth':     { type: 'Leaf',   power: 0,  acc: 100, effect: { heal: 0.4 }, flavor: 'Soaks up light and heals.' },
  'Petal Storm':    { type: 'Leaf',   power: 95, acc: 85,  flavor: 'A blinding whirl of petals.' },
  'Squeak':         { type: 'Sound',  power: 45, acc: 100, flavor: 'A piercing squeak.' },
  'Awawawa!':       { type: 'Sound',  power: 65, acc: 95,  effect: { debuff: 'atk', stages: 1, chance: 0.3 }, flavor: 'The ancestral scream. May rattle the foe.' },
  'SCREAM':         { type: 'Sound',  power: 100, acc: 80, flavor: 'A scream heard across the canyon.' },
  'Gust':           { type: 'Wind',   power: 45, acc: 100, flavor: 'A quick puff of wind.' },
  'Zephyr Dash':    { type: 'Wind',   power: 55, acc: 100, effect: { priority: 1 }, flavor: 'Strikes first on a breeze.' },
  'Cyclone':        { type: 'Wind',   power: 95, acc: 85,  flavor: 'Spins up a dusty cyclone.' },
  'Doze Ray':       { type: 'Dream',  power: 45, acc: 100, flavor: 'A hypnotic shimmer.' },
  'Nap Attack':     { type: 'Dream',  power: 60, acc: 100, effect: { drain: 0.5 }, flavor: 'Attacks while half-asleep, sapping HP.' },
  'Nightmare':      { type: 'Dream',  power: 95, acc: 85,  flavor: 'Projects a terrible dream.' },
  'Stare':          { type: 'Dream',  power: 0,  acc: 100, effect: { debuff: 'atk', stages: 1 }, flavor: 'An unsettling stare. Lowers foe Attack.' },
};

// Sprite params consumed by sprites.js: body/belly/ear colors, feature, eyes.
const SPECIES = {
  Pebbawa: {
    dex: 1, type: 'Rock', base: { hp: 46, atk: 50, def: 52, spd: 40 }, catchRate: 0.55, baseXp: 60,
    evolvesTo: 'Bouldawa', evolveLevel: 14,
    learnset: [{ lvl: 1, move: 'Bonk' }, { lvl: 1, move: 'Pebble Toss' }, { lvl: 7, move: 'Fluff Up' }, { lvl: 12, move: 'Rock Roll' }],
    sprite: { body: '#c2a377', belly: '#e8d9bd', ear: '#9c7c50', feature: 'spikes', eyes: 'normal' },
    desc: 'A pocket-sized rock hyrax. It hoards its favorite pebbles and refuses to trade.',
  },
  Bouldawa: {
    dex: 2, type: 'Rock', base: { hp: 62, atk: 66, def: 70, spd: 48 }, catchRate: 0.3, baseXp: 130,
    evolvesTo: 'Cliffawa', evolveLevel: 28,
    learnset: [{ lvl: 1, move: 'Pebble Toss' }, { lvl: 14, move: 'Rock Roll' }, { lvl: 20, move: 'Battle Squeak' }, { lvl: 26, move: 'Boulder Slam' }],
    sprite: { body: '#a98c5e', belly: '#dcc9a3', ear: '#84663c', feature: 'spikes', eyes: 'angry', big: 1.12 },
    desc: 'Its back has hardened into a shell of packed stone. Sleeps standing up.',
  },
  Cliffawa: {
    dex: 3, type: 'Rock', base: { hp: 82, atk: 86, def: 92, spd: 55 }, catchRate: 0.12, baseXp: 220,
    learnset: [{ lvl: 1, move: 'Rock Roll' }, { lvl: 28, move: 'Boulder Slam' }, { lvl: 34, move: 'Fluff Up' }, { lvl: 40, move: 'Headbutt' }],
    sprite: { body: '#8f7248', belly: '#cdb98e', ear: '#6b5230', feature: 'crag', eyes: 'angry', big: 1.25 },
    desc: 'Entire colonies shelter beneath it, mistaking it for an actual cliff.',
  },
  Sunnyrax: {
    dex: 4, type: 'Sun', base: { hp: 44, atk: 54, def: 44, spd: 52 }, catchRate: 0.55, baseXp: 62,
    evolvesTo: 'Solawa', evolveLevel: 14,
    learnset: [{ lvl: 1, move: 'Bonk' }, { lvl: 1, move: 'Sunbeam' }, { lvl: 7, move: 'Warm Glow' }, { lvl: 12, move: 'Heat Wave' }],
    sprite: { body: '#f2b94f', belly: '#ffe6b0', ear: '#d99a2b', feature: 'rays', eyes: 'sparkle' },
    desc: 'It claims the warmest rock every morning and defends it with righteous fury.',
  },
  Solawa: {
    dex: 5, type: 'Sun', base: { hp: 58, atk: 72, def: 56, spd: 66 }, catchRate: 0.3, baseXp: 132,
    evolvesTo: 'Blazerax', evolveLevel: 28,
    learnset: [{ lvl: 1, move: 'Sunbeam' }, { lvl: 14, move: 'Heat Wave' }, { lvl: 20, move: 'Warm Glow' }, { lvl: 26, move: 'Solar Blast' }],
    sprite: { body: '#ef9f2e', belly: '#ffdf9e', ear: '#c77f13', feature: 'rays', eyes: 'sparkle', big: 1.12 },
    desc: 'Glows faintly at dusk. Cold awawas gather around it like a campfire.',
  },
  Blazerax: {
    dex: 6, type: 'Sun', base: { hp: 76, atk: 94, def: 70, spd: 82 }, catchRate: 0.12, baseXp: 225,
    learnset: [{ lvl: 1, move: 'Heat Wave' }, { lvl: 28, move: 'Solar Blast' }, { lvl: 34, move: 'Battle Squeak' }, { lvl: 40, move: 'Warm Glow' }],
    sprite: { body: '#e8871e', belly: '#ffd68a', ear: '#b56609', feature: 'corona', eyes: 'angry', big: 1.25 },
    desc: 'Its body temperature rivals a summer noon. Never needs a warm rock again.',
  },
  Sproutawa: {
    dex: 7, type: 'Leaf', base: { hp: 48, atk: 48, def: 48, spd: 48 }, catchRate: 0.55, baseXp: 61,
    evolvesTo: 'Fernrax', evolveLevel: 14,
    learnset: [{ lvl: 1, move: 'Bonk' }, { lvl: 1, move: 'Leaf Flick' }, { lvl: 7, move: 'Photosynth' }, { lvl: 12, move: 'Vine Snap' }],
    sprite: { body: '#9cbf6e', belly: '#dcedc2', ear: '#79a24a', feature: 'sprout', eyes: 'normal' },
    desc: 'A seed sprouted on its head one spring and neither has been apart since.',
  },
  Fernrax: {
    dex: 8, type: 'Leaf', base: { hp: 64, atk: 64, def: 64, spd: 62 }, catchRate: 0.3, baseXp: 131,
    evolvesTo: 'Canopawa', evolveLevel: 28,
    learnset: [{ lvl: 1, move: 'Leaf Flick' }, { lvl: 14, move: 'Vine Snap' }, { lvl: 20, move: 'Photosynth' }, { lvl: 26, move: 'Petal Storm' }],
    sprite: { body: '#83ab54', belly: '#cfe3ac', ear: '#628838', feature: 'fern', eyes: 'normal', big: 1.12 },
    desc: 'The fronds on its back curl when rain is coming. Farmers trust it completely.',
  },
  Canopawa: {
    dex: 9, type: 'Leaf', base: { hp: 84, atk: 84, def: 84, spd: 74 }, catchRate: 0.12, baseXp: 223,
    learnset: [{ lvl: 1, move: 'Vine Snap' }, { lvl: 28, move: 'Petal Storm' }, { lvl: 34, move: 'Photosynth' }, { lvl: 40, move: 'Headbutt' }],
    sprite: { body: '#6a9440', belly: '#c2d996', ear: '#4d7028', feature: 'canopy', eyes: 'sleepy', big: 1.25 },
    desc: 'A small ecosystem lives in its foliage. It is very polite about it.',
  },
  Screechawa: {
    dex: 10, type: 'Sound', base: { hp: 42, atk: 58, def: 40, spd: 60 }, catchRate: 0.45, baseXp: 70,
    evolvesTo: 'Yellawa', evolveLevel: 18,
    learnset: [{ lvl: 1, move: 'Squeak' }, { lvl: 6, move: 'Battle Squeak' }, { lvl: 12, move: 'Awawawa!' }],
    sprite: { body: '#a793e8', belly: '#e2dbf7', ear: '#8672c9', feature: 'waves', eyes: 'shout' },
    desc: 'Practices its scream at dawn. The whole valley has given up on sleeping in.',
  },
  Yellawa: {
    dex: 11, type: 'Sound', base: { hp: 60, atk: 80, def: 54, spd: 78 }, catchRate: 0.2, baseXp: 160,
    learnset: [{ lvl: 1, move: 'Awawawa!' }, { lvl: 18, move: 'Headbutt' }, { lvl: 24, move: 'SCREAM' }],
    sprite: { body: '#8a6ff0', belly: '#d8cef7', ear: '#6b52cc', feature: 'megawaves', eyes: 'shout', big: 1.15 },
    desc: 'Its scream registers on seismographs. It is extremely proud of this.',
  },
  Whistlerax: {
    dex: 12, type: 'Wind', base: { hp: 42, atk: 50, def: 42, spd: 70 }, catchRate: 0.45, baseXp: 68,
    evolvesTo: 'Galewa', evolveLevel: 18,
    learnset: [{ lvl: 1, move: 'Gust' }, { lvl: 7, move: 'Zephyr Dash' }, { lvl: 13, move: 'Fluff Up' }],
    sprite: { body: '#7cc4d1', belly: '#d8f0f4', ear: '#57a3b3', feature: 'swirl', eyes: 'normal' },
    desc: 'Whistles through its teeth to call the wind. Sometimes the wind answers.',
  },
  Galewa: {
    dex: 13, type: 'Wind', base: { hp: 60, atk: 70, def: 56, spd: 96 }, catchRate: 0.2, baseXp: 158,
    learnset: [{ lvl: 1, move: 'Zephyr Dash' }, { lvl: 18, move: 'Gust' }, { lvl: 24, move: 'Cyclone' }],
    sprite: { body: '#57b8c9', belly: '#c6ecf2', ear: '#3795a8', feature: 'bigswirl', eyes: 'sparkle', big: 1.15 },
    desc: 'Rides thermals off the cliff face. Has never once stuck the landing.',
  },
  Dozawa: {
    dex: 14, type: 'Dream', base: { hp: 55, atk: 45, def: 50, spd: 35 }, catchRate: 0.45, baseXp: 72,
    evolvesTo: 'Snoozerax', evolveLevel: 20,
    learnset: [{ lvl: 1, move: 'Doze Ray' }, { lvl: 8, move: 'Stare' }, { lvl: 14, move: 'Nap Attack' }],
    sprite: { body: '#dfa5cd', belly: '#f7e3f1', ear: '#c383ae', feature: 'stars', eyes: 'sleepy' },
    desc: 'Sleeps 22 hours a day. The other two hours are for snacks.',
  },
  Snoozerax: {
    dex: 15, type: 'Dream', base: { hp: 90, atk: 62, def: 70, spd: 30 }, catchRate: 0.2, baseXp: 165,
    learnset: [{ lvl: 1, move: 'Nap Attack' }, { lvl: 20, move: 'Stare' }, { lvl: 26, move: 'Nightmare' }],
    sprite: { body: '#cd86b6', belly: '#f2d9ea', ear: '#a9648f', feature: 'moonstars', eyes: 'closed', big: 1.18 },
    desc: 'Fights entirely in its sleep. Waking it up is considered rude and unwise.',
  },
  Grumpawa: {
    dex: 16, type: 'Rock', base: { hp: 70, atk: 78, def: 78, spd: 45 }, catchRate: 0.15, baseXp: 170,
    learnset: [{ lvl: 1, move: 'Rock Roll' }, { lvl: 1, move: 'Stare' }, { lvl: 22, move: 'Boulder Slam' }],
    sprite: { body: '#8d8577', belly: '#c9c2b4', ear: '#6d6557', feature: 'brow', eyes: 'angry', big: 1.1 },
    desc: 'Perpetually unimpressed. Its glare has ended arguments, weddings, and one war.',
  },
  Echorax: {
    dex: 17, type: 'Sound', base: { hp: 66, atk: 84, def: 60, spd: 84 }, catchRate: 0.1, baseXp: 190,
    learnset: [{ lvl: 1, move: 'Awawawa!' }, { lvl: 1, move: 'Zephyr Dash' }, { lvl: 26, move: 'SCREAM' }],
    sprite: { body: '#6f5bd4', belly: '#cfc6f5', ear: '#5340ad', feature: 'megawaves', eyes: 'sparkle', big: 1.1 },
    desc: 'Speaks only in echoes of things said long ago. Nobody knows its real voice.',
  },
  'The Great Awawa': {
    dex: 18, type: 'Sound', base: { hp: 100, atk: 100, def: 90, spd: 90 }, catchRate: 0.05, baseXp: 340, legendary: true,
    learnset: [{ lvl: 1, move: 'SCREAM' }, { lvl: 1, move: 'Boulder Slam' }, { lvl: 1, move: 'Warm Glow' }, { lvl: 1, move: 'Nightmare' }],
    sprite: { body: '#f0e6d2', belly: '#fffaf0', ear: '#d4c5a3', feature: 'crown', eyes: 'sparkle', big: 1.3 },
    desc: 'The first scream. When it cries AWAWAWA, every hyrax on earth answers.',
  },
};

const ZONES = [
  {
    id: 'cliffs', name: 'Sunny Cliffs', icon: '⛰️', minLevel: 0, levels: [2, 6],
    palette: ['#ffd89b', '#f2994a'], ground: '#c98d4b',
    blurb: 'Warm rocks and warmer naps. Where every awawa journey begins.',
    encounters: [
      { species: 'Pebbawa', w: 30 }, { species: 'Sunnyrax', w: 30 },
      { species: 'Sproutawa', w: 25 }, { species: 'Screechawa', w: 10 }, { species: 'Whistlerax', w: 5 },
    ],
  },
  {
    id: 'meadow', name: 'Whispering Meadow', icon: '🌾', minLevel: 0, levels: [5, 11],
    palette: ['#c7f0a4', '#7cc46c'], ground: '#5d9e50',
    blurb: 'Tall grass, gentle winds, and the occasional distant scream.',
    encounters: [
      { species: 'Sproutawa', w: 30 }, { species: 'Whistlerax', w: 25 },
      { species: 'Dozawa', w: 20 }, { species: 'Sunnyrax', w: 15 }, { species: 'Fernrax', w: 10 },
    ],
  },
  {
    id: 'canyon', name: 'Echo Canyon', icon: '🏜️', minLevel: 10, levels: [10, 18],
    palette: ['#e8b48b', '#b06f4c'], ground: '#8c5637',
    blurb: 'Every awawa here screams twice. Once on purpose, once by echo.',
    encounters: [
      { species: 'Screechawa', w: 30 }, { species: 'Pebbawa', w: 20 }, { species: 'Bouldawa', w: 15 },
      { species: 'Grumpawa', w: 12 }, { species: 'Yellawa', w: 13 }, { species: 'Whistlerax', w: 10 },
    ],
  },
  {
    id: 'oasis', name: 'Dream Oasis', icon: '🌴', minLevel: 16, levels: [16, 26],
    palette: ['#b79bf0', '#e08bd0'], ground: '#7e5ba8',
    blurb: 'The water here reflects stars at noon. Sleep lightly.',
    encounters: [
      { species: 'Dozawa', w: 30 }, { species: 'Snoozerax', w: 15 }, { species: 'Solawa', w: 15 },
      { species: 'Fernrax', w: 15 }, { species: 'Galewa', w: 15 }, { species: 'Echorax', w: 10 },
    ],
  },
  {
    id: 'summit', name: 'Great Rock Summit', icon: '🗻', minLevel: 25, levels: [26, 36],
    palette: ['#9db4d0', '#5d7599'], ground: '#4a5d7a',
    blurb: 'The oldest rock. The thinnest air. The loudest legend.',
    encounters: [
      { species: 'Bouldawa', w: 22 }, { species: 'Grumpawa', w: 20 }, { species: 'Yellawa', w: 18 },
      { species: 'Galewa', w: 15 }, { species: 'Echorax', w: 15 }, { species: 'Cliffawa', w: 6 },
      { species: 'The Great Awawa', w: 4 },
    ],
  },
];

const ITEMS = {
  'Pebble':        { icon: '🪨', price: 10,  desc: 'A humble catching pebble.', ballBonus: 1 },
  'Smooth Stone':  { icon: '💎', price: 35,  desc: 'Awawas find it irresistible. Better catch odds.', ballBonus: 1.7 },
  'Comfy Blanket': { icon: '🧣', price: 90,  desc: 'No awawa can resist a warm blanket. Best odds.', ballBonus: 2.6 },
  'Snack':         { icon: '🥕', price: 15,  desc: 'Restores 40 HP.', heal: 40 },
  'Big Snack':     { icon: '🍉', price: 45,  desc: 'Fully restores HP.', heal: 9999 },
};

const STARTERS = ['Pebbawa', 'Sunnyrax', 'Sproutawa'];
