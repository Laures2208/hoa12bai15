import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, onSnapshot, addDoc, updateDoc, serverTimestamp, orderBy, deleteDoc, doc, writeBatch, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { auth } from '../firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
import { 
  LayoutDashboard, 
  FilePlus, 
  FileText, 
  Sparkles, 
  Settings, 
  ChevronRight, 
  Target, 
  Activity, 
  TrendingUp, 
  Shield, 
  Plus, 
  X, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  FileUp,
  Grid3X3,
  Zap,
  Pencil,
  BookOpen,
  Clock,
  Trash2,
  Users,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Trophy,
  BarChart2,
  Send
} from 'lucide-react';
import { cn } from '../lib/utils';
import { AdvancedWordProcessor } from './AdvancedWordProcessor';
import { ExamEditor } from './ExamEditor';
import { ExamResultsModal } from './ExamResultsModal';
import { AdminLeaderboard } from './AdminLeaderboard';
import { Question, Exam, QuestionType } from './ExamRoom';
import { GoogleGenAI } from "@google/genai";
import { getGeminiApiKey } from '../services/gemini';

import { parseAIJSON, removeUndefined } from '../utils/jsonHelper';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'editor' | 'history'>('history');
  const [matrix, setMatrix] = useState({
    multipleChoice: 12,
    trueFalse: 3,
    shortAnswer: 6
  });
  const [sectionPoints, setSectionPoints] = useState({
    multipleChoice: 3,
    trueFalse: 4,
    shortAnswer: 3
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [examTitle, setExamTitle] = useState('');
  const [duration, setDuration] = useState(50);
  const [examType, setExamType] = useState('Bài thi');
  const [examGrade, setExamGrade] = useState<'10' | '11' | '12'>('12');
  const [antiCheat, setAntiCheat] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleAnswers, setShuffleAnswers] = useState(false);
  const [allowReview, setAllowReview] = useState(true);
  const [showScore, setShowScore] = useState(true);
  const [showBackgroundEffect, setShowBackgroundEffect] = useState(true);
  const [backgroundEffectType, setBackgroundEffectType] = useState('classic');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [aiPromptContent, setAiPromptContent] = useState('');
  const [filterGrade, setFilterGrade] = useState<'all' | '10' | '11' | '12'>('all');
  const [firestoreError, setFirestoreError] = useState<Error | null>(null);

  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoadingExams, setIsLoadingExams] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [viewingResultsExam, setViewingResultsExam] = useState<Exam | null>(null);
  const [selectedLeaderboardExam, setSelectedLeaderboardExam] = useState<string | null>(null);

  if (firestoreError) {
    throw firestoreError;
  }

  useEffect(() => {
    if (activeTab === 'history' && db) {
      setIsLoadingExams(true);
      const q = query(collection(db, 'exams_bank'), orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, (snapshot) => {
        let list: Exam[] = [];
        snapshot.forEach(doc => {
          list.push({ id: doc.id, ...doc.data() } as Exam);
        });
        setExams(list);
        setIsLoadingExams(false);
      }, (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'exams_bank');
        } catch (e) {
          setFirestoreError(e instanceof Error ? e : new Error(String(e)));
        }
        setIsLoadingExams(false);
      });
      return () => unsub();
    }
  }, [activeTab]);

  const handleDeleteExam = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa đề thi này?')) {
      try {
        if (db) {
          await deleteDoc(doc(db, 'exams_bank', id)).catch(err => handleFirestoreError(err, OperationType.DELETE, 'exams_bank/' + id));
          setToastMessage('Đã xóa đề thi!');
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('FirestoreErrorInfo')) {
          throw error;
        }
        console.error(error);
      }
    }
  };

  const handleToggleOpen = async (examId: string, currentStatus: boolean | undefined) => {
    try {
      if (db) {
        const newStatus = currentStatus === false ? true : false;
        await updateDoc(doc(db, 'exams_bank', examId), {
          isOpen: newStatus
        }).catch(err => handleFirestoreError(err, OperationType.UPDATE, 'exams_bank/' + examId));
        setToastMessage(newStatus ? 'Đã mở bài thi!' : 'Đã đóng bài thi!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('FirestoreErrorInfo')) {
        throw error;
      }
      console.error(error);
    }
  };

  const handleToggleReview = async (examId: string, currentStatus: boolean | undefined) => {
    try {
      if (db) {
        const newStatus = currentStatus === false ? true : false;
        await updateDoc(doc(db, 'exams_bank', examId), {
          allowReview: newStatus
        }).catch(err => handleFirestoreError(err, OperationType.UPDATE, 'exams_bank/' + examId));
        setToastMessage(newStatus ? 'Đã cho phép xem lại bài!' : 'Đã tắt xem lại bài!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('FirestoreErrorInfo')) {
        throw error;
      }
      console.error(error);
    }
  };

  const handleToggleShowScore = async (examId: string, currentStatus: boolean | undefined) => {
    try {
      if (db) {
        const newStatus = currentStatus === false ? true : false;
        await updateDoc(doc(db, 'exams_bank', examId), {
          showScore: newStatus
        }).catch(err => handleFirestoreError(err, OperationType.UPDATE, 'exams_bank/' + examId));
        setToastMessage(newStatus ? 'Đã cho phép xem điểm!' : 'Đã tắt xem điểm!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('FirestoreErrorInfo')) {
        throw error;
      }
      console.error(error);
    }
  };

  const handleAiGenerate = async () => {
    const apiKey = await getGeminiApiKey();
    if (!apiKey) {
      setToastMessage("Vui lòng cấu hình API Key trong phần cài đặt để sử dụng tính năng AI.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
      return;
    }
    if (!db) {
      alert("Lỗi: Không tìm thấy kết nối database. Vui lòng kiểm tra cấu hình Firebase.");
      return;
    }

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const model = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Bạn là một chuyên gia Hóa học. Hãy soạn một đề thi mới bám sát chương trình Hóa ${examGrade} cho dự án 'CHEMISTRY THEORY & QUIZZ'.
                ${aiPromptContent.trim() ? `\nNội dung tham khảo/yêu cầu cụ thể từ người dùng:\n"""\n${aiPromptContent}\n"""\n` : ''}
                Ma trận đề thi:
                - Phần I: ${matrix.multipleChoice} câu trắc nghiệm (4 lựa chọn).
                - Phần II: ${matrix.trueFalse} câu Đúng/Sai (mỗi câu có 4 ý a, b, c, d).
                - Phần III: ${matrix.shortAnswer} câu trả lời ngắn (kết quả là số).

                Yêu cầu:
                1. Toàn bộ công thức hóa học phải được bọc trong LaTeX chuẩn. BẮT BUỘC sử dụng ngoặc nhọn cho lệnh \\ce (ví dụ: $\\ce{H2SO4}$, $\\ce{CO2}$). TUYỆT ĐỐI KHÔNG viết liền như $\\ceH2SO4$ hoặc $\\ceCO2$.
                QUAN TRỌNG: Bạn PHẢI escape tất cả các dấu backslash (\\) trong công thức LaTeX thành double backslash (\\\\) để JSON hợp lệ. Ví dụ: \\\\frac{1}{2} thay vì \\frac{1}{2}, \\\\ce{H2O} thay vì \\ce{H2O}.
                2. Nội dung bám sát chương trình Hóa ${examGrade}.
                3. Xuất kết quả dưới dạng mảng JSON thuần túy, không có markdown bao quanh, với cấu trúc:
                [
                  {
                    "id": number,
                    "type": "multiple_choice" | "true_false" | "short_answer",
                    "content": "Nội dung câu hỏi có LaTeX",
                    "options": ["A. ...", "B. ...", "C. ...", "D. ..."], // Cho multiple_choice
                    "subQuestions": [{"id": "a", "content": "...", "answer": "Đúng/Sai"}], // Cho true_false
                    "answer": "A/B/C/D" | "number string", // Cho multiple_choice hoặc short_answer
                    "explanation": "Giải thích chi tiết có LaTeX"
                  }
                ]`
              }
            ]
          }
        ],
        config: { responseMimeType: "application/json" }
      });

      const result = await model;
      const generatedQuestions = parseAIJSON(result.text?.trim() || "[]");
      const uniqueQuestions = generatedQuestions.map((q: any) => ({
        ...q,
        id: Math.random().toString(36).substr(2, 9)
      }));
      setQuestions(uniqueQuestions);
      setActiveTab('editor');
    } catch (error) {
      console.error("AI Generation failed:", error);
      alert("AI không thể tạo đề thi lúc này. Vui lòng kiểm tra lại API Key hoặc kết nối mạng.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveExam = async () => {
    if (!examTitle.trim()) {
      setToastMessage("Vui lòng nhập tên đề thi.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }
    if (questions.length === 0) {
      setToastMessage("Vui lòng tạo hoặc nhập câu hỏi trước khi lưu.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    setIsSubmitting(true);
    try {
      // Đóng gói dữ liệu đề thi thành Object JSON hoàn chỉnh
      const examData = {
        title: examTitle.trim(),
        matrix: {
          multipleChoice: matrix.multipleChoice,
          trueFalse: matrix.trueFalse,
          shortAnswer: matrix.shortAnswer
        },
        sectionPoints: {
          multipleChoice: sectionPoints.multipleChoice,
          trueFalse: sectionPoints.trueFalse,
          shortAnswer: sectionPoints.shortAnswer
        },
        questions: questions.map(q => ({
          ...q,
          id: q.id || Math.random().toString(36).substr(2, 9)
        })),
        createdAt: serverTimestamp(),
        type: examType,
        grade: examGrade,
        timeLimit: duration || 50,
        questionCount: questions.length,
        description: `Đề thi gồm ${questions.length} câu hỏi.`,
        antiCheat: antiCheat,
        shuffleQuestions: shuffleQuestions,
        shuffleAnswers: shuffleAnswers,
        allowReview: allowReview,
        showScore: showScore,
        showBackgroundEffect: showBackgroundEffect,
        backgroundEffectType: backgroundEffectType,
        startTime: startTime || null,
        endTime: endTime || null,
        source: 'Admin Center'
      };

      // Kiểm tra kích thước dữ liệu (Giới hạn Firestore là 1MB)
      const estimatedSize = JSON.stringify(examData).length;
      if (estimatedSize > 1000000) {
        setToastMessage("Đề thi quá lớn (vượt quá 1MB). Vui lòng giảm số lượng câu hỏi hoặc xóa bớt hình ảnh dung lượng cao.");
        setShowToast(true);
        setIsSubmitting(false);
        return;
      }

      // Gửi dữ liệu lên Firestore
      if (editingExamId) {
        const { createdAt, ...updateData } = examData;
        await updateDoc(doc(db, 'exams_bank', editingExamId), removeUndefined({
          ...updateData,
          updatedAt: serverTimestamp()
        })).catch(err => handleFirestoreError(err, OperationType.UPDATE, 'exams_bank/' + editingExamId));
        setToastMessage('Cập nhật đề thi thành công!');
      } else {
        await addDoc(collection(db, 'exams_bank'), removeUndefined({
          ...examData,
          isOpen: true
        })).catch(err => handleFirestoreError(err, OperationType.CREATE, 'exams_bank'));
        setToastMessage('Lưu đề thi thành công!');
      }

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
      // Reset form
      setQuestions([]);
      setExamTitle('');
      setDuration(50);
      setExamType('Bài thi');
      setAntiCheat(true);
      setShuffleQuestions(false);
      setShuffleAnswers(false);
      setAllowReview(true);
      setStartTime('');
      setEndTime('');
      setAiPromptContent('');
      setEditingExamId(null);
      
      // Tự động chuyển hướng về trang Ngân hàng đề (tab history)
      setTimeout(() => {
        setActiveTab('history');
      }, 1000);

    } catch (error) {
      // In lỗi chi tiết ra console để debug
      if (error instanceof Error && error.message.includes('FirestoreErrorInfo')) {
        throw error;
      }
      console.error("CRITICAL ERROR - Save Exam Failed:", error);
      setToastMessage("Lỗi khi lưu đề thi. Vui lòng kiểm tra console.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredExams = filterGrade === 'all' ? exams : exams.filter(e => e.grade === filterGrade);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 font-sans selection:bg-teal-500/30 selection:text-teal-200">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-xl border-b border-slate-800/50 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-teal-500/10 rounded-2xl border border-teal-500/20 shadow-[0_0_20px_rgba(20,184,166,0.15)]">
            <LayoutDashboard className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight uppercase">CHEMISTRY THEORY & QUIZZ</h1>
            <p className="text-[10px] font-bold text-teal-500/70 tracking-[0.2em] uppercase">Admin Command Center</p>
          </div>
        </div>

        <nav className="flex items-center gap-1 p-1 bg-slate-900/50 rounded-2xl border border-slate-800/50">
          {[
            { id: 'matrix', icon: Grid3X3, label: 'Ma trận & Tạo đề' },
            { id: 'editor', icon: Pencil, label: 'Biên tập' },
            { id: 'history', icon: FileText, label: 'Ngân hàng đề' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300",
                activeTab === tab.id 
                  ? "bg-teal-500 text-white shadow-[0_0_20px_rgba(20,184,166,0.3)]" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {editingExamId && (
            <button 
              onClick={() => {
                if (confirm('Bạn có muốn hủy chỉnh sửa và tạo đề mới?')) {
                  setEditingExamId(null);
                  setQuestions([]);
                  setExamTitle('');
                  setActiveTab('matrix');
                }
              }}
              className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest"
            >
              Hủy chỉnh sửa
            </button>
          )}
          <button 
            onClick={handleSaveExam}
            disabled={isSubmitting || questions.length === 0}
            className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white px-6 py-2.5 rounded-2xl font-black text-xs tracking-widest uppercase transition-all duration-300 disabled:opacity-50 shadow-[0_0_20px_rgba(20,184,166,0.3)]"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {editingExamId ? 'Cập nhật đề thi' : 'Lưu đề thi'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'matrix' && (
            <motion.div
              key="matrix"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Matrix Config */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
                      <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                          <div className="p-4 bg-teal-500/10 rounded-3xl border border-teal-500/20">
                            <Zap className="w-8 h-8 text-teal-400" />
                          </div>
                          <div>
                            <h2 className="text-3xl font-black text-white tracking-tight">Ma trận đề thi</h2>
                            <p className="text-slate-500 font-medium">Thiết lập cấu trúc đề thi Hóa học</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <select
                            value={examGrade}
                            onChange={(e) => setExamGrade(e.target.value as any)}
                            className="bg-slate-800 border border-slate-700 rounded-2xl px-4 py-2 text-white font-bold focus:outline-none focus:border-teal-500 transition-all appearance-none"
                          >
                            <option value="10">Khối 10</option>
                            <option value="11">Khối 11</option>
                            <option value="12">Khối 12</option>
                          </select>
                          <button
                            onClick={async () => {
                          const apiKey = await getGeminiApiKey();
                          if (!apiKey) {
                            setToastMessage("Vui lòng cấu hình API Key trong phần cài đặt để sử dụng tính năng AI.");
                            setShowToast(true);
                            setTimeout(() => setShowToast(false), 5000);
                            return;
                          }
                          setIsGenerating(true);
                          try {
                            const ai = new GoogleGenAI({ apiKey });
                            const model = ai.models.generateContent({
                              model: "gemini-3-flash-preview",
                              contents: [{ role: "user", parts: [{ text: `Hãy gợi ý số lượng câu hỏi cho 3 phần (Trắc nghiệm, Đúng/Sai, Trả lời ngắn) cho một đề thi Hóa học ${examGrade} chuẩn 2026. Trả về JSON: {multipleChoice: number, trueFalse: number, shortAnswer: number}` }] }],
                              config: { responseMimeType: "application/json" }
                            });
                            const result = await model;
                            const suggested = parseAIJSON(result.text?.trim() || "{}");
                            setMatrix(suggested);
                            setToastMessage('AI đã gợi ý ma trận chuẩn!');
                            setShowToast(true);
                            setTimeout(() => setShowToast(false), 3000);
                          } catch (e) {
                            console.error(e);
                          } finally {
                            setIsGenerating(false);
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-xl hover:bg-purple-500 hover:text-white transition-all font-bold text-xs uppercase tracking-wider"
                      >
                        <Sparkles className="w-4 h-4" />
                        AI Gợi ý
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { id: 'multipleChoice', label: 'Phần I: Trắc nghiệm', desc: '4 lựa chọn, 1 đáp án', icon: Target, color: 'text-teal-400' },
                      { id: 'trueFalse', label: 'Phần II: Đúng/Sai', desc: 'Mỗi câu 4 ý a, b, c, d', icon: Activity, color: 'text-purple-400' },
                      { id: 'shortAnswer', label: 'Phần III: Trả lời ngắn', desc: 'Kết quả là số thực', icon: TrendingUp, color: 'text-emerald-400' }
                    ].map((item) => (
                      <div key={item.id} className="bg-slate-800/30 border border-slate-700/50 rounded-[2rem] p-6 hover:border-teal-500/30 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-4">
                          <item.icon className={cn("w-5 h-5", item.color)} />
                          <span className="text-sm font-bold text-white">{item.label}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-4">{item.desc}</p>
                        <div className="relative">
                          <input
                            type="number"
                            value={matrix[item.id as keyof typeof matrix]}
                            onChange={e => setMatrix({ ...matrix, [item.id]: Number(e.target.value) })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-4 px-6 text-2xl font-black text-white focus:outline-none focus:border-teal-500 transition-all"
                          />
                          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 font-bold">CÂU</span>
                        </div>
                        <div className="relative mt-4">
                          <input
                            type="number"
                            step="0.1"
                            value={sectionPoints[item.id as keyof typeof sectionPoints]}
                            onChange={e => setSectionPoints({ ...sectionPoints, [item.id]: Number(e.target.value) })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-4 px-6 text-2xl font-black text-white focus:outline-none focus:border-teal-500 transition-all"
                          />
                          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 font-bold">ĐIỂM</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 pt-10 border-t border-slate-800/50 space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-teal-400" />
                        Nội dung bài tập / Yêu cầu cụ thể cho AI (Tùy chọn)
                      </label>
                      <textarea
                        value={aiPromptContent}
                        onChange={(e) => setAiPromptContent(e.target.value)}
                        placeholder="Nhập nội dung bài tập, chủ đề, hoặc yêu cầu cụ thể để AI dựa vào đó tạo đề thi..."
                        className="w-full h-32 bg-slate-900 border border-slate-700 rounded-2xl p-4 text-white focus:outline-none focus:border-teal-500 transition-all resize-none"
                      />
                    </div>
                    <button
                      onClick={handleAiGenerate}
                      disabled={isGenerating}
                      className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white py-6 rounded-[2rem] font-black text-lg uppercase tracking-widest flex items-center justify-center gap-4 transition-all duration-500 shadow-[0_0_30px_rgba(20,184,166,0.3)] disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-8 h-8 animate-spin" />
                          AI ĐANG SOẠN ĐỀ...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-8 h-8" />
                          AI TẠO ĐỀ THI MỚI
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Import Section */}
              <div className="space-y-8">
                <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <FileUp className="w-6 h-6 text-teal-400" />
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Nhập từ Word</h3>
                  </div>
                  <AdvancedWordProcessor onProcessed={(newQuestions) => {
                    const uniqueQuestions = newQuestions.map((q: any) => ({
                      ...q,
                      id: Math.random().toString(36).substr(2, 9)
                    }));
                    setQuestions(uniqueQuestions);
                    setActiveTab('editor');
                  }} />
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="w-6 h-6 text-purple-400" />
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Quy tắc AI</h3>
                  </div>
                  <ul className="space-y-4">
                    {[
                      "Tự động bọc LaTeX cho công thức hóa học",
                      "Bám sát cấu trúc đề thi minh họa 2026",
                      "Tự động tính toán đáp án Phần III",
                      "Tạo lời giải chi tiết cho từng câu"
                    ].map((rule, i) => (
                      <li key={`rule_${i}`} className="flex items-start gap-3 text-sm text-slate-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'editor' && (
            <motion.div
              key="editor"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-6 h-6 text-teal-400" />
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Cài đặt bài thi</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Tên bài thi</label>
                    <input
                      type="text"
                      value={examTitle}
                      onChange={e => setExamTitle(e.target.value)}
                      placeholder="VD: Kiểm tra giữa kỳ II"
                      className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3 px-5 text-white font-bold focus:outline-none focus:border-teal-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Khối lớp</label>
                    <select
                      value={examGrade}
                      onChange={e => setExamGrade(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3 px-5 text-white font-bold focus:outline-none focus:border-teal-500 transition-all appearance-none"
                    >
                      <option value="10">Khối 10</option>
                      <option value="11">Khối 11</option>
                      <option value="12">Khối 12</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Loại</label>
                    <select
                      value={examType}
                      onChange={e => setExamType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3 px-5 text-white font-bold focus:outline-none focus:border-teal-500 transition-all appearance-none"
                    >
                      <option value="Bài thi">Bài thi</option>
                      <option value="Bài kiểm tra">Bài kiểm tra</option>
                      <option value="Bài tập">Bài tập</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Thời gian (phút)</label>
                    <input
                      type="number"
                      value={duration}
                      onChange={e => setDuration(Number(e.target.value))}
                      placeholder="VD: 50"
                      className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3 px-5 text-white font-bold focus:outline-none focus:border-teal-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Thời gian bắt đầu (Tùy chọn)</label>
                    <input
                      type="datetime-local"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3 px-5 text-white font-bold focus:outline-none focus:border-teal-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Thời gian kết thúc (Tùy chọn)</label>
                    <input
                      type="datetime-local"
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3 px-5 text-white font-bold focus:outline-none focus:border-teal-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Chống gian lận</label>
                    <div className="flex items-center h-[50px] px-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={antiCheat}
                          onChange={e => setAntiCheat(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                        <span className="ml-3 text-sm font-bold text-slate-300">{antiCheat ? 'Bật' : 'Tắt'}</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Đảo câu hỏi</label>
                    <div className="flex items-center h-[50px] px-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={shuffleQuestions}
                          onChange={e => setShuffleQuestions(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                        <span className="ml-3 text-sm font-bold text-slate-300">{shuffleQuestions ? 'Bật' : 'Tắt'}</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Đảo đáp án</label>
                    <div className="flex items-center h-[50px] px-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={shuffleAnswers}
                          onChange={e => setShuffleAnswers(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                        <span className="ml-3 text-sm font-bold text-slate-300">{shuffleAnswers ? 'Bật' : 'Tắt'}</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Xem lại bài</label>
                    <div className="flex items-center h-[50px] px-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={allowReview}
                          onChange={e => setAllowReview(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                        <span className="ml-3 text-sm font-bold text-slate-300">{allowReview ? 'Bật' : 'Tắt'}</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Xem điểm ngay</label>
                    <div className="flex items-center h-[50px] px-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={showScore}
                          onChange={e => setShowScore(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                        <span className="ml-3 text-sm font-bold text-slate-300">{showScore ? 'Cho phép' : 'Ẩn điểm'}</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Hiệu ứng lơ lửng</label>
                    <div className="flex items-center h-[50px] px-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={showBackgroundEffect}
                          onChange={e => setShowBackgroundEffect(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                        <span className="ml-3 text-sm font-bold text-slate-300">{showBackgroundEffect ? 'Bật' : 'Tắt'}</span>
                      </label>
                    </div>
                  </div>
                  {showBackgroundEffect && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Loại hiệu ứng</label>
                      <select
                        value={backgroundEffectType}
                        onChange={e => setBackgroundEffectType(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3 px-5 text-white font-bold focus:outline-none focus:border-teal-500 transition-all appearance-none"
                      >
                        <option value="classic">Cổ điển (+, .)</option>
                        <option value="electrons">Điện tử (●)</option>
                        <option value="snow">Tuyết (❄)</option>
                        <option value="cherry_blossoms">Hoa anh đào (🌸)</option>
                        <option value="bubbles">Bong bóng (○)</option>
                        <option value="hearts">Trái tim (❤️)</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <ExamEditor 
                questions={questions} 
                sectionPoints={sectionPoints}
                onUpdate={(newQuestions, newSectionPoints) => {
                  setQuestions(newQuestions);
                  setSectionPoints(newSectionPoints);
                }} 
              />
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tight">Ngân hàng đề thi</h2>
                  <p className="text-slate-500 font-medium">Quản lý các đề thi đã lưu trong hệ thống</p>
                </div>
                <div className="flex items-center gap-4">
                  <select
                    value={filterGrade}
                    onChange={(e) => setFilterGrade(e.target.value as any)}
                    className="bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-2 text-white font-bold focus:outline-none focus:border-teal-500 transition-all appearance-none"
                  >
                    <option value="all">Tất cả khối lớp</option>
                    <option value="10">Khối 10</option>
                    <option value="11">Khối 11</option>
                    <option value="12">Khối 12</option>
                  </select>
                  <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-slate-800">
                    <div className="px-4 py-2 text-sm font-bold text-teal-400 border-r border-slate-800">
                      {filteredExams.length} Đề thi
                    </div>
                    <button 
                      onClick={() => {
                        setEditingExamId(null);
                        setQuestions([]);
                        setExamTitle('');
                        setExamGrade('12');
                        setActiveTab('matrix');
                      }}
                      className="px-4 py-2 text-sm font-bold text-white hover:text-teal-400 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Tạo đề mới
                    </button>
                  </div>
                </div>
              </div>

              {isLoadingExams ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
                  <p className="text-slate-500 font-bold animate-pulse">Đang tải ngân hàng đề...</p>
                </div>
              ) : filteredExams.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/30 border border-dashed border-slate-800 rounded-[3rem]">
                  <FileText className="w-20 h-20 text-slate-800 mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-white mb-2">Chưa có đề thi nào</h3>
                  <p className="text-slate-500 mb-8">Hãy bắt đầu bằng cách tạo đề thi mới từ ma trận hoặc file Word.</p>
                  <button 
                    onClick={() => {
                      setEditingExamId(null);
                      setQuestions([]);
                      setExamTitle('');
                      setExamGrade('12');
                      setActiveTab('matrix');
                    }}
                    className="px-8 py-3 bg-teal-500 text-white font-bold rounded-2xl hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/20"
                  >
                    Tạo đề ngay
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredExams.map((exam) => (
                    <motion.div
                      key={exam.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-6 hover:border-teal-500/30 transition-all group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <div className="p-3 bg-teal-500/10 rounded-2xl border border-teal-500/20">
                            <BookOpen className="w-6 h-6 text-teal-400" />
                          </div>
                          <div className="text-[10px] font-bold text-slate-600 uppercase text-right">
                            {exam.createdAt?.toDate ? exam.createdAt.toDate().toLocaleDateString('vi-VN') : 'Mới tạo'}
                          </div>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 leading-snug">
                          {exam.grade && (
                            <span className="inline-block px-2 py-0.5 bg-teal-500/20 text-teal-400 text-xs rounded-md mr-2 align-middle">
                              Khối {exam.grade}
                            </span>
                          )}
                          {exam.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                          <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-800/50 px-2 py-1 rounded-lg">
                            {exam.questions.length} Câu hỏi
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-800/50 px-2 py-1 rounded-lg flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {exam.timeLimit} phút
                          </span>
                          {exam.isOpen === false && (
                            <span className="px-2 py-1 text-[10px] font-bold rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1 uppercase">
                              <Lock className="w-3 h-3" />
                              Đã đóng
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 mt-auto border-t border-slate-800/50">
                        <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-2.5 flex flex-wrap justify-center items-center gap-2 shadow-inner">
                          <button 
                            onClick={() => setSelectedLeaderboardExam(exam.id)}
                            className="p-2.5 bg-slate-800/80 text-slate-400 hover:text-yellow-400 hover:bg-slate-700 rounded-xl transition-all"
                            title="Xem Bảng xếp hạng"
                          >
                            <Trophy className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleToggleOpen(exam.id, exam.isOpen)}
                            className={`p-2.5 rounded-xl transition-all ${
                              exam.isOpen === false 
                                ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white' 
                                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white'
                            }`}
                            title={exam.isOpen === false ? "Mở bài thi" : "Đóng bài thi"}
                          >
                            {exam.isOpen === false ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={() => handleToggleReview(exam.id, exam.allowReview)}
                            className={`p-2.5 rounded-xl transition-all ${
                              exam.allowReview === false 
                                ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white' 
                                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white'
                            }`}
                            title={exam.allowReview === false ? "Cho phép xem lại bài" : "Tắt xem lại bài"}
                          >
                            {exam.allowReview === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={() => handleToggleShowScore(exam.id, exam.showScore)}
                            className={`p-2.5 rounded-xl transition-all ${
                              exam.showScore === false 
                                ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white' 
                                : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white'
                            }`}
                            title={exam.showScore === false ? "Cho phép xem điểm" : "Tắt xem điểm"}
                          >
                            <div className="relative w-4 h-4">
                              {exam.showScore === false ? <EyeOff className="w-full h-full" /> : <Eye className="w-full h-full" />}
                              <span className="absolute -top-[6px] -right-[6px] text-[8px] font-black">A+</span>
                            </div>
                          </button>
                          <button 
                            onClick={() => setViewingResultsExam(exam)}
                            className="p-2.5 bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white rounded-xl transition-all"
                            title="Phát bài (Chi tiết & Toàn bộ)"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setViewingResultsExam(exam)}
                            className="p-2.5 bg-slate-800/80 text-slate-400 hover:text-emerald-400 hover:bg-slate-700 rounded-xl transition-all"
                            title="Xem kết quả"
                          >
                            <Users className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setQuestions(exam.questions);
                              setExamTitle(exam.title);
                              setMatrix(exam.matrix || { multipleChoice: 12, trueFalse: 3, shortAnswer: 6 });
                              setSectionPoints(exam.sectionPoints || { multipleChoice: 3, trueFalse: 4, shortAnswer: 3 });
                              setDuration(exam.timeLimit || 50);
                              setExamType(exam.type || 'Bài thi');
                              setExamGrade(exam.grade || '12');
                              setAntiCheat(exam.antiCheat !== undefined ? exam.antiCheat : true);
                              setShuffleQuestions(exam.shuffleQuestions || false);
                              setShuffleAnswers(exam.shuffleAnswers || false);
                              setAllowReview(exam.allowReview !== undefined ? exam.allowReview : true);
                              setShowScore(exam.showScore !== undefined ? exam.showScore : true);
                              setShowBackgroundEffect(exam.showBackgroundEffect !== undefined ? exam.showBackgroundEffect : true);
                              setBackgroundEffectType(exam.backgroundEffectType || 'classic');
                              setEditingExamId(exam.id);
                              setActiveTab('editor');
                            }}
                            className="p-2.5 bg-slate-800/80 text-slate-400 hover:text-teal-400 hover:bg-slate-700 rounded-xl transition-all"
                            title="Chỉnh sửa"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteExam(exam.id)}
                            className="p-2.5 bg-slate-800/80 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded-xl transition-all"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-10 right-10 bg-teal-500 text-white px-8 py-4 rounded-2xl shadow-2xl font-black text-sm tracking-widest uppercase z-[100] flex items-center gap-3"
          >
            <CheckCircle2 className="w-6 h-6" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingResultsExam && (
          <ExamResultsModal
            examId={viewingResultsExam.id}
            examTitle={viewingResultsExam.title}
            questions={viewingResultsExam.questions}
            onClose={() => setViewingResultsExam(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedLeaderboardExam && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl relative my-8"
            >
              <button 
                onClick={() => setSelectedLeaderboardExam(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="p-6 md:p-8 pt-10">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  Quản lý Bảng xếp hạng
                </h2>
                <div className="max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
                  <AdminLeaderboard examId={selectedLeaderboardExam} />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
