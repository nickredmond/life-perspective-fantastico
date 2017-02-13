var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { Color } from "./color";
var Unit = (function () {
    function Unit(x, y, size) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (size === void 0) { size = 0; }
        this.isAlive = true;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isDrawn = false;
        this.needsDraw = null;
        this.positionX = x;
        this.positionY = y;
        this.size = size;
    }
    Unit.prototype.intersects = function (otherUnit) {
        var x_diff_squared = Math.pow(otherUnit.positionX - this.positionX, 2);
        var y_diff_squared = Math.pow(otherUnit.positionY - this.positionY, 2);
        var distance = Math.sqrt(x_diff_squared + y_diff_squared);
        return distance < (otherUnit.radius() + this.radius());
    };
    Unit.prototype.radius = function () {
        return this.size / 2;
    };
    Unit.prototype.update = function (dt) {
        if (!this.isDrawn && this.ctx) {
            this.needsDraw(this.ctx);
        }
        else {
            this.isDrawn = false;
        }
        this.positionX += (this.velocityX * dt);
        this.positionY += (this.velocityY * dt);
    };
    Unit.prototype.reverseFrame = function (dt) {
        this.positionX -= (this.velocityX * dt);
        this.positionY -= (this.velocityY * dt);
    };
    return Unit;
}());
export { Unit };
var ShapeUnit = (function (_super) {
    __extends(ShapeUnit, _super);
    function ShapeUnit(shape, x, y, size, color) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (size === void 0) { size = 0; }
        if (color === void 0) { color = new Color(); }
        var _this = _super.call(this, x, y, size) || this;
        _this.color = color;
        _this.shape = shape;
        return _this;
    }
    ShapeUnit.prototype.draw = function (ctx) {
        this.shape.draw(this.color, this.positionX, this.positionY, this.radius());
    };
    return ShapeUnit;
}(Unit));
export { ShapeUnit };
var ImageUnit = (function (_super) {
    __extends(ImageUnit, _super);
    function ImageUnit(spritesImage, srcDimensions, x, y, size) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (size === void 0) { size = 0; }
        var _this = _super.call(this, x, y, size) || this;
        _this.sourceImg = spritesImage;
        _this.srcDimensions = srcDimensions;
        return _this;
    }
    ImageUnit.prototype.draw = function (ctx) {
        ctx.drawImage(this.sourceImg, this.srcDimensions.x, this.srcDimensions.y, this.srcDimensions.width, this.srcDimensions.height, this.positionX - this.radius(), this.positionY - this.radius(), this.size, this.size);
    };
    return ImageUnit;
}(Unit));
export { ImageUnit };
var Enemy = (function (_super) {
    __extends(Enemy, _super);
    function Enemy(value, spritesImage, leftDimensions, rightDimensions, x, y, size, name) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (size === void 0) { size = 0; }
        if (name === void 0) { name = null; }
        var _this = _super.call(this, spritesImage, rightDimensions, x, y, size) || this;
        _this.value = value;
        _this.leftSrcDimensions = leftDimensions;
        _this.name = name;
        _this.needsDraw = _this.draw;
        return _this;
    }
    Enemy.prototype.radius = function () {
        return this.size / 1.5;
    };
    Enemy.prototype.draw = function (ctx) {
        if (!this.ctx) {
            this.ctx = ctx;
        }
        var srcRect = (this.velocityX < 0) ? this.leftSrcDimensions : this.srcDimensions;
        ctx.drawImage(this.sourceImg, srcRect.x, srcRect.y, srcRect.width, srcRect.height, (this.positionX - this.radius()), (this.positionY - this.radius()), this.size, this.size);
        this.isDrawn = true;
    };
    return Enemy;
}(ImageUnit));
export { Enemy };
//# sourceMappingURL=unit.js.map