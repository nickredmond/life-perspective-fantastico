export class HealthBar {
	static readonly DEFAULT_HP_SIZE: number = 25;
	static readonly DEFAULT_MAX_HP: number = 3;
	static readonly HP_PADDING: number = 5;
	static readonly HP_IMG_SRC: string = "img/health-point-heart.ico";

	positionX: number;
	positionY: number;
	healthPointSize: number;
	maxHealthPoints: number;
	healthPoints: number;
	hpImage: HTMLImageElement;

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
	}

	giveHealth(){
		if (this.healthPoints < this.maxHealthPoints){
			this.healthPoints += 1;
		}
	}
	takeHealth(){
		if (this.healthPoints > 0){
			this.healthPoints -= 1;
		}
	}

	draw(ctx: CanvasRenderingContext2D){
		let imgX = this.positionX;
		for (var i = 0; i < this.healthPoints; i++){
			ctx.drawImage(this.hpImage, imgX, this.positionY, this.healthPointSize, this.healthPointSize);
			imgX += this.healthPointSize + HealthBar.HP_PADDING;
		}
	}
}