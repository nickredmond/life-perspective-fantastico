export class ExtendedMath {
	static average(values: number[]): number {
		let sum = 0;
		for (var i = 0; i < values.length; i++){
			sum += values[i];
		}
		return sum / values.length;
	}
	static distance(x1, y1, x2, y2) {
        let squaredX = Math.pow(x2 - x1, 2);
        let squaredY = Math.pow(y2 - y1, 2);
        return Math.sqrt(squaredX + squaredY);
    };

	static toRadians(degrees: number) {
		return degrees * (Math.PI / 180);
	}
}