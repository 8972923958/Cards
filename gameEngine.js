// Game Engine - Core game logic and rules

const GameState = require('./gameState');
const cardData = require('./cardData');

class GameEngine {
  constructor() {
    this.games = new Map(); // gameId => GameState
    this.playerGames = new Map(); // playerId => gameId
  }

  // Create a new game
  createGame(player1Id, player2Id) {
    const gameState = new GameState(player1Id, player2Id);
    
    // Create and shuffle decks
    const deck1 = cardData.createDeck();
    const deck2 = cardData.createDeck();
    
    gameState.initializeDeck(player1Id, deck1);
    gameState.initializeDeck(player2Id, deck2);
    
    // Draw initial hands
    gameState.drawInitialHand(player1Id);
    gameState.drawInitialHand(player2Id);
    
    // Store game
    this.games.set(gameState.gameId, gameState);
    this.playerGames.set(player1Id, dataState.gameId);
    this.playerGames.set(player2Id, gameState.gameId);
    
    return gameState;
  }

  // Get game by ID
  getGame(gameId) {
    return this.games.get(gameId);
  }

  // Get game by player ID
  getGameByPlayer(playerId) {
    const gameId = this.playerGames.get(playerId);
    return gameId ? this.games.get(gameId) : null;
  }

  // Coin flip to decide who goes first
  coinFlip() {
    return Math.random() < 0.5 ? 'heads' : 'tails';
  }

  // Setup phase: opponent places optional side attacker/healer
  setupPhase(gameState, playerId) {
    gameState.currentPhase = 'setup';
    return {
      phase: 'setup',
      message: 'Opponent can place a side attacker or healer',
      canPlace: true
    };
  }

  // Start the game with first turn
  startGame(gameState, firstPlayerId) {
    gameState.currentTurn = firstPlayerId;
    gameState.currentPhase = 'main';
    gameState.turnCount = 1;
    
    return {
      gameId: gameState.gameId,
      firstPlayer: firstPlayerId,
      message: 'Game started! First player begins.'
    };
  }

  // Main phase: play cards
  playCard(gameState, playerId, cardId, targetInfo = null) {
    if (gameState.currentTurn !== playerId) {
      return { success: false, error: 'Not your turn' };
    }

    if (gameState.currentPhase !== 'main' && gameState.currentPhase !== 'setup') {
      return { success: false, error: 'Cannot play cards in this phase' };
    }

    const result = gameState.playCard(playerId, cardId);
    
    if (!result.success) {
      return result;
    }

    // If spell card, execute it
    if (result.action === 'executeSpell') {
      return this.executeSpell(gameState, playerId, result.card, targetInfo);
    }

    return result;
  }

  // Attack phase
  attack(gameState, playerId, attacker, defender) {
    if (gameState.currentTurn !== playerId) {
      return { success: false, error: 'Not your turn' };
    }

    if (gameState.currentPhase !== 'attack') {
      return { success: false, error: 'Not in attack phase' };
    }

    const result = gameState.attack(attacker, defender);
    
    if (result.success) {
      // Check win conditions after attack
      gameState.checkWinCondition();
    }

    return result;
  }

  // Execute spell card effect
  executeSpell(gameState, playerId, spell, targetInfo) {
    const player = gameState.getPlayer(playerId);
    const opponent = gameState.getOpponent(playerId);

    let result = { success: true, spell: spell.name };

    // Spell effects based on spell ID
    switch (spell.id) {
      case 'spell_1': // Power Surge
        if (targetInfo && targetInfo.cardLocation) {
          const targetCard = gameState.getCard(player, targetInfo);
          if (targetCard) {
            targetCard.atk += 40; // Temporary boost for this turn
            result.message = `${spell.name}: Increased attack by 40`;
          }
        }
        break;

      case 'spell_2': // Healing Light
        if (targetInfo && targetInfo.cardLocation) {
          const targetCard = gameState.getCard(player, targetInfo);
          if (targetCard) {
            targetCard.currentHp = Math.min(targetCard.currentHp + 50, targetCard.hp);
            result.message = `${spell.name}: Healed 50 HP`;
          }
        }
        break;

      case 'spell_3': // Fireball
        if (targetInfo && targetInfo.cardLocation) {
          const targetCard = gameState.getCard(opponent, targetInfo);
          if (targetCard) {
            const damage = 80;
            targetCard.currentHp -= damage;
            if (targetCard.currentHp <= 0) {
              gameState.sendCardToVoid(opponent, targetInfo);
              result.message = `${spell.name}: Dealt 80 damage. Card destroyed!`;
            } else {
              result.message = `${spell.name}: Dealt 80 damage`;
            }
          }
        }
        break;

      case 'spell_4': // Void Extraction
        if (player.voidZone.length > 0) {
          const card = player.voidZone.pop();
          player.hand.push(card);
          result.message = `${spell.name}: Retrieved ${card.name} from void`;
        }
        break;

      case 'spell_6': // Draw Force
        gameState.drawCard(playerId, 2);
        result.message = `${spell.name}: Drew 2 cards`;
        break;

      case 'spell_7': // Mass Heal
        if (player.board.mainAttacker) {
          player.board.mainAttacker.currentHp = Math.min(
            player.board.mainAttacker.currentHp + 30,
            player.board.mainAttacker.hp
          );
        }
        player.board.sideAttackers.forEach(card => {
          card.currentHp = Math.min(card.currentHp + 30, card.hp);
        });
        player.board.healers.forEach(card => {
          card.currentHp = Math.min(card.currentHp + 30, card.hp);
        });
        result.message = `${spell.name}: Healed all friendly units 30 HP`;
        break;

      default:
        result.message = `${spell.name} played`;
    }

    // Spell goes to void after use (unless effect says otherwise)
    player.voidZone.push(spell);

    gameState.checkWinCondition();
    return result;
  }

  // End turn
  endTurn(gameState, playerId) {
    if (gameState.currentTurn !== playerId) {
      return { success: false, error: 'Not your turn' };
    }

    gameState.endTurn();

    return {
      success: true,
      nextPlayer: gameState.currentTurn,
      message: 'Turn ended'
    };
  }

  // Surrender
  surrender(gameState, playerId) {
    const opponent = gameState.getOpponentId(playerId);
    gameState.endGame(opponent);

    return {
      success: true,
      winner: opponent,
      message: 'Game surrendered'
    };
  }

  // Get public game state for a player
  getGameState(gameState, playerId) {
    if (!gameState) {
      return { success: false, error: 'Game not found' };
    }

    return {
      success: true,
      state: gameState.getPublicState(playerId)
    };
  }

  // Delete game (cleanup)
  deleteGame(gameId) {
    const gameState = this.games.get(gameId);
    if (gameState) {
      this.playerGames.delete(gameState.player1Id);
      this.playerGames.delete(gameState.player2Id);
      this.games.delete(gameId);
    }
  }
}

module.exports = new GameEngine();

