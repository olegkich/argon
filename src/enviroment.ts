import { Token } from "./lexer";

export class Enviroment {
	private enclosing: Enviroment;
	private values: Map<string, any> = new Map();

	constructor(enclosing: Enviroment = null) {
		this.enclosing = enclosing;
	}

	define(name: Token, value: any) {
		this.values.set(name.lexeme, value);
	}

	assign(name: Token, value: any) {
		if (this.values.has(name.lexeme)) {
			this.values.set(name.lexeme, value);
			return;
		}

		if (this.enclosing !== null) {
			this.enclosing.values.set(name.lexeme, value);
			return;
		}

		throw new Error("assignment to undefined variable.");
	}

	get(name: Token) {
		if (this.values.has(name.lexeme)) return this.values.get(name.lexeme);
		if (this.enclosing !== null) return this.enclosing.get(name);

		throw new Error(name + " undefined variable " + name.lexeme);
	}
}
