import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pencil, Trash2, Save, X, Sparkles, Check, AlertCircle, ChevronDown, ChevronUp, Image as ImageIcon, Loader2, Plus, Link as LinkIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { GoogleGenAI } from "@google/genai";
import { getGeminiApiKey } from '../services/gemini';
import { Question, QuestionType } from './ExamRoom';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../firebase';
import { fixLatex } from '../utils/latexHelper';

interface ExamEditorProps {
  questions: Question[];
  sectionPoints?: {
    multipleChoice: number;
    trueFalse: number;
    shortAnswer: number;
  };
  onUpdate: (questions: Question[], sectionPoints: {
    multipleChoice: number;
    trueFalse: number;
    shortAnswer: number;
  }) => void;
}

import { parseAIJSON } from '../utils/jsonHelper';

export const ExamEditor: React.FC<ExamEditorProps> = ({ questions, sectionPoints, onUpdate }) => {
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [tempQuestion, setTempQuestion] = useState<Question | null>(null);
  const [tempSectionPoints, setTempSectionPoints] = useState(sectionPoints || { multipleChoice: 3, trueFalse: 4, shortAnswer: 3 });
  const [isAiAssisting, setIsAiAssisting] = useState<string | number | null>(null);
  const [isFixingLatex, setIsFixingLatex] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [activeUrlInput, setActiveUrlInput] = useState<string | null>(null);
  const [optionUrlInput, setOptionUrlInput] = useState('');

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim() || !tempQuestion) return;
    setTempQuestion(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        content: (prev.content || '') + `\n\n![image](${imageUrlInput.trim()})`
      };
    });
    setImageUrlInput('');
  };

  const handleGenericImageUpload = async (file: File, onSuccess: (url: string) => void) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Chỉ chấp nhận định dạng .jpg, .png hoặc .webp');
      return;
    }
    if (file.size > 500 * 1024) {
      alert('Ảnh quá lớn! Vui lòng chọn ảnh dưới 500KB để lưu trữ trực tiếp (miễn phí).');
      return;
    }

    setIsUploading(true);
    try {
      const imageRef = ref(storage, `exams/images/${auth.currentUser?.uid || 'anonymous'}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(imageRef, file);
      
      await new Promise((resolve, reject) => {
        uploadTask.on('state_changed', 
          null,
          (error) => reject(error),
          () => resolve(null)
        );
      });

      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      onSuccess(downloadURL);
    } catch (error: any) {
      console.error('Image upload error:', error);
      alert('Lỗi tải ảnh: ' + (error.message || 'Không xác định'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tempQuestion) return;

    await handleGenericImageUpload(file, (downloadURL) => {
      setTempQuestion(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          content: (prev.content || '') + `\n\n![image](${downloadURL})`
        };
      });
      console.log('Image uploaded to Storage successfully:', downloadURL);
    });
    
    e.target.value = '';
  };

  const handleEdit = (q: Question) => {
    setEditingId(q.id);
    setTempQuestion({ ...q });
    setImageUrlInput('');
  };

  const handleAddQuestion = (type: QuestionType) => {
    const newId = Date.now().toString();
    const newQuestion: Question = {
      id: newId,
      type,
      content: '',
      explanation: '',
      answer: '',
      options: type === 'multiple_choice' ? ['', '', '', ''] : undefined,
      subQuestions: type === 'true_false' ? [
        { id: 'a', content: '', answer: 'Đúng' },
        { id: 'b', content: '', answer: 'Đúng' },
        { id: 'c', content: '', answer: 'Đúng' },
        { id: 'd', content: '', answer: 'Đúng' }
      ] : undefined
    };
    
    const newQuestions = [...questions, newQuestion];
    onUpdate(newQuestions, tempSectionPoints);
    setEditingId(newId);
    setTempQuestion(newQuestion);
    setImageUrlInput('');
  };

  const handleSave = () => {
    if (tempQuestion) {
      const newQuestions = questions.map(q => q.id === tempQuestion.id ? tempQuestion : q);
      onUpdate(newQuestions, tempSectionPoints);
      setEditingId(null);
      setTempQuestion(null);
    }
  };

  const handleDelete = (id: string | number) => {
    const newQuestions = questions.filter(q => q.id !== id);
    onUpdate(newQuestions, tempSectionPoints);
  };

  const handleAiAssist = async (q: Question) => {
    const apiKey = await getGeminiApiKey();
    if (!apiKey) {
      alert("Vui lòng cấu hình API Key trong phần cài đặt để sử dụng tính năng AI.");
      return;
    }
    setIsAiAssisting(q.id);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Bạn là một chuyên gia Hóa học. Tôi đã thay đổi nội dung câu hỏi sau. Hãy tính toán lại đáp án và lời giải chi tiết dựa trên các thông số mới.
                Đảm bảo các công thức hóa học được bọc trong LaTeX chuẩn (ví dụ: $H_2SO_4$, $\\ce{H2SO4}$).
                QUAN TRỌNG: Bạn PHẢI escape tất cả các dấu backslash (\\) trong công thức LaTeX thành double backslash (\\\\) để JSON hợp lệ. Ví dụ: \\\\frac{1}{2} thay vì \\frac{1}{2}, \\\\ce{H2O} thay vì \\ce{H2O}.
                LƯU Ý QUAN TRỌNG VỀ CÔNG THỨC HÓA HỌC: Khi sử dụng lệnh \\\\ce cho công thức hóa học, BẠN BẮT BUỘC PHẢI BAO GỒM DẤU NGOẶC NHỌN {} bao quanh công thức. Ví dụ ĐÚNG: \\\\ce{H2O}, \\\\ce{CO2}. Ví dụ SAI: \\\\ceH2O, \\\\ceCO2. Việc thiếu dấu ngoặc nhọn sẽ làm lỗi hiển thị.
                
                Câu hỏi hiện tại:
                ${JSON.stringify(q)}

                Hãy trả về JSON mới cho câu hỏi này với cấu trúc tương tự.`
              }
            ]
          }
        ],
        config: { responseMimeType: "application/json" }
      });

      const updatedQ = parseAIJSON(result.text?.trim() || "{}");
      
      const newQuestions = questions.map(item => item.id === q.id ? { ...updatedQ, id: q.id } : item);
      onUpdate(newQuestions, tempSectionPoints);
    } catch (error) {
      console.error("AI Assist failed:", error);
      alert("AI không thể xử lý yêu cầu này.");
    } finally {
      setIsAiAssisting(null);
    }
  };

  const handleFixLatexAI = async (text: string, fieldId: string, onUpdate: (newText: string) => void) => {
    if (!text) return;
    const apiKey = await getGeminiApiKey();
    if (!apiKey) {
      alert("Vui lòng cấu hình API Key trong phần cài đặt để sử dụng tính năng AI.");
      return;
    }
    setIsFixingLatex(fieldId);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Bạn là một chuyên gia Hóa học và LaTeX. Hãy sửa lại các công thức hóa học trong đoạn văn bản sau sao cho đúng chuẩn LaTeX (sử dụng \\ce{} cho công thức hóa học, và bọc trong dấu $...$ hoặc $$...$$). 
        CHỈ trả về nội dung đã sửa, KHÔNG giải thích gì thêm.
        LƯU Ý QUAN TRỌNG: Khi sử dụng lệnh \\ce cho công thức hóa học, BẠN BẮT BUỘC PHẢI BAO GỒM DẤU NGOẶC NHỌN {} bao quanh công thức. Ví dụ ĐÚNG: \\ce{H2O}, \\ce{CO2}. Ví dụ SAI: \\ceH2O, \\ceCO2. Việc thiếu dấu ngoặc nhọn sẽ làm lỗi hiển thị.
        
        Văn bản cần sửa:
        ${text}`
      });
      if (result.text) {
        onUpdate(result.text.trim());
      }
    } catch (error) {
      console.error("Lỗi khi gọi AI:", error);
      alert("Có lỗi xảy ra khi gọi AI. Vui lòng thử lại.");
    } finally {
      setIsFixingLatex(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Cấu hình điểm phần</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-400 font-bold">Trắc nghiệm</label>
            <input type="number" step="0.1" value={tempSectionPoints.multipleChoice} onChange={e => setTempSectionPoints({...tempSectionPoints, multipleChoice: Number(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white" />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-bold">Đúng/Sai</label>
            <input type="number" step="0.1" value={tempSectionPoints.trueFalse} onChange={e => setTempSectionPoints({...tempSectionPoints, trueFalse: Number(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white" />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-bold">Trả lời ngắn</label>
            <input type="number" step="0.1" value={tempSectionPoints.shortAnswer} onChange={e => setTempSectionPoints({...tempSectionPoints, shortAnswer: Number(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Pencil className="w-6 h-6 text-teal-400" />
          Biên tập câu hỏi
        </h3>
        <span className="text-slate-400 text-sm">{questions.length} câu hỏi</span>
      </div>

      <div className="space-y-4">
        {questions.map((q, index) => (
          <motion.div
            key={q.id}
            layout
            className={cn(
              "bg-slate-900/80 border rounded-3xl p-6 transition-all duration-300",
              editingId === q.id ? "border-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.1)]" : "border-slate-800 hover:border-slate-700"
            )}
          >
            {editingId === q.id ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-teal-400 font-bold">Câu {index + 1} - {q.type.toUpperCase()}</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-sm font-bold">Điểm:</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={tempQuestion?.points ?? ''}
                        onChange={e => setTempQuestion({ ...tempQuestion!, points: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-teal-500 text-sm"
                        placeholder="Mặc định"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAiAssist(tempQuestion!)}
                        disabled={isAiAssisting === q.id}
                        className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-xl text-xs font-bold hover:bg-purple-500 hover:text-white transition-all"
                      >
                        {isAiAssisting === q.id ? <Sparkles className="w-3 h-3 animate-pulse" /> : <Sparkles className="w-3 h-3" />}
                        AI ASSIST
                      </button>
                      <button onClick={handleSave} className="p-2 bg-teal-500 text-white rounded-xl hover:bg-teal-400 transition-colors">
                        <Save className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-2 bg-slate-800 text-slate-400 rounded-xl hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    value={tempQuestion?.content}
                    onChange={e => setTempQuestion({ ...tempQuestion!, content: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white focus:outline-none focus:border-teal-500 min-h-[100px]"
                    placeholder="Nội dung câu hỏi..."
                  />
                  <button
                    onClick={() => handleFixLatexAI(tempQuestion?.content || '', 'main_content', (newText) => setTempQuestion({ ...tempQuestion!, content: newText }))}
                    disabled={isFixingLatex === 'main_content'}
                    className="absolute bottom-3 right-3 p-2 bg-purple-500/20 text-purple-400 rounded-xl hover:bg-purple-500 hover:text-white transition-colors"
                    title="AI sửa lỗi LaTeX"
                  >
                    {isFixingLatex === 'main_content' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  </button>
                </div>

                {/* Image Upload Area */}
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <label className={cn(
                      "flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl cursor-pointer hover:border-teal-500 transition-all",
                      isUploading && "opacity-50 cursor-not-allowed"
                    )}>
                      {isUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-teal-400" />
                      )}
                      <span className="text-sm text-slate-300">
                        {isUploading ? 'Đang tải...' : 'Tải ảnh lên (.jpg, .png)'}
                      </span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                    </label>
                    <div className="flex items-center gap-2 flex-1 max-w-sm">
                      <input
                        type="text"
                        value={imageUrlInput}
                        onChange={e => setImageUrlInput(e.target.value)}
                        placeholder="Hoặc nhập URL ảnh..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                      />
                      <button
                        onClick={handleAddImageUrl}
                        disabled={!imageUrlInput.trim()}
                        className="px-3 py-2 bg-teal-500/20 text-teal-400 rounded-xl hover:bg-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                      >
                        Thêm
                      </button>
                    </div>
                  </div>

                  {(() => {
                    const contentImages = Array.from(tempQuestion?.content?.matchAll(/!\[.*?\]\((.*?)\)/g) || []).map(m => m[1]);
                    if (contentImages.length === 0) return null;
                    return (
                      <div className="flex flex-wrap gap-4 mt-4">
                        {contentImages.map((url, idx) => (
                          <div key={idx} className="relative w-32 h-32 group">
                            <img 
                              src={url} 
                              alt={`Preview ${idx + 1}`} 
                              className="w-full h-full object-cover rounded-xl border border-slate-700 shadow-lg"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                              <span className="text-white text-xs font-bold text-center px-2">Xóa trong<br/>nội dung</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {q.type === 'multiple_choice' && tempQuestion?.options && (
                  <div className="space-y-3">
                    {tempQuestion.options.map((opt, i) => (
                      <div key={i} className="flex flex-col gap-2">
                        <div className="flex gap-2 items-center">
                          <span className="w-8 h-10 flex items-center justify-center bg-slate-800 rounded-xl text-teal-400 font-bold">{String.fromCharCode(65 + i)}</span>
                          <div className="relative flex-1">
                            <input
                              value={opt}
                              onChange={e => {
                                const newOpts = [...tempQuestion.options!];
                                newOpts[i] = e.target.value;
                                setTempQuestion({ ...tempQuestion, options: newOpts });
                              }}
                              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 pr-24 text-white focus:outline-none focus:border-teal-500"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                              <button
                                onClick={() => {
                                  if (activeUrlInput === `opt_${i}`) {
                                    setActiveUrlInput(null);
                                  } else {
                                    setActiveUrlInput(`opt_${i}`);
                                    setOptionUrlInput('');
                                  }
                                }}
                                className={cn(
                                  "p-1.5 rounded-lg transition-colors",
                                  activeUrlInput === `opt_${i}` 
                                    ? "bg-blue-500/20 text-blue-300" 
                                    : "text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                                )}
                                title="Thêm ảnh từ URL"
                              >
                                <LinkIcon className="w-3.5 h-3.5" />
                              </button>
                              <label className={cn(
                                "p-1.5 text-teal-400 hover:text-teal-300 hover:bg-teal-500/20 rounded-lg transition-colors cursor-pointer",
                                isUploading && "opacity-50 cursor-not-allowed"
                              )} title="Thêm ảnh">
                                <ImageIcon className="w-3.5 h-3.5" />
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/jpeg,image/png,image/webp"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    handleGenericImageUpload(file, (url) => {
                                      const newOpts = [...tempQuestion.options!];
                                      newOpts[i] = newOpts[i] + `\n\n![image](${url})`;
                                      setTempQuestion({ ...tempQuestion, options: newOpts });
                                    });
                                    e.target.value = '';
                                  }}
                                  disabled={isUploading}
                                />
                              </label>
                              <button
                                onClick={() => handleFixLatexAI(opt, `opt_${i}`, (newText) => {
                                  const newOpts = [...tempQuestion.options!];
                                  newOpts[i] = newText;
                                  setTempQuestion({ ...tempQuestion, options: newOpts });
                                })}
                                disabled={isFixingLatex === `opt_${i}`}
                                className="p-1.5 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 rounded-lg transition-colors"
                                title="AI sửa lỗi LaTeX"
                              >
                                {isFixingLatex === `opt_${i}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={() => setTempQuestion({ ...tempQuestion, answer: String.fromCharCode(65 + i) })}
                            className={cn("p-2 rounded-xl transition-colors", tempQuestion.answer === String.fromCharCode(65 + i) ? "bg-teal-500/20 text-teal-400" : "text-slate-500 hover:text-teal-400")}
                            title="Chọn làm đáp án đúng"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (i === 0) return;
                              const newOpts = [...tempQuestion.options!];
                              [newOpts[i - 1], newOpts[i]] = [newOpts[i], newOpts[i - 1]];
                              let newAnswer = tempQuestion.answer;
                              const charI = String.fromCharCode(65 + i);
                              const charPrev = String.fromCharCode(65 + i - 1);
                              if (newAnswer === charI) newAnswer = charPrev;
                              else if (newAnswer === charPrev) newAnswer = charI;
                              setTempQuestion({ ...tempQuestion, options: newOpts, answer: newAnswer });
                            }}
                            disabled={i === 0}
                            className="p-2 text-slate-500 hover:text-white disabled:opacity-30 transition-colors"
                            title="Di chuyển lên"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (i === tempQuestion.options!.length - 1) return;
                            const newOpts = [...tempQuestion.options!];
                            [newOpts[i], newOpts[i + 1]] = [newOpts[i + 1], newOpts[i]];
                            let newAnswer = tempQuestion.answer;
                            const charI = String.fromCharCode(65 + i);
                            const charNext = String.fromCharCode(65 + i + 1);
                            if (newAnswer === charI) newAnswer = charNext;
                            else if (newAnswer === charNext) newAnswer = charI;
                            setTempQuestion({ ...tempQuestion, options: newOpts, answer: newAnswer });
                          }}
                          disabled={i === tempQuestion.options!.length - 1}
                          className="p-2 text-slate-500 hover:text-white disabled:opacity-30 transition-colors"
                          title="Di chuyển xuống"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const newOpts = tempQuestion.options!.filter((_, index) => index !== i);
                            let newAnswer = tempQuestion.answer;
                            const charI = String.fromCharCode(65 + i);
                            if (newAnswer === charI) {
                              newAnswer = undefined;
                            } else if (newAnswer && newAnswer > charI) {
                              newAnswer = String.fromCharCode(newAnswer.charCodeAt(0) - 1);
                            }
                            setTempQuestion({ ...tempQuestion, options: newOpts, answer: newAnswer });
                          }}
                          className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Xóa đáp án"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {activeUrlInput === `opt_${i}` && (
                        <div className="flex items-center gap-2 ml-10 mr-[164px]">
                          <input
                            type="text"
                            value={optionUrlInput}
                            onChange={e => setOptionUrlInput(e.target.value)}
                            placeholder="Nhập URL ảnh..."
                            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-teal-500"
                          />
                          <button
                            onClick={() => {
                              if (!optionUrlInput.trim()) return;
                              const newOpts = [...tempQuestion.options!];
                              newOpts[i] = newOpts[i] + `\n\n![image](${optionUrlInput.trim()})`;
                              setTempQuestion({ ...tempQuestion, options: newOpts });
                              setActiveUrlInput(null);
                              setOptionUrlInput('');
                            }}
                            disabled={!optionUrlInput.trim()}
                            className="px-3 py-1.5 bg-teal-500/20 text-teal-400 rounded-xl hover:bg-teal-500/30 disabled:opacity-50 text-sm font-medium transition-colors"
                          >
                            Thêm
                          </button>
                        </div>
                      )}
                      {(() => {
                        const optImages = Array.from(opt.matchAll(/!\[.*?\]\((.*?)\)/g) || []).map(m => m[1]);
                        if (optImages.length === 0) return null;
                        return (
                          <div className="flex flex-wrap gap-2 ml-10 mt-2">
                            {optImages.map((url, idx) => (
                              <div key={idx} className="relative w-24 h-24 group">
                                <img 
                                  src={url} 
                                  alt={`Preview ${idx + 1}`} 
                                  className="w-full h-full object-cover rounded-lg border border-slate-700 shadow-sm"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                  <span className="text-white text-[10px] font-bold text-center px-1">Xóa trong<br/>nội dung</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                    <button
                      onClick={() => {
                        setTempQuestion({ ...tempQuestion, options: [...tempQuestion.options!, ''] });
                      }}
                      className="flex items-center gap-2 text-sm font-bold text-teal-400 hover:text-teal-300"
                    >
                      <Plus className="w-4 h-4" /> Thêm đáp án
                    </button>
                  </div>
                )}

                {q.type === 'true_false' && tempQuestion?.subQuestions && (
                  <div className="space-y-3">
                    {tempQuestion.subQuestions.map((sq, i) => (
                      <div key={i} className="flex flex-col gap-2 bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                        <div className="flex gap-3 items-center">
                          <span className="text-teal-400 font-bold">{sq.id})</span>
                          <div className="flex-1 relative">
                            <input
                              value={sq.content || (sq as any).text || ''}
                              onChange={e => {
                                const newSub = [...tempQuestion.subQuestions!];
                                newSub[i] = { ...newSub[i], content: e.target.value };
                                setTempQuestion({ ...tempQuestion, subQuestions: newSub });
                              }}
                              className="w-full bg-transparent border-none text-white focus:outline-none pr-24"
                            />
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1">
                              <button
                                onClick={() => {
                                  if (activeUrlInput === `sq_${i}`) {
                                    setActiveUrlInput(null);
                                  } else {
                                    setActiveUrlInput(`sq_${i}`);
                                    setOptionUrlInput('');
                                  }
                                }}
                                className={cn(
                                  "p-1 rounded-lg transition-colors",
                                  activeUrlInput === `sq_${i}` 
                                    ? "bg-blue-500/20 text-blue-300" 
                                    : "text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                                )}
                                title="Thêm ảnh từ URL"
                              >
                                <LinkIcon className="w-3.5 h-3.5" />
                              </button>
                              <label className={cn(
                                "p-1 text-teal-400 hover:text-teal-300 hover:bg-teal-500/20 rounded-lg transition-colors cursor-pointer",
                                isUploading && "opacity-50 cursor-not-allowed"
                              )} title="Thêm ảnh">
                                <ImageIcon className="w-3.5 h-3.5" />
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/jpeg,image/png,image/webp"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    handleGenericImageUpload(file, (url) => {
                                      const newSub = [...tempQuestion.subQuestions!];
                                      newSub[i] = { ...newSub[i], content: (newSub[i].content || (newSub[i] as any).text || '') + `\n\n![image](${url})` };
                                      setTempQuestion({ ...tempQuestion, subQuestions: newSub });
                                    });
                                    e.target.value = '';
                                  }}
                                  disabled={isUploading}
                                />
                              </label>
                              <button
                                onClick={() => handleFixLatexAI(sq.content || (sq as any).text || '', `sq_${i}`, (newText) => {
                                  const newSub = [...tempQuestion.subQuestions!];
                                  newSub[i] = { ...newSub[i], content: newText };
                                  setTempQuestion({ ...tempQuestion, subQuestions: newSub });
                                })}
                                disabled={isFixingLatex === `sq_${i}`}
                                className="p-1 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 rounded-lg transition-colors"
                                title="AI sửa lỗi LaTeX"
                              >
                                {isFixingLatex === `sq_${i}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                          <select
                            value={sq.answer}
                            onChange={e => {
                              const newSub = [...tempQuestion.subQuestions!];
                              newSub[i] = { ...newSub[i], answer: e.target.value as 'Đúng' | 'Sai' };
                              setTempQuestion({ ...tempQuestion, subQuestions: newSub });
                            }}
                            className="bg-slate-900 text-white rounded-lg px-2 py-1 text-xs font-bold border border-slate-700"
                          >
                            <option value="Đúng">Đúng</option>
                            <option value="Sai">Sai</option>
                          </select>
                        </div>
                        {activeUrlInput === `sq_${i}` && (
                          <div className="flex items-center gap-2 ml-6">
                            <input
                              type="text"
                              value={optionUrlInput}
                              onChange={e => setOptionUrlInput(e.target.value)}
                              placeholder="Nhập URL ảnh..."
                              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-teal-500"
                            />
                            <button
                              onClick={() => {
                                if (!optionUrlInput.trim()) return;
                                const newSub = [...tempQuestion.subQuestions!];
                                newSub[i] = { ...newSub[i], content: (newSub[i].content || (newSub[i] as any).text || '') + `\n\n![image](${optionUrlInput.trim()})` };
                                setTempQuestion({ ...tempQuestion, subQuestions: newSub });
                                setActiveUrlInput(null);
                                setOptionUrlInput('');
                              }}
                              disabled={!optionUrlInput.trim()}
                              className="px-3 py-1.5 bg-teal-500/20 text-teal-400 rounded-xl hover:bg-teal-500/30 disabled:opacity-50 text-sm font-medium transition-colors"
                            >
                              Thêm
                            </button>
                          </div>
                        )}
                        {(() => {
                          const sqContent = sq.content || (sq as any).text || '';
                          const sqImages = Array.from(sqContent.matchAll(/!\[.*?\]\((.*?)\)/g) || []).map(m => m[1]);
                          if (sqImages.length === 0) return null;
                          return (
                            <div className="flex flex-wrap gap-2 ml-6 mt-2">
                              {sqImages.map((url, idx) => (
                                <div key={idx} className="relative w-24 h-24 group">
                                  <img 
                                    src={url} 
                                    alt={`Preview ${idx + 1}`} 
                                    className="w-full h-full object-cover rounded-lg border border-slate-700 shadow-sm"
                                  />
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                    <span className="text-white text-[10px] font-bold text-center px-1">Xóa trong<br/>nội dung</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    ))}
                  </div>
                )}

                {q.type === 'short_answer' && (
                  <div className="flex items-center gap-4">
                    <span className="text-slate-400 font-bold">Đáp án số:</span>
                    <input
                      type="text"
                      value={tempQuestion?.answer}
                      onChange={e => setTempQuestion({ ...tempQuestion!, answer: e.target.value })}
                      className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>
                )}

                <div className="relative">
                  <textarea
                    value={tempQuestion?.explanation}
                    onChange={e => setTempQuestion({ ...tempQuestion!, explanation: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-slate-300 text-sm focus:outline-none focus:border-teal-500 min-h-[80px]"
                    placeholder="Lời giải chi tiết..."
                  />
                  <button
                    onClick={() => handleFixLatexAI(tempQuestion?.explanation || '', 'explanation', (newText) => setTempQuestion({ ...tempQuestion!, explanation: newText }))}
                    disabled={isFixingLatex === 'explanation'}
                    className="absolute bottom-3 right-3 p-2 bg-purple-500/20 text-purple-400 rounded-xl hover:bg-purple-500 hover:text-white transition-colors"
                    title="AI sửa lỗi LaTeX"
                  >
                    {isFixingLatex === 'explanation' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Câu {index + 1} • {q.type}</span>
                      {q.points !== undefined && (
                        <span className="px-2 py-0.5 bg-teal-500/10 text-teal-400 rounded-md text-xs font-bold">
                          {q.points} điểm
                        </span>
                      )}
                    </div>
                    <div className="text-white font-medium prose prose-invert prose-sm max-w-none">
                      {q.imageUrl && (
                        <div className="mb-4 flex justify-center">
                          <img 
                            src={q.imageUrl} 
                            alt="Question" 
                            className="max-w-full h-auto rounded-xl shadow-lg border border-slate-700/50"
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
                                className="max-w-full h-auto rounded-xl my-4 shadow-lg border border-slate-700/50 mx-auto block" 
                                referrerPolicy="no-referrer"
                              />
                            );
                          }
                        }}
                      >
                        {fixLatex((q.content || '').replace(/\[\[IMAGE_PLACEHOLDER(?:_\d+)?\]\]/g, ''))}
                      </ReactMarkdown>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        if (index === 0) return;
                        const newQuestions = [...questions];
                        [newQuestions[index - 1], newQuestions[index]] = [newQuestions[index], newQuestions[index - 1]];
                        onUpdate(newQuestions, sectionPoints || { multipleChoice: 3, trueFalse: 4, shortAnswer: 3 });
                      }}
                      disabled={index === 0}
                      className="p-2 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                      title="Di chuyển lên"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        if (index === questions.length - 1) return;
                        const newQuestions = [...questions];
                        [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
                        onUpdate(newQuestions, sectionPoints || { multipleChoice: 3, trueFalse: 4, shortAnswer: 3 });
                      }}
                      disabled={index === questions.length - 1}
                      className="p-2 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                      title="Di chuyển xuống"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleEdit(q)} className="p-2 text-slate-400 hover:text-teal-400 transition-colors" title="Chỉnh sửa">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(q.id)} className="p-2 text-slate-400 hover:text-rose-400 transition-colors" title="Xóa">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {q.type === 'multiple_choice' && q.options && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map((opt, i) => (
                      <div key={i} className={cn(
                        "p-3 rounded-2xl border text-sm transition-all",
                        q.answer === String.fromCharCode(65 + i) 
                          ? "bg-teal-500/10 border-teal-500/30 text-teal-400" 
                          : "bg-slate-800/50 border-slate-700 text-slate-400"
                      )}>
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {fixLatex(opt)}
                        </ReactMarkdown>
                      </div>
                    ))}
                  </div>
                )}

                {q.type === 'true_false' && q.subQuestions && (
                  <div className="space-y-2">
                    {q.subQuestions.map((sq, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-700/50 text-sm">
                        <div className="flex gap-2">
                          <span className="text-teal-400 font-bold">{sq.id})</span>
                          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {fixLatex(sq.content || (sq as any).text || '')}
                          </ReactMarkdown>
                        </div>
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest",
                          sq.answer === 'Đúng' ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                        )}>
                          {sq.answer}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {q.type === 'short_answer' && (
                  <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-700/50 text-sm flex items-center gap-2">
                    <span className="text-slate-500 font-bold">Đáp án:</span>
                    <span className="text-teal-400 font-mono font-bold">{q.answer}</span>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-800/50">
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold mb-2">
                    <Check className="w-4 h-4" />
                    Đáp án: {q.answer}
                  </div>
                  <div className="text-slate-500 text-xs italic prose prose-invert prose-xs max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {fixLatex(q.explanation || '')}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 mt-8 pt-8 border-t border-slate-800/50">
        <button
          onClick={() => handleAddQuestion('multiple_choice')}
          className="flex items-center gap-2 px-6 py-3 bg-teal-500/10 text-teal-400 border border-teal-500/30 rounded-2xl hover:bg-teal-500 hover:text-white transition-all font-bold text-sm"
        >
          <Plus className="w-5 h-5" />
          Thêm câu Trắc nghiệm
        </button>
        <button
          onClick={() => handleAddQuestion('true_false')}
          className="flex items-center gap-2 px-6 py-3 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-2xl hover:bg-purple-500 hover:text-white transition-all font-bold text-sm"
        >
          <Plus className="w-5 h-5" />
          Thêm câu Đúng/Sai
        </button>
        <button
          onClick={() => handleAddQuestion('short_answer')}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all font-bold text-sm"
        >
          <Plus className="w-5 h-5" />
          Thêm câu Trả lời ngắn
        </button>
      </div>
    </div>
  );
};
