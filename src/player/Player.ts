import { Color } from "../pieces/pieces.types";

//CLASS THAT REPRESENTS A PLAYER
export default class Player {
  color: Color;
  firstClick: boolean;
  firstClickX: number;
  firstClickY: number;
  pieces: number;
  check: boolean;
  checkMate: boolean;

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
