import { ExtendedMath } from "./extendedmath";
import { ShapeUnit } from "./unit";
import { BallVsWildPage } from "../pages/ball-vs-wild/ball-vs-wild";
import { SpriteDimensions } from "./dimensions";

export class HealthBar {
	static readonly DEFAULT_HP_SIZE: number = 25;
	static readonly DEFAULT_MAX_HP: number = 3;
	static readonly HP_PADDING: number = 5;
	static readonly HP_IMG_SRC: string = "img/health-point-heart.ico";
	static readonly SHIELD_IMG_SRC: string = "img/sprites.png";
	static readonly SHIELD_IMG_DIMENSIONS: Object = {
		"dx": 300,
		"dy": 300,
		"dWidth": 150,
		"dHeight": 150
	};

	positionX: number;
	positionY: number;
	healthPointSize: number;
	maxHealthPoints: number;
	healthPoints: number;
	hpImage: HTMLImageElement;
	shieldImage: HTMLImageElement;
	private isShielded: boolean = false;

	constructor(positionX: number, positionY: number,
			maxHP: number = HealthBar.DEFAULT_MAX_HP,
			hpSize: number = HealthBar.DEFAULT_HP_SIZE){
		this.positionX = positionX;
		this.positionY = positionY;
		this.healthPointSize = hpSize;
		this.maxHealthPoints = maxHP;
		this.healthPoints = maxHP;

		this.hpImage = new Image();
		this.hpImage.src = HealthBar.HP_IMG_SRC;
		this.shieldImage = new Image();
		this.shieldImage.src = HealthBar.SHIELD_IMG_SRC;
	}

	giveHealth(){
		if (this.healthPoints < this.maxHealthPoints){
			this.healthPoints += 1;
		}
	}
	takeHealth(){
		if (this.healthPoints > 0){
			if (this.isShielded) {
				this.isShielded = false;
			} else {
				this.healthPoints -= 1;
			}
		}
	}
	addShield(){
		if (!this.isShielded && this.healthPoints > 0) {
			this.isShielded = true;
		}
	}

	draw(ctx: CanvasRenderingContext2D){
		let imgX = this.positionX;
		for (var i = 0; i < this.healthPoints; i++){
			ctx.drawImage(this.hpImage, imgX, this.positionY, this.healthPointSize, this.healthPointSize);
			imgX += this.healthPointSize + HealthBar.HP_PADDING;
		}
		if (this.isShielded) {
			let d = HealthBar.SHIELD_IMG_DIMENSIONS;
			ctx.drawImage(this.shieldImage, d["dx"], d["dy"], d["dWidth"], d["dHeight"], imgX, this.positionY, this.healthPointSize, this.healthPointSize);
		}
	}
}

export class PowerupBar {
	static readonly DEFAULT_BLINK_RATE: number = 350;

	height: number;
	width: number;
	positionX: number;
	positionY: number;
	maxPoints: number;
	currentPoints: number = 0;
	barFilledPhrase: string;
	blinkRateMillis: number;
	isTextShowing: boolean = false;
	millisSinceBlink: number = 0;
	page: BallVsWildPage;

	constructor(width: number, height: number, maxPoints: number,
			x: number = 0, y: number = 0, page: BallVsWildPage,
			barFilledPhrase: string = "READY",
			blinkRateMillis = PowerupBar.DEFAULT_BLINK_RATE) {
		this.height = height;
		this.width = width;
		this.maxPoints = maxPoints;
		this.barFilledPhrase = barFilledPhrase;
		this.blinkRateMillis = blinkRateMillis;
		this.positionX = x;
		this.positionY = y;
		this.page = page;
	}

	addPoints(points: number) {
		if (this.currentPoints < this.maxPoints) {
			let pointsToAdd = Math.min(this.pointsLeft(), points);
			this.currentPoints += pointsToAdd;
			if (this.currentPoints >= this.maxPoints){
				this.isTextShowing = true;
			}
		}
	}

	isPowerupEnabled(): boolean {
		return this.currentPoints >= this.maxPoints;
	}

	expend() {
		throw new Error("Cannot call expend() in base class!");
	}
	clearBar() {
		this.currentPoints = 0;
		this.millisSinceBlink = 0;
		this.isTextShowing = false;
	}

	update(dtMilliseconds: number) {
		if (this.isPowerupEnabled()) {
			this.millisSinceBlink += dtMilliseconds;
			if (this.millisSinceBlink >= this.blinkRateMillis ||
					(this.millisSinceBlink >= (0.5 * this.blinkRateMillis) && this.isTextShowing === false)) {
				this.isTextShowing = !this.isTextShowing;
				this.millisSinceBlink = 0;
			}
		}
	}

	draw(ctx: CanvasRenderingContext2D) {
		if (this.currentPoints > 0) {
			let percentFilled = this.currentPoints / this.maxPoints;
			let fillWidth = Math.floor(percentFilled * this.width);
			ctx.fillStyle = "white";
			ctx.fillRect(this.positionX, this.positionY, fillWidth, this.height);

			if (this.isTextShowing) {
				if (ctx.font != "22px Courier") {
					ctx.font = "22px Courier";
				}
				if (ctx.textAlign != "center") {
					ctx.textAlign = "center";
				}
				let centerX = ctx.canvas.width / 2;
				ctx.fillText(this.barFilledPhrase, centerX, this.positionY - 10);
			}
		}
	}

	protected pointsLeft(): number {
		return this.maxPoints - this.currentPoints;
	}

	protected throwPrematureExpendError() {
		throw new Error("Cannot expend powerup: " + this.pointsLeft() + " pts needed!");
	}
}

export class PowerupSelector {
	selectedIndex: number = 999999;
	powerupBars: PowerupBar[] = [];
	dimensions: SpriteDimensions[];
	spritesImage: HTMLImageElement;
	canvasContext: CanvasRenderingContext2D = null;

	constructor(powerupBars: PowerupBar[], dimensions: SpriteDimensions[], spritesImg: HTMLImageElement, ctx: CanvasRenderingContext2D) {
		this.powerupBars = powerupBars;
		this.dimensions = dimensions;
		this.canvasContext = ctx;
		this.spritesImage = spritesImg;
	}

	clearBars() {
		this.powerupBars.forEach(function(powerupBar){
			powerupBar.clearBar();
		});
	}
	updatePowerupbars(dtMilliseconds: number) {
		this.powerupBars.forEach(function(powerupBar){
			powerupBar.update(dtMilliseconds);
		});
	}
	draw() {
		this.powerupBars[this.selectedIndex].draw(this.canvasContext);
		let self = this;
		this.dimensions.forEach(function(dimension, index){
			let ctx = self.canvasContext;
			let d = dimension;
			ctx.drawImage(self.spritesImage,
				d.sx, d.sy, d.sWidth, d.sHeight,
				d.dx, d.dy, d.dWidth, d.dHeight
			);
			if (index === self.selectedIndex) {
				let thickness = 2;
				if (ctx.fillStyle != "white") {
					ctx.fillStyle = "white";
				}
				ctx.fillRect(d.dx, d.dy, Math.max(5, ctx.canvas.width * 0.03), thickness);
				ctx.fillRect(d.dx, d.dy, thickness, Math.max(5, ctx.canvas.width * 0.03));

				ctx.fillRect(d.dx + d.dWidth - Math.max(5, ctx.canvas.width * 0.03), d.dy, Math.max(5, ctx.canvas.width * 0.03), thickness);
				ctx.fillRect(d.dx + d.dWidth, d.dy, thickness, Math.max(5, ctx.canvas.width * 0.03));

				ctx.fillRect(d.dx + d.dWidth - Math.max(5, ctx.canvas.width * 0.03), d.dy + d.dHeight, Math.max(5, ctx.canvas.width * 0.03), thickness);
				ctx.fillRect(d.dx + d.dWidth, d.dy + d.dHeight - Math.max(5, ctx.canvas.width * 0.03), thickness, Math.max(5, ctx.canvas.width * 0.03) + thickness);

				ctx.fillRect(d.dx, d.dy + d.dHeight, Math.max(5, ctx.canvas.width * 0.03), thickness);
				ctx.fillRect(d.dx, d.dy + d.dHeight - Math.max(5, ctx.canvas.width * 0.03), thickness, Math.max(5, ctx.canvas.width * 0.03));
			}
		});
	}
}

export class ShieldBar extends PowerupBar {
	constructor(page: BallVsWildPage, width: number, height: number, maxPoints: number,
			x: number = 0, y: number = 0, barFilledPhrase: string = "READY",
			blinkRateMillis = PowerupBar.DEFAULT_BLINK_RATE) {
		super(width, height, maxPoints, x, y, page, barFilledPhrase, blinkRateMillis);
	}

	expend() {
		if (this.isPowerupEnabled()) {
			this.page.healthBar.addShield();
			this.clearBar();
		} else {
			this.throwPrematureExpendError();
		}
	}
}

export class RadialShotBar extends PowerupBar {
	constructor(page: BallVsWildPage, width: number, height: number, maxPoints: number,
			x: number = 0, y: number = 0, barFilledPhrase: string = "READY",
			blinkRateMillis = PowerupBar.DEFAULT_BLINK_RATE) {
		super(width, height, maxPoints, x, y, page, barFilledPhrase, blinkRateMillis);
	}

	expend() {
		if (this.isPowerupEnabled()) {
			this.executeRadialShot();
			this.clearBar();
		} else {
			this.throwPrematureExpendError();
		}
	}

	private executeRadialShot() {
		let startingDegrees = Math.random() * 360;
		let startingRadians = ExtendedMath.toRadians(startingDegrees);
		let size = Math.max(10, this.page.canvasContext.canvas.width * 0.04);

		for (var i = 0; i < 8; i++) {
			let radians = startingRadians + (BallVsWildPage.RADIANS_PER_PROJECTILE * i);
			let xVelocityRatio = Math.cos(radians);
			let yVelocityRatio = Math.sin(radians);
			let nextProjectile = new ShapeUnit(this.page.projectileShape, this.page.hero.positionX,
			  this.page.hero.positionY, size, BallVsWildPage.PROJECTILE_COLOR);
			nextProjectile.velocityX = xVelocityRatio * BallVsWildPage.MIN_SHOT_VELOCITY;
			nextProjectile.velocityY = yVelocityRatio * BallVsWildPage.MIN_SHOT_VELOCITY;

			this.page.projectiles.push(nextProjectile);
		}
	}
}