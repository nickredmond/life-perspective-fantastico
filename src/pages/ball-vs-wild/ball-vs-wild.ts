import { Component } from "@angular/core";
import { Storage } from "@ionic/storage";
import { ShapeUnit, ImageUnit, Enemy } from "../../models/unit";
import { Color } from "../../models/color";
import { Shape, Circle } from "../../models/shapes";
import { PowerupBar, HealthBar, RadialShotBar, ShieldBar, PowerupSelector } from "../../models/statusbars";
import { EnemyProducer, ItemProducer } from "../../models/enemy.producer";
import { ExtendedMath } from  "../../models/extendedmath";
import { PauseButton } from "../../models/buttons";
import { Dimensions, SpriteDimensions } from "../../models/dimensions";
import { Device } from 'ionic-native';
declare var admob;
declare var device;

// import {Http} from 'angular2/http';
// import 'rxjs/Rx';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';

@Component({
  selector: 'ball-vs-wild',
  templateUrl: 'ball-vs-wild.html'
})
export class BallVsWildPage {
  static readonly FPS: number = 60;
  static readonly MILLIS_PER_SECOND: number = 1000;
  static readonly MIN_SHOT_VELOCITY: number = 400;
  static readonly PROJECTILE_COLOR: Color = Color.fromHexValue("#FF0000");
  static readonly RADIANS_PER_PROJECTILE: number = ExtendedMath.toRadians(45);
  static readonly PAUSE_IMG_DIMENSIONS: Dimensions = new Dimensions(600, 300, 150, 150);
  static readonly PLAY_IMG_DIMENSIONS: Dimensions = new Dimensions(450, 300, 150, 150);
  static readonly LARGE_BEE = {
    leftDimensions: new Dimensions(600, 150, 150, 150),
    rightDimensions: new Dimensions(0, 0, 150, 150),
    name: "LG_BEE"
  };
  static readonly MEDIUM_BEE = {
    leftDimensions: new Dimensions(450, 150, 150, 150),
    rightDimensions: new Dimensions(150, 0, 150, 150),
    name: "MD_BEE"
  };
  static readonly SMALL_BEE = {
    leftDimensions: new Dimensions(300, 150, 150, 150),
    rightDimensions: new Dimensions(300, 0, 150, 150),
    name: "SM_BEE"
  };
  static readonly MINI_BEE = {
    leftDimensions: new Dimensions(150, 150, 150, 150),
    rightDimensions: new Dimensions(450, 0, 150, 150),
    name: "XS_BEE"
  };
  static readonly HEALTH_ITEM = {
    srcDimensions: new Dimensions(600, 0, 150, 150)
  };
  static readonly MILLIS_BETWEEN_ADS: number = 120000;

  pauseButton: PauseButton = null;

  maxVelocityX: number = 0;
  maxVelocityY: number = 0;
  maxVelocity: number = 0;

  heroTopLeftX: number;
  heroTopLeftY: number;
  score: number = 0;
  highScore: number = 0;
  hero: ShapeUnit = null;
  healthBar: HealthBar = null;
  powerupSelector: PowerupSelector = null;
  projectiles: ShapeUnit[] = [];
  items: ImageUnit[] = [];
  enemies: Enemy[] = [];
  enemyGenerators: EnemyProducer[] = [];
  itemGenerators: ItemProducer[] = [];

  spritesImg: HTMLImageElement;
  canvasContext: CanvasRenderingContext2D = null;
  projectileShape: Shape = null;
  storage: Storage;
  isAdsLoaded: boolean = false;
  isContinueEnabled: boolean = false;
  isAdDisplaying: boolean = false;
  millisUntilNextAd: number = 0;

  millisSinceLastShot: number = 0;

  highScores: Object[] = [];
   isHighScoresDisplayed: boolean = false;
  // isHighScoreAchieved: boolean = false;
  // leaderboardScore: string = "";
  // placeTaken: number = -1;
  userName: string = "";
  http: Http;
  // isUserNameSet: boolean = false;
  isScoresSorted: boolean = false;

  constructor(storage: Storage, http: Http) {
    this.http = http;
    http.get('https://api.myjson.com/bins/6f8ed').map(res => res.json()).subscribe(
      (data) => {
        if (!(data && data.length > 0)) {
          for (var i = 0; i < 5; i++) {
            let plyr = "player" + (i + 1);
            this.highScores.push({"name": plyr, "score": 1000 - (200 * i)});
          }
          http.put('https://api.myjson.com/bins/6f8ed', this.highScores).map(res => res.json()).subscribe(
            (data) => {});
        } else {
          this.highScores = data;
        }
      }
    );

    this.spritesImg = new Image();
    this.spritesImg.src = "img/sprites.png";

    this.storage = storage;
    this.storage.get("highScore").then((val) => {
      if (val === null){
        this.storage.set("highScore", 0);
      }
      else {
        this.highScore = val;
      }
    });
    this.storage.get("userName").then((val) => {
      let user = (val && val.length > 0) ? val : ("User-" + this.makeid(7));
      if (!(val && val.length > 0)){
        this.storage.set("userName", user);
      }
    });

    this.healthBar = new HealthBar(15, 15);
    let dtMillis = BallVsWildPage.MILLIS_PER_SECOND / BallVsWildPage.FPS;

    let self = this;
    setInterval((
      function(self, dtMilliseconds){
        return function() {
          if (self.canvasContext){
            let ctx = self.canvasContext;
            if (ctx.fillStyle != "white") {
              ctx.fillStyle = "white";
            }
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            if (self.healthBar.healthPoints > 0){
              self.gameTick(dtMilliseconds);
            }
            else if (self.isHighScoresDisplayed) {
              if (!self.isScoresSorted) {
                self.highScores = this.highScores.sort(function(a, b){
                  let result = 0;
                  if (a["score"] > b["score"]){
                    let result = 1;
                  } else if (a["score"] < b["score"]) {
                    let result = -1;
                  }
                  return result;
                });
                self.isScoresSorted = true;
              }
              let centerX = ctx.canvas.width / 2;
              let topY = ctx.canvas.height * 0.1;

              if (ctx.font != "30px Courier" || ctx.textAlign != "center") {
                ctx.font = "30px Courier";
                ctx.textAlign = "center";
              }
              ctx.fillText("HIGH SCORES", centerX, topY - 20);
              ctx.fillRect(ctx.canvas.width * 0.1, topY, ctx.canvas.width * 0.8, 3);

              ctx.font = "18px Courier";
              ctx.fillText("(Tap to retry)", centerX, topY + 50 + (self.highScores.length * 25));

              ctx.textAlign = "left";
              let leftMargin = ctx.canvas.width * 0.1;

              for (var i = 0; i < self.highScores.length; i++) {
                ctx.fillText(self.highScores[i]["name"], leftMargin, topY + 25 + (25 * i));
              }

              ctx.textAlign = "right";
              let rightMargin = ctx.canvas.width * 0.9;

              for (var i = 0; i < self.highScores.length; i++) {
                ctx.fillText(self.highScores[i]["score"], rightMargin, topY + 25 + (25 * i));
              }
            }
            else{
              let centerX = ctx.canvas.width / 2;
              let centerY = ctx.canvas.height / 2;

              if (ctx.font != "30px Courier" || ctx.textAlign != "center") {
                ctx.font = "30px Courier";
                ctx.textAlign = "center";
              }
              ctx.fillText("You have died.", centerX, centerY - 20);
              ctx.fillText("SCORE: " + self.score, centerX, centerY + 15);

              if (self.millisUntilNextAd <= BallVsWildPage.MILLIS_BETWEEN_ADS - 2200) {
                ctx.font = "18px Courier";
                ctx.fillText("(Tap to continue)", centerX, centerY + 50);
              }
            }

            self.millisUntilNextAd -= dtMilliseconds;
          }
        };
      })(this, dtMillis), dtMillis);
  }

  setUserName(){
    alert("mother fukcer");
    this.userName = document.getElementById("userName").innerHTML;
    document.getElementById("userNameForm").style.display = "none";
    document.getElementById("mainCanvas").style.display = "block";
    this.initApp();
  }

  updateHighScore(){
    if (this.score > this.highScore){
      this.storage.set("highScore", this.score);
      this.highScore = this.score;
    }
  }

  gameTick(dtMilliseconds: number){
    if (!this.pauseButton.isPaused()) {
      this.updateFrame(dtMilliseconds);
    }

    this.powerupSelector.draw();
    this.pauseButton.draw(this.canvasContext);

    if (this.hero){
      this.hero.draw(this.canvasContext);
    }
    this.healthBar.draw(this.canvasContext);

    let ctx = this.canvasContext;
    let scoreX = ctx.canvas.width - 15;

    if (ctx.font != "18px Courier") {
      ctx.font = "18px Courier";
    }
    ctx.fillStyle = "#AAA";
    ctx.textAlign = "right";
    ctx.fillText("HI SCORE: " + this.highScore, scoreX, 30);

    ctx.font = "30px Courier";
    ctx.fillStyle = "white";
    ctx.fillText(this.score.toString(), scoreX, 60);

    if (this.pauseButton.isPaused()) {
      let ctx = this.canvasContext;
      if (ctx.fillStyle != "white") {
        ctx.fillStyle = "white";
      }
      if (ctx.font != "36px Courier") {
        ctx.font = "36px Courier";
      }
      if (ctx.textAlign != "center") {
        ctx.textAlign = "center";
      }
      ctx.fillText("P A U S E", ctx.canvas.width / 2, ctx.canvas.height / 2);
    }
  }

  private updateFrame(dtMilliseconds: number) {
    this.millisSinceLastShot += dtMilliseconds;

    for (var i = 0; i < this.enemyGenerators.length; i++){

      let enemy = <Enemy>this.enemyGenerators[i].tick(dtMilliseconds);
      if (enemy != null){
        this.enemies.push(enemy);
      }
    }
    for (var i = 0; i < this.itemGenerators.length; i++){
      let item = <ImageUnit>this.itemGenerators[i].tick(dtMilliseconds);
      if (item != null){
        this.items.push(item);
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
    this.items = this.items.filter(function(item){
      return item.isAlive;
    });
    for (var i = 0; i < this.items.length; i++){
      let item = this.items[i];
      if (item.positionX < -item.size || item.positionX > (this.canvasContext.canvas.width + item.size) ||
            item.positionY < -item.size || item.positionY > (this.canvasContext.canvas.height + item.size)){
        item.isAlive = false;
      }
      else {
        item.update(dtMilliseconds / BallVsWildPage.MILLIS_PER_SECOND);
        item.draw(this.canvasContext);
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
          this.itemGenerators.forEach(function(itemGenerator){
            itemGenerator.totalGameTimeMillis = 0;
          });
          this.enemyGenerators.forEach(function(enemyGenerator){
            enemyGenerator.totalGameTimeMillis = 0;
          });
          if (this.millisUntilNextAd <= 0){
            setTimeout(function(){
              admob.showInterstitialAd();
            }, 2000);
            this.millisUntilNextAd = BallVsWildPage.MILLIS_BETWEEN_ADS;
          }
          this.isContinueEnabled = !this.isContinueEnabled;

          this.checkHighScore();
        }
        this.healthBar.takeHealth();
        enemy.isAlive = false;
      }
      else {
        enemy.update(dtMilliseconds / BallVsWildPage.MILLIS_PER_SECOND);
        enemy.draw(this.canvasContext);
      }
    }

    for (var k = 0; k < this.projectiles.length; k++){
      for (var j = 0; j < this.enemies.length; j++){
        if (this.enemies[j].intersects(this.projectiles[k])){
          if (this.enemies[j].name === BallVsWildPage.LARGE_BEE["name"]){
            this.explodeLargeBee(this.enemies[j]);
          }
          this.strikeEnemy(this.enemies[j], this.projectiles[k]);
        } else {
          let offsetX = this.enemies[j].positionX;
          let offsetY = this.enemies[j].positionY;
          let x2 = this.projectiles[k].positionX + offsetX;
          let y2 = this.projectiles[k].positionY + offsetY;

          this.projectiles[k].reverseFrame(dtMilliseconds / BallVsWildPage.MILLIS_PER_SECOND);
          let x1 = this.projectiles[k].positionX + offsetX;
          let y1 = this.projectiles[k].positionY + offsetY;

          let dx_squared = Math.pow(x2 - x1, 2);
          let dy_squared = Math.pow(y2 - y1, 2);
          let dr = Math.sqrt(dx_squared + dy_squared);
          let D = (x1 * y2) - (x2 * y1);
          let discriminant = (Math.pow(this.enemies[j].size, 2) * Math.pow(dr, 2)) - Math.pow(D, 2);
          let isIntersection = (discriminant >= 0);

          if (isIntersection) {
            if (this.enemies[j].name === BallVsWildPage.LARGE_BEE["name"]){
              this.explodeLargeBee(this.enemies[j]);
            }
            this.strikeEnemy(this.enemies[j], this.projectiles[k]);
          } else {
            this.projectiles[k].update(dtMilliseconds / BallVsWildPage.MILLIS_PER_SECOND);
          }
        }
      }
      for (var j = 0; j < this.items.length; j++){
        if (this.items[j].intersects(this.projectiles[k])){
          this.strikeItem(this.items[j], this.projectiles[k]);
        } else {
          let offsetX = this.items[j].positionX;
          let offsetY = this.items[j].positionY;
          let x2 = this.projectiles[k].positionX + offsetX;
          let y2 = this.projectiles[k].positionY + offsetY;

          this.projectiles[k].reverseFrame(dtMilliseconds / BallVsWildPage.MILLIS_PER_SECOND);
          let x1 = this.projectiles[k].positionX + offsetX;
          let y1 = this.projectiles[k].positionY + offsetY;

          let dx_squared = Math.pow(x2 - x1, 2);
          let dy_squared = Math.pow(y2 - y1, 2);
          let dr = Math.sqrt(dx_squared + dy_squared);
          let D = (x1 * y2) - (x2 * y1);
          let discriminant = (Math.pow(this.items[j].size, 2) * Math.pow(dr, 2)) - Math.pow(D, 2);
          let isIntersection = (discriminant >= 0);

          if (isIntersection) {
            this.strikeItem(this.items[j], this.projectiles[k]);
          } else {
            this.projectiles[k].update(dtMilliseconds / BallVsWildPage.MILLIS_PER_SECOND);
          }
        }
      }
    }
    this.powerupSelector.updatePowerupbars(dtMilliseconds);
  }

  checkHighScore() {
    let sortedScores = this.highScores.sort(function(a, b){
      let result = 0;
      if (a["score"] > b["score"]){
        let result = 1;
      } else if (a["score"] < b["score"]) {
        let result = -1;
      }
      return result;
    });
    let place = -1;
    for (var i = 0; i < sortedScores.length; i++){
      if (this.score > sortedScores[i]["score"] && place <= 0) {
        place = i + 1;
      }
    }
    if (place > 0) {
      this.storage.get("userName").then((val) => {
          this.highScores.pop();
          this.highScores.push({name: val, score: this.score});
          let sortedScores = this.highScores.sort(function(a, b){
      let result = 0;
      if (a["score"] > b["score"]){
        let result = 1;
      } else if (a["score"] < b["score"]) {
        let result = -1;
      }
      return result;
    });
          this.highScores = sortedScores;
          this.http.put('https://api.myjson.com/bins/6f8ed', this.highScores).map(res => res.json()).subscribe(
            (data) => {});
      });
      // this.isHighScoreAchieved = true;
      // this.leaderboardScore = "SCORE: " + this.score + " (" + this.place(place) + ")";
      // this.placeTaken = place;
    }
  }
  private place(value) {
    let p = "None";
    switch (value) {
      case 1:
        p = "1st";
        break;
      case 2:
        p = "2nd";
        break;
      case 3:
        p = "3rd";
        break;
      case 4:
        p = "4th";
        break;
      case 5:
        p = "5th";
        break;
      default:
        break;
    }
    return p;
  }

  private explodeLargeBee(enemy) {
    let page = BallVsWildPage;
    let chance = Math.random();

    if (chance > 0.5) {
      for (var i = 0; i < 4; i++){
        let itemMini = new ImageUnit(this.spritesImg, page.HEALTH_ITEM["srcDimensions"], enemy.positionX,
          enemy.positionY, 30);
        itemMini.velocityX = (2 * Math.random() * page.MIN_SHOT_VELOCITY) - page.MIN_SHOT_VELOCITY;
        itemMini.velocityY = (2 * Math.random() * page.MIN_SHOT_VELOCITY) - page.MIN_SHOT_VELOCITY;
        this.items.push(<ImageUnit>itemMini);
      }
    }
    else {
      let size = Math.max(15, this.canvasContext.canvas.width * 0.06);
      for (var i = 0; i < 4; i++){
        let enemyMini = new Enemy(5, this.spritesImg ,page.MINI_BEE["leftDimensions"], page.MINI_BEE["rightDimensions"],
          enemy.positionX, enemy.positionY, size, page.MINI_BEE["name"]);
        enemyMini.velocityX = (2 * Math.random() * page.MIN_SHOT_VELOCITY) - page.MIN_SHOT_VELOCITY;
        enemyMini.velocityY = (2 * Math.random() * page.MIN_SHOT_VELOCITY) - page.MIN_SHOT_VELOCITY;
        this.enemies.push(<Enemy>enemyMini);
      }
    }
  }
  private strikeEnemy(enemy: Enemy, projectile: ShapeUnit) {
    this.score += enemy.value;
    this.powerupSelector.powerupBars[this.powerupSelector.selectedIndex].addPoints(enemy.value);
    enemy.isAlive = false;
    projectile.isAlive = false;
  }
  private strikeItem(item: ImageUnit, projectile: ShapeUnit) {
    // TODO: refactor to be extensible for other item types
    this.score += 5;
    this.healthBar.giveHealth();
    item.isAlive = false;
    projectile.isAlive = false;
  }

  onDragGesture(event){
    let xVelSquared = event.velocityX * event.velocityX;
    let yVelSquared = event.velocityY * event.velocityY;
    let currentVelocity = Math.sqrt(xVelSquared + yVelSquared);

    if (currentVelocity > this.maxVelocity){
      this.maxVelocity = currentVelocity;
      this.maxVelocityX = event.velocityX;
      this.maxVelocityY = event.velocityY;
    }
  }
  onTouchEnd(event) {
    if (this.isHighScoresDisplayed){
      this.healthBar.healthPoints = HealthBar.DEFAULT_MAX_HP;
      this.powerupSelector.clearBars();
      this.projectiles = [];
      this.items = [];
      this.enemies = [];
      this.score = 0;
      this.isHighScoresDisplayed = false;
    } else if (this.healthBar.healthPoints === 0 && this.millisUntilNextAd <= BallVsWildPage.MILLIS_BETWEEN_ADS - 2200) {
      this.isHighScoresDisplayed = true;
    }
    else if (this.maxVelocity > 0 && this.millisSinceLastShot >= 200) {
      let velocityScale = BallVsWildPage.MIN_SHOT_VELOCITY / Math.abs(this.maxVelocity);

      let size = Math.max(10, this.canvasContext.canvas.width * 0.04);
      let nextProjectile = new ShapeUnit(this.projectileShape, this.hero.positionX, this.hero.positionY,
        size, BallVsWildPage.PROJECTILE_COLOR);
      nextProjectile.velocityX = (velocityScale > 1) ? (this.maxVelocityX * velocityScale) : this.maxVelocityX;
      nextProjectile.velocityY = (velocityScale > 1) ? (this.maxVelocityY * velocityScale) : this.maxVelocityY;
      this.projectiles.push(nextProjectile);

      this.maxVelocity = 0;
      this.millisSinceLastShot = 0;
    }
  }
  onDoubleTap(event) {
    let selectedPowerup = this.powerupSelector.powerupBars[this.powerupSelector.selectedIndex];
    if (selectedPowerup.isPowerupEnabled()) {
      selectedPowerup.expend();
    }
  }
  onSingleTap(event) {
    let centerX = event.center.x;
    let centerY = event.center.y;
    let self = this;
    this.powerupSelector.dimensions.forEach(function(dimension, index){
      if (dimension.dx < centerX && centerX < dimension.dx + dimension.dWidth &&
          dimension.dy < centerY && centerY < dimension.dy + dimension.dHeight) {
        self.powerupSelector.selectedIndex = index;
      }
    });
    let btn = this.pauseButton.location;
    if (btn.x < centerX && centerX < btn.x + btn.width &&
        btn.y < centerY && centerY < btn.y + btn.height) {
      this.pauseButton.togglePause();
    }
  }

  private buttonSize() {
    return Math.max(40, this.canvasContext.canvas.width * 0.16);
  }

  saveScore() {
    this.storage.set("userName", this.userName);

    // this.isHighScoreAchieved = false;
    // let scoreName = this.userName;

    // this.storage.get("userName").then((val) => {
    //   if (val === null){
    //     this.storage.set("userName", scoreName);
    //   } else {
    //     scoreName = (scoreName && scoreName.length > 0) ? scoreName : val;
    //   }
    // });

    // this.highScores.pop();
    //   if (this.placeTaken < this.highScores.length){
    //     this.highScores[this.placeTaken - 1] = this.score;
    //   } else {
    //     this.highScores.push({name: scoreName, score: this.score});
    //   }
    // this.http.put('https://api.myjson.com/bins/6f8ed', this.highScores).map(res => res.json()).subscribe(
    //         (data) => {});
    // this.isHighScoreAchieved = false;
    // this.isHighScoresDisplayed = true;
  }

initAds() {
  if (admob) {
    var adPublisherIds = {
      // ios : {
      //   banner : "ca-app-pub-XXXXXXXXXXXXXXXX/BBBBBBBBBB",
      //   interstitial : "ca-app-pub-XXXXXXXXXXXXXXXX/IIIIIIIIII"
      // },
      android : {
        banner : "ca-app-pub-3035178355763743~7102114115",
        interstitial: "ca-app-pub-3035178355763743/"
      }
    };

    var admobid = (/(android)/i.test(navigator.userAgent)) ? adPublisherIds.android : null/*adPublisherIds.ios*/;

    admob.setOptions({
      publisherId:          admobid.banner,
      interstitialAdId:     admobid.interstitial,
      autoShowInterstitial: false,
      isTesting: true
    });

    this.registerAdEvents();

  } else {
    alert('AdMobAds plugin not ready');
  }
}

onAdLoaded(e) {
  if (true) {
    if (e.adType === admob.AD_TYPE.INTERSTITIAL) {
      this.isAdsLoaded = true;
      this.isContinueEnabled = true;
    }
  }
}

onAdClosed(e) {
  if (true) {
    if (e.adType === admob.AD_TYPE.INTERSTITIAL) {
      admob.requestInterstitialAd();
    }
  }
}

onPause() {
  if (true) {
    admob.destroyBannerView();
  }
}

onResume() {
  if (!true) {
    setTimeout(admob.createBannerView, 1);
    setTimeout(admob.requestInterstitialAd, 1);
  }
}

// optional, in case respond to events
registerAdEvents() {
  document.addEventListener(admob.events.onAdLoaded, this.onAdLoaded);
  document.addEventListener(admob.events.onAdClosed, this.onAdClosed);

  document.addEventListener("pause", this.onPause, false);
  document.addEventListener("resume", this.onResume, false);
}

initApp() {
  
}

makeid(length): string
{
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ ){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

  ionViewDidEnter() {

    let canvas = <HTMLCanvasElement>document.getElementById("mainCanvas");
    this.canvasContext = canvas.getContext("2d");
    this.projectileShape = new Circle(this.canvasContext);

    this.canvasContext.canvas.width = window.innerWidth;
    this.canvasContext.canvas.height = window.innerHeight;
    this.canvasContext.canvas.style.backgroundColor = "#000";

    let powerupWidth = 0.8 * window.innerWidth;
    let powerupHeight = 15;
    let margin = 0.1 * window.innerWidth;
    let yPosition = window.innerHeight - powerupHeight - 15;
    let powerups = [
      new RadialShotBar(this, powerupWidth, powerupHeight, 150, margin, yPosition, "DOUBLE-TAP"),
      new ShieldBar(this, powerupWidth, powerupHeight, 150, margin, yPosition, "DOUBLE-TAP")
    ];
    let view = this.canvasContext.canvas;
    let dimensions = [
      new SpriteDimensions(150, 300, 150, 150, view.width - this.buttonSize() - 10, 10 + 10 + 60 + this.buttonSize(), this.buttonSize(), this.buttonSize()),
      new SpriteDimensions(0, 300, 150, 150, view.width - this.buttonSize() - 10, 10 + 60, this.buttonSize(), this.buttonSize())
    ];
    this.powerupSelector = new PowerupSelector(powerups, dimensions, this.spritesImg, this.canvasContext);
    this.powerupSelector.selectedIndex = 0;

    let size = this.canvasContext.canvas.width * 0.13;
    let centerX = this.canvasContext.canvas.width / 2;
    let centerY = this.canvasContext.canvas.height / 2;
    this.heroTopLeftX = centerX - (size / 2);
    this.heroTopLeftY = centerY - (size / 2);
    let heroColor = Color.fromHexValue("#0200FF");
    let heroShape = new Circle(this.canvasContext);
    this.hero = new ShapeUnit(heroShape, centerX, centerY, size, heroColor);

    let page = BallVsWildPage;
    this.enemyGenerators.push(new EnemyProducer(10, Math.max(20, this.canvasContext.canvas.width * 0.15), 100, 5000, this.hero,
      this.spritesImg, page.MEDIUM_BEE["leftDimensions"], page.MEDIUM_BEE["rightDimensions"], this.canvasContext, page.MEDIUM_BEE["name"]));
    this.enemyGenerators.push(new EnemyProducer(30, Math.max(40, this.canvasContext.canvas.width * 0.22), 70, 7500, this.hero,
      this.spritesImg, page.LARGE_BEE["leftDimensions"], page.LARGE_BEE["rightDimensions"], this.canvasContext, page.LARGE_BEE["name"]));
    this.enemyGenerators.push(new EnemyProducer(25, Math.max(10, this.canvasContext.canvas.width * 0.09), 175, 8000, this.hero,
      this.spritesImg, page.SMALL_BEE["leftDimensions"], page.SMALL_BEE["rightDimensions"], this.canvasContext, page.SMALL_BEE["name"]));
    this.itemGenerators.push(new ItemProducer(this.spritesImg, page.HEALTH_ITEM["srcDimensions"], 30, 250, 8000, this.canvasContext));

    let pauseButtonLocation = new Dimensions(10, 10 + 60, this.buttonSize(), this.buttonSize());
    this.pauseButton = new PauseButton(this.spritesImg, page.PAUSE_IMG_DIMENSIONS, page.PLAY_IMG_DIMENSIONS, pauseButtonLocation);

    this.initAds();
    admob.requestInterstitialAd();

    // document.getElementById("highScoreLabel").innerHTML = 
  }
}