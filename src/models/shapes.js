var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Shape = (function () {
    function Shape(ctx) {
        this.ctx = null;
        this.ctx = ctx;
    }
    Shape.prototype.draw = function (color, x, y, size) {
        throw new Error("Shape::draw() not implemented!");
    };
    return Shape;
}());
export { Shape };
var Circle = (function (_super) {
    __extends(Circle, _super);
    function Circle() {
        return _super.apply(this, arguments) || this;
    }
    Circle.prototype.draw = function (color, x, y, radius) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = color.toStringRGB();
        this.ctx.fill();
    };
    return Circle;
}(Shape));
export { Circle };
//# sourceMappingURL=shapes.js.map