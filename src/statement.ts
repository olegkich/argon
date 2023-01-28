import { Expr } from "./expression";
import { Token } from "./lexer";

// @ts-nocheck

export interface Visitor<T> {
	visitExpressionStmt(stmt: Expression);
	visitPrintStmt(stmt: Print);
	visitVarStmt(stmt: Var);
}

export abstract class Stmt {
	abstract accept<T>(visitor: Visitor<T>);
}

export class Print extends Stmt {
	expression: Expr;

	constructor(expression: Expr) {
		super();
		this.expression = expression;
	}

	accept<T>(visitor: Visitor<T>) {
		return visitor.visitPrintStmt(this);
	}
}

export class Expression extends Stmt {
	expression: Expr;

	constructor(expression: Expr) {
		super();
		this.expression = expression;
	}

	accept<T>(visitor: Visitor<T>) {
		return visitor.visitExpressionStmt(this);
	}
}

export class Var extends Stmt {
	name: Token;
	initalizer: Expr;

	constructor(name: Token, initializer: Expr) {
		super();
		this.name = name;
		this.initalizer = initializer;
	}

	accept<T>(visitor: Visitor<T>) {
		return visitor.visitVarStmt(this);
	}
}
