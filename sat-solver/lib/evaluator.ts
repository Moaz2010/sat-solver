import type { ASTNode } from "./parser";

export function evaluate(
  node: ASTNode,
  assignment: Record<string, boolean>
): boolean {
  switch (node.type) {
    case "variable":
      return assignment[node.name] ?? false;
    case "not":
      return !evaluate(node.operand, assignment);
    case "and":
      return evaluate(node.left, assignment) && evaluate(node.right, assignment);
    case "or":
      return evaluate(node.left, assignment) || evaluate(node.right, assignment);
    case "implies":
      return !evaluate(node.left, assignment) || evaluate(node.right, assignment);
    case "biconditional":
      return evaluate(node.left, assignment) === evaluate(node.right, assignment);
  }
}
