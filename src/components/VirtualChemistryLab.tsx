import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Beaker, Zap, Flame, Droplets, AlertTriangle, CheckCircle2, Play, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import { ScrollReveal } from '../App';

// --- 1. HỆ THỐNG DỮ LIỆU HÓA CHẤT (DATA SCHEMA) ---

type ChemicalState = 'liquid' | 'solid' | 'gas';
type ChemicalType = 'reactant' | 'catalyst' | 'result';

interface Chemical {
  id: string;
  name: string;
  formula: string;
  state: ChemicalState;
  color: string;
  type: ChemicalType;
  visualProps: {
    opacity?: number;
    density?: number;
    particleSize?: number;
    particleShape?: 'circle' | 'square' | 'crystal';
  };
}

const CHEMICALS: Record<string, Chemical> = {
  // Chất đầu (Reactants)
  'MgCl2': { id: 'MgCl2', name: 'Magie Clorua', formula: '$MgCl_2$', state: 'solid', color: '#f8fafc', type: 'reactant', visualProps: { opacity: 1, particleSize: 3, particleShape: 'crystal' } },
  'NaCl': { id: 'NaCl', name: 'Natri Clorua', formula: '$NaCl$', state: 'solid', color: '#ffffff', type: 'reactant', visualProps: { opacity: 1, particleSize: 2, particleShape: 'crystal' } },
  'Fe2O3': { id: 'Fe2O3', name: 'Sắt(III) Oxit', formula: '$Fe_2O_3$', state: 'solid', color: '#7c2d12', type: 'reactant', visualProps: { opacity: 1, particleSize: 4, particleShape: 'circle' } },
  'CuO': { id: 'CuO', name: 'Đồng(II) Oxit', formula: '$CuO$', state: 'solid', color: '#1a1a1a', type: 'reactant', visualProps: { opacity: 1, particleSize: 3, particleShape: 'circle' } },
  'CuSO4': { id: 'CuSO4', name: 'Đồng(II) Sunfat', formula: '$CuSO_4$', state: 'liquid', color: '#3b82f6', type: 'reactant', visualProps: { opacity: 0.6, density: 1.2 } },
  'AgNO3': { id: 'AgNO3', name: 'Bạc Nitrat', formula: '$AgNO_3$', state: 'liquid', color: '#e2e8f0', type: 'reactant', visualProps: { opacity: 0.3, density: 1.1 } },
  'Al2O3': { id: 'Al2O3', name: 'Nhôm Oxit', formula: '$Al_2O_3$', state: 'solid', color: '#f1f5f9', type: 'reactant', visualProps: { opacity: 1, particleSize: 4, particleShape: 'circle' } },
  'Criolit': { id: 'Criolit', name: 'Criolit', formula: '$Na_3AlF_6$', state: 'solid', color: '#f8fafc', type: 'catalyst', visualProps: { opacity: 1, particleSize: 2, particleShape: 'crystal' } },
  'CuCl2': { id: 'CuCl2', name: 'Đồng(II) Clorua', formula: '$CuCl_2$', state: 'liquid', color: '#22c55e', type: 'reactant', visualProps: { opacity: 0.6, density: 1.2 } },
  'C': { id: 'C', name: 'Cacbon', formula: '$C$', state: 'solid', color: '#000000', type: 'catalyst', visualProps: { opacity: 1, particleSize: 3, particleShape: 'square' } },
  'CO': { id: 'CO', name: 'Cacbon Monoxit', formula: '$CO$', state: 'gas', color: '#cbd5e1', type: 'catalyst', visualProps: { opacity: 0.2 } },
  'H2': { id: 'H2', name: 'Hydro', formula: '$H_2$', state: 'gas', color: '#f1f5f9', type: 'catalyst', visualProps: { opacity: 0.1 } },
  'Al_cat': { id: 'Al_cat', name: 'Nhôm', formula: '$Al$', state: 'solid', color: '#94a3b8', type: 'catalyst', visualProps: { opacity: 1, particleSize: 4, particleShape: 'square' } },
  'Fe': { id: 'Fe', name: 'Sắt', formula: '$Fe$', state: 'solid', color: '#475569', type: 'catalyst', visualProps: { opacity: 1, particleSize: 5, particleShape: 'square' } },
  'Zn': { id: 'Zn', name: 'Kẽm', formula: '$Zn$', state: 'solid', color: '#64748b', type: 'catalyst', visualProps: { opacity: 1, particleSize: 4, particleShape: 'square' } },
  
  // Sản phẩm (Results)
  'Mg': { id: 'Mg', name: 'Magie', formula: '$Mg$', state: 'solid', color: '#cbd5e1', type: 'result', visualProps: { opacity: 1 } },
  'Na': { id: 'Na', name: 'Natri', formula: '$Na$', state: 'solid', color: '#e2e8f0', type: 'result', visualProps: { opacity: 1 } },
  'Cu': { id: 'Cu', name: 'Đồng', formula: '$Cu$', state: 'solid', color: '#b45309', type: 'result', visualProps: { opacity: 1 } },
  'Ag': { id: 'Ag', name: 'Bạc', formula: '$Ag$', state: 'solid', color: '#f8fafc', type: 'result', visualProps: { opacity: 1 } },
  'Cl2': { id: 'Cl2', name: 'Clo', formula: '$Cl_2$', state: 'gas', color: '#bef264', type: 'result', visualProps: { opacity: 0.5 } },
  'CO2': { id: 'CO2', name: 'Cacbon Dioxit', formula: '$CO_2$', state: 'gas', color: '#f1f5f9', type: 'result', visualProps: { opacity: 0.1 } },
  'Fe_result': { id: 'Fe_result', name: 'Sắt', formula: '$Fe$', state: 'solid', color: '#475569', type: 'result', visualProps: { opacity: 1 } },
  'FeSO4': { id: 'FeSO4', name: 'Sắt(II) Sunfat', formula: '$FeSO_4$', state: 'liquid', color: '#86efac', type: 'result', visualProps: { opacity: 0.5 } },
  'ZnSO4': { id: 'ZnSO4', name: 'Kẽm Sunfat', formula: '$ZnSO_4$', state: 'liquid', color: '#f8fafc', type: 'result', visualProps: { opacity: 0.2 } },
  'Al2O3_res': { id: 'Al2O3_res', name: 'Nhôm Oxit', formula: '$Al_2O_3$', state: 'solid', color: '#f1f5f9', type: 'result', visualProps: { opacity: 1 } },
  'H2SO4': { id: 'H2SO4', name: 'Axit Sunfuric', formula: '$H_2SO_4$', state: 'liquid', color: '#fef08a', type: 'result', visualProps: { opacity: 0.3 } },
  'HNO3': { id: 'HNO3', name: 'Axit Nitric', formula: '$HNO_3$', state: 'liquid', color: '#fef08a', type: 'result', visualProps: { opacity: 0.3 } },
  'NaOH': { id: 'NaOH', name: 'Natri Hydroxit', formula: '$NaOH$', state: 'liquid', color: '#f1f5f9', type: 'result', visualProps: { opacity: 0.3 } },
  'H2_gas': { id: 'H2_gas', name: 'Hydro', formula: '$H_2$', state: 'gas', color: '#f1f5f9', type: 'result', visualProps: { opacity: 0.1 } },
  'Al': { id: 'Al', name: 'Nhôm', formula: '$Al$', state: 'solid', color: '#94a3b8', type: 'result', visualProps: { opacity: 1 } },
  'O2': { id: 'O2', name: 'Oxy', formula: '$O_2$', state: 'gas', color: '#f1f5f9', type: 'result', visualProps: { opacity: 0.1 } },
};

type Method = 'dpnc' | 'nl' | 'tl' | 'dpdd';

interface ProductInfo {
  chemical: Chemical;
  desc: string;
}

interface ReactionResult {
  success: boolean;
  message: string;
  equation?: string;
  animationType?: 'pyro' | 'hydro' | 'electro';
  products?: ProductInfo[];
  baseColorTransition?: { from: string; to: string }; // Dành cho dung dịch hoặc chất rắn nền
}

// --- 2. LOGIC PHẢN ỨNG VÀ KIỂM TRA ĐIỀU KIỆN ---

const validateReaction = (subA: string, subB: string | null, method: Method): ReactionResult => {
  const chemA = CHEMICALS[subA];
  const chemB = subB ? CHEMICALS[subB] : null;

  // 1. ĐIỆN PHÂN NÓNG CHẢY
  if (method === 'dpnc') {
    if (subA === 'Al2O3' && subB === 'Criolit') {
        return {
          success: true,
          message: 'Điện phân nóng chảy Al2O3 với Criolit tạo ra Nhôm và khí Oxy.',
          equation: '$2Al_2O_3 \\xrightarrow{đpnc, criolit} 4Al + 3O_2\\uparrow$',
          animationType: 'electro',
          products: [
            { chemical: CHEMICALS['Al'], desc: 'Kim loại nhôm bám ở catot' },
            { chemical: CHEMICALS['O2'], desc: 'Khí oxy thoát ra ở anot' }
          ]
        };
    }
    if (['MgCl2', 'NaCl'].includes(subA)) {
      if (subB) return { success: false, message: 'Điện phân nóng chảy không cần thêm chất phản ứng phụ.' };
      
      if (subA === 'MgCl2') {
        return {
          success: true,
          message: 'Điện phân nóng chảy MgCl2 tạo ra Magie và khí Clo.',
          equation: '$MgCl_2 \\xrightarrow{đpnc} Mg + Cl_2\\uparrow$',
          animationType: 'electro',
          products: [
            { chemical: CHEMICALS['Mg'], desc: 'Kim loại trắng bạc bám ở catot' },
            { chemical: CHEMICALS['Cl2'], desc: 'Khí màu vàng lục thoát ra ở anot' }
          ]
        };
      }
      if (subA === 'NaCl') {
        return {
          success: true,
          message: 'Điện phân nóng chảy NaCl tạo ra Natri và khí Clo.',
          equation: '$2NaCl \\xrightarrow{đpnc} 2Na + Cl_2\\uparrow$',
          animationType: 'electro',
          products: [
            { chemical: CHEMICALS['Na'], desc: 'Kim loại trắng bạc bám ở catot' },
            { chemical: CHEMICALS['Cl2'], desc: 'Khí màu vàng lục thoát ra ở anot' }
          ]
        };
      }
    }
    return { 
      success: false, 
      message: `Phương pháp Điện phân nóng chảy chỉ dùng cho hợp chất của kim loại mạnh (K, Na, Ca, Mg, Al). ${subA === 'Al2O3' && subB !== 'Criolit' ? 'Cần thêm Criolit để hạ nhiệt độ nóng chảy.' : 'Không thể áp dụng cho ' + chemA.name + '.'}` 
    };
  }

  // 2. ĐIỆN PHÂN DUNG DỊCH
  if (method === 'dpdd') {
      if (subB) return { success: false, message: 'Điện phân dung dịch không cần thêm chất phản ứng phụ.' };
      
      if (subA === 'CuCl2') {
        return {
          success: true,
          message: 'Điện phân dung dịch CuCl2 tạo ra Đồng và khí Clo.',
          equation: '$CuCl_2 \\xrightarrow{đpdd} Cu + Cl_2\\uparrow$',
          animationType: 'electro',
          products: [
            { chemical: CHEMICALS['Cu'], desc: 'Kim loại đồng bám ở catot' },
            { chemical: CHEMICALS['Cl2'], desc: 'Khí màu vàng lục thoát ra ở anot' }
          ]
        };
      }
      if (subA === 'CuSO4') {
        return {
          success: true,
          message: 'Điện phân dung dịch CuSO4 tạo ra Đồng, khí Oxy và Axit Sunfuric.',
          equation: '$2CuSO_4 + 2H_2O \\xrightarrow{đpdd} 2Cu + O_2\\uparrow + 2H_2SO_4$',
          animationType: 'electro',
          baseColorTransition: { from: CHEMICALS['CuSO4'].color, to: '#f1f5f9' },
          products: [
            { chemical: CHEMICALS['Cu'], desc: 'Kim loại đồng bám ở catot' },
            { chemical: CHEMICALS['O2'], desc: 'Khí oxy thoát ra ở anot' },
            { chemical: CHEMICALS['H2SO4'], desc: 'Dung dịch axit' }
          ]
        };
      }
      if (subA === 'AgNO3') {
        return {
          success: true,
          message: 'Điện phân dung dịch AgNO3 tạo ra Bạc, khí Oxy và Axit Nitric.',
          equation: '$4AgNO_3 + 2H_2O \\xrightarrow{đpdd} 4Ag + O_2\\uparrow + 4HNO_3$',
          animationType: 'electro',
          products: [
            { chemical: CHEMICALS['Ag'], desc: 'Kim loại bạc bám ở catot' },
            { chemical: CHEMICALS['O2'], desc: 'Khí oxy thoát ra ở anot' },
            { chemical: CHEMICALS['HNO3'], desc: 'Dung dịch axit' }
          ]
        };
      }
      if (subA === 'NaCl') {
        return {
          success: true,
          message: 'Điện phân dung dịch NaCl có màng ngăn tạo ra NaOH, Hydro và Clo.',
          equation: '$2NaCl + 2H_2O \\xrightarrow{đpdd, màng ngăn} 2NaOH + H_2\\uparrow + Cl_2\\uparrow$',
          animationType: 'electro',
          products: [
            { chemical: CHEMICALS['NaOH'], desc: 'Dung dịch kiềm' },
            { chemical: CHEMICALS['H2_gas'], desc: 'Khí hydro thoát ra' },
            { chemical: CHEMICALS['Cl2'], desc: 'Khí clo thoát ra' }
          ]
        };
      }
      return { success: false, message: 'Dung dịch này không phù hợp cho điện phân dung dịch.' };
  }

  // 2. NHIỆT LUYỆN
  if (method === 'nl') {
    if (!chemB) return { success: false, message: 'Nhiệt luyện cần có chất khử (C, CO, H2, Al).' };
    if (!['C', 'CO', 'H2', 'Al_cat'].includes(subB!)) return { success: false, message: `${chemB.name} không phải là chất khử phù hợp cho nhiệt luyện.` };
    
    if (['Fe2O3', 'CuO'].includes(subA)) {
      if (subA === 'CuO') {
        return {
          success: true,
          message: `Khử CuO (đen) bằng ${chemB.name} ở nhiệt độ cao tạo ra Cu (đỏ).`,
          equation: subB === 'CO' ? '$CuO + CO \\xrightarrow{t^\\circ} Cu + CO_2\\uparrow$' : '$CuO + C \\xrightarrow{t^\\circ} Cu + CO\\uparrow$',
          animationType: 'pyro',
          baseColorTransition: { from: CHEMICALS['CuO'].color, to: CHEMICALS['Cu'].color },
          products: [
            { chemical: CHEMICALS['Cu'], desc: 'Chất rắn màu đỏ đồng' },
            { chemical: CHEMICALS['CO2'], desc: 'Khí thoát ra' }
          ]
        };
      }
      if (subA === 'Fe2O3') {
        return {
          success: true,
          message: `Khử Fe2O3 (đỏ nâu) bằng ${chemB.name} tạo ra Fe (xám trắng).`,
          equation: subB === 'Al_cat' ? '$Fe_2O_3 + 2Al \\xrightarrow{t^\\circ} 2Fe + Al_2O_3$' : (subB === 'H2' ? '$Fe_2O_3 + 3H_2 \\xrightarrow{t^\\circ} 2Fe + 3H_2O$' : '$Fe_2O_3 + 3CO \\xrightarrow{t^\\circ} 2Fe + 3CO_2\\uparrow$'),
          animationType: 'pyro',
          baseColorTransition: { from: CHEMICALS['Fe2O3'].color, to: CHEMICALS['Fe_result'].color },
          products: [
            { chemical: CHEMICALS['Fe_result'], desc: 'Chất rắn màu xám trắng' },
            ...(subB === 'Al_cat' ? [{ chemical: CHEMICALS['Al2O3_res'], desc: 'Xỉ nhôm oxit' }] : (subB === 'H2' ? [{ chemical: { id: 'H2O', name: 'Nước', formula: '$H_2O$', state: 'liquid', color: '#e0f2fe', type: 'result', visualProps: { opacity: 0.2 } } as Chemical, desc: 'Hơi nước' }] : [{ chemical: CHEMICALS['CO2'], desc: 'Khí thoát ra' }]))
          ]
        };
      }
    }
    return { 
      success: false, 
      message: `Nhiệt luyện chỉ dùng để khử OXIT của kim loại trung bình và yếu (sau Al). ${chemA.name} không phù hợp.` 
    };
  }

  // 3. THỦY LUYỆN
  if (method === 'tl') {
    if (chemA.state !== 'liquid') return { success: false, message: 'Thủy luyện yêu cầu chất đầu phải là dung dịch muối.' };
    if (!chemB || chemB.state !== 'solid') return { success: false, message: 'Cần một kim loại mạnh hơn ở dạng rắn để đẩy kim loại yếu ra khỏi muối.' };
    
    if (subA === 'CuSO4') {
      if (['Fe', 'Zn', 'Al'].includes(subB!)) {
        return {
          success: true,
          message: `${chemB.name} đẩy Đồng ra khỏi dung dịch CuSO4.`,
          equation: `$${subB} + CuSO_4 \\rightarrow ${subB}SO_4 + Cu\\downarrow$`,
          animationType: 'hydro',
          baseColorTransition: { from: CHEMICALS['CuSO4'].color, to: subB === 'Fe' ? CHEMICALS['FeSO4'].color : CHEMICALS['ZnSO4'].color },
          products: [
            { chemical: CHEMICALS['Cu'], desc: 'Kim loại màu đỏ bám ngoài thanh kim loại' },
            { chemical: CHEMICALS[`${subB}SO4`] || CHEMICALS['ZnSO4'], desc: 'Dung dịch muối mới' }
          ]
        };
      }
      return { success: false, message: `${chemB.name} không đẩy được Đồng hoặc phản ứng không phù hợp.` };
    }
    
    if (subA === 'AgNO3') {
      if (['Fe', 'Zn', 'Cu'].includes(subB!)) {
        return {
          success: true,
          message: `${chemB.name} đẩy Bạc ra khỏi dung dịch AgNO3.`,
          equation: `$${subB} + nAgNO_3 \\rightarrow ${subB}(NO_3)_n + nAg\\downarrow$`,
          animationType: 'hydro',
          baseColorTransition: { from: CHEMICALS['AgNO3'].color, to: subB === 'Cu' ? CHEMICALS['CuSO4'].color : CHEMICALS['ZnSO4'].color },
          products: [
            { chemical: CHEMICALS['Ag'], desc: 'Lớp bạc trắng sáng bám ngoài thanh kim loại' }
          ]
        };
      }
    }

    return { 
      success: false, 
      message: 'Kim loại dùng làm chất khử phải mạnh hơn kim loại trong muối và không tác dụng với nước ở điều kiện thường.' 
    };
  }

  return { success: false, message: 'Vui lòng chọn đầy đủ hóa chất và phương pháp.' };
};

// --- 3. CANVAS PARTICLE SYSTEM ---

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  type: 'bubble' | 'spark' | 'solid';

  constructor(x: number, y: number, type: 'bubble' | 'spark' | 'solid', color: string) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.color = color;
    this.maxLife = Math.random() * 100 + 50;
    this.life = this.maxLife;

    if (type === 'bubble') {
      this.vx = (Math.random() - 0.5) * 1;
      this.vy = -Math.random() * 2 - 1;
      this.size = Math.random() * 3 + 1;
    } else if (type === 'spark') {
      this.vx = (Math.random() - 0.5) * 4;
      this.vy = (Math.random() - 0.5) * 4;
      this.size = Math.random() * 2 + 1;
      this.maxLife = 20;
      this.life = 20;
    } else {
      // solid falling
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = Math.random() * 3 + 2;
      this.size = Math.random() * 3 + 2;
    }
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
    if (this.type === 'bubble') {
      this.size += 0.05;
      this.vy -= 0.01; // Accelerate upwards
    } else if (this.type === 'spark') {
      this.vx *= 0.95; // Friction
      this.vy *= 0.95;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.type === 'spark' ? `rgba(255, 255, 0, ${this.life / this.maxLife})` : this.color;
    ctx.fill();
  }
}

// --- MAIN COMPONENT ---

export const VirtualChemistryLab = () => {
  const [subA, setSubA] = useState<string | null>(null);
  const [subB, setSubB] = useState<string | null>(null);
  const [method, setMethod] = useState<Method | null>(null);
  
  const [labState, setLabState] = useState<'idle' | 'pouring' | 'reacting' | 'result'>('idle');
  const [result, setResult] = useState<ReactionResult | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Audio Mockup
  const playSound = useCallback((type: 'pour' | 'sizzle' | 'bubble' | 'error' | 'success') => {
    if (!soundEnabled) return;
    // Trong thực tế sẽ dùng new Audio('url').play()
    console.log(`[Audio Playing]: ${type}`);
  }, [soundEnabled]);

  // Canvas Animation Loop
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Spawn particles based on state
    if (labState === 'pouring' && subA) {
      const chem = CHEMICALS[subA];
      if (chem.state === 'solid') {
        for (let i = 0; i < 3; i++) {
          particlesRef.current.push(new Particle(canvas.width / 2 + (Math.random() - 0.5) * 20, 0, 'solid', chem.color));
        }
      }
    }

    if (labState === 'reacting' && result?.success) {
      if (result.animationType === 'electro') {
        // Bubbles at electrodes
        particlesRef.current.push(new Particle(canvas.width * 0.3, canvas.height - 20, 'bubble', 'rgba(255,255,255,0.5)'));
        particlesRef.current.push(new Particle(canvas.width * 0.7, canvas.height - 20, 'bubble', 'rgba(190,242,100,0.5)')); // Cl2 color
        // Sparks
        if (Math.random() > 0.8) {
          particlesRef.current.push(new Particle(canvas.width * 0.3, canvas.height / 2, 'spark', 'yellow'));
          particlesRef.current.push(new Particle(canvas.width * 0.7, canvas.height / 2, 'spark', 'yellow'));
        }
      } else if (result.animationType === 'hydro') {
        // Few bubbles
        if (Math.random() > 0.9) {
          particlesRef.current.push(new Particle(canvas.width / 2 + (Math.random() - 0.5) * 40, canvas.height - 30, 'bubble', 'rgba(255,255,255,0.3)'));
        }
      }
    }

    // Update and draw
    particlesRef.current = particlesRef.current.filter(p => {
      p.update();
      p.draw(ctx);
      if (p.type === 'solid' && p.y > canvas.height - 10) return false;
      if (p.type === 'bubble' && p.y < canvas.height * 0.4) return false;
      return p.life > 0;
    });

    animationFrameRef.current = requestAnimationFrame(renderCanvas);
  }, [labState, result, subA]);

  useEffect(() => {
    if (labState !== 'idle') {
      renderCanvas();
    } else {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
      particlesRef.current = [];
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [labState, renderCanvas]);

  const handleExecute = () => {
    if (!subA || !method) {
      alert('Vui lòng chọn Chất đầu và Phương pháp!');
      return;
    }

    const res = validateReaction(subA, subB, method);
    setResult(res);

    if (!res.success) {
      playSound('error');
      setLabState('result');
      return;
    }

    setLabState('pouring');
    playSound('pour');

    setTimeout(() => {
      setLabState('reacting');
      if (res.animationType === 'pyro') playSound('sizzle');
      if (res.animationType === 'electro') playSound('bubble');
      
      setTimeout(() => {
        setLabState('result');
        playSound('success');
      }, 3000);
    }, 2000);
  };

  const handleReset = () => {
    setSubA(null);
    setSubB(null);
    setMethod(null);
    setLabState('idle');
    setResult(null);
  };

  // --- RENDER HELPERS ---

  const renderFlaskContent = () => {
    if (labState === 'idle') return null;

    const chemA = subA ? CHEMICALS[subA] : null;
    const isSuccess = result?.success;
    const animType = result?.animationType;

    // Base color logic
    let currentColor = chemA?.color || 'transparent';
    if (isSuccess && result.baseColorTransition && (labState === 'reacting' || labState === 'result')) {
      currentColor = labState === 'result' ? result.baseColorTransition.to : result.baseColorTransition.from;
    }

    return (
      <div className="absolute inset-0 flex items-end justify-center pb-4 px-6 overflow-hidden rounded-b-[2rem]">
        {/* Liquid or Solid Base */}
        <motion.div 
          className="w-full rounded-b-xl transition-colors duration-3000 ease-in-out relative"
          initial={{ height: 0 }}
          animate={{ 
            height: chemA?.state === 'liquid' ? '60%' : '30%',
            backgroundColor: currentColor,
            opacity: chemA?.visualProps.opacity || 1
          }}
          transition={{ duration: labState === 'pouring' ? 2 : 3 }}
        >
          {/* Thủy luyện: Thanh kim loại và kết tinh */}
          {animType === 'hydro' && subB && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-32 bg-slate-600 rounded-t-sm flex items-end justify-center">
              <motion.div 
                className="w-10 rounded-t-sm"
                initial={{ height: 0, backgroundColor: 'transparent' }}
                animate={{ 
                  height: labState === 'result' ? '80%' : 0,
                  backgroundColor: result?.products?.[0]?.chemical.color || 'transparent'
                }}
                transition={{ duration: 3 }}
              />
            </div>
          )}

          {/* Điện phân: Điện cực */}
          {animType === 'electro' && (
            <>
              <div className="absolute bottom-0 left-[30%] -translate-x-1/2 w-4 h-40 bg-slate-400 dark:bg-slate-800 rounded-t-sm" />
              <div className="absolute bottom-0 left-[70%] -translate-x-1/2 w-4 h-40 bg-slate-400 dark:bg-slate-800 rounded-t-sm" />
              {/* Kết tủa ở Catot (Trái) */}
              {labState === 'result' && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="absolute bottom-0 left-[30%] -translate-x-1/2 w-6 h-12 rounded-t-sm"
                  style={{ backgroundColor: result?.products?.[0]?.chemical.color }}
                />
              )}
            </>
          )}
        </motion.div>

        {/* Nhiệt luyện: Ngọn lửa */}
        {animType === 'pyro' && (labState === 'reacting') && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0.8, 1, 0.8], scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-24 h-24 bg-blue-500/50 rounded-full blur-xl mix-blend-screen"
          />
        )}
        {animType === 'pyro' && (labState === 'reacting') && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0.8, 1, 0.8], scale: [1, 1.2, 1] }}
            transition={{ duration: 0.3, repeat: Infinity }}
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-yellow-500/60 rounded-full blur-lg mix-blend-screen"
          />
        )}

        {/* Khí bay lên */}
        {isSuccess && labState === 'result' && result.products?.some(p => p.chemical.state === 'gas') && (
          <motion.div 
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 0.6, 0], y: -150 }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-2xl"
            style={{ backgroundColor: result.products.find(p => p.chemical.state === 'gas')?.chemical.color }}
          />
        )}
      </div>
    );
  };

  return (
    <section id="virtual-lab" className="py-12 px-4 max-w-7xl mx-auto">
      <ScrollReveal className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
            <Beaker className="w-10 h-10 text-teal-500" />
            Phòng Thí Nghiệm Ảo: Tách Kim Loại
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Bài 15 - Hóa học 12 Cánh Diều</p>
        </div>
        <button 
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* --- BẢNG ĐIỀU KHIỂN (TRÁI) --- */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Phương pháp */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center text-sm">1</span>
              Chọn Phương Pháp
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'dpnc', name: 'Điện phân nóng chảy', icon: <Zap className="w-5 h-5 text-yellow-500 dark:text-yellow-400" /> },
                { id: 'nl', name: 'Nhiệt luyện', icon: <Flame className="w-5 h-5 text-orange-500" /> },
                { id: 'tl', name: 'Thủy luyện', icon: <Droplets className="w-5 h-5 text-blue-500 dark:text-blue-400" /> },
                { id: 'dpdd', name: 'Điện phân dung dịch', icon: <Zap className="w-5 h-5 text-purple-500 dark:text-purple-400" /> }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setMethod(opt.id as Method)}
                  disabled={labState !== 'idle'}
                  className={cn(
                    "p-4 rounded-xl border flex items-center gap-4 transition-all",
                    method === opt.id 
                      ? "bg-teal-500/20 border-teal-500 text-teal-700 dark:text-white" 
                      : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500 disabled:opacity-50"
                  )}
                >
                  <div className="p-2 bg-slate-100 dark:bg-slate-950 rounded-lg">{opt.icon}</div>
                  <span className="font-bold">{opt.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tủ Hóa Chất */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center text-sm">2</span>
              Tủ Hóa Chất
            </h3>
            
            <div className="mb-6">
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">Chất cần tách (Substance A):</div>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(CHEMICALS).filter(c => c.type === 'reactant').map(chem => (
                  <button
                    key={chem.id}
                    onClick={() => setSubA(chem.id)}
                    disabled={labState !== 'idle'}
                    className={cn(
                      "p-2 rounded-lg border text-sm font-medium transition-all text-center",
                      subA === chem.id ? "bg-teal-500/20 border-teal-500 text-teal-700 dark:text-teal-300" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500"
                    )}
                  >
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{chem.formula}</ReactMarkdown>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">Chất phản ứng / Xúc tác (Substance B):</div>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(CHEMICALS).filter(c => c.type === 'catalyst').map(chem => (
                  <button
                    key={chem.id}
                    onClick={() => setSubB(chem.id)}
                    disabled={labState !== 'idle'}
                    className={cn(
                      "p-2 rounded-lg border text-sm font-medium transition-all text-center",
                      subB === chem.id ? "bg-teal-500/20 border-teal-500 text-teal-700 dark:text-teal-300" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500"
                    )}
                  >
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{chem.formula}</ReactMarkdown>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- BÌNH THÍ NGHIỆM (PHẢI) --- */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl relative min-h-[500px] flex flex-col items-center justify-center overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            {/* Flask Container */}
            <div className="relative w-64 h-80 border-8 border-slate-300 dark:border-slate-700/50 rounded-b-[3rem] border-t-0 z-10 flex flex-col justify-end">
              {/* Cổ bình */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-24 h-16 border-x-8 border-slate-300 dark:border-slate-700/50" />
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-28 h-4 border-8 border-slate-300 dark:border-slate-700/50 rounded-full" />

              {/* Canvas for Particles */}
              <canvas 
                ref={canvasRef} 
                width={240} 
                height={300} 
                className="absolute bottom-0 left-0 w-full h-full z-20 pointer-events-none rounded-b-[2.5rem]"
              />

              {/* Render React Animations (Liquids, Solids, Flames) */}
              {renderFlaskContent()}
            </div>

            {/* Controls */}
            <div className="absolute top-6 right-6 flex gap-3 z-30">
              {labState === 'idle' ? (
                <button
                  onClick={handleExecute}
                  className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-white dark:text-slate-950 font-black rounded-xl transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(20,184,166,0.4)]"
                >
                  <Play className="w-5 h-5 fill-current" />
                  THỰC HIỆN
                </button>
              ) : (
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold rounded-xl transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  LÀM LẠI
                </button>
              )}
            </div>

            {/* Status Text */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur px-6 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-slate-600 dark:text-slate-300 font-mono text-sm uppercase tracking-widest">
                {labState === 'idle' ? 'Sẵn sàng' : 
                 labState === 'pouring' ? 'Đang nạp hóa chất...' : 
                 labState === 'reacting' ? 'Đang phản ứng...' : 'Hoàn thành'}
              </span>
            </div>
          </div>

          {/* --- LAB NOTE (KẾT QUẢ) --- */}
          <AnimatePresence mode="wait">
            {labState === 'result' && result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className={cn(
                  "p-6 rounded-3xl border shadow-xl",
                  result.success ? "bg-white dark:bg-slate-900 border-emerald-500/30" : "bg-white dark:bg-slate-900 border-red-500/30"
                )}
              >
                <div className="flex items-start gap-4 mb-4">
                  {result.success ? (
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  ) : (
                    <div className="p-3 bg-red-100 dark:bg-red-500/20 rounded-2xl">
                      <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                  )}
                  <div>
                    <h4 className={cn("text-xl font-bold mb-1", result.success ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                      {result.success ? "Phản ứng thành công!" : "Lỗi phản ứng!"}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300">{result.message}</p>
                  </div>
                </div>

                {result.equation && (
                  <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-center">
                    <div className="text-2xl text-teal-600 dark:text-teal-400 font-math">
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {result.equation}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {result.success && result.products && (
                  <div>
                    <h5 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Sản phẩm thu được:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {result.products.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center shadow-inner border border-black/10 dark:border-white/10"
                            style={{ backgroundColor: p.chemical.color, opacity: p.chemical.visualProps.opacity }}
                          >
                            <span className="text-xs font-bold text-slate-900 dark:text-white mix-blend-difference">
                              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{p.chemical.formula}</ReactMarkdown>
                            </span>
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{p.chemical.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{p.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
