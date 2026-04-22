import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Ticket, X } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

interface ScratchCardModalProps {
  result: any;
  onClose: () => void;
  onViewReview: (examData: any) => void;
}

export const ScratchCardModal: React.FC<ScratchCardModalProps> = ({ result, onClose, onViewReview }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScratched, setIsScratched] = useState(false);
  const [examTitle, setExamTitle] = useState('Đang tải...');
  const [examData, setExamData] = useState<any>(null);

  useEffect(() => {
    // Load exam data
    if (result?.examId) {
      getDoc(doc(db, 'exams_bank', result.examId)).then(docSnap => {
        if (docSnap.exists()) {
          setExamData(docSnap.data());
          setExamTitle(docSnap.data().title || 'Bài thi');
        }
      });
    }
  }, [result]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fixed canvas size for simplicity, or resize based on container
    const width = 300;
    const height = 150;
    canvas.width = width;
    canvas.height = height;

    // Fill cover
    ctx.fillStyle = '#64748b'; // slate-500
    ctx.fillRect(0, 0, width, height);
    
    // Add text over cover
    ctx.fillStyle = '#cbd5e1'; // slate-300
    ctx.font = 'bold 20px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Cạo để xem điểm!', width / 2, height / 2);

    let isDrawing = false;
    let scratchedPixels = 0;
    const totalPixels = width * height;

    const getPosition = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      let clientX, clientY;
      if (window.TouchEvent && e instanceof TouchEvent) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    };

    const scratch = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing || isScratched) return;
      e.preventDefault();

      const { x, y } = getPosition(e);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();

      checkScratched();
    };

    const checkScratched = () => {
      const imageData = ctx.getImageData(0, 0, width, height);
      let transparentPixels = 0;
      for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] === 0) {
          transparentPixels++;
        }
      }

      if (transparentPixels / totalPixels > 0.5) {
        setIsScratched(true);
        // Clear entire canvas
        ctx.clearRect(0, 0, width, height);
      }
    };

    const handleMouseDown = (e: MouseEvent | TouchEvent) => {
      isDrawing = true;
      scratch(e);
    };

    const handleMouseUp = () => {
      isDrawing = false;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', scratch);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleMouseDown, { passive: false });
    canvas.addEventListener('touchmove', scratch, { passive: false });
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', scratch);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleMouseDown);
      canvas.removeEventListener('touchmove', scratch);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isScratched]);

  const handleViewReview = async () => {
    // Mark as scratched in DB
    try {
      await updateDoc(doc(db, 'results', result.id), {
        scratched: true
      });
      if (examData) {
        onViewReview({ ...examData, id: result.examId });
      }
      onClose();
    } catch (err) {
      console.error("Error marking scratched:", err);
    }
  };

  const handleDismiss = async () => {
    try {
      await updateDoc(doc(db, 'results', result.id), {
        scratched: true
      });
      onClose();
    } catch (err) {
      console.error("Error marking scratched:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
      >
        <button 
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
            <Ticket className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-2xl font-black text-white mb-2">Giáo viên đã phát bài!</h3>
          <p className="text-slate-400 font-medium">{examTitle}</p>
        </div>

        <div className="relative w-[300px] h-[150px] mx-auto mb-8 rounded-2xl overflow-hidden shadow-inner bg-slate-800 border-2 border-slate-700 flex items-center justify-center" ref={containerRef}>
          {/* Card Content underneath */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <div className="text-5xl font-black text-teal-400 drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]">
              {result.score}<span className="text-2xl text-slate-500">/{result.totalPoints || 10}</span>
            </div>
            {isScratched && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20"
              >
                <CheckCircle2 className="w-3 h-3" />
                Chúc mừng bạn!
              </motion.div>
            )}
          </div>
          
          {/* Scratchable Canvas */}
          <canvas 
            ref={canvasRef}
            className={`absolute inset-0 cursor-crosshair transition-opacity duration-500 ${isScratched ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          />
        </div>

        {isScratched && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full p-4 mt-6 bg-slate-800/80 border border-teal-500/30 rounded-2xl shadow-[0_0_20px_rgba(20,184,166,0.1)] flex flex-col items-center justify-center text-center"
          >
            <span className="text-teal-400 font-bold mb-1">
              Bạn có thể xem lại chi tiết bài làm
            </span>
            <span className="text-slate-300 text-sm">
              ở phòng thi của bài đó
            </span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
