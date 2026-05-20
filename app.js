const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const GameState = require('./gameState');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files
app.use(express.static(path.join(__dirname, '../client')));

// Game instances
const games = {}; // gameId -> GameState
const playerSockets = {}; // playerId -> WebSocket

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('New WebSocket connection');

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      handleMessage(ws, message);
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    // Handle player disconnect
    for (const [playerId, socket] of Object.entries(playerSockets)) {
      if (socket === ws) {
        delete playerSockets[playerId];
        break;
      }
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

function handleMessage(ws, message) {
  const { type, playerId, gameId, payload } = message;

  switch (type) {
    case 'join_game':
      handleJoinGame(ws, playerId, gameId);
      break;
    case 'draw_cards':
      handleDrawCards(playerId, gameId, payload.count);
      break;
    case 'play_card':
      handlePlayCard(playerId, gameId, payload.cardId, payload.targetData);
      break;
    case 'toggle_shield':
      handleToggleShield(playerId, gameId, payload.cardId);
      break;
    case 'attack':
      handleAttack(playerId, gameId, payload.attackerCardId, payload.defenderId, payload.targetCardId);
      break;
    case 'end_turn':
      handleEndTurn(playerId, gameId);
      break;
    case 'get_game_state':
      handleGetGameState(playerId, gameId);
      break;
    default:
      console.log('Unknown message type:', type);
  }
}

function handleJoinGame(ws, playerId, gameId) {
  playerSockets[playerId] = ws;

  if (!games[gameId]) {
    // Create new game (playerId is player1)
    const player2Id = `opponent_${Date.now()}`;
    games[gameId] = new GameState(playerId, player2Id);
    
    // Draw initial 6 cards for player1
    const game = games[gameId];
    game.drawCards(playerId, 6);

    ws.send(JSON.stringify({
      type: 'game_joined',
      gameId,
      playerId,
      isPlayer1: true,
      initialHand: game.players[playerId].hand
    }));
  } else {
    // Join existing game (playerId is player2)
    const game = games[gameId];
    const player1Id = game.player1Id;
    game.player2Id = playerId;

    // Draw initial 6 cards for player2
    game.drawCards(playerId, 6);

    // Notify both players
    ws.send(JSON.stringify({
      type: 'game_joined',
      gameId,
      playerId,
      isPlayer1: false,
      initialHand: game.players[playerId].hand
    }));

    if (playerSockets[player1Id]) {
      playerSockets[player1Id].send(JSON.stringify({
        type: 'opponent_joined',
        gameId,
        opponentId: playerId
      }));
    }
  }
}

function handleDrawCards(playerId, gameId, count) {
  const game = games[gameId];
  if (!game) return;

  game.drawCards(playerId, count);
  broadcastGameState(gameId);
}

function handlePlayCard(playerId, gameId, cardId, targetData) {
  const game = games[gameId];
  if (!game) return;

  const result = game.playCard(playerId, cardId, targetData);
  
  if (result.success) {
    broadcastGameState(gameId);
  } else {
    const socket = playerSockets[playerId];
    if (socket) {
      socket.send(JSON.stringify({
        type: 'play_card_error',
        error: result.error
      }));
    }
  }
}

function handleToggleShield(playerId, gameId, cardId) {
  const game = games[gameId];
  if (!game) return;

  const result = game.toggleShieldMode(playerId, cardId);
  
  if (result.success) {
    broadcastGameState(gameId);
  }
}

function handleAttack(playerId, gameId, attackerCardId, defenderId, targetCardId) {
  const game = games[gameId];
  if (!game) return;

  const result = game.attack(playerId, attackerCardId, defenderId, targetCardId);
  
  if (result.success) {
    broadcastGameState(gameId);

    // Notify both players of attack
    broadcastToGame(gameId, {
      type: 'attack_result',
      damage: result.damage,
      attackerName: result.attackerName,
      defenderName: result.defenderName,
      defenderHp: result.defenderHp,
      killed: result.killed || false
    });

    if (game.gameOver) {
      broadcastToGame(gameId, {
        type: 'game_over',
        winner: game.winner
      });
    }
  }
}

function handleEndTurn(playerId, gameId) {
  const game = games[gameId];
  if (!game) return;

  // Only the current player can end their turn
  if (game.currentTurn !== playerId) {
    return;
  }

  game.endTurn();

  // Draw 2 cards for the next player
  const nextPlayer = game.currentTurn;
  game.drawCards(nextPlayer, 2);

  broadcastGameState(gameId);
}

function handleGetGameState(playerId, gameId) {
  const game = games[gameId];
  if (!game) return;

  const socket = playerSockets[playerId];
  if (socket) {
    socket.send(JSON.stringify({
      type: 'game_state',
      state: game.getGameState(playerId)
    }));
  }
}

function broadcastToGame(gameId, message) {
  const game = games[gameId];
  if (!game) return;

  const player1Socket = playerSockets[game.player1Id];
  const player2Socket = playerSockets[game.player2Id];

  if (player1Socket) player1Socket.send(JSON.stringify(message));
  if (player2Socket) player2Socket.send(JSON.stringify(message));
}

function broadcastGameState(gameId) {
  const game = games[gameId];
  if (!game) return;

  broadcastToGame(gameId, {
    type: 'game_state_update',
    currentTurn: game.currentTurn,
    currentPhase: game.currentPhase,
    gameOver: game.gameOver,
    winner: game.winner
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
