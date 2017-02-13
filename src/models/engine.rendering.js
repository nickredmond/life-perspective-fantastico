var RenderingEngine = (function () {
    function RenderingEngine(foreground, background, width, height) {
        if (width === void 0) { width = window.innerWidth; }
        if (height === void 0) { height = window.innerHeight; }
        this.fgContext = null;
        this.bgContext = null;
        this.bgObjects = [];
        this.fgObjects = [];
        this.isForegroundSuspended = false;
        this.isBackgroundSuspended = false;
        this.fgContext = foreground.getContext("2d");
        this.bgContext = background.getContext("2d");
        this.bgContext.canvas.width = width;
        this.bgContext.canvas.height = height;
        this.bgContext.canvas.style.backgroundColor = "#000";
        this.fgContext.canvas.width = width;
        this.fgContext.canvas.height = height;
        this.fgContext.canvas.style.backgroundColor = "transparent";
    }
    RenderingEngine.prototype.addBackgroundObject = function (objToAdd) {
        this.bgObjects.push(objToAdd);
    };
    RenderingEngine.prototype.addForegroundObject = function (objToAdd) {
        this.fgObjects.push(objToAdd);
    };
    RenderingEngine.prototype.removeBackgroundObject = function (objToRemove) {
        var i = this.bgObjects.indexOf(objToRemove);
        this.bgObjects.splice(i, 1);
    };
    RenderingEngine.prototype.removeForegroundObject = function (objToRemove) {
        var i = this.fgObjects.indexOf(objToRemove);
        this.fgObjects.splice(i, 1);
    };
    RenderingEngine.prototype.redrawBackground = function () {
        if (!this.isBackgroundSuspended) {
            var self_1 = this;
            this.bgContext.clearRect(0, 0, this.bgContext.canvas.width, this.bgContext.canvas.height);
            this.bgObjects.forEach(function (obj) {
                obj.draw(self_1.bgContext);
            });
        }
    };
    RenderingEngine.prototype.redrawForeground = function () {
        if (!this.isForegroundSuspended) {
            var self_2 = this;
            this.fgContext.clearRect(0, 0, this.fgContext.canvas.width, this.fgContext.canvas.height);
            this.fgObjects.forEach(function (obj) {
                obj.draw(self_2.fgContext);
            });
        }
    };
    RenderingEngine.prototype.suspendBackground = function () {
        this.bgContext.clearRect(0, 0, this.bgContext.canvas.width, this.bgContext.canvas.height);
        this.isBackgroundSuspended = true;
    };
    RenderingEngine.prototype.resumeBackground = function () {
        this.isBackgroundSuspended = false;
    };
    RenderingEngine.prototype.suspendForeground = function () {
        this.fgContext.clearRect(0, 0, this.fgContext.canvas.width, this.fgContext.canvas.height);
        this.isForegroundSuspended = true;
    };
    RenderingEngine.prototype.resumeForeground = function () {
        this.isForegroundSuspended = false;
    };
    RenderingEngine.prototype.clearBackground = function () {
        this.bgObjects.splice(0, this.bgObjects.length);
    };
    RenderingEngine.prototype.includes = function (array, obj) {
        var isIncluded = false;
        for (var i = 0; i < array.length && !isIncluded; i++) {
            isIncluded = (array[i] === obj);
        }
        return isIncluded;
    };
    RenderingEngine.prototype.isInBackground = function (obj) {
        return this.includes(this.bgObjects, obj);
    };
    // COLLECTIVE METHODS
    RenderingEngine.prototype.redraw = function () {
        this.redrawBackground();
        this.redrawForeground();
    };
    RenderingEngine.prototype.suspend = function () {
        this.suspendBackground();
        this.suspendForeground();
    };
    RenderingEngine.prototype.resume = function () {
        this.resumeBackground();
        this.resumeForeground();
    };
    return RenderingEngine;
}());
export { RenderingEngine };
//# sourceMappingURL=engine.rendering.js.map