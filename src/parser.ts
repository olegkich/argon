import {
	Assignment,
	Binary,
	Expr,
	Grouping,
	Literal,
	Unary,
	Variable,
} from "./expression";
import { Token, TokenType } from "./lexer";
import { errorLogger } from "./main";
import { Block, Expression, Print, Stmt, Var } from "./statement";

// grammar

// stmt -> exprStmt
//			|  forStmt
//		  |  ifStmt
//			|  printStmt
//		  |  returnStmt
//			|  whileStmt
//		  |  block ;

// exprStmt -> expression ";" ;

// printStmt → "print" expression ";" ;

// expression → assignment ;
// assignment -> IDENTIFIER "=" assignment | equality ;
// equality   → comparison ( ( "!=" | "==" ) comparison )* ;
// comparison → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
// term       → factor ( ( "-" | "+" ) factor )* ;
// factor     → unary ( ( "/" | "*" ) unary )* ;
// unary      → ( "!" | "-" ) unary | primary ;
// primary    → NUMBER | STRING | "true" | "false" | "nil"  | IDENTIFIER | "(" expression ")" ;

class ParseError extends Error {}
export class Parser {
	private tokens: Array<Token>;
	private current: number;

	error(token: Token, message: string): ParseError {
		errorLogger(token.line, message);
		return new ParseError();
	}

	constructor(tokens: Array<Token>) {
		this.tokens = tokens;
		this.current = 0;
	}

	parse() {
		const stmts = [];
		while (!this.isEof()) {
			stmts.push(this.declaration());
		}
		return stmts;
	}

	declaration(): Stmt {
		try {
			if (this.match([TokenType.VAR])) return this.varDeclaration();
			return this.statement();
		} catch (e) {
			this.synchronize();
			return null;
		}
	}

	varDeclaration(): Stmt {
		const name = this.consume(
			TokenType.IDENTIFIER,
			"expect variable name."
		);

		let initializer: Expr = null;
		if (this.match([TokenType.EQUAL])) {
			initializer = this.expression();
		}

		this.consume(TokenType.SEMICOLON, "Expect variable declaration.");
		return new Var(name, initializer);
	}

	statement(): Stmt {
		if (this.match([TokenType.PRINT])) return this.printStatement();
		if (this.match([TokenType.LEFT_BRACE])) return new Block(this.block());
		return this.expressionStatement();
	}

	printStatement(): Stmt {
		const expr = this.expression();
		this.consume(TokenType.SEMICOLON, "excpect ; after expression.");
		return new Print(expr);
	}

	block() {
		let stmts: Array<Stmt> = [];

		while (!this.check(TokenType.RIGHT_BRACE) && !this.isEof()) {
			stmts.push(this.declaration());
		}

		this.consume(TokenType.RIGHT_BRACE, "Expect } after block");
		return stmts;
	}

	expressionStatement(): Stmt {
		const expr: Expr = this.expression();
		this.consume(TokenType.SEMICOLON, "excpect ; after expression.");
		return new Expression(expr);
	}

	// expression → equality ;
	expression(): Expr {
		return this.assignment();
	}

	assignment(): Expr {
		// identifier | other
		const expr: Expr = this.equality();

		if (this.match([TokenType.EQUAL])) {
			const equal = this.previous();
			const value = this.assignment();

			if (expr instanceof Variable) {
				const name: Token = (expr as Variable).name;
				return new Assignment(name, value);
			}

			this.error(equal, "invalid assignment target.");
		}

		return expr;
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

		if (this.match([TokenType.IDENTIFIER])) {
			return new Variable(this.previous());
		}

		if (this.match([TokenType.LEFT_PAREN])) {
			const expr = this.expression();
			this.consume(TokenType.RIGHT_PAREN, 'Expect ")" after expression');
			return new Grouping(expr);
		}
	}

	private consume(type: String, message: string) {
		if (this.check(type)) return this.advance();
		throw this.error(this.peek(), message);
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

	advance(): Token {
		if (!this.isEof()) this.current++;
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

	private synchronize() {
		this.advance();
		while (!this.isEof()) {
			if (this.previous().type == TokenType.SEMICOLON) return;
			switch (this.peek().type) {
				case TokenType.CLASS:
				case TokenType.FUN:
				case TokenType.VAR:
				case TokenType.FOR:
				case TokenType.IF:
				case TokenType.WHILE:
				case TokenType.PRINT:
				case TokenType.RETURN:
					return;
			}
			this.advance();
		}
	}
}
