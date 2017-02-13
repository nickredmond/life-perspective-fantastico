var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { DrawableObject } from "./interfaces";
var RickRollManager = (function (_super) {
    __extends(RickRollManager, _super);
    function RickRollManager(http, linkID, triggerAmount, hintAmount) {
        if (linkID === void 0) { linkID = RickRollManager.DEFAULT_LINK_ID; }
        if (triggerAmount === void 0) { triggerAmount = RickRollManager.DEFAULT_TRIGGER_AMT; }
        if (hintAmount === void 0) { hintAmount = RickRollManager.DEFAULT_HINT_AMT; }
        var _this = _super.call(this) || this;
        _this.linkID = null;
        _this.triggerAmount = 0;
        _this.numberOfPauses = 0;
        _this.millisSincePause = 0;
        _this.hintAmount = 0;
        _this.words = {
            "6": {
                "text": "The",
                "yLoc": 0.2
            },
            "7": {
                "text": "Amazing",
                "yLoc": 0.35
            },
            "8": {
                "text": "Random",
                "yLoc": 0.65
            },
            "9": {
                "text": "Web",
                "yLoc": 0.8
            }
        };
        _this.http = http;
        _this.linkID = linkID;
        _this.triggerAmount = triggerAmount;
        _this.hintAmount = hintAmount;
        return _this;
    }
    RickRollManager.prototype.update = function (dtMilliseconds) {
        this.millisSincePause += dtMilliseconds;
    };
    RickRollManager.prototype.draw = function (ctx) {
        if (ctx === void 0) { ctx = null; }
        if (this.numberOfPauses >= this.hintAmount) {
            if (ctx.textAlign != "center") {
                ctx.textAlign = "center";
            }
            if (ctx.font != "48px Courier") {
                ctx.font = "48px Courier";
            }
            var opacity = Math.max(0, RickRollManager.FADE_MILLIS - this.millisSincePause) /
                RickRollManager.FADE_MILLIS;
            ctx.fillStyle = "rgba(255, 255, 255, " + opacity + ")";
            var word = this.words[this.numberOfPauses.toString()];
            // console.log("yep " + opacity + " and (" + (ctx.canvas.width / 2) +", " + (ctx.canvas.height * word["yLoc"]) + ")");
            ctx.fillText(word["text"], ctx.canvas.width / 2, ctx.canvas.height * word["yLoc"]);
        }
    };
    RickRollManager.prototype.onPaused = function () {
        if (this.millisSincePause > RickRollManager.MAX_MILLIS_BETWEEN_PAUSES) {
            this.numberOfPauses = 0;
        }
        this.millisSincePause = 0;
        this.numberOfPauses += 1;
        if (this.numberOfPauses >= this.triggerAmount) {
            this.numberOfPauses = 0;
            this.http.get("");
        }
    };
    return RickRollManager;
}(DrawableObject));
export { RickRollManager };
RickRollManager.DEFAULT_LINK_ID = "rickRollLink";
RickRollManager.MAX_MILLIS_BETWEEN_PAUSES = 1000;
RickRollManager.DEFAULT_TRIGGER_AMT = 10;
RickRollManager.DEFAULT_HINT_AMT = 6;
RickRollManager.FADE_MILLIS = 1000;
//# sourceMappingURL=rickroll.manager.js.map