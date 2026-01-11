//CLASS THAT REPRESENTS A PLAYER
export default class Player {
  constructor(color, myTurn) {
    this.color = color;
    this.firstClick = true;
    this.firstClickX = 0;
    this.firstClickY = 0;
    this.pieces = 16;
    this.check = false;
    this.checkMate = false;
  }
}
