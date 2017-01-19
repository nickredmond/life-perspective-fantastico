import { Color } from "./color"

export class Shape {
	public ctx: CanvasRenderingContext2D = null;

	constructor(ctx: CanvasRenderingContext2D){
		this.ctx = ctx;
	}

	draw(color: Color, x: number, y: number, size: number){
		throw new Error("Shape::draw() not implemented!");
	}
}

export class Circle extends Shape {
	draw(color: Color, x: number, y: number, size: number){
		this.ctx.beginPath();
    	this.ctx.arc(x, y, size, 0, 2 * Math.PI);
    	this.ctx.fillStyle = color.toStringRGB();
    	this.ctx.fill();
	}
}