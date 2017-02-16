import { BallVsWildPage } from "../pages/ball-vs-wild/ball-vs-wild";
import { StringTools } from "./stringtools";

export class GraphicArtist {
  static wrapText(context: CanvasRenderingContext2D, text: string, x: number, y: number,
      maxWidth: number, lineHeight: number) {
    let words = text.split(' ');
    let line = '';

    let font = lineHeight + "px Courier";
    if (context.font != font) {
      context.font = font;
    }

    for(var n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      let metrics = context.measureText(testLine);
      let testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      }
      else {
        line = testLine;
      }
    }
    context.fillText(line, x, y);
  }
}