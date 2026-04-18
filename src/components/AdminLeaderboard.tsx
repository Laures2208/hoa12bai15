import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Trash2, Loader2, Clock, CheckCircle2, Search, ArrowDownAZ, SortDesc } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatTimeSpent } from '../App';
import { cn } from '../lib/utils';


interface LeaderboardProps {
  examId: string;
}

interface Leader {
  id: string; // Document ID for deletion
  studentName: string;
  studentClass: string;
  score: number;
  totalPoints: number;
  timeSpent: number;
  submittedAt: any;
}

export const AdminLeaderboard: React.FC<LeaderboardProps> = ({ examId }) => {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'time'>('score');
  
  const fetchLeaderboard = async () => {
    if (!examId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const q = query(
        collection(db, 'results'),
        where('examId', '==', examId)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Leader));
      
      setLeaders(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [examId]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa điểm của học sinh ${name}?`)) {
      return;
    }

    setIsDeleting(id);
    try {
      await deleteDoc(doc(db, 'results', id));
      // Xóa thành công, cập nhật lại state
      setLeaders(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Lỗi khi xóa điểm:', error);
      alert('Không thể xóa kết quả này, vui lòng thử lại.');
    } finally {
      setIsDeleting(null);
    }
  };

  // Sort and filter logic
  const filteredAndSortedLeaders = [...leaders]
    .filter(leader => 
      leader.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leader.studentClass.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'score') {
        if (b.score !== a.score) return b.score - a.score;
        return a.timeSpent - b.timeSpent; // Nhanh hơn lên trên
      } else if (sortBy === 'time') {
        return a.timeSpent - b.timeSpent;
      } else if (sortBy === 'name') {
        return a.studentName.localeCompare(b.studentName);
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-teal-500" />
        <p>Đang tải dữ liệu điểm...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc lớp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setSortBy('score')}
            className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2", sortBy === 'score' ? "bg-teal-500/20 text-teal-400 border border-teal-500/50" : "bg-slate-900 text-slate-400 border border-slate-700 hover:bg-slate-800")}
          >
            <SortDesc className="w-4 h-4" />
            Điểm
          </button>
          <button 
            onClick={() => setSortBy('time')}
            className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2", sortBy === 'time' ? "bg-teal-500/20 text-teal-400 border border-teal-500/50" : "bg-slate-900 text-slate-400 border border-slate-700 hover:bg-slate-800")}
          >
            <Clock className="w-4 h-4" />
            Thời gian
          </button>
          <button 
            onClick={() => setSortBy('name')}
            className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2", sortBy === 'name' ? "bg-teal-500/20 text-teal-400 border border-teal-500/50" : "bg-slate-900 text-slate-400 border border-slate-700 hover:bg-slate-800")}
          >
            <ArrowDownAZ className="w-4 h-4" />
            Tên
          </button>
        </div>
      </div>

      <div className="bg-slate-800/30 rounded-2xl border border-slate-700/50 overflow-hidden">
        {filteredAndSortedLeaders.length === 0 ? (
          <div className="text-center p-12 text-slate-500">
            {leaders.length === 0 ? "Chưa có học sinh nào nộp bài." : "Không tìm thấy kết quả phù hợp."}
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {filteredAndSortedLeaders.map((leader, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={leader.id} 
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/80 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-300 shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-bold text-slate-200 text-lg">
                      {leader.studentName}
                    </div>
                    <div className="text-sm text-slate-500 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs">
                        Lớp {leader.studentClass}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 md:gap-8">
                  <div className="text-right">
                    <div className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Điểm số</div>
                    <div className="text-xl font-black text-teal-400">
                      {leader.score}/{leader.totalPoints}
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Thời gian</div>
                    <div className="text-base font-mono text-slate-300 flex items-center gap-1.5 justify-end">
                      <Clock className="w-4 h-4 opacity-50" />
                      {formatTimeSpent(leader.timeSpent)}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDelete(leader.id, leader.studentName)}
                    disabled={isDeleting === leader.id}
                    className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white transition-all hover:shadow-[0_0_15px_rgba(244,63,94,0.4)] disabled:opacity-50 shrink-0"
                    title="Xóa kết quả này"
                  >
                    {isDeleting === leader.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
