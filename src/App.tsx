/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { 
  Beaker, 
  Flame, 
  Zap, 
  ChevronRight, 
  MessageSquare, 
  X, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Layers,
  Thermometer,
  Droplets,
  Cpu,
  Trophy,
  User,
  GraduationCap,
  Table,
  RefreshCw,
  Lock,
  XCircle,
  ChevronDown,
  ChevronLeft,
  Clock,
  Medal,
  Trash2,
  Truck,
  Filter,
  Hammer,
  Sparkles,
  Box,
  Key
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { cn } from './lib/utils';
import { ORES, QUIZ_QUESTIONS, LAB_METALS, Ore, Question } from './constants';

// --- Components ---

import { VirtualChemistryLab } from './components/VirtualChemistryLab';

// --- NEW: Particle Background Component ---
const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let mouse = { x: -1000, y: -1000 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      type: '+' | '.';
      opacity: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.type = Math.random() > 0.5 ? '+' : '.';
        this.opacity = Math.random() * 0.5 + 0.1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas!.width) this.x = 0;
        else if (this.x < 0) this.x = canvas!.width;
        if (this.y > canvas!.height) this.y = 0;
        else if (this.y < 0) this.y = canvas!.height;

        // Mouse attraction
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 150) {
          this.x += dx * 0.02;
          this.y += dy * 0.02;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = `rgba(20, 184, 166, ${this.opacity})`;
        ctx.font = `${this.size * 10}px monospace`;
        ctx.fillText(this.type, this.x, this.y);
      }
    }

    const initParticles = () => {
      particles = [];
      const numParticles = Math.floor((window.innerWidth * window.innerHeight) / 10000);
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0 opacity-50"
    />
  );
};

// --- Reusable Scroll Reveal Component ---
export const ScrollReveal = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const Hero = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden px-4">
      <motion.div 
        style={{ y, opacity }}
        className="text-center z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-teal-600 dark:text-teal-400 font-mono tracking-widest uppercase text-sm mb-4 block">
            Hóa học vô cơ & Luyện kim
          </span>
          <h1 className={cn(
            "text-6xl md:text-8xl font-black mb-6 tracking-tighter transition-colors text-gradient-crystallize glow-sparkle",
            "text-white"
          )}>
            HÀNH TRÌNH <br />
            GIẢI PHÓNG KIM LOẠI
          </h1>
          <div className={cn(
            "max-w-2xl mx-auto backdrop-blur-md p-6 rounded-2xl border shadow-2xl transition-colors",
            "bg-slate-900/50 border-teal-500/20"
          )}>
            <p className="text-xl text-slate-300 leading-relaxed">
              Bản chất của quá trình tách kim loại là sự khử các ion kim loại thành nguyên tử:
            </p>
            <div className="text-4xl font-mono text-teal-300 my-6 flex justify-center items-center gap-4">
              <span className="ion-glow font-bold">M<sup className="text-2xl">n+</sup></span>
              <span className="text-slate-400">+</span>
              <span className="electron-move font-bold italic">ne</span>
              <span className="text-slate-400">→</span>
              <span className="metal-crystallize font-bold text-emerald-400">M</span>
            </div>
            <p className="text-slate-400 text-sm italic">
              Từ quặng thô đến những vật liệu tinh khiết kiến tạo thế giới.
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest">Cuộn để khám phá</span>
        <div className="w-px h-12 bg-gradient-to-b from-teal-500 to-transparent" />
      </motion.div>
    </section>
  );
};

const OreGallery = () => {
  const [selectedOre, setSelectedOre] = useState<Ore | null>(null);

  return (
    <section className="py-24 px-4 max-w-7xl mx-auto">
      <ScrollReveal className="mb-16">
        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Kho tàng Quặng quý</h2>
        <p className="text-slate-500 dark:text-slate-400">Khám phá nguồn gốc của các kim loại phổ biến trong tự nhiên.</p>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {ORES.map((ore) => (
          <motion.div
            key={ore.id}
            whileHover={{ y: -10 }}
            className={cn(
              "group relative border rounded-2xl overflow-hidden cursor-pointer transition-all",
              "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-500/50"
            )}
            onClick={() => setSelectedOre(ore)}
          >
            <div className="h-48 overflow-hidden">
              <img 
                src={ore.image} 
                alt={ore.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{ore.name}</h3>
              <p className="text-teal-600 dark:text-teal-400 font-mono text-sm mb-4">{ore.formula}</p>
              <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm group-hover:text-teal-500 dark:group-hover:text-teal-300 transition-colors">
                Xem chi tiết <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedOre && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedOre(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={cn(
                "border rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl transition-colors",
                "bg-white dark:bg-slate-900 border-teal-500/30"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-64">
                <img src={selectedOre.image} alt={selectedOre.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <button 
                  onClick={() => setSelectedOre(null)}
                  className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-teal-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{selectedOre.name}</h3>
                    <p className="text-teal-600 dark:text-teal-400 font-mono text-lg">{selectedOre.formula}</p>
                  </div>
                  <div className="bg-teal-500/10 border border-teal-500/20 px-4 py-2 rounded-xl">
                    <span className="text-xs text-teal-600 dark:text-teal-500 uppercase font-bold block">Kim loại đích</span>
                    <span className="text-slate-900 dark:text-white font-bold">{selectedOre.targetMetal}</span>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  {selectedOre.description}
                </p>
                <div className="flex gap-4">
                  <div className="flex-1 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold block mb-1">Trạng thái</span>
                    <span className="text-slate-700 dark:text-slate-200">Khoáng vật tự nhiên</span>
                  </div>
                  <div className="flex-1 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold block mb-1">Độ phổ biến</span>
                    <span className="text-slate-700 dark:text-slate-200">Rất cao</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const DeepDive = () => {
  const [activeTab, setActiveTab] = useState<'pyro' | 'hydro' | 'electro'>('pyro');

  const tabs = [
    { id: 'pyro', label: 'Nhiệt luyện', icon: Flame, color: 'text-orange-500' },
    { id: 'hydro', label: 'Thủy luyện', icon: Droplets, color: 'text-blue-500' },
    { id: 'electro', label: 'Điện phân', icon: Zap, color: 'text-yellow-500' },
  ];

  return (
    <section className={cn(
      "py-24 px-4 transition-colors duration-300",
      "bg-slate-100/50 dark:bg-slate-900/30"
    )}>
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">The Big 3: Tam đại Phương pháp</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Ba con đường chính để tách kim loại ra khỏi hợp chất, tùy thuộc vào độ hoạt động hóa học của chúng.
          </p>
        </ScrollReveal>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all duration-300 border-2",
                activeTab === tab.id 
                  ? "bg-teal-500/10 border-teal-500 text-teal-600 dark:text-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.2)]" 
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? tab.color : "")} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className={cn(
          "border rounded-3xl p-8 md:p-12 shadow-2xl min-h-[500px] transition-colors duration-300",
          "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        )}>
          <AnimatePresence mode="wait">
            {activeTab === 'pyro' && (
              <motion.div
                key="pyro"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
              >
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-orange-500/10 rounded-xl">
                      <Flame className="w-8 h-8 text-orange-500" />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">Phương pháp Nhiệt luyện</h3>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 text-lg mb-8 leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {'Khử ion kim loại trong oxit ở nhiệt độ cao bằng các chất khử mạnh như $C, CO, H_2$ hoặc kim loại mạnh (như $Al$).'}
                    </ReactMarkdown>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <h4 className="text-teal-600 dark:text-teal-400 font-bold mb-3">Phản ứng tiêu biểu (Luyện gang):</h4>
                      <div className="text-xl font-mono text-slate-900 dark:text-white bg-slate-200 dark:bg-black/30 p-4 rounded-xl flex justify-center">
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {'$Fe_2O_3 + 3CO \\xrightarrow{t^o} 2Fe + 3CO_2$'}
                        </ReactMarkdown>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold shrink-0">!</div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        <strong className="text-slate-900 dark:text-white block mb-1">Phạm vi áp dụng:</strong>
                        Dùng điều chế các kim loại có độ hoạt động trung bình và yếu (đứng sau Al trong dãy hoạt động hóa học như Zn, Fe, Sn, Pb, Cu).
                      </p>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 dark:text-orange-400 font-bold shrink-0">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        <strong className="text-slate-900 dark:text-white block mb-1">Tác động môi trường:</strong>
                        Phát thải lượng lớn khí nhà kính (CO<sub>2</sub>) và có thể sinh ra khí gây mưa axit (SO<sub>2</sub>) nếu dùng quặng sulfide.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 p-8 flex flex-col items-center justify-center">
                  <div className="w-48 h-64 bg-slate-200 dark:bg-slate-700 rounded-t-full relative border-x-8 border-t-8 border-slate-300 dark:border-slate-600">
                    <motion.div 
                      animate={{ height: [20, 100, 20] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-orange-600 to-yellow-400 opacity-80"
                    />
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
                      <div className="w-12 h-12 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" />
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Quặng + Than</span>
                    </div>
                  </div>
                  <div className="mt-8 text-center">
                    <span className="text-orange-600 dark:text-orange-500 font-bold text-xl">Mô phỏng Lò cao</span>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Nhiệt độ có thể lên tới 2000°C</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'hydro' && (
              <motion.div
                key="hydro"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
              >
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                      <Droplets className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">Phương pháp Thủy luyện</h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-lg mb-8 leading-relaxed">
                    Gồm 2 bước: Hòa tan hợp chất kim loại bằng dung môi thích hợp (axit, kiềm, cyanide), sau đó dùng kim loại có tính khử mạnh hơn để đẩy kim loại yếu ra khỏi dung dịch.
                  </p>
                  <div className="space-y-6">
                    <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <h4 className="text-teal-600 dark:text-teal-400 font-bold mb-3">Phản ứng đẩy kim loại (Tách đồng):</h4>
                      <div className="text-xl font-mono text-slate-900 dark:text-white bg-slate-200 dark:bg-black/30 p-4 rounded-xl flex justify-center">
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {'$Fe + CuSO_4 \\rightarrow FeSO_4 + Cu$'}
                        </ReactMarkdown>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold shrink-0">!</div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        <strong className="text-slate-900 dark:text-white block mb-1">Phạm vi áp dụng:</strong>
                        Cực kỳ hiệu quả đối với các kim loại kém hoạt động như Cu, Ag, Au. Cho phép tách kim loại từ quặng nghèo.
                      </p>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 dark:text-blue-400 font-bold shrink-0">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        <strong className="text-slate-900 dark:text-white block mb-1">Thách thức môi trường:</strong>
                        Xử lý nước thải chứa các ion kim loại nặng và hóa chất độc hại (như cyanide trong tách vàng) đòi hỏi quy trình phức tạp.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700">
                  <div className="relative w-40 h-56 bg-blue-500/10 dark:bg-blue-500/20 border-x-4 border-b-4 border-slate-300 dark:border-slate-400 rounded-b-2xl">
                    <motion.div 
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-blue-400/20 dark:bg-blue-400/30"
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-48 bg-slate-400 dark:bg-slate-500 rounded-full rotate-12">
                      <motion.div 
                        animate={{ backgroundColor: ['#94a3b8', '#b45309', '#b45309'] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="w-full h-1/2 absolute bottom-0 bg-slate-400 dark:bg-slate-500 rounded-b-full"
                      />
                    </div>
                  </div>
                  <div className="mt-8 text-center">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-xl flex justify-center gap-2">
                      Đinh sắt trong 
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {'$CuSO_4$'}
                      </ReactMarkdown>
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Đồng đỏ bám dần lên đinh sắt</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'electro' && (
              <motion.div
                key="electro"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col"
              >
                <div className="flex items-center gap-3 mb-12">
                  <div className="p-3 bg-yellow-500/10 rounded-xl">
                    <Zap className="w-8 h-8 text-yellow-500" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white">Phương pháp Điện phân</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-8 rounded-3xl">
                    <h4 className="text-xl font-bold text-yellow-600 dark:text-yellow-400 mb-4">Điện phân nóng chảy</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
                      Giải pháp duy nhất cho các kim loại hoạt động mạnh (nhóm IA, IIA, Al). Cation của chúng rất bền, không thể bị khử bằng hóa chất thông thường.
                    </p>
                    <div className="bg-slate-200 dark:bg-black/30 p-4 rounded-xl text-center font-mono text-teal-600 dark:text-teal-300 text-sm">
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {'$2Al_2O_3 \\xrightarrow{dpnc, criolit} 4Al + 3O_2$'}
                      </ReactMarkdown>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 italic">
                      Criolit (Na<sub>3</sub>AlF<sub>6</sub>) giúp hạ nhiệt độ nóng chảy từ 2050°C xuống 900°C.
                    </p>
                  </div>
                  
                  <div className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-8 rounded-3xl">
                    <h4 className="text-xl font-bold text-teal-600 dark:text-teal-400 mb-4">Điện phân dung dịch</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
                      Dùng để tinh luyện và điều chế các kim loại trung bình/yếu (Zn, Cu, Pb, Ag) đạt độ tinh khiết cực cao.
                    </p>
                    <div className="bg-slate-200 dark:bg-black/30 p-4 rounded-xl text-center font-mono text-teal-600 dark:text-teal-300 text-sm">
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {'$2CuSO_4 + 2H_2O \\xrightarrow{dpdd} 2Cu + 2H_2SO_4 + O_2$'}
                      </ReactMarkdown>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 italic">
                      Không thể điều chế kim loại mạnh vì nước sẽ bị khử trước tại catot.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

interface PreparedQuestion extends Question {
  shuffledOptions: { text: string; originalIndex: number }[];
}

const Leaderboard = () => {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void;
    
    const fetchLeaderboard = async () => {
      try {
        const { ref, query, orderByChild, limitToLast, onValue } = await import('firebase/database');
        const { database } = await import('./firebase');
        
        const leaderboardRef = query(ref(database, 'leaderboard'), orderByChild('score'), limitToLast(100));
        
        unsubscribe = onValue(leaderboardRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const leadersArray = Object.values(data) as any[];
            // Sort by score descending, then by timestamp ascending (earlier submissions rank higher if tied)
            leadersArray.sort((a, b) => {
              if (b.score !== a.score) {
                return b.score - a.score;
              }
              return a.timestamp - b.timestamp;
            });
            setLeaders(leadersArray.slice(0, 10));
          } else {
            setLeaders([]);
          }
          setLoading(false);
        });
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (loading) return <div className="text-center py-10 text-slate-500 dark:text-slate-400">Đang tải bảng xếp hạng...</div>;

  return (
    <div className="mt-12 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
        <Medal className="text-yellow-500" />
        Bảng Xếp Hạng Top 10
      </h3>
      <div className="space-y-3">
        {leaders.map((leader, idx) => (
          <div 
            key={idx} 
            className={cn(
              "flex items-center justify-between p-4 rounded-xl border",
              idx === 0 ? "bg-yellow-500/10 border-yellow-500/30" : 
              idx === 1 ? "bg-slate-300/10 border-slate-300/30" :
              idx === 2 ? "bg-orange-500/10 border-orange-500/30" :
              "bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50"
            )}
          >
            <div className="flex items-center gap-4">
              <span className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-black text-sm",
                idx === 0 ? "bg-yellow-500 text-slate-900" :
                idx === 1 ? "bg-slate-300 text-slate-900" :
                idx === 2 ? "bg-orange-500 text-slate-900" :
                "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              )}>
                {idx + 1}
              </span>
              <div>
                <div className="font-bold text-slate-900 dark:text-white">{leader.student_name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Lớp: {leader.student_class}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-teal-600 dark:text-teal-400 font-black text-lg">{leader.score}/{leader.total_questions}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-600 uppercase tracking-widest">
                {new Date(leader.timestamp).toLocaleDateString('vi-VN')}
              </div>
            </div>
          </div>
        ))}
        {leaders.length === 0 && (
          <div className="text-center py-6 text-slate-500 dark:text-slate-600 italic">Chưa có dữ liệu xếp hạng.</div>
        )}
      </div>
    </div>
  );
};

const FinalExam = () => {
  const [examStarted, setExamStarted] = useState(false);
  const [studentInfo, setStudentInfo] = useState<{ name: string, studentClass: string } | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [classInput, setClassInput] = useState('');
  const [preparedQuestions, setPreparedQuestions] = useState<PreparedQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showSubmitInfoPopup, setShowSubmitInfoPopup] = useState(false);
  const [unansweredQuestions, setUnansweredQuestions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number, selectedOriginalIndex: number, isCorrect: boolean }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(22 * 60); // 22 minutes in seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const answersRef = useRef(answers);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const currentQ = preparedQuestions[currentStep];
  const savedAnswer = currentQ ? answers.find(a => a.questionId === currentQ.id) : undefined;
  const selectedOption = savedAnswer ? currentQ.shuffledOptions.findIndex(opt => opt.originalIndex === savedAnswer.selectedOriginalIndex) : null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (examStarted && !quizFinished && !showSubmitInfoPopup) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleFinishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examStarted, quizFinished, showSubmitInfoPopup]);

  const handleFinishQuiz = () => {
    setShowConfirmSubmit(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setShowSubmitInfoPopup(true);
  };

  const checkAndConfirmSubmit = () => {
    const unanswered = preparedQuestions
      .map((q, idx) => ({ id: q.id, idx }))
      .filter(q => !answers.some(a => a.questionId === q.id))
      .map(q => q.idx + 1);

    if (timeLeft > 5 * 60 || unanswered.length > 0) {
      setUnansweredQuestions(unanswered);
      setShowConfirmSubmit(true);
    } else {
      handleFinishQuiz();
    }
  };

  const handleStartExam = () => {
    // Prepare randomized questions and options
    const shuffledQs = shuffleArray(QUIZ_QUESTIONS).map(q => {
      const optionsWithIndices = q.options.map((opt, idx) => ({ text: opt, originalIndex: idx }));
      return {
        ...q,
        shuffledOptions: shuffleArray(optionsWithIndices)
      };
    });
    
    setPreparedQuestions(shuffledQs);
    setExamStarted(true);
  };

  const finalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !classInput.trim()) return;
    
    setIsSubmitting(true);
    const finalAnswers = answersRef.current;
    const finalScore = finalAnswers.filter(a => a.isCorrect).length;
    setScore(finalScore);
    
    const info = { name: nameInput.trim(), studentClass: classInput.trim() };
    setStudentInfo(info);

    try {
      const { ref, push, serverTimestamp } = await import('firebase/database');
      const { database } = await import('./firebase');
      
      const timeSpent = 22 * 60 - timeLeft;

      await push(ref(database, 'leaderboard'), {
        student_name: info.name,
        student_class: info.studentClass,
        score: finalScore,
        total_questions: QUIZ_QUESTIONS.length,
        time_spent: timeSpent,
        timestamp: serverTimestamp(),
        answers: finalAnswers
      });
      
      console.log('Results submitted successfully');
    } catch (err) {
      console.error('Error submitting results:', err);
    } finally {
      setIsSubmitting(false);
      setShowSubmitInfoPopup(false);
      setQuizFinished(true);
    }
  };

  const handleSelectOption = (idx: number) => {
    const selectedObj = currentQ.shuffledOptions[idx];
    const isCorrect = selectedObj.originalIndex === currentQ.correctAnswer;
    
    setAnswers(prev => {
      const existingIdx = prev.findIndex(a => a.questionId === currentQ.id);
      const newAnswer = {
        questionId: currentQ.id,
        selectedOriginalIndex: selectedObj.originalIndex,
        isCorrect
      };
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = newAnswer;
        return updated;
      }
      return [...prev, newAnswer];
    });
  };

  if (!examStarted) {
    return (
      <section id="exam" className="py-24 px-4 max-w-xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-teal-500/30 rounded-3xl p-8 shadow-2xl text-center"
        >
          <div className="w-16 h-16 bg-teal-500/10 dark:bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-teal-600 dark:text-teal-500" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Phòng thi Sát hạch</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">Nhấn nút bên dưới để bắt đầu bài thi chính thức. Bạn sẽ có 22 phút để hoàn thành.</p>
          
          <button 
            onClick={handleStartExam}
            className="w-full py-4 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-colors shadow-lg shadow-teal-500/20"
          >
            Bắt đầu làm bài
          </button>
        </motion.div>
      </section>
    );
  }

  if (showReview) {
    return (
      <section className="py-24 px-4 max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Xem lại bài làm</h2>
          <div className="text-2xl font-black text-teal-600 dark:text-teal-400">{score}/{preparedQuestions.length}</div>
        </div>
        
        <div className="space-y-8">
          {preparedQuestions.map((q, idx) => {
            const studentAns = answers.find(a => a.questionId === q.id);
            return (
              <div key={q.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-relaxed">{q.text}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {q.shuffledOptions.map((opt, oIdx) => {
                    const isCorrect = opt.originalIndex === q.correctAnswer;
                    const isSelected = studentAns?.selectedOriginalIndex === opt.originalIndex;
                    
                    return (
                      <div 
                        key={oIdx}
                        className={cn(
                          "p-4 rounded-xl border-2 flex items-center justify-between",
                          isCorrect ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-700 dark:text-emerald-400 font-bold" :
                          isSelected && !isCorrect ? "bg-red-500/10 border-red-500/50 text-red-700 dark:text-red-400 font-bold" :
                          "bg-slate-50 dark:bg-slate-800 border-transparent text-slate-600 dark:text-slate-400"
                        )}
                      >
                        <span>{opt.text}</span>
                        {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />}
                        {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600 dark:text-red-500" />}
                      </div>
                    );
                  })}
                </div>

                <div className="bg-teal-500/5 border border-teal-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold mb-2">
                    <AlertCircle className="w-5 h-5" />
                    Giải thích:
                  </div>
                  <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {q.insight}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <button 
            onClick={() => window.location.reload()}
            className="px-10 py-4 bg-teal-500 text-white font-bold rounded-2xl hover:bg-teal-600 transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="exam" className="py-24 px-4 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl">
        {!quizFinished ? (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <span className="text-teal-600 dark:text-teal-500 font-bold block">Bài thi: Luyện Kim Thuật</span>
                <span className="text-slate-500 dark:text-slate-400 text-xs">Thời gian: 22 phút</span>
              </div>
              <div className="flex flex-col items-end">
                <div className={cn(
                  "flex items-center gap-2 font-black text-lg",
                  timeLeft < 60 ? "text-red-500 animate-pulse" : "text-teal-600 dark:text-teal-500"
                )}>
                  <Clock className="w-5 h-5" />
                  {formatTime(timeLeft)}
                </div>
                <span className="text-slate-500 dark:text-slate-400 text-xs font-bold">Câu {currentStep + 1}/{preparedQuestions.length}</span>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 leading-relaxed">
              {preparedQuestions[currentStep].text}
            </h3>

            <div className="space-y-4 mb-10">
              {preparedQuestions[currentStep].shuffledOptions.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={cn(
                    "w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group",
                    selectedOption === idx 
                      ? "bg-teal-500/10 border-teal-500 text-teal-700 dark:text-teal-400 font-bold" 
                      : "bg-slate-50 dark:bg-slate-800 border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  <span className="font-medium">{option.text}</span>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                    selectedOption === idx ? "border-teal-500 bg-teal-500 text-white" : "border-slate-300 dark:border-slate-600"
                  )}>
                    {selectedOption === idx && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mt-8">
              <button
                onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
                disabled={currentStep === 0}
                className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Câu trước
              </button>
              
              {currentStep < preparedQuestions.length - 1 ? (
                <button
                  onClick={() => setCurrentStep(s => Math.min(preparedQuestions.length - 1, s + 1))}
                  className="px-6 py-4 bg-teal-500 text-white font-bold rounded-2xl hover:bg-teal-600 transition-colors flex items-center gap-2"
                >
                  Câu tiếp
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={checkAndConfirmSubmit}
                  className="px-8 py-4 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                >
                  Nộp bài
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-teal-500/10 dark:bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-12 h-12 text-teal-600 dark:text-teal-500" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Kết thúc bài thi</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8">Chúc mừng {studentInfo?.name} đã hoàn thành bài thi.</p>
            <div className="text-5xl font-black text-teal-600 dark:text-teal-400 mb-12">{score}/{preparedQuestions.length}</div>
            <div className="flex flex-col gap-4">
              <p className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Kết quả đã được tự động lưu lại!
              </p>
              <button 
                onClick={() => setShowReview(true)}
                className="px-10 py-4 bg-teal-500 text-white font-bold rounded-2xl hover:bg-teal-600 transition-colors mx-auto"
              >
                Xem lại bài làm
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm transition-colors"
              >
                Về trang chủ
              </button>
            </div>
            
            <Leaderboard />
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmSubmit && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-6 text-amber-500">
                <AlertCircle className="w-8 h-8" />
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Xác nhận nộp bài</h3>
              </div>
              
              <div className="space-y-4 mb-8 text-slate-600 dark:text-slate-300">
                {timeLeft > 5 * 60 && (
                  <p>Bạn vẫn còn khá nhiều thời gian ({formatTime(timeLeft)}). Bạn có chắc chắn muốn nộp bài sớm không?</p>
                )}
                
                {unansweredQuestions.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <p className="text-red-600 dark:text-red-400 font-bold mb-2">Cảnh báo: Bạn chưa làm các câu sau:</p>
                    <div className="flex flex-wrap gap-2">
                      {unansweredQuestions.map(num => (
                        <span key={num} className="px-2 py-1 bg-red-500/20 text-red-700 dark:text-red-300 rounded-md text-sm font-bold">
                          Câu {num}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowConfirmSubmit(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Quay lại làm tiếp
                </button>
                <button 
                  onClick={handleFinishQuiz}
                  className="flex-1 py-3 px-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors"
                >
                  Vẫn nộp bài
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Info Modal */}
      <AnimatePresence>
        {showSubmitInfoPopup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-teal-500/10 dark:bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-teal-600 dark:text-teal-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Thông tin thí sinh</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Vui lòng nhập thông tin để lưu kết quả của bạn vào bảng xếp hạng.</p>
              </div>
              
              <form onSubmit={finalSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Họ và Tên</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                    <input 
                      type="text" 
                      required
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 text-slate-900 dark:text-white focus:border-teal-500 outline-none transition-colors"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Lớp</label>
                  <div className="relative">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                    <input 
                      type="text" 
                      required
                      value={classInput}
                      onChange={(e) => setClassInput(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 text-slate-900 dark:text-white focus:border-teal-500 outline-none transition-colors"
                      placeholder="12A1"
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-colors shadow-lg shadow-teal-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu kết quả...' : 'Hoàn tất & Xem điểm'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const AdminDashboard = () => {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    let unsubscribe: () => void;
    
    const setupListener = async () => {
      setIsLoading(true);
      try {
        const { ref, onValue, query, orderByChild } = await import('firebase/database');
        const { database } = await import('./firebase');
        
        const leaderboardRef = query(ref(database, 'leaderboard'), orderByChild('timestamp'));
        
        unsubscribe = onValue(leaderboardRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const resultsArray = Object.keys(data).map(key => ({
              id: key,
              ...data[key]
            }));
            // Sort descending by timestamp
            resultsArray.sort((a, b) => b.timestamp - a.timestamp);
            setResults(resultsArray);
          } else {
            setResults([]);
          }
          setIsLoading(false);
        });
      } catch (err) {
        console.error(err);
        setResults([]);
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      setupListener();
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAuthenticated]);

  const handleClearData = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa TOÀN BỘ kết quả thi không? Hành động này không thể hoàn tác!')) {
      try {
        const { ref, remove } = await import('firebase/database');
        const { database } = await import('./firebase');
        await remove(ref(database, 'leaderboard'));
        alert('Đã xóa toàn bộ dữ liệu thành công!');
      } catch (error) {
        console.error('Lỗi khi xóa dữ liệu:', error);
        alert('Có lỗi xảy ra khi xóa dữ liệu.');
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { ref, get } = await import('firebase/database');
      const { database } = await import('./firebase');
      const passwordRef = ref(database, 'admin/password');
      const snapshot = await get(passwordRef);
      const actualPassword = snapshot.exists() ? snapshot.val() : 'admin123';
      
      if (password === actualPassword) {
        setIsAuthenticated(true);
      } else {
        alert('Sai mật khẩu!');
      }
    } catch (error) {
      console.error('Lỗi khi đăng nhập:', error);
      alert('Có lỗi xảy ra khi đăng nhập.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      alert('Vui lòng nhập mật khẩu mới!');
      return;
    }
    try {
      const { ref, set } = await import('firebase/database');
      const { database } = await import('./firebase');
      await set(ref(database, 'admin/password'), newPassword);
      alert('Đổi mật khẩu thành công!');
      setIsChangingPassword(false);
      setNewPassword('');
    } catch (error) {
      console.error('Lỗi khi đổi mật khẩu:', error);
      alert('Có lỗi xảy ra khi đổi mật khẩu.');
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="py-24 px-4 max-w-md mx-auto">
        <div className={cn(
          "border rounded-3xl p-8 shadow-2xl transition-colors duration-300",
          "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        )}>
          <div className="text-center mb-8">
            <Lock className="w-12 h-12 text-teal-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Login</h2>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(
                "w-full rounded-xl py-3 px-4 outline-none transition-all",
                "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-teal-500"
              )}
              placeholder="Mật khẩu"
            />
            <button className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl transition-colors">
              Đăng nhập
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className={cn(
          "text-3xl font-bold flex items-center gap-3 transition-colors duration-300",
          "text-slate-900 dark:text-white"
        )}>
          <Table className="text-teal-500" />
          Bảng tổng hợp Kết quả
        </h2>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsChangingPassword(true)}
            className="px-4 py-2 bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30 rounded-lg hover:bg-teal-500 hover:text-white transition-colors font-bold text-sm flex items-center gap-2"
          >
            <Key className="w-4 h-4" />
            Đổi mật khẩu
          </button>
          <button 
            onClick={handleClearData}
            className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/30 rounded-lg hover:bg-red-500 hover:text-white transition-colors font-bold text-sm flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Xóa toàn bộ kết quả
          </button>
          <div className={cn("p-2 text-teal-600 dark:text-teal-400 rounded-lg", isLoading && "animate-spin")}>
            <RefreshCw className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className={cn(
        "border rounded-3xl overflow-hidden shadow-2xl transition-colors duration-300",
        "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
      )}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className={cn(
              "border-b transition-colors duration-300",
              "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800"
            )}>
              <tr>
                <th className="px-6 py-4 text-teal-600 dark:text-teal-500 font-bold uppercase text-xs">Thí sinh</th>
                <th className="px-6 py-4 text-teal-600 dark:text-teal-500 font-bold uppercase text-xs">Lớp</th>
                <th className="px-6 py-4 text-teal-600 dark:text-teal-500 font-bold uppercase text-xs">Điểm số</th>
                <th className="px-6 py-4 text-teal-600 dark:text-teal-500 font-bold uppercase text-xs">Thời gian làm bài</th>
                <th className="px-6 py-4 text-teal-600 dark:text-teal-500 font-bold uppercase text-xs">Ngày nộp</th>
                <th className="px-6 py-4 text-teal-600 dark:text-teal-500 font-bold uppercase text-xs">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {results.map((res) => (
                <React.Fragment key={res.id}>
                  <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{res.student_name}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{res.student_class}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold",
                        res.score >= res.total_questions / 2 ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-red-500/20 text-red-600 dark:text-red-400"
                      )}>
                        {res.score}/{res.total_questions}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                      {res.time_spent !== undefined ? `${Math.floor(res.time_spent / 60)}:${(res.time_spent % 60).toString().padStart(2, '0')}` : '--:--'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">
                      {new Date(res.timestamp).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setExpandedRow(expandedRow === res.id ? null : res.id)}
                        className="text-teal-600 dark:text-teal-500 hover:text-teal-700 dark:hover:text-teal-400 text-sm font-bold flex items-center gap-1"
                      >
                        {expandedRow === res.id ? 'Đóng' : 'Xem chi tiết'}
                        <ChevronDown className={cn("w-4 h-4 transition-transform", expandedRow === res.id && "rotate-180")} />
                      </button>
                    </td>
                  </tr>
                  {expandedRow === res.id && (
                    <tr className="bg-slate-50 dark:bg-slate-950/50">
                      <td colSpan={6} className="px-6 py-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(() => {
                            try {
                              const parsedAnswers = res.answers || [];
                              return parsedAnswers.map((ans: any, idx: number) => {
                                const question = QUIZ_QUESTIONS.find(q => q.id === ans.questionId);
                                if (!question) return null;
                                return (
                                  <div key={idx} className={cn(
                                    "p-4 rounded-xl border",
                                    ans.isCorrect ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"
                                  )}>
                                    <div className="flex justify-between items-start mb-2">
                                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Câu {idx + 1}</span>
                                      {ans.isCorrect ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                      ) : (
                                        <XCircle className="w-4 h-4 text-red-500" />
                                      )}
                                    </div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white mb-3">{question.text}</p>
                                    <div className="space-y-1">
                                      <p className="text-xs text-slate-600 dark:text-slate-400">
                                        <span className="font-bold">Đã chọn:</span> {question.options[ans.selectedOriginalIndex]}
                                      </p>
                                      {!ans.isCorrect && (
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                          <span className="font-bold">Đáp án đúng:</span> {question.options[question.correctAnswer]}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              });
                            } catch (e) {
                              return <p className="text-red-500 dark:text-red-400 text-sm">Lỗi hiển thị chi tiết bài làm.</p>;
                            }
                          })()}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {results.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 italic">Chưa có kết quả nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isChangingPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-md">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Key className="w-6 h-6 text-teal-500" />
              Đổi mật khẩu Admin
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl py-3 px-4 outline-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-teal-500 transition-all"
                placeholder="Nhập mật khẩu mới"
                required
              />
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setNewPassword('');
                  }}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl transition-colors"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

const RecyclingSection = () => {
  const [activeCard, setActiveCard] = useState<number | null>(null);

  return (
    <section className="py-24 px-4 max-w-7xl mx-auto">
      <ScrollReveal className="bg-gradient-to-br from-emerald-100/40 dark:from-emerald-900/40 to-slate-50 dark:to-slate-900 border border-emerald-500/20 dark:border-emerald-500/30 rounded-[3rem] p-8 md:p-16 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <RefreshCw className="w-96 h-96 text-emerald-500" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20 dark:border-emerald-500/30">
              <RefreshCw className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Tái chế Kim loại</h2>
              <p className="text-emerald-600 dark:text-emerald-400 font-mono text-sm mt-1">Kinh tế tuần hoàn & Khai thác mỏ đô thị</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
                Trong kỷ nguyên khan hiếm tài nguyên, tái chế kim loại là yêu cầu bắt buộc để duy trì nền kinh tế toàn cầu. Việc thu hồi kim loại từ phế liệu giúp giảm thiểu khai thác quặng nguyên sinh, bảo vệ môi trường và tiết kiệm năng lượng khổng lồ.
              </p>
              
              <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm dark:shadow-none">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500 dark:text-yellow-400" />
                  Lợi ích vượt trội
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-300">
                      <strong className="text-slate-900 dark:text-white">Tiết kiệm 95% năng lượng</strong> khi tái chế nhôm so với sản xuất từ quặng bauxite.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-300">
                      <strong className="text-slate-900 dark:text-white">Giảm phát thải khí nhà kính</strong> và hạn chế rác thải rắn tại các bãi chôn lấp.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-300">
                      <strong className="text-slate-900 dark:text-white">Urban Mining (Khai thác mỏ đô thị):</strong> Rác thải điện tử chứa hàm lượng vàng, đồng, lithium cao hơn nhiều so với quặng tự nhiên.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 relative overflow-hidden shadow-sm dark:shadow-none">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Quy trình Công nghiệp</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { 
                      name: 'Thu gom', 
                      icon: Truck, 
                      image: 'https://loremflickr.com/400/225/scrap,metal',
                      desc: 'Tập hợp phế liệu kim loại từ các nguồn công nghiệp và sinh hoạt.'
                    },
                    { 
                      name: 'Phân loại', 
                      icon: Filter, 
                      image: 'https://loremflickr.com/400/225/factory,sorting',
                      desc: 'Tách kim loại đen và màu bằng nam châm và cảm biến.'
                    },
                    { 
                      name: 'Nghiền nhỏ', 
                      icon: Hammer, 
                      image: 'https://loremflickr.com/400/225/shredder,machine',
                      desc: 'Băm nhỏ phế liệu để tăng diện tích bề mặt, dễ dàng nung chảy.'
                    },
                    { 
                      name: 'Nung chảy', 
                      icon: Flame, 
                      image: 'https://loremflickr.com/400/225/foundry,metal',
                      desc: 'Nấu chảy kim loại trong lò hồ quang điện hoặc lò nung.'
                    },
                    { 
                      name: 'Tinh luyện', 
                      icon: Sparkles, 
                      image: 'https://loremflickr.com/400/225/welding,sparks',
                      desc: 'Loại bỏ tạp chất bằng phương pháp điện phân hoặc hóa học.'
                    },
                    { 
                      name: 'Đúc sản phẩm', 
                      icon: Box, 
                      image: 'https://loremflickr.com/400/225/casting,iron',
                      desc: 'Đổ kim loại lỏng vào khuôn để tạo hình phôi hoặc sản phẩm.'
                    }
                  ].map((step, idx) => {
                    const Icon = step.icon;
                    return (
                      <div 
                        key={idx} 
                        className="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] hover:border-teal-500/50 cursor-pointer"
                        onClick={() => setActiveCard(activeCard === idx ? null : idx)}
                        onMouseLeave={() => setActiveCard(null)}
                      >
                        <div className="aspect-video w-full overflow-hidden">
                          <img src={step.image} alt={step.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                        </div>
                        <div className="p-2 md:p-3">
                          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 md:gap-2 text-xs md:text-sm">
                            <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-teal-500 shrink-0" />
                            <span className="truncate">{step.name}</span>
                          </h4>
                        </div>
                        <div className={cn(
                          "absolute inset-0 bg-slate-900/95 p-2 md:p-4 flex flex-col justify-center items-center text-center transition-opacity duration-300",
                          activeCard === idx ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        )}>
                          <Icon className="w-5 h-5 md:w-8 md:h-8 text-teal-400 mb-1 md:mb-2 shrink-0" />
                          <h4 className="font-bold text-white mb-0.5 md:mb-1 text-xs md:text-base">{step.name}</h4>
                          <p className="text-[10px] md:text-xs text-slate-300 leading-tight md:leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 shadow-sm dark:shadow-none">
                <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Rủi ro tại các làng nghề thủ công
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-3">
                  Tái chế thủ công phát thải nhiều khí độc (SO<sub>2</sub>), bụi kim loại gây bệnh hô hấp. Nước thải chứa hóa chất ngấm vào nguồn nước sinh hoạt.
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  <strong className="text-red-600 dark:text-red-300">Khuyến cáo:</strong> Không dùng nhôm tái chế thủ công (lẫn chì, cadmium) làm dụng cụ nhà bếp vì ion kim loại nặng dễ giải phóng khi tiếp xúc thức ăn mặn/chua.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
};

const EXERCISES = {
  basic: [
    {
      question: "Đề xuất phương pháp điều chế Na từ NaCl, Mg từ $MgCO_3$, Zn từ ZnS.",
      answer: `1. **Na** đứng đầu dãy hoạt động $\\rightarrow$ Điện phân nóng chảy: $2NaCl \\xrightarrow{dpnc} 2Na + Cl_2$.
2. **Mg** đứng đầu dãy $\\rightarrow$ Hòa tan $MgCO_3$ bằng $HCl$ tạo $MgCl_2$, sau đó điện phân nóng chảy $MgCl_2$.
3. **Zn** đứng giữa dãy $\\rightarrow$ Nhiệt luyện: $2ZnS + 3O_2 \\xrightarrow{t^o} 2ZnO + 2SO_2$, sau đó $ZnO + C \\xrightarrow{t^o} Zn + CO$.`
    }
  ],
  intermediate: [
    {
      question: "Tính khối lượng quặng hematite chứa 60% $Fe_2O_3$ cần thiết để sản xuất 1 tấn gang chứa 95% sắt, biết hiệu suất toàn quá trình là 80%.",
      answer: `1. Tính khối lượng sắt nguyên chất cần có: $m_{Fe} = 1 \\times 0.95 = 0.95$ tấn.
2. Tính khối lượng $Fe_2O_3$ lý thuyết theo sơ đồ: $Fe_2O_3 \\rightarrow 2Fe$. 
   Khối lượng $Fe_2O_3 = \\frac{0.95 \\times 160}{2 \\times 56} = 1.357$ tấn.
3. Tính khối lượng $Fe_2O_3$ thực tế (do hiệu suất 80%): $1.357 / 0.8 = 1.696$ tấn.
4. Khối lượng quặng cần dùng: $1.696 / 0.6 = 2.827$ tấn.`
    },
    {
      question: "Cho khí CO dư đi qua hỗn hợp gồm $Al_2O_3, MgO, Fe_2O_3, CuO$ nung nóng. Sau khi phản ứng kết thúc, thu được chất rắn Y. Cho Y vào dung dịch NaOH dư. Xác định các thành phần không tan Z.",
      answer: `* CO chỉ khử được oxide của các kim loại đứng sau nhôm: $Fe_2O_3$ và $CuO$.
* $Al_2O_3$ và $MgO$ không bị khử, giữ nguyên trạng thái oxide.
* Chất rắn Y gồm: $Al_2O_3, MgO, Fe, Cu$.
* Khi cho Y vào NaOH dư, $Al_2O_3$ là oxide lưỡng tính sẽ bị hòa tan: $Al_2O_3 + 2NaOH \\rightarrow 2NaAlO_2 + H_2O$.
* Phần không tan Z cuối cùng gồm: $MgO, Fe, Cu$.`
    }
  ],
  advanced: [
    {
      question: "Dẫn luồng khí CO qua ống sứ đựng m gam oxide sắt $Fe_xO_y$ nung nóng. Khí thoát ra cho hấp thụ vào nước vôi trong dư thu được kết tủa. Kim loại thu được sau phản ứng cho tác dụng với $H_2SO_4$ loãng dư sinh ra khí $H_2$. Nêu phương pháp giải.",
      answer: `**Mấu chốt:** 
* Số mol oxygen bị chiếm bởi CO chính bằng số mol $CO_2$ sinh ra và bằng số mol kết tủa $CaCO_3$. 
* Số mol sắt đơn chất tính qua số mol $H_2$. 
* Từ tỉ lệ $n_{Fe} : n_O$ ta xác định được công thức oxide.`
    },
    {
      question: "Nhúng một thanh kẽm nặng 50 gam vào dung dịch $AgNO_3$. Sau một thời gian lấy thanh kẽm ra, rửa sạch, sấy khô, cân lại thấy khối lượng thanh kẽm tăng thêm 0,75 gam. Tính khối lượng bạc bám trên thanh kẽm.",
      answer: `1. Gọi số mol Zn đã phản ứng là $x$.
2. Phương trình: $Zn + 2AgNO_3 \\rightarrow Zn(NO_3)_2 + 2Ag$.
3. Khối lượng tăng = $m_{Ag} - m_{Zn} = 108 \\times 2x - 65x = 151x$.
4. $151x = 0.75 \\Rightarrow x \\approx 0.00496$ mol.
5. Khối lượng bạc bám vào: $m_{Ag} = 108 \\times 2 \\times 0.00496 \\approx 1.07$ gam.`
    }
  ]
};

const PracticeExercises = () => {
  const [activeTab, setActiveTab] = useState<'basic' | 'intermediate' | 'advanced'>('basic');
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const tabs = [
    { id: 'basic', label: 'Cơ bản' },
    { id: 'intermediate', label: 'Trung bình' },
    { id: 'advanced', label: 'Nâng cao' },
  ];

  return (
    <section className="py-24 px-4 max-w-5xl mx-auto">
      <ScrollReveal className="text-center mb-12">
        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Bài tập tự luyện</h2>
        <p className="text-slate-600 dark:text-slate-400">Hệ thống hóa các dạng bài tập từ cơ bản đến nâng cao</p>
      </ScrollReveal>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setOpenAccordion(null);
            }}
            className={cn(
              "px-6 py-3 rounded-full font-bold transition-all duration-300",
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Accordion Content */}
      <div className="space-y-4">
        {EXERCISES[activeTab].map((exercise, idx) => (
          <div 
            key={idx} 
            className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden transition-all duration-300 hover:border-blue-500/50 shadow-sm dark:shadow-none"
          >
            <button
              onClick={() => setOpenAccordion(openAccordion === idx ? null : idx)}
              className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
            >
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="text-lg font-medium text-slate-900 dark:text-white pr-8">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {exercise.question}
                  </ReactMarkdown>
                </div>
              </div>
              <ChevronDown 
                className={cn(
                  "w-5 h-5 text-slate-400 dark:text-slate-500 transition-transform duration-300 shrink-0",
                  openAccordion === idx ? "rotate-180 text-blue-600 dark:text-blue-400" : ""
                )} 
              />
            </button>
            
            <AnimatePresence>
              {openAccordion === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 pt-2 ml-12">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl text-slate-700 dark:text-slate-300 prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-100 dark:prose-pre:bg-slate-900">
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {exercise.answer}
                      </ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
};

const Top10Leaderboard = () => {
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void;
    
    const setupListener = async () => {
      try {
        const { ref, onValue, query, orderByChild, limitToLast } = await import('firebase/database');
        const { database } = await import('./firebase');
        
        // We order by score. Since Firebase orderByChild is ascending, we use limitToLast(10) to get the highest scores.
        const leaderboardRef = query(ref(database, 'leaderboard'), orderByChild('score'), limitToLast(10));
        
        unsubscribe = onValue(leaderboardRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const resultsArray = Object.keys(data).map(key => ({
              id: key,
              ...data[key]
            }));
            // Sort descending by score, then ascending by time_spent, then ascending by timestamp for tie-breakers
            resultsArray.sort((a, b) => {
              if (b.score !== a.score) {
                return b.score - a.score;
              }
              const timeA = a.time_spent !== undefined ? a.time_spent : Infinity;
              const timeB = b.time_spent !== undefined ? b.time_spent : Infinity;
              
              if (timeA !== timeB) {
                return timeA - timeB;
              }
              return a.timestamp - b.timestamp;
            });
            setTopUsers(resultsArray);
          } else {
            setTopUsers([]);
          }
          setIsLoading(false);
        });
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <section className="py-24 px-4 max-w-5xl mx-auto">
      <ScrollReveal className="text-center mb-12">
        <h2 className={cn(
          "text-4xl font-bold mb-4 flex items-center justify-center gap-3 transition-colors duration-300",
          "text-slate-900 dark:text-white"
        )}>
          <Medal className="w-10 h-10 text-yellow-500" />
          Bảng Vàng Thành Tích
        </h2>
        <p className="text-slate-600 dark:text-slate-400">Top 10 Luyện Kim Sư xuất sắc nhất</p>
      </ScrollReveal>

      <div className={cn(
        "border rounded-3xl overflow-hidden shadow-2xl transition-colors duration-300",
        "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
      )}>
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : topUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            Chưa có dữ liệu. Hãy là người đầu tiên ghi danh!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className={cn(
                "border-b transition-colors duration-300",
                "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800"
              )}>
                <tr>
                  <th className="px-6 py-4 text-teal-600 dark:text-teal-500 font-bold uppercase text-xs w-20 text-center">Hạng</th>
                  <th className="px-6 py-4 text-teal-600 dark:text-teal-500 font-bold uppercase text-xs">Thí sinh</th>
                  <th className="px-6 py-4 text-teal-600 dark:text-teal-500 font-bold uppercase text-xs">Lớp</th>
                  <th className="px-6 py-4 text-teal-600 dark:text-teal-500 font-bold uppercase text-xs text-center">Thời gian</th>
                  <th className="px-6 py-4 text-teal-600 dark:text-teal-500 font-bold uppercase text-xs text-right">Điểm số</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {topUsers.map((user, idx) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-center">
                      {idx === 0 ? <span className="text-2xl">🥇</span> :
                       idx === 1 ? <span className="text-2xl">🥈</span> :
                       idx === 2 ? <span className="text-2xl">🥉</span> :
                       <span className="text-slate-500 dark:text-slate-400 font-bold">{idx + 1}</span>}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{user.student_name}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{user.student_class}</td>
                    <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">
                      {user.time_spent !== undefined ? `${Math.floor(user.time_spent / 60)}:${(user.time_spent % 60).toString().padStart(2, '0')}` : '--:--'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-4 py-1.5 rounded-full text-sm font-black bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30">
                        {user.score} / {user.total_questions}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

const AdminAccess = ({ setView }: { setView: (v: 'main' | 'admin' | 'exam-room') => void }) => {
  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <ScrollReveal>
        <motion.div 
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="bg-gradient-to-br from-slate-50 dark:from-slate-900 to-slate-100 dark:to-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-[2rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 cursor-pointer group hover:border-teal-500/30 transition-all shadow-xl dark:shadow-2xl"
          onClick={() => setView('admin')}
        >
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-teal-500/10 rounded-[1.5rem] flex items-center justify-center border border-teal-500/20 group-hover:bg-teal-500/20 transition-colors shrink-0">
              <Lock className="w-10 h-10 text-teal-600 dark:text-teal-500" />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Cổng Quản trị viên</h3>
              <p className="text-slate-600 dark:text-slate-400 text-lg max-w-md">Khu vực dành riêng cho giáo viên để quản lý ngân hàng câu hỏi, theo dõi tiến độ và xem kết quả thi của học sinh.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-8 py-4 bg-teal-500 text-white font-black rounded-2xl shadow-[0_0_30px_rgba(20,184,166,0.3)] group-hover:scale-105 transition-transform">
            TRUY CẬP NGAY
            <ChevronRight className="w-6 h-6" />
          </div>
        </motion.div>
      </ScrollReveal>
    </section>
  );
};

// --- Main App ---

const LanguageSwitcher = () => {
  const [lang, setLang] = useState<'vi' | 'en'>('vi');

  useEffect(() => {
    // Check if script is already added
    if (document.getElementById('google-translate-script')) return;

    // Initialize Google Translate
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        { pageLanguage: 'vi', includedLanguages: 'en,vi', autoDisplay: false },
        'google_translate_element'
      );
    };

    // Add Google Translate script
    const addScript = document.createElement('script');
    addScript.id = 'google-translate-script';
    addScript.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    addScript.async = true;
    document.body.appendChild(addScript);
  }, []);

  const changeLanguage = (language: 'vi' | 'en') => {
    if (lang === language) return;
    
    setLang(language);
    
    if (language === 'vi') {
      // Clear translation cookie and reload to restore original
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname + ';';
      window.location.reload();
      return;
    }

    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select) {
      select.value = language;
      select.dispatchEvent(new Event('change'));
    } else {
      // If select is not ready, set cookie and reload
      document.cookie = `googtrans=/vi/${language}; path=/;`;
      document.cookie = `googtrans=/vi/${language}; path=/; domain=` + window.location.hostname + ';';
      window.location.reload();
    }
  };

  // Check initial language from cookie
  useEffect(() => {
    const match = document.cookie.match(/googtrans=\/vi\/(en)/);
    if (match) {
      setLang('en');
    }
  }, []);

  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-full border border-slate-200 dark:border-slate-700">
      <button 
        onClick={() => changeLanguage('vi')} 
        className={cn(
          "px-3 py-1 text-xs font-bold rounded-full transition-colors",
          lang === 'vi' ? "bg-teal-500 text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
        )}
      >
        VI
      </button>
      <button 
        onClick={() => changeLanguage('en')} 
        className={cn(
          "px-3 py-1 text-xs font-bold rounded-full transition-colors",
          lang === 'en' ? "bg-teal-500 text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
        )}
      >
        EN
      </button>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<'main' | 'admin' | 'exam-room'>('main');

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300 selection:bg-teal-500/30",
      "bg-[#0a0f14] text-slate-200"
    )}>
      <ParticleBackground />
      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-40 backdrop-blur-xl border-b transition-colors duration-300",
        "bg-slate-900/50 border-white/5"
      )}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => setView('main')}>
              <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(20,184,166,0.3)]">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <span className={cn(
                "text-lg md:text-xl font-black tracking-tighter hidden sm:block",
                "text-white"
              )}>LUYỆN KIM THUẬT</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6">
            <LanguageSwitcher />
            <button 
              onClick={() => setView('main')} 
              className={cn(
                "text-xs md:text-sm font-bold transition-colors hidden md:block nav-energy-btn",
                view === 'main' ? "text-teal-400" : "text-slate-400 hover:text-teal-400"
              )}
            >
              Trang chủ
            </button>
            <button 
              onClick={() => setView('admin')} 
              className={cn(
                "px-4 md:px-6 py-2 font-bold rounded-full text-xs md:text-sm transition-all shadow-lg nav-energy-btn",
                view === 'admin' 
                  ? "bg-teal-500 text-white shadow-teal-500/20" 
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
              )}
            >
              Admin
            </button>
            <button 
              onClick={() => {
                if (view !== 'main') {
                  setView('main');
                  setTimeout(() => {
                    document.getElementById('virtual-lab')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                } else {
                  document.getElementById('virtual-lab')?.scrollIntoView({ behavior: 'smooth' });
                }
              }} 
              className="px-4 md:px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-full text-xs md:text-sm hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-teal-500/30 flex items-center gap-2 nav-energy-btn"
            >
              <Beaker className="w-4 h-4 hidden md:block" />
              <span className="hidden md:inline">Phòng Thí Nghiệm Ảo</span>
              <span className="md:hidden">Lab Ảo</span>
            </button>
            <button 
              onClick={() => setView('exam-room')} 
              className="px-4 md:px-6 py-2 bg-teal-500 text-white font-bold rounded-full text-xs md:text-sm hover:bg-teal-600 transition-colors shadow-lg shadow-teal-500/20 nav-energy-btn"
            >
              Vào thi
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {view === 'main' ? (
          <>
            <Hero />
            <OreGallery />
            <DeepDive />
            <RecyclingSection />
            <PracticeExercises />
            <VirtualChemistryLab />
            <Top10Leaderboard />
            <AdminAccess setView={setView} />
          </>
        ) : view === 'admin' ? (
          <AdminDashboard />
        ) : (
          <FinalExam />
        )}
      </main>

      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Layers className="w-6 h-6 text-teal-600 dark:text-teal-500" />
            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">LUYỆN KIM THUẬT</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            © 2024 Metallurgy Learning Platform. Thiết kế cho giáo dục hiện đại.
          </p>
        </div>
      </footer>
    </div>
  );
}
