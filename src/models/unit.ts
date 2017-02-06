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

	public intersects(otherUnit: Unit, isEnemy = false): boolean {
		// let trueSize = isEnemy ? this.size * 1.5 : this.size;
		// return !(otherUnit.positionX > (this.positionX + trueSize) ||
		// 	(otherUnit.positionX + otherUnit.size) < this.positionX ||
		// 	otherUnit.positionY > (this.positionY + trueSize) ||
		// 	(otherUnit.positionY + otherUnit.size) < this.positionY)
		let x_diff_squared = Math.pow(otherUnit.positionX - this.positionX, 2);
		let y_diff_squared = Math.pow(otherUnit.positionY - this.positionY, 2);
		let distance = Math.sqrt(x_diff_squared + y_diff_squared);
		return distance < (this.size + otherUnit.size);
	}

	radius(): number {
		return this.size / 2;
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
    	this.shape.draw(this.color, this.positionX + this.radius(), this.positionY + this.radius(), this.size);
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

export class Enemy extends ImageUnit {
	value: number;
	imgSrc: string;

	constructor(value: number, imgSrc: string, x: number = 0, y: number = 0, size: number = 0){
		super(imgSrc, x, y, size);
		this.value = value;
		this.imgSrc = imgSrc;
	}

	radius(): number {
		return this.size / 1.5;
	}
	public draw(ctx: CanvasRenderingContext2D) {
		let isFlipped = false;
		if (this.velocityX < 0) {
			ctx.translate(ctx.canvas.width, 0);
			ctx.scale(-1, 1);
			isFlipped = true;
		}

		let image = new Image();
		image.src = this.imgSrc;
		ctx.drawImage(image, (this.positionX - this.radius()), (this.positionY - this.radius()), this.size, this.size);

		if (isFlipped) {
			ctx.translate(ctx.canvas.width, 0)
			ctx.scale(-1, 1);
		}
	}
}