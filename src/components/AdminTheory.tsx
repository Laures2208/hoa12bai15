import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, getDocs, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../firebase';
import { Plus, Edit2, Trash2, X, Save, Sparkles, BookOpen, Upload, Loader2, ArrowUp, ArrowDown, ImagePlus } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { GoogleGenAI } from '@google/genai';
import mammoth from 'mammoth';
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

export const AdminTheory: React.FC = () => {
  const [theories, setTheories] = useState<Theory[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTheory, setCurrentTheory] = useState<Partial<Theory> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiPrompt, setAiPrompt] = useState('');
  const [examCodePrompt, setExamCodePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [filterGrade, setFilterGrade] = useState<'all' | '10' | '11' | '12'>('all');
  const [firestoreError, setFirestoreError] = useState<Error | null>(null);

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
      if (filterGrade !== 'all') {
        list = list.filter(t => t.grade === filterGrade);
      }
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

  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = async () => {
    if (!currentTheory?.title || (!currentTheory?.content && (!currentTheory?.sections || currentTheory.sections.length === 0))) {
      showToast("Vui lòng nhập đầy đủ tiêu đề và nội dung.");
      return;
    }

    try {
      const data = {
        title: currentTheory.title,
        content: currentTheory.content || '',
        imageUrl: currentTheory.imageUrl || '',
        sections: currentTheory.sections || [],
        grade: currentTheory.grade || '12',
      };

      if (currentTheory.id) {
        await updateDoc(doc(db, 'theories', currentTheory.id), {
          ...data,
          updatedAt: serverTimestamp()
        }).catch(err => handleFirestoreError(err, OperationType.UPDATE, 'theories/' + currentTheory.id));
        showToast("Đã cập nhật lý thuyết thành công.");
      } else {
        await addDoc(collection(db, 'theories'), {
          ...data,
          author: 'Giáo viên',
          createdAt: serverTimestamp(),
        }).catch(err => handleFirestoreError(err, OperationType.CREATE, 'theories'));
        showToast("Đã thêm lý thuyết mới thành công.");
      }
      setIsEditing(false);
      setCurrentTheory(null);
    } catch (error) {
      if (error instanceof Error && error.message.includes('FirestoreErrorInfo')) {
        throw error;
      }
      console.error("Error saving theory:", error);
      showToast("Lỗi khi lưu lý thuyết.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'theories', id)).catch(err => handleFirestoreError(err, OperationType.DELETE, 'theories/' + id));
      showToast("Đã xóa lý thuyết thành công.");
    } catch (error) {
      if (error instanceof Error && error.message.includes('FirestoreErrorInfo')) {
        throw error;
      }
      console.error("Error deleting theory:", error);
      showToast("Lỗi khi xóa lý thuyết.");
    } finally {
      setShowConfirmDelete(null);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, sectionId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadId = sectionId || 'main';
    setUploadingImageId(uploadId);
    showToast("Đang tải ảnh lên...");

    try {
      const imageRef = ref(storage, `theories/images/${Date.now()}_${file.name}`);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);

      if (sectionId) {
        setCurrentTheory(prev => ({
          ...prev,
          sections: prev?.sections?.map(s => s.id === sectionId ? { ...s, imageUrl: url } : s)
        }));
      } else {
        setCurrentTheory(prev => ({ ...prev, imageUrl: url }));
      }
      showToast("Tải ảnh lên thành công!");
    } catch (error) {
      console.error("Error uploading image:", error);
      showToast("Lỗi khi tải ảnh lên.");
    } finally {
      setUploadingImageId(null);
    }
  };

  const generateTheoryWithAI = async () => {
    if (!aiPrompt.trim()) {
      showToast("Vui lòng nhập chủ đề để AI tạo lý thuyết.");
      return;
    }

    setIsGenerating(true);
    try {
      const apiKey = await getGeminiApiKey();
      if (!apiKey) {
        showToast("Vui lòng cấu hình API Key trong phần cài đặt để sử dụng tính năng AI.");
        setIsGenerating(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Bạn là một giáo viên Hóa học giỏi. Hãy viết một bài lý thuyết chi tiết về chủ đề: "${aiPrompt}".
      Yêu cầu:
      - Sử dụng định dạng Markdown.
      - Sử dụng LaTeX cho các công thức hóa học và toán học (ví dụ: $H_2O$, $CO_2$, phương trình phản ứng).
      - Cấu trúc bài viết rõ ràng, có tiêu đề các phần (Sử dụng ##, ###).
      - Nội dung chính xác, dễ hiểu cho học sinh phổ thông.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const generatedText = response.text || '';
      setCurrentTheory(prev => ({
        ...prev,
        content: prev?.content ? prev.content + '\n\n' + generatedText : generatedText,
        title: prev?.title || aiPrompt
      }));
      setAiPrompt('');
      showToast("Đã tạo nội dung bằng AI thành công.");
    } catch (error) {
      console.error("Error generating theory:", error);
      showToast("Lỗi khi tạo lý thuyết bằng AI. Vui lòng kiểm tra lại API Key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTheoryFromExam = async () => {
    if (!examCodePrompt.trim()) {
      showToast("Vui lòng nhập mã đề thi.");
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
        showToast("Không tìm thấy câu hỏi nào cho mã đề này.");
        setIsGenerating(false);
        return;
      }

      const questions = snapshot.docs.map(doc => doc.data().content).join('\n\n');

      const apiKey = await getGeminiApiKey();
      if (!apiKey) {
        showToast("Vui lòng cấu hình API Key trong phần cài đặt để sử dụng tính năng AI.");
        setIsGenerating(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
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
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const generatedText = response.text || '';
      setCurrentTheory(prev => ({
        ...prev,
        content: prev?.content ? prev.content + '\n\n' + generatedText : generatedText,
        title: prev?.title || `Lý thuyết tổng hợp từ mã đề ${examCodePrompt}`
      }));
      setExamCodePrompt('');
      showToast("Đã tạo nội dung từ mã đề thành công.");
    } catch (error) {
      console.error("Error generating theory from exam:", error);
      showToast("Lỗi khi tạo lý thuyết từ mã đề. Vui lòng kiểm tra lại kết nối hoặc API Key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const processWordFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const extractedImages: { id: string, blob: Blob, marker: string, url?: string }[] = [];
      let imageIndex = 1;

      const options = {
        // @ts-ignore
        convertImage: mammoth.images.inline(function(element) {
          return element.read("arrayBuffer").then(function(imageBuffer) {
            const blob = new Blob([imageBuffer], { type: element.contentType });
            const marker = `[[IMAGE_PLACEHOLDER_${imageIndex}]]`;
            extractedImages.push({
              id: `img_${imageIndex}`,
              blob,
              marker
            });
            imageIndex++;
            return { src: marker };
          });
        })
      };

      // @ts-ignore
      const htmlResult = await mammoth.convertToHtml({ arrayBuffer }, options);
      let htmlText = htmlResult.value;
      
      let textWithMarkers = htmlText.replace(/<img[^>]+src="(\[\[IMAGE_PLACEHOLDER_\d+\]\]|%5B%5BIMAGE_PLACEHOLDER_\d+%5D%5D)"[^>]*>/g, (match, p1) => {
        return `\n\n${decodeURIComponent(p1)}\n\n`;
      });
      
      // Convert basic HTML to Markdown
      textWithMarkers = textWithMarkers
        .replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n')
        .replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n')
        .replace(/<h3>(.*?)<\/h3>/g, '### $1\n\n')
        .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
        .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
        .replace(/<em>(.*?)<\/em>/g, '*$1*')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<[^>]+>/g, ''); // Strip remaining HTML tags
        
      textWithMarkers = textWithMarkers.replace(/\n\s*\n/g, '\n\n');

      showToast("Đang dùng AI định dạng công thức hóa học...");
      let formattedText = textWithMarkers;
      try {
        const apiKey = await getGeminiApiKey();
        if (!apiKey) {
          showToast("Vui lòng cấu hình API Key trong phần cài đặt để sử dụng tính năng AI.");
          setIsProcessingFile(false);
          return;
        }
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Bạn là một chuyên gia Hóa học và định dạng văn bản. Hãy định dạng lại đoạn văn bản lý thuyết hóa học sau đây.
        Yêu cầu QUAN TRỌNG:
        - GIỮ NGUYÊN toàn bộ nội dung, cấu trúc, và các đánh dấu hình ảnh (ví dụ: [[IMAGE_PLACEHOLDER_1]]).
        - CHỈ bổ sung định dạng LaTeX (sử dụng dấu $...$) cho TẤT CẢ các công thức hóa học, chất hóa học, phương trình hóa học, và ký hiệu toán học.
        - Ví dụ: H2O -> $H_2O$, CO2 -> $CO_2$, Cu2+ -> $Cu^{2+}$, 2H2 + O2 -> 2H2O -> $2H_2 + O_2 \\rightarrow 2H_2O$.
        - KHÔNG bọc kết quả trong block code markdown (như \`\`\`markdown). Trả về trực tiếp văn bản.
        - KHÔNG thêm bất kỳ lời chào hay giải thích nào.

        Văn bản cần định dạng:
        ${textWithMarkers}`;

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
        });
        
        if (response.text) {
          formattedText = response.text;
          // Remove markdown code block if AI still added it
          if (formattedText.startsWith('\`\`\`markdown')) {
            formattedText = formattedText.replace(/^\`\`\`markdown\n/, '').replace(/\n\`\`\`$/, '');
          } else if (formattedText.startsWith('\`\`\`')) {
            formattedText = formattedText.replace(/^\`\`\`\n/, '').replace(/\n\`\`\`$/, '');
          }
        }
      } catch (aiError) {
        console.error("AI formatting error:", aiError);
        showToast("Lỗi khi định dạng bằng AI. Đang sử dụng văn bản gốc.");
      }

      showToast("Đang tải ảnh lên...");
      // Upload images
      for (let i = 0; i < extractedImages.length; i++) {
        const img = extractedImages[i];
        const imageRef = ref(storage, `theories/images/${Date.now()}_${i}.png`);
        await uploadBytes(imageRef, img.blob);
        const url = await getDownloadURL(imageRef);
        
        const markdownImg = `\n\n![Hình ảnh](${url})\n\n`;
        formattedText = formattedText.split(img.marker).join(markdownImg);
      }

      setCurrentTheory(prev => ({
        ...prev,
        content: prev?.content ? prev.content + '\n\n' + formattedText : formattedText,
        title: prev?.title || file.name.replace(/\.[^/.]+$/, "")
      }));

      showToast("Đã tải lên và xử lý file Word thành công.");
    } catch (error) {
      console.error("Error processing Word file:", error);
      showToast("Lỗi khi đọc file Word. Vui lòng thử lại.");
    } finally {
      setIsProcessingFile(false);
      // Reset input
      e.target.value = '';
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">Đang tải...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-teal-500" />
            Quản lý Lý thuyết Hóa học
          </h2>
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-teal-500 text-sm font-medium"
          >
            <option value="all">Tất cả khối lớp</option>
            <option value="10">Khối 10</option>
            <option value="11">Khối 11</option>
            <option value="12">Khối 12</option>
          </select>
        </div>
        <button
          onClick={() => {
            setCurrentTheory({ title: '', content: '', grade: '12' });
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
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-400 mb-1">Tiêu đề</label>
                <input
                  type="text"
                  value={currentTheory.title || ''}
                  onChange={(e) => setCurrentTheory({ ...currentTheory, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"
                  placeholder="Nhập tiêu đề lý thuyết (VD: Cấu tạo nguyên tử)..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Khối lớp</label>
                <select
                  value={currentTheory.grade || '12'}
                  onChange={(e) => setCurrentTheory({ ...currentTheory, grade: e.target.value as '10' | '11' | '12' })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="10">Khối 10</option>
                  <option value="11">Khối 11</option>
                  <option value="12">Khối 12</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Hình ảnh minh họa (tùy chọn)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentTheory.imageUrl || ''}
                  onChange={(e) => setCurrentTheory({ ...currentTheory, imageUrl: e.target.value })}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"
                  placeholder="Nhập URL hình ảnh..."
                />
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e)}
                    disabled={uploadingImageId === 'main'}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <button
                    disabled={uploadingImageId === 'main'}
                    className="px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 hover:bg-slate-700 flex items-center gap-2 disabled:opacity-50 transition-colors"
                  >
                    {uploadingImageId === 'main' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ImagePlus className="w-4 h-4" />
                    )}
                    Tải ảnh lên
                  </button>
                </div>
              </div>
            </div>

            {/* AI Generation Section */}
            <div className="bg-slate-900/50 p-4 rounded-lg border border-teal-500/30 space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-teal-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Tạo nội dung bằng AI hoặc Tải lên File Word
                </label>
                
                <div className="relative">
                  <input
                    type="file"
                    accept=".docx"
                    onChange={processWordFile}
                    disabled={isProcessingFile}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <button
                    disabled={isProcessingFile}
                    className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-slate-600 text-sm"
                  >
                    {isProcessingFile ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {isProcessingFile ? 'Đang xử lý...' : 'Tải lên File Word (.docx)'}
                  </button>
                </div>
              </div>
              
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

            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-slate-400">Nội dung (Hỗ trợ Markdown & LaTeX)</label>
              <button
                onClick={async () => {
                  if (!currentTheory.content) return;
                  setIsGenerating(true);
                  showToast("Đang dùng AI chuẩn hóa công thức hóa học...");
                  try {
                    const apiKey = await getGeminiApiKey();
                    if (!apiKey) {
                      showToast("Vui lòng cấu hình API Key trong phần cài đặt để sử dụng tính năng AI.");
                      setIsGenerating(false);
                      return;
                    }
                    const ai = new GoogleGenAI({ apiKey });
                    const prompt = `Bạn là một chuyên gia Hóa học và định dạng văn bản. Hãy định dạng lại đoạn văn bản lý thuyết hóa học sau đây.
                    Yêu cầu QUAN TRỌNG:
                    - GIỮ NGUYÊN toàn bộ nội dung, cấu trúc, và các đánh dấu hình ảnh (ví dụ: [[IMAGE_PLACEHOLDER_1]]).
                    - CHỈ bổ sung định dạng LaTeX (sử dụng dấu $...$) cho TẤT CẢ các công thức hóa học, chất hóa học, phương trình hóa học, và ký hiệu toán học.
                    - Ví dụ: H2O -> $H_2O$, CO2 -> $CO_2$, Cu2+ -> $Cu^{2+}$, 2H2 + O2 -> 2H2O -> $2H_2 + O_2 \\rightarrow 2H_2O$.
                    - KHÔNG bọc kết quả trong block code markdown (như \`\`\`markdown). Trả về trực tiếp văn bản.
                    - KHÔNG thêm bất kỳ lời chào hay giải thích nào.

                    Văn bản cần định dạng:
                    ${currentTheory.content}`;

                    const response = await ai.models.generateContent({
                      model: "gemini-3-flash-preview",
                      contents: prompt,
                    });
                    
                    if (response.text) {
                      let formattedText = response.text;
                      // Remove markdown code block if AI still added it
                      if (formattedText.startsWith('\`\`\`markdown')) {
                        formattedText = formattedText.replace(/^\`\`\`markdown\n/, '').replace(/\n\`\`\`$/, '');
                      } else if (formattedText.startsWith('\`\`\`')) {
                        formattedText = formattedText.replace(/^\`\`\`\n/, '').replace(/\n\`\`\`$/, '');
                      }
                      setCurrentTheory(prev => ({ ...prev, content: formattedText }));
                      showToast("Đã chuẩn hóa công thức thành công.");
                    }
                  } catch (error) {
                    console.error("AI formatting error:", error);
                    showToast("Lỗi khi chuẩn hóa bằng AI.");
                  } finally {
                    setIsGenerating(false);
                  }
                }}
                disabled={isGenerating || !currentTheory.content}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30 transition-colors text-xs font-bold disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3" />
                {isGenerating ? 'Đang xử lý...' : 'Chuẩn hóa công thức (AI)'}
              </button>
            </div>
            <div>
              <textarea
                value={currentTheory.content || ''}
                onChange={(e) => setCurrentTheory({ ...currentTheory, content: e.target.value })}
                className="w-full h-96 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500 font-mono text-sm custom-scrollbar"
                placeholder="Nhập nội dung lý thuyết..."
              />
            </div>

            {/* Sections */}
            <div className="space-y-4 pt-4 border-t border-slate-700">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-slate-400">Các phần nội dung chi tiết</label>
                <button
                  onClick={() => {
                    setCurrentTheory(prev => ({
                      ...prev,
                      sections: [...(prev?.sections || []), { id: Date.now().toString(), title: '', content: '', imageUrl: '' }]
                    }));
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-xs font-bold"
                >
                  <Plus className="w-3 h-3" />
                  Thêm phần nội dung
                </button>
              </div>

              {currentTheory.sections?.map((section, index) => (
                <div key={section.id} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-4 relative">
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (index === 0) return;
                        setCurrentTheory(prev => {
                          if (!prev?.sections) return prev;
                          const newSections = [...prev.sections];
                          const temp = newSections[index - 1];
                          newSections[index - 1] = newSections[index];
                          newSections[index] = temp;
                          return { ...prev, sections: newSections };
                        });
                      }}
                      disabled={index === 0}
                      className="text-slate-500 hover:text-teal-400 transition-colors disabled:opacity-30 disabled:hover:text-slate-500"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (index === (currentTheory.sections?.length || 0) - 1) return;
                        setCurrentTheory(prev => {
                          if (!prev?.sections) return prev;
                          const newSections = [...prev.sections];
                          const temp = newSections[index + 1];
                          newSections[index + 1] = newSections[index];
                          newSections[index] = temp;
                          return { ...prev, sections: newSections };
                        });
                      }}
                      disabled={index === (currentTheory.sections?.length || 0) - 1}
                      className="text-slate-500 hover:text-teal-400 transition-colors disabled:opacity-30 disabled:hover:text-slate-500"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setCurrentTheory(prev => ({
                          ...prev,
                          sections: prev?.sections?.filter(s => s.id !== section.id)
                        }));
                      }}
                      className="text-slate-500 hover:text-rose-400 transition-colors ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <h4 className="text-white font-bold text-sm">Phần {index + 1}</h4>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Tiêu đề phần (tùy chọn)</label>
                    <input
                      type="text"
                      value={section.title || ''}
                      onChange={(e) => {
                        setCurrentTheory(prev => ({
                          ...prev,
                          sections: prev?.sections?.map(s => s.id === section.id ? { ...s, title: e.target.value } : s)
                        }));
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 text-sm"
                      placeholder="Nhập tiêu đề cho phần này..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Hình ảnh phần này (tùy chọn)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={section.imageUrl || ''}
                        onChange={(e) => {
                          setCurrentTheory(prev => ({
                            ...prev,
                            sections: prev?.sections?.map(s => s.id === section.id ? { ...s, imageUrl: e.target.value } : s)
                          }));
                        }}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 text-sm"
                        placeholder="Nhập URL hình ảnh..."
                      />
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, section.id)}
                          disabled={uploadingImageId === section.id}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <button
                          disabled={uploadingImageId === section.id}
                          className="px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 hover:bg-slate-700 flex items-center gap-2 disabled:opacity-50 transition-colors text-sm"
                        >
                          {uploadingImageId === section.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <ImagePlus className="w-4 h-4" />
                          )}
                          Tải ảnh
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-medium text-slate-500">Nội dung</label>
                      <button
                        onClick={async () => {
                          if (!section.content) return;
                          setIsGenerating(true);
                          showToast("Đang dùng AI chuẩn hóa công thức hóa học...");
                          try {
                            const apiKey = await getGeminiApiKey();
                            if (!apiKey) {
                              showToast("Vui lòng cấu hình API Key trong phần cài đặt để sử dụng tính năng AI.");
                              setIsGenerating(false);
                              return;
                            }
                            const ai = new GoogleGenAI({ apiKey });
                            const prompt = `Bạn là một chuyên gia Hóa học và định dạng văn bản. Hãy định dạng lại đoạn văn bản lý thuyết hóa học sau đây.
                            Yêu cầu QUAN TRỌNG:
                            - GIỮ NGUYÊN toàn bộ nội dung, cấu trúc, và các đánh dấu hình ảnh.
                            - CHỈ bổ sung định dạng LaTeX (sử dụng dấu $...$) cho TẤT CẢ các công thức hóa học, chất hóa học, phương trình hóa học, và ký hiệu toán học.
                            - KHÔNG bọc kết quả trong block code markdown. Trả về trực tiếp văn bản.
                            - KHÔNG thêm bất kỳ lời chào hay giải thích nào.

                            Văn bản cần định dạng:
                            ${section.content}`;

                            const response = await ai.models.generateContent({
                              model: "gemini-3-flash-preview",
                              contents: prompt,
                            });
                            
                            if (response.text) {
                              let formattedText = response.text;
                              if (formattedText.startsWith('```markdown')) {
                                formattedText = formattedText.replace(/^```markdown\n/, '').replace(/\n```$/, '');
                              } else if (formattedText.startsWith('```')) {
                                formattedText = formattedText.replace(/^```\n/, '').replace(/\n```$/, '');
                              }
                              setCurrentTheory(prev => ({
                                ...prev,
                                sections: prev?.sections?.map(s => s.id === section.id ? { ...s, content: formattedText } : s)
                              }));
                              showToast("Đã chuẩn hóa công thức thành công.");
                            }
                          } catch (error) {
                            console.error("AI formatting error:", error);
                            showToast("Lỗi khi chuẩn hóa bằng AI.");
                          } finally {
                            setIsGenerating(false);
                          }
                        }}
                        disabled={isGenerating || !section.content}
                        className="flex items-center gap-1 px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded hover:bg-indigo-500/30 transition-colors text-[10px] font-bold disabled:opacity-50"
                      >
                        <Sparkles className="w-3 h-3" />
                        Chuẩn hóa (AI)
                      </button>
                    </div>
                    <textarea
                      value={section.content || ''}
                      onChange={(e) => {
                        setCurrentTheory(prev => ({
                          ...prev,
                          sections: prev?.sections?.map(s => s.id === section.id ? { ...s, content: e.target.value } : s)
                        }));
                      }}
                      className="w-full h-48 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 font-mono text-sm custom-scrollbar"
                      placeholder="Nhập nội dung cho phần này..."
                    />
                  </div>
                </div>
              ))}
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
            {filterGrade !== 'all' 
              ? `Chưa có bài lý thuyết nào cho Khối ${filterGrade}.` 
              : 'Chưa có bài lý thuyết nào.'}
          </div>
        ) : (
          theories.map(theory => (
            <div key={theory.id} className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold text-white">{theory.title}</h3>
                    {theory.grade && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        Khối {theory.grade}
                      </span>
                    )}
                  </div>
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
                    onClick={() => setShowConfirmDelete(theory.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {theory.imageUrl && (
                <img src={theory.imageUrl} alt={theory.title} className="w-full h-32 object-cover rounded-lg mb-4" referrerPolicy="no-referrer" />
              )}
              <div className="prose prose-invert prose-teal max-w-none max-h-64 overflow-y-auto custom-scrollbar pr-2">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {theory.content}
                </ReactMarkdown>
                {theory.sections && theory.sections.length > 0 && (
                  <div className="mt-6 space-y-6 border-t border-slate-700 pt-6">
                    {theory.sections.map((section, idx) => (
                      <div key={section.id} className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                        <h4 className="text-sm font-bold text-slate-400 mb-3">{section.title || `Phần ${idx + 1}`}</h4>
                        {section.imageUrl && (
                          <img src={section.imageUrl} alt={section.title || `Phần ${idx + 1}`} className="w-full max-h-48 object-cover rounded-lg mb-4" referrerPolicy="no-referrer" />
                        )}
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {section.content}
                        </ReactMarkdown>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full border border-slate-700 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Xác nhận xóa</h3>
            <p className="text-slate-300 mb-6">Bạn có chắc chắn muốn xóa lý thuyết này? Hành động này không thể hoàn tác.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDelete(null)}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-bold"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(showConfirmDelete)}
                className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-bold"
              >
                Xóa
              </button>
            </div>
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
