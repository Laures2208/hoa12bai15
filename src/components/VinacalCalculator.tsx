import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as math from 'mathjs';
import { Minimize2, Maximize2, X, GripHorizontal, Beaker } from 'lucide-react';
import { cn } from '../lib/utils';

// Google Font URL inside the component to ensure it loads
const FONT_URL = "https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap";

interface VinacalCalculatorProps {
  onClose?: () => void;
  className?: string;
  defaultPosition?: { x: number; y: number };
  isStandalone?: boolean;
}

const CHEM_CONSTANTS = [
  { symbol: 'N_A', value: '6.022*10^23', label: 'Avogadro', type: 'constant' },
  { symbol: 'R', value: '0.082', label: 'Khí lý tưởng', type: 'constant' },
  { symbol: 'H', value: '1', label: 'M(H)', type: 'mass' },
  { symbol: 'C', value: '12', label: 'M(C)', type: 'mass' },
  { symbol: 'N', value: '14', label: 'M(N)', type: 'mass' },
  { symbol: 'O', value: '16', label: 'M(O)', type: 'mass' },
  { symbol: 'Na', value: '23', label: 'M(Na)', type: 'mass' },
  { symbol: 'S', value: '32', label: 'M(S)', type: 'mass' },
  { symbol: 'Cl', value: '35.5', label: 'M(Cl)', type: 'mass' },
  { symbol: 'Fe', value: '56', label: 'M(Fe)', type: 'mass' },
  { symbol: 'Cu', value: '64', label: 'M(Cu)', type: 'mass' },
  { symbol: 'Ba', value: '137', label: 'M(Ba)', type: 'mass' },
];

export const VinacalCalculator: React.FC<VinacalCalculatorProps> = ({ 
  onClose, 
  className,
  defaultPosition = { x: 0, y: 0 },
  isStandalone = false
}) => {
  const [expression, setExpression] = useState('(A+2B)*log(e^C)');
  const [result, setResult] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [showChemMenu, setShowChemMenu] = useState(false);
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [isAlphaActive, setIsAlphaActive] = useState(false);

  // New states for Advanced Features
  const [variables, setVariables] = useState<Record<string, number>>({ A:5, B:2, C:1, D:0, E:0, F:0, G:0, X:0, Y:0, M:0 });
  const [activeMode, setActiveMode] = useState<'COMP' | 'STO' | 'CALC_PROMPT' | 'SOLVE_PROMPT'>('COMP');
  const [displayLines, setDisplayLines] = useState<string[]>([]);
  const [savedExpression, setSavedExpression] = useState('');
  
  // States for CALC / SOLVE Prompts
  const [promptVar, setPromptVar] = useState<string | null>(null);
  const [promptVarsTarget, setPromptVarsTarget] = useState<string[]>([]);
  const [tempVariables, setTempVariables] = useState<Record<string, number>>({});
  const [currentCalcVarIndex, setCurrentCalcVarIndex] = useState(0);

  // Run initial calculation for the default expression
  useEffect(() => {
    if (expression === '(A+2B)*log(e^C)' && !result) {
       const mathExpr = expression.replace(/×/g, '*').replace(/÷/g, '/');
       try {
           const res = math.evaluate(mathExpr, variables);
           setResult(math.format(res, { precision: 12 }).toString());
       } catch (e) {
           // ignore
       }
    }
  }, []);


  // Format expression for mathjs evaluation
  const evaluateExpressionWithVars = (expr: string, vars: Record<string, number>) => {
    try {
      if (!expr.trim()) return '';
      let mathExpr = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'pi')
        .replace(/√\(/g, 'sqrt(');
      
      const res = math.evaluate(mathExpr, vars);
      if (typeof res === 'number') {
        return math.format(res, { precision: 12 });
      }
      return String(res);
    } catch (e) {
      return '';
    }
  };

  const calculate = () => {
    try {
      if (!expression.trim()) return;
      let mathExpr = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'pi')
        .replace(/√\(/g, 'sqrt(');
      
      const res = math.evaluate(mathExpr, variables);
      setResult(math.format(res, { precision: 12 }).toString());
      setDisplayLines([`Kết quả: ${math.format(res, { precision: 12 }).toString()}`]);
    } catch (e) {
      setResult('Syntax ERROR');
    }
  };

  const handleCalcEquals = () => {
    const val = Number(evaluateExpressionWithVars(expression, { ...variables, ...tempVariables })) || 0;
    const nextVars = { ...tempVariables, [promptVar as string]: val };
    setTempVariables(nextVars);
    
    const nextIdx = currentCalcVarIndex + 1;
    if (nextIdx < promptVarsTarget.length) {
        setCurrentCalcVarIndex(nextIdx);
        const nextVar = promptVarsTarget[nextIdx];
        setPromptVar(nextVar);
        setDisplayLines(prev => [...prev.slice(-2), `${promptVar}=${val}`, `Assign: ${nextVar}=?`]);
        setExpression(String(variables[nextVar] || 0));
        setResult('');
    } else {
        setVariables(prev => ({ ...prev, ...nextVars }));
        const evaluated = evaluateExpressionWithVars(savedExpression, { ...variables, ...nextVars });
        setDisplayLines(prev => [...prev.slice(-2), `${promptVar}=${val}`, `Result: ${evaluated}`]);
        setExpression(savedExpression);
        setResult(String(evaluated));
        setActiveMode('COMP');
    }
  };

  const executeSolve = () => {
    const guess = Number(evaluateExpressionWithVars(expression, variables)) || 0;
    try {
       setDisplayLines(prev => [...prev.slice(-2), `X_guess = ${guess}`]);
       let eq = savedExpression;
       if (eq.includes('=')) {
          const parts = eq.split('=');
          eq = `(${parts[0]})-(${parts[1]})`;
       }
       eq = eq.replace(/×/g, '*').replace(/÷/g, '/');
       const f = math.parse(eq).compile();
       const fd = math.derivative(eq, 'X').compile();
       let x = guess;
       let found = false;
       for(let i=0; i<30; i++) {
          let y = f.evaluate({ ...variables, X: x });
          if (Math.abs(y) < 1e-9) { found = true; break; }
          let dy = fd.evaluate({ ...variables, X: x });
          if (dy === 0) break;
          x = x - y/dy;
       }
       if (found) {
           const finalRes = math.format(x, {precision: 10});
           setResult(`X = ${finalRes}`);
           setVariables(prev => ({...prev, X: x}));
           setDisplayLines(prev => [...prev.slice(-2), `Solved X: ${finalRes}`]);
       } else {
           setResult("Can't Solve");
       }
    } catch(e) {
       setResult("Syntax ERROR");
    }
    setActiveMode('COMP');
    setExpression(savedExpression);
  };

  const handleEquals = () => {
    if (activeMode === 'CALC_PROMPT') {
       handleCalcEquals();
    } else if (activeMode === 'SOLVE_PROMPT') {
       executeSolve();
    } else {
       calculate();
    }
  };

  const appendToExpression = (val: string) => {
    if (result === 'Syntax ERROR' || result === "Can't Solve") {
      setResult('');
      setExpression(val);
    } else {
      setExpression(prev => prev + val);
    }
    setIsShiftActive(false);
    setIsAlphaActive(false);
  };

  const handleKey = ({ val, shiftAction, alphaVar, action }: { val?: string, shiftAction?: () => void, alphaVar?: string, action?: () => void }) => {
    if (activeMode === 'STO') {
      if (alphaVar && /[A-GXYM]/.test(alphaVar)) {
        const evaluatedVal = evaluateExpressionWithVars(expression, variables) || 0;
        setVariables(prev => ({...prev, [alphaVar]: Number(evaluatedVal)}));
        setDisplayLines(prev => [...prev.slice(-2), `${evaluatedVal} \u2192 ${alphaVar}`]);
        setExpression('');
        setResult(`${alphaVar}=${Number(evaluatedVal)}`);
        setActiveMode('COMP');
        setIsShiftActive(false);
        setIsAlphaActive(false);
      }
      return;
    }
    
    if (isShiftActive && shiftAction) {
      shiftAction();
      setIsShiftActive(false);
      return;
    }
    
    if (isAlphaActive && alphaVar) {
      appendToExpression(alphaVar);
      setIsAlphaActive(false);
      return;
    }
    
    if (action) {
      action();
      return;
    }
    
    if (val) {
      appendToExpression(val);
    }
  };

  const handleCalcMode = () => {
    const varsInExpr = expression.match(/[A-GXYM]/g);
    if (varsInExpr) {
       const uniqueVars = Array.from(new Set(varsInExpr));
       setPromptVarsTarget(uniqueVars);
       setTempVariables({...variables});
       setCurrentCalcVarIndex(0);
       setPromptVar(uniqueVars[0]);
       setActiveMode('CALC_PROMPT');
       setSavedExpression(expression);
       setDisplayLines(prev => [...prev.slice(-2), `Eq: ${expression}`, `Assign: ${uniqueVars[0]}=?`]);
       setExpression(String(variables[uniqueVars[0]] || 0)); 
       setResult('');
    } else {
       calculate();
    }
  };

  const handleSolveMode = () => {
    setPromptVar('X');
    setTempVariables({...variables});
    setActiveMode('SOLVE_PROMPT');
    setSavedExpression(expression);
    setDisplayLines(prev => [...prev.slice(-2), `Solve: ${expression}`, `Assign: X=?`]);
    setExpression(String(variables['X'] || 0));
    setResult('');
  };

  const handleBackspace = () => {
    if (result === 'Syntax ERROR' || result === "Can't Solve") {
      setResult('');
      setExpression('');
      return;
    }
    setExpression(prev => prev.slice(0, -1));
    setResult('');
  };

  const handleClear = () => {
    setExpression('');
    setResult('');
    setDisplayLines([]);
    setActiveMode('COMP');
  };

  // Keyboard mapping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      const keyMap: Record<string, string> = {
        '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
        '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
        '+': '+', '-': '-', '*': '×', '/': '÷', '.': '.',
        '(': '(', ')': ')', '^': '^'
      };
      if (keyMap[e.key]) {
        e.preventDefault();
        appendToExpression(keyMap[e.key]);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Delete' || e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expression, result, activeMode, promptVar, currentCalcVarIndex, tempVariables]);

  const Button = ({ 
    label, 
    onClick, 
    className, 
    shiftLabel, 
    alphaLabel,
    isSpecial = false,
    isFunction = false
  }: { 
    label: React.ReactNode, 
    onClick: () => void, 
    className?: string,
    shiftLabel?: React.ReactNode,
    alphaLabel?: React.ReactNode,
    isSpecial?: boolean,
    isFunction?: boolean
  }) => {
    const baseClass = "relative flex items-center justify-center rounded-xl font-bold text-sm transition-all duration-75 active:translate-y-[2px] shadow-[0_4px_0_0_rgb(0,0,0,0.5)] active:shadow-[0_0px_0_0_rgb(0,0,0,0.5)] border border-white/5";
    
    let colorClass = "bg-[#f8fafc] text-slate-800 shadow-[0_4px_0_0_#cbd5e1]"; // standard numbers
    if (isSpecial) colorClass = "bg-[#1d4ed8] text-white shadow-[0_4px_0_0_#1e3a8a] border-blue-400/20"; // ON, DEL, AC
    else if (isFunction) colorClass = "bg-[#26282a] text-white shadow-[0_4px_0_0_#111111]"; // Functions

    return (
      <div className="flex flex-col items-center justify-end relative h-[56px] w-full">
        <div className="absolute top-[-10px] left-0 right-0 flex justify-between space-x-[1px] text-[10px] font-bold tracking-tight px-0 z-10 whitespace-nowrap overflow-visible pointer-events-none">
          <span className="text-yellow-500 drop-shadow-md text-left leading-[1]">{shiftLabel}</span>
          <span className="text-cyan-400 drop-shadow-md text-right leading-[1]">{alphaLabel}</span>
        </div>
        <button 
          className={cn(baseClass, colorClass, className, "w-full h-[32px] flex-shrink-0 z-20 mt-auto")}
          onClick={onClick}
          style={isFunction ? { fontFamily: "'Inter', sans-serif" } : undefined}
        >
          {label}
        </button>
      </div>
    );
  };

  if (isMinimized) {
    return (
      <motion.div 
        drag
        dragMomentum={false}
        initial={defaultPosition}
        className={cn("fixed z-50 shadow-2xl rounded-full bg-[#1c1e21] text-white p-3 cursor-grab active:cursor-grabbing border-2 border-slate-700 flex items-center gap-2", className)}
      >
        <button onClick={() => setIsMinimized(false)} className="hover:text-teal-400" title="Maximize">
          <Maximize2 size={24} />
        </button>
        <div className="font-bold text-sm mx-2">VINACAL</div>
        <button onClick={onClose} className="hover:text-red-400" title="Close">
          <X size={24} />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      drag={!isStandalone}
      dragMomentum={false}
      initial={isStandalone ? false : defaultPosition}
      className={cn(
        isStandalone ? "mx-auto shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] rounded-[2rem] bg-[#1c1e21] flex flex-col select-none border-b-8 border-r-4 border-l-2 border-t-2 border-[#111111]/80" : "fixed z-50 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] rounded-[2rem] bg-[#1c1e21] flex flex-col select-none border-b-8 border-r-4 border-l-2 border-t-2 border-[#111111]/80",
        "w-[400px] h-max min-h-[820px] max-w-full",
        className
      )}
      style={{ backgroundImage: 'linear-gradient(145deg, #222428 0%, #151719 100%)' }}
    >
      {/* Header / Drag Bar */}
      <div className={cn("flex items-center px-4 py-2 border-b border-black/30 drag-handle rounded-t-[2rem]", !isStandalone && "cursor-grab active:cursor-grabbing", isStandalone ? "justify-end" : "justify-between")}>
        {!isStandalone && (
          <div className="flex items-center gap-1 opacity-60">
            <GripHorizontal size={16} className="text-slate-400" />
          </div>
        )}
        <div className="flex items-center gap-3">
          <button onClick={() => setShowChemMenu(!showChemMenu)} className={cn("p-1.5 rounded-full transition-colors", showChemMenu ? "bg-teal-500/20 text-teal-400" : "hover:bg-white/10 text-slate-300")} title="Menu Hóa Học">
            <Beaker size={16} />
          </button>
          {!isStandalone && (
            <button onClick={() => setIsMinimized(true)} className="text-slate-300 hover:text-white transition-colors">
              <Minimize2 size={16} />
            </button>
          )}
          {onClose && (
             <button onClick={onClose} className="text-slate-300 hover:text-red-400 transition-colors">
               <X size={16} />
             </button>
          )}
        </div>
      </div>

      <div className="p-5 pb-10 flex-1 flex flex-col relative">
        {/* Brand & Hologram */}
        <div className="flex justify-between items-start mb-3 px-1">
          <div className="flex flex-col">
            <div className="font-sans font-black tracking-widest text-2xl bg-gradient-to-b from-gray-100 to-gray-400 bg-clip-text text-transparent italic leading-none">
              VINACAL<sup className="text-[10px] ml-0.5">®</sup>
            </div>
            <div className="text-cyan-500 text-xs font-bold tracking-widest italic mt-1">
              680EX PLUS III
            </div>
          </div>
          <div className="w-[80px] h-[30px] rounded-sm bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-500 shadow-[0_0_5px_rgba(250,204,21,0.5)] flex items-center justify-center overflow-hidden border border-yellow-600/50 relative">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30 mix-blend-overlay"></div>
             <span className="text-[10px] font-black text-amber-600/80 tracking-widest rotate-[-10deg] mix-blend-multiply">VINACAL</span>
          </div>
        </div>

        {/* LCD Screen Container */}
        <div className="bg-[#1a1b1e] rounded-xl p-2 mb-2 shadow-[inset_0_4px_10px_rgba(0,0,0,0.8)] border border-[#333]/50">
          <div className="bg-[#9bb098] rounded-lg p-2 flex flex-col justify-between h-[120px] shadow-[inset_0_2px_15px_rgba(0,0,0,0.2)] relative overflow-hidden" style={{ fontFamily: "'Share Tech Mono', 'Roboto Mono', monospace" }}>
            {/* Screen overlay for dot-matrix effect */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '3px 3px' }}></div>
            
            {/* Status indicators */}
            <div className="flex gap-2 text-[#1c281f]/70 text-[10px] font-bold h-4 relative z-10 px-1 border-b border-[#1c281f]/10 pb-4 mb-1 uppercase tracking-tight">
              {isShiftActive && <span>S</span>}
              {isAlphaActive && <span>A</span>}
              <span>M</span>
              <span>Math</span>
              <span className="ml-2">D</span>
              <span>FIX</span>
              <span>SCI</span>
              <span>E</span>
              <span className="ml-auto flex items-center gap-1"><span>▴</span><span>▾</span><span>◂</span><span>▸</span></span>
            </div>

            <div className="flex-1 flex flex-col justify-end overflow-hidden text-sm leading-tight text-[#1c281f] font-bold relative z-10" style={{ direction: 'ltr' }}>
                {displayLines.map((line, idx) => (
                    <div key={idx} className="whitespace-nowrap overflow-hidden text-ellipsis">{line}</div>
                ))}
            </div>

            { activeMode === 'CALC_PROMPT' || activeMode === 'SOLVE_PROMPT' ? (
                <div className="flex justify-between items-end mt-1 text-[#1c281f] h-10 relative z-10">
                    <span className="text-base font-bold truncate max-w-[120px]">{promptVar}=?</span>
                    <span className="text-2xl font-bold tracking-tight">{expression || "0"}</span>
                </div>
            ) : (
                <div className="relative z-10 mt-1">
                    <div className="text-left text-[#1c281f] text-xl overflow-hidden whitespace-nowrap break-words tracking-tight h-7">
                       <span>{expression || "0"}</span>
                    </div>
                    <div className="text-right text-[#0f1411] text-3xl font-bold overflow-hidden whitespace-nowrap h-9 leading-none" style={{ textShadow: "1px 1px 0px rgba(0,0,0,0.1)"}}>
                      {result || "\u00A0"}
                    </div>
                </div>
            )}
          </div>
        </div>
        
        {/* Sub-screen text */}
        <div className="text-center text-cyan-500 font-semibold text-[9px] mb-4 tracking-[0.2em] font-sans">
          SCIENTIFIC CALCULATOR
        </div>

        {/* Chemistry Overlay / Constants Menu */}
        <AnimatePresence>
          {showChemMenu && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-48 left-4 right-4 bg-[#1e293b] rounded-xl border border-teal-500/30 p-3 shadow-2xl z-50 h-[380px] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-3 border-b border-slate-700 pb-2">
                <h3 className="text-teal-400 font-bold flex items-center gap-2"><Beaker size={16}/> Hóa Học</h3>
                <button onClick={() => setShowChemMenu(false)} className="text-slate-400 hover:text-white"><X size={16}/></button>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-400 font-bold mb-2 uppercase tracking-wider">Hằng Số Cơ Bản</div>
                  <div className="grid grid-cols-2 gap-2">
                    {CHEM_CONSTANTS.filter(c => c.type === 'constant').map(c => (
                      <button
                        key={c.symbol}
                        onClick={() => { appendToExpression(`(${c.value})`); setShowChemMenu(false); }}
                        className="bg-slate-800 hover:bg-slate-700 rounded p-2 text-left border border-slate-700/50 transition-colors"
                      >
                        <div className="text-white font-bold text-sm">{c.symbol}</div>
                        <div className="text-slate-400 text-xs">{c.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-bold mb-2 uppercase tracking-wider">Nguyên Tử Khối (M)</div>
                  <div className="grid grid-cols-3 gap-2">
                    {CHEM_CONSTANTS.filter(c => c.type === 'mass').map(c => (
                      <button
                        key={c.symbol}
                        onClick={() => { appendToExpression(c.value); setShowChemMenu(false); }}
                        className="bg-slate-800 hover:bg-slate-700 rounded p-2 text-center border border-slate-700/50 transition-colors"
                      >
                        <div className="text-white font-bold">{c.symbol}</div>
                        <div className="text-teal-400 text-sm">{c.value}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Control Keys Row (SHIFT, ALPHA, D-PAD, ON, MENU) */}
        <div className="flex justify-between items-center px-1 mb-5 mt-2">
          {/* Left top keys */}
          <div className="flex flex-col gap-5 w-auto">
             <div className="flex flex-col items-center justify-end relative h-8">
               <div className="absolute top-[-14px] text-[10px] font-bold text-yellow-500 tracking-tight">SHIFT</div>
               <button onClick={() => {setIsShiftActive(!isShiftActive); setIsAlphaActive(false)}} className="w-[50px] h-7 bg-[#f8fafc] rounded-full shadow-[0_3px_0_0_#cbd5e1] active:translate-y-[2px] active:shadow-none transition-all"></button>
             </div>
             <div className="flex flex-col items-center justify-end relative h-8">
               <div className="absolute top-[-14px] text-[10px] font-bold text-cyan-400 tracking-tight">ALPHA</div>
               <button onClick={() => {setIsAlphaActive(!isAlphaActive); setIsShiftActive(false)}} className="w-[50px] h-7 bg-[#f8fafc] rounded-full shadow-[0_3px_0_0_#cbd5e1] active:translate-y-[2px] active:shadow-none transition-all"></button>
             </div>
          </div>

          {/* D-Pad */}
          <div className="relative w-[110px] h-[80px] bg-[#222428] rounded-[40px] shadow-[0_5px_10px_rgba(0,0,0,0.5),inset_0_2px_5px_rgba(255,255,255,0.1)] border border-[#111] flex items-center justify-center">
             {/* Center inner */}
             <div className="w-[90px] h-[60px] bg-[#1a1c1e] rounded-[30px] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)] relative">
                <button onClick={() => {}} className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-7 flex items-start justify-center pt-1 active:bg-white/5 rounded-t-[20px]">
                  <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-transparent border-b-white"></div>
                </button>
                <button onClick={() => {}} className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-7 flex items-end justify-center pb-1 active:bg-white/5 rounded-b-[20px]">
                  <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-transparent border-t-white"></div>
                </button>
                <button onClick={() => {}} className="absolute left-0 top-1/2 -translate-y-1/2 w-7 h-10 flex items-center justify-start pl-1 active:bg-white/5 rounded-l-[20px]">
                  <div className="w-0 h-0 border-t-[4px] border-b-[4px] border-r-[6px] border-transparent border-r-white"></div>
                </button>
                <button onClick={() => {}} className="absolute right-0 top-1/2 -translate-y-1/2 w-7 h-10 flex items-center justify-end pr-1 active:bg-white/5 rounded-r-[20px]">
                  <div className="w-0 h-0 border-t-[4px] border-b-[4px] border-l-[6px] border-transparent border-l-white"></div>
                </button>
             </div>
          </div>

          {/* Right top keys */}
          <div className="flex flex-col gap-5 w-auto">
             <div className="flex flex-col items-center justify-end relative h-8">
               <button onClick={handleClear} className="w-[50px] h-7 bg-[#1d4ed8] text-white text-[11px] font-bold rounded-full shadow-[0_3px_0_0_#1e3a8a] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center">ON</button>
             </div>
             <div className="flex flex-col items-center justify-end relative h-8">
               <div className="absolute top-[-14px] text-[10px] font-bold text-yellow-500 tracking-tight whitespace-nowrap">SET-UP</div>
               <button onClick={() => {}} className="w-[50px] h-7 bg-[#f8fafc] text-black text-[11px] font-bold rounded-full shadow-[0_3px_0_0_#cbd5e1] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center">MENU</button>
             </div>
          </div>
        </div>

        {/* Function Keys Grid - 6 columns */}
        <div className="grid grid-cols-6 gap-x-[6px] gap-y-5 mb-5 px-1 overflow-visible">
          {/* Top functions */}
          <Button isFunction label="CALC" onClick={() => handleKey({ shiftAction: handleSolveMode, action: handleCalcMode, alphaVar: '=' })} shiftLabel="SOLVE =" alphaLabel="=" />
          <Button isFunction label="∫□" onClick={() => handleKey({ val: '∫' })} shiftLabel="d/dx" alphaLabel=":" />
          <Button isFunction label={<span className="italic font-serif text-lg leading-none mt-[-4px]">x</span>} onClick={() => handleKey({ val: 'x' })} shiftLabel="x!" alphaLabel="x̄" />
          <Button isFunction label="x⁻¹" onClick={() => handleKey({ val: '^-1' })} shiftLabel="Σ" alphaLabel="Π" />
          <Button isFunction label={<span>log<sub className="text-[9px]">□</sub>□</span>} onClick={() => handleKey({ val: 'log(' })} />
          <Button isFunction label="OPTN" onClick={() => {}} />

          {/* Middle functions */}
          <Button isFunction label={<span className="text-[12px]">믐</span>} onClick={() => handleKey({ val: '/' })} shiftLabel={<span>□믐</span>} />
          <Button isFunction label="√□" onClick={() => handleKey({ val: 'sqrt(' })} shiftLabel="³√□" />
          <Button isFunction label="x²" onClick={() => handleKey({ val: '^2' })} shiftLabel="x³" alphaLabel="DEC" />
          <Button isFunction label="x□" onClick={() => handleKey({ val: '^' })} shiftLabel="x√□" alphaLabel="HEX" />
          <Button isFunction label="log" onClick={() => handleKey({ val: 'log(' })} shiftLabel="10□" alphaLabel="BIN" />
          <Button isFunction label="ln" onClick={() => handleKey({ val: 'ln(' })} shiftLabel="e□" alphaLabel="OCT" />
          
          {/* Trigo and extras */}
          <Button isFunction label="(-)" onClick={() => handleKey({ val: '-', alphaVar: 'A' })} shiftLabel="∠" alphaLabel="A" />
          <Button isFunction label="° ' &quot;" onClick={() => handleKey({ val: '', alphaVar: 'B' })} shiftLabel="←" alphaLabel="B" />
          <Button isFunction label="Abs" onClick={() => handleKey({ val: 'abs(', alphaVar: 'C' })} shiftLabel="hyp" alphaLabel="C" />
          <Button isFunction label="sin" onClick={() => handleKey({ val: 'sin(', alphaVar: 'D' })} shiftLabel="sin⁻¹" alphaLabel="D" />
          <Button isFunction label="cos" onClick={() => handleKey({ val: 'cos(', alphaVar: 'E' })} shiftLabel="cos⁻¹" alphaLabel="E" />
          <Button isFunction label="tan" onClick={() => handleKey({ val: 'tan(', alphaVar: 'F' })} shiftLabel="tan⁻¹" alphaLabel="F" />
          
          {/* Bottom functions */}
          <Button isFunction label="RCL" onClick={() => handleKey({ shiftAction: () => setActiveMode('STO') })} shiftLabel="STO" />
          <Button isFunction label="ENG" onClick={() => handleKey({ val: '', alphaVar: 'G' })} shiftLabel="←" alphaLabel="i" />
          <Button isFunction label="(" onClick={() => handleKey({ val: '(' })} shiftLabel="%" alphaLabel="," />
          <Button isFunction label=")" onClick={() => handleKey({ val: ')', alphaVar: 'X' })} shiftLabel="" alphaLabel="X" />
          <Button isFunction label="S⇔D" onClick={() => handleKey({ val: '', alphaVar: 'Y' })} shiftLabel={<span>a<sup className="text-[6px]">b/c</sup>⇔<sup className="text-[6px]">d/c</sup></span>} alphaLabel="Y" />
          <Button isFunction label="M+" onClick={() => handleKey({ val: '', alphaVar: 'M' })} shiftLabel="M-" alphaLabel="M" />
        </div>

        {/* Separator / Branding area */}
        <div className="flex justify-between px-2 text-[8px] font-bold text-gray-500 mb-1 mt-1 font-sans tracking-tight">
           <div>CONST <span className="text-yellow-600">CONV</span></div>
           <div className="text-center ml-4">RESET <span className="text-yellow-600">INS</span> <span className="text-yellow-600">UNDO</span></div>
           <div><span className="text-yellow-600">OFF</span></div>
        </div>

        {/* Number & Operations Grid - 5 columns */}
        <div className="grid grid-cols-5 gap-x-3 gap-y-4 px-1 flex-1 items-end pb-2 overflow-visible">
          <Button label={<span className="text-lg">7</span>} onClick={() => handleKey({ val: '7' })} shiftLabel="CONST" />
          <Button label={<span className="text-lg">8</span>} onClick={() => handleKey({ val: '8' })} shiftLabel="CONV" />
          <Button label={<span className="text-lg">9</span>} onClick={() => handleKey({ val: '9' })} shiftLabel="RESET" />
          <Button isSpecial label="DEL" onClick={handleBackspace} shiftLabel="INS" alphaLabel="UNDO" />
          <Button isSpecial label="AC" onClick={handleClear} shiftLabel="OFF" />

          <Button label={<span className="text-lg">4</span>} onClick={() => handleKey({ val: '4' })} />
          <Button label={<span className="text-lg">5</span>} onClick={() => handleKey({ val: '5' })} />
          <Button label={<span className="text-lg">6</span>} onClick={() => handleKey({ val: '6' })} />
          <Button label={<span className="text-xl">×</span>} onClick={() => handleKey({ val: '×' })} shiftLabel="nPr" />
          <Button label={<span className="text-xl">÷</span>} onClick={() => handleKey({ val: '÷' })} shiftLabel="nCr" />

          <Button label={<span className="text-lg">1</span>} onClick={() => handleKey({ val: '1' })} />
          <Button label={<span className="text-lg">2</span>} onClick={() => handleKey({ val: '2' })} />
          <Button label={<span className="text-lg">3</span>} onClick={() => handleKey({ val: '3' })} />
          <Button label={<span className="text-xl">+</span>} onClick={() => handleKey({ val: '+' })} shiftLabel="Pol" />
          <Button label={<span className="text-xl">-</span>} onClick={() => handleKey({ val: '-' })} shiftLabel="Rec" />

          <Button label={<span className="text-lg">0</span>} onClick={() => handleKey({ val: '0' })} shiftLabel="Rnd" />
          <Button label={<span className="text-xl font-serif">.</span>} onClick={() => handleKey({ val: '.' })} shiftLabel="Ran#" alphaLabel="RanInt" />
          <Button label={<span className="text-[13px]">×10<sup className="text-[8px]">x</sup></span>} onClick={() => handleKey({ val: '×10^' })} shiftLabel={<span className="text-[14px]">π</span>} alphaLabel={<span className="text-[14px] font-serif text-cyan-400">e</span>} />
          <Button label="Ans" onClick={() => handleKey({ val: 'Ans' })} shiftLabel="PreAns" />
          <Button label={<span className="text-xl">=</span>} className="font-bold text-lg" onClick={handleEquals} shiftLabel="≈" />
        </div>
      </div>
    </motion.div>
  );
};
