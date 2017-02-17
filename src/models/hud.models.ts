import { Color } from "./color";
import { DrawableObject } from "./interfaces";
import { GraphicArtist } from "./graphic.artist";
import { SpriteDimensions } from "./dimensions";

export class PerspectiveOutOfBoundsException extends Error {
	constructor(value: number) {
		super("The perspective value '" + value + "' is not within limits [" +
			Perspective.MIN_VALUE + ", " + Perspective.MAX_VALUE + "]");
		Object.setPrototypeOf(this, PerspectiveOutOfBoundsException.prototype);
	}
}

export class Perspective {
	static readonly MIN_VALUE: number = -1;
	static readonly MAX_VALUE: number = 1;

	private value: number;

	constructor(initialValue: number = 0) {
		this.setValue(initialValue);
	}

	getValue(): number {
		return this.value;
	}

	setValue(val: number) {
		if (this.isPerspectiveValid(val)) {
			this.value = val;
		}
		else {
			throw new PerspectiveOutOfBoundsException(val);
		}
	}

	isPerspectiveValid(val: number): boolean {
		return (val >= Perspective.MIN_VALUE && val <= Perspective.MAX_VALUE);
	}
}

export class FontWeight {
	static readonly NORMAL: FontWeight = new FontWeight("normal");
	static readonly BOLD: FontWeight = new FontWeight("bold");
	static readonly BOLDER: FontWeight = new FontWeight("bolder");
	static readonly ITALIC: FontWeight = new FontWeight("italic");
	static readonly ITALIC_BOLD: FontWeight = new FontWeight("italic bold");

	private value: string;

	private constructor(value: string) {
		this.value = value;
	}

	public toString(): string {
		return this.value;
	}
}

export class FadingObject extends DrawableObject {
	static readonly FULL_OPACITY: number = 1;

	fadeDurationMillis: number = 0;
	currentFadeLength: number = 0;
	isPlaying: boolean = false;
	isAlphaKept: boolean = false;

	constructor(fadeDurationMillis: number) {
		super();
		this.fadeDurationMillis = fadeDurationMillis;
	}

	fadeIn() {
		let self = this;
		let interval = setInterval(function(){
				self.currentFadeLength += 20;
				if (self.currentFadeLength >= self.fadeDurationMillis) {
					self.currentFadeLength = self.fadeDurationMillis;
					clearInterval(interval);
				}
		}, 20);
	}
	fadeOut() {
		let self = this;
		let interval = setInterval(function(){
				self.currentFadeLength -= 20;
				if (self.currentFadeLength <= 0) {
					self.currentFadeLength = 0;
					clearInterval(interval);
				}
		}, 20);
	}

	play(durationMillis: number, isAlphaKept: boolean) {
		this.fadeIn();
		this.isPlaying = true;
		this.isAlphaKept = isAlphaKept;

		let self = this;
		setTimeout(function(){
			self.fadeOut();
			setTimeout(function(){
				self.isPlaying = false;
			}, self.fadeDurationMillis);
		}, this.fadeDurationMillis + durationMillis);
	}

	currentOpacity(): number {
		return FadingObject.FULL_OPACITY - (
				(this.currentFadeLength / this.fadeDurationMillis) *
				FadingObject.FULL_OPACITY
			);
	}

	draw(ctx: CanvasRenderingContext2D) {}
}

export class ScreenText extends FadingObject {
	positionX: number;
	positionY: number;
	text: string;
	color: Color;
	bgColor: Color;
	fontSize: number;
	fontType: string;
	fontWeight: FontWeight;
	textAlign: string;
	fadeDurationMillis: number = 0;
	currentFadeLength: number = 0;
	maxWidth: number = 0;
	isPlaying: boolean = false;
	fadeElement: HTMLCanvasElement;

	constructor(positionX: number, positionY: number, text: string, color: Color, bgColor: Color,
			fontSize: number, fontType: string, textAlign: string, fadeDurationMillis: number,
			maxWidth: number, fontWeight: FontWeight = FontWeight.NORMAL, isItalic: boolean = false) {
		super(fadeDurationMillis);
		this.positionX = positionX;
		this.positionY = positionY;
		this.text = text;
		this.color = color;
		this.fontSize = fontSize;
		this.fontType = fontType;
		this.fontWeight = fontWeight;
		this.textAlign = textAlign;
		this.fadeDurationMillis = fadeDurationMillis;
		this.maxWidth = maxWidth;
		this.bgColor = bgColor;
	}

	draw(ctx: CanvasRenderingContext2D) {
		let context = this.setFontFor(ctx);
		let alpha = context.globalAlpha;

		if (this.currentFadeLength >= 0) {
			GraphicArtist.wrapText(context, this.text, this.positionX, this.positionY,
			this.maxWidth, this.fontSize);

			context.fillStyle = this.bgColor.toStringRGB();
			context.globalAlpha = this.currentOpacity();
			context.fillRect(0, 0, context.canvas.width, context.canvas.height);

			if (!this.isAlphaKept) {
				context.globalAlpha = alpha;
			}
		}
	}

	private setFontFor(ctx: CanvasRenderingContext2D): CanvasRenderingContext2D {
		let context = ctx;

		if (context.textAlign != this.textAlign) {
				context.textAlign = this.textAlign;
		}
		if (context.fillStyle != this.color.toStringRGB()) {
			context.fillStyle = this.color.toStringRGB();
		}
		if (!this.isMatchingFont(context.font)) {
			context.font = (
				this.fontWeight.toString() + " " +
				this.fontSize.toString() + "px " +
				this.fontType
			);
		}

		return context;
	}
	private isMatchingFont(font: string): boolean {
		return (
			this.isMatchingFontSize(font) &&
			this.isMatchingFontType(font) &&
			this.isMatchingFontWeight(font)
		);
	}

	private isMatchingFontSize(font: string): boolean {
		return (font.indexOf(this.fontSize.toString()) >= 0);
	}

	private isMatchingFontWeight(font: string): boolean {
		return (font.indexOf(this.fontWeight.toString()) >= 0);
	}

	private isMatchingFontType(font: string): boolean {
		return (font.indexOf(this.fontType) >= 0);
	}
}

export class FadingImage extends FadingObject {
	dimensions: SpriteDimensions;
	spritesImg: HTMLImageElement;

	constructor(dimensions: SpriteDimensions, imgSrc: string, durationMillis: number){
		super(durationMillis);
		this.dimensions = dimensions;
		this.spritesImg = new Image();
		this.spritesImg.src = imgSrc;
	}

	draw(ctx: CanvasRenderingContext2D) {
		let alpha = ctx.globalAlpha;

		if (this.currentFadeLength >= 0) {
			ctx.globalAlpha = 1 - this.currentOpacity();

			let d = this.dimensions;
			ctx.drawImage(this.spritesImg, d.sx, d.sy, d.sWidth, d.sHeight,
				d.dx, d.dy, d.dWidth, d.dHeight);

			if (!this.isAlphaKept) {
				ctx.globalAlpha = alpha;
			}
		}
	}
}