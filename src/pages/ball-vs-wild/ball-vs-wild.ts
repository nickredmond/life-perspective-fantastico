import { Component } from "@angular/core";
import { Unit } from "../../models/unit";
import { Color } from "../../models/color";
import { Circle } from "../../models/shapes";
import { PositionTuple } from "../../models/position.tuple";
import { ExtendedMath } from "../../models/extendedmath.ts";

@Component({
  selector: 'ball-vs-wild',
  templateUrl: 'ball-vs-wild.html'
})
export class BallVsWildPage {
  xVelocities: number[] = [];
  yVelocities: number[] = [];
  startPosition: PositionTuple = null;
  endPosition: PositionTuple = null;
  isTouching: Boolean = false;
  constructor() {}

  onTouchStart(event) {
  	//console.log('starting: ' + JSON.stringify(Object.keys(event)));
    this.isTouching = true;
  }
  onDragGesture(event){
    let centerX = event.center.x;
    let centerY = event.center.y;
    if (this.startPosition === null){
      this.startPosition = new PositionTuple(centerX, centerY);
    }
    this.endPosition = new PositionTuple(centerX, centerY);

    this.xVelocities.push(event.velocityX);
    this.yVelocities.push(event.velocityY);
  }
  onTouchEnd(event) {
    let averageVelocityX = ExtendedMath.average(this.xVelocities);
    let averageVelocityY = ExtendedMath.average(this.yVelocities);

    console.log("swing it: (" + averageVelocityX + ", " + averageVelocityY +
      "), (" + this.startPosition.x + ", " + this.startPosition.y + ") -> (" +
      this.endPosition.x + ", " + this.endPosition.y + ")");

    //console.log('ending: ' + JSON.stringify(Object.keys(event)));
    this.xVelocities = [];
    this.yVelocities = [];
    this.startPosition = null;
    this.endPosition = null;
    this.isTouching = false;
  }

  ionViewDidEnter() {
  	let canvas = <HTMLCanvasElement>document.getElementById("mainCanvas");
  	var position = { x: 20, y: 20 }; //event.center;
    let ctx: CanvasRenderingContext2D = canvas.getContext("2d");

    ctx.canvas.width = window.screen.width;
    ctx.canvas.height = window.screen.height - document.getElementById("viewHeader").offsetHeight - 8;
    ctx.canvas.style.backgroundColor = "#000";

    console.log("bridges: " + ctx.canvas.offsetTop + ", " + ctx.canvas.height);
    let size = 20;
    let topLeftX = (ctx.canvas.width / 2) - (size / 2); //(window.innerWidth / 2) - (size / 2);
    let topLeftY = (ctx.canvas.height / 2) - (size / 2);
    let heroColor = Color.fromHexValue("#0200FF");
    let heroShape = new Circle(ctx);
    let hero = new Unit(heroShape, topLeftX, topLeftY, size, heroColor);

    setInterval(function(){
    	hero.draw(ctx);
    }, (1000 / 60));
  }
}
