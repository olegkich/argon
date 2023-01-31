import {
	Assignment,
	Binary,
	Call,
	Expr,
	Get,
	Grouping,
	Literal,
	Logical,
	Set,
	Super,
	This,
	Unary,
	Variable,
	Visitor as ExprVisitor,
} from "./expression";

import {
	Block,
	Class,
	Expression,
	If,
	mFunction,
	Print,
	Return,
	Stmt,
	Var,
	Visitor as StmtVisitor,
	While,
} from "./statement";
import { Token, TokenType } from "./lexer";
import { Enviroment } from "./enviroment";

export class Interpreter implements ExprVisitor<any>, StmtVisitor<any> {
	private enviroment: Enviroment = new Enviroment();

	constructor(stmts: Array<Stmt>) {
		try {
			for (let stmt of stmts) {
				this.execute(stmt);
			}
		} catch (e) {
			console.log(e);
		}
	}
	visitWhileStmt(stmt: While) {
		while (this.isTruthy(this.evaluate(stmt.condition))) {
			this.execute(stmt.body);
		}
		return null;
	}
	visitFunctionStmt(stmt: mFunction) {
		throw new Error("Method not implemented.");
	}
	visitIfStmt(stmt: If) {
		if (this.isTruthy(this.evaluate(stmt.condition))) {
			this.execute(stmt.thenBranch);
		} else if (stmt.elseBranch !== null) {
			this.execute(stmt.elseBranch);
		}
		return null;
	}
	visitBlockStmt(stmt: Block) {
		this.executeBlock(stmt.statements, new Enviroment(this.enviroment));
		return null;
	}
	executeBlock(stmts: Array<Stmt>, env: Enviroment) {
		const previousEnv = this.enviroment;
		this.enviroment = env;

		for (const stmt of stmts) {
			this.execute(stmt);
		}

		this.enviroment = previousEnv;
	}

	visitClassStmt(stmt: Class) {
		throw new Error("Method not implemented.");
	}
	visitReturnStmt(stmt: Return) {
		throw new Error("Method not implemented.");
	}
	visitVarStmt(stmt: Var) {
		let value: any = null;

		if (stmt.initalizer !== null) {
			value = this.evaluate(stmt.initalizer);
		}

		this.enviroment.define(stmt.name, value);
		return null;
	}

	execute(stmt: Stmt) {
		stmt.accept(this);
	}

	visitExpressionStmt(stmt: Expression) {
		const expr = this.evaluate(stmt.expression);
		return null;
	}

	visitPrintStmt(stmt: Print) {
		const value = this.evaluate(stmt.expression);
		console.log(value);
		return null;
	}

	visitLiteralExpr(expr: Literal) {
		return expr.value;
	}

	visitGroupingExpr(expr: Grouping) {
		return this.evaluate(expr.expression);
	}

	evaluate(expr: Expr) {
		return expr.accept(this);
	}

	visitUnaryExpr(expr: Unary) {
		const right = this.evaluate(expr.right);

		switch (expr.operator.type) {
			case TokenType.MINUS:
				this.isUnaryOperandNumber(expr.operator, right);
				return -Number(right);

			case TokenType.BANG:
				return !this.isTruthy(right);
		}

		return null;
	}

	isTruthy(object: any) {
		if (object === null || object === undefined) return false;
		if (typeof object === "boolean") return Boolean(object);
		return true;
	}

	visitBinaryExpr(expr: Binary) {
		const left = this.evaluate(expr.left);
		const right = this.evaluate(expr.right);

		switch (expr.operator.type) {
			case TokenType.MINUS:
				if (this.isBinaryOperandNumber(expr.operator, left, right))
					return Number(left) - Number(right);
			case TokenType.STAR:
				if (this.isBinaryOperandNumber(expr.operator, left, right))
					return Number(left) * Number(right);
			case TokenType.SLASH:
				if (this.isBinaryOperandNumber(expr.operator, left, right))
					return Number(left) / Number(right);
			case TokenType.PLUS:
				if (typeof left === "number" && typeof right === "number") {
					return Number(left) + Number(right);
				}

				if (typeof left === "string" && typeof right === "string") {
					return String(left) + String(right);
				}
			case TokenType.GREATER:
				if (this.isBinaryOperandNumber(expr.operator, left, right))
					return Number(left) > Number(right);
			case TokenType.GREATER_EQUAL:
				if (this.isBinaryOperandNumber(expr.operator, left, right))
					return Number(left) >= Number(right);
			case TokenType.LESS:
				if (this.isBinaryOperandNumber(expr.operator, left, right))
					return Number(left) < Number(right);
			case TokenType.LESS_EQUAL:
				if (this.isBinaryOperandNumber(expr.operator, left, right))
					return Number(left) <= Number(right);
			case TokenType.BANG_EQUAL:
				return !this.isEqual(left, right);
			case TokenType.EQUAL_EQUAL:
				return this.isEqual(left, right);
			default:
				throw new TypeError("INTERPETER SAYS FUCK YOU");
		}
	}

	isEqual(a: any, b: any) {
		if (a === null && b === null) return true;
		if (a === null) return false;

		return a === b;
	}

	isUnaryOperandNumber(operator: Token, operand: any) {
		if (typeof operand === "number") {
			return true;
		}
		// handle exception
		throw new TypeError(operator.toString());
	}

	isBinaryOperandNumber(operator: Token, left: any, right: any) {
		if (typeof left === "number" && typeof right === "number") {
			return true;
		}
		// handle exception
		throw new TypeError(operator.toString());
	}

	visitAssignExpr(expr: Assignment) {
		const value = this.evaluate(expr.value);

		this.enviroment.assign(expr.name, value);
		return value;
	}
	visitCallExpr(expr: Call) {
		throw new Error("Method not implemented.");
	}
	visitGetExpr(expr: Get) {
		throw new Error("Method not implemented.");
	}
	visitLogicalExpr(expr: Logical) {
		const left = this.evaluate(expr.left);

		if (expr.operator.type === TokenType.OR) {
			if (this.isTruthy(left)) return this.isTruthy(left);
		} else {
			if (!this.isTruthy(left)) return left;
		}

		return this.evaluate(expr.right);
	}
	visitSetExpr(expr: Set) {
		throw new Error("Method not implemented.");
	}
	visitSuperExpr(expr: Super) {
		throw new Error("Method not implemented.");
	}
	visitThisExpr(expr: This) {
		throw new Error("Method not implemented.");
	}
	visitVariableExpr(expr: Variable) {
		return this.enviroment.get(expr.name);
	}
}
