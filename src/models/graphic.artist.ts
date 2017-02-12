import { BallVsWildPage } from "../pages/ball-vs-wild/ball-vs-wild";
import { StringTools } from "./stringtools";

export class GraphicArtist {
	static drawHighScores(page: BallVsWildPage, ctx: CanvasRenderingContext2D,
			scoresList: Object, centerX: number, topY: number, isLastList = false) {
		page.userName = "";
        document.getElementById("usernameField").style.display = "none";
        let scores = scoresList["scores"];

        if (ctx.font != "28px Courier" || ctx.textAlign != "center") {
          ctx.font = "28px Courier";
          ctx.textAlign = "center";
        }
        ctx.fillText(scoresList["identifier"] + " HIGH SCORES", centerX, topY - 20);
        ctx.fillRect(ctx.canvas.width * 0.1, topY, ctx.canvas.width * 0.8, 3);

        ctx.font = "18px Courier";
        if (isLastList) {
        	ctx.fillText("(Tap to retry)", centerX, topY + 50 + (scores.length * 25));
        }

        ctx.textAlign = "left";
        let leftMargin = ctx.canvas.width * 0.1;

        scores.sort(function(a, b){
          let result = 0;
          if (a["score"] < b["score"]){
            result = 1;
          } else if (a["score"] > b["score"]) {
            result = -1;
          }i
          return result;
        });
        for (var i = 0; i < scores.length; i++) {
          let text = StringTools.instance().censorText(scores[i]["name"]);
          ctx.fillText(text, leftMargin, topY + 25 + (25 * i));
        }

        ctx.textAlign = "right";
        let rightMargin = ctx.canvas.width * 0.9;

        for (var i = 0; i < scores.length; i++) {
          ctx.fillText(scores[i]["score"], rightMargin, topY + 25 + (25 * i));
        }
	}
}