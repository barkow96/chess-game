import { Color } from "../pieces/pieces.types";

/**
 * Represents a player in the chess game
 */
export default class Player {
  color: Color;
  firstClick: boolean;
  firstClickX: number;
  firstClickY: number;
  pieces: number;
  check: boolean;
  checkMate: boolean;

  /**
   * Creates a new player
   * @param color - The color of the player's pieces ("W" for white, "B" for black)
   */
  constructor(color: Color) {
    this.color = color;
    this.firstClick = true;
    this.firstClickX = 0;
    this.firstClickY = 0;
    this.pieces = 16;
    this.check = false;
    this.checkMate = false;
  }
}
