import React, { useEffect, useState } from "react";
import "./App.css";

// Utility: API base. Assuming backend hosted at :3001, adjust if proxied.
const API_BASE = "http://localhost:3001";

// PUBLIC_INTERFACE
function TicTacToeBoard({ board, onCellClick, disabled, winLine }) {
  /**
   * Displays the Tic Tac Toe board as a 3x3 grid.
   * Highlights winLine if provided.
   * @param {Array} board - 2D array of board state.
   * @param {Function} onCellClick
   * @param {Boolean} disabled
   * @param {Array|null} winLine - Array of [row, col] indices for win highlight, or null.
   */
  const isWinCell = (rowIdx, colIdx) => {
    if (!winLine) return false;
    return winLine.some(([r, c]) => r === rowIdx && c === colIdx);
  };
  return (
    <div className="ttt-board">
      {board.map((row, rowIdx) =>
        row.map((cell, colIdx) => (
          <button
            key={`${rowIdx}-${colIdx}`}
            className={`ttt-cell${isWinCell(rowIdx, colIdx) ? " ttt-win-cell" : ""}`}
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
function GameStatus({ status, winner, currentPlayer, msg }) {
  /**
   * Displays status message.
   * @param {String} status "playing", "won", "draw"
   * @param {String} winner
   * @param {String} currentPlayer
   * @param {String} msg - backend-provided status message
   */
  let message = "";
  if (status === "won")
    message = msg || `🎉 Winner: ${winner}`;
  else if (status === "draw")
    message = msg || "🤝 It's a draw!";
  else
    message = msg || `Current Player: ${currentPlayer}`;
  const statusClass = status === "won" ? "ttt-status-win"
                      : status === "draw" ? "ttt-status-draw"
                      : "";
  return <div className={`ttt-status ${statusClass}`}>{message}</div>;
}

// PUBLIC_INTERFACE
function NewGameButton({ onClick }) {
  /** Button to start new game */
  return (
    <button className="btn btn-large ttt-newgame" onClick={onClick}>
      New Game
    </button>
  );
}

// Find the win line (helper for win highlight).
function getWinLine(board, winner) {
  if (!winner) return null;
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
    const [[a1,a2],[b1,b2],[c1,c2]] = line;
    if (
      board[a1][a2] === winner &&
      board[b1][b2] === winner &&
      board[c1][c2] === winner
    ) return line;
  }
  return null;
}

// PUBLIC_INTERFACE
function TicTacToeGame() {
  /**
   * Main game logic: interacts with backend for state.
   * Handles board state, player, game status, winner/draw, controls.
   */

  const [gameState, setGameState] = useState({
    board: [["", "", ""],[ "", "", ""],[ "", "", ""]],
    current_player: "X",
    status: "playing",
    winner: null,
    msg: "",
  });
  const [loading, setLoading] = useState(false);

  // Fetch game state
  async function fetchState() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/state`);
      const data = await res.json();
      setGameState(data);
    } catch (e) {
      setGameState((gs) => ({ ...gs, msg: "Backend unavailable." }));
    } finally {
      setLoading(false);
    }
  }

  // Start new game (backend)
  async function startNewGame(player = "X") {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player }),
      });
      const data = await res.json();
      setGameState(data);
    } catch (e) {
      setGameState((gs) => ({ ...gs, msg: "Could not start game." }));
    } finally {
      setLoading(false);
    }
  }

  // Make a move
  async function handleCellClick(rowIdx, colIdx) {
    if (
      loading ||
      gameState.status !== "playing" ||
      gameState.board[rowIdx][colIdx] !== ""
    )
      return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ row: rowIdx, col: colIdx }),
      });
      const data = await res.json();
      setGameState(data);
    } catch (e) {
      setGameState((gs) => ({ ...gs, msg: "Move failed." }));
    }
    setLoading(false);
  }

  // On mount, fetch state or start a new game if backend empty
  useEffect(() => {
    fetchState();
    // eslint-disable-next-line
  }, []);

  // Optionally: highlight winner cells
  const winLine = (gameState.status === "won")
    ? getWinLine(gameState.board, gameState.winner)
    : null;

  return (
    <div className="ttt-container">
      <div className="ttt-header">
        <h2 className="title" style={{ marginBottom: 8 }}>Tic Tac Toe</h2>
        <div className="description" style={{ marginBottom: 24 }}>
          Try to win by getting three in a row!
        </div>
        <GameStatus
          status={gameState.status}
          winner={gameState.winner}
          currentPlayer={gameState.current_player}
          msg={gameState.msg}
        />
      </div>
      <TicTacToeBoard
        board={gameState.board}
        onCellClick={handleCellClick}
        disabled={gameState.status !== "playing" || loading}
        winLine={winLine}
      />
      <div className="ttt-controls">
        <NewGameButton onClick={() => startNewGame("X")} />
      </div>
      {loading && <div style={{color:"#888",marginTop:10}}>Loading...</div>}
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
