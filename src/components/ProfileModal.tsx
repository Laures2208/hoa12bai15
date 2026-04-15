import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, X, BarChart2, Award, CheckCircle, TrendingUp, BookOpen, Lock } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { cn } from '../lib/utils';
import { questionBank } from '../data/questionBank';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { fixLatex } from '../utils/latexHelper';
import 'katex/dist/katex.min.css';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentInfo: { name: string; studentClass: string; grade?: string };
}

interface Stats {
  examsCompleted: number;
  totalScore: number;
  maxScore: number;
  averageScore: number;
  accuracy: number;
  totalQuestions: number;
}

interface ExamHistory {
  id: string;
  timestamp: any;
  score: number;
  total_questions: number;
  answers: any[];
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, studentInfo }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [history, setHistory] = useState<ExamHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<ExamHistory | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    let unsubscribe: () => void;
    if (isOpen && studentInfo) {
      fetchStats();
      
      const adminSettingsRef = doc(db, 'admin', 'settings');
      unsubscribe = onSnapshot(adminSettingsRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.showAnswers !== undefined) setShowAnswers(data.showAnswers);
        }
      });
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isOpen, studentInfo]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'results'),
        where('studentName', '==', studentInfo.name),
        where('studentClass', '==', studentInfo.studentClass)
      );
      
      const querySnapshot = await getDocs(q);
      const historyData: any[] = [];
      let totalExams = 0;
      let totalScore = 0;
      let maxScore = 0;
      let totalQuestions = 0;
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        historyData.push({
          id: doc.id,
          timestamp: data.createdAt?.toDate() || new Date(),
          score: data.score || 0,
          total_questions: data.totalQuestions || 0,
          answers: data.answers || []
        });
        
        totalExams++;
        totalScore += data.score || 0;
        if ((data.score || 0) > maxScore) {
          maxScore = data.score || 0;
        }
        totalQuestions += data.totalQuestions || 0;
      });

      historyData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      setStats({
        examsCompleted: totalExams,
        totalScore: totalScore,
        maxScore: maxScore,
        averageScore: totalExams > 0 ? Number((totalScore / totalExams).toFixed(2)) : 0,
        accuracy: totalExams > 0 ? Number(((totalScore / (totalExams * 10)) * 100).toFixed(1)) : 0,
        totalQuestions: totalQuestions
      });
      
      setHistory(historyData);
      
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600/20 to-emerald-600/20 p-8 border-b border-slate-800 relative">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tight">{studentInfo.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-3 py-1 bg-teal-500/10 text-teal-400 text-xs font-bold rounded-full border border-teal-500/20 uppercase tracking-wider">
                      Lớp: {studentInfo.studentClass}
                    </span>
                    <span className="px-3 py-1 bg-slate-800 text-slate-400 text-xs font-bold rounded-full border border-slate-700 uppercase tracking-wider">
                      Học sinh
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mb-4" />
                  <p className="text-slate-400 font-medium">Đang tải thống kê...</p>
                </div>
              ) : stats ? (
                <div className="space-y-8">
                  {/* Main Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard 
                      icon={<BookOpen className="w-5 h-5 text-blue-400" />}
                      label="Bài thi đã nộp"
                      value={stats.examsCompleted}
                      color="blue"
                    />
                    <StatCard 
                      icon={<Award className="w-5 h-5 text-amber-400" />}
                      label="Điểm tối đa"
                      value={stats.maxScore}
                      color="amber"
                    />
                    <StatCard 
                      icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
                      label="Điểm trung bình"
                      value={stats.averageScore}
                      color="emerald"
                    />
                    <StatCard 
                      icon={<CheckCircle className="w-5 h-5 text-teal-400" />}
                      label="Độ chính xác"
                      value={`${stats.accuracy}%`}
                      color="teal"
                    />
                  </div>

                  {/* Exam History List */}
                  <div className="bg-slate-950/50 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-teal-500" />
                        <h3 className="font-bold text-white">Lịch sử làm bài</h3>
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {history.length > 0 ? (
                        history.map((exam, index) => (
                          <div 
                            key={exam.id}
                            onClick={() => showAnswers && setSelectedExam(exam)}
                            className={cn(
                              "p-4 border-b border-slate-800/50 flex items-center justify-between transition-colors",
                              showAnswers ? "hover:bg-slate-800/50 cursor-pointer" : "opacity-80 cursor-not-allowed"
                            )}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-white">Bài thi {history.length - index}</p>
                                {!showAnswers && <Lock className="w-3 h-3 text-slate-500" />}
                              </div>
                              <p className="text-xs text-slate-400">
                                {new Date(exam.timestamp).toLocaleString('vi-VN')}
                              </p>
                            </div>
                            <div className="text-lg font-black text-teal-400">
                              {exam.score} <span className="text-xs text-slate-500 font-normal">/ 10</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="p-8 text-center text-slate-500">Chưa có lịch sử làm bài.</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-500">Chưa có dữ liệu thống kê.</p>
                </div>
              )}
            </div>

            {/* Exam Detail Modal/Overlay */}
            <AnimatePresence>
              {selectedExam && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="absolute inset-0 bg-slate-900 z-10 p-8 overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Chi tiết bài thi</h3>
                    <button 
                      onClick={() => setSelectedExam(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      Quay lại
                    </button>
                  </div>
                  {!showAnswers && (
                    <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                      <Lock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-200">
                        Tính năng xem lại đáp án và lời giải đang bị khóa bởi Giáo viên. Bạn chỉ có thể xem lại các câu hỏi và đáp án đã chọn.
                      </p>
                    </div>
                  )}
                  <div className="space-y-4">
                    {selectedExam.answers.map((ans: any, idx: number) => {
                      const question = questionBank.find(q => q.id === ans.questionId);
                      if (!question) return null;
                      
                      const studentAnswer = question.options[ans.selectedOriginalIndex];
                      const correctAnswer = question.options[question.correctAnswer];
                      
                      return (
                      <div key={idx} className={cn("p-4 rounded-xl border", showAnswers ? (ans.isCorrect ? "bg-emerald-950/20 border-emerald-900/50" : "bg-rose-950/20 border-rose-900/50") : "bg-slate-800/50 border-slate-700")}>
                        <p className="text-sm font-bold text-white mb-2">Câu {idx + 1}</p>
                        <div className="text-sm text-slate-200 mb-2">
                          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {fixLatex(question.text)}
                          </ReactMarkdown>
                        </div>
                        <div className="space-y-1">
                          <div className={cn("text-sm", showAnswers ? (ans.isCorrect ? "text-emerald-400" : "text-rose-400") : "text-slate-300")}>
                            Đáp án của bạn: <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{fixLatex(studentAnswer)}</ReactMarkdown>
                          </div>
                          {showAnswers && !ans.isCorrect && (
                            <div className="text-sm text-emerald-400 font-bold">
                              Đáp án đúng: <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{fixLatex(correctAnswer)}</ReactMarkdown>
                            </div>
                          )}
                        </div>
                        {showAnswers && question.insight && (
                          <div className="mt-3 pt-3 border-t border-slate-700/50">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Giải thích:</p>
                            <div className="text-sm text-slate-300 italic whitespace-pre-wrap">
                              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                {fixLatex(question.insight)}
                              </ReactMarkdown>
                            </div>
                          </div>
                        )}
                      </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            <div className="p-6 bg-slate-900/50 border-t border-slate-800 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
              >
                Đóng
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: string }) => (
  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center">
    <div className={cn("p-3 rounded-xl mb-3", `bg-${color}-500/10`)}>
      {icon}
    </div>
    <span className="text-2xl font-black text-white mb-1">{value}</span>
    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{label}</span>
  </div>
);

const TableRow = ({ label, value }: { label: string, value: string | number }) => (
  <div className="flex justify-between items-center py-2 border-b border-slate-800/50 last:border-0">
    <span className="text-sm text-slate-400">{label}</span>
    <span className="text-sm font-bold text-white">{value}</span>
  </div>
);

const getRank = (accuracy: number) => {
  if (accuracy >= 90) return "Xuất sắc (S)";
  if (accuracy >= 80) return "Giỏi (A)";
  if (accuracy >= 65) return "Khá (B)";
  if (accuracy >= 50) return "Trung bình (C)";
  return "Cần cố gắng (D)";
};
