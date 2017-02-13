var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { ExtendedMath } from "./extendedmath";
import { ShapeUnit } from "./unit";
import { BallVsWildPage } from "../pages/ball-vs-wild/ball-vs-wild";
import { DrawableObject } from "./interfaces";
var HealthBar = (function (_super) {
    __extends(HealthBar, _super);
    function HealthBar(positionX, positionY, maxHP, hpSize) {
        if (maxHP === void 0) { maxHP = HealthBar.DEFAULT_MAX_HP; }
        if (hpSize === void 0) { hpSize = HealthBar.DEFAULT_HP_SIZE; }
        var _this = _super.call(this) || this;
        _this.isShielded = false;
        _this.positionX = positionX;
        _this.positionY = positionY;
        _this.healthPointSize = hpSize;
        _this.maxHealthPoints = maxHP;
        _this.healthPoints = maxHP;
        _this.hpImage = new Image();
        _this.hpImage.src = HealthBar.HP_IMG_SRC;
        _this.shieldImage = new Image();
        _this.shieldImage.src = HealthBar.SHIELD_IMG_SRC;
        return _this;
    }
    HealthBar.prototype.giveHealth = function () {
        if (this.healthPoints < this.maxHealthPoints) {
            this.healthPoints += 1;
        }
    };
    HealthBar.prototype.takeHealth = function () {
        if (this.healthPoints > 0) {
            if (this.isShielded) {
                this.isShielded = false;
            }
            else {
                this.healthPoints -= 1;
            }
        }
    };
    HealthBar.prototype.addShield = function () {
        if (!this.isShielded && this.healthPoints > 0) {
            this.isShielded = true;
        }
    };
    HealthBar.prototype.draw = function (ctx) {
        if (ctx === void 0) { ctx = null; }
        var imgX = this.positionX;
        for (var i = 0; i < this.healthPoints; i++) {
            ctx.drawImage(this.hpImage, imgX, this.positionY, this.healthPointSize, this.healthPointSize);
            imgX += this.healthPointSize + HealthBar.HP_PADDING;
        }
        if (this.isShielded) {
            var d = HealthBar.SHIELD_IMG_DIMENSIONS;
            ctx.drawImage(this.shieldImage, d["dx"], d["dy"], d["dWidth"], d["dHeight"], imgX, this.positionY, this.healthPointSize, this.healthPointSize);
        }
    };
    return HealthBar;
}(DrawableObject));
export { HealthBar };
HealthBar.DEFAULT_HP_SIZE = 25;
HealthBar.DEFAULT_MAX_HP = 3;
HealthBar.HP_PADDING = 5;
HealthBar.HP_IMG_SRC = "img/health-point-heart.ico";
HealthBar.SHIELD_IMG_SRC = "img/sprites.png";
HealthBar.SHIELD_IMG_DIMENSIONS = {
    "dx": 300,
    "dy": 300,
    "dWidth": 150,
    "dHeight": 150
};
var PowerupBar = (function (_super) {
    __extends(PowerupBar, _super);
    function PowerupBar(width, height, maxPoints, x, y, page, barFilledPhrase, blinkRateMillis) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (barFilledPhrase === void 0) { barFilledPhrase = "DOUBLE-TAP"; }
        if (blinkRateMillis === void 0) { blinkRateMillis = PowerupBar.DEFAULT_BLINK_RATE; }
        var _this = _super.call(this) || this;
        _this.currentPoints = 0;
        _this.isTextShowing = false;
        _this.millisSinceBlink = 0;
        _this.isUseEnabled = true;
        _this.height = height;
        _this.width = width;
        _this.maxPoints = maxPoints;
        _this.barFilledPhrase = barFilledPhrase;
        _this.blinkRateMillis = blinkRateMillis;
        _this.positionX = x;
        _this.positionY = y;
        _this.page = page;
        return _this;
    }
    PowerupBar.prototype.addPoints = function (points) {
        if (this.currentPoints < this.maxPoints && this.isUseEnabled) {
            var pointsToAdd = Math.min(this.pointsLeft(), points);
            this.currentPoints += pointsToAdd;
            if (this.currentPoints >= this.maxPoints) {
                this.isTextShowing = true;
            }
        }
    };
    PowerupBar.prototype.isPowerupEnabled = function () {
        return this.currentPoints >= this.maxPoints;
    };
    PowerupBar.prototype.expend = function () {
        throw new Error("Cannot call expend() in base class!");
    };
    PowerupBar.prototype.clearBar = function () {
        this.currentPoints = 0;
        this.millisSinceBlink = 0;
        this.isTextShowing = false;
    };
    PowerupBar.prototype.update = function (dtMilliseconds) {
        if (this.isPowerupEnabled()) {
            this.millisSinceBlink += dtMilliseconds;
            if (this.millisSinceBlink >= this.blinkRateMillis ||
                (this.millisSinceBlink >= (0.5 * this.blinkRateMillis) && this.isTextShowing === false)) {
                this.isTextShowing = !this.isTextShowing;
                this.millisSinceBlink = 0;
                this.page.renderer.redrawForeground();
            }
        }
    };
    PowerupBar.prototype.draw = function (ctx) {
        if (ctx === void 0) { ctx = null; }
        if (this.currentPoints > 0) {
            var percentFilled = this.currentPoints / this.maxPoints;
            var fillWidth = Math.floor(percentFilled * this.width);
            ctx.fillStyle = "white";
            ctx.fillRect(this.positionX, this.positionY, fillWidth, this.height);
            if (this.isTextShowing) {
                if (ctx.font != "22px Courier") {
                    ctx.font = "22px Courier";
                }
                if (ctx.textAlign != "center") {
                    ctx.textAlign = "center";
                }
                var centerX = ctx.canvas.width / 2;
                ctx.fillText(this.barFilledPhrase, centerX, this.positionY - 10);
            }
        }
    };
    PowerupBar.prototype.pointsLeft = function () {
        return this.maxPoints - this.currentPoints;
    };
    PowerupBar.prototype.throwPrematureExpendError = function () {
        throw new Error("Cannot expend powerup: " + this.pointsLeft() + " pts needed!");
    };
    return PowerupBar;
}(DrawableObject));
export { PowerupBar };
PowerupBar.DEFAULT_BLINK_RATE = 350;
var PowerupSelector = (function (_super) {
    __extends(PowerupSelector, _super);
    function PowerupSelector(powerupBars, dimensions, spritesImg, ctx) {
        var _this = _super.call(this) || this;
        _this.selectedIndex = 999999;
        _this.powerupBars = [];
        _this.canvasContext = null;
        _this.powerupBars = powerupBars;
        _this.dimensions = dimensions;
        _this.canvasContext = ctx;
        _this.spritesImage = spritesImg;
        return _this;
    }
    PowerupSelector.prototype.clearBars = function () {
        this.powerupBars.forEach(function (powerupBar) {
            powerupBar.clearBar();
        });
    };
    PowerupSelector.prototype.updatePowerupbars = function (dtMilliseconds) {
        this.powerupBars.forEach(function (powerupBar) {
            powerupBar.update(dtMilliseconds);
        });
    };
    PowerupSelector.prototype.draw = function (ctx) {
        if (ctx === void 0) { ctx = null; }
        this.powerupBars[this.selectedIndex].draw(this.canvasContext);
        var self = this;
        this.dimensions.forEach(function (dimension, index) {
            var ctx = self.canvasContext;
            var d = dimension;
            ctx.drawImage(self.spritesImage, d.sx, d.sy, d.sWidth, d.sHeight, d.dx, d.dy, d.dWidth, d.dHeight);
            if (index === self.selectedIndex) {
                var thickness = 2;
                if (ctx.fillStyle != "white") {
                    ctx.fillStyle = "white";
                }
                ctx.fillRect(d.dx, d.dy, Math.max(5, ctx.canvas.width * 0.03), thickness);
                ctx.fillRect(d.dx, d.dy, thickness, Math.max(5, ctx.canvas.width * 0.03));
                ctx.fillRect(d.dx + d.dWidth - Math.max(5, ctx.canvas.width * 0.03), d.dy, Math.max(5, ctx.canvas.width * 0.03), thickness);
                ctx.fillRect(d.dx + d.dWidth, d.dy, thickness, Math.max(5, ctx.canvas.width * 0.03));
                ctx.fillRect(d.dx + d.dWidth - Math.max(5, ctx.canvas.width * 0.03), d.dy + d.dHeight, Math.max(5, ctx.canvas.width * 0.03), thickness);
                ctx.fillRect(d.dx + d.dWidth, d.dy + d.dHeight - Math.max(5, ctx.canvas.width * 0.03), thickness, Math.max(5, ctx.canvas.width * 0.03) + thickness);
                ctx.fillRect(d.dx, d.dy + d.dHeight, Math.max(5, ctx.canvas.width * 0.03), thickness);
                ctx.fillRect(d.dx, d.dy + d.dHeight - Math.max(5, ctx.canvas.width * 0.03), thickness, Math.max(5, ctx.canvas.width * 0.03));
            }
        });
    };
    return PowerupSelector;
}(DrawableObject));
export { PowerupSelector };
var ShieldBar = (function (_super) {
    __extends(ShieldBar, _super);
    function ShieldBar(page, width, height, maxPoints, x, y, barFilledPhrase, blinkRateMillis) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (barFilledPhrase === void 0) { barFilledPhrase = "DOUBLE-TAP"; }
        if (blinkRateMillis === void 0) { blinkRateMillis = PowerupBar.DEFAULT_BLINK_RATE; }
        return _super.call(this, width, height, maxPoints, x, y, page, barFilledPhrase, blinkRateMillis) || this;
    }
    ShieldBar.prototype.expend = function () {
        if (this.isPowerupEnabled()) {
            this.page.healthBar.addShield();
            this.clearBar();
        }
        else {
            this.throwPrematureExpendError();
        }
    };
    return ShieldBar;
}(PowerupBar));
export { ShieldBar };
var RadialShotBar = (function (_super) {
    __extends(RadialShotBar, _super);
    function RadialShotBar(page, width, height, maxPoints, x, y, barFilledPhrase, blinkRateMillis) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (barFilledPhrase === void 0) { barFilledPhrase = "DOUBLE-TAP"; }
        if (blinkRateMillis === void 0) { blinkRateMillis = PowerupBar.DEFAULT_BLINK_RATE; }
        return _super.call(this, width, height, maxPoints, x, y, page, barFilledPhrase, blinkRateMillis) || this;
    }
    RadialShotBar.prototype.expend = function () {
        if (this.isPowerupEnabled()) {
            this.executeRadialShot();
            this.clearBar();
        }
        else {
            this.throwPrematureExpendError();
        }
    };
    RadialShotBar.prototype.executeRadialShot = function () {
        var startingDegrees = Math.random() * 360;
        var startingRadians = ExtendedMath.toRadians(startingDegrees);
        var size = Math.max(10, this.page.renderer.bgContext.canvas.width * 0.04);
        for (var i = 0; i < 8; i++) {
            var radians = startingRadians + (BallVsWildPage.RADIANS_PER_PROJECTILE * i);
            var xVelocityRatio = Math.cos(radians);
            var yVelocityRatio = Math.sin(radians);
            var nextProjectile = new ShapeUnit(this.page.projectileShape, this.page.hero.positionX, this.page.hero.positionY, size, BallVsWildPage.PROJECTILE_COLOR);
            nextProjectile.velocityX = xVelocityRatio * BallVsWildPage.MIN_SHOT_VELOCITY;
            nextProjectile.velocityY = yVelocityRatio * BallVsWildPage.MIN_SHOT_VELOCITY;
            this.page.projectiles.push(nextProjectile);
            this.page.renderer.addBackgroundObject(nextProjectile);
        }
    };
    return RadialShotBar;
}(PowerupBar));
export { RadialShotBar };
var SlowMotionBar = (function (_super) {
    __extends(SlowMotionBar, _super);
    function SlowMotionBar(page, width, height, maxPoints, onSlowMotionEnabled, onSlowMotionDisabled, durationMillis, x, y, barFilledPhrase, blinkRateMillis) {
        if (durationMillis === void 0) { durationMillis = SlowMotionBar.DEFAULT_DURATION_MILLIS; }
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (barFilledPhrase === void 0) { barFilledPhrase = "DOUBLE-TAP"; }
        if (blinkRateMillis === void 0) { blinkRateMillis = PowerupBar.DEFAULT_BLINK_RATE; }
        var _this = _super.call(this, width, height, maxPoints, x, y, page, barFilledPhrase, blinkRateMillis) || this;
        _this.durationMillis = 0;
        _this.isSlowMotionBar = true;
        _this.onSlowMotionEnabled = onSlowMotionEnabled;
        _this.onSlowMotionDisabled = onSlowMotionDisabled;
        _this.durationMillis = durationMillis;
        _this.page = page;
        return _this;
    }
    SlowMotionBar.prototype.expend = function () {
        if (this.isPowerupEnabled()) {
            this.onSlowMotionEnabled(this.page);
            this.isUseEnabled = false;
            var timer_1 = document.getElementById("timer");
            timer_1.style.display = "block";
            this.clearBar();
            var self_1 = this;
            var totalMillis_1 = 0;
            var millisSinceSet_1 = 0;
            var isTextSet_1 = false;
            var useInterval_1 = setInterval(function () {
                totalMillis_1 += 20;
                millisSinceSet_1 += 20;
                var actualSecondsLeft = (self_1.durationMillis - totalMillis_1) / 1000;
                var timeLeftSeconds = Math.ceil(actualSecondsLeft);
                var opacity = 1 - (timeLeftSeconds - actualSecondsLeft);
                timer_1.style.opacity = opacity.toString();
                if (millisSinceSet_1 >= 1000 || !isTextSet_1) {
                    timer_1.innerHTML = timeLeftSeconds + " sec.";
                    millisSinceSet_1 = 0;
                    isTextSet_1 = true;
                }
            }, 20);
            setTimeout(function () {
                self_1.onSlowMotionDisabled(self_1.page);
                self_1.isUseEnabled = true;
                document.getElementById("timer").style.display = "none";
                clearInterval(useInterval_1);
            }, this.durationMillis);
        }
        else {
            this.throwPrematureExpendError();
        }
    };
    return SlowMotionBar;
}(PowerupBar));
export { SlowMotionBar };
SlowMotionBar.DEFAULT_DURATION_MILLIS = 8000;
//# sourceMappingURL=statusbars.js.map