var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from "@angular/core";
import { Storage } from "@ionic/storage";
import { ShapeUnit, ImageUnit, Enemy } from "../../models/unit";
import { Color } from "../../models/color";
import { Circle } from "../../models/shapes";
import { HealthBar, RadialShotBar, ShieldBar, SlowMotionBar, PowerupSelector } from "../../models/statusbars";
import { EnemyProducer, ItemProducer } from "../../models/enemy.producer";
import { ExtendedMath } from "../../models/extendedmath";
import { PauseButton } from "../../models/buttons";
import { Dimensions, SpriteDimensions } from "../../models/dimensions";
import { GraphicArtist } from "../../models/graphic.artist";
import { RickRollManager } from "../../models/rickroll.manager";
import { RenderingEngine } from "../../models/engine.rendering";
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
var BallVsWildPage = BallVsWildPage_1 = (function () {
    function BallVsWildPage(storage, http) {
        this.pauseButton = null;
        this.maxVelocityX = 0;
        this.maxVelocityY = 0;
        this.maxVelocity = 0;
        this.score = 0;
        this.highScore = 0;
        this.hero = null;
        this.healthBar = null;
        this.powerupSelector = null;
        this.projectiles = [];
        this.items = [];
        this.enemies = [];
        this.enemyGenerators = [];
        this.itemGenerators = [];
        //canvasContext: CanvasRenderingContext2D = null;
        this.renderer = null;
        this.projectileShape = null;
        this.isAdsLoaded = false;
        this.isContinueEnabled = false;
        this.isAdDisplaying = false;
        this.millisUntilNextAd = 0;
        this.millisSinceLastShot = 0;
        this.highScoresAllTime = [];
        this.highScoresToday = [];
        this.isHighScoresDisplayed = false;
        this.userName = "";
        this.isScoresSorted = false;
        this.isHighScore = false;
        this.leaderboardName = "";
        this.placeTaken = -1;
        this.valueFlag = false;
        this.isUsernameSetIgnored = false;
        this.isButtonPress = true;
        this.isEnemiesGoingBallistic = false;
        this.millisUntilDoom = 0;
        this.rickRoller = new RickRollManager();
        this.timeMultiplier = 1;
        this.isViewRefreshed = false;
        this.highScores = {
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
        var page = this;
        this.http = http;
        var allTimeName = BallVsWildPage_1.ALL_TIME_LEADERBOARD_NAME;
        var dailyName = BallVsWildPage_1.DAILY_LEADERBOARD_NAME;
        this.setLeaderboards(allTimeName, this.highScores[allTimeName]["bucketName"]);
        this.setLeaderboards(dailyName, this.highScores[dailyName]["bucketName"]);
        this.spritesImg = new Image();
        this.spritesImg.src = "img/sprites.png";
        this.storage = storage;
        this.storage.get("highScore").then(function (val) {
            if (val === null) {
                page.storage.set("highScore", 0);
            }
            else {
                page.highScore = val;
            }
        });
        this.healthBar = new HealthBar(15, 15);
        var dtMillis = BallVsWildPage_1.MILLIS_PER_SECOND / BallVsWildPage_1.FPS;
        setInterval((function (self, dtMilliseconds) {
            return function () {
                if (self.renderer) {
                    var ctx = self.renderer.fgContext;
                    if (ctx.fillStyle != "white") {
                        ctx.fillStyle = "white";
                    }
                    if (self.healthBar.healthPoints > 0) {
                        self.gameTick(dtMilliseconds);
                        self.renderer.redrawBackground();
                    }
                    else if (self.isHighScoresDisplayed) {
                        if (self.userName || !self.isHighScore) {
                            self.renderer.resume();
                            self.renderer.redraw();
                            self.renderer.suspend();
                            var centerX = ctx.canvas.width / 2;
                            var allTimeScores = self.highScores[BallVsWildPage_1.ALL_TIME_LEADERBOARD_NAME];
                            var dailyScores = self.highScores[BallVsWildPage_1.DAILY_LEADERBOARD_NAME];
                            GraphicArtist.drawHighScores(self, ctx, allTimeScores, centerX, ctx.canvas.height * 0.1);
                            GraphicArtist.drawHighScores(self, ctx, dailyScores, centerX, ctx.canvas.height * 0.45, true);
                        }
                        else {
                            self.renderer.resume();
                            self.renderer.redraw();
                            self.renderer.suspend();
                            document.getElementById("usernameField").style.display = "block";
                        }
                    }
                    else {
                        var centerX = ctx.canvas.width / 2;
                        var centerY = ctx.canvas.height / 2;
                        if (ctx.font != "30px Courier" || ctx.textAlign != "center") {
                            ctx.font = "30px Courier";
                            ctx.textAlign = "center";
                        }
                        ctx.fillText("You have died.", centerX, centerY - 20);
                        ctx.fillText("SCORE: " + self.score, centerX, centerY + 15);
                        if (self.millisUntilNextAd <= BallVsWildPage_1.MILLIS_BETWEEN_ADS - 2200) {
                            ctx.font = "18px Courier";
                            ctx.fillText("(Tap to continue)", centerX, centerY + 50);
                        }
                    }
                    self.millisUntilNextAd -= dtMilliseconds;
                }
            };
        })(this, dtMillis), dtMillis);
    }
    BallVsWildPage.prototype.setUsername = function () {
        var inputName = document.getElementById("userName").value;
        if (!this.userName && inputName && inputName.length > 0) {
            this.userName = (inputName.length > 12) ? inputName.substring(0, 12) : inputName;
            this.isHighScore = false;
            this.highScores[this.leaderboardName]["scores"].sort(function (a, b) {
                var result = 0;
                if (a["score"] < b["score"]) {
                    result = 1;
                }
                else if (a["score"] > b["score"]) {
                    result = -1;
                }
                return result;
            });
            var name_1 = this.leaderboardName;
            var bucket = this.highScores[name_1]["bucketName"];
            this.highScores[name_1]["scores"].splice(this.highScores[name_1]["scores"].length - 1, 1);
            this.highScores[name_1]["scores"].push({ name: this.userName, score: this.score });
            this.http.put('https://api.myjson.com/bins/' + bucket, this.highScores[name_1]["scores"]).map(function (res) { return res.json(); }).subscribe(function (data) { });
        }
    };
    BallVsWildPage.prototype.updateHighScore = function () {
        if (this.score > this.highScore) {
            this.storage.set("highScore", this.score);
            this.highScore = this.score;
        }
    };
    BallVsWildPage.prototype.gameTick = function (dtMillis) {
        var dtMillisFinal = this.timeMultiplier * dtMillis;
        this.rickRoller.update(dtMillisFinal);
        if (!this.pauseButton.isPaused()) {
            this.updateFrame(dtMillisFinal);
        }
        if (!this.isViewRefreshed) {
            this.renderer.redraw();
            this.isViewRefreshed = true;
        }
        var ctx = this.renderer.fgContext;
        var scoreX = ctx.canvas.width - 15;
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
            var ctx_1 = this.renderer.fgContext;
            if (ctx_1.fillStyle != "white") {
                ctx_1.fillStyle = "white";
            }
            if (ctx_1.font != "36px Courier") {
                ctx_1.font = "36px Courier";
            }
            if (ctx_1.textAlign != "center") {
                ctx_1.textAlign = "center";
            }
            if (this.rickRoller.numberOfPauses < this.rickRoller.hintAmount) {
                ctx_1.fillText("P A U S E", ctx_1.canvas.width / 2, ctx_1.canvas.height / 2);
            }
        }
    };
    BallVsWildPage.prototype.updateFrame = function (dtMilliseconds) {
        this.millisSinceLastShot += dtMilliseconds;
        this.millisUntilDoom -= dtMilliseconds;
        if (this.millisUntilDoom <= 0) {
            this.isEnemiesGoingBallistic = !this.isEnemiesGoingBallistic;
            var scalar_1 = this.isEnemiesGoingBallistic ? 0.5 : 2;
            var consequence_1 = this.isEnemiesGoingBallistic ? 0.75 : 1.5;
            this.enemyGenerators.forEach(function (generator) {
                generator.spawnRateMilliseconds = generator.spawnRateMilliseconds * scalar_1;
            });
            this.itemGenerators.forEach(function (generator) {
                generator.spawnRateMilliseconds = generator.spawnRateMilliseconds / consequence_1;
            });
            this.millisUntilDoom = Math.random() * BallVsWildPage_1.WAVELENGTH_MILLIS + 3000;
        }
        for (var i = 0; i < this.enemyGenerators.length; i++) {
            var enemy = this.enemyGenerators[i].tick(dtMilliseconds);
            if (enemy != null) {
                this.enemies.push(enemy);
                this.renderer.addBackgroundObject(enemy);
            }
        }
        for (var i = 0; i < this.itemGenerators.length; i++) {
            var item = this.itemGenerators[i].tick(dtMilliseconds);
            if (item != null) {
                this.items.push(item);
                this.renderer.addBackgroundObject(item);
            }
        }
        this.projectiles = this.projectiles.filter(function (proj) {
            return proj.isAlive;
        });
        var bgContext = this.renderer.bgContext;
        for (var i = 0; i < this.projectiles.length; i++) {
            var projectile = this.projectiles[i];
            if (projectile.positionX < -projectile.size || projectile.positionX > (bgContext.canvas.width + projectile.size) ||
                projectile.positionY < -projectile.size || projectile.positionY > (bgContext.canvas.height + projectile.size)) {
                projectile.isAlive = false;
                this.renderer.removeBackgroundObject(projectile);
            }
            else {
                projectile.update(dtMilliseconds / BallVsWildPage_1.MILLIS_PER_SECOND);
                if (!this.renderer.isInBackground(projectile)) {
                    this.renderer.addBackgroundObject(projectile);
                }
            }
        }
        this.items = this.items.filter(function (item) {
            return item.isAlive;
        });
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            if (item.positionX < -item.size || item.positionX > (bgContext.canvas.width + item.size) ||
                item.positionY < -item.size || item.positionY > (bgContext.canvas.height + item.size)) {
                item.isAlive = false;
                this.renderer.removeBackgroundObject(item);
            }
            else {
                item.update(dtMilliseconds / BallVsWildPage_1.MILLIS_PER_SECOND);
                if (!this.renderer.isInBackground(item)) {
                    this.renderer.addBackgroundObject(item);
                }
            }
        }
        this.enemies = this.enemies.filter(function (enemy) {
            return enemy.isAlive;
        });
        for (var i = 0; i < this.enemies.length; i++) {
            var enemy = this.enemies[i];
            if (this.hero.intersects(enemy)) {
                if (this.healthBar.healthPoints === 1) {
                    this.updateHighScore();
                    this.itemGenerators.forEach(function (itemGenerator) {
                        itemGenerator.totalGameTimeMillis = 0;
                        itemGenerator.resetSpawnRate();
                    });
                    this.enemyGenerators.forEach(function (enemyGenerator) {
                        enemyGenerator.totalGameTimeMillis = 0;
                        enemyGenerator.resetSpawnRate();
                    });
                    this.renderer.suspendForeground();
                    this.renderer.suspendBackground();
                    this.isViewRefreshed = false;
                    this.isEnemiesGoingBallistic = false;
                    this.millisUntilDoom = BallVsWildPage_1.WAVELENGTH_MILLIS;
                    if (this.millisUntilNextAd <= 0) {
                        setTimeout(function () {
                            admob.showInterstitialAd();
                        }, 2000);
                        this.millisUntilNextAd = BallVsWildPage_1.MILLIS_BETWEEN_ADS;
                    }
                    this.isContinueEnabled = !this.isContinueEnabled;
                    this.checkHighScore(BallVsWildPage_1.DAILY_LEADERBOARD_NAME);
                    this.checkHighScore(BallVsWildPage_1.ALL_TIME_LEADERBOARD_NAME);
                }
                this.healthBar.takeHealth();
                this.renderer.redrawForeground();
                enemy.isAlive = false;
                this.renderer.removeBackgroundObject(enemy);
            }
            else {
                enemy.update(dtMilliseconds / BallVsWildPage_1.MILLIS_PER_SECOND);
                if (!this.renderer.isInBackground(enemy)) {
                    this.renderer.addBackgroundObject(enemy);
                }
            }
        }
        for (var k = 0; k < this.projectiles.length; k++) {
            for (var j = 0; j < this.enemies.length; j++) {
                if (this.enemies[j].intersects(this.projectiles[k])) {
                    if (this.enemies[j].name === BallVsWildPage_1.LARGE_BEE["name"]) {
                        this.explodeLargeBee(this.enemies[j]);
                    }
                    this.strikeEnemy(this.enemies[j], this.projectiles[k]);
                }
                else {
                    var offsetX = this.enemies[j].positionX;
                    var offsetY = this.enemies[j].positionY;
                    var x2 = this.projectiles[k].positionX + offsetX;
                    var y2 = this.projectiles[k].positionY + offsetY;
                    this.projectiles[k].reverseFrame(dtMilliseconds / BallVsWildPage_1.MILLIS_PER_SECOND);
                    var x1 = this.projectiles[k].positionX + offsetX;
                    var y1 = this.projectiles[k].positionY + offsetY;
                    var dx_squared = Math.pow(x2 - x1, 2);
                    var dy_squared = Math.pow(y2 - y1, 2);
                    var dr = Math.sqrt(dx_squared + dy_squared);
                    var D = (x1 * y2) - (x2 * y1);
                    var discriminant = (Math.pow(this.enemies[j].size, 2) * Math.pow(dr, 2)) - Math.pow(D, 2);
                    var isIntersection = (discriminant >= 0);
                    if (isIntersection) {
                        if (this.enemies[j].name === BallVsWildPage_1.LARGE_BEE["name"]) {
                            this.explodeLargeBee(this.enemies[j]);
                        }
                        this.strikeEnemy(this.enemies[j], this.projectiles[k]);
                    }
                    else {
                        this.projectiles[k].update(dtMilliseconds / BallVsWildPage_1.MILLIS_PER_SECOND);
                    }
                }
            }
            for (var j = 0; j < this.items.length; j++) {
                if (this.items[j].intersects(this.projectiles[k])) {
                    this.strikeItem(this.items[j], this.projectiles[k]);
                }
                else {
                    var offsetX = this.items[j].positionX;
                    var offsetY = this.items[j].positionY;
                    var x2 = this.projectiles[k].positionX + offsetX;
                    var y2 = this.projectiles[k].positionY + offsetY;
                    this.projectiles[k].reverseFrame(dtMilliseconds / BallVsWildPage_1.MILLIS_PER_SECOND);
                    var x1 = this.projectiles[k].positionX + offsetX;
                    var y1 = this.projectiles[k].positionY + offsetY;
                    var dx_squared = Math.pow(x2 - x1, 2);
                    var dy_squared = Math.pow(y2 - y1, 2);
                    var dr = Math.sqrt(dx_squared + dy_squared);
                    var D = (x1 * y2) - (x2 * y1);
                    var discriminant = (Math.pow(this.items[j].size, 2) * Math.pow(dr, 2)) - Math.pow(D, 2);
                    var isIntersection = (discriminant >= 0);
                    if (isIntersection) {
                        this.strikeItem(this.items[j], this.projectiles[k]);
                    }
                    else {
                        this.projectiles[k].update(dtMilliseconds / BallVsWildPage_1.MILLIS_PER_SECOND);
                    }
                }
            }
        }
        this.powerupSelector.updatePowerupbars(dtMilliseconds);
    };
    BallVsWildPage.prototype.setLeaderboards = function (leaderboardName, jsonBucketID) {
        var _this = this;
        this.http.get('https://api.myjson.com/bins/' + jsonBucketID).map(function (res) { return res.json(); }).subscribe(function (data) {
            if (!(data && data.length > 0)) {
                for (var i = 0; i < 5; i++) {
                    var plyr = "player" + (i + 1);
                    _this.highScores[leaderboardName]["scores"].push({ "name": plyr, "score": 1100 - (100 * i) });
                }
                _this.http.put('https://api.myjson.com/bins/' + jsonBucketID, _this.highScores[leaderboardName]["scores"]).map(function (res) { return res.json(); })
                    .subscribe(function (data) { });
            }
            else {
                _this.highScores[leaderboardName]["scores"] = data;
            }
        });
    };
    BallVsWildPage.prototype.checkHighScore = function (leaderboardName) {
        var scores = this.highScores[leaderboardName]["scores"];
        this.highScores[leaderboardName]["scores"].sort(function (a, b) {
            var result = 0;
            if (a["score"] < b["score"]) {
                result = 1;
            }
            else if (a["score"] > b["score"]) {
                result = -1;
            }
            return result;
        });
        var place = -1;
        for (var i = 0; i < scores.length; i++) {
            if (this.score > scores[i]["score"] && place <= 0) {
                place = i + 1;
            }
        }
        if (place > 0) {
            this.isHighScore = true;
            document.getElementById("leaderboardName").value = this.highScores[leaderboardName]["identifier"];
            document.getElementById("scoreLabel").value = this.score.toString();
            ;
            document.getElementById("rankingLabel").value = "(" + this.place(place) + " place)";
            this.placeTaken = place;
            this.leaderboardName = leaderboardName;
        }
    };
    BallVsWildPage.prototype.place = function (value) {
        var p = "No";
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
    };
    BallVsWildPage.prototype.explodeLargeBee = function (enemy) {
        var page = BallVsWildPage_1;
        var chance = Math.random();
        if (chance > 0.5) {
            for (var i = 0; i < 4; i++) {
                var itemMini = new ImageUnit(this.spritesImg, page.HEALTH_ITEM["srcDimensions"], enemy.positionX, enemy.positionY, 30);
                itemMini.velocityX = (2 * Math.random() * page.MIN_SHOT_VELOCITY) - page.MIN_SHOT_VELOCITY;
                itemMini.velocityY = (2 * Math.random() * page.MIN_SHOT_VELOCITY) - page.MIN_SHOT_VELOCITY;
                this.items.push(itemMini);
                this.renderer.addBackgroundObject(itemMini);
            }
        }
        else {
            var size = Math.max(15, this.renderer.bgContext.canvas.width * 0.06);
            for (var i = 0; i < 4; i++) {
                var enemyMini = new Enemy(5, this.spritesImg, page.MINI_BEE["leftDimensions"], page.MINI_BEE["rightDimensions"], enemy.positionX, enemy.positionY, size, page.MINI_BEE["name"]);
                enemyMini.velocityX = (2 * Math.random() * page.MIN_SHOT_VELOCITY) - page.MIN_SHOT_VELOCITY;
                enemyMini.velocityY = (2 * Math.random() * page.MIN_SHOT_VELOCITY) - page.MIN_SHOT_VELOCITY;
                this.enemies.push(enemyMini);
                this.renderer.addBackgroundObject(enemyMini);
            }
        }
    };
    BallVsWildPage.prototype.strikeEnemy = function (enemy, projectile) {
        this.score += enemy.value;
        this.powerupSelector.powerupBars[this.powerupSelector.selectedIndex].addPoints(enemy.value);
        this.renderer.redrawForeground();
        enemy.isAlive = false;
        projectile.isAlive = false;
        this.renderer.removeBackgroundObject(enemy);
        this.renderer.removeBackgroundObject(projectile);
    };
    BallVsWildPage.prototype.strikeItem = function (item, projectile) {
        // TODO: refactor to be extensible for other item types
        this.score += 5;
        this.healthBar.giveHealth();
        this.renderer.redrawForeground();
        item.isAlive = false;
        projectile.isAlive = false;
        this.renderer.removeBackgroundObject(item);
        this.renderer.removeBackgroundObject(projectile);
    };
    BallVsWildPage.prototype.onDragGesture = function (event) {
        var xVelSquared = event.velocityX * event.velocityX;
        var yVelSquared = event.velocityY * event.velocityY;
        var currentVelocity = Math.sqrt(xVelSquared + yVelSquared);
        if (currentVelocity > this.maxVelocity) {
            this.maxVelocity = currentVelocity;
            this.maxVelocityX = event.velocityX;
            this.maxVelocityY = event.velocityY;
        }
    };
    BallVsWildPage.prototype.onTouchEnd = function (event) {
        if (this.isHighScoresDisplayed && !this.isHighScore) {
            this.healthBar.healthPoints = HealthBar.DEFAULT_MAX_HP;
            this.powerupSelector.clearBars();
            var renderer_1 = this.renderer;
            this.projectiles.forEach(function (projectile) {
                renderer_1.removeBackgroundObject(projectile);
            });
            this.items.forEach(function (item) {
                renderer_1.removeBackgroundObject(item);
            });
            this.enemies.forEach(function (enemy) {
                renderer_1.removeBackgroundObject(enemy);
            });
            this.projectiles = [];
            this.items = [];
            this.enemies = [];
            this.score = 0;
            this.isHighScoresDisplayed = false;
            this.renderer.resume();
            this.renderer.redraw();
        }
        else if (this.healthBar.healthPoints === 0 && this.millisUntilNextAd <= BallVsWildPage_1.MILLIS_BETWEEN_ADS - 2200) {
            this.isHighScoresDisplayed = true;
        }
        else if (this.maxVelocity > 0 && this.millisSinceLastShot >= 200) {
            var velocityScale = BallVsWildPage_1.MIN_SHOT_VELOCITY / Math.abs(this.maxVelocity);
            var size = Math.max(10, this.renderer.bgContext.canvas.width * 0.04);
            var nextProjectile = new ShapeUnit(this.projectileShape, this.hero.positionX, this.hero.positionY, size, BallVsWildPage_1.PROJECTILE_COLOR);
            nextProjectile.velocityX = (velocityScale > 1) ? (this.maxVelocityX * velocityScale) : this.maxVelocityX;
            nextProjectile.velocityY = (velocityScale > 1) ? (this.maxVelocityY * velocityScale) : this.maxVelocityY;
            this.projectiles.push(nextProjectile);
            this.renderer.addBackgroundObject(nextProjectile);
            this.maxVelocity = 0;
            this.millisSinceLastShot = 0;
        }
    };
    BallVsWildPage.prototype.onDoubleTap = function (event) {
        var selectedPowerup = this.powerupSelector.powerupBars[this.powerupSelector.selectedIndex];
        if (selectedPowerup.isPowerupEnabled()) {
            selectedPowerup.expend();
            this.renderer.redrawForeground();
        }
    };
    BallVsWildPage.prototype.onSingleTap = function (event) {
        var centerX = event.center.x;
        var centerY = event.center.y;
        var self = this;
        this.powerupSelector.dimensions.forEach(function (dimension, index) {
            if (dimension.dx < centerX && centerX < dimension.dx + dimension.dWidth &&
                dimension.dy < centerY && centerY < dimension.dy + dimension.dHeight) {
                self.powerupSelector.selectedIndex = index;
                self.renderer.redrawForeground();
            }
        });
        var btn = this.pauseButton.location;
        if (btn.x < centerX && centerX < btn.x + btn.width &&
            btn.y < centerY && centerY < btn.y + btn.height) {
            this.pauseButton.togglePause();
            this.renderer.redrawForeground();
            if (this.pauseButton.isPaused()) {
                this.rickRoller.onPaused();
            }
        }
    };
    BallVsWildPage.prototype.buttonSize = function () {
        return Math.max(40, this.renderer.fgContext.canvas.width * 0.16);
    };
    BallVsWildPage.prototype.initAds = function () {
        if (admob) {
            var adPublisherIds = {
                // ios : {
                //   banner : "ca-app-pub-XXXXXXXXXXXXXXXX/BBBBBBBBBB",
                //   interstitial : "ca-app-pub-XXXXXXXXXXXXXXXX/IIIIIIIIII"
                // },
                android: {
                    banner: "ca-app-pub-3035178355763743~7102114115",
                    interstitial: "ca-app-pub-3035178355763743/"
                }
            };
            var admobid = (/(android)/i.test(navigator.userAgent)) ? adPublisherIds.android : null /*adPublisherIds.ios*/;
            admob.setOptions({
                publisherId: admobid.banner,
                interstitialAdId: admobid.interstitial,
                autoShowInterstitial: false,
                isTesting: true
            });
            this.registerAdEvents();
        }
        else {
            alert('AdMobAds plugin not ready');
        }
    };
    BallVsWildPage.prototype.onAdLoaded = function (e) {
        if (true) {
            if (e.adType === admob.AD_TYPE.INTERSTITIAL) {
                this.isAdsLoaded = true;
                this.isContinueEnabled = true;
            }
        }
    };
    BallVsWildPage.prototype.onAdClosed = function (e) {
        if (true) {
            if (e.adType === admob.AD_TYPE.INTERSTITIAL) {
                admob.requestInterstitialAd();
            }
        }
    };
    BallVsWildPage.prototype.onPause = function () {
        if (true) {
            admob.destroyBannerView();
        }
    };
    BallVsWildPage.prototype.onResume = function () {
        if (!true) {
            setTimeout(admob.createBannerView, 1);
            setTimeout(admob.requestInterstitialAd, 1);
        }
    };
    // optional, in case respond to events
    BallVsWildPage.prototype.registerAdEvents = function () {
        document.addEventListener(admob.events.onAdLoaded, this.onAdLoaded);
        document.addEventListener(admob.events.onAdClosed, this.onAdClosed);
        document.addEventListener("pause", this.onPause, false);
        document.addEventListener("resume", this.onResume, false);
    };
    BallVsWildPage.prototype.makeid = function (length) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    };
    BallVsWildPage.prototype.onSlowMotionEnabled = function (self) {
        self.timeMultiplier = 0.35;
    };
    BallVsWildPage.prototype.onSlowMotionDisabled = function (self) {
        self.timeMultiplier = 1;
    };
    BallVsWildPage.prototype.ionViewDidEnter = function () {
        var foreground = document.getElementById("foreground");
        var background = document.getElementById("background");
        this.renderer = new RenderingEngine(foreground, background);
        this.projectileShape = new Circle(this.renderer.bgContext);
        var powerupWidth = 0.8 * window.innerWidth;
        var powerupHeight = 15;
        var margin = 0.1 * window.innerWidth;
        var yPosition = window.innerHeight - powerupHeight - 15;
        var powerups = [
            new RadialShotBar(this, powerupWidth, powerupHeight, 200, margin, yPosition),
            new ShieldBar(this, powerupWidth, powerupHeight, 150, margin, yPosition),
            new SlowMotionBar(this, powerupWidth, powerupHeight, 250, this.onSlowMotionEnabled, this.onSlowMotionDisabled, SlowMotionBar.DEFAULT_DURATION_MILLIS, margin, yPosition)
        ];
        var view = this.renderer.fgContext.canvas;
        var dimensions = [
            new SpriteDimensions(150, 300, 150, 150, view.width - this.buttonSize() - 10, (3 * 10) + 60 + (2 * this.buttonSize()), this.buttonSize(), this.buttonSize()),
            new SpriteDimensions(0, 300, 150, 150, view.width - this.buttonSize() - 10, (2 * 10) + 60 + this.buttonSize(), this.buttonSize(), this.buttonSize()),
            new SpriteDimensions(0, 450, 150, 150, view.width - this.buttonSize() - 10, 10 + 60, this.buttonSize(), this.buttonSize())
        ];
        this.powerupSelector = new PowerupSelector(powerups, dimensions, this.spritesImg, this.renderer.fgContext);
        this.powerupSelector.selectedIndex = 0;
        this.renderer.addForegroundObject(this.powerupSelector);
        var size = this.renderer.fgContext.canvas.width * 0.13;
        var centerX = this.renderer.fgContext.canvas.width / 2;
        var centerY = this.renderer.fgContext.canvas.height / 2;
        this.heroTopLeftX = centerX - (size / 2);
        this.heroTopLeftY = centerY - (size / 2);
        var heroColor = Color.fromHexValue("#0200FF");
        var heroShape = new Circle(this.renderer.fgContext);
        this.hero = new ShapeUnit(heroShape, centerX, centerY, size, heroColor);
        this.renderer.addForegroundObject(this.hero);
        this.healthBar = new HealthBar(15, 15);
        this.renderer.addForegroundObject(this.healthBar);
        this.renderer.addBackgroundObject(this.rickRoller);
        var page = BallVsWildPage_1;
        this.enemyGenerators.push(new EnemyProducer(10, Math.max(20, this.renderer.bgContext.canvas.width * 0.15), 100, 5000, this.hero, this.spritesImg, page.MEDIUM_BEE["leftDimensions"], page.MEDIUM_BEE["rightDimensions"], this.renderer.bgContext, page.MEDIUM_BEE["name"]));
        this.enemyGenerators.push(new EnemyProducer(30, Math.max(40, this.renderer.bgContext.canvas.width * 0.22), 70, 7500, this.hero, this.spritesImg, page.LARGE_BEE["leftDimensions"], page.LARGE_BEE["rightDimensions"], this.renderer.bgContext, page.LARGE_BEE["name"]));
        this.enemyGenerators.push(new EnemyProducer(25, Math.max(10, this.renderer.bgContext.canvas.width * 0.09), 175, 8000, this.hero, this.spritesImg, page.SMALL_BEE["leftDimensions"], page.SMALL_BEE["rightDimensions"], this.renderer.bgContext, page.SMALL_BEE["name"]));
        this.itemGenerators.push(new ItemProducer(this.spritesImg, page.HEALTH_ITEM["srcDimensions"], 30, 250, 8000, this.renderer.bgContext));
        var pauseButtonLocation = new Dimensions(10, 10 + 60, this.buttonSize(), this.buttonSize());
        this.pauseButton = new PauseButton(this.spritesImg, page.PAUSE_IMG_DIMENSIONS, page.PLAY_IMG_DIMENSIONS, pauseButtonLocation);
        this.renderer.addForegroundObject(this.pauseButton);
        this.renderer.redrawForeground();
        this.millisUntilDoom = BallVsWildPage_1.WAVELENGTH_MILLIS;
        this.initAds();
        admob.requestInterstitialAd();
    };
    return BallVsWildPage;
}());
BallVsWildPage.FPS = 60;
BallVsWildPage.MILLIS_PER_SECOND = 1000;
BallVsWildPage.MIN_SHOT_VELOCITY = 400;
BallVsWildPage.PROJECTILE_COLOR = Color.fromHexValue("#FF0000");
BallVsWildPage.RADIANS_PER_PROJECTILE = ExtendedMath.toRadians(45);
BallVsWildPage.PAUSE_IMG_DIMENSIONS = new Dimensions(600, 300, 150, 150);
BallVsWildPage.PLAY_IMG_DIMENSIONS = new Dimensions(450, 300, 150, 150);
BallVsWildPage.LARGE_BEE = {
    leftDimensions: new Dimensions(600, 150, 150, 150),
    rightDimensions: new Dimensions(0, 0, 150, 150),
    name: "LG_BEE"
};
BallVsWildPage.MEDIUM_BEE = {
    leftDimensions: new Dimensions(450, 150, 150, 150),
    rightDimensions: new Dimensions(150, 0, 150, 150),
    name: "MD_BEE"
};
BallVsWildPage.SMALL_BEE = {
    leftDimensions: new Dimensions(300, 150, 150, 150),
    rightDimensions: new Dimensions(300, 0, 150, 150),
    name: "SM_BEE"
};
BallVsWildPage.MINI_BEE = {
    leftDimensions: new Dimensions(150, 150, 150, 150),
    rightDimensions: new Dimensions(450, 0, 150, 150),
    name: "XS_BEE"
};
BallVsWildPage.HEALTH_ITEM = {
    srcDimensions: new Dimensions(600, 0, 150, 150)
};
BallVsWildPage.MILLIS_BETWEEN_ADS = 120000;
BallVsWildPage.WAVELENGTH_MILLIS = 10000;
BallVsWildPage.DAILY_LEADERBOARD_NAME = "today";
BallVsWildPage.ALL_TIME_LEADERBOARD_NAME = "allTime";
BallVsWildPage = BallVsWildPage_1 = __decorate([
    Component({
        selector: 'ball-vs-wild',
        templateUrl: 'ball-vs-wild.html'
    }),
    __metadata("design:paramtypes", [Storage, Http])
], BallVsWildPage);
export { BallVsWildPage };
var BallVsWildPage_1;
//# sourceMappingURL=ball-vs-wild.js.map