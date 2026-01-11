import { AttackedSpots, Color, Piece } from "../pieces/pieces.types";
import Player from "../player/Player";
import { GameState } from "./GameState";

/**
 * Detects and manages attacks on the chess board
 */
export class AttackDetector {
  private gameState: GameState;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  /**
   * Finds all spots that are under attack by the opponent
   */
  findAttackedSpots(player: Player): AttackedSpots {
    const color = player.color;
    const WHITE: Color = "W";
    const BLACK: Color = "B";
    const oppColor: Color = color == WHITE ? BLACK : WHITE;
    let attackedSpots: AttackedSpots = {
      x: [],
      y: [],
    };

    this.gameState.cb.poles.forEach((row) => {
      row.forEach((pole) => {
        if (pole.color == oppColor && pole.figure !== "0") {
          attackedSpots.x = attackedSpots.x.concat(
            pole.figure.capturesPossible().x,
          );
          attackedSpots.y = attackedSpots.y.concat(
            pole.figure.capturesPossible().y,
          );
        }
      });
    });

    return attackedSpots;
  }

  /**
   * Finds the king piece for a given player
   */
  findKing(player: Player): Piece {
    let king: Piece | undefined;

    this.gameState.cb.poles.forEach((row) => {
      row.forEach((pole) => {
        if (
          pole.figure != "0" &&
          pole.figure.name == "K" &&
          pole.color == player.color
        )
          king = pole.figure;
      });
    });

    return king as Piece;
  }

  /**
   * Calculates how many pieces are attacking the player's king
   */
  calculateAttackersNumber(player: Player): number {
    const king = this.findKing(player);
    const attackedSpots = this.findAttackedSpots(player);
    const spotsNumber = attackedSpots.x.length;

    let attackersNumber = 0;

    for (let i = 0; i < spotsNumber; i++)
      if (attackedSpots.x[i] == king.x && attackedSpots.y[i] == king.y)
        attackersNumber++;

    return attackersNumber;
  }
}
