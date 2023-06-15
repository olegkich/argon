import fs from "fs";
import { AstPrinter } from "./ast.printer";
import { Binary, Expr, Grouping, Literal, Unary } from "./expression";
import { Lexer, Token, TokenType } from "./lexer";
import { Parser } from "./parser";
import prompt from "prompt";
import { Interpreter } from "./interpreter";
import * as readline from "readline-sync";
import { Stmt } from "./statement";

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

  process.exit(0);

  console.log("what the fuck");
};

const runFile = (path: string) => {
  try {
    const src: string = fs.readFileSync(path).toString("utf8");

    const lexer = new Lexer(src);
    const tokens = lexer.scanTokens();

    const parser = new Parser(tokens);
    let statements: Array<Stmt> = parser.parse();

    new Interpreter(statements);
  } catch (error) {
    console.error("could not open file.");
  }
};

const runPrompt = () => {
  const interpreter = new Interpreter([]);

  while (true) {
    const input = readline.question(">");

    if (input === ".exit") {
      return;
    }

    const tokens = new Lexer(input).scanTokens();

    const stmts: Array<Stmt> = new Parser(tokens).parse();
    for (const stmt of stmts) {
      interpreter.execute(stmt);
    }
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
