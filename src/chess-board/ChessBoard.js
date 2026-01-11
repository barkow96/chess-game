import performAction from "../main";
import Bishop from "../pieces/Bishop";
import King from "../pieces/King";
import Knight from "../pieces/Knight";
import Pawn from "../pieces/Pawn";
import Queen from "../pieces/Queen";
import Rook from "../pieces/Rook";

//CLASS THAT REPRESENTS THE CHESSBOARD
export default class ChessBoard {
  constructor(tales) {
    this.poles = new Array(8);
    this.prepare(tales);
  }

  //PLACING PIECES ON THE CHESSBOARD
  prepare(tales) {
    for (let i = 0; i < this.poles.length; i++)
      this.poles[i] = new Array(this.poles.length);

    let color = "0";
    let figure = "0";
    let isFigure = false;
    for (let j = 0; j < 8; j++) {
      for (let i = 0; i < 8; i++) {
        this.poles[j][i] = {
          x: i,
          y: j,
          figure: "0",
          color: "0",
          tale: tales[8 * j + i],
          activated: false,
        };

        if (j <= 1) color = "W";
        else if (j >= 6) color = "B";
        else color = "0";

        figure = "0";
        isFigure = false;

        if (j == 1 || j == 6) {
          figure = new Pawn(i, j, this);
          isFigure = true;
        }

        if ((j == 0 || j == 7) && (i == 0 || i == 7)) {
          figure = new Rook(i, j, this);
          isFigure = true;
        }

        if ((j == 0 || j == 7) && (i == 2 || i == 5)) {
          figure = new Bishop(i, j, this);
          isFigure = true;
        }

        if ((j == 0 || j == 7) && (i == 1 || i == 6)) {
          figure = new Knight(i, j, this);
          isFigure = true;
        }

        if (j == 0 && i == 3) {
          figure = new Queen(i, j, this);
          isFigure = true;
        }

        if (j == 7 && i == 3) {
          figure = new Queen(i, j, this);
          isFigure = true;
        }

        if (j == 0 && i == 4) {
          figure = new King(i, j, this);
          isFigure = true;
        }

        if (j == 7 && i == 4) {
          figure = new King(i, j, this);
          isFigure = true;
        }

        this.poles[j][i].figure = figure;
        this.poles[j][i].color = color;
        this.poles[j][i].tale.className = "";
        this.poles[j][i].tale.classList.add("tale");
        if (isFigure) this.addClass(figure.name, color, i, j);
      }
    }
  }

  //ADDING AN AVATAR OF A FIGURE
  addClass(name, color, x, y) {
    this.poles[y][x].tale.classList.add("tale-" + name + "-" + color);
  }

  //REMOVING AN AVATAR OF A FIGURE
  removeClass(name, color, x, y) {
    this.poles[y][x].tale.classList.remove("tale-" + name + "-" + color);
  }

  //ACTIVATING A SQUARE (POSSIBLE TO CLICK)
  activate(x, y) {
    if (!this.poles[y][x].activated) {
      this.poles[y][x].activated = true;
      this.poles[y][x].tale.classList.add("pointer");
      this.poles[y][x].tale.addEventListener("click", performAction, true);
    }

    this.poles[y][x].activated = true;
  }

  //HIGHLIGHTNING A SQUARE
  highlight(x, y) {
    if ((x + y) % 2 == 0)
      this.poles[y][x].tale.style.backgroundColor = "#964b00";
    else this.poles[y][x].tale.style.backgroundColor = "#808080";
  }

  //ACTIVATING PLAYER'S PIECES
  activatePlayer(player) {
    this.poles.forEach((row) => {
      row.forEach((pole) => {
        if (pole.color == player.color) this.activate(pole.x, pole.y);
      });
    });
  }

  //DEACTIVATING A SQUARE (NOT POSSIBLE TO CLICK)
  deactivate(x, y) {
    if (this.poles[y][x].activated) {
      this.poles[y][x].tale.classList.remove("pointer");
      this.poles[y][x].tale.removeEventListener("click", performAction, true);
      if ((this.poles[y][x].x + this.poles[y][x].y) % 2 == 0)
        this.poles[y][x].tale.style.backgroundColor = "#a39169";
      else this.poles[y][x].tale.style.backgroundColor = "#efefef";
    }
    this.poles[y][x].activated = false;
  }

  //DEACTIVATING PLAYER'S PIECES
  deactivatePlayer(player) {
    this.poles.forEach((row) => {
      row.forEach((pole) => {
        if (pole.color == player.color) this.deactivate(pole.x, pole.y);
      });
    });
  }

  //DEACTIVATING ALL SQUARES
  deactivateAll() {
    this.poles.forEach((row) => {
      row.forEach((pole) => {
        this.deactivate(pole.x, pole.y);
      });
    });
  }
}
