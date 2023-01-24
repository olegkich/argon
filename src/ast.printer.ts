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

export class AstPrinter implements Visitor<String> {
	print(expr: Expr): String {
		return expr.accept(this);
	}

	parenthesize(op: string, exprs: Iterable<Expr>) {
		let formatted = "";

		formatted += "(" + op;
		for (let expr of exprs) {
			formatted += " ";
			formatted += expr.accept(this);
		}
		formatted += ")";
		return formatted;
	}

	public visitBinaryExpr(expr: Binary) {
		return this.parenthesize(expr.operator.lexeme, [expr.left, expr.right]);
	}

	visitUnaryExpr(expr: Unary) {
		return this.parenthesize(expr.operator.lexeme, [expr.right]);
	}

	visitGroupingExpr(expr: Grouping) {
		return this.parenthesize("group", [expr.expression]);
	}
	visitLiteralExpr(expr: Literal) {
		if (expr.value === null) return "nil";
		return expr.value.toString();
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
