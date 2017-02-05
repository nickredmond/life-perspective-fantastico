import { Color } from "./color";
import { Shape } from "./shapes";

export abstract class Unit {
	isAlive: boolean = true;
	positionX: number;
	positionY: number;
	velocityX: number = 0;
	velocityY: number = 0;
	size: number;

	constructor(x: number = 0, y: number = 0, size: number = 0){
		this.positionX = x;
		this.positionY = y;
		this.size = size;
	}

	public intersects(otherUnit: Unit) {
		return !(otherUnit.positionX > (this.positionX + this.size) ||
			(otherUnit.positionX + otherUnit.size) < this.positionX ||
			otherUnit.positionY > (this.positionY + this.size) ||
			(otherUnit.positionY + otherUnit.size) < this.positionY)
	}

	public update(dt) {
		this.positionX += (this.velocityX * dt);
		this.positionY += (this.velocityY * dt);
	}
	public reverseFrame(dt) {
		this.positionX -= (this.velocityX * dt);
		this.positionY -= (this.velocityY * dt);
	}
}

export class ShapeUnit extends Unit {
	color: Color;
	shape: Shape;

	constructor(shape: Shape, x: number = 0, y: number = 0, size: number = 0, color: Color = new Color()){
		super(x, y, size);
		this.color = color;
		this.shape = shape;
	}

	public draw(ctx: CanvasRenderingContext2D) {
    	this.shape.draw(this.color, this.positionX, this.positionY, this.size);
	}
}

export class ImageUnit extends Unit {
	image: HTMLImageElement;

	constructor(imgSrc: string, x: number = 0, y: number = 0, size: number = 0) {
		super(x, y, size);
		this.image = new Image(size, size);
		this.image.src = imgSrc;
	}

	public draw(ctx: CanvasRenderingContext2D) {
    	ctx.drawImage(this.image, this.positionX, this.positionY, this.size, this.size);
	}
}

export class Enemy extends ShapeUnit {
	value: number;

	constructor(value: number, shape: Shape, x: number = 0, y: number = 0, size: number = 0, color: Color = new Color()){
		super(shape, x, y, size, color);
		this.value = value;
	}
}