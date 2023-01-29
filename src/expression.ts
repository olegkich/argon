import { Token } from "./lexer";

// later...
// @ts-nocheck

export interface Visitor<T> {
	visitAssignExpr(expr: Assignment);
	visitBinaryExpr(expr: Binary);
	visitCallExpr(expr: Call);
	visitGetExpr(expr: Get);
	visitGroupingExpr(expr: Grouping);
	visitLiteralExpr(expr: Literal);
	visitLogicalExpr(expr: Logical);
	visitSetExpr(expr: Set);
	visitSuperExpr(expr: Super);
	visitThisExpr(expr: This);
	visitUnaryExpr(expr: Unary);
	visitVariableExpr(expr: Variable);
}

abstract class Expr {
	static Unary: any;
	static Binary: any;
	static Literal: any;
	static Grouping: any;
	abstract accept<T>(visitor: Visitor<T>);
}

class Assignment extends Expr {
	name: Token;
	value: Expr;

	constructor(name: Token, value: Expr) {
		super();
		this.name = name;
		this.value = value;
	}

	accept<T>(visitor: Visitor<T>) {
		return visitor.visitAssignExpr(this);
	}
}

class Binary extends Expr {
	left: Expr;
	operator: Token;
	right: Expr;

	constructor(left: Expr, operator: Token, right: Expr) {
		super();
		this.left = left;
		this.operator = operator;
		this.right = right;
	}

	accept<T>(visitor: Visitor<T>) {
		return visitor.visitBinaryExpr(this);
	}
}
class Call extends Expr {
	callee: Expr;
	paren: Token;
	// _ does not stand for read only, name arguments is not allowed in ts
	_arguments: Array<Expr>;

	constructor(callee: Expr, paren: Token, _arguments: Array<Expr>) {
		super();
		this.callee = callee;
		this.paren = paren;
		this._arguments = _arguments;
	}

	accept<T>(visitor: Visitor<T>) {
		return visitor.visitCallExpr(this);
	}
}
class Get extends Expr {
	object: Expr;
	name: Token;

	constructor(object: Expr, name: Token) {
		super();
		this.object = object;
		this.name = name;
	}

	accept<T>(visitor: Visitor<T>) {
		return visitor.visitGetExpr(this);
	}
}
class Grouping extends Expr {
	expression: Expr;

	constructor(expression: Expr) {
		super();
		this.expression = expression;
	}

	accept<T>(visitor: Visitor<T>) {
		return visitor.visitGroupingExpr(this);
	}
}

class Literal extends Expr {
	value: any;

	constructor(value: any) {
		super();
		this.value = value;
	}

	accept<T>(visitor: Visitor<T>) {
		return visitor.visitLiteralExpr(this);
	}
}
class Logical extends Expr {
	left: Expr;
	operator: Token;
	right: Expr;

	constructor(left: Expr, operator: Token, right: Expr) {
		super();
		this.left = left;
		this.operator = operator;
		this.right = right;
	}

	accept<T>(visitor: Visitor<T>) {
		return visitor.visitLogicalExpr(this);
	}
}
class Set extends Expr {
	object: Expr;
	name: Token;
	value: Expr;
	constructor(object: Expr, name: Token, value: Expr) {
		super();
		this.object = object;
		this.name = name;
		this.value = value;
	}

	accept<T>(visitor: Visitor<T>) {
		return visitor.visitSetExpr(this);
	}
}
class Super extends Expr {
	keyword: Token;
	method: Token;

	constructor(keyword: Token, method: Token) {
		super();
		this.keyword = keyword;
		this.method = method;
	}

	accept<T>(visitor: Visitor<T>) {
		return visitor.visitSuperExpr(this);
	}
}
class This extends Expr {
	keyword: Token;

	constructor(keyword: Token) {
		super();
		this.keyword = keyword;
	}

	accept<T>(visitor: Visitor<T>) {
		return visitor.visitThisExpr(this);
	}
}
class Unary extends Expr {
	operator: Token;
	right: Expr;

	constructor(operator: Token, right: Expr) {
		super();
		this.operator = operator;
		this.right = right;
	}

	accept<T>(visitor: Visitor<T>) {
		return visitor.visitUnaryExpr(this);
	}
}
class Variable extends Expr {
	name: Token;

	constructor(name: Token) {
		super();
		this.name = name;
	}

	accept<T>(visitor: Visitor<T>) {
		return visitor.visitVariableExpr(this);
	}
}
export {
	Expr,
	Unary,
	Literal,
	Set,
	Super,
	Get,
	Grouping,
	This,
	Variable,
	Logical,
	Call,
	Binary,
	Assignment,
};
