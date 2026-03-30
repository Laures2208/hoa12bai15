import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Trophy, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Timer,
  Medal,
  User,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { fixLatex } from '../utils/latexHelper';
import { cn } from '../lib/utils';

interface Question {
  id: number;
  type: 'theory' | 'calculation';
  content: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface LeaderboardEntry {
  id: number;
  username: string;
  score: number;
  time_completed: number;
  timestamp: string;
}

export const ExamSystem = () => {
  const [view, setView] = useState<'selection' | 'exam' | 'result' | 'leaderboard'>('selection');
  const [examType, setExamType] = useState<22 | 45>(22);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [username, setUsername] = useState('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchQuestions = async () => {
    const res = await fetch('/api/questions');
    return await res.json();
  };

  const generateExam = (allQuestions: Question[], total: number) => {
    const theory = allQuestions.filter(q => q.type === 'theory');
    const calc = allQuestions.filter(q => q.type === 'calculation');

    const theoryCount = Math.floor(total / 2);
    const calcCount = total - theoryCount;

    const shuffle = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5);

    const selectedTheory = shuffle(theory).slice(0, theoryCount);
    const selectedCalc = shuffle(calc).slice(0, calcCount);

    return shuffle([...selectedTheory, ...selectedCalc]);
  };

  const startExam = async (type: 22 | 45) => {
    if (!username.trim()) {
      alert('Vui lòng nhập tên của bạn');
      return;
    }
    const all = await fetchQuestions();
    const examQuestions = generateExam(all, type);
    setQuestions(examQuestions);
    setExamType(type);
    setTimeLeft(type * 60);
    setStartTime(Date.now());
    setView('exam');
    setCurrentStep(0);
    setUserAnswers({});
  };

  useEffect(() => {
    if (view === 'exam' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            submitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [view, timeLeft]);

  const submitExam = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    const score = questions.reduce((acc, q) => {
      return acc + (userAnswers[q.id] === q.correct_answer ? 1 : 0);
    }, 0);

    const timeCompleted = Math.floor((Date.now() - startTime) / 1000);

    try {
      await fetch(`/api/leaderboard/${examType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, score, timeCompleted })
      });
      setView('result');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchLeaderboard = async (type: 22 | 45) => {
    const res = await fetch(`/api/leaderboard/${type}`);
    const data = await res.json();
    setLeaderboard(data);
    setExamType(type);
    setView('leaderboard');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 min-h-[600px] flex flex-col justify-center">
      <AnimatePresence mode="wait">
        {view === 'selection' && (
          <motion.div 
            key="selection"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-slate-900 border border-teal-500/20 p-8 rounded-3xl shadow-2xl text-center"
          >
            <Trophy className="w-16 h-16 text-teal-500 mx-auto mb-6 glow-teal" />
            <h2 className="text-3xl font-bold text-white mb-2">Sẵn sàng thử thách?</h2>
            <p className="text-slate-400 mb-8">Chọn gói thi phù hợp với năng lực của bạn</p>
            
            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-400 mb-2 text-left">Tên thí sinh</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên của bạn..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-teal-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button 
                onClick={() => startExam(22)}
                className="group p-6 bg-slate-800 hover:bg-teal-500/10 border border-slate-700 hover:border-teal-500 rounded-2xl transition-all text-left"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-teal-500/20 text-teal-400 px-3 py-1 rounded-full text-xs font-bold">CƠ BẢN</span>
                  <Clock className="w-5 h-5 text-slate-500 group-hover:text-teal-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">22 Câu hỏi</h3>
                <p className="text-slate-500 text-sm">Thời gian: 22 Phút</p>
              </button>

              <button 
                onClick={() => startExam(45)}
                className="group p-6 bg-slate-800 hover:bg-teal-500/10 border border-slate-700 hover:border-teal-500 rounded-2xl transition-all text-left"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-xs font-bold">CHUYÊN SÂU</span>
                  <Clock className="w-5 h-5 text-slate-500 group-hover:text-purple-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">45 Câu hỏi</h3>
                <p className="text-slate-500 text-sm">Thời gian: 45 Phút</p>
              </button>
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <button onClick={() => fetchLeaderboard(22)} className="text-slate-500 hover:text-teal-400 text-sm flex items-center gap-1">
                <Medal className="w-4 h-4" /> BXH 22
              </button>
              <button onClick={() => fetchLeaderboard(45)} className="text-slate-500 hover:text-purple-400 text-sm flex items-center gap-1">
                <Medal className="w-4 h-4" /> BXH 45
              </button>
            </div>
          </motion.div>
        )}

        {view === 'exam' && questions.length > 0 && (
          <motion.div 
            key="exam"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col h-full"
          >
            <div className="flex justify-between items-center mb-6 bg-slate-900 p-4 rounded-2xl border border-teal-500/20">
              <div className="flex items-center gap-4">
                <div className="bg-teal-500/20 p-2 rounded-lg">
                  <Timer className="w-6 h-6 text-teal-500" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase font-bold">Thời gian còn lại</div>
                  <div className={cn("text-2xl font-mono font-bold", timeLeft < 60 ? "text-red-500 animate-pulse" : "text-white")}>
                    {formatTime(timeLeft)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 uppercase font-bold">Tiến độ</div>
                <div className="text-xl font-bold text-teal-400">{currentStep + 1} / {questions.length}</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mb-6 flex-1 shadow-xl">
              <div className="mb-8 text-xl leading-relaxed text-white">
                <div className="font-bold text-teal-400 mb-2">Câu {currentStep + 1}:</div>
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {fixLatex(questions[currentStep].content)}
                </ReactMarkdown>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {questions[currentStep].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setUserAnswers({...userAnswers, [questions[currentStep].id]: opt})}
                    className={cn(
                      "p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4",
                      userAnswers[questions[currentStep].id] === opt 
                        ? "bg-teal-500/10 border-teal-500 text-teal-400" 
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-bold",
                      userAnswers[questions[currentStep].id] === opt ? "bg-teal-500 text-slate-900" : "bg-slate-700"
                    )}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button 
                disabled={currentStep === 0}
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 text-slate-400 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" /> Quay lại
              </button>
              
              {currentStep === questions.length - 1 ? (
                <button 
                  onClick={submitExam}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-lg shadow-teal-500/20"
                >
                  Nộp bài <CheckCircle2 className="w-5 h-5" />
                </button>
              ) : (
                <button 
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
                >
                  Tiếp theo <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </motion.div>
        )}

        {view === 'result' && (
          <motion.div 
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-teal-500/20 p-12 rounded-3xl shadow-2xl text-center"
          >
            <div className="w-24 h-24 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-teal-500" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-2">Hoàn thành!</h2>
            <p className="text-slate-400 mb-8">Kết quả của bạn đã được lưu lại</p>
            
            <div className="grid grid-cols-2 gap-8 mb-12">
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                <div className="text-xs text-slate-500 uppercase font-bold mb-1">Điểm số</div>
                <div className="text-4xl font-black text-teal-400">
                  {questions.reduce((acc, q) => acc + (userAnswers[q.id] === q.correct_answer ? 1 : 0), 0)} / {questions.length}
                </div>
              </div>
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                <div className="text-xs text-slate-500 uppercase font-bold mb-1">Thời gian</div>
                <div className="text-4xl font-black text-white">
                  {formatTime(Math.floor((Date.now() - startTime) / 1000))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={() => fetchLeaderboard(examType)}
                className="w-full py-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                Xem Bảng xếp hạng <Medal className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setView('selection')}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all"
              >
                Làm lại bài thi
              </button>
            </div>
          </motion.div>
        )}

        {view === 'leaderboard' && (
          <motion.div 
            key="leaderboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <Medal className={cn("w-8 h-8", examType === 45 ? "text-purple-500" : "text-teal-500")} />
                <h2 className="text-2xl font-bold text-white">Bảng xếp hạng {examType} câu</h2>
              </div>
              <button onClick={() => setView('selection')} className="text-slate-500 hover:text-white"><X className="w-6 h-6" /></button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {leaderboard.map((entry, idx) => (
                <div 
                  key={entry.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border transition-all",
                    idx === 0 ? "bg-yellow-500/10 border-yellow-500/30" : "bg-slate-800 border-slate-700"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-black text-sm",
                      idx === 0 ? "bg-yellow-500 text-slate-900" : "bg-slate-700 text-slate-400"
                    )}>
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-white">{entry.username}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest">
                        {new Date(entry.timestamp).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-teal-400">{entry.score} / {examType}</div>
                    <div className="text-xs text-slate-500">{formatTime(entry.time_completed)}</div>
                  </div>
                </div>
              ))}
              {leaderboard.length === 0 && (
                <div className="text-center py-12 text-slate-500 italic">Chưa có dữ liệu. Hãy là người đầu tiên!</div>
              )}
            </div>

            <button 
              onClick={() => setView('selection')}
              className="w-full mt-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              Quay lại <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
