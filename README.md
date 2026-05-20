# Trading Card Game

A two-player web-based trading card game with real-time multiplayer support using WebSockets.

## Game Rules

### Deck Composition (50 cards per player)
- **5 Attackers** - Main combat units
- **5 Side Attackers/Healers** - Support units
- **15 Trap Cards** - Defensive abilities
- **20 Spell Cards** - Special effects

### Game Mechanics

#### Species System
The game features 9 species with a rock-paper-scissors weakness system:
- Black Star
- Gold Star
- Blue Five Star
- Green Five Star
- VI Star
- Black Delta
- Red Delta
- Mega Delta
- Umni Delta

Each species is weak to one other species, creating a balanced combat system.

#### Card Types

**Attackers** - Main battlefield units
- Stats: HP, ATK (Attack), SH (Shield)
- Can be placed as main or side attackers
- Can toggle shield mode for defense

**Healers** - Support units
- Heal your main attacker and other units
- Have HP, ATK, and SH stats

**Spell Cards** - One-time effects
- Deal damage, heal, draw cards, revive cards from void
- Sent to void after use (unless persistent)
- Can target specific card types

**Trap Cards** - Triggered defenses
- Activate when opponent attacks
- Can send attacker to void, reflect damage, block attacks
- Remain on field until triggered

#### Turn Structure

1. **Setup Phase** - Each player places a main attacker
2. **Main Phase** - Play cards from hand
3. **Attack Phase** - Attack opponent's cards
4. **End Phase** - Draw 2 cards, end turn

#### Shield Mode
- Turn a card upside down to enter shield mode
- Use SH (shield) value instead of ATK for defense
- Reduces damage taken

#### Win Conditions
- Destroy all 5 of opponent's attackers
- Opponent runs out of cards in their deck

## Getting Started

### Prerequisites
- Node.js (v14+)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/8972923958/Cards.git
cd Cards
