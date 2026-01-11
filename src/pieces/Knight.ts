import { Pawn } from "./Pawn";
import type { ChessBoardType, MovesResult, Color } from "./pieces.types";

/**
 * Represents a knight piece in chess
 * Moves in an L-shape pattern
 */
export class Knight extends Pawn {
  directions: string[];
  dx: number[];
  dy: number[];

  /**
   * Creates a new knight piece
   * @param x - The x coordinate (0-7)
   * @param y - The y coordinate (0-7)
   * @param chessBoard - Reference to the chess board
   */
  constructor(x: number, y: number, chessBoard: ChessBoardType) {
    super(x, y, chessBoard);
    this.name = "k";
    this.directions = [
      "upUpRight",
      "upRightRight",
      "downDownRight",
      "downRightRight",
      "downDownLeft",
      "downLeftLeft",
      "upUpLeft",
      "upLeftLeft",
    ];
    this.dx = [+1, +2, +1, +2, -1, -2, -1, -2];
    this.dy = [-2, -1, +2, +1, +2, +1, -2, -1];
  }

  /**
   * Calculates all possible moves for this knight
   * @returns Object containing arrays of x, y coordinates and possibility flags
   */
  movesPossible(): MovesResult {
    const x = this.x;
    const y = this.y;
    const moves: MovesResult = {
      x: [],
      y: [],
      possible: [],
    };
    let dx: number, dy: number;

    for (let i = 0; i < this.directions.length; i++) {
      dx = this.dx[i];
      dy = this.dy[i];

      if (x + dx >= 0 && x + dx <= 7 && y + dy >= 0 && y + dy <= 7) {
        if (this.cb.poles[y + dy][x + dx].figure === "0") {
          moves.x.push(x + dx);
          moves.y.push(y + dy);
          moves.possible.push(true);
        }
      }
    }

    return moves;
  }

  /**
   * Calculates all possible captures for this knight
   * @returns Object containing arrays of x, y coordinates and possibility flags
   */
  capturesPossible(): MovesResult {
    const x = this.x;
    const y = this.y;
    const captures: MovesResult = {
      x: [],
      y: [],
      possible: [],
    };
    const color: Color = this.cb.poles[y][x].color;
    const oppColor: Color = color === "W" ? "B" : "W";
    let dx: number, dy: number;

    for (let i = 0; i < this.directions.length; i++) {
      dx = this.dx[i];
      dy = this.dy[i];

      if (x + dx >= 0 && x + dx <= 7 && y + dy >= 0 && y + dy <= 7) {
        captures.x.push(x + dx);
        captures.y.push(y + dy);

        if (this.cb.poles[y + dy][x + dx].color === oppColor) {
          captures.possible.push(true);
        } else {
          captures.possible.push(false);
        }
      }
    }

    return captures;
  }
}
