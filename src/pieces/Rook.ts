import { Bishop } from "./Bishop";
import type { ChessBoardType } from "./pieces.types";

/**
 * Represents a rook piece in chess
 * Extends Bishop class but moves only horizontally and vertically
 */
export class Rook extends Bishop {
  /**
   * Creates a new rook piece
   * @param x - The x coordinate (0-7)
   * @param y - The y coordinate (0-7)
   * @param chessBoard - Reference to the chess board
   */
  constructor(x: number, y: number, chessBoard: ChessBoardType) {
    super(x, y, chessBoard);
    this.name = "R";
    this.directions = ["up", "right", "down", "left"];
    this.dx = [0, +1, 0, -1];
    this.dy = [-1, 0, +1, 0];
    this.firstMove = true;
  }
}
