import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, AlertCircle, Clock, ChevronLeft, ChevronRight, Send, HelpCircle, Image as ImageIcon } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { cn } from '../lib/utils';
import 'katex/dist/katex.min.css';
import { ParticleBackground } from './ParticleBackground';

interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  content: string;
  options?: string[];
  imageUrl?: string;
  subQuestions?: { id: string; content: string; answer: string }[];
}

interface Exam {
  id: string;
  title: string;
  timeLimit: number;
  questions: Question[];
  description?: string;
  category?: string;
  showBackgroundEffect?: boolean;
  backgroundEffectType?: string;
}

export const StudentExamRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // 1. Tải dữ liệu từ Firestore
  useEffect(() => {
    const fetchExam = async () => {
      if (!id) {
        setError('ID bài thi không hợp lệ');
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'exams_bank', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const examData = { id: docSnap.id, ...docSnap.data() } as Exam;
          setExam(examData);
          setTimeLeft((examData.timeLimit || 45) * 60); // Đổi phút sang giây
        } else {
          setError('Bài thi không tồn tại');
        }
      } catch (err) {
        console.error("Lỗi khi tải bài thi:", err);
        setError('Đã xảy ra lỗi khi tải bài thi. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [id]);

  // Đếm ngược thời gian
  useEffect(() => {
    if (timeLeft <= 0 || !exam) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, exam]);

  const handleOptionSelect = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubQuestionSelect = (questionId: string, subId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        [subId]: value
      }
    }));
  };

  const handleSubmit = async () => {
    if (window.confirm('Bạn có chắc chắn muốn nộp bài?')) {
      // Logic nộp bài ở đây (ví dụ: tính điểm, lưu vào collection 'results', chuyển trang)
      
      // Update status to 'waiting'
      const savedSession = localStorage.getItem('lkt_student_session');
      if (savedSession) {
        try {
          const { name, studentClass } = JSON.parse(savedSession);
          const sessionId = `${name}_${studentClass}`.replace(/\s+/g, '_');
          await updateDoc(doc(db, 'student_sessions', sessionId), { status: 'waiting' });
        } catch (error) {
          console.error("Error updating student status:", error);
        }
      }

      console.log("Bài làm của học sinh:", answers);
      alert('Nộp bài thành công! (Chức năng chấm điểm có thể được thêm vào sau)');
      navigate('/library'); // Quay lại thư viện sau khi nộp
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 4. Trạng thái Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center">
        <Loader2 className="w-16 h-16 text-teal-500 animate-spin mb-6" />
        <p className="text-teal-400 font-bold text-xl tracking-widest uppercase animate-pulse">
          Đang chuẩn bị phòng thi...
        </p>
      </div>
    );
  }

  // 4. Trạng thái Error (Không tìm thấy bài thi)
  if (error || !exam) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6">
        <div className="bg-slate-900/80 border border-rose-500/30 rounded-3xl p-10 max-w-md w-full text-center shadow-[0_0_30px_rgba(244,63,94,0.15)]">
          <AlertCircle className="w-20 h-20 text-rose-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">Lỗi tải đề thi</h2>
          <p className="text-slate-400 mb-8">{error}</p>
          <button 
            onClick={() => navigate('/library')}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
          >
            Quay lại thư viện
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100;

  console.log("Current Question:", currentQuestion);
  console.log("Image URL:", currentQuestion.imageUrl);

  // 2. Giao diện Dark Mode Teal Glow
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 font-sans selection:bg-teal-500/30 selection:text-teal-200 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f172a]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button 
            onClick={() => navigate('/library')}
            className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight line-clamp-1">
              {exam.title}
            </h1>
            <p className="text-[10px] font-bold text-teal-500/70 tracking-[0.2em] uppercase">
              {exam.category || 'LUYỆN KIM THUẬT'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl font-bold font-mono text-lg border shadow-[0_0_15px_rgba(0,0,0,0.2)]",
            timeLeft < 300 
              ? "bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)] animate-pulse" 
              : "bg-teal-500/10 text-teal-400 border-teal-500/30"
          )}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
          
          <button 
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-900 px-6 py-2.5 rounded-xl font-black text-sm uppercase transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)]"
          >
            <Send className="w-4 h-4" />
            <span className="hidden md:inline">Nộp bài</span>
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-slate-800">
        <div 
          className="h-full bg-teal-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(20,184,166,0.8)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 bg-slate-900/50 border border-slate-800 rounded-[2rem] p-6 md:p-10 shadow-2xl flex flex-col"
          >
            {/* Question Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 font-black text-xl shadow-[0_0_15px_rgba(20,184,166,0.15)]">
                {currentQuestionIndex + 1}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Câu hỏi {currentQuestionIndex + 1} / {exam.questions.length}
                </span>
                <div className="text-sm font-medium text-teal-500/80">
                  {currentQuestion.type === 'multiple_choice' && 'Trắc nghiệm 1 đáp án'}
                  {currentQuestion.type === 'true_false' && 'Trắc nghiệm Đúng/Sai'}
                  {currentQuestion.type === 'short_answer' && 'Trả lời ngắn'}
                </div>
              </div>
            </div>

            {/* 3. Nội dung câu hỏi (Hỗ trợ LaTeX) */}
            <div className="text-lg md:text-xl text-white font-medium leading-relaxed mb-8 prose prose-invert prose-teal max-w-none">
              {currentQuestion.imageUrl && (
                <div className="mb-6 flex justify-center">
                  <img 
                    src={currentQuestion.imageUrl} 
                    alt="Question content visual" 
                    className="max-w-full h-auto rounded-2xl shadow-2xl border border-slate-700/50"
                    referrerPolicy="no-referrer"
                    onError={(e) => console.error("Image failed to load:", currentQuestion.imageUrl)}
                    onLoad={() => console.log("Image loaded successfully:", currentQuestion.imageUrl.substring(0, 50) + "...")}
                  />
                </div>
              )}
              <Markdown 
                remarkPlugins={[remarkMath]} 
                rehypePlugins={[rehypeKatex]}
                components={{
                  img: ({ node, ...props }) => {
                    if (!props.src) return null;
                    return (
                      <img 
                        {...props} 
                        className="max-w-full h-auto rounded-2xl my-6 shadow-2xl border border-slate-700/50 mx-auto block" 
                        referrerPolicy="no-referrer"
                      />
                    );
                  }
                }}
              >
                {currentQuestion.content.replace(/\[\[IMAGE_PLACEHOLDER(?:_\d+)?\]\]/g, '')}
              </Markdown>
            </div>

            {/* 3. Đáp án */}
            <div className="mt-auto space-y-4">
              {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = answers[currentQuestion.id] === option;
                    const optionLabel = String.fromCharCode(65 + idx); // A, B, C, D
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionSelect(currentQuestion.id, option)}
                        className={cn(
                          "flex items-start gap-4 p-4 rounded-2xl border text-left transition-all duration-200",
                          isSelected 
                            ? "bg-teal-500/10 border-teal-500/50 shadow-[0_0_20px_rgba(20,184,166,0.15)]" 
                            : "bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800"
                        )}
                      >
                        <div className={cn(
                          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border transition-colors",
                          isSelected 
                            ? "bg-teal-500 text-slate-900 border-teal-500" 
                            : "bg-slate-900 text-slate-400 border-slate-600"
                        )}>
                          {optionLabel}
                        </div>
                        <div className="flex-1 pt-1 text-slate-200">
                          <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {option.replace(/^[A-D]\.\s*/, '')}
                          </Markdown>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQuestion.type === 'true_false' && currentQuestion.subQuestions && (
                <div className="space-y-4">
                  {currentQuestion.subQuestions.map((sub, idx) => {
                    const selectedVal = answers[currentQuestion.id]?.[sub.id];
                    const subLabel = String.fromCharCode(97 + idx); // a, b, c, d
                    
                    return (
                      <div key={sub.id} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <span className="font-bold text-teal-400 mt-1">{subLabel}.</span>
                          <div className="text-slate-100 flex-1">
                            <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                              {sub.content || (sub as any).text || ''}
                            </Markdown>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end md:self-auto">
                          <button
                            onClick={() => handleSubQuestionSelect(currentQuestion.id, sub.id, 'Đúng')}
                            className={cn(
                              "px-6 py-2 rounded-xl font-bold text-sm transition-all",
                              selectedVal === 'Đúng'
                                ? "bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.3)]"
                                : "bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
                            )}
                          >
                            Đúng
                          </button>
                          <button
                            onClick={() => handleSubQuestionSelect(currentQuestion.id, sub.id, 'Sai')}
                            className={cn(
                              "px-6 py-2 rounded-xl font-bold text-sm transition-all",
                              selectedVal === 'Sai'
                                ? "bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                                : "bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
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

              {currentQuestion.type === 'short_answer' && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                  <label className="block text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">
                    Nhập câu trả lời của bạn (Số thực):
                  </label>
                  <input
                    type="text"
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleOptionSelect(currentQuestion.id, e.target.value)}
                    placeholder="VD: 12.5"
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl py-4 px-6 text-xl text-white font-bold focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all shadow-inner"
                  />
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Footer */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Câu trước
          </button>

          {/* Question Navigator Dots */}
          <div className="hidden md:flex items-center gap-2 overflow-x-auto px-4 max-w-[50%] no-scrollbar">
            {exam.questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined && 
                (q.type === 'true_false' ? Object.keys(answers[q.id] || {}).length === q.subQuestions?.length : answers[q.id] !== '');
              
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all",
                    currentQuestionIndex === idx
                      ? "bg-teal-500 text-slate-900 shadow-[0_0_10px_rgba(20,184,166,0.5)] scale-110"
                      : isAnswered
                        ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                        : "bg-slate-800 text-slate-500 hover:bg-slate-700"
                  )}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.min(exam.questions.length - 1, prev + 1))}
            disabled={currentQuestionIndex === exam.questions.length - 1}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Câu tiếp
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
};
