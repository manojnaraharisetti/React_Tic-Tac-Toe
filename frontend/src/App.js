import './App.css';
import { useState } from 'react';
import Message from './components/Message';
import Box from './components/Box';

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
  const [isGameActive, setIsGameActive] = useState(true);

  const handleBoxClick = (index) => {
    if (!board[index] && isGameActive) {
      const newBoard = board.slice();
      newBoard[index] = currentTurn;
      setBoard(newBoard);
      checkWinner(newBoard);
      setCurrentTurn(currentTurn === "X" ? "O" : "X");
    }
  };

  const checkWinner = (board) => {
    for (let pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setMessage(`Winner is ${board[a]}`);
        setIsGameActive(false);
        return;
      }
    }
    if (board.every((box) => box)) {
      setMessage("Game is a Draw");
      setIsGameActive(false);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(""));
    setCurrentTurn("X");
    setMessage("");
    setIsGameActive(true);
  };

  return (
    <div className="app">
      <Message message={message} onNewGame={resetGame} />
      <main>
        <h1>Tic-Tac-Toe</h1>
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
        <button onClick={resetGame} id="reset-btn" >Reset Game</button>
      </main>
    </div>
  );
}

export default App;