"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { parseFormula } from "@/lib/parser";
import { solve, type SATResult } from "@/lib/sat-solver";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Terminal, Zap, Keyboard, ChevronRight, CheckCircle2, XCircle, ChevronDown, ChevronUp, Sparkles, Activity } from "lucide-react";

const EXAMPLES = [
  { label: "De Morgan's", formula: "\u00ac(P \u2228 Q) \u2194 (\u00acP \u2227 \u00acQ)" },
  { label: "Modus Ponens", formula: "((P \u2192 Q) \u2227 P) \u2192 Q" },
  { label: "3-SAT Clause", formula: "(P \u2228 Q \u2228 \u00acR) \u2227 (\u00acP \u2228 \u00acQ \u2228 R)" },
  { label: "Contradiction", formula: "P \u2227 \u00acP" },
];

const OPERATORS = [
  { label: "\u00ac", insert: "\u00ac", name: "NOT" },
  { label: "\u2227", insert: "\u2227", name: "AND" },
  { label: "\u2228", insert: "\u2228", name: "OR" },
  { label: "\u2192", insert: "\u2192", name: "IMPLIES" },
  { label: "\u2194", insert: "\u2194", name: "IFF" },
  { label: "(", insert: "(", name: "LPAREN" },
  { label: ")", insert: ")", name: "RPAREN" },
];

export default function SatSolverApp() {
  const [formula, setFormula] = useState("(P \u2228 Q) \u2227 (\u00acP \u2228 R) \u2227 (\u00acQ \u2228 \u00acR)");
  const [result, setResult] = useState<SATResult | null>(null);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [isComputing, setIsComputing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSolve = useCallback(() => {
    if (!formula.trim()) return;
    setError("");
    setIsComputing(true);
    
    // Slight artificial delay for the ✨ premium computation feel ✨
    setTimeout(() => {
      try {
        const ast = parseFormula(formula);
        setResult(solve(ast));
      } catch (e) {
        setResult(null);
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setIsComputing(false);
      }
    }, 400);
  }, [formula]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "Enter") handleSolve();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSolve]);

  const insert = useCallback((op: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const next = formula.slice(0, start) + op + formula.slice(end);
    setFormula(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + op.length, start + op.length);
    });
  }, [formula]);

  const satisfyingCount = result?.satisfyingAssignments.length ?? 0;
  const displayedSatisfying = showAll
    ? result?.satisfyingAssignments
    : result?.satisfyingAssignments.slice(0, 4);
  const resultsPanelRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to results on mobile when they appear
  useEffect(() => {
    if (result && resultsPanelRef.current && window.innerWidth < 1024) {
      setTimeout(() => {
        resultsPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [result]);

  return (
    <div className="h-screen bg-grid-pattern relative overflow-x-hidden overflow-y-auto overscroll-contain text-slate-200 selection:bg-cyan-500/30 font-sans">
      {/* Abstract Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-violet-600/20 blur-[120px] mix-blend-screen animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-600/10 blur-[150px] mix-blend-screen animate-pulse-slow pointer-events-none" style={{ animationDelay: "2s" }} />
      <div className="absolute top-[40%] left-[60%] w-[30vw] h-[30vw] rounded-full bg-emerald-600/10 blur-[100px] mix-blend-screen animate-float pointer-events-none" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-20 relative z-10 w-full">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16 space-y-4"
        >
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-medium tracking-widest text-slate-300 uppercase">Next-Gen Logic Processing</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight">
            Boolean <br className="md:hidden"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 text-glow cursor-default transition-all duration-700 hover:hue-rotate-90 break-all sm:break-normal">
              Satisfiability
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed px-4">
            A high-performance algorithmic engine for evaluating complex propositional logic circuits via exhaustive truth table enumeration.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Input Engine */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 space-y-4 sm:space-y-6 min-w-0"
          >
            <div className="glass-panel rounded-3xl p-1">
              <div className="bg-black/40 rounded-[1.35rem] p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
                
                {/* Engine Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-cyan-400">
                    <Terminal className="w-5 h-5" />
                    <h2 className="text-sm font-bold uppercase tracking-widest">Formula Engine</h2>
                  </div>
                </div>

                {/* Input Area */}
                <div className="space-y-4">
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/50 to-violet-500/50 rounded-2xl blur opacity-20 group-focus-within:opacity-50 transition duration-500"></div>
                    <textarea
                      ref={textareaRef}
                      value={formula}
                      onChange={(e) => setFormula(e.target.value)}
                      rows={4}
                      spellCheck={false}
                      className="relative w-full bg-[#0a0a0f] border border-white/10 rounded-2xl px-5 py-4 font-mono text-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none custom-scrollbar shadow-inner"
                      placeholder="e.g. (P \u2228 Q) \u2227 (\u00acP \u2228 R)"
                    />
                  </div>
                  
                  {/* Operator Keyboard */}
                  <div className="flex flex-wrap gap-2">
                    {OPERATORS.map((op) => (
                      <button
                        key={op.name}
                        title={op.name}
                        onClick={() => insert(op.insert)}
                        className="group relative px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 transition-all duration-300 overflow-hidden"
                      >
                        <span className="relative z-10 font-mono text-lg text-slate-300 group-hover:text-cyan-300 group-hover:text-glow-sm transition-colors">
                          {op.label}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Compute Button */}
                <button
                  onClick={handleSolve}
                  disabled={isComputing}
                  className="w-full relative group overflow-hidden rounded-xl p-[1px] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 bg-[length:200%_auto] animate-pulse rounded-xl"></span>
                  <div className="relative bg-black/80 backdrop-blur-md px-6 py-4 rounded-[11px] flex items-center justify-center gap-3 transition-all duration-300 group-hover:bg-black/50">
                    {isComputing ? (
                      <Activity className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <Cpu className="w-5 h-5 text-white group-hover:text-cyan-200 transition-colors" />
                    )}
                    <span className="font-bold text-white tracking-wide uppercase text-sm">
                      {isComputing ? "Computing Matrix..." : "Run Analysis"}
                    </span>
                    <span className="absolute right-4 text-[10px] text-white/40 font-mono hidden sm:block border border-white/10 px-2 py-1 rounded bg-white/5 group-hover:border-white/30 transition-colors">
                      CTRL + Enter
                    </span>
                  </div>
                </button>

                {/* Error Banner */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, scale: 0.95 }}
                      animate={{ opacity: 1, height: "auto", scale: 1 }}
                      exit={{ opacity: 0, height: 0, scale: 0.95 }}
                      className="bg-red-950/40 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 mt-4"
                    >
                      <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <p className="text-sm font-mono text-red-200 leading-relaxed drop-shadow-md">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>

            {/* Presets */}
            <div className="pl-2 relative z-10">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                <Keyboard className="w-3.5 h-3.5" /> Structural Presets
              </h3>
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => { setFormula(ex.formula); setResult(null); setError(""); }}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 text-slate-400 hover:text-white transition-all backdrop-blur-md"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Visualization */}
          <div ref={resultsPanelRef} className="lg:col-span-7 min-w-0">
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full"
          >
            <AnimatePresence mode="wait">
              {!result ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full min-h-[400px] glass-panel rounded-3xl flex flex-col items-center justify-center p-12 text-center border-dashed border-white/10"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                    <Zap className="w-8 h-8 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-400 mb-2">Awaiting Parameters</h3>
                  <p className="text-sm text-slate-500 max-w-sm">
                    Enter a propositional formula and initiate the analysis to map its structural satisfiability matrix.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4 }}
                  className="space-y-6"
                >
                  {/* Verdict Card */}
                  <div className="glass-panel p-1 rounded-3xl overflow-hidden relative">
                    <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${result.satisfiable ? 'from-emerald-500 to-transparent' : 'from-rose-500 to-transparent'}`}></div>
                    
                    <div className="relative bg-black/60 backdrop-blur-md rounded-[1.35rem] p-5 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shrink-0 border ${
                          result.satisfiable 
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]' 
                            : 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.3)]'
                        }`}>
                          {result.satisfiable ? <CheckCircle2 className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
                        </div>
                        <div>
                          <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${result.satisfiable ? 'text-emerald-400 text-glow-sm' : 'text-rose-400 text-glow-sm'}`}>
                            {result.satisfiable ? 'SATISFIABLE' : 'UNSATISFIABLE'}
                          </h2>
                          <div className="text-sm text-slate-400 mt-1 font-medium">
                            <span className="text-white">{satisfyingCount}</span> of <span className="text-white">{result.allRows.length}</span> assignments yield true
                          </div>
                        </div>
                      </div>
                      
                      <div className="hidden sm:block right-panel">
                        <div className="text-right">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Variables</div>
                          <div className="flex gap-1 justify-end flex-wrap max-w-[120px]">
                            {result.variables.map(v => (
                              <span key={v} className="bg-white/10 text-white text-xs px-1.5 py-0.5 rounded font-mono border border-white/5">{v}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Satisfying Assignments */}
                  {result.satisfiable && (
                    <div className="glass-panel rounded-2xl p-4 sm:p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Valid States
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-3 relative z-10">
                        {displayedSatisfying?.map((asgn, idx) => (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={idx}
                            className="bg-black/40 border border-emerald-500/20 rounded-xl p-3 flex gap-4 overflow-x-auto custom-scrollbar shadow-inner"
                          >
                            {result.variables.map(v => (
                              <div key={v} className="flex flex-col items-center shrink-0">
                                <span className="text-[10px] text-slate-500 font-mono mb-1">{v}</span>
                                <span className={`text-sm font-bold font-mono px-2 py-0.5 rounded ${
                                  asgn[v] ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-slate-400'
                                }`}>
                                  {asgn[v] ? '1' : '0'}
                                </span>
                              </div>
                            ))}
                          </motion.div>
                        ))}
                      </div>
                      
                      {satisfyingCount > 4 && (
                        <button
                          onClick={() => setShowAll(!showAll)}
                          className="mt-4 w-full py-2 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors border border-dashed border-emerald-500/30 relative z-10"
                        >
                          {showAll ? <><ChevronUp className="w-4 h-4"/> Collapse Matrix</> : <><ChevronDown className="w-4 h-4"/> Reveal All {satisfyingCount} States</>}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Global Truth Table */}
                  <div className="glass-panel rounded-2xl overflow-hidden flex flex-col relative">
                    <div className="p-4 sm:p-6 pb-4 border-b border-white/10 bg-white/[0.02]">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-400" /> Exhaustive Truth Table
                      </h3>
                    </div>
                    <div className="w-full max-w-full overflow-x-auto overflow-y-visible custom-scrollbar">
                      <table className="min-w-[28rem] sm:min-w-full w-full text-xs sm:text-sm font-mono text-left whitespace-nowrap">
                        <thead className="bg-[#0a0a0f]/90 backdrop-blur sticky top-0 z-10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                          <tr>
                            {result.variables.map((v) => (
                              <th key={v} className="px-3 sm:px-6 py-3 sm:py-4 text-slate-400 font-medium">
                                {v}
                              </th>
                            ))}
                            <th className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-white border-l border-white/5 bg-white/[0.01]">
                              <span className="inline-flex items-center gap-2">
                                Output <ChevronRight className="w-3 h-3 text-slate-500"/>
                              </span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {result.allRows.map((row, idx) => (
                            <tr
                              key={idx}
                              className={`transition-colors hover:bg-white/5 ${
                                row.result ? "bg-emerald-500/[0.03]" : ""
                              }`}
                            >
                              {result.variables.map((v) => (
                                <td key={v} className="px-3 sm:px-6 py-2.5 sm:py-3">
                                  <span className={`inline-block w-2 h-2 rounded-full mr-2 shadow-[0_0_8px_currentColor] ${row.assignment[v] ? 'bg-cyan-400 text-cyan-400' : 'bg-slate-700 text-slate-700'}`}></span>
                                  <span className={row.assignment[v] ? 'text-slate-200' : 'text-slate-500'}>
                                    {row.assignment[v] ? "True" : "False"}
                                  </span>
                                </td>
                              ))}
                              <td className={`px-3 sm:px-6 py-2.5 sm:py-3 font-bold border-l border-white/5 ${
                                row.result ? "text-emerald-400 text-glow-sm bg-emerald-500/[0.02]" : "text-rose-400/70"
                              }`}>
                                {row.result ? "TRUE" : "FALSE"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}