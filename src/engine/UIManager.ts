import { Color } from "../pieces/pieces.types";
import { GameState } from "./GameState";

type ChessQuotes = {
  quotes: string[];
  counter: number;
  change: boolean;
};

/**
 * Manages UI updates and displays game information
 */
export class UIManager {
  private containerDiv: HTMLDivElement;
  private resultDiv: HTMLDivElement;
  private infoDiv: HTMLDivElement;
  private gameState: GameState;
  private chessQuotes: ChessQuotes;
  private onResetCallback: () => void;

  /**
   * Creates a new UI manager
   * @param containerDiv - Main container element for the chess board
   * @param resultDiv - Element for displaying game results
   * @param infoDiv - Element for displaying game information
   * @param gameState - The current game state
   * @param onResetCallback - Callback function to reset the game
   */
  constructor(
    containerDiv: HTMLDivElement,
    resultDiv: HTMLDivElement,
    infoDiv: HTMLDivElement,
    gameState: GameState,
    onResetCallback: () => void,
  ) {
    this.containerDiv = containerDiv;
    this.resultDiv = resultDiv;
    this.infoDiv = infoDiv;
    this.gameState = gameState;
    this.onResetCallback = onResetCallback;

    this.chessQuotes = {
      quotes: [
        `"Chess is a war over the board. The object is to crush the opponent's mind." ~ Bobby Fischer`,
        `"When you see a good move, look for a better one." ~ Emanuel Lasker`,
        `"Even a poor plan is better than no plan at all." ~ Mikhail Chigorin`,
        `"If your opponent offers you a draw, try to work out why he thinks he's worse off." ~ Nigel Short`,
        `"There are two types of sacrifices: correct ones and mine." ~ Mikhail Tal`,
        `"I used to attack because it was the only thing I knew. Now I attack because I know it works best." ~ Garry Kasparov`,
      ],
      counter: 0,
      change: false,
    };
  }

  /**
   * Sets initial UI state
   */
  setInitialState(): void {
    this.infoDiv.innerHTML = "White to move, have a nice game!";
    this.updatePieceCount();
  }

  /**
   * Updates the piece count display
   */
  updatePieceCount(): void {
    this.resultDiv.innerHTML =
      "White pieces: " +
      this.gameState.whitePlayer.pieces +
      ", black pieces: " +
      this.gameState.blackPlayer.pieces;
  }

  /**
   * Updates the result display with current game state
   */
  updateResult(): void {
    this.updatePieceCount();

    this.chessQuotes.change = !this.chessQuotes.change;
    if (this.chessQuotes.change) {
      this.chessQuotes.counter =
        this.chessQuotes.counter == this.chessQuotes.quotes.length - 1
          ? 0
          : this.chessQuotes.counter + 1;
    }

    this.infoDiv.innerHTML = this.chessQuotes.quotes[this.chessQuotes.counter];

    let text = "";
    const WHITE: Color = "W";

    for (const player of this.gameState.players) {
      if (player.check) {
        if (player.color == WHITE) text = "Check on white King!";
        else text = "Check on black King!";
      }
      if (player.checkMate) {
        if (player.color == WHITE) text = "CHECKMATE! Black wins! :)";
        else text = "CHECKMATE! White wins! :)";

        this.gameState.cb.deactivateAll();
        this.containerDiv.addEventListener("click", this.onResetCallback, true);
        this.containerDiv.classList.add("pointer");
        this.resultDiv.innerHTML = "Click the chessboard to play again!";
      }
    }

    if (text != "") this.infoDiv.innerHTML = text;
  }

  /**
   * Prepares UI for game reset
   */
  prepareForReset(): void {
    this.containerDiv.removeEventListener("click", this.onResetCallback, true);
    this.containerDiv.classList.remove("pointer");
  }
}
