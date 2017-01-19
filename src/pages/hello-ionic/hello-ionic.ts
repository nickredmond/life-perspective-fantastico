import { Component } from "@angular/core";
import { Unit } from "../../models/unit";
import { Color } from "../../models/color";
import { Circle } from "../../models/shapes";

@Component({
  selector: 'page-hello-ionic',
  templateUrl: 'hello-ionic.html'
})
export class HelloIonicPage {
  constructor() {}

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
