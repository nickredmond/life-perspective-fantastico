import { Color } from "./color";
import { Shape } from "./shapes";
import { Dimensions } from "./dimensions";

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
		let x_diff_squared = Math.pow(otherUnit.positionX - this.positionX, 2);
		let y_diff_squared = Math.pow(otherUnit.positionY - this.positionY, 2);
		let distance = Math.sqrt(x_diff_squared + y_diff_squared);
		let size = isEnemy ? (this.size * 0.8) : this.size;
		return distance < (size + otherUnit.size);
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
	sourceImg: HTMLImageElement;
	srcDimensions: Dimensions;

	constructor(spritesImage: HTMLImageElement, srcDimensions: Dimensions,
			x: number = 0, y: number = 0, size: number = 0) {
		super(x, y, size);
		this.sourceImg = spritesImage;
		this.srcDimensions = srcDimensions;
	}

	public draw(ctx: CanvasRenderingContext2D) {
    	ctx.drawImage(this.sourceImg, this.srcDimensions.x, this.srcDimensions.y, this.srcDimensions.width,
    		this.srcDimensions.height, this.positionX, this.positionY, this.size, this.size);
	}
}

export class Enemy extends ImageUnit {
	value: number;
	leftSrcDimensions: Dimensions;
	name: string;

	constructor(value: number, spritesImage: HTMLImageElement, leftDimensions: Dimensions, rightDimensions: Dimensions,
			x: number = 0, y: number = 0, size: number = 0, name: string = null){
		super(spritesImage, rightDimensions, x, y, size);
		this.value = value;
		this.leftSrcDimensions = leftDimensions;
		this.name = name;
	}

	radius(): number {
		return this.size / 1.5;
	}
	public draw(ctx: CanvasRenderingContext2D) {
		let srcRect = (this.velocityX < 0) ? this.leftSrcDimensions : this.srcDimensions;
		ctx.drawImage(this.sourceImg, srcRect.x, srcRect.y, srcRect.width, srcRect.height,
			(this.positionX - this.radius()), (this.positionY - this.radius()), this.size, this.size);
	}
}