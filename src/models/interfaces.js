var DrawableObject = (function () {
    function DrawableObject() {
    }
    DrawableObject.prototype.draw = function (ctx) {
        if (ctx === void 0) { ctx = null; }
        alert("ERROR: This cannot be drawn. The developer messed up and is sorry :/");
    };
    return DrawableObject;
}());
export { DrawableObject };
//# sourceMappingURL=interfaces.js.map