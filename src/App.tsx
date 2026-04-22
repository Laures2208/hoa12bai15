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
  Key,
  LogOut,
  ShieldCheck,
  Palette,
  Users,
  Ban,
  ToggleLeft,
  ToggleRight,
  BookOpen,
  Bell,
  HelpCircle
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, getDoc, updateDoc, setDoc, deleteDoc, addDoc, serverTimestamp, where, getDocs, limit } from 'firebase/firestore';
import { db } from './firebase';
import { Routes, Route } from 'react-router-dom';
import { StudentExamRoom } from './components/StudentExamRoom';
import { StudentLibrary } from './components/StudentLibrary';
import { useAntiCheat } from './hooks/useAntiCheat';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { cn } from './lib/utils';
import { GatewayPage } from './components/GatewayPage';
import { ProfileModal } from './components/ProfileModal';
import { fixLatex } from './utils/latexHelper';
import { AdminDashboard } from './components/AdminDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Gatekeeper } from './components/Gatekeeper';
import { ScratchCardModal } from './components/ScratchCardModal';
import { AdminSettings } from './components/AdminSettings';
import { ExamRoom, Exam } from './components/ExamRoom';
import { NumericKeypad } from './components/NumericKeypad';
import { ORES, LAB_METALS, Ore, Question } from './constants';
import { questionBank } from './data/questionBank';

export function formatTimeSpent(timeSpent: any) {
  if (timeSpent === undefined || timeSpent === null || isNaN(Number(timeSpent))) return '--:--';
  const totalSeconds = Math.max(0, Math.floor(Number(timeSpent)));
  if (totalSeconds === 0) return '--:--';
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

import { Leaderboard } from './components/Leaderboard';
import { VirtualChemistryLab } from './components/VirtualChemistryLab';
import { ParticleBackground } from './components/ParticleBackground';

// --- Components ---

// --- Reusable Scroll Reveal Component ---
export const ScrollReveal = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
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
        style={{ opacity }}
        className="text-center z-10"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-teal-600 dark:text-teal-400 font-mono tracking-widest uppercase text-sm mb-4 block">
            Hóa học vô cơ & Luyện kim
          </span>
          <h1 className={cn(
            "text-6xl md:text-8xl font-black mb-6 tracking-tighter transition-colors text-gradient-crystallize glow-sparkle animate-glow",
            "text-white"
          )}>
            HÀNH TRÌNH <br />
            GIẢI PHÓNG KIM LOẠI
          </h1>
          <div className={cn(
            "max-w-2xl mx-auto backdrop-blur-md p-6 rounded-2xl border shadow-2xl transition-colors",
            "bg-slate-900/50 border-teal-500/20"
          )}>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-slate-300 leading-relaxed"
            >
              Bản chất của quá trình tách kim loại là sự khử các ion kim loại thành nguyên tử:
            </motion.p>
            <motion.div 
              className="text-4xl font-mono text-teal-300 my-6 flex justify-center items-center gap-2 ion-glow whitespace-nowrap flex-nowrap"
            >
              <span className="ion-pulse">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={{ p: 'span' }}>
                  {'$M^{n+}$'}
                </ReactMarkdown>
              </span>
              <span className="mx-1">+</span>
              <span className="electron-move">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={{ p: 'span' }}>
                  {'$ne$'}
                </ReactMarkdown>
              </span>
              <span className="mx-1">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={{ p: 'span' }}>
                  {'$\\rightarrow$'}
                </ReactMarkdown>
              </span>
              <span className="metal-form">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={{ p: 'span' }}>
                  {'$M$'}
                </ReactMarkdown>
              </span>
            </motion.div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-slate-400 text-sm italic"
            >
              Từ quặng thô đến những vật liệu tinh khiết kiến tạo thế giới.
            </motion.p>
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
            className={cn(
              "group relative border rounded-2xl overflow-hidden cursor-pointer transition-all",
              "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-500/50"
            )}
            onClick={() => setSelectedOre(ore)}
          >
            <div className="h-48 overflow-hidden">
              <img 
                src={ore.image || null} 
                alt={ore.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{ore.name}</h3>
              <div className="text-teal-600 dark:text-teal-400 font-mono text-sm mb-4">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {ore.formula}
                </ReactMarkdown>
              </div>
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
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className={cn(
                "border rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl transition-colors",
                "bg-white dark:bg-slate-900 border-teal-500/30"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-64">
                <img src={selectedOre.image || null} alt={selectedOre.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
                    <div className="text-teal-600 dark:text-teal-400 font-mono text-lg">
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {selectedOre.formula}
                      </ReactMarkdown>
                    </div>
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
                      {'Khử ion kim loại trong oxit ở nhiệt độ cao bằng các chất khử mạnh như $C, CO, H_2$ hoặc kim loại mạnh (như $\\mathrm{Al}$).'}
                    </ReactMarkdown>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <h4 className="text-teal-600 dark:text-teal-400 font-bold mb-3">Phản ứng tiêu biểu (Luyện gang):</h4>
                      <div className="text-xl font-mono text-slate-900 dark:text-white bg-slate-200 dark:bg-black/30 p-4 rounded-xl flex justify-center">
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {'$\\mathrm{Fe_2O_3} + 3\\mathrm{CO} \\xrightarrow{t^o} 2\\mathrm{Fe} + 3\\mathrm{CO_2}$'}
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
                      <div className="text-slate-500 dark:text-slate-400 text-sm">
                        <strong className="text-slate-900 dark:text-white block mb-1">Tác động môi trường:</strong>
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {'Phát thải lượng lớn khí nhà kính ($\\mathrm{CO_2}$) và có thể sinh ra khí gây mưa axit ($\\mathrm{SO_2}$) nếu dùng quặng sulfide.'}
                        </ReactMarkdown>
                      </div>
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
                      <div className="w-12 h-12 bg-slate-400 dark:bg-slate-500 rounded-full" />
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
                          {'$\\mathrm{Fe} + \\mathrm{CuSO_4} \\rightarrow \\mathrm{FeSO_4} + \\mathrm{Cu}$'}
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
                    <div 
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
                        {'$\\mathrm{CuSO_4}$'}
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
                        {'$2\\mathrm{Al_2O_3} \\xrightarrow{\\mathrm{dpnc, criolit}} 4\\mathrm{Al} + 3\\mathrm{O_2}$'}
                      </ReactMarkdown>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-3 italic">
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {'Criolit ($\\mathrm{Na_3AlF_6}$) giúp hạ nhiệt độ nóng chảy từ $2050^oC$ xuống $900^oC$.'}
                      </ReactMarkdown>
                    </div>
                  </div>
                  
                  <div className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-8 rounded-3xl">
                    <h4 className="text-xl font-bold text-teal-600 dark:text-teal-400 mb-4">Điện phân dung dịch</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
                      Dùng để tinh luyện và điều chế các kim loại trung bình/yếu (Zn, Cu, Pb, Ag) đạt độ tinh khiết cực cao.
                    </p>
                    <div className="bg-slate-200 dark:bg-black/30 p-4 rounded-xl text-center font-mono text-teal-600 dark:text-teal-300 text-sm">
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {'$2\\mathrm{CuSO_4} + 2\\mathrm{H_2O} \\xrightarrow{\\mathrm{dpdd}} 2\\mathrm{Cu} + 2\\mathrm{H_2SO_4} + \\mathrm{O_2}$'}
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

const FinalExam = ({ setView, onOpenProfile, initialReviewData }: { setView: (v: 'main' | 'admin' | 'exam-room' | 'gateway') => void, onOpenProfile: () => void, initialReviewData?: any }) => {
  const [examStarted, setExamStarted] = useState(false);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [studentInfo, setStudentInfo] = useState<{ name: string, studentClass: string, grade: '10' | '11' | '12' } | null>(() => {
    const saved = localStorage.getItem('lkt_student_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { name: parsed.name, studentClass: parsed.studentClass, grade: parsed.grade || '12' };
    }
    return null;
  });
  const [preparedQuestions, setPreparedQuestions] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [unansweredQuestions, setUnansweredQuestions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(10);
  const [answers, setAnswers] = useState<{ questionId: string | number, selectedOriginalIndex?: number, subAnswers?: string[], answer?: string, isCorrect: boolean }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [fullScreenViolations, setFullScreenViolations] = useState(0);
  const [showFullScreenWarning, setShowFullScreenWarning] = useState(false);
  const [showAnswers, setShowAnswers] = useState(true);
  const [allowReview, setAllowReview] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleAnswers, setShuffleAnswers] = useState(false);
  const [exitCount, setExitCount] = useState(0);
  const [autoSubmitPending, setAutoSubmitPending] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const awayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoNextTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const answersRef = useRef(answers);
  const timeLeftRef = useRef(timeLeft);

  useEffect(() => {
    if (initialReviewData) {
      const { result, examData } = initialReviewData;
      setCurrentExam(examData);
      setScore(result.score);
      setTotalPoints(result.totalPoints || 10);
      
      let finalQuestions = result.preparedQuestions;
      let finalAnswers = result.answers || [];
      
      if (!finalQuestions && examData.questions) {
        finalQuestions = examData.questions.map((q: any) => {
          const optionsWithIndices = (q.options || []).map((opt: string, idx: number) => ({ text: opt, originalIndex: idx }));
          return {
            ...q,
            shuffledOptions: optionsWithIndices
          };
        });
        
        finalAnswers = finalAnswers.map((a: any) => ({
          ...a,
          questionId: typeof a.questionId === 'string' ? a.questionId.split('_')[0] : a.questionId
        }));
      }
      
      setPreparedQuestions(finalQuestions || []);
      setAnswers(finalAnswers);
      setQuizFinished(true);
      setShowReview(true);
      setExamStarted(false);
    }
  }, [initialReviewData]);

  useEffect(() => {
    let unsubscribe: () => void;
    const setupListener = async () => {
      try {
        const { doc, onSnapshot } = await import('firebase/firestore');
        const { db } = await import('./firebase');
        const adminSettingsRef = doc(db, 'admin', 'settings');
        unsubscribe = onSnapshot(adminSettingsRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.showAnswers !== undefined) setShowAnswers(data.showAnswers);
            if (data.allowReview !== undefined) setAllowReview(data.allowReview);
            if (data.shuffleQuestions !== undefined) setShuffleQuestions(data.shuffleQuestions);
            if (data.shuffleAnswers !== undefined) setShuffleAnswers(data.shuffleAnswers);
          }
        }, (error) => {
          console.error("Error in admin settings snapshot:", error);
        });
      } catch (error) {
        console.error("Error setting up settings listener:", error);
      }
    };
    setupListener();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  const currentQ = preparedQuestions[currentStep];
  const savedAnswer = currentQ ? answers.find(a => a.questionId === currentQ.id) : undefined;
  const selectedOption = savedAnswer ? currentQ.shuffledOptions.findIndex((opt: any) => opt.originalIndex === savedAnswer.selectedOriginalIndex) : null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (examStarted && !quizFinished) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleFinishQuizRef.current();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examStarted, quizFinished]);

  const { requestFullscreen, isAway, awayTimeLeft } = useAntiCheat({
    isEnabled: !!(examStarted && !quizFinished && currentExam?.antiCheat),
    maxViolations: 3,
    maxAwayTimeMs: 5000,
    onViolation: (count, max) => {
      // We don't use alert here because it blocks the thread and stops the timer
      // The full screen warning will be shown instead
    },
    onForceSubmit: (reason) => {
      alert(`${reason} Hệ thống sẽ tự động nộp bài.`);
      setShowConfirmSubmit(false);
      if (timerRef.current) clearInterval(timerRef.current);
      handleFinishQuizRef.current();
    }
  });

  const submitResults = async (info: { name: string, studentClass: string, grade?: string }, finalTimeLeft: number) => {
    setIsSubmitting(true);
    const finalAnswers = answersRef.current;
    
    let earnedPoints = 0;
    let totalPossiblePoints = 0;
    let hasCustomPoints = preparedQuestions.some(q => q.points !== undefined);

    preparedQuestions.forEach(q => {
      const maxPoints = q.points !== undefined ? q.points : 1;
      totalPossiblePoints += maxPoints;

      const answer = finalAnswers.find(a => a.questionId === q.id);
      if (answer) {
        if (q.type === 'true_false' && q.subQuestions) {
          const correctSubCount = q.subQuestions.filter((sq, i) => answer.subAnswers?.[i] === sq.answer).length;
          let ratio = 0;
          if (q.subQuestions.length === 4) {
            if (correctSubCount === 1) ratio = 0.1;
            else if (correctSubCount === 2) ratio = 0.25;
            else if (correctSubCount === 3) ratio = 0.5;
            else if (correctSubCount === 4) ratio = 1.0;
          } else {
            ratio = correctSubCount / q.subQuestions.length;
          }
          
          earnedPoints += maxPoints * ratio;
        } else {
          if (answer.isCorrect) {
            earnedPoints += maxPoints;
          }
        }
      }
    });

    let finalScore = 0;
    let finalTotalPoints = 10;
    
    if (hasCustomPoints) {
      finalScore = Number(earnedPoints.toFixed(2));
      finalTotalPoints = Number(totalPossiblePoints.toFixed(2));
    } else {
      finalScore = Number(((earnedPoints / totalPossiblePoints) * 10).toFixed(2));
      finalTotalPoints = 10;
    }
    
    const correctAnswers = finalAnswers.filter(a => a.isCorrect).length;
    setScore(finalScore);
    setTotalPoints(finalTotalPoints);
    
    try {
      const sessionId = `${info.name}_${info.studentClass}`.replace(/\s+/g, '_');
      const sessionSnap = await getDoc(doc(db, 'student_sessions', sessionId));
      if (sessionSnap.exists() && sessionSnap.data().status === 'blocked') {
        console.log('Student is blocked, results will not be submitted.');
        setIsSubmitting(false);
        setQuizFinished(true);
        return;
      }

      if (currentExam) {
        // Check if result already exists to prevent duplicate submissions
        if (currentExam.type === 'Bài thi' || currentExam.type === 'Bài kiểm tra') {
          const q = query(
            collection(db, 'results'),
            where('examId', '==', currentExam.id),
            where('studentName', '==', info.name),
            where('studentClass', '==', info.studentClass)
          );
          const existingResults = await getDocs(q);
          const unretakableResults = existingResults.docs.filter(doc => !doc.data().canRetake);
          
          if (unretakableResults.length > 0) {
            console.log('Result already exists and cannot be retaken, skipping submission.');
            
            // Still need to clean up progress if they somehow got here
            const progressKey = `exam_progress_${currentExam?.id}_${info.name}_${info.studentClass}`;
            localStorage.removeItem(progressKey);
            try {
              await deleteDoc(doc(db, 'exam_progress', progressKey));
            } catch (err) {
              console.error("Error deleting progress from Firestore:", err);
            }
            
            setIsSubmitting(false);
            setQuizFinished(true);
            return;
          }
        }

        const timeSpent = currentExam.timeLimit * 60 - finalTimeLeft;

        await addDoc(collection(db, 'results'), {
          examId: currentExam.id,
          studentName: info.name,
          studentClass: info.studentClass,
          grade: info.grade || '12',
          score: finalScore,
          totalPoints: finalTotalPoints,
          correctAnswers: correctAnswers,
          totalQuestions: preparedQuestions.length,
          timeRemaining: finalTimeLeft,
          timeSpent: timeSpent,
          createdAt: serverTimestamp(),
          answers: finalAnswers,
          preparedQuestions: preparedQuestions
        });
        
        console.log('Results submitted successfully');
      }
      
      const progressKey = `exam_progress_${currentExam?.id}_${info.name}_${info.studentClass}`;
      localStorage.removeItem(progressKey);
      try {
        await deleteDoc(doc(db, 'exam_progress', progressKey));
      } catch (err) {
        console.error("Error deleting progress from Firestore:", err);
      }
    } catch (err) {
      console.error('Error submitting results:', err);
    } finally {
      setIsSubmitting(false);
      setQuizFinished(true);
    }
  };

  const handleFinishQuiz = async () => {
    setShowConfirmSubmit(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (studentInfo) {
      // Check if blocked before submitting
      const sessionId = `${studentInfo.name}_${studentInfo.studentClass}`.replace(/\s+/g, '_');
      const sessionSnap = await getDoc(doc(db, 'student_sessions', sessionId));
      if (sessionSnap.exists() && sessionSnap.data().status === 'blocked') {
        alert('Tài khoản của bạn đã bị chặn bởi Giáo viên. Kết quả bài thi sẽ không được lưu.');
        setView('gateway');
        localStorage.removeItem('lkt_student_session');
        return;
      }
      await submitResults(studentInfo, timeLeftRef.current);
    } else {
      // Fallback if somehow studentInfo is missing, though it shouldn't happen
      alert('Lỗi: Không tìm thấy thông tin học sinh.');
      setQuizFinished(true);
    }
  };

  const handleFinishQuizRef = useRef(handleFinishQuiz);
  useEffect(() => {
    handleFinishQuizRef.current = handleFinishQuiz;
  }, [handleFinishQuiz]);

  useEffect(() => {
    if (autoSubmitPending && preparedQuestions.length > 0 && currentExam) {
      handleFinishQuiz();
      setAutoSubmitPending(false);
    }
  }, [autoSubmitPending, preparedQuestions, currentExam]);

  // Auto-save progress to localStorage
  useEffect(() => {
    if (examStarted && currentExam && !quizFinished && studentInfo) {
      const progressKey = `exam_progress_${currentExam.id}_${studentInfo.name}_${studentInfo.studentClass}`;
      const isLimited = currentExam.type === 'Bài thi' || currentExam.type === 'Bài kiểm tra';
      
      const saveProgress = () => {
        const progress = {
          preparedQuestions,
          answers: answersRef.current,
          timeLeft: timeLeftRef.current,
          currentStep,
          exitCount,
          forceSubmit: isLimited ? exitCount > 2 : false
        };
        localStorage.setItem(progressKey, JSON.stringify(progress));
      };

      // Save immediately when answers or currentStep changes
      saveProgress();
      
      // Also save periodically every 5 seconds to keep timeLeft relatively accurate (localStorage only)
      const interval = setInterval(saveProgress, 5000);
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [answers, currentStep, examStarted, currentExam, quizFinished, studentInfo, preparedQuestions, exitCount]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (examStarted && currentExam && !quizFinished) {
        const progressKey = `exam_progress_${currentExam.id}_${studentInfo?.name}_${studentInfo?.studentClass}`;
        const isLimited = currentExam.type === 'Bài thi' || currentExam.type === 'Bài kiểm tra';
        const newExitCount = isLimited ? exitCount + 1 : exitCount;
        const progress = {
          preparedQuestions,
          answers: answersRef.current,
          timeLeft: timeLeftRef.current,
          currentStep,
          exitCount: newExitCount,
          forceSubmit: isLimited ? newExitCount > 2 : false
        };
        localStorage.setItem(progressKey, JSON.stringify(progress));
        
        // Attempt to save to Firestore (fire-and-forget)
        setDoc(doc(db, 'exam_progress', progressKey), {
          ...progress,
          examId: currentExam.id,
          studentName: studentInfo?.name,
          studentClass: studentInfo?.studentClass,
          updatedAt: serverTimestamp()
        }).catch(err => console.error("Error saving progress to Firestore on unload:", err));
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [examStarted, currentExam, quizFinished, preparedQuestions, currentStep, exitCount, studentInfo]);

  const handleSaveAndExit = async () => {
    const isLimited = currentExam?.type === 'Bài thi' || currentExam?.type === 'Bài kiểm tra';
    
    if (isLimited && exitCount >= 2) {
      alert("Bạn đã hết số lần lưu và thoát (tối đa 2 lần). Bài thi sẽ được tự động nộp.");
      handleFinishQuiz();
      return;
    }
    
    const confirmMessage = isLimited 
      ? `Bạn có chắc chắn muốn lưu và thoát? Bạn còn ${2 - exitCount} lần thoát.`
      : `Bạn có chắc chắn muốn lưu và thoát? Bạn có thể tiếp tục làm bài tập này sau.`;
      
    if (window.confirm(confirmMessage)) {
      const progressKey = `exam_progress_${currentExam?.id}_${studentInfo?.name}_${studentInfo?.studentClass}`;
      const progress = {
        preparedQuestions,
        answers,
        timeLeft,
        currentStep,
        exitCount: isLimited ? exitCount + 1 : exitCount,
        forceSubmit: false
      };
      
      // Save to localStorage as fallback
      localStorage.setItem(progressKey, JSON.stringify(progress));
      
      // Save to Firestore
      try {
        await setDoc(doc(db, 'exam_progress', progressKey), {
          ...progress,
          examId: currentExam?.id,
          studentName: studentInfo?.name,
          studentClass: studentInfo?.studentClass,
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        console.error("Error saving progress to Firestore:", err);
      }
      
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.error(err));
      }
      
      setExamStarted(false);
      setCurrentExam(null);
    }
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

  const generateExam = (exam: Exam) => {
    let questions = exam.questions || [];
    if (exam.shuffleQuestions) {
      questions = shuffleArray([...questions]);
    }

    if (questions.length > 0) {
      const mcQs = questions.filter(q => q.type === 'multiple_choice');
      const tfQs = questions.filter(q => q.type === 'true_false');
      const saQs = questions.filter(q => q.type === 'short_answer');

      const mcPoints = exam.sectionPoints?.multipleChoice || 0;
      const tfPoints = exam.sectionPoints?.trueFalse || 0;
      const saPoints = exam.sectionPoints?.shortAnswer || 0;

      const mcPointsPerQ = mcQs.length > 0 ? mcPoints / mcQs.length : 0;
      const tfPointsPerQ = tfQs.length > 0 ? tfPoints / tfQs.length : 0;
      const saPointsPerQ = saQs.length > 0 ? saPoints / saQs.length : 0;

      return questions.map((q, qIndex) => {
        let points = 0;
        if (q.type === 'multiple_choice') points = mcPointsPerQ;
        else if (q.type === 'true_false') points = tfPointsPerQ;
        else if (q.type === 'short_answer') points = saPointsPerQ;

        const uniqueId = `${q.id}_${qIndex}`;

        if (q.type === 'multiple_choice' && q.options) {
          const optionsWithIndices = q.options.map((opt, idx) => ({ text: opt, originalIndex: idx }));
          return {
            ...q,
            id: uniqueId,
            points,
            shuffledOptions: exam.shuffleAnswers ? shuffleArray(optionsWithIndices) : optionsWithIndices,
            correctAnswer: q.answer ? q.answer.charCodeAt(0) - 65 : 0 // Convert 'A' to 0, 'B' to 1...
          };
        }
        return { ...q, id: uniqueId, points, shuffledOptions: [] };
      });
    }

    // Fallback to old questionBank logic
    const theoryQs = questionBank.filter(q => q.type === 'theory');
    const exerciseQs = questionBank.filter(q => q.type === 'exercise');
    
    const numEach = exam.questionCount / 2;
    const selectedTheory = shuffleArray(theoryQs).slice(0, Math.ceil(numEach));
    const selectedExercise = shuffleArray(exerciseQs).slice(0, Math.floor(numEach));
    
    const combined = shuffleArray([...selectedTheory, ...selectedExercise]);
    
    return combined.map((q, qIndex) => {
      const optionsWithIndices = q.options.map((opt, idx) => ({ text: opt, originalIndex: idx }));
      return {
        ...q,
        id: `${q.id}_${qIndex}`,
        type: 'multiple_choice',
        shuffledOptions: shuffleArray(optionsWithIndices)
      };
    });
  };

  const handleStartExam = async (exam: Exam, resume?: boolean) => {
    setCurrentExam(exam);
    const isEnabled = exam.antiCheat;
    
    if (isEnabled) {
      await requestFullscreen();
    }
    const progressKey = `exam_progress_${exam.id}_${studentInfo?.name}_${studentInfo?.studentClass}`;
    let saved = null;
    
    try {
      const progressDoc = await getDoc(doc(db, 'exam_progress', progressKey));
      if (progressDoc.exists()) {
        saved = progressDoc.data();
      }
    } catch (err) {
      console.error("Error fetching progress from Firestore:", err);
    }
    
    if (!saved) {
      const savedStr = localStorage.getItem(progressKey);
      if (savedStr) {
        saved = JSON.parse(savedStr);
      }
    }
    
    if (saved) {
      if (saved.forceSubmit && (exam.type === 'Bài thi' || exam.type === 'Bài kiểm tra')) {
        alert("Bạn đã vượt quá số lần thoát cho phép. Bài thi đã được tự động nộp.");
        setPreparedQuestions(saved.preparedQuestions);
        setAnswers(saved.answers);
        answersRef.current = saved.answers;
        setTimeLeft(saved.timeLeft);
        timeLeftRef.current = saved.timeLeft;
        setCurrentStep(saved.currentStep);
        setExitCount(saved.exitCount);
        setExamStarted(true);
        setQuizFinished(false);
        setAutoSubmitPending(true);
        localStorage.removeItem(progressKey);
        try {
          await deleteDoc(doc(db, 'exam_progress', progressKey));
        } catch (err) {
          console.error("Error deleting progress from Firestore:", err);
        }
        return;
      } else {
        const shouldResume = resume !== undefined ? resume : window.confirm(`Bạn có bài làm đang dang dở. Bạn có muốn tiếp tục không? ${exam.type === 'Bài thi' || exam.type === 'Bài kiểm tra' ? `(Số lần thoát còn lại: ${2 - saved.exitCount})` : ''}`);
        if (shouldResume) {
          setPreparedQuestions(saved.preparedQuestions);
          setAnswers(saved.answers);
          answersRef.current = saved.answers;
          setTimeLeft(saved.timeLeft);
          timeLeftRef.current = saved.timeLeft;
          setCurrentStep(saved.currentStep);
          setExitCount(saved.exitCount);
        } else {
          localStorage.removeItem(progressKey);
          try {
            await deleteDoc(doc(db, 'exam_progress', progressKey));
          } catch (err) {
            console.error("Error deleting progress from Firestore:", err);
          }
          const questions = generateExam(exam);
          setPreparedQuestions(questions);
          setTimeLeft(exam.timeLimit * 60);
          setAnswers([]);
          answersRef.current = [];
          setCurrentStep(0);
          setExitCount(0);
        }
      }
    } else {
      const questions = generateExam(exam);
      setPreparedQuestions(questions);
      setTimeLeft(exam.timeLimit * 60);
      setAnswers([]);
      answersRef.current = [];
      setCurrentStep(0);
      setExitCount(0);
    }

    setExamStarted(true);
    setFullScreenViolations(0);
    setShowFullScreenWarning(false);
    if (awayTimeoutRef.current) {
      clearTimeout(awayTimeoutRef.current);
      awayTimeoutRef.current = null;
    }
  };

  const handleSelectOption = (idx: number) => {
    if (currentQ.type !== 'multiple_choice') return;
    const selectedObj = currentQ.shuffledOptions[idx];
    const isCorrect = selectedObj.originalIndex === currentQ.correctAnswer;
    
    setAnswers(prev => {
      const existingIdx = prev.findIndex(a => a.questionId === currentQ.id);
      const newAnswer = {
        questionId: currentQ.id,
        selectedOriginalIndex: selectedObj.originalIndex,
        isCorrect,
        type: 'multiple_choice'
      };
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = newAnswer as any;
        return updated;
      }
      return [...prev, newAnswer as any];
    });

    if (autoNextTimeoutRef.current) {
      clearTimeout(autoNextTimeoutRef.current);
    }
    if (currentStep < preparedQuestions.length - 1) {
      autoNextTimeoutRef.current = setTimeout(() => {
        setCurrentStep(s => Math.min(preparedQuestions.length - 1, s + 1));
      }, 400);
    }
  };

  const handleTrueFalseAnswer = (subIdx: number, val: 'Đúng' | 'Sai') => {
    setAnswers(prev => {
      const existingIdx = prev.findIndex(a => a.questionId === currentQ.id);
      let currentSubAnswers = existingIdx >= 0 ? { ...((prev[existingIdx] as any).subAnswers || {}) } : {};
      currentSubAnswers[subIdx] = val;

      const isCorrect = currentQ.subQuestions?.every((sq: any, i: number) => currentSubAnswers[i] === sq.answer);

      const newAnswer = {
        questionId: currentQ.id,
        subAnswers: currentSubAnswers,
        isCorrect,
        type: 'true_false'
      };

      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = newAnswer as any;
        return updated;
      }
      return [...prev, newAnswer as any];
    });
  };

  const handleShortAnswerSubmit = (val: string) => {
    const isCorrect = val.trim() === currentQ.answer?.trim();
    setAnswers(prev => {
      const existingIdx = prev.findIndex(a => a.questionId === currentQ.id);
      const newAnswer = {
        questionId: currentQ.id,
        shortAnswer: val,
        isCorrect,
        type: 'short_answer'
      };
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = newAnswer as any;
        return updated;
      }
      return [...prev, newAnswer as any];
    });
  };

  if (!examStarted) {
    return (
      <ExamRoom 
        isAdmin={false} 
        studentInfo={studentInfo} 
        onTakeExam={handleStartExam} 
        onOpenProfile={onOpenProfile}
      />
    );
  }

  if (isAway && !quizFinished) {
    return (
      <div className="fixed inset-0 z-[9999] bg-rose-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-24 h-24 text-rose-500 mb-6 animate-pulse" />
        <h2 className="text-3xl md:text-5xl font-black text-white mb-4">CẢNH BÁO VI PHẠM</h2>
        <p className="text-xl text-rose-200 mb-8 max-w-2xl">
          Bạn đã rời khỏi màn hình thi. Vui lòng quay lại ngay lập tức!
        </p>
        <div className="text-7xl font-mono font-bold text-rose-500">
          {(awayTimeLeft / 1000).toFixed(1)}s
        </div>
        <p className="text-slate-400 mt-4">
          Hệ thống sẽ tự động nộp bài khi hết thời gian.
        </p>
      </div>
    );
  }

  if (showReview) {
    return (
      <section className="py-24 px-4 max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Xem lại bài làm</h2>
          {currentExam?.showScore !== false && (
            <div className="text-2xl font-black text-teal-600 dark:text-teal-400">{score}/{totalPoints}</div>
          )}
        </div>

        {currentExam && currentExam.showScore !== false && <Leaderboard examId={currentExam.id} />}
        
        {(!showAnswers || currentExam?.allowReview === false) ? (
          <div className="flex flex-col items-center justify-center p-8 bg-amber-500/10 border border-amber-500/20 rounded-2xl gap-4">
            <Lock className="w-12 h-12 text-amber-500" />
            <h4 className="text-xl font-bold text-amber-400">Đã khóa xem lại bài</h4>
            <p className="text-sm text-amber-200 text-center max-w-md">
              Giáo viên đã khóa tính năng xem lại bài thi này. Bạn không thể xem lại đề thi, bài làm cũng như đáp án chi tiết.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {preparedQuestions.map((q, idx) => {
              const studentAns = answers.find(a => a.questionId === q.id);
              return (
                <div key={q.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
                  <div className="flex items-start gap-4 mb-6">
                    <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <div className="text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
                      {q.imageUrl && (
                        <div className="mb-6 flex justify-center">
                          <img 
                            src={q.imageUrl} 
                            alt="Question" 
                            className="max-w-full h-auto rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700/50"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                      <ReactMarkdown 
                        remarkPlugins={[remarkMath]} 
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          img: ({ node, ...props }) => {
                            if (!props.src) return null;
                            return (
                              <img 
                                {...props} 
                                className="max-w-full h-auto rounded-2xl my-6 shadow-xl border border-slate-200 dark:border-slate-700/50 mx-auto block" 
                                referrerPolicy="no-referrer"
                              />
                            );
                          }
                        }}
                      >
                        {fixLatex((q.content || q.text || '').replace(/\[\[IMAGE_PLACEHOLDER(?:_\d+)?\]\]/g, ''))}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {q.type === 'multiple_choice' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {q.shuffledOptions.map((opt: any, oIdx: number) => {
                        const isCorrect = opt.originalIndex === q.correctAnswer;
                        const isSelected = studentAns?.selectedOriginalIndex === opt.originalIndex;
                        
                        return (
                          <div 
                            key={oIdx}
                            className={cn(
                              "p-4 rounded-xl border-2 flex items-center justify-between",
                              showAnswers && isCorrect ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-700 dark:text-emerald-400 font-bold" :
                              isSelected && (!showAnswers || !isCorrect) ? "bg-red-500/10 border-red-500/50 text-red-700 dark:text-red-400 font-bold" :
                              "bg-slate-50 dark:bg-slate-800 border-transparent text-slate-600 dark:text-slate-400"
                            )}
                          >
                            <div className="text-base">
                              <ReactMarkdown 
                                remarkPlugins={[remarkMath]} 
                                rehypePlugins={[rehypeKatex]}
                                components={{
                                  img: ({ node, ...props }) => {
                                    if (!props.src) return null;
                                    return (
                                      <img 
                                        {...props} 
                                        className="max-w-full h-auto rounded-xl my-2 shadow-md border border-slate-200 dark:border-slate-700/50 mx-auto block" 
                                        referrerPolicy="no-referrer"
                                      />
                                    );
                                  }
                                }}
                              >
                                {fixLatex(opt.text)}
                              </ReactMarkdown>
                            </div>
                            {showAnswers && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />}
                            {isSelected && (!showAnswers || !isCorrect) && <XCircle className="w-5 h-5 text-red-600 dark:text-red-500" />}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {q.type === 'true_false' && q.subQuestions && (
                    <div className="space-y-4 mb-6">
                      {q.subQuestions.map((sq: any, i: number) => {
                        const subAns = (studentAns as any)?.subAnswers?.[i];
                        const isCorrect = subAns === sq.answer;
                        return (
                          <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="text-base font-medium text-slate-800 dark:text-slate-100 flex-1 flex items-start">
                              <span className="text-teal-500 font-bold mr-2 mt-1">{String.fromCharCode(97 + i)})</span>
                              <div className="flex-1">
                                <ReactMarkdown 
                                  remarkPlugins={[remarkMath]} 
                                  rehypePlugins={[rehypeKatex]}
                                  components={{
                                    img: ({ node, ...props }) => {
                                      if (!props.src) return null;
                                      return (
                                        <img 
                                          {...props} 
                                          className="max-w-full h-auto rounded-xl my-2 shadow-md border border-slate-200 dark:border-slate-700/50 mx-auto block" 
                                          referrerPolicy="no-referrer"
                                        />
                                      );
                                    }
                                  }}
                                >
                                  {fixLatex(sq.content || sq.text || '')}
                                </ReactMarkdown>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex bg-slate-200 dark:bg-slate-900 p-1 rounded-xl">
                                <div className={cn("px-5 py-2 rounded-xl text-sm font-bold", subAns === 'Đúng' ? "bg-emerald-500 text-white" : "text-slate-300")}>Đúng</div>
                                <div className={cn("px-5 py-2 rounded-xl text-sm font-bold", subAns === 'Sai' ? "bg-rose-500 text-white" : "text-slate-300")}>Sai</div>
                              </div>
                              {showAnswers && (
                                <div className={cn("text-xs font-bold px-3 py-1 rounded-full", isCorrect ? "bg-emerald-500/20 text-emerald-500" : "bg-rose-500/20 text-rose-500")}>
                                  {sq.answer} {isCorrect ? "✓" : "✗"}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {q.type === 'short_answer' && (
                    <div className="mb-6 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="text-sm font-bold text-slate-500">Câu trả lời của bạn:</div>
                        <div className="px-6 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-mono text-xl border-2 border-slate-200 dark:border-slate-700">
                          {(studentAns as any)?.shortAnswer || '---'}
                        </div>
                      </div>
                      {showAnswers && (
                        <div className="flex items-center gap-4">
                          <div className="text-sm font-bold text-teal-500">Đáp án đúng:</div>
                          <div className="px-6 py-2 bg-teal-500/10 rounded-xl font-mono text-xl border-2 border-teal-500/50 text-teal-600 dark:text-teal-400">
                            {q.answer}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {showAnswers && (
                    <div className="bg-teal-500/5 border border-teal-500/20 rounded-2xl p-6">
                      <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold mb-2">
                        <AlertCircle className="w-5 h-5" />
                        Giải thích:
                      </div>
                      <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {fixLatex(q.explanation || q.insight || '')}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

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
    <div className={cn(
      examStarted && !quizFinished && "fixed inset-0 z-[100] bg-[#0a0f14] text-slate-200 overflow-y-auto"
    )}>
      <section id="exam" className={cn(
        "px-4 max-w-4xl mx-auto relative",
        examStarted && !quizFinished ? "py-8 min-h-screen flex flex-col" : "py-24"
      )}>
        {showFullScreenWarning && (
          <div className="fixed inset-0 z-[110] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
              <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Cảnh báo vi phạm</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Bạn đã thoát toàn màn hình. Đây là lần vi phạm thứ {fullScreenViolations}/3. Nếu vi phạm quá 3 lần, hệ thống sẽ tự động nộp bài.
              </p>
              <button 
                onClick={async () => {
                  const docEl = document.documentElement as any;
                  const requestFS = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.msRequestFullscreen;
                  if (requestFS) {
                    try {
                      await requestFS.call(docEl);
                    } catch (err) {
                      alert('Vui lòng cho phép toàn màn hình để tiếp tục.');
                    } finally {
                      setShowFullScreenWarning(false);
                    }
                  } else {
                    setShowFullScreenWarning(false);
                  }
                }}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors"
              >
                Quay lại toàn màn hình
              </button>
            </div>
          </div>
        )}
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl flex-grow">
          {!quizFinished ? (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <span className="text-teal-600 dark:text-teal-500 font-bold block text-lg md:text-xl">Bài thi: {currentExam?.title || 'Chemistry Theory & Quizz'}</span>
                <span className="text-slate-500 dark:text-slate-400 text-xs">Thời gian: {currentExam?.timeLimit} phút</span>
              </div>
              <div className="flex items-center gap-6">
                <button
                  onClick={handleSaveAndExit}
                  className="px-4 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold rounded-xl hover:bg-amber-500/20 transition-colors border border-amber-500/20 flex items-center gap-2 text-sm"
                  title={(currentExam?.type === 'Bài thi' || currentExam?.type === 'Bài kiểm tra') ? `Bạn còn ${2 - exitCount} lần thoát` : `Lưu và thoát (không giới hạn)`}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Lưu & Thoát</span>
                </button>
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
            </div>

            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-8 leading-relaxed">
              {preparedQuestions[currentStep].imageUrl && (
                <div className="mb-6 flex justify-center">
                  <img 
                    src={preparedQuestions[currentStep].imageUrl} 
                    alt="Question" 
                    className="max-w-full h-auto rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/50"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
              <ReactMarkdown 
                remarkPlugins={[remarkMath]} 
                rehypePlugins={[rehypeKatex]}
                components={{
                  img: ({ node, ...props }) => {
                    if (!props.src) return null;
                    return (
                      <img 
                        {...props} 
                        className="max-w-full h-auto rounded-2xl my-6 shadow-2xl border border-slate-200 dark:border-slate-700/50 mx-auto block" 
                        referrerPolicy="no-referrer"
                      />
                    );
                  }
                }}
              >
                {fixLatex((preparedQuestions[currentStep].content || preparedQuestions[currentStep].text || '').replace(/\[\[IMAGE_PLACEHOLDER(?:_\d+)?\]\]/g, ''))}
              </ReactMarkdown>
            </div>

            <div className="space-y-6 mb-10">
              {currentQ.type === 'multiple_choice' && currentQ.shuffledOptions.map((option: any, idx: number) => (
                <button
                  key={`${currentQ.id}_option_${idx}`}
                  onClick={() => handleSelectOption(idx)}
                  className={cn(
                    "w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group",
                    selectedOption === idx 
                      ? "bg-teal-500/10 border-teal-500 text-teal-700 dark:text-teal-400 font-bold" 
                      : "bg-slate-50 dark:bg-slate-800 border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  <div className="font-medium text-base">
                    <ReactMarkdown 
                      remarkPlugins={[remarkMath]} 
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        img: ({ node, ...props }) => {
                          if (!props.src) return null;
                          return (
                            <img 
                              {...props} 
                              className="max-w-full h-auto rounded-xl my-2 shadow-md border border-slate-200 dark:border-slate-700/50 mx-auto block" 
                              referrerPolicy="no-referrer"
                            />
                          );
                        }
                      }}
                    >
                      {fixLatex(option.text)}
                    </ReactMarkdown>
                  </div>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                    selectedOption === idx ? "border-teal-500 bg-teal-500 text-white" : "border-slate-300 dark:border-slate-600"
                  )}>
                    {selectedOption === idx && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </button>
              ))}

              {currentQ.type === 'true_false' && currentQ.subQuestions && (
                <div className="space-y-4">
                  {currentQ.subQuestions.map((sq: any, i: number) => {
                    const subAns = (savedAnswer as any)?.subAnswers?.[i];
                    return (
                      <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="text-base font-medium text-slate-900 dark:text-slate-100 flex-1 flex items-start">
                          <span className="text-teal-500 font-bold mr-2 mt-1">{String.fromCharCode(97 + i)})</span>
                          <div className="flex-1">
                            <ReactMarkdown 
                              remarkPlugins={[remarkMath]} 
                              rehypePlugins={[rehypeKatex]}
                              components={{
                                img: ({ node, ...props }) => {
                                  if (!props.src) return null;
                                  return (
                                    <img 
                                      {...props} 
                                      className="max-w-full h-auto rounded-xl my-2 shadow-md border border-slate-200 dark:border-slate-700/50 mx-auto block" 
                                      referrerPolicy="no-referrer"
                                    />
                                  );
                                }
                              }}
                            >
                              {fixLatex(sq.content || sq.text || '')}
                            </ReactMarkdown>
                          </div>
                        </div>
                        <div className="flex bg-slate-200 dark:bg-slate-900 p-1 rounded-xl">
                              <button
                                onClick={() => handleTrueFalseAnswer(i, 'Đúng')}
                                className={cn(
                                  "px-5 py-2 rounded-xl text-sm font-bold transition-all",
                                  subAns === 'Đúng' ? "bg-emerald-500 text-white shadow-md" : "text-slate-300 hover:bg-slate-600"
                                )}
                              >
                                Đúng
                              </button>
                              <button
                                onClick={() => handleTrueFalseAnswer(i, 'Sai')}
                                className={cn(
                                  "px-5 py-2 rounded-xl text-sm font-bold transition-all",
                                  subAns === 'Sai' ? "bg-rose-500 text-white shadow-md" : "text-slate-300 hover:bg-slate-600"
                                )}
                              >
                                Sai
                              </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {currentQ.type === 'short_answer' && (
                <div className="flex flex-col items-center gap-8">
                  <div className="w-full max-w-xs">
                    <NumericKeypad 
                      value={(savedAnswer as any)?.shortAnswer || ''} 
                      onChange={handleShortAnswerSubmit} 
                    />
                  </div>
                  <div className="text-slate-500 text-xs italic">
                    * Nhập tối đa 4 ký tự (bao gồm dấu phẩy và dấu trừ).
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);
                    setCurrentStep(s => Math.max(0, s - 1));
                  }}
                  disabled={currentStep === 0}
                  className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Câu trước
                </button>
                
                <div className="flex flex-col items-end gap-3">
                  <button
                    onClick={() => {
                      if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);
                      setCurrentStep(s => Math.min(preparedQuestions.length - 1, s + 1));
                    }}
                    disabled={currentStep === preparedQuestions.length - 1}
                    className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    Câu tiếp
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <button
                    onClick={checkAndConfirmSubmit}
                    className="flex items-center gap-2 px-6 py-4 bg-teal-500 text-white font-bold rounded-2xl hover:bg-teal-600 transition-colors shadow-[0_0_15px_rgba(20,184,166,0.4)]"
                  >
                    <Send className="w-5 h-5" />
                    Nộp bài
                  </button>
                </div>
              </div>

              {/* Question Navigator Grid */}
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
                <h3 className="text-slate-700 dark:text-slate-300 font-bold mb-4 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-teal-500" />
                  Danh sách câu hỏi
                </h3>
                <div className="flex flex-wrap gap-2">
                  {preparedQuestions.map((q, idx) => {
                    const ans = answers.find(a => a.questionId === q.id);
                    const isAnswered = ans !== undefined && (
                      q.type === 'true_false' 
                        ? (ans.subAnswers && Object.keys(ans.subAnswers).length === q.subQuestions?.length)
                        : (ans.selectedOriginalIndex !== undefined || (ans as any).shortAnswer !== undefined)
                    );
                    
                    return (
                      <button
                        key={q.id || idx}
                        onClick={() => {
                          if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);
                          setCurrentStep(idx);
                        }}
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all",
                          currentStep === idx
                            ? "bg-teal-500 text-white shadow-[0_0_10px_rgba(20,184,166,0.5)] scale-110"
                            : isAnswered
                              ? "bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30"
                              : "bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                        )}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-teal-500/20 border border-teal-500/30"></div>
                    <span>Đã làm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"></div>
                    <span>Chưa làm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                    <span>Đang chọn</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-teal-500/10 dark:bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-12 h-12 text-teal-600 dark:text-teal-500" />
            </div>
            
            {currentExam?.showScore === false ? (
              <>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Hoàn thành bài thi!</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-8">Chúc mừng {studentInfo?.name} đã hoàn thành bài thi.</p>
                
                <div className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 max-w-2xl mx-auto mb-12">
                  <CheckCircle2 className="w-16 h-16 text-teal-500 mx-auto mb-4" />
                  <p className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                    Bài làm của bạn đã được ghi nhận.
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    Điểm số hiện đang được ẩn đi bởi giáo viên.
                  </p>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Kết thúc bài thi</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-8">Chúc mừng {studentInfo?.name} đã hoàn thành bài thi.</p>
                <div className="text-5xl font-black text-teal-600 dark:text-teal-400 mb-12">{score}/{totalPoints}</div>
              </>
            )}

            <div className="flex flex-col gap-4">
              <p className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Kết quả đã được tự động lưu lại!
              </p>
              {allowReview && currentExam?.showScore !== false && (
                <button 
                  onClick={() => setShowReview(true)}
                  className="px-10 py-4 bg-teal-500 text-white font-bold rounded-2xl hover:bg-teal-600 transition-colors mx-auto"
                >
                  Xem lại bài làm
                </button>
              )}
              <button 
                onClick={() => setView('main')}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm transition-colors mt-4"
              >
                Về trang chủ
              </button>
            </div>
            
            {currentExam && currentExam.showScore !== false && <Leaderboard examId={currentExam.id} />}
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
      </section>
    </div>
  );
};

import { AdminAnnouncements } from './components/AdminAnnouncements';
import { AdminTheory } from './components/AdminTheory';
import { StudentTheory } from './components/StudentTheory';

const AdminPortal = () => {
  const [activeTab, setActiveTab] = useState<'results' | 'gatekeeper' | 'settings' | 'exams' | 'announcements' | 'theory'>('results');
  const [results, setResults] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('all');
  const [filterGrade, setFilterGrade] = useState<'all' | '10' | '11' | '12'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    let unsubscribeResults: () => void;
    let unsubscribeExams: () => void;
    
    const setupListener = async () => {
      setIsLoading(true);
      try {
        // Fetch exams for filter
        const examsRef = query(collection(db, 'exams_bank'), orderBy('createdAt', 'desc'));
        unsubscribeExams = onSnapshot(examsRef, (snapshot) => {
          const examsArray = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as any));
          setExams(examsArray);
        }, (error) => {
          console.error("Error in exams snapshot:", error);
        });

        // Results listener
        let resultsRef = collection(db, 'results');
        
        unsubscribeResults = onSnapshot(resultsRef, (snapshot) => {
          let resultsArray = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as any));
          
          if (filterGrade !== 'all') {
            resultsArray = resultsArray.filter(res => res.grade === filterGrade);
          }

          if (selectedExamId !== 'all') {
            resultsArray = resultsArray.filter(res => res.examId === selectedExamId);
          }
          
          // Sort by score descending, then by timeSpent ascending, then by createdAt ascending
          resultsArray.sort((a, b) => {
            const scoreA = a.totalPoints ? (a.score / a.totalPoints) : (a.score / 10);
            const scoreB = b.totalPoints ? (b.score / b.totalPoints) : (b.score / 10);
            
            if (scoreB !== scoreA) {
              return scoreB - scoreA;
            }
            const timeSpentA = (a.timeSpent !== undefined && a.timeSpent > 0) ? a.timeSpent : Infinity;
            const timeSpentB = (b.timeSpent !== undefined && b.timeSpent > 0) ? b.timeSpent : Infinity;
            if (timeSpentA !== timeSpentB) {
              return timeSpentA - timeSpentB;
            }
            const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : a.createdAt;
            const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : b.createdAt;
            return timeA - timeB;
          });
          
          setResults(resultsArray);
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
      if (unsubscribeResults) unsubscribeResults();
      if (unsubscribeExams) unsubscribeExams();
    };
  }, [isAuthenticated, selectedExamId, filterGrade]);

  const handleClearData = async () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa TOÀN BỘ kết quả thi không? Hành động này không thể hoàn tác!`)) {
      try {
        const { collection, getDocs, deleteDoc, doc } = await import('firebase/firestore');
        const { db } = await import('./firebase');
        const snapshot = await getDocs(collection(db, 'results'));
        const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, 'results', d.id)));
        await Promise.all(deletePromises);
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
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('./firebase');
      const passwordRef = doc(db, 'admin', 'password');
      const snapshot = await getDoc(passwordRef);
      const actualPassword = snapshot.exists() ? snapshot.data().value : 'admin123';
      
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
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('./firebase');
      await setDoc(doc(db, 'admin', 'password'), { value: newPassword });
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h2 className={cn(
          "text-3xl font-bold flex items-center gap-3 transition-colors duration-300",
          "text-slate-900 dark:text-white"
        )}>
          <Table className="text-teal-500" />
          Quản trị Hệ thống (Giáo viên)
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 ml-2">v2.2.8</span>
        </h2>
        <div className="flex items-center gap-4 flex-wrap">
          <button 
            onClick={() => setIsChangingPassword(true)}
            className="px-4 py-2 bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30 rounded-lg hover:bg-teal-500 hover:text-white transition-colors font-bold text-sm flex items-center gap-2"
          >
            <Key className="w-4 h-4" />
            Đổi mật khẩu
          </button>
          <div className={cn("p-2 text-teal-600 dark:text-teal-400 rounded-lg", isLoading && "animate-spin")}>
            <RefreshCw className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-8 border-b border-slate-200 dark:border-slate-800 pb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('results')}
          className={cn(
            "px-6 py-2 rounded-full font-bold transition-all whitespace-nowrap flex items-center gap-2",
            activeTab === 'results' 
              ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20" 
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
          )}
        >
          <Table className="w-4 h-4" />
          Kết quả thi
        </button>
        <button
          onClick={() => setActiveTab('gatekeeper')}
          className={cn(
            "px-6 py-2 rounded-full font-bold transition-all whitespace-nowrap flex items-center gap-2",
            activeTab === 'gatekeeper' 
              ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20" 
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
          )}
        >
          <ShieldCheck className="w-4 h-4" />
          Cổng An Ninh
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={cn(
            "px-6 py-2 rounded-full font-bold transition-all whitespace-nowrap flex items-center gap-2",
            activeTab === 'settings' 
              ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20" 
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
          )}
        >
          <Palette className="w-4 h-4" />
          Giao diện
        </button>
        <button
          onClick={() => setActiveTab('exams')}
          className={cn(
            "px-6 py-2 rounded-full font-bold transition-all whitespace-nowrap flex items-center gap-2",
            activeTab === 'exams' 
              ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20" 
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
          )}
        >
          <BookOpen className="w-4 h-4" />
          Quản lý Đề thi
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={cn(
            "px-6 py-2 rounded-full font-bold transition-all whitespace-nowrap flex items-center gap-2",
            activeTab === 'announcements' 
              ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20" 
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
          )}
        >
          <MessageSquare className="w-4 h-4" />
          Thông báo
        </button>
        <button
          onClick={() => setActiveTab('theory')}
          className={cn(
            "px-6 py-2 rounded-full font-bold transition-all whitespace-nowrap flex items-center gap-2",
            activeTab === 'theory' 
              ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20" 
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
          )}
        >
          <BookOpen className="w-4 h-4" />
          Lý thuyết
        </button>
      </div>

      {activeTab === 'announcements' && (
        <ErrorBoundary>
          <AdminAnnouncements />
        </ErrorBoundary>
      )}

      {activeTab === 'theory' && (
        <ErrorBoundary>
          <AdminTheory />
        </ErrorBoundary>
      )}

      {activeTab === 'exams' && (
        <ErrorBoundary>
          <AdminDashboard />
        </ErrorBoundary>
      )}

      {activeTab === 'results' && (
        <>
          <div className="flex justify-between items-center mb-8">
            <div className="flex gap-4">
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value as any)}
                className="px-6 py-2 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 outline-none focus:border-teal-500"
              >
                <option value="all">Tất cả khối lớp</option>
                <option value="10">Khối 10</option>
                <option value="11">Khối 11</option>
                <option value="12">Khối 12</option>
              </select>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="px-6 py-2 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 outline-none focus:border-teal-500"
              >
                <option value="all">Tất cả bài thi</option>
                {exams.filter(e => filterGrade === 'all' || e.grade === filterGrade).map(exam => (
                  <option key={exam.id} value={exam.id}>{exam.title}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={handleClearData}
              className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/30 rounded-lg hover:bg-red-500 hover:text-white transition-colors font-bold text-sm flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Xóa toàn bộ kết quả
            </button>
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
                <th className="px-6 py-4 text-teal-600 dark:text-teal-500 font-bold uppercase text-xs">Thao tác</th>
                <th className="px-6 py-4 text-teal-600 dark:text-teal-500 font-bold uppercase text-xs">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {results.map((res) => (
                <React.Fragment key={res.id}>
                  <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{res.studentName}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{res.studentClass}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold",
                        res.score >= ((res.totalPoints || 10) / 2) ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-red-500/20 text-red-600 dark:text-red-400"
                      )}>
                        {res.score}/{res.totalPoints || 10}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                      {formatTimeSpent(res.timeSpent)}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">
                      {res.createdAt ? new Date(res.createdAt.toMillis ? res.createdAt.toMillis() : res.createdAt).toLocaleString('vi-VN') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button 
                        onClick={async () => {
                          const studentName = res.studentName?.trim();
                          const studentClass = res.studentClass?.trim();
                          if (!studentName || !studentClass) {
                            alert('Lỗi: Không tìm thấy thông tin học sinh để chặn.');
                            return;
                          }

                          if (window.confirm(`Bạn có chắc chắn muốn CHẶN học sinh ${studentName} (${studentClass})? Học sinh này sẽ bị out khỏi lớp ngay lập tức.`)) {
                            try {
                              const sessionId = `${studentName}_${studentClass}`.replace(/\s+/g, '_');
                              console.log('Attempting to block student with sessionId:', sessionId);
                              await updateDoc(doc(db, 'student_sessions', sessionId), { status: 'blocked' });
                              alert('Đã chặn học sinh thành công!');
                            } catch (error) {
                              console.error('Lỗi khi chặn học sinh:', error);
                              alert('Không tìm thấy phiên đăng nhập của học sinh này hoặc lỗi hệ thống.');
                            }
                          }
                        }}
                        className="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-colors"
                        title="Chặn học sinh"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={async () => {
                          const studentName = res.studentName?.trim();
                          const studentClass = res.studentClass?.trim();
                          if (!studentName || !studentClass) {
                            alert('Lỗi: Không tìm thấy thông tin học sinh để xoá.');
                            return;
                          }

                          if (window.confirm(`Bạn có chắc chắn muốn đuổi học sinh ${studentName} (${studentClass}) ra khỏi lớp?\n\nHành động này sẽ XOÁ TOÀN BỘ dữ liệu của học sinh này (điểm, bài đã làm, dữ liệu trên bảng xếp hạng, v.v.).\n\nKhông thể hoàn tác!`)) {
                            try {
                              const sessionId = `${studentName}_${studentClass}`.replace(/\s+/g, '_');
                              
                              // 1. Delete session
                              try {
                                await deleteDoc(doc(db, 'student_sessions', sessionId));
                              } catch (e) {
                                console.error('Lỗi khi xoá session:', e);
                              }
                              
                              // 2. Delete all results for this student
                              const q = query(
                                collection(db, 'results'),
                                where('studentName', '==', studentName),
                                where('studentClass', '==', studentClass)
                              );
                              const snapshot = await getDocs(q);
                              
                              if (!snapshot.empty) {
                                const { writeBatch } = await import('firebase/firestore');
                                const batches = [];
                                let currentBatch = writeBatch(db);
                                let operationCount = 0;

                                snapshot.forEach(docSnap => {
                                  currentBatch.delete(docSnap.ref);
                                  operationCount++;

                                  if (operationCount === 500) {
                                    batches.push(currentBatch.commit());
                                    currentBatch = writeBatch(db);
                                    operationCount = 0;
                                  }
                                });

                                if (operationCount > 0) {
                                  batches.push(currentBatch.commit());
                                }

                                await Promise.all(batches);
                              }
                              
                              // 3. Delete from SQLite database
                              try {
                                await fetch(`/api/admin/students/${encodeURIComponent(studentName)}/${encodeURIComponent(studentClass)}`, {
                                  method: 'DELETE'
                                });
                              } catch (err) {
                                console.error("Error deleting from SQLite:", err);
                              }
                              
                              alert(`Đã xoá học sinh ${studentName} và toàn bộ dữ liệu liên quan.`);
                            } catch (error) {
                              console.error('Lỗi khi xoá học sinh:', error);
                              alert('Có lỗi xảy ra khi xoá dữ liệu học sinh.');
                            }
                          }
                        }}
                        className="p-2 bg-slate-800 text-slate-400 hover:bg-rose-500 hover:text-white rounded-lg transition-colors"
                        title="Đuổi khỏi lớp và xoá dữ liệu"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
                                const exam = exams.find(e => e.id === res.examId);
                                const baseQuestions = res.preparedQuestions || exam?.questions || [];
                                const qId = typeof ans.questionId === 'string' ? ans.questionId.split('_')[0] : ans.questionId;
                                const question = baseQuestions.find((q: any) => q.id === ans.questionId || q.id === qId);
                                if (!question) return null;
                                return (
                                  <div key={`${res.id}_ans_${idx}`} className={cn(
                                    "p-4 rounded-xl border",
                                    ans.isCorrect ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"
                                  )}>
                                    <div className="flex justify-between items-start mb-2">
                                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Câu {idx + 1} ({question.type === 'multiple_choice' ? 'TN' : question.type === 'true_false' ? 'Đ/S' : 'TLN'})</span>
                                      {ans.isCorrect ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                      ) : (
                                        <XCircle className="w-4 h-4 text-red-500" />
                                      )}
                                    </div>
                                    <div className="text-sm font-medium text-slate-900 dark:text-white mb-3">
                                      {question.imageUrl && (
                                        <div className="mb-3 flex justify-center">
                                          <img 
                                            src={question.imageUrl} 
                                            alt="Question" 
                                            className="max-w-full h-auto rounded-xl shadow-md border border-slate-200 dark:border-slate-700/50"
                                            referrerPolicy="no-referrer"
                                          />
                                        </div>
                                      )}
                                      <ReactMarkdown 
                                        remarkPlugins={[remarkMath]} 
                                        rehypePlugins={[rehypeKatex]}
                                        components={{
                                          img: ({ node, ...props }) => {
                                            if (!props.src) return null;
                                            return (
                                              <img 
                                                {...props} 
                                                className="max-w-full h-auto rounded-xl my-3 shadow-md border border-slate-200 dark:border-slate-700/50 mx-auto block" 
                                                referrerPolicy="no-referrer"
                                              />
                                            );
                                          }
                                        }}
                                      >
                                        {fixLatex((question.content || question.text || '').replace(/\[\[IMAGE_PLACEHOLDER(?:_\d+)?\]\]/g, ''))}
                                      </ReactMarkdown>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      {question.type === 'multiple_choice' && (
                                        <div className="space-y-1">
                                          <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                            <span className="font-bold">Đã chọn:</span> 
                                            <ReactMarkdown 
                                              remarkPlugins={[remarkMath]} 
                                              rehypePlugins={[rehypeKatex]}
                                              components={{
                                                img: ({ node, ...props }) => {
                                                  if (!props.src) return null;
                                                  return (
                                                    <img 
                                                      {...props} 
                                                      className="max-w-full h-auto rounded-xl my-2 shadow-md border border-slate-200 dark:border-slate-700/50 mx-auto block" 
                                                      referrerPolicy="no-referrer"
                                                    />
                                                  );
                                                }
                                              }}
                                            >
                                              {fixLatex(question.options?.[ans.selectedOriginalIndex] || '---')}
                                            </ReactMarkdown>
                                          </p>
                                          {!ans.isCorrect && (
                                            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                              <span className="font-bold">Đáp án đúng:</span>
                                              <ReactMarkdown 
                                                remarkPlugins={[remarkMath]} 
                                                rehypePlugins={[rehypeKatex]}
                                                components={{
                                                  img: ({ node, ...props }) => {
                                                    if (!props.src) return null;
                                                    return (
                                                      <img 
                                                        {...props} 
                                                        className="max-w-full h-auto rounded-xl my-2 shadow-md border border-slate-200 dark:border-slate-700/50 mx-auto block" 
                                                        referrerPolicy="no-referrer"
                                                      />
                                                    );
                                                  }
                                                }}
                                              >
                                                {fixLatex(question.options?.[question.answer?.charCodeAt(0) - 65] || '---')}
                                              </ReactMarkdown>
                                            </p>
                                          )}
                                        </div>
                                      )}

                                      {question.type === 'true_false' && (
                                        <div className="space-y-1">
                                          {question.subQuestions?.map((sq: any, sIdx: number) => {
                                            const subAns = ans.subAnswers?.[sIdx];
                                            const isSubCorrect = subAns === sq.answer;
                                            return (
                                              <div key={sIdx} className="text-[10px] flex items-center gap-2">
                                                <span className={cn(isSubCorrect ? "text-emerald-500" : "text-rose-500")}>
                                                  {sq.id}) {subAns || '---'}
                                                </span>
                                                <span className="text-slate-400">| Đáp án: {sq.answer}</span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}

                                      {question.type === 'short_answer' && (
                                        <div className="space-y-1">
                                          <p className="text-xs text-slate-600 dark:text-slate-400">
                                            <span className="font-bold">Đã nhập:</span> {ans.shortAnswer || '---'}
                                          </p>
                                          {!ans.isCorrect && (
                                            <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                              <span className="font-bold">Đáp án đúng:</span> {question.answer}
                                            </p>
                                          )}
                                        </div>
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
      </>
      )}

      {activeTab === 'gatekeeper' && <Gatekeeper />}
      {activeTab === 'settings' && <AdminSettings />}

      {isChangingPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-md">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Key className="w-6 h-6 text-teal-500" />
              Đổi mật khẩu Giáo viên
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
      <ScrollReveal className="bg-[#0a0f14] border border-emerald-500/30 rounded-[3rem] p-8 md:p-16 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <RefreshCw className="w-96 h-96 text-emerald-500 animate-[spin_20s_linear_infinite]" />
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
              
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  Lợi ích vượt trội
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-300">
                      <strong className="text-white">Tiết kiệm 95% năng lượng</strong> khi tái chế nhôm so với sản xuất từ quặng bauxite.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-300">
                      <strong className="text-white">Giảm phát thải khí nhà kính</strong> và hạn chế rác thải rắn tại các bãi chôn lấp.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-300">
                      <strong className="text-white">Urban Mining (Khai thác mỏ đô thị):</strong> Rác thải điện tử chứa hàm lượng vàng, đồng, lithium cao hơn nhiều so với quặng tự nhiên.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 relative overflow-hidden shadow-xl">
                <h3 className="text-lg font-bold text-white mb-6">Quy trình Công nghiệp</h3>
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
                        key={`step_${idx}`} 
                        className="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] hover:border-teal-500/50 cursor-pointer"
                        onClick={() => setActiveCard(activeCard === idx ? null : idx)}
                        onMouseLeave={() => setActiveCard(null)}
                      >
                        <div className="aspect-video w-full overflow-hidden">
                          <img src={step.image || null} alt={step.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
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

              <div className="bg-red-950/40 border border-red-900/50 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Rủi ro tại các làng nghề thủ công
                </h3>
                <div className="text-slate-300 text-sm leading-relaxed mb-3">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {'Tái chế thủ công phát thải nhiều khí độc ($\\mathrm{SO_2}$), bụi kim loại gây bệnh hô hấp. Nước thải chứa hóa chất ngấm vào nguồn nước sinh hoạt.'}
                  </ReactMarkdown>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  <strong className="text-red-300">Khuyến cáo:</strong> Không dùng nhôm tái chế thủ công (lẫn chì, cadmium) làm dụng cụ nhà bếp vì ion kim loại nặng dễ giải phóng khi tiếp xúc thức ăn mặn/chua.
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
            key={`${activeTab}_exercise_${idx}`} 
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
                  <ReactMarkdown 
                    remarkPlugins={[remarkMath]} 
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      img: ({ node, ...props }) => {
                        if (!props.src) return null;
                        return (
                          <img 
                            {...props} 
                            className="max-w-full h-auto rounded-xl my-2 shadow-md border border-slate-200 dark:border-slate-700/50 mx-auto block" 
                            referrerPolicy="no-referrer"
                          />
                        );
                      }
                    }}
                  >
                    {fixLatex(exercise.question || '')}
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
                      <ReactMarkdown 
                        remarkPlugins={[remarkMath]} 
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          img: ({ node, ...props }) => {
                            if (!props.src) return null;
                            return (
                              <img 
                                {...props} 
                                className="max-w-full h-auto rounded-xl my-2 shadow-md border border-slate-200 dark:border-slate-700/50 mx-auto block" 
                                referrerPolicy="no-referrer"
                              />
                            );
                          }
                        }}
                      >
                        {fixLatex(exercise.answer || '')}
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
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Cổng Giáo viên</h3>
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

import { StudentAnnouncements } from './components/StudentAnnouncements';

function MainApp({ initialView = 'gateway' }: { initialView?: 'gateway' | 'main' | 'admin' | 'exam-room' | 'announcements' | 'theory' }) {
  const [view, setView] = useState<'gateway' | 'main' | 'admin' | 'exam-room' | 'announcements' | 'theory'>(() => {
    if (initialView !== 'gateway') return initialView;
    const saved = localStorage.getItem('lkt_student_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.grade === '10' || parsed.grade === '11') {
        return 'theory';
      }
      return 'exam-room';
    }
    return 'gateway';
  });
  const [showProfile, setShowProfile] = useState(false);
  const [studentInfo, setStudentInfo] = useState<{ name: string, studentClass: string, grade: '10' | '11' | '12' } | null>(() => {
    const saved = localStorage.getItem('lkt_student_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { name: parsed.name, studentClass: parsed.studentClass, grade: parsed.grade || '12' };
    }
    return null;
  });
  const [antiCheat22, setAntiCheat22] = useState(true);
  const [antiCheat45, setAntiCheat45] = useState(true);
  const [themeConfig, setThemeConfig] = useState({ theme: 'dark-teal', particles: 'electrons' });
  const [latestAnnouncement, setLatestAnnouncement] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAnnouncementToast, setShowAnnouncementToast] = useState(false);
  const [pendingScratchResult, setPendingScratchResult] = useState<any>(null);
  const [reviewData, setReviewData] = useState<any>(null);

  useEffect(() => {
    if (view === 'announcements') {
      localStorage.setItem('lkt_last_seen_announcement', latestAnnouncement?.id || '');
      setUnreadCount(0);
    }
  }, [view, latestAnnouncement]);

  useEffect(() => {
    const savedSession = localStorage.getItem('lkt_student_session');
    if (!savedSession && view !== 'gateway' && view !== 'admin') {
      setView('gateway');
    } else if (savedSession && view !== 'gateway' && view !== 'admin') {
      // Validate session
      const parsed = JSON.parse(savedSession);
      const sessionId = `${parsed.name}_${parsed.studentClass}`.replace(/\s+/g, '_');
      getDoc(doc(db, 'student_sessions', sessionId)).then(sessionDoc => {
        if (sessionDoc.exists()) {
          const data = sessionDoc.data();
          const lastActive = data.lastActive;
          const isToday = lastActive && new Date(lastActive).toDateString() === new Date().toDateString();
          if (!isToday && data.status !== 'blocked') {
            deleteDoc(doc(db, 'student_sessions', sessionId));
            localStorage.removeItem('lkt_student_session');
            setStudentInfo(null);
            setView('gateway');
          } else if (data.status === 'blocked') {
            // Let GatewayPage handle blocked status
            setView('gateway');
          }
        } else {
          localStorage.removeItem('lkt_student_session');
          setStudentInfo(null);
          setView('gateway');
        }
      }).catch(err => {
        console.error("Error validating session:", err);
      });
    }
  }, [view]);

  useEffect(() => {
    let unsubscribeSettings: () => void;
    let unsubscribeConfig: () => void;
    let unsubscribeStudent: () => void;
    let unsubscribeAnnouncements: () => void;
    let unsubscribeScratch: () => void;
    
    const setupListener = async () => {
      const settingsRef = doc(db, 'admin', 'settings');
      unsubscribeSettings = onSnapshot(settingsRef, (snapshot) => {
        if (snapshot.exists()) {
          setAntiCheat22(snapshot.data().antiCheat22 ?? true);
          setAntiCheat45(snapshot.data().antiCheat45 ?? true);
        }
      }, (error) => {
        console.error("Error in settings snapshot:", error);
      });

      const configRef = doc(db, 'system_settings', 'config');
      unsubscribeConfig = onSnapshot(configRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setThemeConfig({
            theme: data.theme || 'dark-teal',
            particles: data.showParticles ? 'electrons' : 'none'
          });
          setAntiCheat22(data.antiCheat ?? true);
        }
      }, (error) => {
        console.error("Error in config snapshot:", error);
      });

      const savedSession = localStorage.getItem('lkt_student_session');
      if (savedSession) {
        try {
          const info = JSON.parse(savedSession);
          setStudentInfo(info);
          const sessionId = `${info.name}_${info.studentClass}`.replace(/\s+/g, '_');

          // Listen pending scratches
          const scratchQuery = query(
            collection(db, 'results'),
            where('studentName', '==', info.name),
            where('studentClass', '==', info.studentClass),
            where('isDistributed', '==', true)
          );
          unsubscribeScratch = onSnapshot(scratchQuery, (snapshot) => {
            const pending = snapshot.docs.find(d => d.data().scratched !== true);
            if (pending) {
              setPendingScratchResult({ id: pending.id, ...pending.data() });
            } else {
              setPendingScratchResult(null);
            }
          });

          // Listen for all announcements to count unread ones
          const qAnnouncements = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
          unsubscribeAnnouncements = onSnapshot(qAnnouncements, (snapshot) => {
            const lastSeenId = localStorage.getItem('lkt_last_seen_announcement');
            let count = 0;
            let latest: any = null;

            snapshot.forEach((doc) => {
              const data = { id: doc.id, ...doc.data() };
              if (!latest) latest = data;
              if (data.id !== lastSeenId) {
                count++;
              }
            });

            setUnreadCount(count);
            setLatestAnnouncement(latest);
            
            if (count > 0 && latest && latest.id !== lastSeenId) {
              setShowAnnouncementToast(true);
              setTimeout(() => setShowAnnouncementToast(false), 5000);
            }
          });
          
          const sessionDoc = await getDoc(doc(db, 'student_sessions', sessionId));
          if (sessionDoc.exists()) {
            const data = sessionDoc.data();
            const lastActive = data.lastActive;
            const isToday = lastActive && new Date(lastActive).toDateString() === new Date().toDateString();
            
            if (!isToday && data.status !== 'blocked') {
              try {
                await deleteDoc(doc(db, 'student_sessions', sessionId));
              } catch (err) {
                console.error("Error deleting old session:", err);
              }
              localStorage.removeItem('lkt_student_session');
              setView('gateway');
              return;
            }
          }

          unsubscribeStudent = onSnapshot(doc(db, 'student_sessions', sessionId), (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              const status = data.status;
              const lastActive = data.lastActive;
              const isToday = lastActive && new Date(lastActive).toDateString() === new Date().toDateString();

              if (!isToday && status !== 'blocked') {
                setView('gateway');
                return;
              }

              if (status === 'blocked') {
                setView('gateway');
                // Don't remove localStorage here so GatewayPage can show the "Bạn đã bị chặn" message
                alert('Tài khoản của bạn đã bị chặn bởi Giáo viên. Bạn sẽ bị đưa ra khỏi lớp.');
              } else if (status !== 'approved') {
                setView('gateway');
              }
            } else {
              // Only remove if the document is actually deleted
              localStorage.removeItem('lkt_student_session');
              setView('gateway');
            }
          });
        } catch (e) {
          console.error("Error parsing session:", e);
        }
      }
    };
    
    setupListener();
    
    // Force dark mode
    document.documentElement.classList.add('dark');
    
    return () => {
      if (unsubscribeSettings) unsubscribeSettings();
      if (unsubscribeConfig) unsubscribeConfig();
      if (unsubscribeStudent) unsubscribeStudent();
      if (unsubscribeAnnouncements) unsubscribeAnnouncements();
      if (unsubscribeScratch) unsubscribeScratch();
    };
  }, []);

  if (view === 'gateway') {
    return (
      <GatewayPage 
        onEnter={(info) => {
          localStorage.setItem('lkt_student_session', JSON.stringify(info));
          setStudentInfo(info);
          setView('exam-room');
        }} 
        onAdminAccess={() => setView('admin')} 
      />
    );
  }

  const getThemeClasses = () => {
    switch (themeConfig.theme) {
      case 'dark-teal': return 'bg-[#0a0f14]';
      case 'dark-blue': return 'bg-gradient-to-br from-blue-950 to-slate-950';
      case 'dark-purple': return 'bg-gradient-to-br from-indigo-950 to-purple-950';
      case 'dark-emerald': return 'bg-gradient-to-br from-emerald-950 to-slate-950';
      default: return 'bg-[#0a0f14]';
    }
  };

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300 selection:bg-teal-500/30",
      "text-slate-200",
      getThemeClasses()
    )}>
      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-40 backdrop-blur-xl border-b transition-colors duration-300",
        "bg-slate-900/50 border-white/5"
      )}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => setView((!studentInfo || studentInfo.grade === '12') ? 'main' : 'theory')}>
              <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(20,184,166,0.3)]">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <span className={cn(
                "text-lg md:text-xl font-black tracking-tighter hidden sm:block",
                "text-white"
              )}>CHEMISTRY THEORY & QUIZZ</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6">
            {(!studentInfo || studentInfo.grade === '12') && (
              <button 
                onClick={() => setView('main')} 
                className={cn(
                  "text-xs md:text-sm font-bold transition-colors hidden md:block nav-energy-btn",
                  view === 'main' ? "text-teal-400" : "text-slate-400 hover:text-teal-400"
                )}
              >
                Phòng thí nghiệm
              </button>
            )}
            <button 
              onClick={() => setView('theory')} 
              className={cn(
                "relative text-xs md:text-sm font-bold transition-colors nav-energy-btn px-3 py-2 rounded-full border border-slate-700 hover:border-teal-500/50",
                view === 'theory' ? "text-teal-400 bg-teal-500/10" : "text-slate-400 hover:text-teal-400"
              )}
            >
              <BookOpen className="w-4 h-4 md:hidden" />
              <span className="hidden md:inline">Lý thuyết</span>
            </button>
            <button 
              onClick={() => setView('announcements')} 
              className={cn(
                "relative text-xs md:text-sm font-bold transition-colors nav-energy-btn px-3 py-2 rounded-full border border-slate-700 hover:border-teal-500/50",
                view === 'announcements' ? "text-teal-400 bg-teal-500/10" : "text-slate-400 hover:text-teal-400"
              )}
            >
              <Bell className="w-4 h-4 md:hidden" />
              <span className="hidden md:inline">Thông báo</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => setView('exam-room')} 
              className="px-4 md:px-6 py-2 bg-teal-500 text-white font-bold rounded-full text-xs md:text-sm hover:bg-teal-600 transition-colors shadow-lg shadow-teal-500/20 nav-energy-btn"
            >
              Vào thi
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('lkt_student_session');
                setView('gateway');
              }}
              className="p-2 md:px-4 md:py-2 bg-slate-800 text-slate-300 font-bold rounded-full text-xs md:text-sm hover:bg-rose-500/20 hover:text-rose-400 transition-colors border border-slate-700 hover:border-rose-500/30 flex items-center gap-2"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Đăng xuất</span>
            </button>
          </div>
        </div>
      </nav>

      <ProfileModal 
        isOpen={showProfile} 
        onClose={() => setShowProfile(false)} 
        studentInfo={studentInfo || { name: '', studentClass: '', grade: '12' }} 
      />

      <AnimatePresence>
        {showAnnouncementToast && latestAnnouncement && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-24 right-4 z-50 bg-slate-800 border border-teal-500/30 shadow-2xl shadow-teal-500/20 rounded-xl p-4 max-w-sm cursor-pointer"
            onClick={() => {
              setView('announcements');
              setShowAnnouncementToast(false);
            }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-1">Thông báo mới từ Giáo viên</h4>
                <p className="text-slate-300 text-sm line-clamp-2">{latestAnnouncement.title}</p>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAnnouncementToast(false);
                }}
                className="text-slate-500 hover:text-white shrink-0 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-20">
        <AnimatePresence mode="wait">
          {view === 'main' && (!studentInfo || studentInfo.grade === '12') ? (
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Hero />
              <OreGallery />
              <DeepDive />
              <RecyclingSection />
              <PracticeExercises />
              <VirtualChemistryLab />
            </motion.div>
          ) : view === 'announcements' ? (
            <motion.div
              key="announcements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto px-4 py-12"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center border border-teal-500/20 shadow-[0_0_20px_rgba(20,184,166,0.15)]">
                  <MessageSquare className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tight">Bảng Tin</h1>
                  <p className="text-slate-400">Cập nhật thông tin mới nhất từ giáo viên</p>
                </div>
              </div>
              <StudentAnnouncements studentInfo={studentInfo || { name: '', studentClass: '', grade: '12' }} isAdmin={false} />
            </motion.div>
          ) : view === 'theory' ? (
            <motion.div
              key="theory"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto px-4 py-12"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center border border-teal-500/20 shadow-[0_0_20px_rgba(20,184,166,0.15)]">
                  <BookOpen className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tight">Lý thuyết</h1>
                  <p className="text-slate-400">Tài liệu và bài giảng hóa học</p>
                </div>
              </div>
              <StudentTheory studentInfo={studentInfo || { name: '', studentClass: '', grade: '12' }} />
            </motion.div>
          ) : view === 'admin' ? (
            <motion.div
              key="admin"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
            >
              <AdminPortal />
            </motion.div>
          ) : (
            <motion.div
              key="exam"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <FinalExam setView={setView} onOpenProfile={() => setShowProfile(true)} initialReviewData={reviewData} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {pendingScratchResult && view !== 'admin' && (
          <ScratchCardModal
            result={pendingScratchResult}
            onClose={() => setPendingScratchResult(null)}
            onViewReview={(examData) => {
              setReviewData({ result: pendingScratchResult, examData });
              setView('exam-room');
            }}
          />
        )}
      </AnimatePresence>

      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Layers className="w-6 h-6 text-teal-600 dark:text-teal-500" />
            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">CHEMISTRY THEORY & QUIZZ</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            © 2024 Metallurgy Learning Platform. Thiết kế cho giáo dục hiện đại.
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 font-mono">
            Phiên bản 2.2.8
          </p>
        </div>
      </footer>
    </div>
  );
}

import { BatterySaverProvider } from './context/BatterySaverContext';

export default function App() {
  return (
    <BatterySaverProvider>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/admin" element={<MainApp initialView="admin" />} />
        <Route path="/library" element={<StudentLibrary />} />
        <Route path="/quiz/:id" element={<StudentExamRoom />} />
      </Routes>
    </BatterySaverProvider>
  );
}
