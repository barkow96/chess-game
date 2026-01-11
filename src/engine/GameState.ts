import { ChessBoard } from "../chess-board";
import { Color } from "../pieces";
import { Player } from "../player";

export type EnPassantState = {
  captureCoords: [number | null, number | null];
  figureCoords: [number | null, number | null];
  possible: boolean;
  executed: boolean;
};

/**
 * Manages the game state including board, players, and special moves
 */
export class GameState {
  cb: ChessBoard;
  whitePlayer: Player;
  blackPlayer: Player;
  currPlayer: Player;
  oppPlayer: Player;
  players: Player[];
  playerBuffer: Player | null;
  enPassant: EnPassantState;

  /**
   * Creates a new game state with initialized board and players
   * @param talesDivs - Collection of all chess board square elements
   */
  constructor(talesDivs: NodeListOf<HTMLDivElement>) {
    const WHITE: Color = "W";
    const BLACK: Color = "B";

    this.cb = new ChessBoard(talesDivs);
    this.whitePlayer = new Player(WHITE);
    this.blackPlayer = new Player(BLACK);
    this.players = [this.whitePlayer, this.blackPlayer];
    this.currPlayer = this.whitePlayer;
    this.oppPlayer = this.blackPlayer;
    this.playerBuffer = null;
    this.enPassant = {
      captureCoords: [null, null],
      figureCoords: [null, null],
      possible: false,
      executed: false,
    };
  }

  /**
   * Resets the game state for a new game
   * @param talesDivs - Collection of all chess board square elements
   */
  reset(talesDivs: NodeListOf<HTMLDivElement>): void {
    const WHITE: Color = "W";
    const BLACK: Color = "B";

    this.cb = new ChessBoard(talesDivs);
    this.whitePlayer = new Player(WHITE);
    this.blackPlayer = new Player(BLACK);
    this.players = [this.whitePlayer, this.blackPlayer];
    this.currPlayer = this.whitePlayer;
    this.oppPlayer = this.blackPlayer;
    this.playerBuffer = null;
    this.enPassant = {
      captureCoords: [null, null],
      figureCoords: [null, null],
      possible: false,
      executed: false,
    };
  }

  /**
   * Switches the current player
   */
  switchPlayers(): void {
    this.playerBuffer = this.currPlayer;
    this.currPlayer = this.oppPlayer;
    this.oppPlayer = this.playerBuffer;
  }
}
