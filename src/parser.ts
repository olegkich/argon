import { checkPrime } from "crypto";
import { Binary, Expr, Grouping, Literal, Unary } from "./expression";
import { Token, TokenType } from "./lexer";

// basic grammar

// expre[]'\ssion → equality ;
// equality   → comparison ( ( "!=" | "==" ) comparison )* ;
// comparison → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
// term       → factor ( ( "-" | "+" ) factor )* ;
// factor     → unary ( ( "/" | "*" ) unary )* ;
// unary      → ( "!" | "-" ) unary | primary ;
// primary    → NUMBER | STRING | "true" | "false" | "nil"  | "(" expression ")" ;

export class Parser {
	private tokens: Array<Token>;
	private current: number;

	constructor(tokens: Array<Token>) {
		this.tokens = tokens;
		this.current = 0;
	}

	parse() {
		try {
			const expr = this.expression();
			return expr;
		} catch (e) {
			console.log(e);
			return null;
		}
	}

	// expression → equality ;
	expression(): Expr {
		return this.equality();
	}

	// equality   → comparison ( ( "!=" | "==" ) comparison )* ;
	equality(): Expr {
		let expr: Expr = this.comparison();

		while (this.match([TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL])) {
			const operator: Token = this.previous();
			const right: Expr = this.comparison();
			expr = new Binary(expr, operator, right);
		}

		return expr;
	}

	// comparison → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
	comparison(): Expr {
		let expr: Expr = this.term();

		while (
			this.match([
				TokenType.GREATER,
				TokenType.GREATER_EQUAL,
				TokenType.LESS,
				TokenType.LESS_EQUAL,
			])
		) {
			const operator: Token = this.previous();
			const right: Expr = this.term();
			expr = new Binary(expr, operator, right);
		}

		return expr;
	}

	// term       → factor ( ( "-" | "+" ) factor )* ;
	term(): Expr {
		let expr: Expr = this.factor();

		while (this.match([TokenType.PLUS, TokenType.MINUS])) {
			const operator: Token = this.previous();
			const right: Expr = this.factor();
			expr = new Binary(expr, operator, right);
		}

		return expr;
	}

	// factor     → unary ( ( "/" | "*" ) unary )* ;
	factor(): Expr {
		let expr: Expr = this.unary();

		while (this.match([TokenType.STAR, TokenType.SLASH])) {
			const operator: Token = this.previous();
			const right: Expr = this.unary();
			expr = new Binary(expr, operator, right);
		}

		return expr;
	}

	// unary      → ( "!" | "-" ) unary | primary ;
	unary(): Expr {
		if (this.match([TokenType.BANG, TokenType.MINUS])) {
			const operator: Token = this.previous();
			const right: Expr = this.unary();
			return new Unary(operator, right);
		}

		return this.primary();
	}

	// primary    → NUMBER | STRING | "true" | "false" | "nil"  | "(" expression ")" ;
	primary(): Expr {
		if (this.match([TokenType.FALSE])) return new Literal(false);
		if (this.match([TokenType.TRUE])) return new Literal(true);
		if (this.match([TokenType.NIL])) return new Literal(null);
		if (this.match([TokenType.NUMBER, TokenType.STRING]))
			return new Literal(this.previous().literal);

		if (this.match([TokenType.LEFT_PAREN])) {
			const expr = this.expression();
			this.consume(TokenType.RIGHT_PAREN, 'Expect ")" after expression');
			return new Grouping(expr);
		}
	}

	private consume(type: String, message: String) {
		if (this.check(type)) return this.advance();
		return new Error(`type: ${type}, message: ${message}`);
	}

	match(types: Array<string>) {
		for (const type of types) {
			if (this.check(type)) {
				this.advance();
				return true;
			}
		}
		return false;
	}

	check(type: String) {
		if (this.isEof()) return false;
		return this.peek().type === type;
	}

	advance() {
		if (!this.isEof()) return this.current++;
		return this.previous();
	}

	peek(): Token {
		return this.tokens[this.current];
	}

	previous() {
		return this.tokens[this.current - 1];
	}

	isEof(): boolean {
		if (this.peek().type === TokenType.EOF) return true;
		return false;
	}
}
