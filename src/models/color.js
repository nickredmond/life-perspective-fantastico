var Color = (function () {
    function Color(r, g, b) {
        if (r === void 0) { r = 0; }
        if (g === void 0) { g = 0; }
        if (b === void 0) { b = 0; }
        this.hexValue = null;
        this.r = r;
        this.g = g;
        this.b = b;
    }
    Color.fromHexValue = function (hexValue) {
        var rgbValue = Color.hexToRGB(hexValue);
        var color = new Color(rgbValue.r, rgbValue.g, rgbValue.b);
        color.hexValue = hexValue;
        return color;
    };
    Color.hexToRGB = function (hexValue) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexValue);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };
    Color.prototype.toStringRGB = function () {
        return "rgb(" + this.r + ", " + this.g + ", " + this.b + ")";
    };
    return Color;
}());
export { Color };
//# sourceMappingURL=color.js.map