import { Color } from "./color";
import { Enemy, ImageUnit, Unit } from "./unit";
import { Circle } from "./shapes";

export class UnitProducer {
	size: number;
	velocity: number;
	spawnRateMilliseconds: number;
  millisTilNextSpawn: number = 0;
  canvasContext: CanvasRenderingContext2D;

  constructor(size: number, velocity: number, spawnRateMillis: number, ctx: CanvasRenderingContext2D){
    this.size = size;
    this.velocity = velocity;
    this.spawnRateMilliseconds = spawnRateMillis;
    this.canvasContext = ctx;

    this.resetSpawnTimer();
  }

  public tick(dtMilliseconds, generateFunction = null): Unit {
    let unit = null;

    if (this.millisTilNextSpawn <= 0){
      unit = generateFunction(this, this.canvasContext);
      this.resetSpawnTimer();
    }
    else {
      this.millisTilNextSpawn -= dtMilliseconds;
    }

    return unit;
  }

  private resetSpawnTimer(){
    this.millisTilNextSpawn = Math.random() * this.spawnRateMilliseconds;
  }
}

export class EnemyProducer extends UnitProducer {
  value: number;
  color: Color;
  hero: Unit;

  constructor(value: number, size: number, velocity: number, spawnRateMillis: number,
      hero: Unit, color: Color, ctx: CanvasRenderingContext2D){
    super(size, velocity, spawnRateMillis, ctx);
    this.hero = hero;
    this.value = value;
    this.color = color;
  }

  public tick(dtMilliseconds, generateFunction = null): Unit {
    return UnitProducer.prototype.tick.call(this, dtMilliseconds, this.generateEnemy);
  }

	generateEnemy(producer: UnitProducer, ctx: CanvasRenderingContext2D): Enemy {
    let size = producer.size;
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

    let enemy = new Enemy((<EnemyProducer>producer).value, new Circle(ctx), x, y, size, (<EnemyProducer>producer).color);
    let deltaX = (<EnemyProducer>producer).hero.positionX - x;
    let deltaY = (<EnemyProducer>producer).hero.positionY - y;
    let deltaVel = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
    let scale = producer.velocity / deltaVel;
    enemy.velocityX = scale * deltaX;
    enemy.velocityY = scale * deltaY;

    return enemy;
  }
}

export class ItemProducer extends UnitProducer {
  imgSrc: string;

  constructor(imgSrc: string, size: number, velocity: number, spawnRateMillis: number,
      ctx: CanvasRenderingContext2D){
    super(size, velocity, spawnRateMillis, ctx);
    this.imgSrc = imgSrc;
  }

  tick(dtMilliseconds: number, generateFunction = null): Unit {
    return UnitProducer.prototype.tick.call(this, dtMilliseconds, this.generateItem);
  }

  generateItem(producer: UnitProducer, ctx: CanvasRenderingContext2D): ImageUnit {
    let size = producer.size;
    let x, y, deltaX, deltaY = 0;

    let direction = Math.random() * 4;
    if (direction < 1) { // top
      x = Math.random() * ctx.canvas.width
      y = -size;
      deltaX = (Math.random() * ctx.canvas.width) - x;
      deltaY = ctx.canvas.height + size;
    }
    else if (direction < 2) { // right
      x = ctx.canvas.width + size;
      y = Math.random() * ctx.canvas.height;
      deltaX = -size;
      deltaY = (Math.random() * ctx.canvas.height) - y;
    }
    else if (direction < 3) { // bottom
      x = Math.random() * ctx.canvas.width;
      y = ctx.canvas.height + size;
      deltaX = (Math.random() * ctx.canvas.width) - x;
      deltaY = -size;
    }
    else { // left
      x = -size;
      y = Math.random() * ctx.canvas.height;
      deltaX = ctx.canvas.width + size;
      deltaY = (Math.random() * ctx.canvas.height) - y;
    }

    let item = new ImageUnit((<ItemProducer>producer).imgSrc, x, y, size);
    let deltaVel = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
    let scale = producer.velocity / deltaVel;
    item.velocityX = scale * deltaX;
    item.velocityY = scale * deltaY;

    return item;
  }
}