import { StringTools } from "./stringtools";
var GraphicArtist = (function () {
    function GraphicArtist() {
    }
    GraphicArtist.drawHighScores = function (page, ctx, scoresList, centerX, topY, isLastList) {
        if (isLastList === void 0) { isLastList = false; }
        page.userName = "";
        document.getElementById("usernameField").style.display = "none";
        var scores = scoresList["scores"];
        if (ctx.font != "28px Courier" || ctx.textAlign != "center") {
            ctx.font = "28px Courier";
            ctx.textAlign = "center";
        }
        if (ctx.fillStyle != "white") {
            ctx.fillStyle = "white";
        }
        ctx.fillText(scoresList["identifier"] + " HIGH SCORES", centerX, topY - 20);
        ctx.fillRect(ctx.canvas.width * 0.1, topY, ctx.canvas.width * 0.8, 3);
        ctx.font = "18px Courier";
        if (isLastList) {
            ctx.fillText("(Tap to retry)", centerX, topY + 50 + (scores.length * 25));
        }
        ctx.textAlign = "left";
        var leftMargin = ctx.canvas.width * 0.1;
        scores.sort(function (a, b) {
            var result = 0;
            if (a["score"] < b["score"]) {
                result = 1;
            }
            else if (a["score"] > b["score"]) {
                result = -1;
            }
            i;
            return result;
        });
        for (var i = 0; i < scores.length; i++) {
            var text = StringTools.instance().censorText(scores[i]["name"]);
            ctx.fillText(text, leftMargin, topY + 25 + (25 * i));
        }
        ctx.textAlign = "right";
        var rightMargin = ctx.canvas.width * 0.9;
        for (var i = 0; i < scores.length; i++) {
            ctx.fillText(scores[i]["score"], rightMargin, topY + 25 + (25 * i));
        }
    };
    return GraphicArtist;
}());
export { GraphicArtist };
//# sourceMappingURL=graphic.artist.js.map