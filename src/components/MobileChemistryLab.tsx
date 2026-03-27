import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Beaker, Flame, Zap, Droplets, Info, RefreshCw, CheckCircle2, AlertTriangle, X, ArrowDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { fixLatex } from '../utils/latexHelper';
import { cn } from '../lib/utils';

// --- Types & Data ---
type StateType = 'solid' | 'liquid' | 'gas';
type RoleType = 'Chất khử' | 'Chất oxi hóa' | 'Môi trường' | 'Chất xúc tác';

interface Chemical {
  id: string;
  name: string;
  formula: string;
  state: StateType;
  color: string;
  role: RoleType;
  desc: string;
}

const CHEMICALS: Record<string, Chemical> = {
  'CuO': { id: 'CuO', name: 'Đồng(II) oxit', formula: '$\\mathrm{CuO}$', state: 'solid', color: '#1a1a1a', role: 'Chất oxi hóa', desc: 'Chất rắn màu đen' },
  'CO': { id: 'CO', name: 'Cacbon monoxit', formula: '$\\mathrm{CO}$', state: 'gas', color: '#e2e8f0', role: 'Chất khử', desc: 'Khí không màu' },
  'Fe': { id: 'Fe', name: 'Sắt', formula: '$\\mathrm{Fe}$', state: 'solid', color: '#71717a', role: 'Chất khử', desc: 'Kim loại màu xám' },
  'CuSO4': { id: 'CuSO4', name: 'Đồng(II) sunfat', formula: '$\\mathrm{CuSO}_4$', state: 'liquid', color: '#3b82f6', role: 'Chất oxi hóa', desc: 'Dung dịch màu xanh lam' },
  'CuCl2': { id: 'CuCl2', name: 'Đồng(II) clorua', formula: '$\\mathrm{CuCl}_2$', state: 'liquid', color: '#0ea5e9', role: 'Chất oxi hóa', desc: 'Dung dịch màu xanh lục' },
  'Al2O3': { id: 'Al2O3', name: 'Nhôm oxit', formula: '$\\mathrm{Al}_2\\mathrm{O}_3$', state: 'liquid', color: '#f8fafc', role: 'Chất oxi hóa', desc: 'Trạng thái nóng chảy' },
};

type MethodType = 'nhiet_luyen' | 'thuy_luyen' | 'dien_phan';

interface Reaction {
  reactants: string[];
  method: MethodType;
  products: { formula: string; name: string; state: StateType; color: string }[];
  equation: string;
  note: string;
  animationType: 'color_change' | 'plating' | 'electrolysis';
}

const REACTIONS: Reaction[] = [
  {
    reactants: ['CuO', 'CO'],
    method: 'nhiet_luyen',
    products: [
      { formula: '$\\mathrm{Cu}$', name: 'Đồng', state: 'solid', color: '#b91c1c' },
      { formula: '$\\mathrm{CO}_2$', name: 'Cacbon đioxit', state: 'gas', color: '#ffffff' }
    ],
    equation: '$$\\mathrm{CuO} + \\mathrm{CO} \\xrightarrow{t^o} \\mathrm{Cu} + \\mathrm{CO}_2$$',
    note: 'Chất rắn màu đen (CuO) chuyển dần sang màu đỏ (Cu). Khí CO2 thoát ra.',
    animationType: 'color_change'
  },
  {
    reactants: ['Fe', 'CuSO4'],
    method: 'thuy_luyen',
    products: [
      { formula: '$\\mathrm{FeSO}_4$', name: 'Sắt(II) sunfat', state: 'liquid', color: '#86efac' },
      { formula: '$\\mathrm{Cu}$', name: 'Đồng', state: 'solid', color: '#b91c1c' }
    ],
    equation: '$$\\mathrm{Fe} + \\mathrm{CuSO}_4 \\rightarrow \\mathrm{FeSO}_4 + \\mathrm{Cu} \\downarrow$$',
    note: 'Kim loại màu đỏ (Cu) bám ngoài đinh sắt. Dung dịch nhạt màu xanh dần.',
    animationType: 'plating'
  },
  {
    reactants: ['CuCl2'],
    method: 'dien_phan',
    products: [
      { formula: '$\\mathrm{Cu}$', name: 'Đồng', state: 'solid', color: '#b91c1c' },
      { formula: '$\\mathrm{Cl}_2$', name: 'Clo', state: 'gas', color: '#bef264' }
    ],
    equation: '$$\\mathrm{CuCl}_2 \\xrightarrow{\\mathrm{đpdd}} \\mathrm{Cu} + \\mathrm{Cl}_2 \\uparrow$$',
    note: 'Kim loại đồng (đỏ) bám ở catot (-). Khí màu vàng lục (Cl2) thoát ra ở anot (+).',
    animationType: 'electrolysis'
  }
];

// --- Audio Helper ---
const playSound = (type: 'error' | 'success' | 'sizzle' | 'bubble') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    if (type === 'error') {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'success') {
      if (navigator.vibrate) navigator.vibrate(200);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {
    console.log('Audio not supported');
  }
};

// --- Canvas Engine ---
class Particle {
  x: number; y: number; vx: number; vy: number;
  color: string; size: number; life: number; maxLife: number;
  type: 'solid' | 'bubble' | 'gas';

  constructor(x: number, y: number, color: string, type: 'solid' | 'bubble' | 'gas') {
    this.x = x; this.y = y; this.color = color; this.type = type;
    this.size = type === 'solid' ? Math.random() * 3 + 2 : Math.random() * 4 + 2;
    this.life = 0;
    this.maxLife = type === 'solid' ? 1000 : Math.random() * 100 + 50;
    
    if (type === 'solid') {
      this.vx = (Math.random() - 0.5) * 2;
      this.vy = Math.random() * 2 + 2;
    } else if (type === 'bubble') {
      this.vx = (Math.random() - 0.5) * 1;
      this.vy = -(Math.random() * 2 + 1);
    } else {
      this.vx = (Math.random() - 0.5) * 2;
      this.vy = -(Math.random() * 3 + 2);
    }
  }

  update(bounds: { width: number, height: number, liquidLevel: number }) {
    this.x += this.vx;
    this.y += this.vy;
    this.life++;

    if (this.type === 'solid') {
      if (this.y > bounds.height - this.size - 10) {
        this.y = bounds.height - this.size - 10;
        this.vy = 0;
        this.vx = 0;
      }
    } else if (this.type === 'bubble') {
      if (this.y < bounds.liquidLevel) {
        this.life = this.maxLife;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    if (this.type === 'bubble') {
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
    } else if (this.type === 'gas') {
      ctx.globalAlpha = Math.max(0, 1 - (this.life / this.maxLife));
      ctx.fill();
      ctx.globalAlpha = 1.0;
    } else {
      ctx.fill();
    }
  }
}

export default function MobileChemistryLab() {
  const [selectedChemicals, setSelectedChemicals] = useState<string[]>([]);
  const [activeMethod, setActiveMethod] = useState<MethodType | null>(null);
  const [reactionState, setReactionState] = useState<'idle' | 'pouring' | 'reacting' | 'success' | 'error'>('idle');
  const [labNote, setLabNote] = useState<Reaction | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ id: string, x: number, y: number } | null>(null);
  const [shake, setShake] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const waveOffsetRef = useRef(0);

  // Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw Flask Background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Determine contents
      const hasLiquid = selectedChemicals.some(id => CHEMICALS[id].state === 'liquid');
      const liquidColor = hasLiquid ? CHEMICALS[selectedChemicals.find(id => CHEMICALS[id].state === 'liquid')!].color : 'transparent';
      const liquidLevel = hasLiquid ? canvas.height * 0.4 : canvas.height;

      // Draw Liquid with Wave
      if (hasLiquid) {
        waveOffsetRef.current += 0.05;
        ctx.beginPath();
        ctx.moveTo(0, liquidLevel);
        for (let x = 0; x <= canvas.width; x += 10) {
          const y = liquidLevel + Math.sin(x * 0.05 + waveOffsetRef.current) * 5;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        
        // Create gradient for liquid
        const gradient = ctx.createLinearGradient(0, liquidLevel, 0, canvas.height);
        gradient.addColorStop(0, `${liquidColor}88`);
        gradient.addColorStop(1, `${liquidColor}dd`);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Update and Draw Particles
      particlesRef.current = particlesRef.current.filter(p => p.life < p.maxLife);
      particlesRef.current.forEach(p => {
        p.update({ width: canvas.width, height: canvas.height, liquidLevel });
        p.draw(ctx);
      });

      // Method Animations
      if (reactionState === 'reacting') {
        if (activeMethod === 'dien_phan') {
          // Add bubbles
          if (Math.random() > 0.5) {
            particlesRef.current.push(new Particle(canvas.width / 2 + (Math.random() * 40 - 20), canvas.height - 20, '#ffffff', 'bubble'));
          }
          // Add gas if reaction matches
          const reaction = REACTIONS.find(r => r.method === 'dien_phan' && r.reactants.every(re => selectedChemicals.includes(re)));
          if (reaction) {
            const gasProduct = reaction.products.find(p => p.state === 'gas');
            if (gasProduct && Math.random() > 0.7) {
              particlesRef.current.push(new Particle(canvas.width / 2, liquidLevel, gasProduct.color, 'gas'));
            }
          }
        }
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [selectedChemicals, reactionState, activeMethod]);

  const handleAddChemical = (id: string) => {
    if (reactionState !== 'idle' && reactionState !== 'error') return;
    if (selectedChemicals.includes(id)) return;
    
    setReactionState('pouring');
    setSelectedChemicals(prev => [...prev, id]);
    
    // Add pouring particles
    const chem = CHEMICALS[id];
    if (chem.state === 'solid') {
      for (let i = 0; i < 30; i++) {
        setTimeout(() => {
          particlesRef.current.push(new Particle(150 + Math.random() * 20, 0, chem.color, 'solid'));
        }, i * 50);
      }
    }
    
    setTimeout(() => setReactionState('idle'), 1500);
  };

  const handleMethod = (method: MethodType) => {
    if (selectedChemicals.length === 0) return;
    setActiveMethod(method);
    setReactionState('reacting');

    // Check reaction logic
    const reaction = REACTIONS.find(r => 
      r.method === method && 
      r.reactants.length === selectedChemicals.length &&
      r.reactants.every(re => selectedChemicals.includes(re))
    );

    setTimeout(() => {
      if (reaction) {
        playSound('success');
        setReactionState('success');
        setLabNote(reaction);
        
        // Apply visual changes based on reaction
        if (reaction.animationType === 'color_change' || reaction.animationType === 'plating') {
          // Change solid particles color
          particlesRef.current.forEach(p => {
            if (p.type === 'solid') p.color = reaction.products.find(pr => pr.state === 'solid')?.color || p.color;
          });
        }
      } else {
        playSound('error');
        setReactionState('error');
        setErrorMsg('Điều kiện phản ứng không thỏa mãn hoặc sai phương pháp!');
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
      setActiveMethod(null);
    }, 3000);
  };

  const resetLab = () => {
    setSelectedChemicals([]);
    setActiveMethod(null);
    setReactionState('idle');
    setLabNote(null);
    setErrorMsg(null);
    particlesRef.current = [];
  };

  return (
    <section className="py-20 bg-[#0a0f14] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Phòng thí nghiệm Ảo (Mobile First)</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Trải nghiệm thực hành hóa học ngay trên điện thoại của bạn. Chọn hóa chất và phương pháp để xem phản ứng.
          </p>
        </div>

        <div className="max-w-md mx-auto bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative">
          <div className="flex flex-col h-[600px] text-slate-200 font-sans">
            
            {/* Top Area: Flask & Visuals */}
            <div className="flex-1 relative flex items-center justify-center p-4 bg-[#0a0f14]">
              <motion.div 
                animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="relative w-full max-w-[250px] aspect-square"
              >
                {/* SVG Flask Outline */}
                <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full z-10 pointer-events-none drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                  <path d="M70,20 L130,20 L130,60 L170,160 A20,20 0 0,1 150,190 L50,190 A20,20 0 0,1 30,160 L70,60 Z" 
                        fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="4" strokeLinejoin="round"/>
                  <path d="M60,30 L140,30" stroke="rgba(255,255,255,0.2)" strokeWidth="2"/>
                </svg>

                {/* Canvas for content */}
                <div className="absolute inset-0 z-0" style={{ clipPath: 'polygon(35% 10%, 65% 10%, 65% 30%, 85% 80%, 75% 95%, 25% 95%, 15% 80%, 35% 30%)' }}>
                  <canvas 
                    ref={canvasRef} 
                    width={250} 
                    height={250} 
                    className="w-full h-full"
                  />
                </div>

                {/* Method Overlays */}
                <AnimatePresence>
                  {activeMethod === 'nhiet_luyen' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-orange-500"
                    >
                      <Flame className="w-16 h-16 animate-pulse" fill="currentColor" />
                    </motion.div>
                  )}
                  {activeMethod === 'dien_phan' && (
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <div className="w-2 h-32 bg-slate-400 absolute left-1/3 top-1/4 rounded-full border-2 border-slate-600" />
                      <div className="w-2 h-32 bg-slate-400 absolute right-1/3 top-1/4 rounded-full border-2 border-slate-600" />
                      <Zap className="w-12 h-12 text-yellow-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Pouring Arrow */}
                <AnimatePresence>
                  {reactionState === 'pouring' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="absolute -top-16 left-1/2 -translate-x-1/2 text-teal-400"
                    >
                      <ArrowDown className="w-12 h-12 animate-bounce" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Floating Tooltip */}
              <AnimatePresence>
                {tooltip && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    className="absolute z-50 bg-slate-800 border border-slate-700 p-3 rounded-xl shadow-2xl pointer-events-none"
                    style={{ left: tooltip.x, top: tooltip.y - 80, transform: 'translateX(-50%)' }}
                  >
                    <div className="text-sm font-bold text-white mb-1">{CHEMICALS[tooltip.id].name}</div>
                    <div className="text-xs text-slate-300">Vai trò: <span className="text-teal-400">{CHEMICALS[tooltip.id].role}</span></div>
                    <div className="text-xs text-slate-300">Trạng thái: <span className="text-blue-400">{CHEMICALS[tooltip.id].state}</span></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Middle Area: Methods & Actions */}
            <div className="px-4 py-3 flex items-center justify-between border-t border-white/10 bg-slate-900">
              <div className="flex gap-3">
                <button 
                  onClick={() => handleMethod('nhiet_luyen')}
                  disabled={reactionState !== 'idle'}
                  className="min-w-[44px] min-h-[44px] p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 active:bg-orange-500/40 disabled:opacity-50 flex items-center justify-center"
                >
                  <Flame className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => handleMethod('thuy_luyen')}
                  disabled={reactionState !== 'idle'}
                  className="min-w-[44px] min-h-[44px] p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 active:bg-blue-500/40 disabled:opacity-50 flex items-center justify-center"
                >
                  <Droplets className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => handleMethod('dien_phan')}
                  disabled={reactionState !== 'idle'}
                  className="min-w-[44px] min-h-[44px] p-2 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 active:bg-yellow-500/40 disabled:opacity-50 flex items-center justify-center"
                >
                  <Zap className="w-6 h-6" />
                </button>
              </div>
              <button 
                onClick={resetLab}
                className="min-w-[44px] min-h-[44px] p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 active:bg-slate-700 flex items-center justify-center"
              >
                <RefreshCw className="w-6 h-6" />
              </button>
            </div>

            {/* Bottom Area: Chemical Cabinet (Horizontal Scroll) */}
            <div className="h-36 bg-slate-950 border-t border-white/10 p-4 overflow-x-auto flex gap-4 snap-x hide-scrollbar">
              {Object.values(CHEMICALS).map(chem => (
                <div
                  key={chem.id}
                  onClick={() => handleAddChemical(chem.id)}
                  onPointerDown={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({ id: chem.id, x: rect.left + rect.width / 2, y: rect.top });
                  }}
                  onPointerUp={() => setTooltip(null)}
                  onPointerLeave={() => setTooltip(null)}
                  role="button"
                  tabIndex={0}
                  className={cn(
                    "snap-center shrink-0 w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer",
                    (reactionState !== 'idle' && reactionState !== 'error') ? "opacity-50 pointer-events-none" : "",
                    selectedChemicals.includes(chem.id) 
                      ? "border-teal-500 bg-teal-500/10 opacity-50" 
                      : "border-slate-700 bg-slate-800 active:border-teal-400 active:bg-slate-700"
                  )}
                >
                  <div 
                    className="w-8 h-8 rounded-full border border-white/20 shadow-inner"
                    style={{ backgroundColor: chem.color }}
                  />
                  <div className="text-sm font-bold">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {fixLatex(chem.formula)}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>

            {/* Modals */}
            <AnimatePresence>
              {reactionState === 'error' && errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                  className="absolute bottom-40 left-4 right-4 bg-red-500/90 backdrop-blur text-white p-4 rounded-2xl shadow-2xl border border-red-400 flex items-start gap-3 z-50"
                >
                  <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-bold mb-1">Phản ứng thất bại</h4>
                    <p className="text-sm text-red-100">{errorMsg}</p>
                  </div>
                  <button onClick={() => setReactionState('idle')} className="p-1 active:bg-red-600 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </motion.div>
              )}

              {reactionState === 'success' && labNote && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-4 z-50 bg-slate-900 border border-teal-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                >
                  <div className="bg-teal-500/20 p-4 border-b border-teal-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-teal-400 font-bold">
                      <CheckCircle2 className="w-6 h-6" />
                      <span>Lab Note: Thành công!</span>
                    </div>
                    <button onClick={() => setReactionState('idle')} className="p-2 active:bg-teal-500/30 rounded-xl text-slate-300">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="p-6 flex-1 overflow-y-auto">
                    <div className="mb-6">
                      <h4 className="text-sm text-slate-400 mb-2 uppercase tracking-wider font-bold">Phương trình hóa học</h4>
                      <div className="bg-black/30 p-4 rounded-xl text-center overflow-x-auto">
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {fixLatex(labNote.equation)}
                        </ReactMarkdown>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="text-sm text-slate-400 mb-2 uppercase tracking-wider font-bold">Hiện tượng</h4>
                      <p className="text-slate-200 leading-relaxed">{labNote.note}</p>
                    </div>

                    <div>
                      <h4 className="text-sm text-slate-400 mb-2 uppercase tracking-wider font-bold">Sản phẩm thu được</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {labNote.products.map((p, i) => (
                          <div key={i} className="bg-slate-800 border border-slate-700 p-3 rounded-xl flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: p.color }} />
                            <div>
                              <div className="font-bold text-sm">
                                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{fixLatex(p.formula)}</ReactMarkdown>
                              </div>
                              <div className="text-xs text-slate-400">{p.name}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-slate-800">
                    <button 
                      onClick={resetLab}
                      className="w-full py-3 bg-teal-500 text-white font-bold rounded-xl active:bg-teal-600 transition-colors"
                    >
                      Làm thí nghiệm mới
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <style>{`
              .hide-scrollbar::-webkit-scrollbar {
                display: none;
              }
              .hide-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}</style>
          </div>
        </div>
      </div>
    </section>
  );
}
