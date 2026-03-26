import React from 'react';
import { motion } from 'motion/react';

interface ExamModalProps {
  onSelect: (totalQuestions: number, time: number) => void;
  onClose: () => void;
}

export const ExamModal: React.FC<ExamModalProps> = ({ onSelect, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-gray-800 p-8 rounded-2xl border border-teal-500/30 max-w-md w-full"
      >
        <h2 className="text-2xl font-bold text-white mb-6">Chọn Gói Thi</h2>
        <div className="space-y-4">
          <button
            onClick={() => onSelect(22, 22 * 60)}
            className="w-full p-4 bg-gray-700 hover:bg-teal-600 text-white rounded-xl transition"
          >
            Gói Cơ Bản: 22 câu / 22 phút
          </button>
          <button
            onClick={() => onSelect(45, 45 * 60)}
            className="w-full p-4 bg-gray-700 hover:bg-teal-600 text-white rounded-xl transition"
          >
            Gói Chuyên Sâu: 45 câu / 45 phút
          </button>
        </div>
        <button onClick={onClose} className="mt-6 w-full text-gray-400">Hủy</button>
      </motion.div>
    </motion.div>
  );
};
