import Bishop from "./Bishop";
import type { ChessBoardType } from "./pieces.types";

// CLASS THAT REPRESENTS A QUEEN
export default class Queen extends Bishop {
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
