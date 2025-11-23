import Pawn from "./Pawn";
import type { ChessBoardType, MovesResult, Color } from "./pieces.types";

// CLASS THAT REPRESENTS A BISHOP
export default class Bishop extends Pawn {
	directions: string[];
	dx: number[];
	dy: number[];

	constructor(x: number, y: number, chessBoard: ChessBoardType) {
		super(x, y, chessBoard);
		this.name = "B";
		this.directions = ["upRight", "downRight", "downLeft", "upLeft"];
		this.dx = [+1, +1, -1, -1];
		this.dy = [-1, +1, +1, -1];
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
		let dx: number, dy: number;
		let multip = 1;

		for (let i = 0; i < this.directions.length; i++) {
			dx = this.dx[i];
			dy = this.dy[i];
			multip = 1;

			while (x + dx * multip >= 0 && x + dx * multip <= 7 && y + dy * multip >= 0 && y + dy * multip <= 7) {
				if (this.cb.poles[y + dy * multip][x + dx * multip].figure === "0") {
					moves.x.push(x + dx * multip);
					moves.y.push(y + dy * multip);
					moves.possible.push(true);
				} else break;

				multip++;
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
		const color: Color = this.cb.poles[y][x].color;
		let dx: number, dy: number;
		let multip = 1;

		for (let i = 0; i < this.directions.length; i++) {
			dx = this.dx[i];
			dy = this.dy[i];
			multip = 1;

			while (x + dx * multip >= 0 && x + dx * multip <= 7 && y + dy * multip >= 0 && y + dy * multip <= 7) {
				captures.x.push(x + dx * multip);
				captures.y.push(y + dy * multip);

				if (this.cb.poles[y + dy * multip][x + dx * multip].figure === "0") {
					captures.possible.push(true);
				} else {
					if (this.cb.poles[y + dy * multip][x + dx * multip].color === color) {
						captures.possible.push(false);
					} else {
						captures.possible.push(true);
						multip++;

						if (
							this.cb.poles[y + dy * (multip - 1)][x + dx * (multip - 1)].figure !== "0" &&
							this.cb.poles[y + dy * (multip - 1)][x + dx * (multip - 1)].figure !== "0" &&
							(this.cb.poles[y + dy * (multip - 1)][x + dx * (multip - 1)].figure as any).name === "K" &&
							x + dx * multip <= 7 &&
							y + dy * multip >= 0 &&
							y + dy * multip <= 7
						) {
							captures.x.push(x + dx * multip);
							captures.y.push(y + dy * multip);
							captures.possible.push(false);
						}
					}

					break;
				}

				multip++;
			}
		}

		return captures;
	}
}
