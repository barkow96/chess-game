import ChessBoard from "./chess-board/ChessBoard";
import Queen from "./pieces/Queen";
import Player from "./player/Player";

//ELEMENTS SELECTORS
const containerDiv = document.querySelector(".container");
const headerDiv = document.querySelector(".header");
const talesDivs = document.querySelectorAll(".tale");
const resultDiv = document.querySelector(".result");
const infoDiv = document.querySelector(".info");

//OBJECT CONTAINING CHESS QUOTES
const chessQuotes = {
  quotes: [
    `"Chess is a war over the board. The object is to crush the opponent’s mind." ~ Bobby Fischer`,
    `"When you see a good move, look for a better one." ~ Emanuel Lasker`,
    `"Even a poor plan is better than no plan at all." ~ Mikhail Chigorin`,
    `"If your opponent offers you a draw, try to work out why he thinks he’s worse off." ~ Nigel Short`,
    `"There are two types of sacrifices: correct ones and mine." ~ Mikhail Tal`,
    `"I used to attack because it was the only thing I knew. Now I attack because I know it works best." ~ Garry Kasparov`,
  ],
  counter: 0,
  change: false,
};

//COLOR CONSTANTS
const WHITE = "W";
const BLACK = "B";

//GAME STATE VARIABLES
let cb;
let whitePlayer, blackPlayer;
let currPlayer, oppPlayer;
let players = new Array(2);
let playerBuffer;
let enPassant;

//FUNCTION FOR RE-INITIALIZATION THE GAME STATE
const init = () => {
  containerDiv.removeEventListener("click", init, true);
  containerDiv.classList.remove("pointer");
  infoDiv.innerHTML = "White to move, have a nice game!";

  cb = new ChessBoard(talesDivs);
  whitePlayer = new Player(WHITE);
  blackPlayer = new Player(BLACK);
  players = [whitePlayer, blackPlayer];
  currPlayer = whitePlayer;
  oppPlayer = blackPlayer;
  enPassant = {
    captureCoords: [null, null],
    figureCoords: [null, null],
    possible: false,
    executed: false,
  };
  cb.activatePlayer(currPlayer);

  resultDiv.innerHTML =
    "White pieces: " +
    whitePlayer.pieces +
    ", black pieces: " +
    blackPlayer.pieces;
};
headerDiv.addEventListener("click", init);

//MAIN FUNCTION - PERFORMING OPERATIONS BY CLICKING THE FIGURES
export default function performAction(event) {
  const div = event.composedPath()[0]; // Wywołanie metody z nawiasami ()
  let x, y;

  //READING THE COORDINATES OF THE CLICK-EVENT
  cb.poles.forEach((row) => {
    row.forEach((pole) => {
      if (div === pole.tale) {
        x = pole.x;
        y = pole.y;
      }
    });
  });

  //ACTIONS TRIGGERED BY THE FIRST CLICK
  if (currPlayer.firstClick) {
    //ACTIVATING THE FIELD OF THE FIRST CLICK
    cb.deactivatePlayer(currPlayer);
    cb.activate(x, y);
    cb.highlight(x, y);

    const figure = cb.poles[y][x].figure;
    const movesPossible = figure.movesPossible();
    const capturesPossible = figure.capturesPossible();
    const totalActionsPossible = calculateTotalActions(
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
      const attackedSpots = findAttackedSpots(currPlayer);
      const spotsNumber = attackedSpots.x.length;

      //DEACTIVATING FIELDS WHICH ARE UNDER ATTACK
      for (let i = 0; i < spotsNumber; i++)
        cb.deactivate(attackedSpots.x[i], attackedSpots.y[i]);

      //ACTIVATING THE FIELD OF THE FIRST CLICK
      cb.activate(x, y);
      cb.highlight(x, y);

      //ACTIVATING THE FIELDS FOR CASTLING (IF POSSIBLE)
      const castlings = figure.castlingPossible(currPlayer);
      for (let i = 0; i < 2; i++) {
        if (castlings.possible[i]) {
          cb.activate(x + castlings.dx[i], y);
          cb.highlight(x + castlings.dx[i], y);
        }
      }
    }

    //SPECIAL BEHAVIOR IF THE CURRENT FIGURE IS NOT A KING
    //ACTIVATING ONLY THESE ACTIONS THAT WOULD NOT CAUSE CHECK ON PLAYER'S KING
    else if (figure.name != "K") {
      let tempX, tempY;
      let tempFigure;
      let tempColor;

      for (let i = 0; i < actionsNumber; i++) {
        tempX = totalActionsPossible.x[i];
        tempY = totalActionsPossible.y[i];
        tempFigure = cb.poles[tempY][tempX].figure;
        tempColor = cb.poles[tempY][tempX].color;

        cb.poles[tempY][tempX].figure = figure;
        cb.poles[tempY][tempX].figure.setPosition(tempX, tempY);
        cb.poles[tempY][tempX].color = currPlayer.color;

        cb.poles[y][x].figure = "0";
        cb.poles[y][x].color = "0";

        if (isChecked(currPlayer)) cb.deactivate(tempX, tempY);

        cb.poles[tempY][tempX].figure = tempFigure;
        if (tempFigure != "0")
          cb.poles[tempY][tempX].figure.setPosition(tempX, tempY);
        cb.poles[tempY][tempX].color = tempColor;

        cb.poles[y][x].figure = figure;
        cb.poles[y][x].figure.setPosition(x, y);
        cb.poles[y][x].color = currPlayer.color;
      }
    }

    //ACTIVATING EN PASSANT CAPTURE FIELDS
    if (
      enPassant.possible &&
      figure.name == "P" &&
      Math.abs(x - enPassant.captureCoords[0]) == 1 &&
      Math.abs(y - enPassant.captureCoords[1]) == 1
    ) {
      cb.activate(enPassant.captureCoords[0], enPassant.captureCoords[1]);
      cb.highlight(enPassant.captureCoords[0], enPassant.captureCoords[1]);
    }

    //CHANING CURRENT PLAYER'S STATE
    currPlayer.firstClick = false;
    currPlayer.firstClickX = x;
    currPlayer.firstClickY = y;
  }
  //ACTIONS TRIGGERED BY THE SECOND CLICK
  else {
    currPlayer.firstClick = true;

    //IF THE SECOND CLICK IS THE SAME AS THE FIRST CLICK THEN ACTIVATE ALL PLAYER'S PIECES
    if (currPlayer.firstClickX == x && currPlayer.firstClickY == y) {
      cb.deactivateAll();
      cb.activatePlayer(currPlayer);
    }

    //IF THE SECOND CLICK IS OTHER THAN THE FIRST CLICK THEN EXECUTE THE CODE BELOW
    else {
      const figure = cb.poles[currPlayer.firstClickY][
        currPlayer.firstClickX
      ].figure.setPosition(x, y);
      const color =
        cb.poles[currPlayer.firstClickY][currPlayer.firstClickX].color;

      //HANDLING EN PASSANT CAPTURE
      if (enPassant.possible) {
        enPassant.possible = false;

        if (
          x == enPassant.captureCoords[0] &&
          y == enPassant.captureCoords[1]
        ) {
          const figX = enPassant.figureCoords[0];
          const figY = enPassant.figureCoords[1];

          cb.removeClass(
            cb.poles[figY][figX].figure.name,
            cb.poles[figY][figX].color,
            figX,
            figY,
          );
          cb.poles[figY][figX].figure = "0";
          cb.poles[figY][figX].color = "0";
          oppPlayer.pieces = oppPlayer.pieces - 1;
        }
      }

      //IF A PAWN MOVES BY 2 SQUARES IN ITS FIRST MOVE - ACATIVATE EN PASSANT CAPTURE POSSIBILITY
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
      if (figure.name == "K" && Math.abs(currPlayer.firstClickX - x) > 1) {
        const rookX = currPlayer.firstClickX > x ? 0 : 7;
        const rookY = y;
        const rook = cb.poles[rookY][rookX].figure;

        const rookNewX = x == 6 ? 5 : 3;
        const rookNewY = rookY;

        cb.removeClass(
          cb.poles[rookY][rookX].figure.name,
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
          cb.poles[rookNewY][rookNewX].figure.name,
          cb.poles[rookNewY][rookNewX].color,
          rookNewX,
          rookNewY,
        );
      }

      //REMOVING PIECE'S AVATAR AND DECREMATING PIECE'S COUNTER
      if (cb.poles[y][x].figure != "0") {
        cb.removeClass(cb.poles[y][x].figure.name, cb.poles[y][x].color, x, y);
        oppPlayer.pieces = oppPlayer.pieces - 1;
      }

      //ASSIGNING A PIECE TO A NEW FIELD (INCL. PAWN PROMOTION)
      if (figure.name == "P" && (y == 0 || y == 7))
        cb.poles[y][x].figure = new Queen(x, y, cb);
      else cb.poles[y][x].figure = figure;

      //TRANSFERRING PIECE'S AVATAR FROM SOURCE TO DESTINATION
      cb.poles[y][x].color = color;
      cb.addClass(cb.poles[y][x].figure.name, color, x, y);
      cb.poles[currPlayer.firstClickY][currPlayer.firstClickX].figure = "0";
      cb.poles[currPlayer.firstClickY][currPlayer.firstClickX].color = "0";
      cb.removeClass(
        figure.name,
        color,
        currPlayer.firstClickX,
        currPlayer.firstClickY,
      );

      //CHECKING IF CURRENT OR OPPONENT PLAYER'S KING IS UNDER ATTACK (CHECK OR CHECKMATE)
      if (isChecked(oppPlayer)) {
        const attackersNumber = calculateAttackersNumber(oppPlayer);

        const capturePrevention =
          attackersNumber > 1
            ? false
            : captureCheckMatePreventionPossible(x, y);
        const blockPrevention =
          attackersNumber > 1 ? false : blockCheckMatePreventionPossible(x, y);
        const movePrevention = moveCheckMatePreventionPossible();

        if (!capturePrevention && !blockPrevention && !movePrevention)
          oppPlayer.checkMate = true;
        else oppPlayer.check = true;
      } else oppPlayer.check = false;
      if (isChecked(currPlayer)) currPlayer.checkMate = true;

      //ACTIVATING OPPONENT'S PIECES
      cb.deactivateAll();
      cb.activatePlayer(oppPlayer);

      //CHANING GAME STATE
      playerBuffer = currPlayer;
      currPlayer = oppPlayer;
      oppPlayer = playerBuffer;
    }
  }

  //UPDATING GAME INFO PANEL
  updateResult();
}

//FUNCTION FOR FINDING WHICH FIELDS OF PLAYER ARE UNDER ATTACK
const findAttackedSpots = (player) => {
  const color = player.color;
  const oppColor = color == WHITE ? BLACK : WHITE;
  let attackedSpots = {
    x: [],
    y: [],
  };

  cb.poles.forEach((row) => {
    row.forEach((pole) => {
      if (pole.color == oppColor) {
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
};

//FUNCTION FOR CALCULATING HOW MANY ACTIONS ARE POSSIBLE TO PERFORM
const calculateTotalActions = (moves, captures) => {
  const totalActionsPossible = { x: [], y: [], possible: [] };
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
};

//FUNCTION FOR FINDING PLAYER'S KING ON THE CHESSBOARD
const findKing = (player) => {
  let king;

  cb.poles.forEach((row) => {
    row.forEach((pole) => {
      if (
        pole.figure != "0" &&
        pole.figure.name == "K" &&
        pole.color == player.color
      )
        king = pole.figure;
    });
  });

  return king;
};

//FUNCTION FOR CALCULATING HOW MANY ATTACKERS WANTS TO CAPTURE PLAYER'S KING
const calculateAttackersNumber = (player) => {
  const king = findKing(player);

  const attackedSpots = findAttackedSpots(player);
  const spotsNumber = attackedSpots.x.length;

  let attackersNumber = 0;

  for (let i = 0; i < spotsNumber; i++)
    if (attackedSpots.x[i] == king.x && attackedSpots.y[i] == king.y)
      attackersNumber++;

  return attackersNumber;
};

//FUNCTION FOR CHECKING IF THERE IS CHECK ON A PLAYER
const isChecked = (player) => {
  const attackedSpots = findAttackedSpots(player);
  const spotsNumber = attackedSpots.x.length;
  for (let i = 0; i < spotsNumber; i++) {
    if (
      cb.poles[attackedSpots.y[i]][attackedSpots.x[i]].figure.name == "K" &&
      cb.poles[attackedSpots.y[i]][attackedSpots.x[i]].color == player.color
    )
      return true;
  }

  return false;
};

//FUNCTION FOR CHECKING IF THERE IS POSSIBILITY OF CAPTURE CHECK MATE PREVENTION
const captureCheckMatePreventionPossible = (x, y) => {
  const attackedSpots = findAttackedSpots(currPlayer);
  const spotsNumber = attackedSpots.x.length;

  for (let i = 0; i < spotsNumber; i++)
    if (attackedSpots.x[i] == x && attackedSpots.y[i] == y) return true;

  return false;
};

//FUNCTION FOR CHECKING IF THERE IS POSSIBILITY OF BLOCK CHECK MATE PREVENTION
const blockCheckMatePreventionPossible = (x, y) => {
  const attacker = cb.poles[y][x].figure;
  const king = findKing(oppPlayer);

  if (attacker.name == "B" || attacker.name == "R" || attacker.name == "Q") {
    if (
      Math.abs(attacker.x - king.x) <= 1 &&
      Math.abs(attacker.y - king.y <= 1)
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
      let X, Y;
      let movesPossible;
      let movesNumber;
      let blockPossible = false;

      while (
        king.x + dx * multip != attacker.x ||
        king.y + dy * multip != attacker.y
      ) {
        X = king.x + dx * multip;
        Y = king.y + dy * multip;

        cb.poles.forEach((row) => {
          row.forEach((pole) => {
            if (
              pole.figure != "0" &&
              pole.color == oppPlayer.color &&
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
};

//FUNCTION FOR CHECKING IF THERE IS POSSIBILITY OF KING'S MOVE CHECK MATE PREVENTION
const moveCheckMatePreventionPossible = () => {
  const king = findKing(oppPlayer);

  const attackedSpots = findAttackedSpots(oppPlayer);
  const spotsNumber = attackedSpots.x.length;

  const movesPossible = king.movesPossible();
  const capturesPossible = king.capturesPossible();

  const totalActionsPossible = calculateTotalActions(
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
};

//FUNCTION FOR UPDATING GAME INFO PANEL
const updateResult = () => {
  resultDiv.innerHTML =
    "White pieces: " +
    whitePlayer.pieces +
    ", black pieces: " +
    blackPlayer.pieces;

  chessQuotes.change = !chessQuotes.change;
  if (chessQuotes.change) {
    chessQuotes.counter =
      chessQuotes.counter == chessQuotes.quotes.length - 1
        ? 0
        : chessQuotes.counter + 1;
  }

  infoDiv.innerHTML = chessQuotes.quotes[chessQuotes.counter];

  let text = "";
  for (const player of players) {
    if (player.check) {
      if (player.color == WHITE) text = "Check on white King!";
      else text = "Check on black King!";
    }
    if (player.checkMate) {
      if (player.color == WHITE) text = "CHECKMATE! Black wins! :)";
      else text = "CHECKMATE! White wins! :)";

      cb.deactivateAll();
      containerDiv.addEventListener("click", init, true);
      containerDiv.classList.add("pointer");
      resultDiv.innerHTML = "Click the chessboard to play again!";
    }
  }

  if (text != "") infoDiv.innerHTML = text;
};

init();
