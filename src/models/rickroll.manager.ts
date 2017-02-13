import { DrawableObject } from "./interfaces";
import {Http} from '@angular/http';

export class RickRollManager extends DrawableObject {
	static readonly DEFAULT_LINK_ID: string = "rickRollLink";
	static readonly MAX_MILLIS_BETWEEN_PAUSES: number = 1000;
	static readonly DEFAULT_TRIGGER_AMT = 10;
	static readonly DEFAULT_HINT_AMT = 6;
	static readonly FADE_MILLIS = 1000;

	http: Http;
	linkID: string = null;
	triggerAmount: number = 0;
	numberOfPauses: number = 0;
	millisSincePause: number = 0;
	hintAmount: number = 0;
	words: Object = {
		"6": {
			"text": "The",
			"yLoc": 0.2
		},
		"7": {
			"text": "Amazing",
			"yLoc": 0.35
		},
		"8": {
			"text": "Random",
			"yLoc": 0.65
		},
		"9": {
			"text": "Web",
			"yLoc": 0.8
		}
	};

	constructor(http: Http, linkID: string = RickRollManager.DEFAULT_LINK_ID,
			triggerAmount: number = RickRollManager.DEFAULT_TRIGGER_AMT,
			hintAmount: number = RickRollManager.DEFAULT_HINT_AMT){
		super();
		this.http = http;
		this.linkID = linkID;
		this.triggerAmount = triggerAmount;
		this.hintAmount = hintAmount;
	}

	update(dtMilliseconds: number) {
		this.millisSincePause += dtMilliseconds;
	}
	draw(ctx: CanvasRenderingContext2D = null) {
		if (this.numberOfPauses >= this.hintAmount) {
			if (ctx.textAlign != "center"){
				ctx.textAlign = "center";
			}
			if (ctx.font != "48px Courier") {
				ctx.font = "48px Courier";
			}

			let opacity = Math.max(0, RickRollManager.FADE_MILLIS - this.millisSincePause) /
								RickRollManager.FADE_MILLIS;
			ctx.fillStyle = "rgba(255, 255, 255, " + opacity + ")";

			let word = this.words[this.numberOfPauses.toString()];
			// console.log("yep " + opacity + " and (" + (ctx.canvas.width / 2) +", " + (ctx.canvas.height * word["yLoc"]) + ")");
			ctx.fillText(word["text"], ctx.canvas.width / 2, ctx.canvas.height * word["yLoc"]);
		}
	}

	onPaused() {
		if (this.millisSincePause > RickRollManager.MAX_MILLIS_BETWEEN_PAUSES){
			this.numberOfPauses = 0;
		}
		this.millisSincePause = 0;

		this.numberOfPauses += 1;
		if (this.numberOfPauses >= this.triggerAmount) {
			this.numberOfPauses = 0;

			//.map(res => res.json()).subscribe((data) => {
			this.http.get("https://api.myjson.com/bins/17gl8x").map(res => res.json()).subscribe((data) => {
				let bucketName = data["urouletteBucketName"];
				window.open('http://www.uroulette.com/visit/' + bucketName, '_system', 'location=yes');
			});
			// let link = <HTMLAnchorElement>document.getElementById(this.linkID);
			// link.href = ""
		}
	}
}