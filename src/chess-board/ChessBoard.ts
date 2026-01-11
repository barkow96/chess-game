import performAction from "../main";
import Bishop from "../pieces/Bishop";
import King from "../pieces/King";
import Knight from "../pieces/Knight";
import Pawn from "../pieces/Pawn";
import Queen from "../pieces/Queen";
import Rook from "../pieces/Rook";
import { Color, Piece, PieceName, Pole } from "../pieces/pieces.types";
import Player from "../player/Player";

/**
 * Represents the chess board with all squares and pieces
 */
export default class ChessBoard {
  poles: Pole[][];

  /**
   * Creates a new chess board
   * @param tales - Collection of DOM elements representing the board squares
   */
  constructor(tales: NodeListOf<Element>) {
    this.poles = new Array(8);
    this.prepare(tales);
  }

  /**
   * Initializes the board with pieces in starting positions
   * @param tales - Collection of DOM elements representing the board squares
   */
  prepare(tales: NodeListOf<Element>): void {
    for (let i = 0; i < this.poles.length; i++)
      this.poles[i] = new Array(this.poles.length);

    let color: Color = "0";
    let figure: Piece | "0" = "0";
    let isFigure = false;
    for (let j = 0; j < 8; j++) {
      for (let i = 0; i < 8; i++) {
        this.poles[j][i] = {
          x: i,
          y: j,
          figure: "0",
          color: "0",
          tale: tales[8 * j + i] as HTMLDivElement,
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
        if (isFigure && figure !== "0") this.addClass(figure.name, color, i, j);
      }
    }
  }

  /**
   * Adds a CSS class to display a piece's avatar on the board
   * @param name - The name/type of the piece
   * @param color - The color of the piece
   * @param x - The x coordinate (0-7)
   * @param y - The y coordinate (0-7)
   */
  addClass(name: PieceName, color: Color, x: number, y: number): void {
    this.poles[y][x].tale.classList.add("tale-" + name + "-" + color);
  }

  /**
   * Removes a CSS class to hide a piece's avatar from the board
   * @param name - The name/type of the piece
   * @param color - The color of the piece
   * @param x - The x coordinate (0-7)
   * @param y - The y coordinate (0-7)
   */
  removeClass(name: PieceName, color: Color, x: number, y: number): void {
    this.poles[y][x].tale.classList.remove("tale-" + name + "-" + color);
  }

  /**
   * Activates a square to make it clickable
   * @param x - The x coordinate (0-7)
   * @param y - The y coordinate (0-7)
   */
  activate(x: number, y: number): void {
    if (!this.poles[y][x].activated) {
      this.poles[y][x].activated = true;
      this.poles[y][x].tale.classList.add("pointer");
      this.poles[y][x].tale.addEventListener("click", performAction, true);
    }

    this.poles[y][x].activated = true;
  }

  /**
   * Highlights a square to show it as a possible move
   * @param x - The x coordinate (0-7)
   * @param y - The y coordinate (0-7)
   */
  highlight(x: number, y: number): void {
    if ((x + y) % 2 == 0)
      this.poles[y][x].tale.style.backgroundColor = "#964b00";
    else this.poles[y][x].tale.style.backgroundColor = "#808080";
  }

  /**
   * Activates all pieces belonging to a player
   * @param player - The player whose pieces should be activated
   */
  activatePlayer(player: Player): void {
    this.poles.forEach((row) => {
      row.forEach((pole) => {
        if (pole.color == player.color) this.activate(pole.x, pole.y);
      });
    });
  }

  /**
   * Deactivates a square to make it non-clickable
   * @param x - The x coordinate (0-7)
   * @param y - The y coordinate (0-7)
   */
  deactivate(x: number, y: number): void {
    if (this.poles[y][x].activated) {
      this.poles[y][x].tale.classList.remove("pointer");
      this.poles[y][x].tale.removeEventListener("click", performAction, true);
      if ((this.poles[y][x].x + this.poles[y][x].y) % 2 == 0)
        this.poles[y][x].tale.style.backgroundColor = "#a39169";
      else this.poles[y][x].tale.style.backgroundColor = "#efefef";
    }
    this.poles[y][x].activated = false;
  }

  /**
   * Deactivates all pieces belonging to a player
   * @param player - The player whose pieces should be deactivated
   */
  deactivatePlayer(player: Player): void {
    this.poles.forEach((row) => {
      row.forEach((pole) => {
        if (pole.color == player.color) this.deactivate(pole.x, pole.y);
      });
    });
  }

  /**
   * Deactivates all squares on the board
   */
  deactivateAll(): void {
    this.poles.forEach((row) => {
      row.forEach((pole) => {
        this.deactivate(pole.x, pole.y);
      });
    });
  }
}
