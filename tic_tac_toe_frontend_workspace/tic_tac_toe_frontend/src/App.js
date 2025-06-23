import React, { useState } from "react";
import "./App.css";

// PUBLIC_INTERFACE
function TicTacToeBoard({ board, onCellClick, disabled }) {
  /** 
   * Displays the Tic Tac Toe board as a 3x3 grid.
   * @param {Array} board - 2D array representing the game board.
   * @param {Function} onCellClick - Handler for clicking a cell.
   * @param {Boolean} disabled - If true, disables input.
   */
  return (
    <div className="ttt-board">
      {board.map((row, rowIdx) =>
        row.map((cell, colIdx) => (
          <button
            key={`${rowIdx}-${colIdx}`}
            className="ttt-cell"
            onClick={() => onCellClick(rowIdx, colIdx)}
            disabled={disabled || cell !== ""}
            aria-label={`Row ${rowIdx + 1}, Col ${colIdx + 1}, ${cell || "empty"}`}
          >
            {cell}
          </button>
        ))
      )}
    </div>
  );
}

// PUBLIC_INTERFACE
function GameStatus({ status, winner, currentPlayer }) {
  /**
   * Displays a status message (game ongoing, win, tie).
   * @param {String} status - "playing", "won", "draw"
   * @param {String} winner - "X", "O", or null
   * @param {String} currentPlayer - "X" or "O"
   */
  let message = "";
  if (status === "won") message = `Winner: ${winner}`;
  else if (status === "draw") message = "It's a draw!";
  else message = `Current Player: ${currentPlayer}`;
  return <div className="ttt-status">{message}</div>;
}

// PUBLIC_INTERFACE
function NewGameButton({ onClick }) {
  /** Button to start a new game */
  return (
    <button className="btn btn-large ttt-newgame" onClick={onClick}>
      New Game
    </button>
  );
}

// Returns a 3x3 array of empty cells
function getInitialBoard() {
  return [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ];
}

// Check winner and status
function calculateGameStatus(board) {
  // Rows, columns, diagonals
  const lines = [
    // Rows
    [[0,0],[0,1],[0,2]],
    [[1,0],[1,1],[1,2]],
    [[2,0],[2,1],[2,2]],
    // Cols
    [[0,0],[1,0],[2,0]],
    [[0,1],[1,1],[2,1]],
    [[0,2],[1,2],[2,2]],
    // Diagonals
    [[0,0],[1,1],[2,2]],
    [[0,2],[1,1],[2,0]],
  ];
  for (const line of lines) {
    const [a,b,c] = line;
    if (
      board[a[0]][a[1]] &&
      board[a[0]][a[1]] === board[b[0]][b[1]] &&
      board[a[0]][a[1]] === board[c[0]][c[1]]
    ) {
      return { status: "won", winner: board[a[0]][a[1]] };
    }
  }
  // Check for draw (no empty cells left)
  const isDraw = board.flat().every(cell => cell !== "");
  if (isDraw) return { status: "draw", winner: null };
  // Game ongoing
  return { status: "playing", winner: null };
}

// PUBLIC_INTERFACE
function TicTacToeGame() {
  /**
   * Main game state for Tic Tac Toe UI.
   * Handles the board, player turn, game status, and controls.
   */

  const [board, setBoard] = useState(getInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const { status, winner } = calculateGameStatus(board);

  // Handle user move
  const handleCellClick = (rowIdx, colIdx) => {
    if (board[rowIdx][colIdx] !== "" || status !== "playing") return;
    const newBoard = board.map(row => [...row]);
    newBoard[rowIdx][colIdx] = currentPlayer;
    setBoard(newBoard);
    setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
  };

  // Start a new game
  const handleNewGame = () => {
    setBoard(getInitialBoard());
    setCurrentPlayer("X");
  };

  return (
    <div className="ttt-container">
      <div className="ttt-header">
        <h2 className="title" style={{ marginBottom: 8 }}>Tic Tac Toe</h2>
        <div className="description" style={{ marginBottom: 24 }}>
          Try to win by getting three in a row!
        </div>
        <GameStatus status={status} winner={winner} currentPlayer={currentPlayer} />
      </div>
      <TicTacToeBoard
        board={board}
        onCellClick={handleCellClick}
        disabled={status !== "playing"}
      />
      <div className="ttt-controls">
        <NewGameButton onClick={handleNewGame} />
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <div className="logo">
              <span className="logo-symbol">*</span> Tic Tac Toe
            </div>
            <a
              href="https://github.com"
              className="btn"
              rel="noopener noreferrer"
              target="_blank"
              style={{ textDecoration: "none" }}
            >
              View on GitHub
            </a>
          </div>
        </div>
      </nav>
      <main>
        <div className="container" style={{ paddingTop: 120 }}>
          <TicTacToeGame />
        </div>
      </main>
    </div>
  );
}

export default App;
