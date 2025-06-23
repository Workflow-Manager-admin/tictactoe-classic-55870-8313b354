from flask_smorest import Blueprint
from flask.views import MethodView
from flask import request, session, jsonify
import uuid


# In-memory store for games: game_id -> {board, current_player, status, winner}
GAMES = {}

blp = Blueprint(
    "TicTacToe",
    "tic_tac_toe",
    url_prefix="/",
    description="Tic Tac Toe core game routes"
)


def new_board():
    """Create a new 3x3 tic tac toe board (list of 9 Nones)."""
    return [None] * 9


def check_winner(board):
    """Check if there is a winner or a draw."""
    win_positions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],      # rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8],      # columns
        [0, 4, 8], [2, 4, 6]                  # diagonals
    ]
    for positions in win_positions:
        vals = [board[p] for p in positions]
        if vals[0] and vals.count(vals[0]) == 3:
            return vals[0]
    if all(cell is not None for cell in board):
        return 'draw'
    return None


# PUBLIC_INTERFACE
@blp.route("/start")
class StartGame(MethodView):
    """Start a new tic tac toe game."""

    def post(self):
        # Create new game
        game_id = str(uuid.uuid4())
        board = new_board()
        GAMES[game_id] = {
            "board": board,
            "current_player": "X",
            "status": "playing",
            "winner": None
        }
        session['game_id'] = game_id
        resp = {
            "game_id": game_id,
            "board": board,
            "current_player": "X",
            "status": "playing",
            "winner": None
        }
        return jsonify(resp), 201


# PUBLIC_INTERFACE
@blp.route("/move")
class MakeMove(MethodView):
    """Make a move in the current game."""

    def post(self):
        req = request.get_json()
        game_id = req.get("game_id") or session.get("game_id")
        position = req.get("position")

        if not game_id or game_id not in GAMES:
            return jsonify({"error": "Invalid or missing game_id"}), 400
        if position is None or not (0 <= position <= 8):
            return jsonify({"error": "Invalid or missing position"}), 400

        game = GAMES[game_id]
        if game["status"] != "playing":
            return jsonify({"error": "Game is over", "state": game}), 400

        board = game["board"]
        if board[position] is not None:
            return jsonify({"error": "Position already taken", "state": game}), 400

        board[position] = game["current_player"]
        winner = check_winner(board)
        # Update status and winner if game over
        if winner == "X" or winner == "O":
            game["status"] = "over"
            game["winner"] = winner
        elif winner == "draw":
            game["status"] = "draw"
            game["winner"] = None
        else:
            # Swap player
            game["current_player"] = "O" if game["current_player"] == "X" else "X"

        resp = {
            "game_id": game_id,
            "board": board,
            "current_player": (
                game["current_player"] if game["status"] == "playing" else None
            ),
            "status": game["status"],
            "winner": game["winner"]
        }
        return jsonify(resp), 200


# PUBLIC_INTERFACE
@blp.route("/state")
class GameState(MethodView):
    """Retrieve current state of the game."""

    def get(self):
        game_id = request.args.get("game_id") or session.get("game_id")
        if not game_id or game_id not in GAMES:
            return jsonify({"error": "Invalid or missing game_id"}), 400
        game = GAMES[game_id]
        resp = {
            "game_id": game_id,
            "board": game["board"],
            "current_player": (
                game["current_player"] if game["status"] == "playing" else None
            ),
            "status": game["status"],
            "winner": game["winner"]
        }
        return jsonify(resp), 200
