// Card Data - All card definitions for the trading card game

const SPECIES = {
  BLACK_STAR: 'Black Star',
  GOLD_STAR: 'Gold Star',
  BLUE_FIVE_STAR: 'Blue Five Star',
  GREEN_FIVE_STAR: 'Green Five Star',
  VI_STAR: 'VI Star',
  BLACK_DELTA: 'Black Delta',
  RED_DELTA: 'Red Delta',
  MEGA_DELTA: 'Mega Delta',
  UMNI_DELTA: 'Umni Delta'
};

// Weakness relationships: species => weak to
const WEAKNESS_CHART = {
  [SPECIES.BLACK_STAR]: SPECIES.BLUE_FIVE_STAR,
  [SPECIES.GOLD_STAR]: SPECIES.BLACK_STAR,
  [SPECIES.BLUE_FIVE_STAR]: SPECIES.GOLD_STAR,
  [SPECIES.GREEN_FIVE_STAR]: SPECIES.VI_STAR,
  [SPECIES.VI_STAR]: SPECIES.BLACK_STAR,
  [SPECIES.BLACK_DELTA]: SPECIES.GREEN_FIVE_STAR,
  [SPECIES.RED_DELTA]: SPECIES.UMNI_DELTA,
  [SPECIES.MEGA_DELTA]: SPECIES.RED_DELTA,
  [SPECIES.UMNI_DELTA]: SPECIES.MEGA_DELTA
};

const CARD_TYPES = {
  ATTACKER: 'attacker',
  SIDE_ATTACKER: 'side_attacker',
  HEALER: 'healer',
  SPELL: 'spell',
  TRAP: 'trap'
};

// Attacker Cards (5 per deck)
const ATTACKERS = [
  {
    id: 'atk_1',
    name: 'Black Star Knight',
    type: CARD_TYPES.ATTACKER,
    species: SPECIES.BLACK_STAR,
    hp: 150,
    atk: 120,
    sh: 80,
    ability: 'Deal double damage to weak species'
  },
  {
    id: 'atk_2',
    name: 'Gold Star Warrior',
    type: CARD_TYPES.ATTACKER,
    species: SPECIES.GOLD_STAR,
    hp: 180,
    atk: 100,
    sh: 90,
    ability: 'Draw 1 card when attacking successfully'
  },
  {
    id: 'atk_3',
    name: 'Blue Five Star Guardian',
    type: CARD_TYPES.ATTACKER,
    species: SPECIES.BLUE_FIVE_STAR,
    hp: 160,
    atk: 110,
    sh: 100,
    ability: 'Reduce incoming damage by 20%'
  },
  {
    id: 'atk_4',
    name: 'Green Five Star Beast',
    type: CARD_TYPES.ATTACKER,
    species: SPECIES.GREEN_FIVE_STAR,
    hp: 140,
    atk: 130,
    sh: 70,
    ability: 'Heal 25 HP when dealing damage'
  },
  {
    id: 'atk_5',
    name: 'VI Star Mystic',
    type: CARD_TYPES.ATTACKER,
    species: SPECIES.VI_STAR,
    hp: 155,
    atk: 115,
    sh: 85,
    ability: 'Block next spell card played against you'
  }
];

// Side Attacker/Healer Cards (5 side attackers + 5 healers per deck)
const SIDE_ATTACKERS = [
  {
    id: 'side_1',
    name: 'Black Delta Scout',
    type: CARD_TYPES.SIDE_ATTACKER,
    species: SPECIES.BLACK_DELTA,
    hp: 80,
    atk: 60,
    sh: 50,
    ability: 'Can block one attack per turn'
  },
  {
    id: 'side_2',
    name: 'Red Delta Soldier',
    type: CARD_TYPES.SIDE_ATTACKER,
    species: SPECIES.RED_DELTA,
    hp: 90,
    atk: 70,
    sh: 55,
    ability: 'Reflect 15 damage to attacker'
  },
  {
    id: 'side_3',
    name: 'Mega Delta Protector',
    type: CARD_TYPES.SIDE_ATTACKER,
    species: SPECIES.MEGA_DELTA,
    hp: 100,
    atk: 65,
    sh: 70,
    ability: 'Protect main attacker from 50 damage'
  },
  {
    id: 'side_4',
    name: 'Umni Delta Ranger',
    type: CARD_TYPES.SIDE_ATTACKER,
    species: SPECIES.UMNI_DELTA,
    hp: 85,
    atk: 75,
    sh: 60,
    ability: 'Attack twice if species is Blue Five Star'
  },
  {
    id: 'side_5',
    name: 'Black Star Assassin',
    type: CARD_TYPES.SIDE_ATTACKER,
    species: SPECIES.BLACK_STAR,
    hp: 70,
    atk: 85,
    sh: 45,
    ability: 'Poison opponent attacker for 10 damage per turn'
  }
];

const HEALERS = [
  {
    id: 'heal_1',
    name: 'Gold Star Healer',
    type: CARD_TYPES.HEALER,
    species: SPECIES.GOLD_STAR,
    hp: 60,
    atk: 30,
    sh: 80,
    ability: 'Heal main attacker 50 HP'
  },
  {
    id: 'heal_2',
    name: 'Blue Five Star Medic',
    type: CARD_TYPES.HEALER,
    species: SPECIES.BLUE_FIVE_STAR,
    hp: 70,
    atk: 25,
    sh: 90,
    ability: 'Restore 40 HP to all friendly units'
  },
  {
    id: 'heal_3',
    name: 'Green Five Star Sage',
    type: CARD_TYPES.HEALER,
    species: SPECIES.GREEN_FIVE_STAR,
    hp: 65,
    atk: 35,
    sh: 75,
    ability: 'Heal 60 HP and grant shield +20'
  },
  {
    id: 'heal_4',
    name: 'VI Star Priest',
    type: CARD_TYPES.HEALER,
    species: SPECIES.VI_STAR,
    hp: 75,
    atk: 20,
    sh: 85,
    ability: 'Revive one card from void zone'
  },
  {
    id: 'heal_5',
    name: 'Red Delta Alchemist',
    type: CARD_TYPES.HEALER,
    species: SPECIES.RED_DELTA,
    hp: 55,
    atk: 40,
    sh: 70,
    ability: 'Heal 30 HP and draw 1 card'
  }
];

// Spell Cards (20 per deck)
const SPELLS = [
  {
    id: 'spell_1',
    name: 'Power Surge',
    type: CARD_TYPES.SPELL,
    cost: 0,
    effect: 'Increase target attacker attack by 40 for this turn'
  },
  {
    id: 'spell_2',
    name: 'Healing Light',
    type: CARD_TYPES.SPELL,
    cost: 0,
    effect: 'Heal target card 50 HP'
  },
  {
    id: 'spell_3',
    name: 'Fireball',
    type: CARD_TYPES.SPELL,
    cost: 0,
    effect: 'Deal 80 damage to target opponent attacker'
  },
  {
    id: 'spell_4',
    name: 'Void Extraction',
    type: CARD_TYPES.SPELL,
    cost: 0,
    effect: 'Take one card from void zone back to hand'
  },
  {
    id: 'spell_5',
    name: 'Shield Buff',
    type: CARD_TYPES.SPELL,
    cost: 0,
    effect: 'Increase shield value of target card by 30'
  },
  {
    id: 'spell_6',
    name: 'Draw Force',
    type: CARD_TYPES.SPELL,
    cost: 0,
    effect: 'Draw 2 cards'
  },
  {
    id: 'spell_7',
    name: 'Mass Heal',
    type: CARD_TYPES.SPELL,
    cost: 0,
    effect: 'Heal all friendly units 30 HP'
  },
  {
    id: 'spell_8',
    name: 'Weakness Strike',
    type: CARD_TYPES.SPELL,
    cost: 0,
    effect: 'Deal 100 damage if target is weak to your attacker species'
  },
  {
    id: 'spell_9',
    name: 'Redirect Damage',
    type: CARD_TYPES.SPELL,
    cost: 0,
    effect: 'Redirect incoming attack to opponent side attacker'
  },
  {
    id: 'spell_10',
    name: 'Resurrection',
    type: CARD_TYPES.SPELL,
    cost: 0,
    effect: 'Revive target attacker from void zone, stays in void if killed again'
  },
  {
    id: 'spell_11',
    name: 'Double Strike',
    type: CARD_TYPES.SPELL,
    cost: 0,
    effect: 'Target attacker can attack twice this turn'
  },
  {
    id: 'spell_12',
    name: 'Temporal Freeze',
    type: CARD_TYPES.SPELL,
    cost: 0,
    effect: 'Opponent cannot play cards next turn'
  },
  {
    id: 'spell_13',
    name: 'Poison Cloud',
    type: CARD_TYPES.SPELL,
    cost: 0,
    effect: 'Target attacker takes 20 damage at end of opponent turn for 3 turns'
  },
  {
    id: 'spell_14',
    name: 'Fortify',
    type: CARD_TYPES.SPELL,
    cost: 0,
    effect: 'Negate next spell card played against you'
  },
  {
    id: 'spell_15',
    name: 'Life Drain',
    type: CARD_TYPES.SPELL,
    cost: 0,
    effect: 'Deal 50 damage to opponent attacker and heal you 50 HP'
  },
  {
    id: 'spell_16',
    name: 'Card Swap',
    type: CARD_TYPES.SPELL,
    cost: 0,
    effect: 'Exchange position of two cards on your field'
  },
  {
    id: 'spell_17',
    name: 'Meteor Strike',
    type: CARD_TYPES.SPELL,
    cost: 0,
    effect: 'Deal 60 damage to target card'
  },
  {
    id: 'spell_18',
    name: 'Restoration Circle',
    type: CARD_TYPES.SPELL,
    cost: 0,
    effect: 'Restore 30 HP to all friendly cards'
  },
  {
    id: 'spell_19',
    name: 'Weakness Amplifier',
    type: CARD_TYPES.SPELL,
    cost: 0,
    effect: 'Next attack deals double damage to weak species'
  },
  {
    id: 'spell_20',
    name: 'Void Collapse',
    type: CARD_TYPES.SPELL,
    cost: 0,
    effect: 'Remove all cards from both void zones'
  }
];

// Trap Cards (15 per deck)
const TRAPS = [
  {
    id: 'trap_1',
    name: 'Species Barrier',
    type: CARD_TYPES.TRAP,
    effect: 'If opponent attacker is Black Star, send to void'
  },
  {
    id: 'trap_2',
    name: 'Damage Reflection',
    type: CARD_TYPES.TRAP,
    effect: 'Reflect 25 damage back to attacking card'
  },
  {
    id: 'trap_3',
    name: 'Counter Strike',
    type: CARD_TYPES.TRAP,
    effect: 'When attacked, deal 40 damage to attacker'
  },
  {
    id: 'trap_4',
    name: 'Void Warp',
    type: CARD_TYPES.TRAP,
    effect: 'Send attacking card to void instead of dealing damage'
  },
  {
    id: 'trap_5',
    name: 'Block Spell',
    type: CARD_TYPES.TRAP,
    effect: 'Negate any spell card played against you'
  },
  {
    id: 'trap_6',
    name: 'Weakness Exploit',
    type: CARD_TYPES.TRAP,
    effect: 'If opponent attacker is weak to Blue Five Star, send to void'
  },
  {
    id: 'trap_7',
    name: 'Heal on Attack',
    type: CARD_TYPES.TRAP,
    effect: 'Heal 50 HP when this card is attacked'
  },
  {
    id: 'trap_8',
    name: 'Poison Thorns',
    type: CARD_TYPES.TRAP,
    effect: 'Attacking card takes 15 damage after attacking'
  },
  {
    id: 'trap_9',
    name: 'Mass Damage',
    type: CARD_TYPES.TRAP,
    effect: 'Deal 30 damage to all opponent cards when activated'
  },
  {
    id: 'trap_10',
    name: 'Invulnerability',
    type: CARD_TYPES.TRAP,
    effect: 'This card cannot be damaged for one turn'
  },
  {
    id: 'trap_11',
    name: 'Card Drain',
    type: CARD_TYPES.TRAP,
    effect: 'Opponent discards one card from hand when attacking'
  },
  {
    id: 'trap_12',
    name: 'Stun Trap',
    type: CARD_TYPES.TRAP,
    effect: 'Attacking card cannot attack next turn'
  },
  {
    id: 'trap_13',
    name: 'Golden Shield',
    type: CARD_TYPES.TRAP,
    effect: 'Increase shield value by 50 when activated'
  },
  {
    id: 'trap_14',
    name: 'Weak Species Killer',
    type: CARD_TYPES.TRAP,
    effect: 'If opponent attacker is Gold Star, send to void'
  },
  {
    id: 'trap_15',
    name: 'Perfect Defense',
    type: CARD_TYPES.TRAP,
    effect: 'Negate all damage from next attack'
  }
];

// Function to create a shuffled deck
function createDeck() {
  const deck = [];
  
  // Add all card types
  deck.push(...ATTACKERS);
  deck.push(...SIDE_ATTACKERS);
  deck.push(...HEALERS);
  deck.push(...SPELLS);
  deck.push(...TRAPS);
  
  // Shuffle the deck
  return shuffleDeck([...deck]);
}

// Fisher-Yates shuffle algorithm
function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

module.exports = {
  SPECIES,
  CARD_TYPES,
  WEAKNESS_CHART,
  ATTACKERS,
  SIDE_ATTACKERS,
  HEALERS,
  SPELLS,
  TRAPS,
  createDeck,
  shuffleDeck
};
const ATTACKERS = [
  {
    id: 'att_1',
    name: 'Card Name',
    species: SPECIES.BLACK_STAR,
    hp: 150,
    atk: 100,
    sh: 80,
    ability: 'Special ability description'
  },
  // Add more cards...
];

