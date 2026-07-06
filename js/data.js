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
  // ---- Moonlit Isles (post-game region) ----
  Driftawa: {
    dex: 19, type: 'Wind', base: { hp: 62, atk: 68, def: 60, spd: 88 }, catchRate: 0.3, baseXp: 170,
    evolvesTo: 'Tidalrax', evolveLevel: 34,
    learnset: [{ lvl: 1, move: 'Gust' }, { lvl: 1, move: 'Zephyr Dash' }, { lvl: 30, move: 'Fluff Up' }, { lvl: 33, move: 'Cyclone' }],
    sprite: { body: '#6fb5d8', belly: '#d9f1fa', ear: '#4a92b8', feature: 'swirl', eyes: 'normal' },
    desc: 'Floats on driftwood across the strait, steering with its ears. Rarely arrives on purpose.',
  },
  Tidalrax: {
    dex: 20, type: 'Wind', base: { hp: 80, atk: 88, def: 76, spd: 104 }, catchRate: 0.12, baseXp: 260,
    learnset: [{ lvl: 1, move: 'Zephyr Dash' }, { lvl: 34, move: 'Cyclone' }, { lvl: 40, move: 'Headbutt' }, { lvl: 44, move: 'Fluff Up' }],
    sprite: { body: '#4693bd', belly: '#c4e9f5', ear: '#2f7095', feature: 'bigswirl', eyes: 'sparkle', big: 1.2 },
    desc: 'Commands the tide by screaming at it. The tide, remarkably, listens.',
  },
  Glimmerawa: {
    dex: 21, type: 'Sun', base: { hp: 70, atk: 82, def: 72, spd: 86 }, catchRate: 0.15, baseXp: 230,
    learnset: [{ lvl: 1, move: 'Sunbeam' }, { lvl: 1, move: 'Warm Glow' }, { lvl: 34, move: 'Solar Blast' }, { lvl: 40, move: 'Battle Squeak' }],
    sprite: { body: '#e8d48a', belly: '#fdf6d8', ear: '#c4ad5c', feature: 'stars', eyes: 'sparkle', big: 1.05 },
    desc: 'Stores moonlight in its fur and pays it back at dawn with interest.',
  },
  Corallawa: {
    dex: 22, type: 'Rock', base: { hp: 88, atk: 84, def: 100, spd: 52 }, catchRate: 0.15, baseXp: 240,
    learnset: [{ lvl: 1, move: 'Rock Roll' }, { lvl: 1, move: 'Fluff Up' }, { lvl: 34, move: 'Boulder Slam' }, { lvl: 40, move: 'Stare' }],
    sprite: { body: '#e88a9a', belly: '#fbdde3', ear: '#c05f72', feature: 'crag', eyes: 'sleepy', big: 1.15 },
    desc: 'Coral grew over it during an exceptionally long nap. It has decided to keep it.',
  },
  Mistrawa: {
    dex: 23, type: 'Dream', base: { hp: 92, atk: 78, def: 82, spd: 66 }, catchRate: 0.12, baseXp: 250,
    learnset: [{ lvl: 1, move: 'Nap Attack' }, { lvl: 1, move: 'Doze Ray' }, { lvl: 34, move: 'Nightmare' }, { lvl: 40, move: 'Stare' }],
    sprite: { body: '#b8b3d6', belly: '#eceaf7', ear: '#918bb5', feature: 'moonstars', eyes: 'closed', big: 1.1 },
    desc: 'Half awawa, half sea fog. Walk through it and you dream of warm rocks for a week.',
  },
  Lunawa: {
    dex: 24, type: 'Dream', base: { hp: 105, atk: 95, def: 95, spd: 95 }, catchRate: 0.05, baseXp: 360, legendary: true,
    learnset: [{ lvl: 1, move: 'Nightmare' }, { lvl: 1, move: 'Cyclone' }, { lvl: 1, move: 'Warm Glow' }, { lvl: 1, move: 'SCREAM' }],
    sprite: { body: '#cfd6ea', belly: '#f4f6fd', ear: '#a5aecf', feature: 'crescent', eyes: 'sparkle', big: 1.28 },
    desc: 'The moon\'s reflection that climbed out of the lagoon one night and stayed. Screams in silver.',
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
  {
    id: 'shore', name: 'Silver Shore', icon: '🏖️', minLevel: 28, levels: [28, 36], region: 'Moonlit Isles',
    palette: ['#a8d8e8', '#5891c9'], ground: '#c9b98a',
    blurb: 'Across the strait, the sand glitters like crushed moons.',
    encounters: [
      { species: 'Driftawa', w: 30 }, { species: 'Corallawa', w: 20 }, { species: 'Glimmerawa', w: 18 },
      { species: 'Galewa', w: 17 }, { species: 'Solawa', w: 15 },
    ],
  },
  {
    id: 'grotto', name: 'Glowcap Grotto', icon: '🍄', minLevel: 32, levels: [32, 40], region: 'Moonlit Isles',
    palette: ['#8a7fc4', '#4b3f80'], ground: '#37305e',
    blurb: 'Mushrooms light the dark. Something in here snores like the sea.',
    encounters: [
      { species: 'Mistrawa', w: 28 }, { species: 'Corallawa', w: 20 }, { species: 'Snoozerax', w: 18 },
      { species: 'Echorax', w: 18 }, { species: 'Driftawa', w: 16 },
    ],
  },
  {
    id: 'lagoon', name: 'Moonlit Lagoon', icon: '🌊', minLevel: 36, levels: [36, 44], region: 'Moonlit Isles',
    palette: ['#7d95d8', '#3a4a8a'], ground: '#2c3868',
    blurb: 'The moon keeps a spare reflection here. Do not startle it.',
    encounters: [
      { species: 'Tidalrax', w: 26 }, { species: 'Mistrawa', w: 24 }, { species: 'Glimmerawa', w: 22 },
      { species: 'Corallawa', w: 14 }, { species: 'Echorax', w: 10 }, { species: 'Lunawa', w: 4 },
    ],
  },
];

const ITEMS = {
  'Pebble':        { icon: '🪨', price: 10,  desc: 'A humble catching pebble.', ballBonus: 1 },
  'Smooth Stone':  { icon: '💎', price: 35,  desc: 'Awawas find it irresistible. Better catch odds.', ballBonus: 1.7 },
  'Comfy Blanket': { icon: '🧣', price: 90,  desc: 'No awawa can resist a warm blanket. Best odds.', ballBonus: 2.6 },
  'Snack':         { icon: '🥕', price: 15,  desc: 'Restores 40 HP.', heal: 40 },
  'Big Snack':     { icon: '🍉', price: 45,  desc: 'Fully restores HP.', heal: 9999 },
  // Held charms — equip one per awawa from the Party screen.
  'Granite Chip':  { icon: '🧱', price: 140, desc: 'Held: Rock moves deal +25% damage.',  held: { boost: 'Rock',  mult: 1.25 } },
  'Warm Pebble':   { icon: '🌞', price: 140, desc: 'Held: Sun moves deal +25% damage.',   held: { boost: 'Sun',   mult: 1.25 } },
  'Sprout Charm':  { icon: '🌱', price: 140, desc: 'Held: Leaf moves deal +25% damage.',  held: { boost: 'Leaf',  mult: 1.25 } },
  'Echo Horn':     { icon: '📯', price: 140, desc: 'Held: Sound moves deal +25% damage.', held: { boost: 'Sound', mult: 1.25 } },
  'Storm Feather': { icon: '🪶', price: 140, desc: 'Held: Wind moves deal +25% damage.',  held: { boost: 'Wind',  mult: 1.25 } },
  'Dream Locket':  { icon: '🔮', price: 140, desc: 'Held: Dream moves deal +25% damage.', held: { boost: 'Dream', mult: 1.25 } },
  'Lucky Clover':  { icon: '🍀', price: 200, desc: 'Held: critical hit chance rises to 15%.', held: { crit: 0.15 } },
  'Soft Moss':     { icon: '🍄', price: 220, desc: 'Held: restores 6% of max HP every round.', held: { regen: 0.06 } },
};

// Wandering trainers ambush you while exploring. Themed teams, real stakes:
// no catching, no running, coins and per-knockout XP on the line.
const TRAINERS = {
  cliffs: [
    { name: 'Rock Fan Rocco', avatar: '🧗', team: ['Pebbawa', 'Pebbawa'], coins: 35,
      intro: 'Rocks are friends AND projectiles!', winQuip: 'My rocks… rolled away…' },
    { name: 'Nap Coach Nia', avatar: '🧘', team: ['Sunnyrax', 'Sproutawa'], coins: 35,
      intro: 'My team trains four hours and naps twenty!', winQuip: 'Back to the nap regimen.' },
  ],
  meadow: [
    { name: 'Picnicker Poppy', avatar: '🧺', team: ['Sproutawa', 'Whistlerax'], coins: 55,
      intro: 'You stepped on my picnic blanket. This means war.', winQuip: 'At least the sandwiches survived.' },
    { name: 'Shepherd Sal', avatar: '🐑', team: ['Dozawa', 'Sproutawa', 'Sunnyrax'], coins: 70,
      intro: 'My flock says you look beatable. Baa.', winQuip: 'The flock has revised its opinion.' },
  ],
  canyon: [
    { name: 'Echo Cultist Vex', avatar: '📢', team: ['Screechawa', 'Screechawa', 'Yellawa'], coins: 110,
      intro: 'JOIN US — us — us. THE ECHO PROVIDES — vides — vides.', winQuip: 'The echo… did not provide.' },
    { name: 'Prospector Gus', avatar: '⛏️', team: ['Bouldawa', 'Grumpawa'], coins: 100,
      intro: 'Struck gold once. Struck out ever since.', winQuip: 'Even my awawas are unimpressed with me.' },
  ],
  oasis: [
    { name: 'Sleepwalker Momo', avatar: '😴', team: ['Dozawa', 'Snoozerax'], coins: 150,
      intro: 'zzz… huh? Oh. We battle now, apparently.', winQuip: 'Was that real, or…? zzz.' },
    { name: 'Mirage Dancer Lila', avatar: '🩰', team: ['Galewa', 'Solawa', 'Fernrax'], coins: 170,
      intro: 'Dance with my mirages, if you can tell which is real!', winQuip: 'Even mirages lose sometimes.' },
  ],
  summit: [
    { name: 'Summit Sage Orin', avatar: '🧙', team: ['Cliffawa', 'Blazerax', 'Canopawa'], coins: 240,
      intro: 'I climbed forty years for wisdom. Mostly I found awawas.', winQuip: 'Ah. The wisdom was losing gracefully.' },
    { name: 'Scream Chaser Rae', avatar: '🌪️', team: ['Yellawa', 'Echorax', 'Galewa'], coins: 240,
      intro: 'I chase the loudest screams on earth. You scream interesting.', winQuip: 'THAT was a scream worth chasing!' },
  ],
  shore: [
    { name: 'Beachcomber Bo', avatar: '🏖️', team: ['Driftawa', 'Corallawa'], coins: 300,
      intro: 'The tide brings me treasures. Today it brought me an opponent!', winQuip: 'Back to combing. The beach never loses.' },
  ],
  grotto: [
    { name: 'Mushroom Monk Fen', avatar: '🍄', team: ['Mistrawa', 'Snoozerax', 'Corallawa'], coins: 380,
      intro: 'The glowcaps whisper of your coming. They also whisper recipes.', winQuip: 'The mushrooms saw this outcome. I chose not to listen.' },
  ],
  lagoon: [
    { name: 'Moon Priestess Isla', avatar: '🌕', team: ['Glimmerawa', 'Mistrawa', 'Tidalrax'], coins: 450,
      intro: 'The moon has two reflections tonight. Let us see which one blinks.', winQuip: 'The moon blinked. Astonishing.' },
  ],
};

const STARTERS = ['Pebbawa', 'Sunnyrax', 'Sproutawa'];

// Time of day advances every 10 exploration steps (resting skips a phase).
// mods multiply encounter weights per species type; goldenDiv is shiny odds.
const PHASES = [
  { id: 'dawn',  icon: '🌅', name: 'Dawn',  tint: 'rgba(255,160,90,0.18)', hint: 'golden awawas love this light', mods: { Wind: 1.5, Sun: 1.2 }, goldenDiv: 20 },
  { id: 'day',   icon: '☀️', name: 'Day',   tint: 'rgba(255,255,255,0)',   hint: 'sun-baskers everywhere',       mods: { Sun: 1.5, Dream: 0.6 }, goldenDiv: 40 },
  { id: 'dusk',  icon: '🌇', name: 'Dusk',  tint: 'rgba(150,60,110,0.22)', hint: 'the valley starts to sing',    mods: { Leaf: 1.3, Sound: 1.3 }, goldenDiv: 40 },
  { id: 'night', icon: '🌙', name: 'Night', tint: 'rgba(15,20,60,0.42)',   hint: 'dream awawas are about',       mods: { Dream: 2.5, Sound: 1.5, Sun: 0.3 }, goldenDiv: 40 },
];

// Scree, your rival. Ambushes you on your next step after every badge,
// always packing the starter that counters yours — and it evolves too.
const RIVAL = {
  name: 'Scree', avatar: '😼',
  counter: { Pebbawa: 'Sproutawa', Sunnyrax: 'Pebbawa', Sproutawa: 'Sunnyrax' },
  lines: {
    Pebbawa: ['Pebbawa', 'Bouldawa', 'Cliffawa'],
    Sunnyrax: ['Sunnyrax', 'Solawa', 'Blazerax'],
    Sproutawa: ['Sproutawa', 'Fernrax', 'Canopawa'],
  },
  fights: [
    { fillers: [], starterStage: 0, level: 9, coins: 60,
      intro: "Scree! You got a badge?! I've been training since SUNRISE. Battle me!",
      winQuip: 'Wha— I had a strategy and everything!' },
    { fillers: ['Whistlerax'], starterStage: 1, level: 15, coins: 120,
      intro: "Two badges means nothing if you can't beat me. Scree!",
      winQuip: 'Lucky wind. LUCKY. WIND.' },
    { fillers: ['Screechawa', 'Dozawa'], starterStage: 1, level: 21, coins: 200,
      intro: 'I taught my team to scream in harmony. Prepare your ears!',
      winQuip: "We'll rehearse a sadder harmony now…" },
    { fillers: ['Yellawa', 'Galewa'], starterStage: 2, level: 28, coins: 320,
      intro: "Four badges each. One of us is the best. Spoiler: it's me. SCREE!",
      winQuip: 'Spoiler… it was you…' },
    { fillers: ['Echorax', 'Snoozerax', 'Grumpawa'], starterStage: 2, level: 35, coins: 500,
      intro: "Champion. Final battle. Everything I've got. SCREEEEEE!",
      winQuip: '…That was awesome. Rivals forever, deal?' },
  ],
};

// Each zone has a guardian Elder — a boss trial. Beating it earns a badge,
// which is the intended way to unlock the next zone (high level also works).
const ELDERS = {
  cliffs: {
    name: 'Boulder the Unmoved', species: 'Grumpawa', level: 8, boost: 1.12,
    badge: 'Cliff Badge', icon: '🥌', reward: { coins: 120, items: { 'Smooth Stone': 3 } },
    intro: 'The old guardian of the cliffs blinks slowly. It is not impressed. Yet.',
    win: 'Boulder nods, once. Legend says that means "well done".',
  },
  meadow: {
    name: 'Whisperwind', species: 'Galewa', level: 14, boost: 1.12,
    badge: 'Breeze Badge', icon: '🍃', reward: { coins: 200, items: { 'Comfy Blanket': 1, 'Snack': 2 } },
    intro: 'A blur circles you three times before sitting down. "Catch me if you can," it whistles.',
    win: 'Whisperwind bows mid-backflip. The meadow applauds in rustles.',
  },
  canyon: {
    name: 'The Echo of Echoes', species: 'Echorax', level: 20, boost: 1.15,
    badge: 'Echo Badge', icon: '📣', reward: { coins: 300, items: { 'Comfy Blanket': 1, 'Big Snack': 1 } },
    intro: '"WHO DARES…" — dares — dares — the canyon itself asks the question.',
    win: 'For the first time in centuries, the canyon is silent. Then: distant, approving awawas.',
  },
  oasis: {
    name: 'Auntie Slumber', species: 'Snoozerax', level: 27, boost: 1.15,
    badge: 'Dream Badge', icon: '🌙', reward: { coins: 450, items: { 'Comfy Blanket': 2 } },
    intro: 'The huge awawa does not open her eyes. "I will fight you," she yawns, "horizontally."',
    win: 'Auntie Slumber smiles in her sleep and dreams a badge into your hand.',
  },
  summit: {
    name: 'THE GREAT AWAWA', species: 'The Great Awawa', level: 34, boost: 1.2,
    badge: 'Scream Badge', icon: '👑', reward: { coins: 1000, items: { 'Comfy Blanket': 3 } }, final: true,
    intro: 'The First Scream itself descends from the peak. Every hyrax on earth goes quiet to listen.',
    win: 'THE GREAT AWAWA screams your name across every cliff in the world. You are legend now.',
  },
  lagoon: {
    name: 'Tidemother Naia', species: 'Tidalrax', level: 42, boost: 1.18,
    badge: 'Tide Badge', icon: '🌊', reward: { coins: 1500, items: { 'Comfy Blanket': 3, 'Big Snack': 3 } },
    intro: 'The lagoon rises into the shape of an awawa. "The moon vouches for you. I do not. Yet."',
    win: 'Naia dissolves into spray, laughing. The moon\'s reflection bows to you.',
  },
};

// Milestones auto-complete and pay out the moment their condition is met.
const MILESTONES = [
  { id: 'first-catch',  icon: '🪨', name: 'First Friend',     desc: 'Catch your first awawa',            check: s => s.stats.catches >= 1, reward: { coins: 30 } },
  { id: 'collector-5',  icon: '📔', name: 'Collector',        desc: 'Catch 5 different species',         check: s => Object.keys(s.dex.caught).length >= 5, reward: { coins: 60, items: { 'Smooth Stone': 2 } } },
  { id: 'collector-10', icon: '📚', name: 'Curator',          desc: 'Catch 10 different species',        check: s => Object.keys(s.dex.caught).length >= 10, reward: { coins: 150, items: { 'Comfy Blanket': 1 } } },
  { id: 'dex-complete', icon: '🏆', name: 'Awadex Master',    desc: 'Catch every species in the Awadex', check: s => Object.keys(s.dex.caught).length >= Object.keys(SPECIES).length, reward: { coins: 500 } },
  { id: 'golden',       icon: '✨', name: 'Shine Seeker',     desc: 'Catch a golden awawa',              check: s => Object.keys(s.dex.golden).length >= 1, reward: { coins: 200 } },
  { id: 'first-evolve', icon: '🌟', name: 'Growing Up',       desc: 'Evolve an awawa',                   check: s => s.stats.evolutions >= 1, reward: { coins: 80 } },
  { id: 'battles-10',   icon: '⚔️', name: 'Scrapper',         desc: 'Win 10 battles',                    check: s => s.stats.battles >= 10, reward: { coins: 50 } },
  { id: 'battles-50',   icon: '🛡️', name: 'Veteran',          desc: 'Win 50 battles',                    check: s => s.stats.battles >= 50, reward: { coins: 150, items: { 'Big Snack': 2 } } },
  { id: 'first-badge',  icon: '🥇', name: 'Trial by Fluff',   desc: 'Defeat your first Elder',           check: s => Object.keys(s.badges).length >= 1, reward: { items: { 'Snack': 3 } } },
  { id: 'all-badges',   icon: '👑', name: 'Elder of Elders',  desc: 'Earn all 5 badges',                 check: s => Object.keys(s.badges).length >= 5, reward: { coins: 300 } },
  { id: 'wanderer',     icon: '👣', name: 'Wanderer',         desc: 'Take 100 exploration steps',        check: s => s.stats.steps >= 100, reward: { coins: 40 } },
  { id: 'trainer-5',    icon: '🤝', name: 'Rival Rumble',     desc: 'Defeat 5 trainers',                 check: s => s.stats.trainerWins >= 5, reward: { coins: 100 } },
  { id: 'trainer-20',   icon: '🏵️', name: 'People Person',    desc: 'Defeat 20 trainers',                check: s => s.stats.trainerWins >= 20, reward: { coins: 250, items: { 'Comfy Blanket': 1 } } },
  { id: 'rival-final',  icon: '😼', name: 'Rivals Forever',   desc: 'Win all 5 battles against Scree',   check: s => s.rival.fights >= 5, reward: { coins: 400 } },
  { id: 'tower-10',     icon: '🗼', name: 'Tower Climber',    desc: 'Reach floor 10 of the Scream Tower', check: s => s.tower.best >= 10, reward: { coins: 300 } },
  { id: 'tower-25',     icon: '🌋', name: 'Scream Ascendant', desc: 'Reach floor 25 of the Scream Tower', check: s => s.tower.best >= 25, reward: { coins: 800 } },
  { id: 'best-friends', icon: '💞', name: 'Best Friends',     desc: 'Max out an awawa\'s bond (100)',     check: s => s.party.some(m => (m.bond || 0) >= 100), reward: { coins: 150 } },
  { id: 'daily-first',  icon: '📅', name: 'Daily Screamer',   desc: 'Clear a Daily Scream Run',          check: s => !!s.daily.lastClearDate, reward: { coins: 150 } },
  { id: 'daily-streak', icon: '🔥', name: 'On a Roll',        desc: 'Reach a 3-day daily streak',        check: s => s.daily.streak >= 3, reward: { coins: 400 } },
  { id: 'tide-badge',   icon: '🌊', name: 'Isles Champion',   desc: 'Defeat Tidemother Naia',            check: s => !!s.badges.lagoon, reward: { coins: 500 } },
  { id: 'level-30',     icon: '📈', name: 'Personal Trainer', desc: 'Raise an awawa to level 30',        check: s => s.party.some(m => m.level >= 30), reward: { coins: 100 } },
  { id: 'full-party',   icon: '🎒', name: 'Full House',       desc: 'Have 6 awawas in your party',       check: s => s.party.length >= 6, reward: { items: { 'Big Snack': 1 } } },
];
