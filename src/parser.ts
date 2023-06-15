import {
  Assignment,
  Binary,
  Expr,
  Grouping,
  Literal,
  Logical,
  Unary,
  Variable,
} from "./expression";
import { Token, TokenType } from "./lexer";
import { errorLogger } from "./main";
import { Block, Expression, If, Print, Stmt, Var, While } from "./statement";

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
// assignment -> IDENTIFIER "=" assignment | logic_or ;
// logic_or -> logic_and ("or" logic_and)* ;
// logic_and -> equality ("and" equality)*
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
    try {
      const stmts = [];
      while (!this.isEof()) {
        stmts.push(this.declaration());
      }
      return stmts;
    } catch (e) {
      return null;
    }
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
    const name = this.consume(TokenType.IDENTIFIER, "expect variable name.");

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
    if (this.match([TokenType.IF])) return this.ifStatement();
    if (this.match([TokenType.WHILE])) return this.whileStatement();
    if (this.match([TokenType.FOR])) return this.forStatement();
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

  ifStatement() {
    this.consume(TokenType.LEFT_PAREN, "excpect ( after if.");
    const condition = this.expression();
    this.consume(TokenType.RIGHT_PAREN, "expect ) after condition.");

    const thenBranch = this.statement();
    let elseBranch = null;

    if (this.match([TokenType.ELSE])) {
      elseBranch = this.statement();
    }

    return new If(condition, thenBranch, elseBranch);
  }

  whileStatement() {
    this.consume(TokenType.LEFT_PAREN, "excpect ( after while.");
    const condition = this.expression();
    this.consume(TokenType.RIGHT_PAREN, `expect ")" after condition.`);
    const body = this.statement();

    return new While(condition, body);
  }

  forStatement() {
    this.consume(TokenType.LEFT_PAREN, 'expect "(" after for.');

    let initializer: Stmt;
    let condition: Expr,
      increment: Expr = null;

    if (this.match([TokenType.SEMICOLON])) {
      initializer = null;
    } else if (this.match([TokenType.VAR])) {
      initializer = this.varDeclaration();
    } else {
      initializer = this.expressionStatement();
    }

    if (!this.check(TokenType.SEMICOLON)) {
      condition = this.expression();
    }

    this.consume(TokenType.SEMICOLON, 'expect ";" after condition.');
    if (!this.check(TokenType.RIGHT_PAREN)) {
      increment = this.expression();
    }

    this.consume(TokenType.RIGHT_PAREN, 'expect ")" after increment');

    // parse block
    let body = this.statement();

    // now mount increment, condition and init'r on top (in a tree-like fashion)

    // if there's an increment, it will be executed after the body.
    if (increment !== null) {
      body = new Block([body, new Expression(increment)]);
    }

    // (... ; ; ...) === while(true)
    if (condition === null) condition = new Literal(true);
    body = new While(condition, body);

    if (initializer !== null) {
      body = new Block([initializer, body]);
    }

    // the body trickery above just defines the for loop code flow, which is:
    // exec(block) -> exec(initializer) ->
    // -> exec(while(condition)) -> exec(block(for-code, incremen))

    return body;
  }

  expressionStatement(): Stmt {
    const expr: Expr = this.expression();
    this.consume(TokenType.SEMICOLON, 'excpect ";" after expression.');
    return new Expression(expr);
  }

  // expression → equality ;
  expression(): Expr {
    return this.assignment();
  }

  assignment(): Expr {
    // identifier | other
    const expr: Expr = this.or();

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

  or(): Expr {
    let expr: Expr = this.and();

    if (this.match([TokenType.OR])) {
      const operator = this.previous();
      const right = this.and();
      expr = new Logical(expr, operator, right);
    }

    return expr;
  }

  and(): Expr {
    let expr: Expr = this.equality();

    if (this.match([TokenType.AND])) {
      const operator = this.previous();
      const right = this.equality();
      expr = new Logical(expr, operator, right);
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

    // throw this.error(this.peek(), "Expect expressions.");
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

  // catch the statement boundary to avoid cascading errors, hence the name sync.
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
