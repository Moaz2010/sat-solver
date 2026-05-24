import type { ASTNode } from "./parser";
import { getVariables } from "./parser";
import { evaluate } from "./evaluator";

export type Assignment = Record<string, boolean>;

export interface AssignmentRow {
  assignment: Assignment;
  result: boolean;
}

export interface SATResult {
  satisfiable: boolean;
  satisfyingAssignments: Assignment[];
  allRows: AssignmentRow[];
  variables: string[];
}

export function solve(formula: ASTNode): SATResult {
  const variables = getVariables(formula);
  const n = variables.length;
  const allRows: AssignmentRow[] = [];
  const satisfyingAssignments: Assignment[] = [];

  const total = 1 << n; // 2^n
  for (let mask = 0; mask < total; mask++) {
    const assignment: Assignment = {};
    for (let i = 0; i < n; i++) {
      // MSB-first: variable[0] is the most significant bit
      assignment[variables[i]] = Boolean((mask >> (n - 1 - i)) & 1);
    }
    const result = evaluate(formula, assignment);
    allRows.push({ assignment, result });
    if (result) satisfyingAssignments.push(assignment);
  }

  return {
    satisfiable: satisfyingAssignments.length > 0,
    satisfyingAssignments,
    allRows,
    variables,
  };
}
