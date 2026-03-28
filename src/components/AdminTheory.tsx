import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, getDocs, where } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Plus, Edit2, Trash2, X, Save, Sparkles, BookOpen } from 'lucide-react';
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

export const AdminTheory: React.FC = () => {
  const [theories, setTheories] = useState<Theory[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTheory, setCurrentTheory] = useState<Partial<Theory> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiPrompt, setAiPrompt] = useState('');
  const [examCodePrompt, setExamCodePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [firestoreError, setFirestoreError] = useState<Error | null>(null);

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

  const handleSave = async () => {
    if (!currentTheory?.title || !currentTheory?.content) {
      alert("Vui lòng nhập đầy đủ tiêu đề và nội dung.");
      return;
    }

    try {
      if (currentTheory.id) {
        await updateDoc(doc(db, 'theories', currentTheory.id), {
          title: currentTheory.title,
          content: currentTheory.content,
          updatedAt: serverTimestamp()
        }).catch(err => handleFirestoreError(err, OperationType.UPDATE, 'theories/' + currentTheory.id));
      } else {
        await addDoc(collection(db, 'theories'), {
          title: currentTheory.title,
          content: currentTheory.content,
          author: 'Admin',
          createdAt: serverTimestamp(),
        }).catch(err => handleFirestoreError(err, OperationType.CREATE, 'theories'));
      }
      setIsEditing(false);
      setCurrentTheory(null);
    } catch (error) {
      if (error instanceof Error && error.message.includes('FirestoreErrorInfo')) {
        throw error;
      }
      console.error("Error saving theory:", error);
      alert("Lỗi khi lưu lý thuyết.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa lý thuyết này?")) {
      try {
        await deleteDoc(doc(db, 'theories', id)).catch(err => handleFirestoreError(err, OperationType.DELETE, 'theories/' + id));
      } catch (error) {
        if (error instanceof Error && error.message.includes('FirestoreErrorInfo')) {
          throw error;
        }
        console.error("Error deleting theory:", error);
        alert("Lỗi khi xóa lý thuyết.");
      }
    }
  };

  const generateTheoryWithAI = async () => {
    if (!aiPrompt.trim()) {
      alert("Vui lòng nhập chủ đề để AI tạo lý thuyết.");
      return;
    }

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const prompt = `Bạn là một giáo viên Hóa học giỏi. Hãy viết một bài lý thuyết chi tiết về chủ đề: "${aiPrompt}".
      Yêu cầu:
      - Sử dụng định dạng Markdown.
      - Sử dụng LaTeX cho các công thức hóa học và toán học (ví dụ: $H_2O$, $CO_2$, phương trình phản ứng).
      - Cấu trúc bài viết rõ ràng, có tiêu đề các phần (Sử dụng ##, ###).
      - Nội dung chính xác, dễ hiểu cho học sinh phổ thông.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
      });

      const generatedText = response.text || '';
      setCurrentTheory(prev => ({
        ...prev,
        content: prev?.content ? prev.content + '\n\n' + generatedText : generatedText,
        title: prev?.title || aiPrompt
      }));
      setAiPrompt('');
    } catch (error) {
      console.error("Error generating theory:", error);
      alert("Lỗi khi tạo lý thuyết bằng AI. Vui lòng kiểm tra lại API Key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTheoryFromExam = async () => {
    if (!examCodePrompt.trim()) {
      alert("Vui lòng nhập mã đề thi.");
      return;
    }

    setIsGenerating(true);
    try {
      // Fetch exam questions
      const q = query(collection(db, 'questions'), where('examId', '==', examCodePrompt.trim()));
      const snapshot = await getDocs(q).catch(err => {
        handleFirestoreError(err, OperationType.LIST, 'questions');
        throw err;
      });
      
      if (snapshot.empty) {
        alert("Không tìm thấy câu hỏi nào cho mã đề này.");
        setIsGenerating(false);
        return;
      }

      const questions = snapshot.docs.map(doc => doc.data().content).join('\n\n');

      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const prompt = `Bạn là một giáo viên Hóa học giỏi. Dựa vào danh sách các câu hỏi trắc nghiệm hóa học sau đây, hãy tổng hợp và viết một bài lý thuyết chi tiết bao phủ toàn bộ các kiến thức cần thiết để giải quyết các câu hỏi này.
      
      Danh sách câu hỏi:
      ${questions}

      Yêu cầu:
      - Sử dụng định dạng Markdown.
      - Sử dụng LaTeX cho các công thức hóa học và toán học (ví dụ: $H_2O$, $CO_2$, phương trình phản ứng).
      - Cấu trúc bài viết rõ ràng, phân loại theo từng chủ đề kiến thức xuất hiện trong đề thi (Sử dụng ##, ###).
      - Nội dung chính xác, dễ hiểu cho học sinh phổ thông.
      - Không cần giải chi tiết từng câu hỏi, chỉ tập trung vào phần lý thuyết nền tảng.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
      });

      const generatedText = response.text || '';
      setCurrentTheory(prev => ({
        ...prev,
        content: prev?.content ? prev.content + '\n\n' + generatedText : generatedText,
        title: prev?.title || `Lý thuyết tổng hợp từ mã đề ${examCodePrompt}`
      }));
      setExamCodePrompt('');
    } catch (error) {
      console.error("Error generating theory from exam:", error);
      alert("Lỗi khi tạo lý thuyết từ mã đề. Vui lòng kiểm tra lại kết nối hoặc API Key.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">Đang tải...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-teal-500" />
          Quản lý Lý thuyết Hóa học
        </h2>
        <button
          onClick={() => {
            setCurrentTheory({ title: '', content: '' });
            setIsEditing(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-bold"
        >
          <Plus className="w-4 h-4" />
          Thêm lý thuyết mới
        </button>
      </div>

      {isEditing && currentTheory ? (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">
              {currentTheory.id ? 'Sửa lý thuyết' : 'Thêm lý thuyết mới'}
            </h3>
            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Tiêu đề</label>
              <input
                type="text"
                value={currentTheory.title || ''}
                onChange={(e) => setCurrentTheory({ ...currentTheory, title: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"
                placeholder="Nhập tiêu đề lý thuyết (VD: Cấu tạo nguyên tử)..."
              />
            </div>

            {/* AI Generation Section */}
            <div className="bg-slate-900/50 p-4 rounded-lg border border-teal-500/30 space-y-4">
              <label className="block text-sm font-medium text-teal-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Tạo nội dung bằng AI
              </label>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Nhập chủ đề để AI viết (VD: Tính chất hóa học của Axit)..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      generateTheoryWithAI();
                    }
                  }}
                />
                <button
                  onClick={generateTheoryWithAI}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg hover:from-teal-600 hover:to-emerald-600 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                >
                  {isGenerating ? 'Đang tạo...' : 'Tạo theo chủ đề'}
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={examCodePrompt}
                  onChange={(e) => setExamCodePrompt(e.target.value)}
                  placeholder="Nhập mã đề thi để tổng hợp lý thuyết (VD: DE01)..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      generateTheoryFromExam();
                    }
                  }}
                />
                <button
                  onClick={generateTheoryFromExam}
                  disabled={isGenerating || !examCodePrompt.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                >
                  {isGenerating ? 'Đang tạo...' : 'Tạo từ mã đề'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Nội dung (Hỗ trợ Markdown & LaTeX)</label>
              <textarea
                value={currentTheory.content || ''}
                onChange={(e) => setCurrentTheory({ ...currentTheory, content: e.target.value })}
                className="w-full h-96 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500 font-mono text-sm custom-scrollbar"
                placeholder="Nhập nội dung lý thuyết..."
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-bold"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-bold"
              >
                <Save className="w-4 h-4" />
                Lưu lý thuyết
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        {theories.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-slate-800/50 rounded-xl border border-slate-700/50">
            Chưa có bài lý thuyết nào.
          </div>
        ) : (
          theories.map(theory => (
            <div key={theory.id} className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{theory.title}</h3>
                  <div className="text-xs text-slate-400">
                    <span>{theory.createdAt?.toDate ? new Date(theory.createdAt.toDate()).toLocaleString('vi-VN') : 'Đang cập nhật...'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setCurrentTheory(theory);
                      setIsEditing(true);
                    }}
                    className="p-2 text-slate-400 hover:text-teal-400 hover:bg-teal-400/10 rounded-lg transition-colors"
                    title="Sửa"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(theory.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="prose prose-invert prose-teal max-w-none max-h-64 overflow-y-auto custom-scrollbar pr-2">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {theory.content}
                </ReactMarkdown>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
