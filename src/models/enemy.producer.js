var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { Enemy, ImageUnit } from "./unit";
var UnitProducer = (function () {
    function UnitProducer(size, velocity, spawnRateMillis, ctx) {
        this.millisTilNextSpawn = 0;
        this.totalGameTimeMillis = 0;
        this.size = size;
        this.velocity = velocity;
        this.spawnRateMilliseconds = spawnRateMillis;
        this.originalSpawnRate = spawnRateMillis;
        this.canvasContext = ctx;
        this.resetSpawnTimer();
    }
    UnitProducer.prototype.tick = function (dtMilliseconds, generateFunction) {
        if (generateFunction === void 0) { generateFunction = null; }
        var unit = null;
        if (this.millisTilNextSpawn <= 0) {
            unit = generateFunction(this, this.canvasContext);
            this.resetSpawnTimer();
        }
        else {
            this.millisTilNextSpawn -= dtMilliseconds;
        }
        this.totalGameTimeMillis += dtMilliseconds;
        return unit;
    };
    UnitProducer.prototype.resetSpawnRate = function () {
        this.spawnRateMilliseconds = this.originalSpawnRate;
    };
    UnitProducer.prototype.resetSpawnTimer = function () {
        this.millisTilNextSpawn = Math.random() * this.spawnRateMilliseconds;
    };
    return UnitProducer;
}());
export { UnitProducer };
var EnemyProducer = (function (_super) {
    __extends(EnemyProducer, _super);
    function EnemyProducer(value, size, velocity, spawnRateMillis, hero, srcImg, leftSrc, rightSrc, ctx, enemyName) {
        if (enemyName === void 0) { enemyName = null; }
        var _this = _super.call(this, size, velocity, spawnRateMillis, ctx) || this;
        _this.hero = hero;
        _this.value = value;
        _this.srcImg = srcImg;
        _this.leftSrc = leftSrc;
        _this.rightSrc = rightSrc;
        _this.enemyName = enemyName;
        return _this;
    }
    EnemyProducer.prototype.tick = function (dtMilliseconds, generateFunction) {
        if (generateFunction === void 0) { generateFunction = null; }
        return UnitProducer.prototype.tick.call(this, dtMilliseconds, this.generateEnemy);
    };
    EnemyProducer.prototype.generateEnemy = function (producer, ctx) {
        var size = producer.size;
        var x, y = 0;
        var direction = Math.random() * 4;
        if (direction < 1) {
            x = Math.random() * ctx.canvas.width;
            y = -size;
        }
        else if (direction < 2) {
            x = ctx.canvas.width + size;
            y = Math.random() * ctx.canvas.height;
        }
        else if (direction < 3) {
            x = Math.random() * ctx.canvas.width;
            y = ctx.canvas.height + size;
        }
        else {
            x = -size;
            y = Math.random() * ctx.canvas.height;
        }
        var maker = producer;
        var enemy = new Enemy(maker.value, maker.srcImg, maker.leftSrc, maker.rightSrc, x, y, size, maker.enemyName);
        var deltaX = producer.hero.positionX - x;
        var deltaY = producer.hero.positionY - y;
        var deltaVel = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
        var scale = producer.velocity / deltaVel;
        enemy.velocityX = scale * deltaX;
        enemy.velocityY = scale * deltaY;
        return enemy;
    };
    EnemyProducer.prototype.resetSpawnTimer = function () {
        var scale = this.spawnRateMilliseconds - (((this.totalGameTimeMillis / 1000 / 60) / 5) * this.spawnRateMilliseconds);
        this.millisTilNextSpawn = Math.max(800, scale);
    };
    return EnemyProducer;
}(UnitProducer));
export { EnemyProducer };
var ItemProducer = (function (_super) {
    __extends(ItemProducer, _super);
    function ItemProducer(srcImg, srcDimensions, size, velocity, spawnRateMillis, ctx) {
        var _this = _super.call(this, size, velocity, spawnRateMillis, ctx) || this;
        _this.srcImg = srcImg;
        _this.srcDimensions = srcDimensions;
        return _this;
    }
    ItemProducer.prototype.tick = function (dtMilliseconds, generateFunction) {
        if (generateFunction === void 0) { generateFunction = null; }
        return UnitProducer.prototype.tick.call(this, dtMilliseconds, this.generateItem);
    };
    ItemProducer.prototype.generateItem = function (producer, ctx) {
        var size = producer.size;
        var x, y, deltaX, deltaY = 0;
        var direction = Math.random() * 4;
        if (direction < 1) {
            x = Math.random() * ctx.canvas.width;
            y = -size;
            deltaX = (Math.random() * ctx.canvas.width) - x;
            deltaY = ctx.canvas.height + size;
        }
        else if (direction < 2) {
            x = ctx.canvas.width + size;
            y = Math.random() * ctx.canvas.height;
            deltaX = -size;
            deltaY = (Math.random() * ctx.canvas.height) - y;
        }
        else if (direction < 3) {
            x = Math.random() * ctx.canvas.width;
            y = ctx.canvas.height + size;
            deltaX = (Math.random() * ctx.canvas.width) - x;
            deltaY = -size;
        }
        else {
            x = -size;
            y = Math.random() * ctx.canvas.height;
            deltaX = ctx.canvas.width + size;
            deltaY = (Math.random() * ctx.canvas.height) - y;
        }
        var maker = producer;
        var item = new ImageUnit(maker.srcImg, maker.srcDimensions, x, y, size);
        var deltaVel = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
        var scale = producer.velocity / deltaVel;
        item.velocityX = scale * deltaX;
        item.velocityY = scale * deltaY;
        return item;
    };
    ItemProducer.prototype.resetSpawnTimer = function () {
        var scale = this.spawnRateMilliseconds + (((this.totalGameTimeMillis / 1000 / 60) / 5) * this.spawnRateMilliseconds);
        this.millisTilNextSpawn = Math.max(1000, scale);
    };
    return ItemProducer;
}(UnitProducer));
export { ItemProducer };
//# sourceMappingURL=enemy.producer.js.map