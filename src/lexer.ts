import { errorLogger } from "./main";

export const TokenType = {
	LEFT_PAREN: "LEFT_PAREN",
	RIGHT_PAREN: "RIGHT_PAREN",
	LEFT_BRACE: "LEFT_BRACE",
	RIGHT_BRACE: "RIGHT_BRACE",
	COMMA: "COMMA",
	DOT: "DOT",
	MINUS: "MINUS",
	PLUS: "PLUS",
	SEMICOLON: "SEMICOLON",
	STAR: "STAR",
	EOF: "EOF",
	SLASH: "SLASH",
	BANG: "BANG",
	BANG_EQUAL: "BANG_EQUAL",
	GREATER: "GREATER",
	GREATER_EQUAL: "GREATER_EQUAL",
	LESS: "LESS",
	LESS_EQUAL: "LESS_EQUAL",
	EQUAL: "EQUAL",
	EQUAL_EQUAL: "EQUAL_EQUAL",
	IDENTIFIER: "IDENTIFIER",
	STRING: "STRING",
	NUMBER: "NUMBER",
	AND: "AND",
	CLASS: "CLASS",
	ELSE: "ELSE",
	FALSE: "FALSE",
	TRUE: "TRUE",
	FUN: "FUN",
	FOR: "FOR",
	IF: "IF",
	NIL: "NIL",
	OR: "OR",
	PRINT: "PRINT",
	RETURN: "RETURN",
	SUPER: "SUPER",
	THIS: "THIS",
	VAR: "VAR",
	WHILE: "WHILE",
};

let keywords = new Map();
keywords.set("and", TokenType.AND);
keywords.set("class", TokenType.CLASS);
keywords.set("else", TokenType.ELSE);
keywords.set("false", TokenType.FALSE);
keywords.set("for", TokenType.FOR);
keywords.set("fun", TokenType.FUN);
keywords.set("if", TokenType.IF);
keywords.set("nil", TokenType.NIL);
keywords.set("or", TokenType.OR);
keywords.set("print", TokenType.PRINT);
keywords.set("return", TokenType.RETURN);
keywords.set("super", TokenType.SUPER);
keywords.set("this", TokenType.THIS);
keywords.set("true", TokenType.TRUE);
keywords.set("var", TokenType.VAR);
keywords.set("while", TokenType.WHILE);

export class Token {
	type: string;
	lexeme: string;
	literal: any;
	line: number;

	constructor(type: string, lexeme: string, literal: object, line: number) {
		this.type = type;
		this.lexeme = lexeme;
		this.literal = literal;
		this.line = line;
	}

	toString() {
		return (
			this.type + this.lexeme + this.literal.toString + this.line.toString
		);
	}
}

class Lexer {
	private source: String;
	private tokens: Array<Token> = [];
	private start: number = 0;
	private current: number = 0;
	private line: number = 1;

	constructor(source: string) {
		this.source = source;
	}

	scanTokens(): Array<Token> {
		while (!this.isEof()) {
			this.start = this.current;
			this.nextToken();
		}
		this.tokens.push(new Token(TokenType.EOF, "", {}, this.line));
		return this.tokens;
	}

	nextToken() {
		let char = this.advance();

		// prettier-ignore
		switch (char) {
      case '(': this.addToken(TokenType.LEFT_PAREN, "("); break;
      case ')': this.addToken(TokenType.RIGHT_PAREN); break;
      case '{': this.addToken(TokenType.LEFT_BRACE); break;
      case '}': this.addToken(TokenType.RIGHT_BRACE); break;
      case ',': this.addToken(TokenType.COMMA); break;
      case '.': this.addToken(TokenType.DOT); break;
      case '-': this.addToken(TokenType.MINUS); break;
      case '+': this.addToken(TokenType.PLUS); break;
      case ';': this.addToken(TokenType.SEMICOLON); break;
      case '*': this.addToken(TokenType.STAR); break;
			case '!': this.addToken(this.match("=") ? TokenType.BANG_EQUAL : TokenType.BANG); break;
			case '=': this.addToken(this.match("=") ? TokenType.EQUAL_EQUAL : TokenType.EQUAL); break;
			case '>': this.addToken(this.match("=") ? TokenType.GREATER_EQUAL : TokenType.GREATER); break;
			case '<': this.addToken(this.match("=") ? TokenType.LESS_EQUAL : TokenType.LESS); break;

			case '/': {
				if (this.match("/")) {
					while (this.peek() != '\n' && !this.isEof()) this.advance();
				} else {
					this.addToken(TokenType.SLASH)
				}
			}; break;

			case '"': this.handleString(); break;

			case '\n': this.line++; break;
			case '\t':
			case '\n':
			case ' ':
				break;

			default: {
				if (this.isDigit(char)) {
				this.handleNumber(char)
				} else if (this.isAlpha(char)) {
					this.handleIdentifier(char)
					
				} else {
					throw new TypeError("unrecognized token")

				}	
			}
    }
	}

	isDigit(char: string) {
		const isDigit = /[0-9]/;
		return isDigit.test(char);
	}

	isAlpha(char: string) {
		const isAlpha = new RegExp(/[A-Za-z_]/);
		return isAlpha.test(char);
	}

	isAlphaNumeric(char: string) {
		return this.isAlpha(char) || this.isDigit(char);
	}

	handleString() {
		while (this.peek() !== '"' && !this.isEof()) {
			if (this.peek() === "\n") {
				this.line++;
			}

			this.advance();
		}

		if (this.isEof()) {
			errorLogger(this.line, "found unterminated string.");
			return;
		}

		this.advance();
		let value = this.source.substring(this.start + 1, this.current - 1);
		this.addToken(TokenType.STRING, value);
	}

	handleNumber(char: string) {
		while (this.isDigit(this.peek())) this.advance();

		if (this.peek() === "." && this.isDigit(this.peekNext())) {
			this.advance();

			while (this.isDigit(this.peek())) this.advance();
		}

		let string_value = this.source.substring(this.start, this.current);
		let value = parseFloat(string_value);

		this.addToken(TokenType.NUMBER, string_value, value);
	}

	handleIdentifier(char: string) {
		while (this.isAlphaNumeric(this.peek())) {
			this.advance();
		}
		let key = this.source.substring(this.start, this.current);
		let type = keywords.get(key);
		if (type === undefined || type === null) {
			type = "IDENTIFIER";
		}
		this.addToken(type);
	}

	addToken(type: string, text: string = "", literal: any = null) {
		if (text === "" || !text) {
			text = this.source.substring(this.start, this.current);
		}
		this.tokens.push(new Token(type, text, literal, this.line));
	}

	advance() {
		this.current++;
		return this.source[this.current - 1];
	}

	peek() {
		if (this.isEof()) return "\0";
		return this.source.charAt(this.current);
	}

	peekNext() {
		if (this.current + 1 >= this.source.length) return "\0";
		return this.source.charAt(this.current + 1);
	}

	match(expected: string) {
		if (this.isEof()) return false;
		if (this.source[this.current] != expected) return false;

		this.current++;
		return true;
	}

	isEof(): boolean {
		return this.current >= this.source.length;
	}
}
export { Lexer };
