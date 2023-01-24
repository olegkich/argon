import fs from "fs";
import { AstPrinter } from "./ast.printer";
import { Binary, Expr, Grouping, Literal, Unary } from "./expression";
import { Lexer, Token, TokenType } from "./lexer";
import { Parser } from "./parser";
import prompt from "prompt";
import { Interpreter } from "./interpreter";
import * as readline from "readline-sync";

// syntax example
//
// print "string";
// var x = 5.55;
// fun squared (x) { return x*x }
// etc

export const errorLogger = (line: number, message: string): void => {
	console.error(`error at line ${line}:\n${message}`);
};

const main = () => {
	const args: Array<string> = process.argv.slice(2);

	if (args.length > 1) {
		console.log("Usage: arg [script]");
		process.exit(64);
	} else if (args.length === 1) {
		runFile(args[0]);
	} else {
		runPrompt();
	}
};

const runFile = (path: string) => {
	const src: string = fs.readFileSync(path).toString("utf8");
	const lexer = new Lexer(src);
	const tokens = lexer.scanTokens();

	const parser = new Parser(tokens);
	let expression = parser.parse();

	console.log("source: ", src);
	console.log("tokens:\n", tokens, "\n");
	console.log("AST: \n", new AstPrinter().print(expression), "\n");

	new Interpreter(expression);
};

const runPrompt = () => {
	while (true) {
		const input = readline.question(">");

		if (input === ".exit") {
			return;
		}

		const tokens = new Lexer(input).scanTokens();
		const expression = new Parser(tokens).parse();
		new Interpreter(expression);
	}

	function onErr(err) {
		console.log(err);
		return 1;
	}
};

main();

// (5 + 3) * 2
//
//     *
//    / \
//   +   2
//  / \
// 5   3
