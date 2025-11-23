import type { ChessBoardType, MovesResult, PieceName, Color } from "./pieces.types";

// CLASS THAT REPRESENTS A PAWN
export default class Pawn {
	x: number;
	y: number;
	cb: ChessBoardType;
	name: PieceName;
	firstMove: boolean;

	constructor(x: number, y: number, chessBoard: ChessBoardType) {
		this.x = x;
		this.y = y;
		this.cb = chessBoard;
		this.name = "P";
		this.firstMove = true;
	}

	// SETTINGS FIGURE'S POSITION
	setPosition(x: number, y: number): this {
		this.x = x;
		this.y = y;
		return this;
	}

	// CALCULATING MOVES
	movesPossible(): MovesResult {
		const x = this.x;
		const y = this.y;
		const moves: MovesResult = {
			x: [],
			y: [],
			possible: [],
		};
		const color: Color = this.cb.poles[y][x].color;
		const sign = color === "W" ? +1 : -1;

		if (y + sign <= 7 && y + sign >= 0) {
			if (this.cb.poles[y + sign][x].figure === "0") {
				moves.x.push(this.x);
				moves.y.push(this.y + sign);
				moves.possible.push(true);
			}

			if (this.firstMove === true && this.cb.poles[y + sign][x].figure === "0" && this.cb.poles[y + sign * 2][x].figure === "0") {
				moves.x.push(this.x);
				moves.y.push(this.y + sign * 2);
				moves.possible.push(true);
			}
		}

		return moves;
	}

	// CALCULATING CAPTURES
	capturesPossible(): MovesResult {
		const x = this.x;
		const y = this.y;
		const captures: MovesResult = {
			x: [],
			y: [],
			possible: [],
		};
		const dx = [-1, 1];
		const color: Color = this.cb.poles[y][x].color;
		const sign = color === "W" ? +1 : -1;

		if (y + sign <= 7 && y + sign >= 0) {
			if (x >= 1 && this.x <= 6) {
				for (const d of dx) {
					captures.x.push(x + d);
					captures.y.push(y + sign);

					if (this.cb.poles[y + sign][x + d].figure !== "0" && this.cb.poles[y + sign][x + d].color !== this.cb.poles[y][x].color) {
						captures.possible.push(true);
					} else {
						captures.possible.push(false);
					}
				}
			} else if (x === 0) {
				captures.x.push(x + 1);
				captures.y.push(y + sign);

				if (this.cb.poles[y + sign][x + 1].figure !== "0" && this.cb.poles[y + sign][x + 1].color !== this.cb.poles[y][x].color) {
					captures.possible.push(true);
				} else {
					captures.possible.push(false);
				}
			} else if (x === 7) {
				captures.x.push(x - 1);
				captures.y.push(y + sign);

				if (this.cb.poles[y + sign][x - 1].figure !== "0" && this.cb.poles[y + sign][x - 1].color !== this.cb.poles[y][x].color) {
					captures.possible.push(true);
				} else {
					captures.possible.push(false);
				}
			}
		}
		return captures;
	}
}
