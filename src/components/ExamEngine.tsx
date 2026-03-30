import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where, limit, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from '../FirebaseProvider';

export const ExamEngine: React.FC<{ type: '22' | '45', onFinish: (score: number) => void }> = ({ type, onFinish }) => {
  const { user } = useFirebase();
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(parseInt(type) * 60);

  useEffect(() => {
    const fetchQuestions = async () => {
      const q = query(collection(db, 'questions'));
      const snapshot = await getDocs(q);
      const allQuestions = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      
      const theory = allQuestions.filter(q => (q as any).type === 'theory');
      const exercise = allQuestions.filter(q => (q as any).type === 'exercise');
      
      const total = parseInt(type);
      const half = total / 2;
      
      // Simplified random selection
      const selected = [...theory.slice(0, half), ...exercise.slice(0, total - half)];
      setQuestions(selected);
    };
    fetchQuestions();
  }, [type]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    } else {
      onFinish(score);
    }
  }, [timer, score, onFinish]);

  const handleAnswer = (answer: string) => {
    if (answer === questions[currentIdx].correctAnswer) setScore(s => s + 1);
    if (currentIdx < questions.length - 1) setCurrentIdx(i => i + 1);
    else onFinish(score + (answer === questions[currentIdx].correctAnswer ? 1 : 0));
  };

  if (questions.length === 0) return <div>Đang tải đề...</div>;

  return (
    <div className="p-6 bg-slate-900 text-white">
      <div className="text-xl font-bold mb-4">Thời gian: {Math.floor(timer / 60)}:{timer % 60}</div>
      <div className="text-lg mb-6 font-bold text-teal-400">Câu {currentIdx + 1}:</div>
      <div className="text-lg mb-6">{questions[currentIdx].content}</div>
      <div className="grid grid-cols-1 gap-4">
        {questions[currentIdx].options.map((opt: string, i: number) => (
          <button key={i} className="p-4 bg-slate-800 rounded-xl hover:bg-teal-500" onClick={() => handleAnswer(opt)}>{opt}</button>
        ))}
      </div>
    </div>
  );
};
