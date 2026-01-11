import Bishop from "./Bishop";
import type { ChessBoardType } from "./pieces.types";

// CLASS THAT REPRESENTS A ROOK
export default class Rook extends Bishop {
  constructor(x: number, y: number, chessBoard: ChessBoardType) {
    super(x, y, chessBoard);
    this.name = "R";
    this.directions = ["up", "right", "down", "left"];
    this.dx = [0, +1, 0, -1];
    this.dy = [-1, 0, +1, 0];
    this.firstMove = true;
  }
}
