import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export interface Question {
  id: string;
  content: string;
  type: 'theory' | 'exercise';
  options: string[];
  correctAnswer: string;
  image?: string;
}

export const generateExam = async (totalQuestions: number): Promise<Question[]> => {
  const questionsRef = collection(db, 'questions');
  const snapshot = await getDocs(questionsRef);
  
  if (snapshot.empty) return [];

  const allQuestions: Question[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Question, 'id'>),
  }));

  const theoryQuestions = allQuestions.filter((q) => q.type === 'theory');
  const exerciseQuestions = allQuestions.filter((q) => q.type === 'exercise');

  const half = totalQuestions / 2;
  const selectedTheory = theoryQuestions.sort(() => 0.5 - Math.random()).slice(0, half);
  const selectedExercise = exerciseQuestions.sort(() => 0.5 - Math.random()).slice(0, half);

  return [...selectedTheory, ...selectedExercise].sort(() => 0.5 - Math.random());
};
