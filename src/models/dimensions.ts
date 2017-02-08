export class Dimensions {
	x: number;
	y: number;
	width: number;
	height: number;

	constructor(x: number, y: number, w: number, h: number) {
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
	}
}

export class SpriteDimensions {
	sx: number;
	sy: number;
	sWidth: number;
	sHeight: number;
	dx: number;
	dy: number;
	dWidth: number;
	dHeight: number;

	constructor(sx: number, sy: number, sWidth: number, sHeight: number, dx: number, dy: number, dWidth: number, dHeight: number) {
		this.sx = sx;
		this.sy = sy;
		this.sWidth = sWidth;
		this.sHeight = sHeight;
		this.dx = dx;
		this.dy = dy;
		this.dWidth = dWidth;
		this.dHeight = dHeight;
	}
}