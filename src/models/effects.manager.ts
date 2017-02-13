import { DrawableObject } from "./interfaces";

export class EffectsManager extends DrawableObject {
	static readonly TOUCH_RADIUS = 30;

	ctx: CanvasRenderingContext2D;
	touchEffectConfig: Object = {
		"durationMillis": 500,
		"iterations": 1
	};
	touchEffects: Object[] = [];

	constructor(ctx: CanvasRenderingContext2D) {
		super();
		this.ctx = ctx;
	}

	startTouchEffect(x: number, y: number) {
		this.touchEffects.push({
			"millisLeft": this.touchEffectConfig["durationMillis"],
			"iterations": this.touchEffectConfig["iterations"],
			"x": x, "y": y
		});
	}

	update(dtMilliseconds: number) {
		let self = this;
		this.touchEffects.forEach(function(effect, index){
			self.touchEffects[index]["millisLeft"] -= dtMilliseconds;
		})
		this.touchEffects = this.touchEffects.filter(function(effect){
			return effect["millisLeft"] > 0;
		});
	}

	draw(ctx: CanvasRenderingContext2D = null) {
		let self = this;
		this.touchEffects.forEach(function(effect){
			let millisPerDuration = self.touchEffectConfig["durationMillis"] / effect["iterations"];
			let iterationsLeft = Math.ceil(effect["millisLeft"] / millisPerDuration);
			let durationLeft = effect["millisLeft"] - (millisPerDuration * (iterationsLeft - 1));
			let totalDuration = self.touchEffectConfig["durationMillis"] / iterationsLeft;
			let radius = (1 - (durationLeft / totalDuration)) * EffectsManager.TOUCH_RADIUS;
			let opacity = (durationLeft / totalDuration);

			self.ctx.fillStyle = "rgba(255, 255, 255, " + opacity + ")";
			self.ctx.beginPath();
	    	self.ctx.arc(effect["x"], effect["y"], radius, 0, 2 * Math.PI);
	    	self.ctx.fill();
		});
	}
}