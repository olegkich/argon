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
	Visitor,
} from "./expression";
import { Token, TokenType } from "./lexer";

export class Interpreter implements Visitor<any> {
	constructor(expr: Expr) {
		try {
			const value = this.evaluate(expr);
			console.log(value);
		} catch (e) {
			console.log(e);
		}
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

				if (typeof left === "string" && typeof right === "number") {
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
		throw new Error("Method not implemented.");
	}
	visitCallExpr(expr: Call) {
		throw new Error("Method not implemented.");
	}
	visitGetExpr(expr: Get) {
		throw new Error("Method not implemented.");
	}
	visitLogicalExpr(expr: Logical) {
		throw new Error("Method not implemented.");
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
		throw new Error("Method not implemented.");
	}
}
