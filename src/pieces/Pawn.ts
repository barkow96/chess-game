import type {
  ChessBoardType,
  MovesResult,
  PieceName,
  Color,
} from "./pieces.types";

/**
 * Represents a pawn piece in chess
 */
export default class Pawn {
  x: number;
  y: number;
  cb: ChessBoardType;
  name: PieceName;
  firstMove: boolean;

  /**
   * Creates a new pawn piece
   * @param x - The x coordinate (0-7)
   * @param y - The y coordinate (0-7)
   * @param chessBoard - Reference to the chess board
   */
  constructor(x: number, y: number, chessBoard: ChessBoardType) {
    this.x = x;
    this.y = y;
    this.cb = chessBoard;
    this.name = "P";
    this.firstMove = true;
  }

  /**
   * Sets the piece's position on the board
   * @param x - The new x coordinate
   * @param y - The new y coordinate
   * @returns This piece instance for chaining
   */
  setPosition(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  /**
   * Calculates all possible moves for this pawn
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
    const color: Color = this.cb.poles[y][x].color;
    const sign = color === "W" ? +1 : -1;

    if (y + sign <= 7 && y + sign >= 0) {
      if (this.cb.poles[y + sign][x].figure === "0") {
        moves.x.push(this.x);
        moves.y.push(this.y + sign);
        moves.possible.push(true);
      }

      if (
        this.firstMove === true &&
        this.cb.poles[y + sign][x].figure === "0" &&
        this.cb.poles[y + sign * 2][x].figure === "0"
      ) {
        moves.x.push(this.x);
        moves.y.push(this.y + sign * 2);
        moves.possible.push(true);
      }
    }

    return moves;
  }

  /**
   * Calculates all possible captures for this pawn
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
    const dx = [-1, 1];
    const color: Color = this.cb.poles[y][x].color;
    const sign = color === "W" ? +1 : -1;

    if (y + sign <= 7 && y + sign >= 0) {
      if (x >= 1 && this.x <= 6) {
        for (const d of dx) {
          captures.x.push(x + d);
          captures.y.push(y + sign);

          if (
            this.cb.poles[y + sign][x + d].figure !== "0" &&
            this.cb.poles[y + sign][x + d].color !== this.cb.poles[y][x].color
          ) {
            captures.possible.push(true);
          } else {
            captures.possible.push(false);
          }
        }
      } else if (x === 0) {
        captures.x.push(x + 1);
        captures.y.push(y + sign);

        if (
          this.cb.poles[y + sign][x + 1].figure !== "0" &&
          this.cb.poles[y + sign][x + 1].color !== this.cb.poles[y][x].color
        ) {
          captures.possible.push(true);
        } else {
          captures.possible.push(false);
        }
      } else if (x === 7) {
        captures.x.push(x - 1);
        captures.y.push(y + sign);

        if (
          this.cb.poles[y + sign][x - 1].figure !== "0" &&
          this.cb.poles[y + sign][x - 1].color !== this.cb.poles[y][x].color
        ) {
          captures.possible.push(true);
        } else {
          captures.possible.push(false);
        }
      }
    }
    return captures;
  }
}
