import { Bishop } from "./Bishop";
import type { ChessBoardType } from "./pieces.types";

/**
 * Represents a queen piece in chess
 * Combines the movement of rook and bishop
 */
export class Queen extends Bishop {
  /**
   * Creates a new queen piece
   * @param x - The x coordinate (0-7)
   * @param y - The y coordinate (0-7)
   * @param chessBoard - Reference to the chess board
   */
  constructor(x: number, y: number, chessBoard: ChessBoardType) {
    super(x, y, chessBoard);
    this.name = "Q";
    this.directions = [
      "up",
      "right",
      "down",
      "left",
      "upRight",
      "downRight",
      "downLeft",
      "upLeft",
    ];
    this.dx = [0, +1, 0, -1, +1, +1, -1, -1];
    this.dy = [-1, 0, +1, 0, -1, +1, +1, -1];
  }
}
