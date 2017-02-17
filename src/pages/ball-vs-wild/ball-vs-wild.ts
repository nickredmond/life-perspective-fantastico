import { Component } from "@angular/core";
import { Storage } from "@ionic/storage";
import { ShapeUnit, ImageUnit } from "../../models/unit";
import { Color } from "../../models/color";
import { Shape, Circle } from "../../models/shapes";
import { ExtendedMath } from  "../../models/extendedmath";
import { PauseButton } from "../../models/buttons";
import { Dimensions, SpriteDimensions } from "../../models/dimensions";
import { RickRollManager } from "../../models/rickroll.manager";
import { RenderingEngine } from "../../models/engine.rendering";
import {EffectsManager } from "../../models/effects.manager";
import { ScreenText, FadingImage } from "../../models/hud.models";

declare var admob;

import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Component({
  selector: 'ball-vs-wild',
  templateUrl: 'ball-vs-wild.html'
})
export class BallVsWildPage {
  static readonly FPS: number = 60;
  static readonly MILLIS_PER_SECOND: number = 1000;

  static readonly PAUSE_IMG_DIMENSIONS: Dimensions = new Dimensions(600, 300, 150, 150);
  static readonly PLAY_IMG_DIMENSIONS: Dimensions = new Dimensions(450, 300, 150, 150);

  static readonly MILLIS_BETWEEN_ADS: number = 120000;

  pauseButton: PauseButton = null;

  heroTopLeftX: number;
  heroTopLeftY: number;
  hero: ShapeUnit = null;

  effectsMgr: EffectsManager = null;

  spritesImg: HTMLImageElement;
  renderer: RenderingEngine = null;
  storage: Storage;
  isAdsLoaded: boolean = false;
  isContinueEnabled: boolean = false;
  isAdDisplaying: boolean = false;
  millisUntilNextAd: number = 0;

  http: Http;

  valueFlag: boolean = false;
  isButtonPress: boolean = true;

  rickRoller: RickRollManager = null;
  isViewRefreshed: boolean = false;
  millisSinceTap: number = 0;

  constructor(storage: Storage, http: Http) {
    let page = this;
    this.http = http;
    this.rickRoller = new RickRollManager(http);

    this.spritesImg = new Image();
    this.spritesImg.src = "img/sprites.png";
    this.storage = storage;

    let dtMillis = BallVsWildPage.MILLIS_PER_SECOND / BallVsWildPage.FPS;

    setInterval((
      function(self, dtMilliseconds){
        return function() {
          if (self.renderer){
            let ctx = self.renderer.fgContext;
            if (ctx.fillStyle != "white") {
              ctx.fillStyle = "white";
            }

            var isBogusBoolean = true;
            if (isBogusBoolean/*self.healthBar.healthPoints > 0*/){
              self.gameTick(dtMilliseconds);
              if (!self.renderer.isInBackground(self.effectsMgr)){
                self.renderer.addBackgroundObject(self.effectsMgr);
              }
              self.renderer.redrawBackground();
            }
            else if (!isBogusBoolean/*self.isHighScoresDisplayed*/) {
              self.renderer.resume();
              self.renderer.redraw();
              self.renderer.suspend();
            }
            else{
              self.renderer.resume();
              self.renderer.redraw();
              self.renderer.suspend();
            }

            self.millisUntilNextAd -= dtMilliseconds;
          }
        };
      })(this, dtMillis), dtMillis);
  }

  gameTick(dtMillisFinal: number){
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
    this.renderer.redraw();
  }

  onDragGesture(event){

  }
  onTouchEnd(event) {

  }
  onDoubleTap(event) {

  }
  onSingleTap(event) {
    if (this.millisSinceTap >= 200) {
      this.millisSinceTap = 0;
      let centerX = event.center.x;
      let centerY = event.center.y;

      let btn = this.pauseButton.location;
      if (btn.x < centerX && centerX < btn.x + btn.width &&
          btn.y < centerY && centerY < btn.y + btn.height) {
        this.pauseButton.togglePause();
        this.renderer.redrawForeground();
        if (this.pauseButton.isPaused()) {
          this.rickRoller.onPaused();
        }
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

  ionViewDidEnter() {
    let foreground = <HTMLCanvasElement>document.getElementById("foreground");
    let background = <HTMLCanvasElement>document.getElementById("background");
    this.renderer = new RenderingEngine(foreground, background);

    let size = this.renderer.fgContext.canvas.width * 0.13;
    let centerX = this.renderer.fgContext.canvas.width / 2;
    let centerY = this.renderer.fgContext.canvas.height / 2;
    this.heroTopLeftX = centerX - (size / 2);
    this.heroTopLeftY = centerY - (size / 2);
    let heroColor = Color.fromHexValue("#0200FF");
    let heroShape = new Circle(this.renderer.fgContext);
    // this.hero = new ShapeUnit(heroShape, centerX, centerY, size, heroColor);
    // this.renderer.addForegroundObject(this.hero);

    this.renderer.addBackgroundObject(this.rickRoller);

    let page = BallVsWildPage;
    let pauseButtonLocation = new Dimensions(10, 10 + 60, this.buttonSize(), this.buttonSize());
    this.pauseButton = new PauseButton(this.spritesImg, page.PAUSE_IMG_DIMENSIONS, page.PLAY_IMG_DIMENSIONS, pauseButtonLocation);
    this.renderer.addForegroundObject(this.pauseButton);

    this.renderer.redrawForeground();
    this.effectsMgr = new EffectsManager(this.renderer.bgContext);
    this.renderer.addBackgroundObject(this.effectsMgr);

    let twainQuote = "\"Truth is stranger than fiction, but it is because Fiction is obliged " +
      "to stick to possibilities; Truth isn't.\" - Mark Twain";
    let einsteinQuote = "\"Everybody is a genius. But if you judge a fish by its ability to " +
      "climb a tree, it will live its whole life believing that it is stupid.\" - Albert Einstein";
    let width = this.renderer.fgContext.canvas.width;
    let height = this.renderer.fgContext.canvas.height;
    let durationMillis = 5000;

    let introText1 = new ScreenText(width * 0.25, height * 0.1, twainQuote, Color.WHITE, Color.BLACK, 28, "Sofia",
                                    "center", durationMillis, width * 0.45);
    let introText2 = new ScreenText(width * 0.75, height * 0.1, einsteinQuote, Color.WHITE, Color.BLACK, 28, "Caveat Brush",
                                    "center", durationMillis, width * 0.45);
    this.renderer.addForegroundObject(introText1);
    this.renderer.addForegroundObject(introText2);

    let isize = height * 0.25;
    let imgSrc = "img/sprites.png";
    let leftDimensions = new SpriteDimensions(0, 0, 150, 150, width * 0.3, height * 0.75, isize, isize);
    let rightDimensions = new SpriteDimensions(150, 0, 150, 150, width * 0.5, height * 0.8, isize, isize);

    let img1 = new FadingImage(leftDimensions, imgSrc, durationMillis);
    let img2 = new FadingImage(rightDimensions, imgSrc, durationMillis);
    this.renderer.addForegroundObject(img1);
    this.renderer.addForegroundObject(img2);

    introText1.play(17000, false);
    introText2.play(17000, false);
    img1.play(12500, false);
    img2.play(12500, false);

    this.initAds();
    admob.requestInterstitialAd();
  }
}