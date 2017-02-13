import { DrawableObject } from "./interfaces";

export class RenderingEngine {
	fgContext: CanvasRenderingContext2D = null;
	bgContext: CanvasRenderingContext2D = null;
	bgObjects: DrawableObject[] = [];
	fgObjects: DrawableObject[] = [];
	private isForegroundSuspended: boolean = false;
	private isBackgroundSuspended: boolean = false;

	constructor(foreground: HTMLCanvasElement, background: HTMLCanvasElement,
			width: number = window.innerWidth, height: number = window.innerHeight) {
		this.fgContext = foreground.getContext("2d");
    	this.bgContext = background.getContext("2d");

    	this.bgContext.canvas.width = width;
	    this.bgContext.canvas.height = height;
	    this.bgContext.canvas.style.backgroundColor = "#000";

	    this.fgContext.canvas.width = width;
	    this.fgContext.canvas.height = height;
	    this.fgContext.canvas.style.backgroundColor = "transparent";
	}

	addBackgroundObject(objToAdd: DrawableObject) {
		this.bgObjects.push(objToAdd);
	}
	addForegroundObject(objToAdd: DrawableObject) {
		this.fgObjects.push(objToAdd);
	}

	removeBackgroundObject(objToRemove: DrawableObject) {
		let i = this.bgObjects.indexOf(objToRemove);
		this.bgObjects.splice(i, 1);
	}
	removeForegroundObject(objToRemove: DrawableObject) {
		let i = this.fgObjects.indexOf(objToRemove);
		this.fgObjects.splice(i, 1);
	}

	redrawBackground(){
		if (!this.isBackgroundSuspended) {
			let self = this;
			this.bgContext.clearRect(0, 0, this.bgContext.canvas.width, this.bgContext.canvas.height);
			this.bgObjects.forEach(function(obj){
				obj.draw(self.bgContext);
			});
		}
	}
	redrawForeground(){
		if (!this.isForegroundSuspended) {
			let self = this;
			this.fgContext.clearRect(0, 0, this.fgContext.canvas.width, this.fgContext.canvas.height);
			this.fgObjects.forEach(function(obj){
				obj.draw(self.fgContext);
			});
		}
	}


	suspendBackground(){
		this.bgContext.clearRect(0, 0, this.bgContext.canvas.width, this.bgContext.canvas.height);
		this.isBackgroundSuspended = true;
	}
	resumeBackground(){
		this.isBackgroundSuspended = false;
	}

	suspendForeground(){
		this.fgContext.clearRect(0, 0, this.fgContext.canvas.width, this.fgContext.canvas.height);
		this.isForegroundSuspended = true;
	}
	resumeForeground(){
		this.isForegroundSuspended = false;
	}

	clearBackground(){
		this.bgObjects.splice(0, this.bgObjects.length);
	}

	private includes(array: DrawableObject[], obj: DrawableObject): boolean {
		let isIncluded = false;

		for (var i = 0; i < array.length && !isIncluded; i++){
			isIncluded = (array[i] === obj);
		}

		return isIncluded;
	}
	isInBackground(obj: DrawableObject): boolean {
		return this.includes(this.bgObjects, obj);
	}

	// COLLECTIVE METHODS

	redraw(){
		this.redrawBackground();
		this.redrawForeground();
	}
	suspend(){
		this.suspendBackground();
		this.suspendForeground();
	}
	resume(){
		this.resumeBackground();
		this.resumeForeground();
	}
}