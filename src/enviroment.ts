export class Enviroment {
	private values: Map<string, any> = new Map();

	define(name: string, value: any) {
		this.values.set(name, value);
	}

	get(name: string) {
		return this.values.get(name);
	}
}
