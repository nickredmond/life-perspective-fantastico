import { Component } from "@angular/core";
import { Storage } from "@ionic/storage";
import { Unit, Enemy } from "../../models/unit";
import { Color } from "../../models/color";
import { Circle } from "../../models/shapes";
import { ExtendedMath } from "../../models/extendedmath";
import { HealthBar } from "../../models/healthbar";
import { EnemyProducer } from "../../models/enemy.producer";

@Component({
  selector: 'ball-vs-wild',
  templateUrl: 'ball-vs-wild.html'
})
export class BallVsWildPage {
  static readonly FPS: number = 60;
  static readonly MILLIS_PER_SECOND: number = 1000;

  xVelocities: number[] = [];
  yVelocities: number[] = [];

  heroTopLeftX: number;
  heroTopLeftY: number;
  score: number = 0;
  highScore: number = 0;
  hero: Unit = null;
  healthBar: HealthBar = null;
  projectiles: Unit[] = [];
  enemies: Enemy[] = [];
  enemyGenerators: EnemyProducer[] = [];

  canvasContext: CanvasRenderingContext2D = null;
  storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
    this.storage.get("highScore").then((val) => {
      if (val === null){
        this.storage.set("highScore", 0);
      }
      else {
        this.highScore = val;
      }
    });

    this.healthBar = new HealthBar(15, 15);
    let dtMillis = BallVsWildPage.MILLIS_PER_SECOND / BallVsWildPage.FPS;

    setInterval((
      function(self, dtMilliseconds){
        return function() {
          if (self.canvasContext){
            let ctx = self.canvasContext;
            ctx.fillStyle = "white";
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            if (self.healthBar.healthPoints > 0){
              self.gameTick(dtMilliseconds);
            }
            else {
              let centerX = ctx.canvas.width / 2;
              let centerY = ctx.canvas.height / 2;

              ctx.font = "30px Courier";
              ctx.textAlign = "center";
              ctx.fillText("You have died.", centerX, centerY - 20);
              ctx.fillText("SCORE: " + self.score, centerX, centerY + 15);

              ctx.font = "18px Courier";
              ctx.fillText("(Tap to retry)", centerX, centerY + 50);
            }
          }
        };
      })(this, dtMillis), dtMillis);
  }

  updateHighScore(){
    if (this.score > this.highScore){
      this.storage.set("highScore", this.score);
      this.highScore = this.score;
    }
  }

  gameTick(dtMilliseconds: number){
    for (var i = 0; i < this.enemyGenerators.length; i++){
      let enemy = this.enemyGenerators[i].tick(dtMilliseconds);
      if (enemy != null){
        this.enemies.push(enemy);
      }
    }

    this.projectiles = this.projectiles.filter(function(proj){
      return proj.isAlive;
    });
    for (var i = 0; i < this.projectiles.length; i++){
      let projectile = this.projectiles[i];
      if (projectile.positionX < -projectile.size || projectile.positionX > (this.canvasContext.canvas.width + projectile.size) ||
            projectile.positionY < -projectile.size || projectile.positionY > (this.canvasContext.canvas.height + projectile.size)){
        projectile.isAlive = false;
      }
      else {
        projectile.update(dtMilliseconds / BallVsWildPage.MILLIS_PER_SECOND);
        projectile.draw(this.canvasContext);
      }
    }

    this.enemies = this.enemies.filter(function(enemy){
      return enemy.isAlive;
    });
    for (var i = 0; i < this.enemies.length; i++){
      let enemy = this.enemies[i];
      if (this.hero.intersects(enemy)){
        if (this.healthBar.healthPoints === 1){
          this.updateHighScore();
        }
        this.healthBar.takeHealth();
        enemy.isAlive = false;
      }
      else {
        enemy.update(dtMilliseconds / BallVsWildPage.MILLIS_PER_SECOND);
        enemy.draw(this.canvasContext);
      }
    }

    for (var j = 0; j < this.enemies.length; j++){
      for (var k = 0; k < this.projectiles.length; k++){
        if (this.enemies[j].intersects(this.projectiles[k])){
          this.score += this.enemies[j].value;
          this.enemies[j].isAlive = false;
          this.projectiles[k].isAlive = false;
        }
      }
    }

    if (this.hero){
      this.hero.draw(this.canvasContext);
    }
    this.healthBar.draw(this.canvasContext);

    let ctx = this.canvasContext;
    let scoreX = ctx.canvas.width - 15;

    ctx.font = "18px Courier";
    ctx.fillStyle = "#AAA";
    ctx.textAlign = "right";
    ctx.fillText("HI SCORE: " + this.highScore, scoreX, 30);

    ctx.font = "30px Courier";
    ctx.fillStyle = "white";
    ctx.fillText(this.score.toString(), scoreX, 60);
  }

  onDragGesture(event){
    this.xVelocities.push(event.velocityX);
    this.yVelocities.push(event.velocityY);
  }
  onTouchEnd(event) {
    if (this.healthBar.healthPoints === 0){
      this.healthBar.healthPoints = HealthBar.DEFAULT_MAX_HP;
      this.projectiles = [];
      this.enemies = [];
      this.score = 0;
    }
    else if (this.xVelocities.length > 0 && this.yVelocities.length > 0) {
      let averageVelocityX = ExtendedMath.average(this.xVelocities);
      let averageVelocityY = ExtendedMath.average(this.yVelocities);

      let projShape = new Circle(this.canvasContext);
      let nextProjectile = new Unit(projShape, this.heroTopLeftX, this.heroTopLeftY,
        5, Color.fromHexValue("#FF0000"));
      nextProjectile.velocityX = averageVelocityX * 100;
      nextProjectile.velocityY = averageVelocityY * 100;
      this.projectiles.push(nextProjectile);

      this.xVelocities = [];
      this.yVelocities = [];
    }
  }

  ionViewDidEnter() {
  	let canvas = <HTMLCanvasElement>document.getElementById("mainCanvas");
    this.canvasContext = canvas.getContext("2d");

    this.canvasContext.canvas.width = window.screen.width;
    this.canvasContext.canvas.height = window.screen.height - document.getElementById("viewHeader").offsetHeight - 8;
    this.canvasContext.canvas.style.backgroundColor = "#000";

    console.log("bridges: " + this.canvasContext.canvas.offsetTop + ", " + this.canvasContext.canvas.height);
    let size = 25;
    this.heroTopLeftX = (this.canvasContext.canvas.width / 2) - (size / 2); //(window.innerWidth / 2) - (size / 2);
    this.heroTopLeftY = (this.canvasContext.canvas.height / 2) - (size / 2);
    let heroColor = Color.fromHexValue("#0200FF");
    let heroShape = new Circle(this.canvasContext);
    this.hero = new Unit(heroShape, this.heroTopLeftX, this.heroTopLeftY, size, heroColor);

    this.enemyGenerators.push(new EnemyProducer(10, 20, 100, 4000, this.hero, Color.fromHexValue("#FFF000"), this.canvasContext));
    this.enemyGenerators.push(new EnemyProducer(25, 10, 200, 6000, this.hero, Color.fromHexValue("#00FF00"), this.canvasContext));
  }
}
