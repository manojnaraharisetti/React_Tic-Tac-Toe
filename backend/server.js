const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid'); // Import the uuid module

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let games = {};

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    const { type, payload } = data;

    switch (type) {
      case 'create-game':
        const roomId = uuidv4(); // Generate a unique room ID
        games[roomId] = { board: Array(9).fill(''), turn: 'X', players: [{ ws, name: payload.name }], state: 'waiting' };
        ws.send(JSON.stringify({ type: 'game-created', payload: { roomId } }));
        break;
      case 'join-game':
        const game = games[payload.roomId];
        if (game && game.state === 'waiting') {
          game.players.push({ ws, name: payload.name });
          game.state = 'playing';
          game.players.forEach(player => player.ws.send(JSON.stringify({ type: 'start-game', payload: { roomId: payload.roomId, board: game.board, turn: game.turn, players: game.players.map(p => p.name) } })));
        } else {
          ws.send(JSON.stringify({ type: 'error', payload: 'Game not found or already started' }));
        }
        break;
      case 'make-move':
        const currentGame = games[payload.roomId];
        if (currentGame && currentGame.turn === payload.turn && currentGame.board[payload.index] === '') {
          currentGame.board[payload.index] = payload.turn;
          currentGame.turn = currentGame.turn === 'X' ? 'O' : 'X';
          currentGame.players.forEach(player => player.ws.send(JSON.stringify({ type: 'move-made', payload: { board: currentGame.board, turn: currentGame.turn } })));
        }
        break;
    }
  });

  ws.on('close', () => {
    // Handle player disconnection, clean up game state if necessary
  });
});

server.listen(1420, () => {
  console.log('Server is listening on port 1420');
});
