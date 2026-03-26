import React from 'react';
import { motion } from 'motion/react';
import { Delete, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface NumericKeypadProps {
  value: string;
  onChange: (value: string) => void;
  onClose?: () => void;
}

export const NumericKeypad: React.FC<NumericKeypadProps> = ({ value, onChange, onClose }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '0', ','];

  const handleKeyPress = (key: string) => {
    if (value.length < 4) {
      onChange(value + key);
    }
  };

  const handleDelete = () => {
    onChange(value.slice(0, -1));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-slate-900 border border-teal-500/30 rounded-3xl p-6 shadow-2xl w-full max-w-[320px] mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <span className="text-teal-400 font-bold text-sm uppercase tracking-wider">Bàn phím số</span>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Input Slots */}
      <div className="grid grid-cols-4 gap-2 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-black transition-all duration-300",
              value[i] 
                ? "border-teal-500 bg-teal-500/10 text-white shadow-[0_0_15px_rgba(20,184,166,0.3)]" 
                : "border-slate-700 bg-slate-800/50 text-slate-500"
            )}
          >
            {value[i] || ''}
          </div>
        ))}
      </div>

      {/* Keypad Grid */}
      <div className="grid grid-cols-3 gap-3">
        {keys.map((key) => (
          <motion.button
            key={key}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleKeyPress(key)}
            className={cn(
              "h-14 rounded-2xl text-xl font-bold transition-all duration-200",
              "bg-slate-800 text-white border border-slate-700 hover:border-teal-500/50 hover:bg-slate-700",
              (key === '-' || key === ',') && "text-teal-400"
            )}
          >
            {key}
          </motion.button>
        ))}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDelete}
          className="col-span-3 h-14 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white flex items-center justify-center gap-2 transition-all duration-200"
        >
          <Delete className="w-6 h-6" />
          XÓA
        </motion.button>
      </div>
    </motion.div>
  );
};
