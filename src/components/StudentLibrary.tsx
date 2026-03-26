import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Clock, Calendar, Book, PlayCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

interface Exam {
  id: string;
  title: string;
  timeLimit: number;
  category?: string;
  type?: string;
  createdAt: any;
  questionCount?: number;
}

export const StudentLibrary: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        // Kết nối tới collection 'exams_bank' theo yêu cầu
        const q = query(collection(db, 'exams_bank'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const examsData: Exam[] = [];
        querySnapshot.forEach((doc) => {
          examsData.push({ id: doc.id, ...doc.data() } as Exam);
        });
        
        setExams(examsData);
      } catch (error) {
        console.error("Lỗi khi tải danh sách đề thi:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExams();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-teal-500 animate-spin mb-4" />
        <p className="text-teal-400 font-medium animate-pulse">Đang tải thư viện đề thi...</p>
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-slate-900/50 rounded-3xl border border-slate-800 p-8 text-center">
        <Book className="w-16 h-16 text-slate-600 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Thư viện trống</h3>
        <p className="text-slate-400">Hiện chưa có đề thi nào trong thư viện. Vui lòng quay lại sau!</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <Book className="w-8 h-8 text-teal-400" />
          Thư viện đề thi
        </h2>
        <p className="text-slate-400 mt-2">Chọn một đề thi để bắt đầu làm bài và đánh giá năng lực của bạn.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam, index) => (
          <motion.div
            key={exam.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 hover:border-teal-500/50 rounded-2xl p-6 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(20,184,166,0.15)] flex flex-col"
          >
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  {exam.category || exam.type || 'Hóa học 12'}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-4 line-clamp-2 group-hover:text-teal-400 transition-colors">
                {exam.title}
              </h3>

              <div className="space-y-2 mb-6">
                <div className="flex items-center text-slate-400 text-sm">
                  <Clock className="w-4 h-4 mr-2 text-teal-500" />
                  Thời gian: {exam.timeLimit || 45} phút
                </div>
                <div className="flex items-center text-slate-400 text-sm">
                  <Book className="w-4 h-4 mr-2 text-teal-500" />
                  Số câu hỏi: {exam.questionCount || 40} câu
                </div>
                <div className="flex items-center text-slate-400 text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-teal-500" />
                  Ngày đăng: {exam.createdAt?.toDate ? exam.createdAt.toDate().toLocaleDateString('vi-VN') : 'Gần đây'}
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(`/quiz/${exam.id}`)}
              className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-900 transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)]"
            >
              <PlayCircle className="w-5 h-5" />
              Bắt đầu làm bài
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
