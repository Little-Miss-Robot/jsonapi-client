export default abstract class Model {
	constructor(response: any) {
		const mapped = this.map(response);
		for (let key in mapped) {
			if (mapped.hasOwnProperty(key)) {
				this[key] = mapped[key];
			}
		}
	}

	protected abstract map(response: any);
}