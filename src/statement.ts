import { Expr } from "./expression";
import { Token } from "./lexer";

// @ts-nocheck

export interface Visitor<T> {
	visitExpressionStmt(stmt: Expression);
	visitPrintStmt(stmt: Print);
	visitVarStmt(stmt: Var);
	visitWhileStmt(stmt: While);
	visitFunctionStmt(stmt: mFunction);
	visitIfStmt(stmt: If);
	visitBlockStmt(stmt: Block);
	visitClassStmt(stmt: Class);
	visitReturnStmt(stmt: Return);
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

export class While extends Stmt {
	condition: Expr;
	body: Stmt;

	constructor(condition: Expr, body: Stmt) {
		super();
		this.condition = condition;
		this.body = body;
	}

	accept<T>(visitor: Visitor<T>) {
		return visitor.visitWhileStmt(this);
	}
}

export class mFunction extends Stmt {
	name: Token;
	parameters: Array<Token>;
	body: Array<Stmt>;
	constructor(name: Token, parameters: Array<Token>, body: Array<Stmt>) {
		super();
		this.name = name;
		this.parameters = parameters;
		this.body = body;
	}

	accept<T>(visitor: Visitor<T>) {
		return visitor.visitFunctionStmt(this);
	}
}

export class If extends Stmt {
	condition: Expr;
	thenBranch: Stmt;
	elseBranch: Stmt;
	constructor(condition: Expr, thenBranch: Stmt, elseBranch: Stmt) {
		super();
		this.condition = condition;
		this.thenBranch = thenBranch;
		this.elseBranch = elseBranch;
	}

	accept<T>(visitor: Visitor<T>) {
		return visitor.visitIfStmt(this);
	}
}

export class Return extends Stmt {
	constructor(keyword: Token, value: Expr) {
		super();
		this.keyword = keyword;
		this.value = value;
	}

	accept<T>(visitor: Visitor<T>) {
		return visitor.visitReturnStmt(this);
	}

	keyword: Token;
	value: Expr;
}

export class Block extends Stmt {
	constructor(statements: Array<Stmt>) {
		super();
		this.statements = statements;
	}

	accept<T>(visitor: Visitor<T>) {
		return visitor.visitBlockStmt(this);
	}

	statements: Array<Stmt>;
}
export class Class extends Stmt {
	constructor(name: Token, superclass: Expr, methods: Array<Function>) {
		super();
		this.name = name;
		this.superclass = superclass;
		this.methods = methods;
	}

	accept<T>(visitor: Visitor<T>) {
		return visitor.visitClassStmt(this);
	}

	name: Token;
	superclass: Expr;
	methods: Array<Function>;
}
