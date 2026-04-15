import React from 'react';
import { InlineMath } from 'react-katex';
import { Question } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface QuestionCardProps {
  question: Question;
  selectedAnswer?: number;
  onSelect?: (index: number) => void;
  showCorrect?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedAnswer,
  onSelect,
  showCorrect,
}) => {
  // Function to render text with LaTeX
  const renderContent = (text: string) => {
    const parts = text.split(/(\$.*?\$)/g);
    return parts.map((part, i) => {
      if (part.startsWith('$') && part.endsWith('$')) {
        return <InlineMath key={i} math={part.slice(1, -1)} />;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="bg-dark-card border border-slate-700 rounded-2xl p-6 mb-6 teal-border-glow transition-all">
      <div className="flex justify-between items-start mb-4">
        <span className={cn(
          "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider",
          question.type === 'theory' ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"
        )}>
          {question.type === 'theory' ? 'Lý thuyết' : 'Bài tập'}
        </span>
      </div>
      
      <div className="text-lg mb-6 leading-relaxed">
        {renderContent(question.content)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = showCorrect && index === question.correctAnswer;
          const isWrong = showCorrect && isSelected && index !== question.correctAnswer;

          return (
            <button
              key={`${question.id}_option_${index}`}
              onClick={() => onSelect?.(index)}
              disabled={showCorrect}
              className={cn(
                "p-4 rounded-xl border text-left transition-all duration-200",
                "hover:border-teal-glow/50 hover:bg-teal-glow/5",
                isSelected ? "border-teal-glow bg-teal-glow/10" : "border-slate-700 bg-slate-800/50",
                isCorrect && "border-green-500 bg-green-500/20 text-green-400",
                isWrong && "border-red-500 bg-red-500/20 text-red-400"
              )}
            >
              <span className="font-bold mr-3">{String.fromCharCode(65 + index)}.</span>
              {renderContent(option)}
            </button>
          );
        })}
      </div>

      {showCorrect && question.explanation && (
        <div className="mt-6 p-4 bg-teal-glow/5 border-l-4 border-teal-glow rounded-r-lg text-sm text-slate-300 italic">
          <strong>Giải thích:</strong> {renderContent(question.explanation)}
        </div>
      )}
    </div>
  );
};
