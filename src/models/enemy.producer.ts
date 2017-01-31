import { Color } from "./color";
import { Enemy, Unit } from "./unit";
import { Circle } from "./shapes";

export class EnemyProducer {
	value: number;
	size: number;
	velocity: number;
	spawnRateMilliseconds: number;
  millisTilNextSpawn: number = 0;
  hero: Unit;
	color: Color;
  canvasContext: CanvasRenderingContext2D

  constructor(value: number, size: number, velocity: number, spawnRateMillis: number,
      hero: Unit, color: Color, ctx: CanvasRenderingContext2D){
    this.value = value;
    this.size = size;
    this.velocity = velocity;
    this.spawnRateMilliseconds = spawnRateMillis;
    this.hero = hero;
    this.color = color;
    this.canvasContext = ctx;

    this.resetSpawnTimer();
  }

  public tick(dtMilliseconds): Enemy {
    let enemy = null;

    if (this.millisTilNextSpawn <= 0){
      enemy = this.generateEnemy(this.canvasContext);
      this.resetSpawnTimer();
    }
    else {
      this.millisTilNextSpawn -= dtMilliseconds;
    }

    return enemy;
  }

  private resetSpawnTimer(){
    this.millisTilNextSpawn = Math.random() * this.spawnRateMilliseconds;
  }

	private generateEnemy(ctx: CanvasRenderingContext2D): Enemy {
    let size = this.size;
    let x, y = 0;

    let direction = Math.random() * 4;
    if (direction < 1) { // top
      x = Math.random() * ctx.canvas.width
      y = -size;
    }
    else if (direction < 2) { // right
      x = ctx.canvas.width + size;
      y = Math.random() * ctx.canvas.height;
    }
    else if (direction < 3) { // bottom
      x = Math.random() * ctx.canvas.width;
      y = ctx.canvas.height + size;
    }
    else { // left
      x = -size;
      y = Math.random() * ctx.canvas.height;
    }

    let enemy = new Enemy(this.value, new Circle(ctx), x, y, size, this.color);
    let deltaX = this.hero.positionX - x;
    let deltaY = this.hero.positionY - y;
    let deltaVel = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
    let scale = this.velocity / deltaVel;
    enemy.velocityX = scale * deltaX;
    enemy.velocityY = scale * deltaY;

    return enemy;
  }
}