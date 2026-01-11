import Knight from "./Knight";
import type {
  ChessBoardType,
  CastlingResult,
  AttackedSpots,
  Color,
  Piece,
} from "./pieces.types";

// Player type (simplified for King's needs)
type Player = {
  color: Color;
};

// CLASS THAT REPRESENTS A KING
export default class King extends Knight {
  constructor(x: number, y: number, chessBoard: ChessBoardType) {
    super(x, y, chessBoard);
    this.name = "K";
    this.directions = [
      "up",
      "upRight",
      "right",
      "downRight",
      "down",
      "downLeft",
      "left",
      "upLeft",
    ];
    this.dx = [0, +1, +1, +1, 0, -1, -1, -1];
    this.dy = [-1, -1, 0, +1, +1, +1, 0, -1];
    this.firstMove = true;
  }

  // CALCULATING CASTLINGS
  castlingPossible(player: Player): CastlingResult {
    const castlings: CastlingResult = {
      rooks: ["0", "0"],
      dx: [-2, +2],
      possible: [false, false],
    };
    const attackedSpots: AttackedSpots = {
      x: [],
      y: [],
    };
    let dx: number;
    let multip = 1;
    let spotsTaken = false;
    let spotsAttacked = false;

    if (this.firstMove) {
      this.cb.poles.forEach((row) => {
        row.forEach((pole) => {
          const figure = pole.figure;

          if (
            figure !== "0" &&
            (figure as Piece).name === "R" &&
            pole.color === player.color &&
            (figure as any).firstMove
          ) {
            if ((figure as Piece).x === 0) castlings.rooks[0] = figure as Piece;
            if ((figure as Piece).x === 7) castlings.rooks[1] = figure as Piece;
          } else if (figure !== "0" && pole.color !== player.color) {
            const captures = (figure as Piece).capturesPossible();
            attackedSpots.x = attackedSpots.x.concat(captures.x);
            attackedSpots.y = attackedSpots.y.concat(captures.y);
          }
        });
      });

      for (const [index, rook] of castlings.rooks.entries()) {
        if (rook !== "0") {
          multip = 1;
          dx = 0;
          spotsTaken = false;
          spotsAttacked = false;

          while (this.x + dx !== (rook as Piece).x) {
            const currentFigure = this.cb.poles[this.y][this.x + dx].figure;

            if (
              currentFigure !== "0" &&
              (currentFigure as Piece).name !== "K"
            ) {
              spotsTaken = true;
            }

            for (let i = 0; i < attackedSpots.x.length; i++) {
              if (
                attackedSpots.x[i] === this.x + dx &&
                attackedSpots.y[i] === this.y
              ) {
                spotsTaken = true;
              }
            }

            dx =
              (multip * ((rook as Piece).x - this.x)) /
              Math.abs((rook as Piece).x - this.x);
            multip++;
          }

          if (!spotsTaken && !spotsAttacked) {
            castlings.possible[index] = true;
          }
        }
      }
    }

    return castlings;
  }
}
