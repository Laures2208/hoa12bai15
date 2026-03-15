import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Beaker, Zap, Flame, Droplets, AlertTriangle, CheckCircle2, FlaskConical, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

type SubstanceA = 'MgCl2' | 'NaCl' | 'Fe2O3' | 'CuO' | 'AgNO3' | 'CuSO4' | 'Cu';
type SubstanceB = 'None' | 'C' | 'CO' | 'Al' | 'Fe' | 'Zn' | 'HNO3';
type Method = 'dpnc' | 'nl' | 'tl' | 'other';

interface ReactionResult {
  success: boolean;
  message: string;
  equation?: string;
  animationType?: 'gas_cl2' | 'thermite' | 'solid_red' | 'solid_grey' | 'precipitate_ag' | 'precipitate_cu' | 'gas_no2';
}

const SUBSTANCE_A_OPTIONS: { id: SubstanceA; name: string; type: 'solid' | 'liquid' }[] = [
  { id: 'MgCl2', name: '$MgCl_2$', type: 'solid' },
  { id: 'NaCl', name: '$NaCl$', type: 'solid' },
  { id: 'Fe2O3', name: '$Fe_2O_3$', type: 'solid' },
  { id: 'CuO', name: '$CuO$', type: 'solid' },
  { id: 'AgNO3', name: '$AgNO_3$ (dd)', type: 'liquid' },
  { id: 'CuSO4', name: '$CuSO_4$ (dd)', type: 'liquid' },
  { id: 'Cu', name: '$Cu$', type: 'solid' },
];

const SUBSTANCE_B_OPTIONS: { id: SubstanceB; name: string; type: 'solid' | 'liquid' | 'gas' | 'none' }[] = [
  { id: 'None', name: 'Không dùng', type: 'none' },
  { id: 'C', name: '$C$', type: 'solid' },
  { id: 'CO', name: '$CO$', type: 'gas' },
  { id: 'Al', name: '$Al$', type: 'solid' },
  { id: 'Fe', name: '$Fe$', type: 'solid' },
  { id: 'Zn', name: '$Zn$', type: 'solid' },
  { id: 'HNO3', name: '$HNO_3$ (đặc)', type: 'liquid' },
];

const METHOD_OPTIONS: { id: Method; name: string; icon: React.ReactNode }[] = [
  { id: 'dpnc', name: 'Điện phân nóng chảy', icon: <Zap className="w-5 h-5 text-yellow-400" /> },
  { id: 'nl', name: 'Nhiệt luyện', icon: <Flame className="w-5 h-5 text-orange-500" /> },
  { id: 'tl', name: 'Thủy luyện', icon: <Droplets className="w-5 h-5 text-blue-400" /> },
  { id: 'other', name: 'Phản ứng khác', icon: <FlaskConical className="w-5 h-5 text-purple-400" /> },
];

const checkReaction = (a: SubstanceA, b: SubstanceB, method: Method): ReactionResult => {
  // Điện phân nóng chảy
  if (method === 'dpnc') {
    if (a === 'MgCl2' && b === 'None') {
      return { success: true, message: 'Điện phân nóng chảy MgCl2 tạo ra Magie và khí Clo.', equation: '$MgCl_2 \\xrightarrow{đpnc} Mg + Cl_2\\uparrow$', animationType: 'gas_cl2' };
    }
    if (a === 'NaCl' && b === 'None') {
      return { success: true, message: 'Điện phân nóng chảy NaCl tạo ra Natri và khí Clo.', equation: '$2NaCl \\xrightarrow{đpnc} 2Na + Cl_2\\uparrow$', animationType: 'gas_cl2' };
    }
    if (['Fe2O3', 'CuO', 'AgNO3', 'CuSO4', 'Cu'].includes(a)) {
      return { success: false, message: `Phương pháp Điện phân nóng chảy thường dùng cho kim loại mạnh (Li, K, Ba, Ca, Na, Mg, Al). Không dùng cho ${a}.` };
    }
    return { success: false, message: 'Điện phân nóng chảy không cần chất phản ứng phụ (Substance B).' };
  }

  // Nhiệt luyện
  if (method === 'nl') {
    if (a === 'Fe2O3') {
      if (b === 'CO') return { success: true, message: 'Khử Fe2O3 bằng CO ở nhiệt độ cao tạo ra Sắt.', equation: '$Fe_2O_3 + 3CO \\xrightarrow{t^\\circ} 2Fe + 3CO_2\\uparrow$', animationType: 'solid_grey' };
      if (b === 'C') return { success: true, message: 'Khử Fe2O3 bằng C ở nhiệt độ cao tạo ra Sắt.', equation: '$Fe_2O_3 + 3C \\xrightarrow{t^\\circ} 2Fe + 3CO\\uparrow$', animationType: 'solid_grey' };
      if (b === 'Al') return { success: true, message: 'Phản ứng nhiệt nhôm tạo ra Sắt nóng chảy.', equation: '$Fe_2O_3 + 2Al \\xrightarrow{t^\\circ} 2Fe + Al_2O_3$', animationType: 'thermite' };
    }
    if (a === 'CuO') {
      if (b === 'CO') return { success: true, message: 'Khử CuO bằng CO tạo ra Đồng đỏ.', equation: '$CuO + CO \\xrightarrow{t^\\circ} Cu + CO_2\\uparrow$', animationType: 'solid_red' };
      if (b === 'C') return { success: true, message: 'Khử CuO bằng C tạo ra Đồng đỏ.', equation: '$CuO + C \\xrightarrow{t^\\circ} Cu + CO\\uparrow$', animationType: 'solid_red' };
      if (b === 'Al') return { success: true, message: 'Phản ứng nhiệt nhôm tạo ra Đồng.', equation: '$3CuO + 2Al \\xrightarrow{t^\\circ} 3Cu + Al_2O_3$', animationType: 'thermite' };
    }
    if (['MgCl2', 'NaCl', 'AgNO3', 'CuSO4'].includes(a)) {
      return { success: false, message: 'Nhiệt luyện dùng chất khử (C, CO, H2, Al) để khử OXIT kim loại trung bình/yếu. Không dùng cho muối.' };
    }
    if (a === 'Cu') return { success: false, message: 'Cu đã là kim loại, không cần khử.' };
    return { success: false, message: 'Chất khử không phù hợp hoặc phản ứng không xảy ra.' };
  }

  // Thủy luyện
  if (method === 'tl') {
    if (a === 'CuSO4') {
      if (b === 'Fe') return { success: true, message: 'Sắt đẩy Đồng ra khỏi dung dịch CuSO4.', equation: '$Fe + CuSO_4 \\rightarrow FeSO_4 + Cu\\downarrow$', animationType: 'precipitate_cu' };
      if (b === 'Zn') return { success: true, message: 'Kẽm đẩy Đồng ra khỏi dung dịch CuSO4.', equation: '$Zn + CuSO_4 \\rightarrow ZnSO_4 + Cu\\downarrow$', animationType: 'precipitate_cu' };
      if (b === 'Al') return { success: true, message: 'Nhôm đẩy Đồng ra khỏi dung dịch CuSO4.', equation: '$2Al + 3CuSO_4 \\rightarrow Al_2(SO_4)_3 + 3Cu\\downarrow$', animationType: 'precipitate_cu' };
    }
    if (a === 'AgNO3') {
      if (['Fe', 'Zn', 'Cu', 'Al'].includes(b)) return { success: true, message: `${b} đẩy Bạc ra khỏi dung dịch AgNO3.`, equation: `$${b} + nAgNO_3 \\rightarrow ${b}(NO_3)_n + nAg\\downarrow$`, animationType: 'precipitate_ag' };
    }
    if (['MgCl2', 'NaCl'].includes(a)) {
      return { success: false, message: `Phương pháp Thủy luyện không thể tách kim loại mạnh khỏi ${a}!` };
    }
    if (['Fe2O3', 'CuO'].includes(a)) {
      return { success: false, message: 'Oxit không tan trong nước, không thể dùng thủy luyện trực tiếp bằng kim loại.' };
    }
    return { success: false, message: 'Kim loại đẩy phải mạnh hơn kim loại trong muối và không tác dụng với nước ở điều kiện thường.' };
  }

  // Phản ứng khác
  if (method === 'other') {
    if (a === 'Cu' && b === 'HNO3') {
      return { success: true, message: 'Đồng tác dụng với HNO3 đặc tạo khí NO2 màu nâu đỏ.', equation: '$Cu + 4HNO_{3(đ)} \\rightarrow Cu(NO_3)_2 + 2NO_2\\uparrow + 2H_2O$', animationType: 'gas_no2' };
    }
    return { success: false, message: 'Phản ứng không hợp lệ trong phạm vi bài học này.' };
  }

  return { success: false, message: 'Vui lòng chọn đầy đủ hóa chất và phương pháp.' };
};

export const MetalExtractionLab = () => {
  const [subA, setSubA] = useState<SubstanceA | null>(null);
  const [subB, setSubB] = useState<SubstanceB | null>(null);
  const [method, setMethod] = useState<Method | null>(null);
  const [labState, setLabState] = useState<'idle' | 'pouring' | 'reacting' | 'result'>('idle');
  const [result, setResult] = useState<ReactionResult | null>(null);

  const handleExecute = () => {
    if (!subA || !subB || !method) {
      alert('Vui lòng chọn đầy đủ Chất đầu, Chất phản ứng và Phương pháp!');
      return;
    }

    setLabState('pouring');
    const res = checkReaction(subA, subB, method);
    setResult(res);

    setTimeout(() => {
      setLabState('reacting');
      setTimeout(() => {
        setLabState('result');
      }, 2500); // Reaction animation duration
    }, 1500); // Pouring animation duration
  };

  const handleReset = () => {
    setSubA(null);
    setSubB(null);
    setMethod(null);
    setLabState('idle');
    setResult(null);
  };

  const renderAnimation = () => {
    if (labState === 'idle') {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-500">
          <Beaker className="w-16 h-16 mb-4 opacity-50" />
          <p>Chọn hóa chất và phương pháp để bắt đầu</p>
        </div>
      );
    }

    if (labState === 'pouring') {
      return (
        <div className="relative flex items-center justify-center h-full">
          <motion.div
            initial={{ y: -50, opacity: 0, rotate: -45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            className="absolute top-10"
          >
            <FlaskConical className="w-16 h-16 text-teal-400" />
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 60 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="w-2 bg-teal-400/50 mx-auto rounded-b-full"
            />
          </motion.div>
          <div className="absolute bottom-10 w-32 h-32 border-4 border-slate-700 rounded-b-3xl border-t-0 flex items-end justify-center pb-2">
             <motion.div 
               initial={{ height: '10%' }}
               animate={{ height: '40%' }}
               transition={{ delay: 0.5, duration: 1 }}
               className="w-[90%] bg-slate-600/30 rounded-b-2xl"
             />
          </div>
        </div>
      );
    }

    if (labState === 'reacting' || labState === 'result') {
      if (!result?.success) {
        return (
          <div className="flex flex-col items-center justify-center h-full text-red-400">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <AlertTriangle className="w-16 h-16 mb-4" />
            </motion.div>
            <p className="font-bold text-lg">Phản ứng thất bại!</p>
          </div>
        );
      }

      // Success Animations
      return (
        <div className="relative flex items-center justify-center h-full">
          {/* Container */}
          <div className="absolute bottom-10 w-32 h-32 border-4 border-slate-700 rounded-b-3xl border-t-0 flex items-end justify-center pb-2 overflow-hidden">
            
            {/* Base Liquid/Solid */}
            <div className={cn(
              "w-[90%] rounded-b-2xl transition-all duration-1000",
              result.animationType === 'gas_cl2' ? "bg-slate-300/50 h-[40%]" :
              result.animationType === 'solid_grey' ? "bg-slate-500 h-[30%]" :
              result.animationType === 'solid_red' ? "bg-red-800 h-[30%]" :
              result.animationType === 'thermite' ? "bg-orange-600 h-[30%]" :
              result.animationType === 'precipitate_cu' ? "bg-blue-500/30 h-[60%]" :
              result.animationType === 'precipitate_ag' ? "bg-slate-400/30 h-[60%]" :
              result.animationType === 'gas_no2' ? "bg-blue-600/50 h-[50%]" :
              "bg-slate-600/30 h-[40%]"
            )} />

            {/* Precipitate / Solid Changes */}
            {result.animationType === 'precipitate_cu' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 2 }}
                className="absolute bottom-2 w-16 h-4 bg-red-700 rounded-full"
              />
            )}
            {result.animationType === 'precipitate_ag' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 2 }}
                className="absolute bottom-2 w-16 h-4 bg-slate-200 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
              />
            )}
            {result.animationType === 'thermite' && labState === 'reacting' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0, 2, 0] }}
                transition={{ duration: 1, repeat: 2 }}
                className="absolute bottom-4 w-20 h-20 bg-yellow-300 rounded-full blur-xl mix-blend-screen"
              />
            )}
          </div>

          {/* Gas Animations */}
          {result.animationType === 'gas_cl2' && (
            <motion.div 
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: [0, 0.8, 0], y: -100 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute bottom-20 w-24 h-24 bg-green-400/40 rounded-full blur-xl"
            />
          )}
          {result.animationType === 'gas_no2' && (
            <motion.div 
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: [0, 0.9, 0], y: -120 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute bottom-20 w-28 h-28 bg-orange-700/60 rounded-full blur-2xl"
            />
          )}
          
          {/* Bubbles for liquids */}
          {['precipitate_cu', 'precipitate_ag', 'gas_no2', 'gas_cl2'].includes(result.animationType || '') && labState === 'reacting' && (
            <div className="absolute bottom-12 flex gap-2">
              {[1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  initial={{ y: 0, opacity: 0 }}
                  animate={{ y: -40, opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  className="w-2 h-2 bg-white/50 rounded-full"
                />
              ))}
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <section className="py-24 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <Beaker className="w-10 h-10 text-teal-500" />
          Phòng Thí Nghiệm Ảo: Tách Kim Loại
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Lựa chọn hóa chất và phương pháp phù hợp để thực hiện phản ứng tách kim loại. 
          Hệ thống sẽ mô phỏng kết quả dựa trên nguyên lý hóa học thực tế.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột 1: Chọn hóa chất */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-sm">1</span>
              Chất đầu (Substance A)
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {SUBSTANCE_A_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSubA(opt.id)}
                  disabled={labState !== 'idle'}
                  className={cn(
                    "p-3 rounded-xl border text-sm font-medium transition-all text-left",
                    subA === opt.id 
                      ? "bg-teal-500/20 border-teal-500 text-teal-300" 
                      : "bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{opt.name}</ReactMarkdown>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-sm">2</span>
              Chất phản ứng (Substance B)
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {SUBSTANCE_B_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSubB(opt.id)}
                  disabled={labState !== 'idle'}
                  className={cn(
                    "p-3 rounded-xl border text-sm font-medium transition-all text-left",
                    subB === opt.id 
                      ? "bg-teal-500/20 border-teal-500 text-teal-300" 
                      : "bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{opt.name}</ReactMarkdown>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cột 2: Chọn phương pháp */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-6">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-sm">3</span>
            Phương pháp tách
          </h3>
          <div className="flex flex-col gap-3">
            {METHOD_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setMethod(opt.id)}
                disabled={labState !== 'idle'}
                className={cn(
                  "p-4 rounded-xl border flex items-center gap-4 transition-all",
                  method === opt.id 
                    ? "bg-teal-500/20 border-teal-500 text-white" 
                    : "bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <div className="p-2 bg-slate-950 rounded-lg">{opt.icon}</div>
                <span className="font-bold">{opt.name}</span>
              </button>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-slate-800">
            <button
              onClick={handleExecute}
              disabled={labState !== 'idle' || !subA || !subB || !method}
              className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Beaker className="w-5 h-5" />
              THỰC HIỆN THÍ NGHIỆM
            </button>
            
            {labState !== 'idle' && (
              <button
                onClick={handleReset}
                className="w-full mt-3 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Làm lại
              </button>
            )}
          </div>
        </div>

        {/* Cột 3: Khu vực thí nghiệm */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-500 to-transparent opacity-50"></div>
          
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 z-10">
            Khu vực quan sát
          </h3>
          
          <div className="flex-1 bg-slate-900/50 rounded-2xl border border-slate-800 relative min-h-[300px]">
            {renderAnimation()}
          </div>

          <AnimatePresence mode="wait">
            {labState === 'result' && result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className={cn(
                  "mt-6 p-4 rounded-xl border",
                  result.success ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30"
                )}
              >
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className={cn("font-bold mb-1", result.success ? "text-emerald-400" : "text-red-400")}>
                      {result.success ? "Thành công!" : "Lỗi phản ứng!"}
                    </h4>
                    <p className="text-slate-300 text-sm mb-2">{result.message}</p>
                    {result.equation && (
                      <div className="p-3 bg-slate-900 rounded-lg text-emerald-300 font-mono text-sm overflow-x-auto">
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {result.equation}
                        </ReactMarkdown>
                      </div>
                    )}
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
