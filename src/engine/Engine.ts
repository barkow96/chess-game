import { AttackDetector } from "./AttackDetector";
import { CheckDetector } from "./CheckDetector";
import { GameState } from "./GameState";
import { MoveHandler } from "./MoveHandler";
import { UIManager } from "./UIManager";

/**
 * Main chess game engine that orchestrates all game components
 */
export class Engine {
  private gameState: GameState;
  private attackDetector: AttackDetector;
  private checkDetector: CheckDetector;
  private moveHandler: MoveHandler;
  private uiManager: UIManager;
  private talesDivs: NodeListOf<HTMLDivElement>;

  /**
   * Creates a new chess game engine instance
   * @param containerDiv - Main container element for the chess board
   * @param resultDiv - Element for displaying game results
   * @param infoDiv - Element for displaying game information
   * @param talesDivs - Collection of all chess board square elements
   */
  constructor(
    containerDiv: HTMLDivElement,
    resultDiv: HTMLDivElement,
    infoDiv: HTMLDivElement,
    talesDivs: NodeListOf<HTMLDivElement>,
  ) {
    this.talesDivs = talesDivs;
    this.gameState = new GameState(talesDivs);
    this.attackDetector = new AttackDetector(this.gameState);
    this.checkDetector = new CheckDetector(this.gameState, this.attackDetector);
    this.moveHandler = new MoveHandler(
      this.gameState,
      this.attackDetector,
      this.checkDetector,
    );
    this.uiManager = new UIManager(
      containerDiv,
      resultDiv,
      infoDiv,
      this.gameState,
      () => this.init(),
    );

    this.init();
  }

  /**
   * Initializes or resets the game
   */
  init(): void {
    this.uiManager.prepareForReset();
    this.gameState.reset(this.talesDivs);
    this.uiManager.setInitialState();
    this.gameState.cb.activatePlayer(this.gameState.currPlayer);
  }

  /**
   * Handles click events on the chess board
   * @param event - The click event triggered by user interaction
   */
  performAction(event: Event): void {
    const div = (event as any).composedPath()[0] as HTMLDivElement;
    let x: number = 0,
      y: number = 0;

    //READING THE COORDINATES OF THE CLICK-EVENT
    this.gameState.cb.poles.forEach((row) => {
      row.forEach((pole) => {
        if (div === pole.tale) {
          x = pole.x;
          y = pole.y;
        }
      });
    });

    //ACTIONS TRIGGERED BY THE FIRST CLICK
    if (this.gameState.currPlayer.firstClick) {
      this.moveHandler.handleFirstClick(x, y);
    }
    //ACTIONS TRIGGERED BY THE SECOND CLICK
    else {
      this.moveHandler.handleSecondClick(x, y);
    }

    //UPDATING GAME INFO PANEL
    this.uiManager.updateResult();
  }
}
