import React, { useState, useEffect, useRef } from "react";
import Box from './components/Box';
import Message from "./components/Message";
import "./App.css";

const winPatterns = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

function App() {
  const [board, setBoard] = useState(Array(9).fill(""));
  const [currentTurn, setCurrentTurn] = useState("X");
  const [message, setMessage] = useState("");
  const [isGameActive, setIsGameActive] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState("");
  const [players, setPlayers] = useState([]);
  const [playerTurns, setPlayerTurns] = useState({ X: "", O: "" });
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:1420");

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const { type, payload } = data;

      switch (type) {
        case "game-created":
          setRoomId(payload.roomId);
          setMessage(`Room created. Share this room ID: ${payload.roomId}`);
          setPlayerTurns({ X: name, O: "" });
          break;
        case "start-game":
          setBoard(payload.board);
          setCurrentTurn(payload.turn);
          setIsGameActive(true);
          setMessage(`Game started. Players: ${payload.players.join(", ")}`);
          setPlayers(payload.players);
          setPlayerTurns({ X: payload.players[0], O: payload.players[1] });
          break;
        case "move-made":
          setBoard(payload.board);
          setCurrentTurn(payload.turn);
          checkWinner(payload.board, payload.turn === "X" ? "O" : "X");
          break;
        case "error":
          setMessage(payload);
          break;
      }
    };

    ws.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.current.close();
    };
  }, [name]);

  const handleBoxClick = (index) => {
    if (!board[index] && isGameActive && ((players[0] === name && currentTurn === "X") || (players[1] === name && currentTurn === "O"))) {
      ws.current.send(JSON.stringify({ type: "make-move", payload: { roomId, index, turn: currentTurn } }));
    }
  };

  const createGame = () => {
    if (name) {
      ws.current.send(JSON.stringify({ type: "create-game", payload: { name } }));
    } else {
      setMessage("Please enter your name to create a game.");
    }
  };

  const joinGame = () => {
    if (name && roomId) {
      ws.current.send(JSON.stringify({ type: "join-game", payload: { roomId, name } }));
    } else {
      setMessage("Please enter your name and room ID to join a game.");
    }
  };

  const checkWinner = (board, lastTurn) => {
    for (let pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        const winner = lastTurn;
        console.log("Winner is", winner); // Explicitly mention the winning player
        // const loser = playerTurns[lastTurn === "X" ? "O" : "X"];
        setMessage(`${winner}, you won!`);
        setIsGameActive(false);
        return;
      }
    }
  
    if (board.every(cell => cell !== "")) {
      setMessage("Game is a draw");
      setIsGameActive(false);
    }
  };
  
  

  return (
    <div className="app">
      <Message message={message} />
      <main>
        <h1>Tic-Tac-Toe</h1>
        <p>Players: {playerTurns.X} (X) vs {playerTurns.O} (O)</p>
        {!isGameActive ? (
          <div>
            <input type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} />
            <button onClick={createGame}>Create Game</button>
            <input type="text" placeholder="Enter room ID to join" value={roomId} onChange={(e) => setRoomId(e.target.value)} />
            <button onClick={joinGame}>Join Game</button>
          </div>
        ) : (
          <div className="container">
            <div className="game">
              {board.map((value, index) => (
                <Box
                  key={index}
                  value={value}
                  onClick={() => handleBoxClick(index)}
                  disabled={!isGameActive || value}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
