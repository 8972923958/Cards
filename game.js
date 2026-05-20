// Trading Card Game Client

class CardGameClient {
  constructor() {
    this.ws = null;
    this.playerId = null;
    this.gameId = null;
    this.gameState = null;
    this.isYourTurn = false;

    this.initializeEventListeners();
    this.connectWebSocket();
  }

  initializeEventListeners() {
    // Button events
    document.getElementById('drawCardsBtn').addEventListener('click', () => this.drawCards());
    document.getElementById('endTurnBtn').addEventListener('click', () => this.endTurn());

    // Modal close
    document.querySelector('.close').addEventListener('click', () => this.closeModal());
  }

  connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const url = `${protocol}://${window.location.host}`;

    this.ws = new WebSocket(url);

    this.ws.addEventListener('open', () => {
      this.log('Connected to game server');
      this.joinGame();
    });

    this.ws.addEventListener('message', (event) => {
      this.handleMessage(JSON.parse(event.data));
    });

    this.ws.addEventListener('error', (error) => {
      this.log(`WebSocket error: ${error}`);
      document.getElementById('playerStatus').textContent = 'Connection error';
    });

    this.ws.addEventListener('close', () => {
      this.log('Disconnected from server');
      document.getElementById('playerStatus').textContent = 'Disconnected';
    });
  }

  joinGame() {
    this.playerId = `player_${Date.now()}`;
    this.gameId = 'game_' + Math.random().toString(36).substr(2, 9);

    this.send({
      type: 'join_game',
      playerId: this.playerId,
      gameId: this.gameId
    });

    document.getElementById('playerStatus').textContent = `Player ID: ${this.playerId}`;
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  handleMessage(message) {
    switch (message.type) {
      case 'game_joined':
        this.onGameJoined(message);
        break;
      case 'opponent_joined':
        this.onOpponentJoined(message);
        break;
      case 'game_state':
        this.onGameState(message);
        break;
      case 'game_state_update':
        this.onGameStateUpdate(message);
        break;
      case 'attack_result':
        this.onAttackResult(message);
        break;
      case 'game_over':
        this.onGameOver(message);
        break;
      case 'play_card_error':
        this.log(`Error: ${message.error}`, 'error');
        break;
    }
  }

  onGameJoined(message) {
    this.gameId = message.gameId;
    this.log(`Game joined! Game ID: ${message.gameId}`);
    
    if (message.isPlayer1) {
      this.log('You are Player 1. Waiting for opponent...');
    } else {
      this.log('You are Player 2. Game starting!');
      this.startGame();
    }

    this.displayHand(message.initialHand);
  }

  onOpponentJoined(message) {
    this.log('Opponent joined! Game starting!');
    this.startGame();
  }

  startGame() {
    this.getGameState();
  }

  onGameState(message) {
    this.gameState = message.state;
    this.updateUI();
  }

  onGameStateUpdate(message) {
    if (this.gameState) {
      this.gameState.currentTurn = message.currentTurn;
      this.gameState.currentPhase = message.currentPhase;
      this.gameState.gameOver = message.gameOver;
      this.gameState.winner = message.winner;
    }
    this.updateUI();
  }

  onAttackResult(message) {
    this.log(
      `${message.attackerName} dealt ${message.damage} damage to ${message.defenderName}! (${message.defenderHp} HP remaining)`,
      message.killed ? 'danger' : 'damage'
    );

    if (message.killed) {
      this.log(`${message.defenderName} has been defeated!`, 'danger');
    }
  }

  onGameOver(message) {
    const isYouTheWinner = message.winner === this.playerId;
    if (isYouTheWinner) {
      this.log('YOU WIN!', 'damage');
      alert('Congratulations! You won the game!');
    } else {
      this.log('YOU LOST!', 'damage');
      alert('Game Over! Your opponent won.');
    }
  }

  getGameState() {
    this.send({
      type: 'get_game_state',
      playerId: this.playerId,
      gameId: this.gameId
    });
  }

  drawCards() {
    if (!this.isYourTurn) {
      this.log('It is not your turn!');
      return;
    }

    this.send({
      type: 'draw_cards',
      playerId: this.playerId,
      gameId: this.gameId,
      payload: { count: 2 }
    });
  }

  playCard(cardId, targetData = {}) {
    this.send({
      type: 'play_card',
      playerId: this.playerId,
      gameId: this.gameId,
      payload: {
        cardId,
        targetData
      }
    });
  }

  toggleShield(cardId) {
    this.send({
      type: 'toggle_shield',
      playerId: this.playerId,
      gameId: this.gameId,
      payload: { cardId }
    });
  }

  attack(attackerCardId, defenderId, targetCardId) {
    this.send({
      type: 'attack',
      playerId: this.playerId,
      gameId: this.gameId,
      payload: {
        attackerCardId,
        defenderId,
        targetCardId
      }
    });
  }

  endTurn() {
    this.send({
      type: 'end_turn',
      playerId: this.playerId,
      gameId: this.gameId
    });
  }

  updateUI() {
    if (!this.gameState) return;

    this.isYourTurn = this.gameState.currentTurn === this.playerId;

    // Update turn info
    const turnInfo = document.getElementById('turnInfo');
    if (this.isYourTurn) {
      turnInfo.textContent = '✓ YOUR TURN';
      turnInfo.style.color = '#27ae60';
      document.getElementById('endTurnBtn').disabled = false;
      document.getElementById('drawCardsBtn').disabled = false;
    } else {
      turnInfo.textContent = 'Opponent\'s Turn';
      turnInfo.style.color = '#e74c3c';
      document.getElementById('endTurnBtn').disabled = true;
      document.getElementById('drawCardsBtn').disabled = true;
    }

    // Update your board
    this.updateYourBoard();

    // Update opponent board
    this.updateOpponentBoard();

    // Game over check
    if (this.gameState.gameOver) {
      document.getElementById('endTurnBtn').disabled = true;
    }
  }

  updateYourBoard() {
    const you = this.gameState.you;

    // Main attacker
    const mainAttackerContainer = document.getElementById('yourMainAttacker');
    mainAttackerContainer.innerHTML = '';
    if (you.mainAttacker) {
      mainAttackerContainer.appendChild(this.createCardElement(you.mainAttacker, true));
    } else {
      mainAttackerContainer.innerHTML = '<span>Place Main Attacker</span>';
    }

    // Side attackers
    this.updateCardContainer('yourSideAttackers', you.sideAttackers);

    // Healers
    this.updateCardContainer('yourHealers', you.healers);

    // Traps
    this.updateCardContainer('yourTraps', you.traps);

    // Deck info
    document.getElementById('yourDeckCount').textContent = you.deckCount;

    // Void
    this.updateCardContainer('yourVoid', you.void);
  }

  updateOpponentBoard() {
    const opponent = this.gameState.opponent;

    // Main attacker (opponent)
    const opponentMainContainer = document.getElementById('opponentMainAttacker');
    opponentMainContainer.innerHTML = '';
    if (opponent.mainAttacker) {
      const card = document.createElement('div');
      card.className = 'card main-attacker opponent-card';
      card.innerHTML = `
        <div class="card-name">${opponent.mainAttacker.name}</div>
        <div class="card-stats">
          <div class="stat">
            <div class="stat-label">HP</div>
            <div class="stat-value">${opponent.mainAttacker.hp || '?'}</div>
          </div>
        </div>
      `;
      opponentMainContainer.appendChild(card);
    } else {
      opponentMainContainer.innerHTML = '<span style="color: red;">No Main Attacker</span>';
    }

    // Deck info
    document.getElementById('opponentDeckCount').textContent = opponent.deckCount;
  }

  updateCardContainer(containerId, cards) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    cards.forEach(card => {
      container.appendChild(this.createCardElement(card));
    });
  }

  createCardElement(card, isMainAttacker = false) {
    const cardEl = document.createElement('div');
    cardEl.className = `card ${card.type}`;
    if (card.shieldMode) {
      cardEl.classList.add('shield-mode');
    }

    const stats = card.hp && card.atk && card.sh ? `
      <div class="card-stats">
        <div class="stat">
          <div class="stat-label">HP</div>
          <div class="stat-value">${card.hp}</div>
        </div>
        <div class="stat">
          <div class="stat-label">ATK</div>
          <div class="stat-value">${card.atk}</div>
        </div>
        <div class="stat">
          <div class="stat-label">SH</div>
          <div class="stat-value">${card.sh}</div>
        </div>
      </div>
    ` : '';

    const ability = card.ability ? `<div class="card-ability">${card.ability}</div>` : '';
    const effect = card.effect ? `<div class="card-ability">${card.effect}</div>` : '';

    cardEl.innerHTML = `
      <div class="card-name">${card.name}</div>
      ${stats}
      ${ability}
      ${effect}
    `;

    // Add click handlers
    cardEl.addEventListener('click', () => {
      this.showCardDetails(card);
    });

    // Draggable for hand cards
    if (this.gameState && this.gameState.you.hand.includes(card) && this.isYourTurn) {
      cardEl.draggable = true;
      cardEl.addEventListener('dragstart', (e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('cardId', card.cardId);
      });
    }

    return cardEl;
  }

  displayHand(hand) {
    const handContainer = document.getElementById('yourHand');
    handContainer.innerHTML = '';
    
    hand.forEach(card => {
      const cardEl = this.createCardElement(card);
      cardEl.className += ' hand-card';
      
      // Make hand cards draggable
      cardEl.draggable = true;
      cardEl.addEventListener('dragstart', (e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('cardId', card.cardId);
      });

      // Drop zones
      ['yourMainAttacker', 'yourSideAttackers', 'yourHealers', 'yourTraps'].forEach(zoneId => {
        const zone = document.getElementById(zoneId);
        if (zone) {
          zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            zone.style.opacity = '0.7';
          });
          zone.addEventListener('dragleave', (e) => {
            zone.style.opacity = '1';
          });
          zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.style.opacity = '1';
            const cardId = parseInt(e.dataTransfer.getData('cardId'));
            this.playCard(cardId);
          });
        }
      });

      handContainer.appendChild(cardEl);
    });
  }

  showCardDetails(card) {
    const modal = document.getElementById('cardModal');
    const details = document.getElementById('cardDetails');

    let html = `<h2>${card.name}</h2>`;
    if (card.species) html += `<p><strong>Species:</strong> ${card.species}</p>`;
    if (card.hp) html += `<p><strong>HP:</strong> ${card.hp}</p>`;
    if (card.atk) html += `<p><strong>ATK:</strong> ${card.atk}</p>`;
    if (card.sh) html += `<p><strong>Shield:</strong> ${card.sh}</p>`;
    if (card.ability) html += `<p><strong>Ability:</strong> ${card.ability}</p>`;
    if (card.effect) html += `<p><strong>Effect:</strong> ${card.effect}</p>`;

    details.innerHTML = html;
    modal.style.display = 'block';
  }

  closeModal() {
    document.getElementById('cardModal').style.display = 'none';
  }

  log(message, type = 'info') {
    const logContent = document.querySelector('.log-content');
    const p = document.createElement('p');
    p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    if (type) p.className = type;
    logContent.appendChild(p);
    logContent.scrollTop = logContent.scrollHeight;
  }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
  new CardGameClient();
});
