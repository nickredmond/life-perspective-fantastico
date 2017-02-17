export class Color {
	static readonly BLACK: Color = new Color(0, 0, 0);
	static readonly WHITE: Color = new Color(255, 255, 255);

	r: number;
	g: number;
	b: number;
	hexValue: string = null;

	constructor(r: number = 0, g: number = 0, b: number = 0){
		this.r = r;
		this.g = g;
		this.b = b;
	}

	public static fromHexValue(hexValue: string) : Color{
		let rgbValue = Color.hexToRGB(hexValue);
		let color = new Color(rgbValue.r, rgbValue.g, rgbValue.b);
		color.hexValue = hexValue;
		return color;
	}

	public static hexToRGB(hexValue) {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexValue);
    	return result ? {
	        r: parseInt(result[1], 16),
	        g: parseInt(result[2], 16),
	        b: parseInt(result[3], 16)
	    } : null;
	}

	public toStringRGB(): string {
		return this.toStringRGBA(255);
	}

	public toStringRGBA(opacity: number): string {
		return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + opacity + ")";
	}
}