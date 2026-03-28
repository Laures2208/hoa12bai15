import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { BookOpen, Clock, Shield, Plus, X, Award, Target, TrendingUp, TrendingDown, Activity, PlayCircle, Calendar, Search, Pencil, Trash2, AlertTriangle, CheckCircle2, FileText, ChevronDown, ChevronUp, Lock, Unlock } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { AdvancedWordProcessor } from './AdvancedWordProcessor';
import { removeUndefined } from '../utils/jsonHelper';
import { fixLatex } from '../utils/latexHelper';

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

export interface Question {
  id: string | number;
  type: QuestionType;
  content: string;
  imageUrl?: string; // URL ảnh của câu hỏi
  options?: string[]; // For multiple_choice
  subQuestions?: { id: string; content: string; answer: 'Đúng' | 'Sai' }[]; // For true_false
  answer?: string; // For multiple_choice (A/B/C/D) or short_answer (number string)
  explanation: string;
  points?: number; // Custom points for this question
}

export interface Exam {
  id: string;
  title: string;
  type: string;
  timeLimit: number;
  questionCount: number;
  description: string;
  antiCheat: boolean;
  shuffleQuestions?: boolean;
  shuffleAnswers?: boolean;
  allowReview?: boolean;
  category?: string;
  matrix?: {
    multipleChoice: number;
    trueFalse: number;
    shortAnswer: number;
  };
  sectionPoints?: {
    multipleChoice: number;
    trueFalse: number;
    shortAnswer: number;
  };
  questions: Question[];
  createdAt: any;
  showBackgroundEffect?: boolean;
  backgroundEffectType?: string;
  startTime?: string;
  endTime?: string;
  isOpen?: boolean;
}

interface Result {
  id: string;
  examId: string;
  score: number;
  totalPoints?: number;
  correctAnswers: number;
  totalQuestions: number;
  createdAt: any;
  canRetake?: boolean;
}

interface ExamRoomProps {
  isAdmin?: boolean;
  studentInfo?: { name: string; studentClass: string };
  onTakeExam?: (exam: Exam) => void;
  onOpenProfile?: () => void;
}

export const ExamRoom: React.FC<ExamRoomProps> = ({ isAdmin = false, studentInfo, onTakeExam, onOpenProfile }) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredExams = useMemo(() => {
    return exams.filter(exam => {
      const searchLower = searchTerm.toLowerCase();
      return (exam.title?.toLowerCase() || '').includes(searchLower) ||
             (exam.type?.toLowerCase() || '').includes(searchLower) ||
             (exam.description?.toLowerCase() || '').includes(searchLower);
    });
  }, [exams, searchTerm]);
  
  // Form state
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Luyện tập');
  const [timeLimit, setTimeLimit] = useState(45);
  const [questionCount, setQuestionCount] = useState(40);
  const [description, setDescription] = useState('');
  const [antiCheat, setAntiCheat] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleAnswers, setShuffleAnswers] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showQuestionsPreview, setShowQuestionsPreview] = useState(false);
  const [formMode, setFormMode] = useState<'manual' | 'import'>('manual');

  // Fetch Exams
  useEffect(() => {
    const q = query(collection(db, 'exams_bank'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const examData: Exam[] = [];
      snapshot.forEach((doc) => {
        examData.push({ id: doc.id, ...doc.data() } as Exam);
      });
      setExams(examData);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Results for Stats
  useEffect(() => {
    if (!studentInfo || isAdmin) return;
    
    const q = query(
      collection(db, 'results'),
      where('studentName', '==', studentInfo.name)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const resultData: Result[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.studentClass === studentInfo.studentClass) {
          resultData.push({ id: doc.id, ...data } as Result);
        }
      });
      setResults(resultData);
    });
    return () => unsubscribe();
  }, [studentInfo, isAdmin]);

  const resetForm = () => {
    setTitle('');
    setType('Luyện tập');
    setTimeLimit(45);
    setQuestionCount(40);
    setDescription('');
    setAntiCheat(true);
    setShuffleQuestions(false);
    setShuffleAnswers(false);
    setStartTime('');
    setEndTime('');
    setQuestions([]);
    setEditingExamId(null);
    setShowForm(false);
    setShowQuestionsPreview(false);
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    
    setIsSubmitting(true);
    try {
      const examData = {
        title: title.trim(),
        type,
        timeLimit: Number(timeLimit),
        questionCount: Number(questionCount),
        description: description.trim(),
        antiCheat,
        shuffleQuestions,
        shuffleAnswers,
        startTime: startTime || null,
        endTime: endTime || null,
        questions: questions.length > 0 ? questions : null
      };

      if (editingExamId) {
        // Update existing exam
        await updateDoc(doc(db, 'exams_bank', editingExamId), removeUndefined(examData));
        setToastMessage('Cập nhật thành công!');
      } else {
        // Create new exam
        await addDoc(collection(db, 'exams_bank'), removeUndefined({
          ...examData,
          createdAt: serverTimestamp()
        }));
        setToastMessage('Đăng bài thành công!');
      }
      
      resetForm();
      
      // Show toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Error saving exam:", error);
      alert("Có lỗi xảy ra khi lưu đề thi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (exam: Exam) => {
    setEditingExamId(exam.id);
    setTitle(exam.title);
    setType(exam.type);
    setTimeLimit(exam.timeLimit);
    setQuestionCount(exam.questionCount);
    setDescription(exam.description);
    setAntiCheat(exam.antiCheat);
    setShuffleQuestions(exam.shuffleQuestions || false);
    setShuffleAnswers(exam.shuffleAnswers || false);
    setStartTime(exam.startTime || '');
    setEndTime(exam.endTime || '');
    setQuestions(exam.questions || []);
    setShowForm(true);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleDeleteExam = async () => {
    if (!confirmDeleteId) return;
    
    try {
      await deleteDoc(doc(db, 'exams_bank', confirmDeleteId));
      setToastMessage('Xóa thành công!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setConfirmDeleteId(null);
    } catch (error) {
      console.error("Error deleting exam:", error);
      alert("Có lỗi xảy ra khi xóa đề thi.");
    }
  };

  const handleToggleOpen = async (examId: string, currentStatus: boolean | undefined) => {
    try {
      const newStatus = currentStatus === false ? true : false;
      await updateDoc(doc(db, 'exams_bank', examId), {
        isOpen: newStatus
      });
      setToastMessage(newStatus ? 'Đã mở bài thi!' : 'Đã đóng bài thi!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Error toggling exam status:", error);
      alert("Có lỗi xảy ra khi thay đổi trạng thái đề thi.");
    }
  };

  const handleTakeExam = (exam: Exam) => {
    // Check if exam is closed
    if (exam.isOpen === false) {
      alert('Bài thi này hiện đang đóng.');
      return;
    }

    // Check if already taken
    if (exam.type === 'Bài thi' || exam.type === 'Bài kiểm tra') {
      const studentResults = results.filter(r => r.examId === exam.id);
      if (studentResults.length > 0) {
        const hasUnretakableResult = studentResults.some(r => !r.canRetake);
        if (hasUnretakableResult) {
          alert('Bạn đã làm bài này rồi. Mỗi học sinh chỉ được làm một lần, trừ khi được cấp quyền thi lại.');
          return;
        }
      }
    }

    // Check time constraints
    const now = new Date();
    if (exam.startTime) {
      const start = new Date(exam.startTime);
      if (now < start) {
        alert(`Bài thi chưa mở. Thời gian bắt đầu: ${start.toLocaleString('vi-VN')}`);
        return;
      }
    }
    if (exam.endTime) {
      const end = new Date(exam.endTime);
      if (now > end) {
        alert(`Bài thi đã kết thúc. Thời gian kết thúc: ${end.toLocaleString('vi-VN')}`);
        return;
      }
    }

    if (onTakeExam) {
      onTakeExam(exam);
    }
  };

  // Calculate Stats
  const totalExams = results.length;
  
  // Normalize scores to 10 for fair comparison in stats
  const normalizedScores = results.map(r => r.totalPoints ? (r.score / r.totalPoints) * 10 : r.score);
  
  const averageScore = totalExams > 0 ? (normalizedScores.reduce((acc, curr) => acc + curr, 0) / totalExams).toFixed(1) : '0.0';
  const highestScore = totalExams > 0 ? Math.max(...normalizedScores).toFixed(1) : '0.0';
  const lowestScore = totalExams > 0 ? Math.min(...normalizedScores).toFixed(1) : '0.0';
  
  const totalCorrect = results.reduce((acc, curr) => acc + curr.correctAnswers, 0);
  const totalQuestionsAnswered = results.reduce((acc, curr) => acc + curr.totalQuestions, 0);
  const accuracy = totalQuestionsAnswered > 0 ? Math.round((totalCorrect / totalQuestionsAnswered) * 100) : 0;

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Vừa xong';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-8">
      
      {/* Sidebar Stats */}
      {!isAdmin && (
        <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Target className="w-6 h-6 text-teal-400" />
                Thống kê cá nhân
              </div>
              {onOpenProfile && (
                <button 
                  onClick={onOpenProfile}
                  className="text-sm text-teal-400 hover:text-teal-300 font-bold"
                >
                  Hồ sơ
                </button>
              )}
            </h3>
            
            {/* Accuracy Circle */}
            <div className="flex flex-col items-center justify-center mb-8">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-slate-800" strokeWidth="8" />
                  <circle 
                    cx="50" cy="50" r="45" fill="none" stroke="currentColor" 
                    className="text-teal-500 drop-shadow-[0_0_8px_rgba(20,184,166,0.5)] transition-all duration-1000 ease-out" 
                    strokeWidth="8" 
                    strokeDasharray={`${accuracy * 2.827} 282.7`} 
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-white">{accuracy}%</span>
                  <span className="text-xs text-slate-400 uppercase tracking-wider mt-1">Chính xác</span>
                </div>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 flex flex-col items-center text-center">
                <Activity className="w-5 h-5 text-teal-400 mb-2" />
                <span className="text-2xl font-bold text-white">{averageScore}</span>
                <span className="text-xs text-slate-400 mt-1">Điểm trung bình</span>
              </div>
              <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 flex flex-col items-center text-center">
                <TrendingUp className="w-5 h-5 text-emerald-400 mb-2" />
                <span className="text-2xl font-bold text-white">{highestScore}</span>
                <span className="text-xs text-slate-400 mt-1">Điểm cao nhất</span>
              </div>
              <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 flex flex-col items-center text-center">
                <TrendingDown className="w-5 h-5 text-rose-400 mb-2" />
                <span className="text-2xl font-bold text-white">{lowestScore}</span>
                <span className="text-xs text-slate-400 mt-1">Điểm thấp nhất</span>
              </div>
              <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 flex flex-col items-center text-center">
                <Award className="w-5 h-5 text-amber-400 mb-2" />
                <span className="text-2xl font-bold text-white">{totalExams}</span>
                <span className="text-xs text-slate-400 mt-1">Số bài đã làm</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-teal-400" />
            Thư viện đề thi
          </h2>
          {isAdmin && (
            <div className="flex gap-2">
              <button 
                onClick={() => { setFormMode('import'); setShowForm(true); }}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-teal-400 px-4 py-2 rounded-xl font-bold transition-colors border border-teal-500/30"
              >
                <FileText className="w-5 h-5" />
                Nhập từ Word
              </button>
              <button 
                onClick={() => { setFormMode('manual'); setShowForm(true); }}
                className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white px-4 py-2 rounded-xl font-bold transition-colors shadow-[0_0_15px_rgba(20,184,166,0.3)]"
              >
                <Plus className="w-5 h-5" />
                Tạo đề thủ công
              </button>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm đề thi theo tên, loại hoặc mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-2xl py-4 pl-12 pr-12 text-white focus:outline-none focus:border-teal-500 focus:shadow-[0_0_15px_rgba(20,184,166,0.3)] transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Admin Form Modal */}
        <AnimatePresence>
          {showForm && isAdmin && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-slate-900 border border-teal-500/30 rounded-3xl p-6 shadow-2xl relative"
            >
              <button onClick={handleCancelEdit} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-xl font-bold text-white mb-6">
                {editingExamId ? 'Chỉnh sửa đề thi' : (formMode === 'manual' ? 'Đăng bài thi mới (Thủ công)' : 'Nhập đề thi từ file Word (AI)')}
              </h3>

              {/* Tab Switcher */}
              {!editingExamId && (
                <div className="flex p-1 bg-slate-800 rounded-2xl mb-6 w-fit">
                  <button
                    onClick={() => setFormMode('manual')}
                    className={cn(
                      "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                      formMode === 'manual' ? "bg-teal-500 text-white shadow-lg" : "text-slate-400 hover:text-white"
                    )}
                  >
                    Thủ công
                  </button>
                  <button
                    onClick={() => setFormMode('import')}
                    className={cn(
                      "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                      formMode === 'import' ? "bg-teal-500 text-white shadow-lg" : "text-slate-400 hover:text-white"
                    )}
                  >
                    Nhập file Word
                  </button>
                </div>
              )}

              <form onSubmit={handleCreateExam} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Tên đề thi</label>
                  <input 
                    type="text" required value={title} onChange={e => setTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-teal-500"
                    placeholder="VD: Đề thi thử THPT Quốc gia 2026..."
                  />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Phân loại</label>
                    <select 
                      value={type} onChange={e => setType(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-teal-500"
                    >
                      <option value="Luyện tập">Luyện tập</option>
                      <option value="Bài thi">Bài thi</option>
                      <option value="Bài kiểm tra">Bài kiểm tra</option>
                      <option value="Bài tập">Bài tập</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Chống gian lận</label>
                    <div className="flex items-center h-[42px]">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={antiCheat} onChange={e => setAntiCheat(e.target.checked)} />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                        <span className="ml-3 text-sm font-medium text-slate-300">Bật</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Đảo câu hỏi</label>
                    <div className="flex items-center h-[42px]">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={shuffleQuestions} onChange={e => setShuffleQuestions(e.target.checked)} />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                        <span className="ml-3 text-sm font-medium text-slate-300">Bật</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Đảo đáp án</label>
                    <div className="flex items-center h-[42px]">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={shuffleAnswers} onChange={e => setShuffleAnswers(e.target.checked)} />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                        <span className="ml-3 text-sm font-medium text-slate-300">Bật</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Thời gian (phút)</label>
                    <input 
                      type="number" required min="1" value={timeLimit} onChange={e => setTimeLimit(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Số câu hỏi</label>
                    <input 
                      type="number" required min="1" value={questionCount} onChange={e => setQuestionCount(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Thời gian bắt đầu (Tùy chọn)</label>
                    <input 
                      type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Thời gian kết thúc (Tùy chọn)</label>
                    <input 
                      type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Mô tả (Hỗ trợ Markdown & LaTeX)</label>
                  <textarea 
                    required rows={3} value={description} onChange={e => setDescription(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-teal-500 resize-none"
                    placeholder="Nhập mô tả về mục tiêu bài học..."
                  />
                </div>

                {/* Docx Uploader Section - Only in Import Mode */}
                {formMode === 'import' && (
                  <div className="pt-4 border-t border-slate-800">
                    <label className="block text-sm font-bold text-teal-400 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Tải lên danh sách câu hỏi (.docx)
                    </label>
                    <AdvancedWordProcessor onProcessed={(newQuestions) => {
                      setQuestions(newQuestions);
                      setQuestionCount(newQuestions.length);
                      setShowQuestionsPreview(true);
                      // Auto-fill title if empty
                      if (!title) setTitle("Đề thi nhập từ Word - " + new Date().toLocaleDateString());
                    }} />
                    
                    {questions.length > 0 && (
                      <div className="mt-4">
                        <button 
                          type="button"
                          onClick={() => setShowQuestionsPreview(!showQuestionsPreview)}
                          className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors"
                        >
                          {showQuestionsPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          {showQuestionsPreview ? 'Ẩn preview câu hỏi' : `Xem ${questions.length} câu hỏi đã tải lên`}
                        </button>
                        
                        <AnimatePresence>
                          {showQuestionsPreview && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="mt-4 space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar"
                            >
                              {questions.map((q, idx) => (
                                <div key={idx} className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-2">
                                  <div className="flex justify-between items-start gap-4">
                                    <span className="text-teal-400 font-bold text-sm">Câu {q.id || idx + 1}</span>
                                    <span className="text-emerald-400 font-bold text-sm">
                                      {q.type === 'true_false' ? 'Đúng/Sai' : `Đáp án: ${q.answer}`}
                                    </span>
                                  </div>
                                  <div className="text-white text-sm prose prose-invert prose-sm max-w-none">
                                    {q.imageUrl && (
                                      <div className="mb-3 flex justify-center">
                                        <img 
                                          src={q.imageUrl} 
                                          alt="Question" 
                                          className="max-w-full h-auto rounded-xl shadow-md border border-slate-700/50"
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
                                              className="max-w-full h-auto rounded-xl my-3 shadow-md border border-slate-700/50 mx-auto block" 
                                              referrerPolicy="no-referrer"
                                            />
                                          );
                                        }
                                      }}
                                    >
                                      {fixLatex((q.content || '').replace(/\[\[IMAGE_PLACEHOLDER(?:_\d+)?\]\]/g, ''))}
                                    </ReactMarkdown>
                                  </div>
                                  {q.type === 'true_false' ? (
                                    <div className="space-y-2">
                                      {q.subQuestions?.map((sq, sIdx) => (
                                        <div key={sq.id || sIdx} className="text-xs bg-slate-900/50 p-2 rounded-lg flex justify-between items-center gap-2">
                                          <div className="text-slate-300 flex-1">
                                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                              {fixLatex(`${String.fromCharCode(97 + sIdx)}. ${sq.content || (sq as any).text || ''}`)}
                                            </ReactMarkdown>
                                          </div>
                                          <span className={cn(
                                            "font-bold px-2 py-0.5 rounded text-[10px]",
                                            sq.answer === 'Đúng' ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                                          )}>
                                            {sq.answer}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                      {q.options?.map((opt, oIdx) => (
                                        <div key={oIdx} className="text-xs text-slate-400 bg-slate-900/50 p-2 rounded-lg">
                                          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                            {fixLatex(opt)}
                                          </ReactMarkdown>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  {editingExamId && (
                    <button 
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-6 py-2 rounded-xl font-bold bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                      Hủy chỉnh sửa
                    </button>
                  )}
                  <button 
                    type="submit" disabled={isSubmitting}
                    className="bg-teal-500 hover:bg-teal-400 text-white px-6 py-2 rounded-xl font-bold transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(20,184,166,0.3)]"
                  >
                    {isSubmitting ? 'Đang lưu...' : (editingExamId ? 'CẬP NHẬT ĐỀ THI' : 'Đăng bài')}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Exam List */}
        <div className="space-y-4">
          {filteredExams.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/50 rounded-3xl border border-slate-800">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Không tìm thấy bài thi phù hợp.</p>
            </div>
          ) : (
            filteredExams.map((exam) => (
              <motion.div 
                key={exam.id}
                whileHover={{ scale: 1.01 }}
                className="group bg-slate-900/80 backdrop-blur-sm border border-slate-800 hover:border-teal-500/50 rounded-2xl p-5 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(20,184,166,0.15)] flex flex-col sm:flex-row gap-4 sm:items-center justify-between"
              >
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn(
                      "px-3 py-1 text-xs font-bold rounded-full border",
                      exam.type === 'Luyện tập' 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                        : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                    )}>
                      {exam.type}
                    </span>
                    {exam.antiCheat && (
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Chống gian lận
                      </span>
                    )}
                    {exam.isOpen === false && (
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Đã đóng
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-teal-400 transition-colors">
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {fixLatex(exam.title)}
                      </ReactMarkdown>
                    </h3>
                    <div className="text-slate-400 text-sm mt-1 line-clamp-2 prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {fixLatex(exam.description || '')}
                      </ReactMarkdown>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      <span>{exam.questionCount} câu</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{exam.timeLimit} phút</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(exam.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {!isAdmin ? (
                  <div className="mt-4 sm:mt-0 flex-shrink-0">
                    <button 
                      onClick={() => handleTakeExam(exam)}
                      disabled={exam.isOpen === false}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-800 hover:bg-teal-500 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(20,184,166,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-800 disabled:group-hover:shadow-none"
                    >
                      <PlayCircle className="w-5 h-5" />
                      LÀM BÀI
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 sm:mt-0 flex-shrink-0 flex gap-2">
                    <button 
                      onClick={() => handleToggleOpen(exam.id, exam.isOpen)}
                      title={exam.isOpen === false ? "Mở bài thi" : "Đóng bài thi"}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all duration-300 ${
                        exam.isOpen === false 
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white hover:shadow-[0_0_15px_rgba(244,63,94,0.4)]' 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                      }`}
                    >
                      {exam.isOpen === false ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                    </button>
                    <button 
                      onClick={() => handleEditClick(exam)}
                      className="flex items-center justify-center gap-2 bg-teal-500/10 text-teal-400 border border-teal-500/30 hover:bg-teal-500 hover:text-white px-4 py-3 rounded-xl font-bold transition-all duration-300 hover:shadow-[0_0_15px_rgba(20,184,166,0.4)]"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setConfirmDeleteId(exam.id)}
                      className="flex items-center justify-center gap-2 bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white px-4 py-3 rounded-xl font-bold transition-all duration-300 hover:shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Toast Notification */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed bottom-6 right-6 bg-teal-500 text-white px-6 py-3 rounded-xl shadow-lg font-bold z-50 flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Confirmation Modal */}
        <AnimatePresence>
          {confirmDeleteId && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl"
              >
                <div className="flex items-center gap-4 text-rose-500 mb-6">
                  <div className="p-3 bg-rose-500/10 rounded-2xl">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Xác nhận xóa</h3>
                </div>
                <p className="text-slate-400 mb-8 leading-relaxed">
                  Bạn có chắc chắn muốn xóa đề thi này không? Hành động này không thể hoàn tác và tất cả dữ liệu liên quan sẽ bị mất.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="flex-1 px-6 py-3 rounded-xl font-bold bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleDeleteExam}
                    className="flex-1 px-6 py-3 rounded-xl font-bold bg-rose-500 hover:bg-rose-400 text-white transition-colors shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                  >
                    Xác nhận xóa
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
