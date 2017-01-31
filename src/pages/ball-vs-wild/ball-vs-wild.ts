import { Component } from "@angular/core";
import { Unit } from "../../models/unit";
import { Color } from "../../models/color";
import { Circle } from "../../models/shapes";
import { PositionTuple } from "../../models/position.tuple";
import { ExtendedMath } from "../../models/extendedmath";
import { HealthBar } from "../../models/healthbar"

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
  hero: Unit = null;
  healthBar: HealthBar = null;
  projectiles: Unit[] = [];
  canvasContext: CanvasRenderingContext2D = null;

  constructor() {
    this.healthBar = new HealthBar(15, 15);
    let dtMillis = BallVsWildPage.MILLIS_PER_SECOND / BallVsWildPage.FPS;

    setInterval((
      function(self){
        return function() {
          if (self.canvasContext){
            let ctx = self.canvasContext;
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            self.projectiles = self.projectiles.filter(function(proj){
              return proj.isAlive;
            });
            for (var i = 0; i < self.projectiles.length; i++){
              let projectile = self.projectiles[i];
              if (projectile.positionX < -projectile.size || projectile.positionX > (ctx.canvas.width + projectile.size) ||
                    projectile.positionY < -projectile.size || projectile.positionY > (ctx.canvas.height + projectile.size)){
                projectile.isAlive = false;
              }
              else {
                projectile.update(dtMillis / BallVsWildPage.MILLIS_PER_SECOND);
                projectile.draw(ctx);
              }
            }

            if (self.hero){
              self.hero.draw(self.canvasContext);
            }
            self.healthBar.draw(self.canvasContext);
          }
        };
      })(this), dtMillis);
  }

  onDragGesture(event){
    this.xVelocities.push(event.velocityX);
    this.yVelocities.push(event.velocityY);
  }
  onTouchEnd(event) {
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

  ionViewDidEnter() {
  	let canvas = <HTMLCanvasElement>document.getElementById("mainCanvas");
    this.canvasContext = canvas.getContext("2d");

    this.canvasContext.canvas.width = window.screen.width;
    this.canvasContext.canvas.height = window.screen.height - document.getElementById("viewHeader").offsetHeight - 8;
    this.canvasContext.canvas.style.backgroundColor = "#000";

    console.log("bridges: " + this.canvasContext.canvas.offsetTop + ", " + this.canvasContext.canvas.height);
    let size = 20;
    this.heroTopLeftX = (this.canvasContext.canvas.width / 2) - (size / 2); //(window.innerWidth / 2) - (size / 2);
    this.heroTopLeftY = (this.canvasContext.canvas.height / 2) - (size / 2);
    let heroColor = Color.fromHexValue("#0200FF");
    let heroShape = new Circle(this.canvasContext);
    this.hero = new Unit(heroShape, this.heroTopLeftX, this.heroTopLeftY, size, heroColor);
  }
}
