import { Dimensions } from "./dimensions"

export class PauseButton {
	spritesImg: HTMLImageElement = null;
	pauseImgDimensions: Dimensions = null;
	playImgDimensions: Dimensions = null;
	location: Dimensions = null;
	private paused: boolean = false;

	constructor(spritesImg: HTMLImageElement, pauseImgDimensions: Dimensions, playImgDimensions: Dimensions, location: Dimensions) {
		this.spritesImg = spritesImg;
		this.pauseImgDimensions = pauseImgDimensions;
		this.playImgDimensions = playImgDimensions;
		this.location = location;
	}

	togglePause() {
		this.paused = !this.paused;
	}
	pause() {
		this.paused = true;
	}
	play() {
		this.paused = false;
	}
	isPaused() {
		return this.paused;
	}

	draw(ctx: CanvasRenderingContext2D) {
		let dimensions = this.paused ? this.pauseImgDimensions : this.playImgDimensions;
		ctx.drawImage(this.spritesImg, dimensions.x, dimensions.y, dimensions.width, dimensions.height,
			this.location.x, this.location.y, this.location.width, this.location.height);
	}
}