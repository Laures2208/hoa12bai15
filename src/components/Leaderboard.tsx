import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Trophy, Medal, Clock, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { formatTimeSpent } from '../App';

interface LeaderboardProps {
  examId: string;
}

interface Leader {
  studentName: string;
  studentClass: string;
  score: number;
  totalPoints: number;
  timeSpent: number;
  submittedAt: any;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ examId }) => {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!examId) {
        setLoading(false);
        return;
      }
      
      try {
        const q = query(
          collection(db, 'results'),
          where('examId', '==', examId)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => doc.data() as Leader);
        
        // Sort in memory to avoid Firestore missing index errors
        // Primary sort: score (descending)
        // Secondary sort: timeSpent (ascending)
        data.sort((a, b) => {
          if (b.score !== a.score) {
            return b.score - a.score;
          }
          const timeA = a.timeSpent || 0;
          const timeB = b.timeSpent || 0;
          return timeA - timeB;
        });

        setLeaders(data.slice(0, 10)); // Top 10
      } catch (error) {
        console.error("Lỗi khi tải bảng xếp hạng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [examId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (leaders.length === 0) return null;

  return (
    <div className="bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-800 shadow-2xl mb-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      
      <div className="flex items-center gap-3 mb-8 relative z-10">
        <div className="p-3 bg-teal-500/10 rounded-2xl border border-teal-500/20">
          <Trophy className="w-6 h-6 text-teal-400" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-white tracking-tight">Bảng Xếp Hạng Top 10</h3>
          <p className="text-sm text-slate-400">Những học sinh xuất sắc nhất bài thi này</p>
        </div>
      </div>

      <div className="space-y-3 relative z-10 w-full overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800">
            <div className="col-span-1 text-center">Hạng</div>
            <div className="col-span-5">Học sinh</div>
            <div className="col-span-3 text-center">Lớp</div>
            <div className="col-span-1 text-center">Điểm</div>
            <div className="col-span-2 text-right">Thời gian</div>
          </div>

          <div className="mt-2 space-y-2">
            {leaders.map((leader, index) => {
              const isTop1 = index === 0;
              const isTop2 = index === 1;
              const isTop3 = index === 2;
              
              return (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={index} 
                  className={`grid grid-cols-12 gap-4 px-4 py-4 rounded-2xl items-center transition-colors border ${
                    isTop1 ? 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 
                    isTop2 ? 'bg-slate-300/10 border-slate-300/20' : 
                    isTop3 ? 'bg-orange-700/10 border-orange-700/20' : 
                    'bg-slate-800/50 border-transparent hover:bg-slate-800'
                  }`}
                >
                  <div className="col-span-1 flex justify-center">
                    {isTop1 ? <Medal className="w-6 h-6 text-amber-500" /> : 
                     isTop2 ? <Medal className="w-6 h-6 text-slate-300" /> : 
                     isTop3 ? <Medal className="w-6 h-6 text-orange-600" /> : 
                     <span className="font-bold text-slate-500">{index + 1}</span>}
                  </div>
                  <div className="col-span-5 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      isTop1 ? 'bg-amber-500 text-amber-950' : 
                      isTop2 ? 'bg-slate-300 text-slate-900' : 
                      isTop3 ? 'bg-orange-600 text-white' : 
                      'bg-slate-700 text-white'
                    }`}>
                      {leader.studentName.charAt(0).toUpperCase()}
                    </div>
                    <span className={`font-bold truncate ${isTop1 ? 'text-amber-500' : 'text-slate-200'}`}>
                      {leader.studentName}
                    </span>
                  </div>
                  <div className="col-span-3 text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
                      {leader.studentClass}
                    </span>
                  </div>
                  <div className="col-span-1 text-center font-black text-teal-400">
                    {leader.score}/{leader.totalPoints}
                  </div>
                  <div className="col-span-2 text-right flex items-center justify-end gap-1.5 text-slate-400 font-mono text-sm">
                    <Clock className="w-4 h-4 opacity-70" />
                    {formatTimeSpent(leader.timeSpent)}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
