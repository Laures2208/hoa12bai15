import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { BookOpen, Download, Search, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { GoogleGenAI } from '@google/genai';
import { getGeminiApiKey } from '../services/gemini';

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
    tenantId: string | null | undefined;
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

interface TheorySection {
  id: string;
  title?: string;
  content: string;
  imageUrl?: string;
}

interface Theory {
  id: string;
  title: string;
  content: string;
  sections?: TheorySection[];
  author: string;
  grade?: '10' | '11' | '12';
  createdAt: any;
  imageUrl?: string;
}

interface StudentTheoryProps {
  studentInfo?: { name: string; studentClass: string; grade: '10' | '11' | '12' };
}

export const StudentTheory: React.FC<StudentTheoryProps> = ({ studentInfo }) => {
  const [theories, setTheories] = useState<Theory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTheory, setSelectedTheory] = useState<Theory | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<'10' | '11' | '12' | 'all'>(studentInfo?.grade || 'all');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [firestoreError, setFirestoreError] = useState<Error | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (firestoreError) {
    throw firestoreError;
  }

  useEffect(() => {
    const q = query(collection(db, 'theories'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let list: Theory[] = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as Theory);
      });
      setTheories(list);
      setIsLoading(false);
    }, (error) => {
      setIsLoading(false);
      try {
        handleFirestoreError(error, OperationType.LIST, 'theories');
      } catch (e) {
        setFirestoreError(e instanceof Error ? e : new Error(String(e)));
      }
    });

    return () => unsubscribe();
  }, [studentInfo?.grade]);

  const handleDownloadWord = async (theory: Theory) => {
    if (!contentRef.current) return;

    try {
      const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>${theory.title}</title></head><body>
        <h1>${theory.title}</h1>
        ${contentRef.current.innerHTML}
        </body></html>
      `;
      
      const blob = new Blob(['\ufeff', htmlContent], {
        type: 'application/msword'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(theory.title || 'Ly_thuyet').replace(/\s+/g, '_')}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating doc:", error);
      alert("Có lỗi xảy ra khi tạo file Word. Vui lòng thử lại.");
    }
  };

  const generateSummary = async (theory: Theory) => {
    setIsGeneratingSummary(true);
    setAiSummary(null);
    try {
      const apiKey = await getGeminiApiKey();
      if (!apiKey) {
        showToast("Vui lòng cấu hình API Key trong phần cài đặt để sử dụng tính năng AI.");
        setIsGeneratingSummary(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      const fullContent = `${theory.content}\n\n${theory.sections?.map(s => s.content).join('\n\n') || ''}`;
      const prompt = `Bạn là một gia sư Hóa học. Hãy tóm tắt ngắn gọn, dễ hiểu và rút ra các điểm chính cần nhớ từ bài lý thuyết sau đây:\n\nTiêu đề: ${theory.title}\n\nNội dung:\n${fullContent}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setAiSummary(response.text || 'Không thể tạo tóm tắt.');
    } catch (error) {
      console.error("Error generating summary:", error);
      showToast("Lỗi khi tạo tóm tắt bằng AI. Vui lòng kiểm tra lại API Key.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const filteredTheories = theories.filter(t => {
    const matchesSearch = (t.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
      (t.content?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      t.sections?.some(s => (s.content?.toLowerCase() || '').includes(searchTerm.toLowerCase()));
    
    const matchesGrade = selectedGrade === 'all' || t.grade === selectedGrade || !t.grade;
    
    return matchesSearch && matchesGrade;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!selectedTheory ? (
        <>
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm lý thuyết..."
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-teal-500 shadow-lg backdrop-blur-sm transition-colors"
              />
            </div>
            <div className="flex gap-2">
              {(['all', '10', '11', '12'] as const).map((grade) => (
                <button
                  key={grade}
                  onClick={() => setSelectedGrade(grade)}
                  className={cn(
                    "px-6 py-4 rounded-2xl font-bold transition-all whitespace-nowrap border",
                    selectedGrade === grade
                      ? "bg-teal-500 text-white border-teal-500 shadow-lg shadow-teal-500/25"
                      : "bg-slate-800/50 text-slate-400 border-slate-700/50 hover:bg-slate-700 hover:text-white"
                  )}
                >
                  {grade === 'all' ? 'Tất cả' : `Khối ${grade}`}
                </button>
              ))}
            </div>
          </div>

          {filteredTheories.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-slate-800/30 rounded-2xl border border-slate-700/50">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>
                {searchTerm 
                  ? `Không tìm thấy kết quả nào cho "${searchTerm}"${selectedGrade !== 'all' ? ` trong Khối ${selectedGrade}` : ''}.`
                  : selectedGrade !== 'all' 
                    ? `Không có dữ liệu lý thuyết cho Khối ${selectedGrade}.` 
                    : 'Không có bài lý thuyết nào.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTheories.map(theory => (
                <div 
                  key={theory.id} 
                  onClick={() => {
                    setSelectedTheory(theory);
                    setAiSummary(null);
                  }}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 cursor-pointer hover:border-teal-500/50 hover:shadow-[0_0_30px_rgba(20,184,166,0.1)] transition-all group"
                >
                  <div className="flex items-start gap-4">
                    {theory.imageUrl ? (
                      <img src={theory.imageUrl} alt={theory.title} className="w-16 h-16 object-cover rounded-xl border border-teal-500/20 group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center border border-teal-500/20 group-hover:scale-110 transition-transform shrink-0">
                        <BookOpen className="w-6 h-6 text-teal-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-teal-400 transition-colors">{theory.title}</h3>
                      <p className="text-sm text-slate-400 line-clamp-3 mb-4">
                        {theory.content?.replace(/[#*`_~]/g, '') || ''}
                      </p>
                      <div className="text-xs text-slate-500">
                        {theory.createdAt?.toDate ? new Date(theory.createdAt.toDate()).toLocaleDateString('vi-VN') : 'Đang cập nhật'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl">
          {selectedTheory.imageUrl && (
            <img src={selectedTheory.imageUrl} alt={selectedTheory.title} className="w-full h-48 md:h-64 object-cover" referrerPolicy="no-referrer" />
          )}
          <div className="p-6 md:p-8 border-b border-slate-700/50 bg-slate-900/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <button 
                onClick={() => setSelectedTheory(null)}
                className="text-teal-400 hover:text-teal-300 text-sm font-bold mb-4 flex items-center gap-2"
              >
                ← Quay lại danh sách
              </button>
              <h2 className="text-2xl md:text-3xl font-black text-white">{selectedTheory.title}</h2>
              <div className="text-sm text-slate-400 mt-2">
                Đăng ngày: {selectedTheory.createdAt?.toDate ? new Date(selectedTheory.createdAt.toDate()).toLocaleDateString('vi-VN') : 'Đang cập nhật'}
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={() => generateSummary(selectedTheory)}
                disabled={isGeneratingSummary}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-xl hover:bg-indigo-500 hover:text-white transition-colors font-bold text-sm disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {isGeneratingSummary ? 'Đang tóm tắt...' : 'AI Tóm tắt'}
              </button>
              <button
                onClick={() => handleDownloadWord(selectedTheory)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-teal-500/10 text-teal-400 border border-teal-500/30 rounded-xl hover:bg-teal-500 hover:text-white transition-colors font-bold text-sm"
              >
                <Download className="w-4 h-4" />
                Tải Word
              </button>
            </div>
          </div>

          {aiSummary && (
            <div className="m-6 md:m-8 p-6 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[50px] rounded-full pointer-events-none"></div>
              <h3 className="text-lg font-bold text-indigo-400 flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5" />
                AI Tóm tắt & Ghi nhớ
              </h3>
              <div className="prose prose-invert prose-indigo max-w-none text-sm">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {aiSummary}
                </ReactMarkdown>
              </div>
            </div>
          )}

          <div className="p-6 md:p-8" ref={contentRef}>
            <div className="prose prose-invert prose-teal max-w-none">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {selectedTheory.content}
              </ReactMarkdown>
            </div>

            {selectedTheory.sections && selectedTheory.sections.length > 0 && (
              <div className="mt-8 space-y-8">
                {selectedTheory.sections.map((section, index) => (
                  <div key={section.id} className="bg-slate-800/30 rounded-2xl border border-slate-700/50 overflow-hidden">
                    {section.imageUrl && (
                      <img src={section.imageUrl} alt={section.title || `Phần ${index + 1}`} className="w-full h-auto max-h-96 object-cover" referrerPolicy="no-referrer" />
                    )}
                    <div className="p-6">
                      {section.title && (
                        <h3 className="text-xl font-bold text-white mb-4">{section.title}</h3>
                      )}
                      <div className="prose prose-invert prose-teal max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {section.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-slate-800 text-white px-6 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
          <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
          {toastMessage}
        </div>
      )}
    </div>
  );
};
