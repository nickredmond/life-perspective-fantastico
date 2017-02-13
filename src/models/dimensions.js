var Dimensions = (function () {
    function Dimensions(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
    }
    return Dimensions;
}());
export { Dimensions };
var SpriteDimensions = (function () {
    function SpriteDimensions(sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
        this.sx = sx;
        this.sy = sy;
        this.sWidth = sWidth;
        this.sHeight = sHeight;
        this.dx = dx;
        this.dy = dy;
        this.dWidth = dWidth;
        this.dHeight = dHeight;
    }
    return SpriteDimensions;
}());
export { SpriteDimensions };
//# sourceMappingURL=dimensions.js.map