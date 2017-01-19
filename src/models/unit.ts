import { Color } from "./color";
import { Shape, Circle } from "./shapes"

export class Unit {
	positionX: number;
	positionY: number;
	size: number;
	color: Color;
	shape: Shape;

	constructor(shape: Shape, x: number = 0, y: number = 0, size: number = 0, color: Color = new Color()){
		this.positionX = x;
		this.positionY = y;
		this.size = size;
		this.color = color;
		this.shape = shape;
	}

	public draw(ctx: CanvasRenderingContext2D){
    	this.shape.draw(this.color, this.positionX, this.positionY, this.size);
	}
}