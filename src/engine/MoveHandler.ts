import { Color, MovesResult, Piece } from "../pieces/pieces.types";
import Queen from "../pieces/Queen";
import { AttackDetector } from "./AttackDetector";
import { CheckDetector } from "./CheckDetector";
import { GameState } from "./GameState";

/**
 * Handles all move-related logic including special moves
 */
export class MoveHandler {
  private gameState: GameState;
  private attackDetector: AttackDetector;
  private checkDetector: CheckDetector;

  /**
   * Creates a new move handler
   * @param gameState - The current game state
   * @param attackDetector - The attack detector instance
   * @param checkDetector - The check detector instance
   */
  constructor(
    gameState: GameState,
    attackDetector: AttackDetector,
    checkDetector: CheckDetector,
  ) {
    this.gameState = gameState;
    this.attackDetector = attackDetector;
    this.checkDetector = checkDetector;
  }

  /**
   * Calculates total possible actions (moves + captures)
   * @param moves - The possible moves
   * @param captures - The possible captures
   * @returns Combined result of all possible actions
   */
  calculateTotalActions(
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

  /**
   * Handles the first click - activates possible moves
   * @param x - The x coordinate of the clicked square
   * @param y - The y coordinate of the clicked square
   */
  handleFirstClick(x: number, y: number): void {
    const cb = this.gameState.cb;
    const currPlayer = this.gameState.currPlayer;

    //ACTIVATING THE FIELD OF THE FIRST CLICK
    cb.deactivatePlayer(currPlayer);
    cb.activate(x, y);
    cb.highlight(x, y);

    const figure = cb.poles[y][x].figure as Piece;
    const movesPossible = figure.movesPossible();
    const capturesPossible = figure.capturesPossible();
    const totalActionsPossible = this.calculateTotalActions(
      movesPossible,
      capturesPossible,
    );
    const actionsNumber = totalActionsPossible.x.length;

    //ACTIVATING FIELDS WHERE ACTIONS CAN BE PERFORMED
    for (let i = 0; i < actionsNumber; i++) {
      cb.activate(totalActionsPossible.x[i], totalActionsPossible.y[i]);
      cb.highlight(totalActionsPossible.x[i], totalActionsPossible.y[i]);
    }

    //SPECIAL BEHAVIOR IF THE CURRENT FIGURE IS A KING
    if (figure.name == "K") {
      const attackedSpots = this.attackDetector.findAttackedSpots(currPlayer);
      const spotsNumber = attackedSpots.x.length;

      //DEACTIVATING FIELDS WHICH ARE UNDER ATTACK
      for (let i = 0; i < spotsNumber; i++)
        cb.deactivate(attackedSpots.x[i], attackedSpots.y[i]);

      //ACTIVATING THE FIELD OF THE FIRST CLICK
      cb.activate(x, y);
      cb.highlight(x, y);

      //ACTIVATING THE FIELDS FOR CASTLING (IF POSSIBLE)
      const castlings = (figure as any).castlingPossible(currPlayer);
      for (let i = 0; i < 2; i++) {
        if (castlings.possible[i]) {
          cb.activate(x + castlings.dx[i], y);
          cb.highlight(x + castlings.dx[i], y);
        }
      }
    }

    //SPECIAL BEHAVIOR IF THE CURRENT FIGURE IS NOT A KING
    //ACTIVATING ONLY THESE ACTIONS THAT WOULD NOT CAUSE CHECK ON PLAYER'S KING
    else {
      let tempX: number, tempY: number;
      let tempFigure: Piece | "0";
      let tempColor: Color;

      for (let i = 0; i < actionsNumber; i++) {
        tempX = totalActionsPossible.x[i];
        tempY = totalActionsPossible.y[i];
        tempFigure = cb.poles[tempY][tempX].figure;
        tempColor = cb.poles[tempY][tempX].color;

        cb.poles[tempY][tempX].figure = figure;
        (cb.poles[tempY][tempX].figure as Piece).setPosition(tempX, tempY);
        cb.poles[tempY][tempX].color = currPlayer.color;

        cb.poles[y][x].figure = "0";
        cb.poles[y][x].color = "0";

        if (this.checkDetector.isChecked(currPlayer))
          cb.deactivate(tempX, tempY);

        cb.poles[tempY][tempX].figure = tempFigure;
        if (tempFigure != "0")
          (cb.poles[tempY][tempX].figure as Piece).setPosition(tempX, tempY);
        cb.poles[tempY][tempX].color = tempColor;

        cb.poles[y][x].figure = figure;
        (cb.poles[y][x].figure as Piece).setPosition(x, y);
        cb.poles[y][x].color = currPlayer.color;
      }
    }

    //ACTIVATING EN PASSANT CAPTURE FIELDS
    const enPassant = this.gameState.enPassant;
    if (
      enPassant.possible &&
      figure.name == "P" &&
      enPassant.captureCoords[0] !== null &&
      enPassant.captureCoords[1] !== null &&
      Math.abs(x - enPassant.captureCoords[0]) == 1 &&
      Math.abs(y - enPassant.captureCoords[1]) == 1
    ) {
      cb.activate(enPassant.captureCoords[0], enPassant.captureCoords[1]);
      cb.highlight(enPassant.captureCoords[0], enPassant.captureCoords[1]);
    }

    //CHANGING CURRENT PLAYER'S STATE
    currPlayer.firstClick = false;
    currPlayer.firstClickX = x;
    currPlayer.firstClickY = y;
  }

  /**
   * Handles the second click - executes the move
   * @param x - The x coordinate of the destination square
   * @param y - The y coordinate of the destination square
   */
  handleSecondClick(x: number, y: number): void {
    const cb = this.gameState.cb;
    const currPlayer = this.gameState.currPlayer;
    const oppPlayer = this.gameState.oppPlayer;
    const enPassant = this.gameState.enPassant;

    currPlayer.firstClick = true;

    //IF THE SECOND CLICK IS THE SAME AS THE FIRST CLICK THEN ACTIVATE ALL PLAYER'S PIECES
    if (currPlayer.firstClickX == x && currPlayer.firstClickY == y) {
      cb.deactivateAll();
      cb.activatePlayer(currPlayer);
      return;
    }

    //IF THE SECOND CLICK IS OTHER THAN THE FIRST CLICK THEN EXECUTE THE CODE BELOW
    const figure = (
      cb.poles[currPlayer.firstClickY][currPlayer.firstClickX].figure as Piece
    ).setPosition(x, y);
    const color =
      cb.poles[currPlayer.firstClickY][currPlayer.firstClickX].color;

    //HANDLING EN PASSANT CAPTURE
    this.handleEnPassant(x, y);

    //IF A PAWN MOVES BY 2 SQUARES IN ITS FIRST MOVE - ACTIVATE EN PASSANT CAPTURE POSSIBILITY
    if (figure.name == "P" && Math.abs(y - currPlayer.firstClickY) == 2) {
      enPassant.captureCoords[0] = x;
      enPassant.captureCoords[1] = (y + currPlayer.firstClickY) / 2;
      enPassant.figureCoords[0] = x;
      enPassant.figureCoords[1] = y;
      enPassant.possible = true;
    }

    //IF A PAWN, ROOK OR KING MOVES FOR THE FIRST TIME - SAVE THIS INFORMATION IN ITS STATE
    if (
      (figure.name == "P" || figure.name == "R" || figure.name == "K") &&
      figure.firstMove
    )
      figure.firstMove = false;

    //HANDLING CASTLING
    this.handleCastling(figure, x, y);

    //REMOVING PIECE'S AVATAR AND DECREMENTING PIECE'S COUNTER
    if (cb.poles[y][x].figure != "0") {
      cb.removeClass(
        (cb.poles[y][x].figure as Piece).name,
        cb.poles[y][x].color,
        x,
        y,
      );
      oppPlayer.pieces = oppPlayer.pieces - 1;
    }

    //ASSIGNING A PIECE TO A NEW FIELD (INCL. PAWN PROMOTION)
    if (figure.name == "P" && (y == 0 || y == 7))
      cb.poles[y][x].figure = new Queen(x, y, cb);
    else cb.poles[y][x].figure = figure;

    //TRANSFERRING PIECE'S AVATAR FROM SOURCE TO DESTINATION
    cb.poles[y][x].color = color;
    cb.addClass((cb.poles[y][x].figure as Piece).name, color, x, y);
    cb.poles[currPlayer.firstClickY][currPlayer.firstClickX].figure = "0";
    cb.poles[currPlayer.firstClickY][currPlayer.firstClickX].color = "0";
    cb.removeClass(
      figure.name,
      color,
      currPlayer.firstClickX,
      currPlayer.firstClickY,
    );

    //CHECKING IF CURRENT OR OPPONENT PLAYER'S KING IS UNDER ATTACK (CHECK OR CHECKMATE)
    this.handleCheckAndCheckmate(x, y);

    //ACTIVATING OPPONENT'S PIECES
    cb.deactivateAll();
    cb.activatePlayer(oppPlayer);

    //CHANGING GAME STATE
    this.gameState.switchPlayers();
  }

  /**
   * Handles en passant capture
   * @param x - The x coordinate of the destination square
   * @param y - The y coordinate of the destination square
   */
  private handleEnPassant(x: number, y: number): void {
    const cb = this.gameState.cb;
    const oppPlayer = this.gameState.oppPlayer;
    const enPassant = this.gameState.enPassant;

    if (enPassant.possible) {
      enPassant.possible = false;

      if (
        enPassant.captureCoords[0] !== null &&
        enPassant.captureCoords[1] !== null &&
        x == enPassant.captureCoords[0] &&
        y == enPassant.captureCoords[1]
      ) {
        const figX = enPassant.figureCoords[0] as number;
        const figY = enPassant.figureCoords[1] as number;

        cb.removeClass(
          (cb.poles[figY][figX].figure as Piece).name,
          cb.poles[figY][figX].color,
          figX,
          figY,
        );
        cb.poles[figY][figX].figure = "0";
        cb.poles[figY][figX].color = "0";
        oppPlayer.pieces = oppPlayer.pieces - 1;
      }
    }
  }

  /**
   * Handles castling move
   * @param figure - The king piece performing castling
   * @param x - The x coordinate of the destination square
   * @param y - The y coordinate of the destination square
   */
  private handleCastling(figure: Piece, x: number, y: number): void {
    const cb = this.gameState.cb;
    const currPlayer = this.gameState.currPlayer;

    if (figure.name == "K" && Math.abs(currPlayer.firstClickX - x) > 1) {
      const rookX = currPlayer.firstClickX > x ? 0 : 7;
      const rookY = y;
      const rook = cb.poles[rookY][rookX].figure as Piece;

      const rookNewX = x == 6 ? 5 : 3;
      const rookNewY = rookY;

      cb.removeClass(
        (cb.poles[rookY][rookX].figure as Piece).name,
        cb.poles[rookY][rookX].color,
        rookX,
        rookY,
      );
      cb.poles[rookY][rookX].figure = "0";
      cb.poles[rookY][rookX].color = "0";

      cb.poles[rookNewY][rookNewX].figure = rook.setPosition(
        rookNewX,
        rookNewY,
      );
      cb.poles[rookNewY][rookNewX].color = currPlayer.color;
      cb.addClass(
        (cb.poles[rookNewY][rookNewX].figure as Piece).name,
        cb.poles[rookNewY][rookNewX].color,
        rookNewX,
        rookNewY,
      );
    }
  }

  /**
   * Handles check and checkmate detection
   * @param x - The x coordinate of the last move
   * @param y - The y coordinate of the last move
   */
  private handleCheckAndCheckmate(x: number, y: number): void {
    const currPlayer = this.gameState.currPlayer;
    const oppPlayer = this.gameState.oppPlayer;

    if (this.checkDetector.isChecked(oppPlayer)) {
      const attackersNumber =
        this.attackDetector.calculateAttackersNumber(oppPlayer);

      const capturePrevention =
        attackersNumber > 1
          ? false
          : this.checkDetector.captureCheckMatePreventionPossible(x, y);
      const blockPrevention =
        attackersNumber > 1
          ? false
          : this.checkDetector.blockCheckMatePreventionPossible(x, y);
      const movePrevention =
        this.checkDetector.moveCheckMatePreventionPossible();

      if (!capturePrevention && !blockPrevention && !movePrevention)
        oppPlayer.checkMate = true;
      else oppPlayer.check = true;
    } else oppPlayer.check = false;

    if (this.checkDetector.isChecked(currPlayer)) currPlayer.checkMate = true;
  }
}
