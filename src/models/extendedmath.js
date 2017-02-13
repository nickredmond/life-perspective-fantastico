var ExtendedMath = (function () {
    function ExtendedMath() {
    }
    ExtendedMath.average = function (values) {
        var sum = 0;
        for (var i = 0; i < values.length; i++) {
            sum += values[i];
        }
        return sum / values.length;
    };
    ExtendedMath.toRadians = function (degrees) {
        return degrees * (Math.PI / 180);
    };
    return ExtendedMath;
}());
export { ExtendedMath };
//# sourceMappingURL=extendedmath.js.map