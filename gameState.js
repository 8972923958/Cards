// Game State Management
const { v4: uuidv4 } = require('uuid');

class GameState {
  constructor(player1Id, player2Id) {
    this.gameId = uuidv4();
    this.player1Id = player1Id;
    this.player2Id = player2Id;
    
    // Game phase: 'setup', 'main', 'attack', 'defense', 'end'
    this.currentPhase = 'setup';
    this.currentTurn = null; // Will be set after coin flip
    
    // Player states
    this.players = {
      [player1Id]: {
        id: player1Id,
        hand: [],
        deck: [],
        deckCount: 50,
        voidZone: [],
        
        // Board state
        board: {
          mainAttacker: null,
          sideAttackers: [], // max 5
          healers: [], // max 5
          trapCards: [] // max 15
        },
        
        // Game stats
        hp: 100,
        maxHp: 100
      },
      [player2Id]: {
        id: player2Id,
        hand: [],
        deck: [],
        deckCount: 50,
        voidZone: [],
        
        board: {
          mainAttacker: null,
          sideAttackers: [],
          healers: [],
          trapCards: []
        },
        
        hp: 100,
        maxHp: 100
      }
    };
    
    this.turnCount = 0;
    this.gameOver = false;
    this.winner = null;
  }

  // Get player by ID
  getPlayer(playerId) {
    return this.players[playerId];
  }

  // Get opponent ID
  getOpponentId(playerId) {
    return playerId === this.player1Id ? this.player2Id : this.player1Id;
  }

  // Get opponent state
  getOpponent(playerId) {
    return this.getPlayer(this.getOpponentId(playerId));
  }

  // Initialize decks and hands
  initializeDeck(playerId, shuffledDeck) {
    const player = this.getPlayer(playerId);
    player.deck = shuffledDeck;
    player.deckCount = shuffledDeck.length;
  }

  // Draw cards for initial hand
  drawInitialHand(playerId, count = 6) {
    const player = this.getPlayer(playerId);
    for (let i = 0; i < count && player.deck.length > 0; i++) {
      player.hand.push(player.deck.pop());
      player.deckCount--;
    }
  }

  // Draw card during game
  drawCard(playerId, count = 1) {
    const player = this.getPlayer(playerId);
    const drawn = [];
    
    for (let i = 0; i < count && player.deck.length > 0; i++) {
      const card = player.deck.pop();
      player.hand.push(card);
      player.deckCount--;
      drawn.push(card);
    }
    
    // Check if deck is empty - opponent wins
    if (player.deck.length === 0 && player.hand.length === 0) {
      this.endGame(this.getOpponentId(playerId));
    }
    
    return drawn;
  }

  // Play card from hand to board
  playCard(playerId, cardId, position = null) {
    const player = this.getPlayer(playerId);
    const cardIndex = player.hand.findIndex(c => c.id === cardId);
    
    if (cardIndex === -1) {
      return { success: false, error: 'Card not in hand' };
    }

    const card = player.hand[cardIndex];

    // Validate card placement based on type
    switch (card.type) {
      case 'attacker':
        if (player.board.mainAttacker) {
          return { success: false, error: 'Main attacker already placed' };
        }
        player.board.mainAttacker = { ...card, currentHp: card.hp, isShielded: false };
        player.hand.splice(cardIndex, 1);
        return { success: true, card, position: 'mainAttacker' };

      case 'side_attacker':
      case 'healer':
        const containerKey = card.type === 'side_attacker' ? 'sideAttackers' : 'healers';
        if (player.board[containerKey].length >= 5) {
          return { success: false, error: `Maximum 5 ${containerKey} allowed` };
        }
        const placedCard = { ...card, currentHp: card.hp, isShielded: false };
        player.board[containerKey].push(placedCard);
        player.hand.splice(cardIndex, 1);
        return { success: true, card: placedCard, position: containerKey };

      case 'spell':
        // Spell card - needs to be played and executed immediately
        player.hand.splice(cardIndex, 1);
        return { success: true, card, action: 'executeSpell' };

      case 'trap':
        if (player.board.trapCards.length >= 15) {
          return { success: false, error: 'Maximum 15 trap cards allowed' };
        }
        const trapCard = { ...card, isActive: true };
        player.board.trapCards.push(trapCard);
        player.hand.splice(cardIndex, 1);
        return { success: true, card: trapCard, position: 'trapCards' };

      default:
        return { success: false, error: 'Unknown card type' };
    }
  }

  // Toggle shield mode on a card
  toggleShield(playerId, cardLocation, cardIndex) {
    const player = this.getPlayer(playerId);
    
    if (!player.board[cardLocation] || !player.board[cardLocation][cardIndex]) {
      return { success: false, error: 'Card not found' };
    }

    const card = player.board[cardLocation][cardIndex];
    card.isShielded = !card.isShielded;
    
    return { success: true, card, isShielded: card.isShielded };
  }

  // Attack with a card
  attack(attacker, defender) {
    // attacker = { playerId, cardLocation, cardIndex }
    // defender = { playerId, cardLocation, cardIndex }
    
    const attackerPlayer = this.getPlayer(attacker.playerId);
    const defenderPlayer = this.getPlayer(defender.playerId);
    
    const attackerCard = this.getCard(attackerPlayer, attacker);
    const defenderCard = this.getCard(defenderPlayer, defender);
    
    if (!attackerCard || !defenderCard) {
      return { success: false, error: 'Card not found' };
    }

    // Calculate damage
    let damage = attackerCard.isShielded ? attackerCard.sh : attackerCard.atk;
    
    // Apply weakness bonus (2x damage to weak species)
    if (this.isWeakTo(defenderCard.species, attackerCard.species)) {
      damage *= 2;
    }

    // Apply shield reduction
    let defense = defenderCard.isShielded ? defenderCard.sh : defenderCard.atk;
    let finalDamage = Math.max(0, damage - defense);

    // Deal damage
    defenderCard.currentHp -= finalDamage;

    // Check if card is destroyed
    let isDestroyed = false;
    if (defenderCard.currentHp <= 0) {
      isDestroyed = true;
      this.sendCardToVoid(defenderPlayer, defender);
    }

    return {
      success: true,
      damage: finalDamage,
      defenderHp: defenderCard.currentHp,
      isDestroyed
    };
  }

  // Get card from player's board
  getCard(player, location) {
    if (location.cardLocation === 'mainAttacker') {
      return player.board.mainAttacker;
    }
    return player.board[location.cardLocation]?.[location.cardIndex];
  }

  // Check if defender species is weak to attacker species
  isWeakTo(defenderSpecies, attackerSpecies) {
    const { WEAKNESS_CHART } = require('./cardData');
    return WEAKNESS_CHART[defenderSpecies] === attackerSpecies;
  }

  // Send card to void zone
  sendCardToVoid(player, location) {
    if (location.cardLocation === 'mainAttacker') {
      player.board.mainAttacker = null;
    } else {
      player.board[location.cardLocation].splice(location.cardIndex, 1);
    }
    // Note: void zone tracking can be added if needed
  }

  // Execute spell card effect
  executeSpell(playerId, spell, target) {
    // This would be implemented based on specific spell effects
    // For now, returning a template
    return { success: true, spell, target };
  }

  // Check win conditions
  checkWinCondition() {
    // Check if player 1 has no main attacker
    if (!this.players[this.player1Id].board.mainAttacker) {
      this.endGame(this.player2Id);
      return;
    }

    // Check if player 2 has no main attacker
    if (!this.players[this.player2Id].board.mainAttacker) {
      this.endGame(this.player1Id);
      return;
    }

    // Check if a player has no cards left in deck
    const player1OutOfCards = this.players[this.player1Id].deck.length === 0 && 
                               this.players[this.player1Id].hand.length === 0;
    const player2OutOfCards = this.players[this.player2Id].deck.length === 0 && 
                               this.players[this.player2Id].hand.length === 0;

    if (player1OutOfCards) {
      this.endGame(this.player2Id);
      return;
    }

    if (player2OutOfCards) {
      this.endGame(this.player1Id);
      return;
    }
  }

  // End game
  endGame(winnerId) {
    this.gameOver = true;
    this.winner = winnerId;
  }

  // Start new turn
  startTurn() {
    this.turnCount++;
    this.currentTurn = this.turnCount % 2 === 1 ? this.player1Id : this.player2Id;
    this.currentPhase = 'main';
    
    // Draw 2 cards at start of turn
    this.drawCard(this.currentTurn, 2);
  }

  // End current turn
  endTurn() {
    const nextPlayer = this.getOpponentId(this.currentTurn);
    this.currentTurn = nextPlayer;
    this.currentPhase = 'main';
    this.startTurn();
  }

  // Get game state for a specific player (sanitized)
  getPublicState(playerId) {
    const player = this.getPlayer(playerId);
    const opponent = this.getOpponent(playerId);

    return {
      gameId: this.gameId,
      currentPhase: this.currentPhase,
      currentTurn: this.currentTurn,
      isYourTurn: this.currentTurn === playerId,
      gameOver: this.gameOver,
      winner: this.winner,
      
      you: {
        hand: player.hand,
        handCount: player.hand.length,
        deckCount: player.deckCount,
        hp: player.hp,
        board: player.board,
        voidZone: player.voidZone
      },
      
      opponent: {
        handCount: opponent.hand.length,
        deckCount: opponent.deckCount,
        hp: opponent.hp,
        board: opponent.board, // Opponent cards are visible
        voidZone: opponent.voidZone
      }
    };
  }
}

module.exports = GameState;

