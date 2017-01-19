import { Component } from '@angular/core';

@Component({
  selector: 'page-hello-ionic',
  templateUrl: 'hello-ionic.html'
})
export class HelloIonicPage {
  constructor() {
  	
  }
  ionViewDidLoad() {
  	console.log("blessing");
  	let canvas = <HTMLCanvasElement>document.getElementById("mainCanvas");
  	var position = { x: 20, y: 20 }; //event.center;
    let ctx: CanvasRenderingContext2D = canvas.getContext("2d");

    ctx.canvas.width = window.innerWidth;
    //ctx.canvas.height = window.innerHeight;

    ctx.beginPath();
    ctx.arc(position.x, position.y, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#00DD00';
    ctx.fill();
  }
}
