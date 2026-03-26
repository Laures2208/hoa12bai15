import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileText, X, CheckCircle2, Loader2, AlertCircle, FileUp, Save, Image as ImageIcon } from 'lucide-react';
import mammoth from 'mammoth';
import { GoogleGenAI } from "@google/genai";
import { getGeminiApiKey } from '../services/gemini';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { cn } from '../lib/utils';
import { Question } from './ExamRoom';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface ExtractedImage {
  id: string;
  blob: Blob;
  marker: string;
  url?: string;
}

interface AdvancedWordProcessorProps {
  onProcessed?: (questions: Question[]) => void;
}

import { parseAIJSON } from '../utils/jsonHelper';

export const AdvancedWordProcessor: React.FC<AdvancedWordProcessorProps> = ({ onProcessed }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ step: string; current: number; total: number }>({ step: '', current: 0, total: 0 });

  const processTextWithAI = async (text: string): Promise<Question[]> => {
    const apiKey = await getGeminiApiKey();
    if (!apiKey) {
      throw new Error("Vui lòng cấu hình API Key trong phần cài đặt để sử dụng tính năng AI.");
    }
    try {
      const ai = new GoogleGenAI({ apiKey });
      const model = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `VĂN BẢN CẦN XỬ LÝ:\n${text}`
              }
            ]
          }
        ],
        config: {
          systemInstruction: "Bạn là chuyên gia số hóa đề thi Hóa học. Hãy chuyển văn bản này thành JSON gồm 3 phần. Giữ nguyên công thức LaTeX (ví dụ: $H_2SO_4$).\n\nQUAN TRỌNG VỀ LATEX TRONG JSON:\nBạn PHẢI escape tất cả các dấu backslash (\\) trong công thức LaTeX thành double backslash (\\\\) để JSON hợp lệ. Ví dụ: \\\\frac{1}{2} thay vì \\frac{1}{2}, \\\\ce{H2O} thay vì \\ce{H2O}.\n\nQUAN TRỌNG VỀ HÌNH ẢNH:\n- Hãy giữ nguyên các Marker hình ảnh (ví dụ: [[IMAGE_PLACEHOLDER_1]]) đúng vị trí của nó trong nội dung câu hỏi hoặc phương án trả lời.\n- Đảm bảo Marker nằm trên một dòng riêng biệt nếu nó đứng giữa các đoạn văn.\n\nYÊU CẦU ĐỊNH DẠNG JSON:\n[\n  {\n    \"id\": number,\n    \"type\": \"multiple_choice\" | \"true_false\" | \"short_answer\",\n    \"content\": \"Nội dung câu hỏi có LaTeX và Marker hình ảnh\",\n    \"options\": [\"A. ...\", \"B. ...\", \"C. ...\", \"D. ...\"], // Chỉ cho multiple_choice\n    \"subQuestions\": [ // Chỉ cho true_false, mảng 4 ý a, b, c, d\n      {\"id\": \"a\", \"content\": \"Nội dung ý a\", \"answer\": \"Đúng/Sai\"},\n      {\"id\": \"b\", \"content\": \"Nội dung ý b\", \"answer\": \"Đúng/Sai\"},\n      {\"id\": \"c\", \"content\": \"Nội dung ý c\", \"answer\": \"Đúng/Sai\"},\n      {\"id\": \"d\", \"content\": \"Nội dung ý d\", \"answer\": \"Đúng/Sai\"}\n    ],\n    \"answer\": \"A/B/C/D\" | \"Giá trị đáp án ngắn\",\n    \"explanation\": \"Giải thích chi tiết có LaTeX\"\n  }\n]",
          responseMimeType: "application/json"
        }
      });

      const result = await model;
      const jsonStr = result.text?.trim() || "[]";
      return parseAIJSON(jsonStr);
    } catch (err: any) {
      console.error("AI Error:", err);
      throw new Error("AI không thể xử lý nội dung này. Vui lòng thử lại sau.");
    }
  };

  const uploadImagesToFirebase = async (images: ExtractedImage[]): Promise<ExtractedImage[]> => {
    const uploadedImages: ExtractedImage[] = [];
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      setProgress({ step: 'Đang tải hình ảnh lên Cloud', current: i + 1, total: images.length });
      const imageRef = ref(storage, `exams/images/${Date.now()}_${i}.png`);
      await uploadBytes(imageRef, img.blob);
      const url = await getDownloadURL(imageRef);
      uploadedImages.push({ ...img, url });
    }
    return uploadedImages;
  };

  const replaceMarkersWithImages = (questions: Question[], images: ExtractedImage[]): Question[] => {
    const replaceInString = (str: string) => {
      let newStr = str;
      images.forEach(img => {
        if (img.url) {
          // Sử dụng cú pháp Markdown Image thay vì thẻ HTML <img> để tương thích tốt nhất với react-markdown
          const markdownImg = `\n\n![Hình ảnh câu hỏi](${img.url})\n\n`;
          newStr = newStr.split(img.marker).join(markdownImg);
        }
      });
      return newStr;
    };

    return questions.map(q => {
      const newQ = { ...q };
      if (newQ.content) newQ.content = replaceInString(newQ.content);
      if (newQ.explanation) newQ.explanation = replaceInString(newQ.explanation);
      if (newQ.options) newQ.options = newQ.options.map(opt => replaceInString(opt));
      if (newQ.subQuestions) {
        newQ.subQuestions = newQ.subQuestions.map(sq => ({
          ...sq,
          content: (sq.content || (sq as any).text) ? replaceInString(sq.content || (sq as any).text) : ''
        }));
      }
      return newQ;
    });
  };

  const processWordFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setProgress({ step: 'Đang đọc file Word', current: 0, total: 1 });

    try {
      const arrayBuffer = await file.arrayBuffer();
      const extractedImages: ExtractedImage[] = [];
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
      const result = await mammoth.extractRawText({ arrayBuffer }, options);
      let rawText = result.value;

      // mammoth.extractRawText doesn't use convertImage, we need convertToHtml to extract images
      // So we do convertToHtml first to get images and their markers, then we can strip HTML tags or just use the text from convertToHtml
      
      // Let's re-do with convertToHtml to properly use the custom image handler
      // @ts-ignore
      const htmlResult = await mammoth.convertToHtml({ arrayBuffer }, options);
      let htmlText = htmlResult.value;
      
      // A simple way to get text with markers is to replace <img src="[[IMAGE_PLACEHOLDER_X]]" /> with the marker
      // and then strip other HTML tags.
      // Handle both raw and URL-encoded markers just in case mammoth encodes them
      let textWithMarkers = htmlText.replace(/<img[^>]+src="(\[\[IMAGE_PLACEHOLDER_\d+\]\]|%5B%5BIMAGE_PLACEHOLDER_\d+%5D%5D)"[^>]*>/g, (match, p1) => {
        return ` ${decodeURIComponent(p1)} `;
      });
      // Strip remaining HTML tags
      textWithMarkers = textWithMarkers.replace(/<[^>]+>/g, '\n');
      // Clean up multiple newlines
      textWithMarkers = textWithMarkers.replace(/\n\s*\n/g, '\n\n');

      setProgress({ step: 'Đang tải hình ảnh lên', current: 0, total: extractedImages.length });
      const uploadedImages = await uploadImagesToFirebase(extractedImages);

      setProgress({ step: 'AI đang phân tích nội dung', current: 0, total: 1 });
      const aiQuestions = await processTextWithAI(textWithMarkers);

      setProgress({ step: 'Đang tổng hợp dữ liệu', current: 0, total: 1 });
      const finalQuestions = replaceMarkersWithImages(aiQuestions, uploadedImages);

      if (onProcessed) {
        onProcessed(finalQuestions);
      }
      
      setProgress({ step: 'Hoàn tất', current: 1, total: 1 });
    } catch (err: any) {
      console.error("Processing error:", err);
      setError(err.message || "Đã xảy ra lỗi trong quá trình xử lý file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFiles = async (selectedFiles: FileList | File[]) => {
    const docxFiles = Array.from(selectedFiles).filter(f => 
      f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
      f.name.endsWith('.docx')
    );

    if (docxFiles.length === 0) {
      setError("Vui lòng chọn file Word (.docx)");
      return;
    }

    setFiles(docxFiles);
    await processWordFile(docxFiles[0]);
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "relative overflow-hidden border-2 border-dashed rounded-3xl transition-all duration-300 ease-out bg-slate-900/50",
          isDragging 
            ? "border-teal-400 bg-teal-400/10 shadow-[0_0_30px_rgba(45,212,191,0.2)]" 
            : "border-slate-700 hover:border-teal-500/50 hover:bg-slate-800/50",
          isProcessing && "pointer-events-none opacity-50"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-emerald-500/5 pointer-events-none" />
        
        <div className="relative p-12 flex flex-col items-center justify-center text-center space-y-6">
          <div className={cn(
            "p-6 rounded-full transition-all duration-500",
            isDragging ? "bg-teal-400/20 scale-110" : "bg-slate-800",
            isProcessing && "animate-pulse"
          )}>
            {isProcessing ? (
              <Loader2 className="w-12 h-12 text-teal-400 animate-spin" />
            ) : (
              <FileUp className={cn(
                "w-12 h-12 transition-colors duration-300",
                isDragging ? "text-teal-400" : "text-slate-400"
              )} />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">
              {isProcessing ? "Đang xử lý tài liệu..." : "Tải lên đề thi Word (Hỗ trợ Hình ảnh)"}
            </h3>
            <p className="text-slate-400 max-w-md mx-auto">
              Kéo thả file .docx vào đây hoặc click để chọn. Hệ thống sẽ tự động trích xuất hình ảnh, công thức và chuyển đổi thành đề thi trực tuyến.
            </p>
          </div>

          <label className="relative group cursor-pointer">
            <input
              type="file"
              className="hidden"
              accept=".docx"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              disabled={isProcessing}
            />
            <div className="absolute inset-0 bg-teal-400/20 rounded-xl blur-md group-hover:bg-teal-400/30 transition-all duration-300" />
            <div className="relative bg-teal-500 hover:bg-teal-400 text-white px-8 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(20,184,166,0.3)]">
              <Upload className="w-5 h-5" />
              Chọn File Word
            </div>
          </label>
        </div>
      </div>

      {/* Progress Bar */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-teal-400">{progress.step}</span>
              <span className="text-xs text-slate-400">
                {progress.total > 1 ? `${progress.current} / ${progress.total}` : ''}
              </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-400"
                initial={{ width: 0 }}
                animate={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3 text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm">{error}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
