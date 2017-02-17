import { Color } from "./color";
import { Shape } from "./shapes";
import { Dimensions } from "./dimensions";
import { ExtendedMath } from "./extendedmath";
import { Perspective } from "./hud.models";

export abstract class Unit {
	isAlive: boolean = true;
	positionX: number;
	positionY: number;
	velocityX: number = 0;
	velocityY: number = 0;
	size: number;
	isDrawn: boolean = false;
	needsDraw: Function = null;
	ctx: CanvasRenderingContext2D;

	constructor(x: number = 0, y: number = 0, size: number = 0){
		this.positionX = x;
		this.positionY = y;
		this.size = size;
	}

	public intersects(otherUnit: Unit): boolean {
		return (ExtendedMath.distance(this.positionX, this.positionY, otherUnit.positionX, otherUnit.positionY)
			< (otherUnit.radius() + this.radius()));
	}

	radius(): number {
		return this.size / 2;
	}
	public update(dt) {
		if (!this.isDrawn && this.ctx){
			this.needsDraw(this.ctx);
		} else {
			this.isDrawn = false;
		}
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
    	this.shape.draw(this.color, this.positionX, this.positionY, this.radius());
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
    		this.srcDimensions.height, this.positionX - this.radius(), this.positionY - this.radius(), this.size, this.size);
	}
}

export class CharacterUnit extends ImageUnit {
	leftSrcDimensions: Dimensions[] = [];
	selectedDimension: number;

	constructor(spritesImage: HTMLImageElement, leftDimensions: Dimensions[], rightDimensions: Dimensions[],
			x: number = 0, y: number = 0, size: number = 0, name: string = null){
		super(spritesImage, rightDimensions[0], x, y, size);
		this.leftSrcDimensions = leftDimensions;
		this.needsDraw = this.draw;
		this.selectedDimension = 0;
	}

	radius(): number {
		return this.size / 1.5;
	}
	public draw(ctx: CanvasRenderingContext2D) {
		if (!this.ctx) {
			this.ctx = ctx;
		}
		let srcRect = (this.velocityX < 0) ?
			this.leftSrcDimensions[this.selectedDimension] :
			this.srcDimensions[this.selectedDimension];
		ctx.drawImage(this.sourceImg, srcRect.x, srcRect.y, srcRect.width, srcRect.height,
			(this.positionX - this.radius()), (this.positionY - this.radius()), this.size, this.size);
		this.isDrawn = true;
	}
}

export class HeroUnit extends CharacterUnit {
	perspective: Perspective = new Perspective();

	constructor(initialPerspective: number, spritesImage: HTMLImageElement, leftDimensions: Dimensions[], rightDimensions: Dimensions[],
			x: number = 0, y: number = 0, size: number = 0, name: string = null) {
		super(spritesImage, leftDimensions, rightDimensions, x, y, size, name);
		this.perspective.setValue(initialPerspective);
	}
}