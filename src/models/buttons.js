var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { DrawableObject } from "./interfaces";
var PauseButton = (function (_super) {
    __extends(PauseButton, _super);
    function PauseButton(spritesImg, pauseImgDimensions, playImgDimensions, location) {
        var _this = _super.call(this) || this;
        _this.spritesImg = null;
        _this.pauseImgDimensions = null;
        _this.playImgDimensions = null;
        _this.location = null;
        _this.paused = false;
        _this.spritesImg = spritesImg;
        _this.pauseImgDimensions = pauseImgDimensions;
        _this.playImgDimensions = playImgDimensions;
        _this.location = location;
        return _this;
    }
    PauseButton.prototype.togglePause = function () {
        this.paused = !this.paused;
    };
    PauseButton.prototype.pause = function () {
        this.paused = true;
    };
    PauseButton.prototype.play = function () {
        this.paused = false;
    };
    PauseButton.prototype.isPaused = function () {
        return this.paused;
    };
    PauseButton.prototype.draw = function (ctx) {
        if (ctx === void 0) { ctx = null; }
        var dimensions = this.paused ? this.pauseImgDimensions : this.playImgDimensions;
        ctx.drawImage(this.spritesImg, dimensions.x, dimensions.y, dimensions.width, dimensions.height, this.location.x, this.location.y, this.location.width, this.location.height);
    };
    return PauseButton;
}(DrawableObject));
export { PauseButton };
//# sourceMappingURL=buttons.js.map