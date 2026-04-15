import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { X, Users, Clock, CheckCircle2, XCircle, ChevronDown, ChevronUp, Search, Download, RefreshCw, Trash2 } from 'lucide-react';
import { Question } from './ExamRoom';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { fixLatex } from '../utils/latexHelper';

interface ExamResultsModalProps {
  examId: string;
  examTitle: string;
  questions: Question[];
  onClose: () => void;
}

interface StudentResult {
  id: string;
  studentName: string;
  studentClass: string;
  score: number;
  totalPoints?: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  createdAt: any;
  answers: any[];
  canRetake?: boolean;
}

export const ExamResultsModal: React.FC<ExamResultsModalProps> = ({ examId, examTitle, questions, onClose }) => {
  const [results, setResults] = useState<StudentResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'results'),
      where('examId', '==', examId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StudentResult[];
      
      // Sort client-side to avoid missing index errors
      data.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      
      setResults(data);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching results:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [examId]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}p ${s}s`;
  };

  const filteredResults = results.filter(r => 
    r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.studentClass.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by class
  const groupedResults = filteredResults.reduce((acc, curr) => {
    if (!acc[curr.studentClass]) {
      acc[curr.studentClass] = [];
    }
    acc[curr.studentClass].push(curr);
    return acc;
  }, {} as Record<string, StudentResult[]>);

  const handleAllowRetake = async (resultId: string) => {
    try {
      await updateDoc(doc(db, 'results', resultId), {
        canRetake: true
      });
    } catch (error) {
      console.error("Error updating result:", error);
      alert("Có lỗi xảy ra khi cấp quyền thi lại.");
    }
  };

  const handleDeleteResult = async (resultId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa kết quả này? Hành động này không thể hoàn tác.")) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'results', resultId));
    } catch (error) {
      console.error("Error deleting result:", error);
      alert("Có lỗi xảy ra khi xóa kết quả.");
    }
  };

  const exportToCSV = () => {
    const headers = ['Họ tên', 'Lớp', 'Điểm', 'Số câu đúng', 'Thời gian làm bài', 'Ngày nộp'];
    const csvData = results.map(r => [
      r.studentName,
      r.studentClass,
      `${r.score}/${r.totalPoints || 10}`,
      `${r.correctAnswers}/${r.totalQuestions}`,
      formatTime(r.timeSpent),
      r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString('vi-VN') : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Ket_qua_${examTitle.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
          <div>
            <h2 className="text-2xl font-black text-white">{examTitle}</h2>
            <p className="text-slate-400 mt-1 flex items-center gap-2">
              <Users className="w-4 h-4" /> {results.length} học sinh đã làm bài
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportToCSV}
              disabled={results.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 text-teal-400 rounded-xl hover:bg-teal-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span className="font-bold text-sm">Xuất CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 border-b border-slate-800 bg-slate-900/30">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc lớp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : Object.keys(groupedResults).length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              Không tìm thấy kết quả nào.
            </div>
          ) : (
            Object.entries(groupedResults).map(([className, classResults]) => {
              const avgScore = (classResults.reduce((acc, curr) => acc + curr.score, 0) / classResults.length).toFixed(1);
              const totalPoints = classResults[0]?.totalPoints || 10;
              
              return (
                <div key={className} className="space-y-4">
                  <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-teal-400" />
                      Lớp {className}
                    </h3>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-slate-400">Sĩ số: <span className="text-white font-bold">{classResults.length}</span></span>
                      <span className="text-sm text-slate-400">Điểm TB: <span className="text-emerald-400 font-bold text-lg">{avgScore}/{totalPoints}</span></span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 pl-4 border-l-2 border-slate-800">
                    {classResults.map((result) => (
                      <div key={result.id} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                        <div 
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-900/50 transition-colors"
                          onClick={() => setExpandedId(expandedId === result.id ? null : result.id)}
                        >
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex flex-col items-center justify-center text-white shadow-lg shadow-teal-500/20">
                              <span className="font-black text-xl leading-none">{result.score}</span>
                              <span className="text-[10px] opacity-80 font-bold border-t border-white/20 pt-0.5 mt-0.5 w-8 text-center">{result.totalPoints || 10}</span>
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-white">{result.studentName}</h3>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="flex flex-col items-end">
                              <span className="text-sm text-slate-400 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                {result.correctAnswers}/{result.totalQuestions} đúng
                              </span>
                              <span className="text-sm text-slate-400 flex items-center gap-1">
                                <Clock className="w-4 h-4 text-amber-500" />
                                {formatTime(result.timeSpent)}
                              </span>
                            </div>
                            {expandedId === result.id ? (
                              <ChevronUp className="w-5 h-5 text-slate-500" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-slate-500" />
                            )}
                          </div>
                        </div>

                        <AnimatePresence>
                          {expandedId === result.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-slate-800 bg-slate-900/30"
                            >
                              <div className="p-6 space-y-6">
                                <div className="flex justify-between items-center flex-wrap gap-4">
                                  <h4 className="font-bold text-white flex items-center gap-2">
                                    <XCircle className="w-5 h-5 text-rose-500" />
                                    Các câu trả lời sai
                                  </h4>
                                  
                                  <div className="flex items-center gap-3">
                                    {!result.canRetake ? (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAllowRetake(result.id);
                                        }}
                                        className="px-4 py-2 bg-teal-500/10 text-teal-400 rounded-xl hover:bg-teal-500 hover:text-white transition-colors text-sm font-bold flex items-center gap-2"
                                      >
                                        <RefreshCw className="w-4 h-4" />
                                        Cho phép thi lại
                                      </button>
                                    ) : (
                                      <span className="px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-sm font-bold flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Đã cấp quyền thi lại
                                      </span>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteResult(result.id);
                                      }}
                                      className="px-4 py-2 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-colors text-sm font-bold flex items-center gap-2"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Xóa kết quả
                                    </button>
                                  </div>
                                </div>
                                
                                {(() => {
                                  const wrongAnswers = result.answers?.filter(a => !a.isCorrect) || [];
                                  if (wrongAnswers.length === 0) {
                                    return <p className="text-emerald-400 text-sm">Tuyệt vời! Học sinh này không sai câu nào.</p>;
                                  }

                                  return (
                                    <div className="space-y-4">
                                      {wrongAnswers.map((ans, idx) => {
                                        const q = questions.find(q => q.id === ans.questionId);
                                        if (!q) return null;

                                        return (
                                          <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-rose-500/20">
                                            <div className="text-sm text-slate-300 mb-3 prose prose-invert max-w-none prose-p:my-1">
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
                                    
                                    {q.type === 'multiple_choice' && (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                        <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                          <span className="font-bold">Đã chọn:</span> {ans.selectedOriginalIndex !== undefined && q.options ? q.options[ans.selectedOriginalIndex] : 'Không chọn'}
                                        </div>
                                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                          <span className="font-bold">Đáp án đúng:</span> {q.answer && q.options ? q.options[q.answer.charCodeAt(0) - 65] : ''}
                                        </div>
                                      </div>
                                    )}

                                    {q.type === 'true_false' && (
                                      <div className="space-y-2 text-sm">
                                        {q.subQuestions?.map((sq, i) => {
                                          const studentAns = ans.subAnswers?.[i];
                                          const isSubCorrect = studentAns === sq.answer;
                                          return (
                                            <div key={i} className={`p-2 rounded-lg border ${isSubCorrect ? 'bg-emerald-500/5 border-emerald-500/10 text-slate-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                                              <div className="mb-1"><span className="font-bold">Ý {String.fromCharCode(97 + i)}:</span> {sq.content}</div>
                                              <div className="flex gap-4">
                                                <span>Đã chọn: <strong className={isSubCorrect ? 'text-emerald-400' : 'text-rose-400'}>{studentAns || 'Không chọn'}</strong></span>
                                                {!isSubCorrect && <span>Đúng: <strong className="text-emerald-400">{sq.answer}</strong></span>}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}

                                    {q.type === 'short_answer' && (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                        <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                          <span className="font-bold">Đã nhập:</span> {ans.shortAnswer || 'Không nhập'}
                                        </div>
                                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                          <span className="font-bold">Đáp án đúng:</span> {q.answer}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            </div>
          </div>
        );
      })
    )}
  </div>
</motion.div>
</div>
);
};
