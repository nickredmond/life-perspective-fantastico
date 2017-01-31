import { Color } from "./color";
import { Shape, Circle } from "./shapes"

export class Unit {
	isAlive: boolean = true;
	positionX: number;
	positionY: number;
	velocityX: number = 0;
	velocityY: number = 0;
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

	public update(dt){
		this.positionX += (this.velocityX * dt);
		this.positionY += (this.velocityY * dt);
	}

	public draw(ctx: CanvasRenderingContext2D){
    	this.shape.draw(this.color, this.positionX, this.positionY, this.size);
	}
}