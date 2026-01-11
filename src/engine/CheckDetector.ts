import { MovesResult, Piece } from "../pieces/pieces.types";
import Player from "../player/Player";
import { AttackDetector } from "./AttackDetector";
import { GameState } from "./GameState";

/**
 * Detects check and checkmate situations
 */
export class CheckDetector {
  private gameState: GameState;
  private attackDetector: AttackDetector;

  /**
   * Creates a new check detector
   * @param gameState - The current game state
   * @param attackDetector - The attack detector instance
   */
  constructor(gameState: GameState, attackDetector: AttackDetector) {
    this.gameState = gameState;
    this.attackDetector = attackDetector;
  }

  /**
   * Checks if a player is in check
   * @param player - The player to check
   * @returns True if the player is in check, false otherwise
   */
  isChecked(player: Player): boolean {
    const attackedSpots = this.attackDetector.findAttackedSpots(player);
    const spotsNumber = attackedSpots.x.length;
    for (let i = 0; i < spotsNumber; i++) {
      if (
        this.gameState.cb.poles[attackedSpots.y[i]][attackedSpots.x[i]]
          .figure !== "0" &&
        (
          this.gameState.cb.poles[attackedSpots.y[i]][attackedSpots.x[i]]
            .figure as Piece
        ).name == "K" &&
        this.gameState.cb.poles[attackedSpots.y[i]][attackedSpots.x[i]].color ==
          player.color
      )
        return true;
    }

    return false;
  }

  /**
   * Checks if capturing the attacker can prevent checkmate
   * @param x - The x coordinate of the attacking piece
   * @param y - The y coordinate of the attacking piece
   * @returns True if capture is possible, false otherwise
   */
  captureCheckMatePreventionPossible(x: number, y: number): boolean {
    const attackedSpots = this.attackDetector.findAttackedSpots(
      this.gameState.currPlayer,
    );
    const spotsNumber = attackedSpots.x.length;

    for (let i = 0; i < spotsNumber; i++)
      if (attackedSpots.x[i] == x && attackedSpots.y[i] == y) return true;

    return false;
  }

  /**
   * Checks if blocking the attack can prevent checkmate
   * @param x - The x coordinate of the attacking piece
   * @param y - The y coordinate of the attacking piece
   * @returns True if blocking is possible, false otherwise
   */
  blockCheckMatePreventionPossible(x: number, y: number): boolean {
    const attacker = this.gameState.cb.poles[y][x].figure as Piece;
    const king = this.attackDetector.findKing(this.gameState.oppPlayer);

    if (attacker.name == "B" || attacker.name == "R" || attacker.name == "Q") {
      if (
        Math.abs(attacker.x - king.x) <= 1 &&
        Math.abs(attacker.y - king.y) <= 1
      )
        return false;
      else {
        const dx =
          attacker.x - king.x != 0
            ? (attacker.x - king.x) / Math.abs(attacker.x - king.x)
            : attacker.x - king.x;
        const dy =
          attacker.y - king.y != 0
            ? (attacker.y - king.y) / Math.abs(attacker.y - king.y)
            : attacker.y - king.y;
        let multip = 1;
        let X: number, Y: number;
        let movesPossible: MovesResult;
        let movesNumber: number;
        let blockPossible = false;

        while (
          king.x + dx * multip != attacker.x ||
          king.y + dy * multip != attacker.y
        ) {
          X = king.x + dx * multip;
          Y = king.y + dy * multip;

          this.gameState.cb.poles.forEach((row) => {
            row.forEach((pole) => {
              if (
                pole.figure != "0" &&
                pole.color == this.gameState.oppPlayer.color &&
                pole.figure.name != "K"
              ) {
                movesPossible = pole.figure.movesPossible();
                movesNumber = movesPossible.x.length;
                for (let i = 0; i < movesNumber; i++)
                  if (movesPossible.x[i] == X && movesPossible.y[i] == Y) {
                    blockPossible = true;
                    break;
                  }
              }
            });
          });

          if (blockPossible) return true;
          multip++;
        }
      }
    }
    return false;
  }

  /**
   * Checks if the king can move to prevent checkmate
   * @returns True if the king has safe moves, false otherwise
   */
  moveCheckMatePreventionPossible(): boolean {
    const king = this.attackDetector.findKing(this.gameState.oppPlayer);
    const attackedSpots = this.attackDetector.findAttackedSpots(
      this.gameState.oppPlayer,
    );
    const spotsNumber = attackedSpots.x.length;

    const movesPossible = king.movesPossible();
    const capturesPossible = king.capturesPossible();

    const totalActionsPossible = this.calculateTotalActions(
      movesPossible,
      capturesPossible,
    );
    let totalActionsNumber = totalActionsPossible.x.length;

    for (let i = 0; i < totalActionsNumber; i++) {
      for (let j = 0; j < spotsNumber; j++) {
        if (
          totalActionsPossible.x[i] == attackedSpots.x[j] &&
          totalActionsPossible.y[i] == attackedSpots.y[j]
        ) {
          totalActionsPossible.x.splice(i, 1);
          totalActionsPossible.y.splice(i, 1);
          totalActionsPossible.possible.splice(i, 1);

          i--;
          totalActionsNumber--;
          break;
        }
      }
    }

    if (totalActionsPossible.x.length >= 1) return true;
    return false;
  }

  /**
   * Calculates total possible actions (moves + captures)
   * @param moves - The possible moves
   * @param captures - The possible captures
   * @returns Combined result of all possible actions
   */
  private calculateTotalActions(
    moves: MovesResult,
    captures: MovesResult,
  ): MovesResult {
    const totalActionsPossible: MovesResult = { x: [], y: [], possible: [] };
    totalActionsPossible.x = moves.x.concat(captures.x);
    totalActionsPossible.y = moves.y.concat(captures.y);
    totalActionsPossible.possible = moves.possible.concat(captures.possible);
    let totalActionsNumber = totalActionsPossible.x.length;

    for (let i = 0; i < totalActionsNumber; i++) {
      if (!totalActionsPossible.possible[i]) {
        totalActionsPossible.x.splice(i, 1);
        totalActionsPossible.y.splice(i, 1);
        totalActionsPossible.possible.splice(i, 1);

        i--;
        totalActionsNumber--;
      }
    }

    return totalActionsPossible;
  }
}
