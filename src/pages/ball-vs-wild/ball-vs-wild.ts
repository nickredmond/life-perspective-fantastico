import { Component } from "@angular/core";
import { Storage } from "@ionic/storage";
import { ShapeUnit, ImageUnit, Enemy } from "../../models/unit";
import { Color } from "../../models/color";
import { Shape, Circle } from "../../models/shapes";
import { HealthBar, RadialShotBar, ShieldBar, SlowMotionBar, PowerupSelector } from "../../models/statusbars";
import { EnemyProducer, ItemProducer } from "../../models/enemy.producer";
import { ExtendedMath } from  "../../models/extendedmath";
import { PauseButton } from "../../models/buttons";
import { Dimensions, SpriteDimensions } from "../../models/dimensions";
import { GraphicArtist } from "../../models/graphic.artist";
import { RickRollManager } from "../../models/rickroll.manager";
import { RenderingEngine } from "../../models/engine.rendering";
import {EffectsManager } from "../../models/effects.manager";

declare var admob;

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

  static readonly WAVELENGTH_MILLIS: number = 10000;

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
  effectsMgr: EffectsManager = null;

  spritesImg: HTMLImageElement;
  //canvasContext: CanvasRenderingContext2D = null;
  renderer: RenderingEngine = null;
  projectileShape: Shape = null;
  storage: Storage;
  isAdsLoaded: boolean = false;
  isContinueEnabled: boolean = false;
  isAdDisplaying: boolean = false;
  millisUntilNextAd: number = 0;

  millisSinceLastShot: number = 0;

  highScoresAllTime: Object[] = [];
  highScoresToday: Object[] = [];
   isHighScoresDisplayed: boolean = false;
  userName: string = "";
  http: Http;
  isScoresSorted: boolean = false;
  isHighScore: boolean = false;
  leaderboardName: string = "";
  placeTaken: number = -1;
  valueFlag: boolean = false;
  isUsernameSetIgnored: boolean = false;
  isButtonPress: boolean = true;

  isEnemiesGoingBallistic: boolean = false;
  millisUntilDoom: number = 0;
  rickRoller: RickRollManager = null;
  timeMultiplier: number = 1;
  isViewRefreshed: boolean = false;
  millisSinceTap: number = 0;
  facts: string[] = [];
  factsTaken: string[] = [];
  factIndicesTaken: number[] = [];
  fact: string = null;

  static readonly DAILY_LEADERBOARD_NAME: string = "today";
  static readonly ALL_TIME_LEADERBOARD_NAME: string = "allTime";
  highScores: Object = {
    "today": {
      "scores": [],
      "bucketName": "13j9a9",
      "identifier": "DAILY"
    },
    "allTime": {
      "scores": [],
      "bucketName": "6f8ed",
      "identifier": "ALL-TIME"
    }
  };

  constructor(storage: Storage, http: Http) {
    let page = this;
    this.http = http;
    this.rickRoller = new RickRollManager(http);

    this.http.get('https://api.myjson.com/bins/17gl8x').map(res => res.json()).subscribe(
      (data) => {
        page.facts = data["facts"];
      }
    );

    let allTimeName = BallVsWildPage.ALL_TIME_LEADERBOARD_NAME;
    let dailyName = BallVsWildPage.DAILY_LEADERBOARD_NAME;
    this.setLeaderboards(allTimeName, this.highScores[allTimeName]["bucketName"]);
    this.setLeaderboards(dailyName, this.highScores[dailyName]["bucketName"]);

    this.spritesImg = new Image();
    this.spritesImg.src = "img/sprites.png";

    this.storage = storage;
    this.storage.get("highScore").then((val) => {
      if (val === null){
        page.storage.set("highScore", 0);
      }
      else {
        page.highScore = val;
      }
    });

    this.healthBar = new HealthBar(15, 15);
    let dtMillis = BallVsWildPage.MILLIS_PER_SECOND / BallVsWildPage.FPS;

    setInterval((
      function(self, dtMilliseconds){
        return function() {
          if (self.renderer){
            let ctx = self.renderer.fgContext;
            if (ctx.fillStyle != "white") {
              ctx.fillStyle = "white";
            }

            if (self.healthBar.healthPoints > 0){
              self.gameTick(dtMilliseconds);
              if (!self.renderer.isInBackground(self.effectsMgr)){
                self.renderer.addBackgroundObject(self.effectsMgr);
              }
              self.renderer.redrawBackground();
            }
            else if (self.isHighScoresDisplayed) {
              self.renderer.resume();
              self.renderer.redraw();
              self.renderer.suspend();
              if (self.userName || !self.isHighScore){
                let centerX = ctx.canvas.width / 2;
                let allTimeScores = self.highScores[BallVsWildPage.ALL_TIME_LEADERBOARD_NAME];
                let dailyScores = self.highScores[BallVsWildPage.DAILY_LEADERBOARD_NAME];
                GraphicArtist.drawHighScores(self, ctx, allTimeScores,
                  centerX, ctx.canvas.height * 0.1);
                GraphicArtist.drawHighScores(self, ctx, dailyScores,
                  centerX, ctx.canvas.height * 0.45, true);
              }
              else {
                document.getElementById("usernameField").style.display = "block";
              }
            }
            else{
              self.renderer.resume();
              self.renderer.redraw();
              self.renderer.suspend();

              let centerX = ctx.canvas.width / 2;
              let centerY = ctx.canvas.height * 0.4;

              if (ctx.font != "30px Courier" || ctx.textAlign != "center") {
                ctx.font = "30px Courier";
                ctx.textAlign = "center";
              }
              if (ctx.fillStyle != "white"){
                ctx.fillStyle = "white";
              }
              ctx.fillText("You have died.", centerX, centerY - 20);
              ctx.fillText("SCORE: " + self.score, centerX, centerY + 15);

              if (self.millisUntilNextAd <= BallVsWildPage.MILLIS_BETWEEN_ADS - 2200) {
                ctx.font = "18px Courier";
                ctx.fillText("(Tap to continue)", centerX, centerY + 50);
              }

              if (!self.fact) {
                if (self.facts.length === 0) {
                  self.facts = self.factsTaken;
                }

                let randomIndex = Math.floor(Math.random() * self.facts.length);
                let f = self.facts.splice(randomIndex, 1)[0];
                self.factsTaken.push(f);
                self.fact = f;
              }

              let maxWidth = self.renderer.fgContext.canvas.width * 0.9;
              let height = self.renderer.fgContext.canvas.height * 0.7;
              GraphicArtist.wrapText(ctx, "DID YOU KNOW: " + self.fact, centerX, height, maxWidth, 18);
            }

            self.millisUntilNextAd -= dtMilliseconds;
          }
        };
      })(this, dtMillis), dtMillis);
  }

  setUsername(){
    let inputName = (<HTMLInputElement>document.getElementById("userName")).value;
    if (!this.userName && inputName && inputName.length > 0){
      this.userName = (inputName.length > 12) ? inputName.substring(0, 12) : inputName;
      this.isHighScore = false;

      this.highScores[this.leaderboardName]["scores"].sort(function(a, b){
          let result = 0;
          if (a["score"] < b["score"]){
            result = 1;
          } else if (a["score"] > b["score"]) {
            result = -1;
          }
          return result;
        });

       let name = this.leaderboardName;
       let bucket = this.highScores[name]["bucketName"];
       this.highScores[name]["scores"].splice(this.highScores[name]["scores"].length - 1, 1);
        this.highScores[name]["scores"].push({name: this.userName, score: this.score});
        this.http.put('https://api.myjson.com/bins/' + bucket, this.highScores[name]["scores"]).map(res => res.json()).subscribe(
          (data) => {});
    }
  }

  updateHighScore(){
    if (this.score > this.highScore){
      this.storage.set("highScore", this.score);
      this.highScore = this.score;
    }
  }

  gameTick(dtMillis: number){
    let dtMillisFinal = this.timeMultiplier * dtMillis;
    this.millisSinceTap += dtMillisFinal;
    this.rickRoller.update(dtMillisFinal);
    this.effectsMgr.update(dtMillisFinal);

    if (!this.pauseButton.isPaused()) {
      this.updateFrame(dtMillisFinal);
    }
    if (!this.isViewRefreshed){
      this.renderer.redraw();
      this.isViewRefreshed = true;
    }

    let ctx = this.renderer.fgContext;
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
      let ctx = this.renderer.fgContext;
      if (ctx.fillStyle != "white") {
        ctx.fillStyle = "white";
      }
      if (ctx.font != "36px Courier") {
        ctx.font = "36px Courier";
      }
      if (ctx.textAlign != "center") {
        ctx.textAlign = "center";
      }
      if (this.rickRoller.numberOfPauses < this.rickRoller.hintAmount) {
        ctx.fillText("P A U S E", ctx.canvas.width / 2, ctx.canvas.height / 2);
      }
    }
  }

  private updateFrame(dtMilliseconds: number) {
    this.millisSinceLastShot += dtMilliseconds;

    this.millisUntilDoom -= dtMilliseconds;
    if (this.millisUntilDoom <= 0) {
      this.isEnemiesGoingBallistic = !this.isEnemiesGoingBallistic;
      let scalar = this.isEnemiesGoingBallistic ? 0.5 : 2;
      let consequence = this.isEnemiesGoingBallistic ? 0.75 : 1.5;

      this.enemyGenerators.forEach(function(generator){
        generator.spawnRateMilliseconds = generator.spawnRateMilliseconds * scalar;
      });
      this.itemGenerators.forEach(function(generator){
        generator.spawnRateMilliseconds = generator.spawnRateMilliseconds / consequence;
      });
      this.millisUntilDoom = Math.random() * BallVsWildPage.WAVELENGTH_MILLIS + 3000;
    }

    for (var i = 0; i < this.enemyGenerators.length; i++){

      let enemy = <Enemy>this.enemyGenerators[i].tick(dtMilliseconds);
      if (enemy != null){
        this.enemies.push(enemy);
        this.renderer.addBackgroundObject(enemy);
      }
    }
    for (var i = 0; i < this.itemGenerators.length; i++){
      let item = <ImageUnit>this.itemGenerators[i].tick(dtMilliseconds);
      if (item != null){
        this.items.push(item);
        this.renderer.addBackgroundObject(item);
      }
    }

    this.projectiles = this.projectiles.filter(function(proj){
      return proj.isAlive;
    });

    let bgContext = this.renderer.bgContext;
    for (var i = 0; i < this.projectiles.length; i++){
      let projectile = this.projectiles[i];
      if (projectile.positionX < -projectile.size || projectile.positionX > (bgContext.canvas.width + projectile.size) ||
            projectile.positionY < -projectile.size || projectile.positionY > (bgContext.canvas.height + projectile.size)){
        projectile.isAlive = false;
        this.renderer.removeBackgroundObject(projectile);
      }
      else {
        projectile.update(dtMilliseconds / BallVsWildPage.MILLIS_PER_SECOND);
        if (!this.renderer.isInBackground(projectile)){
          this.renderer.addBackgroundObject(projectile);
        }
      }
    }
    this.items = this.items.filter(function(item){
      return item.isAlive;
    });
    for (var i = 0; i < this.items.length; i++){
      let item = this.items[i];
      if (item.positionX < -item.size || item.positionX > (bgContext.canvas.width + item.size) ||
            item.positionY < -item.size || item.positionY > (bgContext.canvas.height + item.size)){
        item.isAlive = false;
        this.renderer.removeBackgroundObject(item);
      }
      else {
        item.update(dtMilliseconds / BallVsWildPage.MILLIS_PER_SECOND);
        if (!this.renderer.isInBackground(item)){
          this.renderer.addBackgroundObject(item);
        }
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
            itemGenerator.resetSpawnRate();
          });
          this.enemyGenerators.forEach(function(enemyGenerator){
            enemyGenerator.totalGameTimeMillis = 0;
            enemyGenerator.resetSpawnRate();
          });
          this.renderer.suspendForeground();
          this.renderer.suspendBackground();
          this.isViewRefreshed = false;

          this.isEnemiesGoingBallistic = false;
          this.millisUntilDoom = BallVsWildPage.WAVELENGTH_MILLIS;

          if (this.millisUntilNextAd <= 0){
            setTimeout(function(){
              admob.showInterstitialAd();
            }, 2000);
            this.millisUntilNextAd = BallVsWildPage.MILLIS_BETWEEN_ADS;
          }
          this.isContinueEnabled = !this.isContinueEnabled;
          this.checkHighScore(BallVsWildPage.DAILY_LEADERBOARD_NAME);
          this.checkHighScore(BallVsWildPage.ALL_TIME_LEADERBOARD_NAME);
        }
        this.healthBar.takeHealth();
        this.renderer.redrawForeground();
        enemy.isAlive = false;
        this.renderer.removeBackgroundObject(enemy);
      }
      else {
        enemy.update(dtMilliseconds / BallVsWildPage.MILLIS_PER_SECOND);
        if (!this.renderer.isInBackground(enemy)){
          this.renderer.addBackgroundObject(enemy);
        }
      }
    }

    for (var k = 0; k < this.projectiles.length; k++){
      for (var j = 0; j < this.enemies.length; j++){
        if (this.enemies[j].intersects(this.projectiles[k])){
          if (this.enemies[j].name === BallVsWildPage.LARGE_BEE["name"]){
            this.explodeLargeBee(this.enemies[j]);
          }
          this.strikeEnemy(this.enemies[j], this.projectiles[k]);
        }
      }
      for (var j = 0; j < this.items.length; j++){
        if (this.items[j].intersects(this.projectiles[k])){
          this.strikeItem(this.items[j], this.projectiles[k]);
        }
      }
    }
    this.powerupSelector.updatePowerupbars(dtMilliseconds);
  }

  private setLeaderboards(leaderboardName: string, jsonBucketID: string) {
    this.http.get('https://api.myjson.com/bins/' + jsonBucketID).map(res => res.json()).subscribe(
      (data) => {
        if (!(data && data.length > 0)) {
          for (var i = 0; i < 5; i++) {
            let plyr = "player" + (i + 1);
            this.highScores[leaderboardName]["scores"].push(
              {"name": plyr, "score": 1100 - (100 * i)}
            );
          }
          this.http.put('https://api.myjson.com/bins/' + jsonBucketID, 
              this.highScores[leaderboardName]["scores"]).map(res => res.json())
            .subscribe((data) => {});
        } else {
          this.highScores[leaderboardName]["scores"] = data;
        }
      }
    );
  }

  checkHighScore(leaderboardName: string) {
    let scores = <Object[]>this.highScores[leaderboardName]["scores"];
    this.highScores[leaderboardName]["scores"].sort(function(a, b){
      let result = 0;
      if (a["score"] < b["score"]){
        result = 1;
      } else if (a["score"] > b["score"]) {
        result = -1;
      }
      return result;
    });
    let place = -1;
    for (var i = 0; i < scores.length; i++){
      if (this.score > scores[i]["score"] && place <= 0) {
        place = i + 1;
      }
    }
    if (place > 0) {
      this.isHighScore = true;
      (<HTMLInputElement>document.getElementById("leaderboardName")).value = this.highScores[leaderboardName]["identifier"];
      (<HTMLInputElement>document.getElementById("scoreLabel")).value = this.score.toString();;
      (<HTMLInputElement>document.getElementById("rankingLabel")).value = "(" + this.place(place) + " place)";
      this.placeTaken = place;
      this.leaderboardName = leaderboardName;
    }
  }
  private place(value) {
    let p = "No";
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
      case 6:
        p = "6th";
        break;
      case 7:
        p = "7th";
        break;
      case 8:
        p = "8th";
        break;
      case 9:
        p = "9th";
        break;
      case 10:
        p = "10th";
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
        this.renderer.addBackgroundObject(<ImageUnit>itemMini);
      }
    }
    else {
      let size = Math.max(15, this.renderer.bgContext.canvas.width * 0.06);
      for (var i = 0; i < 4; i++){
        let enemyMini = new Enemy(5, this.spritesImg ,page.MINI_BEE["leftDimensions"], page.MINI_BEE["rightDimensions"],
          enemy.positionX, enemy.positionY, size, page.MINI_BEE["name"]);
        enemyMini.velocityX = (2 * Math.random() * page.MIN_SHOT_VELOCITY) - page.MIN_SHOT_VELOCITY;
        enemyMini.velocityY = (2 * Math.random() * page.MIN_SHOT_VELOCITY) - page.MIN_SHOT_VELOCITY;
        this.enemies.push(<Enemy>enemyMini);
        this.renderer.addBackgroundObject(<ImageUnit>enemyMini);
      }
    }
  }
  private strikeEnemy(enemy: Enemy, projectile: ShapeUnit) {
    this.score += enemy.value;
    this.powerupSelector.powerupBars[this.powerupSelector.selectedIndex].addPoints(enemy.value);
    this.renderer.redrawForeground();
    enemy.isAlive = false;
    projectile.isAlive = false;
    this.renderer.removeBackgroundObject(enemy);
    this.renderer.removeBackgroundObject(projectile);
  }
  private strikeItem(item: ImageUnit, projectile: ShapeUnit) {
    // TODO: refactor to be extensible for other item types
    this.score += 5;
    this.healthBar.giveHealth();
    this.renderer.redrawForeground();
    item.isAlive = false;
    projectile.isAlive = false;
    this.renderer.removeBackgroundObject(item);
    this.renderer.removeBackgroundObject(projectile);
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
    if (this.isHighScoresDisplayed && !this.isHighScore){
      this.healthBar.healthPoints = HealthBar.DEFAULT_MAX_HP;
      this.powerupSelector.clearBars();

      let renderer = this.renderer;
      this.projectiles.forEach(function(projectile){
        renderer.removeBackgroundObject(projectile);
      });
      this.items.forEach(function(item){
        renderer.removeBackgroundObject(item);
      });
      this.enemies.forEach(function(enemy){
        renderer.removeBackgroundObject(enemy);
      });

      this.projectiles = [];
      this.items = [];
      this.enemies = [];
      this.score = 0;
      this.isHighScoresDisplayed = false;
      this.fact = null;

      this.renderer.resume();
      this.renderer.redraw();
    } else if (this.healthBar.healthPoints === 0 && this.millisUntilNextAd <= BallVsWildPage.MILLIS_BETWEEN_ADS - 2200) {
      this.isHighScoresDisplayed = true;
    }
  }
  onDoubleTap(event) {
    let selectedPowerup = this.powerupSelector.powerupBars[this.powerupSelector.selectedIndex];
    if (selectedPowerup.isPowerupEnabled()) {
      selectedPowerup.expend();
      this.renderer.redrawForeground();
    }
  }
  onSingleTap(event) {
    if (this.millisSinceTap >= 200) {
      this.millisSinceTap = 0;
      let centerX = event.center.x;
      let centerY = event.center.y;
      let self = this;
      let isButtonPressed = false;

      this.powerupSelector.dimensions.forEach(function(dimension, index){
        if (dimension.dx < centerX && centerX < dimension.dx + dimension.dWidth &&
            dimension.dy < centerY && centerY < dimension.dy + dimension.dHeight) {
          isButtonPressed = true;
          self.powerupSelector.selectedIndex = index;
          self.renderer.redrawForeground();
        }
      });
      let btn = this.pauseButton.location;
      if (btn.x < centerX && centerX < btn.x + btn.width &&
          btn.y < centerY && centerY < btn.y + btn.height) {
        isButtonPressed = true;
        this.pauseButton.togglePause();
        this.renderer.redrawForeground();
        if (this.pauseButton.isPaused()) {
          this.rickRoller.onPaused();
        }
      }
      if (!isButtonPressed && this.millisSinceLastShot >= 200) {
        let distance = ExtendedMath.distance(this.hero.positionX, this.hero.positionY, centerX, centerY);
        let velocityScale = BallVsWildPage.MIN_SHOT_VELOCITY / distance;
        let distanceX = velocityScale * (centerX - this.hero.positionX);
        let distanceY = velocityScale * (centerY - this.hero.positionY);

        let size = Math.max(10, this.renderer.bgContext.canvas.width * 0.04);
        let nextProjectile = new ShapeUnit(this.projectileShape, this.hero.positionX, this.hero.positionY,
          size, BallVsWildPage.PROJECTILE_COLOR);
        nextProjectile.velocityX = distanceX; // (velocityScale > 1) ? (distanceX * velocityScale) : this.maxVelocityX;
        nextProjectile.velocityY = distanceY; // (velocityScale > 1) ? (distanceY * velocityScale) : this.maxVelocityY;
        this.projectiles.push(nextProjectile);
        this.renderer.addBackgroundObject(nextProjectile);
        this.effectsMgr.startTouchEffect(centerX, centerY);

        this.maxVelocity = 0;
        this.millisSinceLastShot = 0;
      }
    }
  }

  private buttonSize() {
    return Math.max(40, this.renderer.fgContext.canvas.width * 0.16);
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
        isTesting: false
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

  makeid(length): string
  {
      let text = "";
      let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for( var i=0; i < length; i++ ){
          text += possible.charAt(Math.floor(Math.random() * possible.length));
      }

      return text;
  }

  onSlowMotionEnabled(self: BallVsWildPage) {
    self.timeMultiplier = 0.35;
  }
  onSlowMotionDisabled(self: BallVsWildPage) {
    self.timeMultiplier = 1;
  }

  ionViewDidEnter() {
    let foreground = <HTMLCanvasElement>document.getElementById("foreground");
    let background = <HTMLCanvasElement>document.getElementById("background");

    this.renderer = new RenderingEngine(foreground, background);

    this.projectileShape = new Circle(this.renderer.bgContext);

    let powerupWidth = 0.8 * window.innerWidth;
    let powerupHeight = 15;
    let margin = 0.1 * window.innerWidth;
    let yPosition = window.innerHeight - powerupHeight - 15;
    let powerups = [
      new RadialShotBar(this, powerupWidth, powerupHeight, 200, margin, yPosition),
      new ShieldBar(this, powerupWidth, powerupHeight, 150, margin, yPosition),
      new SlowMotionBar(this, powerupWidth, powerupHeight, 250, this.onSlowMotionEnabled, this.onSlowMotionDisabled,
        SlowMotionBar.DEFAULT_DURATION_MILLIS, margin, yPosition)
    ];
    let view = this.renderer.fgContext.canvas;
    let dimensions = [
      new SpriteDimensions(150, 300, 150, 150, view.width - this.buttonSize() - 10, (3 * 10) + 60 + (2 * this.buttonSize()), this.buttonSize(), this.buttonSize()),
      new SpriteDimensions(0, 300, 150, 150, view.width - this.buttonSize() - 10, (2 * 10) + 60 + this.buttonSize(), this.buttonSize(), this.buttonSize()),
      new SpriteDimensions(0, 450, 150, 150, view.width - this.buttonSize() - 10, 10 + 60, this.buttonSize(), this.buttonSize())
    ];
    this.powerupSelector = new PowerupSelector(powerups, dimensions, this.spritesImg, this.renderer.fgContext);
    this.powerupSelector.selectedIndex = 0;
    this.renderer.addForegroundObject(this.powerupSelector);

    let size = this.renderer.fgContext.canvas.width * 0.13;
    let centerX = this.renderer.fgContext.canvas.width / 2;
    let centerY = this.renderer.fgContext.canvas.height / 2;
    this.heroTopLeftX = centerX - (size / 2);
    this.heroTopLeftY = centerY - (size / 2);
    let heroColor = Color.fromHexValue("#0200FF");
    let heroShape = new Circle(this.renderer.fgContext);
    this.hero = new ShapeUnit(heroShape, centerX, centerY, size, heroColor);
    this.renderer.addForegroundObject(this.hero);

    this.healthBar = new HealthBar(15, 15);
    this.renderer.addForegroundObject(this.healthBar);
    this.renderer.addBackgroundObject(this.rickRoller);

    let page = BallVsWildPage;
    this.enemyGenerators.push(new EnemyProducer(10, Math.max(20, this.renderer.bgContext.canvas.width * 0.15), 100, 5000, this.hero,
      this.spritesImg, page.MEDIUM_BEE["leftDimensions"], page.MEDIUM_BEE["rightDimensions"], this.renderer.bgContext, page.MEDIUM_BEE["name"]));
    this.enemyGenerators.push(new EnemyProducer(30, Math.max(40, this.renderer.bgContext.canvas.width * 0.22), 70, 7500, this.hero,
      this.spritesImg, page.LARGE_BEE["leftDimensions"], page.LARGE_BEE["rightDimensions"], this.renderer.bgContext, page.LARGE_BEE["name"]));
    this.enemyGenerators.push(new EnemyProducer(25, Math.max(10, this.renderer.bgContext.canvas.width * 0.09), 175, 8000, this.hero,
      this.spritesImg, page.SMALL_BEE["leftDimensions"], page.SMALL_BEE["rightDimensions"], this.renderer.bgContext, page.SMALL_BEE["name"]));
    this.itemGenerators.push(new ItemProducer(this.spritesImg, page.HEALTH_ITEM["srcDimensions"], 30, 250, 8000, this.renderer.bgContext));

    let pauseButtonLocation = new Dimensions(10, 10 + 60, this.buttonSize(), this.buttonSize());
    this.pauseButton = new PauseButton(this.spritesImg, page.PAUSE_IMG_DIMENSIONS, page.PLAY_IMG_DIMENSIONS, pauseButtonLocation);
    this.renderer.addForegroundObject(this.pauseButton);

    this.renderer.redrawForeground();

    this.millisUntilDoom = BallVsWildPage.WAVELENGTH_MILLIS;
    this.effectsMgr = new EffectsManager(this.renderer.bgContext);
    this.renderer.addBackgroundObject(this.effectsMgr);

    this.initAds();
    admob.requestInterstitialAd();
  }
}