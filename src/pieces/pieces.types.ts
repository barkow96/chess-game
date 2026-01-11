export type Color = "W" | "B" | "0";
export type PieceName = "P" | "B" | "R" | "k" | "Q" | "K";

export type Position = {
  x: number;
  y: number;
};

export type MovesResult = {
  x: number[];
  y: number[];
  possible: boolean[];
};

export type Piece = {
  x: number;
  y: number;
  cb: ChessBoardType;
  name: PieceName;
  setPosition(x: number, y: number): Piece;
  movesPossible(): MovesResult;
  capturesPossible(): MovesResult;
  firstMove?: boolean;
};

export type Pole = {
  x: number;
  y: number;
  figure: Piece | "0";
  color: Color;
  tale: HTMLDivElement;
  activated: boolean;
};

export type ChessBoardType = {
  poles: Pole[][];
  activate(x: number, y: number): void;
  deactivate(x: number, y: number): void;
  highlight(x: number, y: number): void;
  addClass(name: PieceName, color: Color, x: number, y: number): void;
  removeClass(name: PieceName, color: Color, x: number, y: number): void;
  activatePlayer(player: any): void;
  deactivatePlayer(player: any): void;
  deactivateAll(): void;
};

export type CastlingResult = {
  rooks: (Piece | "0")[];
  possible: boolean[];
  dx: number[];
};

export type AttackedSpots = {
  x: number[];
  y: number[];
};
