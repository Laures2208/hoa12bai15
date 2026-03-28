import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { BookOpen, Download, Search, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { GoogleGenAI } from '@google/genai';

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

interface Theory {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: any;
}

export const StudentTheory: React.FC = () => {
  const [theories, setTheories] = useState<Theory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTheory, setSelectedTheory] = useState<Theory | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [firestoreError, setFirestoreError] = useState<Error | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  if (firestoreError) {
    throw firestoreError;
  }

  useEffect(() => {
    const q = query(collection(db, 'theories'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Theory[] = [];
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
  }, []);

  const handleDownloadWord = (theory: Theory) => {
    if (!contentRef.current) return;

    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + `<h1>${theory.title}</h1>` + contentRef.current.innerHTML + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${theory.title.replace(/\s+/g, '_')}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  const generateSummary = async (theory: Theory) => {
    setIsGeneratingSummary(true);
    setAiSummary(null);
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const prompt = `Bạn là một gia sư Hóa học. Hãy tóm tắt ngắn gọn, dễ hiểu và rút ra các điểm chính cần nhớ từ bài lý thuyết sau đây:\n\nTiêu đề: ${theory.title}\n\nNội dung:\n${theory.content}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
      });

      setAiSummary(response.text || 'Không thể tạo tóm tắt.');
    } catch (error) {
      console.error("Error generating summary:", error);
      alert("Lỗi khi tạo tóm tắt bằng AI. Vui lòng kiểm tra lại API Key.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const filteredTheories = theories.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm lý thuyết..."
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-teal-500 shadow-lg backdrop-blur-sm transition-colors"
            />
          </div>

          {filteredTheories.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-slate-800/30 rounded-2xl border border-slate-700/50">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Không tìm thấy bài lý thuyết nào.</p>
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
                    <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center border border-teal-500/20 group-hover:scale-110 transition-transform">
                      <BookOpen className="w-6 h-6 text-teal-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-teal-400 transition-colors">{theory.title}</h3>
                      <p className="text-sm text-slate-400 line-clamp-3 mb-4">
                        {theory.content.replace(/[#*`_~]/g, '')}
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

          <div className="p-6 md:p-8">
            <div 
              ref={contentRef}
              className="prose prose-invert prose-teal max-w-none"
            >
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {selectedTheory.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
