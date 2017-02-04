export class ExtendedMath {
	static average(values: number[]): number {
		let sum = 0;
		for (var i = 0; i < values.length; i++){
			sum += values[i];
		}
		return sum / values.length;
	}

	static toRadians(degrees: number) {
		return degrees * (Math.PI / 180);
	}
}