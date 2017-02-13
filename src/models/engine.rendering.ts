import { DrawableObject } from "./interfaces";

export class RenderingEngine {
	fgContext: CanvasRenderingContext2D = null;
	bgContext: CanvasRenderingContext2D = null;
	bgObjects: DrawableObject[] = [];
	fgObjects: DrawableObject[] = [];

	constructor(foreground: HTMLCanvasElement, background: HTMLCanvasElement) {
		this.fgContext = foreground.getContext("2d");
    	this.bgContext = background.getContext("2d");
	}

	addBackgroundObject(objToAdd: DrawableObject) {
		this.bgObjects.push(objToAdd);
	}
	addForegroundObject(objToAdd: DrawableObject) {
		this.fgObjects.push(objToAdd);
	}

	redrawBackground(){
		let self = this;
		this.bgObjects.forEach(function(obj){
			obj.draw(self.bgContext);
		});
	}
	redrawForeground(){
		let self = this;
		this.fgObjects.forEach(function(obj){
			obj.draw(self.fgContext);
		});
	}
}