// ─── Token types ────────────────────────────────────────────────────────────

type TokenKind =
  | "VAR"
  | "NOT"
  | "AND"
  | "OR"
  | "IMPLIES"
  | "BICONDITIONAL"
  | "LPAREN"
  | "RPAREN"
  | "EOF";

interface Token {
  kind: TokenKind;
  value?: string;
}

// ─── AST node types ──────────────────────────────────────────────────────────

export type ASTNode =
  | { type: "variable"; name: string }
  | { type: "not"; operand: ASTNode }
  | { type: "and"; left: ASTNode; right: ASTNode }
  | { type: "or"; left: ASTNode; right: ASTNode }
  | { type: "implies"; left: ASTNode; right: ASTNode }
  | { type: "biconditional"; left: ASTNode; right: ASTNode };

// ─── Tokenizer ───────────────────────────────────────────────────────────────

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i];

    if (/\s/.test(ch)) { i++; continue; }

    // Biconditional: <-> or ↔ (\u2194)
    if (input.startsWith("<->", i)) { tokens.push({ kind: "BICONDITIONAL" }); i += 3; continue; }
    if (ch === "\u2194") { tokens.push({ kind: "BICONDITIONAL" }); i++; continue; }

    // Implies: -> or → (\u2192)
    if (input.startsWith("->", i)) { tokens.push({ kind: "IMPLIES" }); i += 2; continue; }
    if (ch === "\u2192") { tokens.push({ kind: "IMPLIES" }); i++; continue; }

    // NOT: ! or ¬ (\u00ac)
    if (ch === "!" || ch === "\u00ac") { tokens.push({ kind: "NOT" }); i++; continue; }

    // AND: & or ∧ (\u2227)
    if (ch === "&" || ch === "\u2227") { tokens.push({ kind: "AND" }); i++; continue; }

    // OR: | or ∨ (\u2228)
    if (ch === "|" || ch === "\u2228") { tokens.push({ kind: "OR" }); i++; continue; }

    if (ch === "(") { tokens.push({ kind: "LPAREN" }); i++; continue; }
    if (ch === ")") { tokens.push({ kind: "RPAREN" }); i++; continue; }

    // Variable: uppercase A-Z (one letter)
    if (/[A-Z]/.test(ch)) { tokens.push({ kind: "VAR", value: ch }); i++; continue; }

    throw new Error(`Unexpected character: "${ch}" at position ${i}`);
  }
  tokens.push({ kind: "EOF" });
  return tokens;
}

// ─── Recursive-descent parser ────────────────────────────────────────────────
// Precedence (lowest → highest):
//   biconditional ↔ → disjunction ∨ → conjunction ∧ → negation ¬ → atom

class Parser {
  private tokens: Token[];
  private pos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token { return this.tokens[this.pos]; }

  private consume(kind?: TokenKind): Token {
    const t = this.tokens[this.pos++];
    if (kind && t.kind !== kind) throw new Error(`Expected ${kind} but got ${t.kind}`);
    return t;
  }

  parse(): ASTNode {
    const node = this.parseBiconditional();
    if (this.peek().kind !== "EOF") {
      throw new Error(`Unexpected token: ${this.peek().kind}`);
    }
    return node;
  }

  private parseBiconditional(): ASTNode {
    let left = this.parseImplies();
    while (this.peek().kind === "BICONDITIONAL") {
      this.consume("BICONDITIONAL");
      const right = this.parseImplies();
      left = { type: "biconditional", left, right };
    }
    return left;
  }

  private parseImplies(): ASTNode {
    let left = this.parseOr();
    while (this.peek().kind === "IMPLIES") {
      this.consume("IMPLIES");
      const right = this.parseOr();
      left = { type: "implies", left, right };
    }
    return left;
  }

  private parseOr(): ASTNode {
    let left = this.parseAnd();
    while (this.peek().kind === "OR") {
      this.consume("OR");
      const right = this.parseAnd();
      left = { type: "or", left, right };
    }
    return left;
  }

  private parseAnd(): ASTNode {
    let left = this.parseNot();
    while (this.peek().kind === "AND") {
      this.consume("AND");
      const right = this.parseNot();
      left = { type: "and", left, right };
    }
    return left;
  }

  private parseNot(): ASTNode {
    if (this.peek().kind === "NOT") {
      this.consume("NOT");
      return { type: "not", operand: this.parseNot() };
    }
    return this.parseAtom();
  }

  private parseAtom(): ASTNode {
    const t = this.peek();
    if (t.kind === "VAR") {
      this.consume("VAR");
      return { type: "variable", name: t.value! };
    }
    if (t.kind === "LPAREN") {
      this.consume("LPAREN");
      const node = this.parseBiconditional();
      this.consume("RPAREN");
      return node;
    }
    throw new Error(`Unexpected token: ${t.kind}`);
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function parseFormula(input: string): ASTNode {
  const tokens = tokenize(input.trim());
  return new Parser(tokens).parse();
}

export function getVariables(node: ASTNode): string[] {
  const vars = new Set<string>();
  function walk(n: ASTNode) {
    if (n.type === "variable") { vars.add(n.name); return; }
    if (n.type === "not") { walk(n.operand); return; }
    walk(n.left);
    walk(n.right);
  }
  walk(node);
  return [...vars].sort();
}
