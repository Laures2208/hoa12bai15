import React, { useState, useEffect } from 'react';
import { Medal } from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export const Top10Leaderboard = () => {
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardType, setLeaderboardType] = useState<'most_exams' | 'highest_avg'>('most_exams');
  const [selectedGrade, setSelectedGrade] = useState<'10' | '11' | '12' | 'all'>('all');

  useEffect(() => {
    let unsubscribe: () => void;
    setIsLoading(true);
    
    const setupListener = async () => {
      try {
        const resultsRef = collection(db, 'results');
        
        unsubscribe = onSnapshot(resultsRef, (snapshot) => {
          const statsMap = new Map<string, any>();
          
          snapshot.docs.forEach(doc => {
            const data = doc.data();
            const key = `${data.studentName}_${data.studentClass}`;
            
            if (!statsMap.has(key)) {
              statsMap.set(key, {
                student_name: data.studentName,
                student_class: data.studentClass,
                total_exams: 0,
                total_score: 0,
              });
            }
            
            const userStats = statsMap.get(key);
            userStats.total_exams += 1;
            const normalizedScore = data.totalPoints ? (data.score / data.totalPoints) * 10 : (data.score || 0);
            userStats.total_score += normalizedScore;
          });
          
          const statsArray = Array.from(statsMap.values())
            .filter(stat => selectedGrade === 'all' || stat.student_class.startsWith(selectedGrade))
            .map(stat => ({
              ...stat,
              avg_score: stat.total_exams > 0 ? Number((stat.total_score / stat.total_exams).toFixed(2)) : 0
            }));
          
          if (leaderboardType === 'most_exams') {
            statsArray.sort((a, b) => b.total_exams - a.total_exams || b.avg_score - a.avg_score);
          } else {
            statsArray.sort((a, b) => b.avg_score - a.avg_score || b.total_exams - a.total_exams);
          }
          
          setTopUsers(statsArray.slice(0, 10));
          setIsLoading(false);
        });
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [leaderboardType, selectedGrade]);

  return (
    <div className="mt-8">
      <div className="text-center mb-6">
        <h2 className={cn(
          "text-2xl font-bold mb-2 flex items-center justify-center gap-2 transition-colors duration-300",
          "text-slate-900 dark:text-white"
        )}>
          <Medal className="w-6 h-6 text-yellow-500" />
          Bảng Vàng Thành Tích
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">Top 10 Luyện Kim Sư xuất sắc nhất</p>
        
        <div className="flex justify-center gap-2 mb-4 flex-wrap">
          {(['all', '10', '11', '12'] as const).map((grade) => (
            <button
              key={grade}
              onClick={() => setSelectedGrade(grade)}
              className={cn(
                "px-4 py-1.5 rounded-full font-bold transition-all text-xs border",
                selectedGrade === grade 
                  ? "bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-500/30" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
              )}
            >
              {grade === 'all' ? 'Tất cả khối' : `Khối ${grade}`}
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-2 mb-4">
          <button
            onClick={() => setLeaderboardType('most_exams')}
            className={cn(
              "px-4 py-1.5 rounded-full font-bold transition-all text-xs",
              leaderboardType === 'most_exams' 
                ? "bg-teal-500 text-white shadow-lg shadow-teal-500/30" 
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            )}
          >
            Làm bài nhiều nhất
          </button>
          <button
            onClick={() => setLeaderboardType('highest_avg')}
            className={cn(
              "px-4 py-1.5 rounded-full font-bold transition-all text-xs",
              leaderboardType === 'highest_avg' 
                ? "bg-teal-500 text-white shadow-lg shadow-teal-500/30" 
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            )}
          >
            Điểm trung bình cao nhất
          </button>
        </div>
      </div>

      <div className={cn(
        "border rounded-2xl overflow-hidden shadow-xl transition-colors duration-300",
        "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
      )}>
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="w-6 h-6 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : topUsers.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
            Chưa có dữ liệu. Hãy là người đầu tiên ghi danh!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className={cn(
                "border-b transition-colors duration-300",
                "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800"
              )}>
                <tr>
                  <th className="px-4 py-3 text-teal-600 dark:text-teal-500 font-bold uppercase text-[10px] w-12 text-center">Hạng</th>
                  <th className="px-4 py-3 text-teal-600 dark:text-teal-500 font-bold uppercase text-[10px]">Thí sinh</th>
                  <th className="px-4 py-3 text-teal-600 dark:text-teal-500 font-bold uppercase text-[10px]">Lớp</th>
                  <th className="px-4 py-3 text-teal-600 dark:text-teal-500 font-bold uppercase text-[10px] text-center">Số bài làm</th>
                  <th className="px-4 py-3 text-teal-600 dark:text-teal-500 font-bold uppercase text-[10px] text-right">Điểm TB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {topUsers.map((user, idx) => (
                  <tr key={`${user.student_name}_${user.student_class}_${idx}`} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-center">
                      {idx === 0 ? <span className="text-xl">🥇</span> :
                       idx === 1 ? <span className="text-xl">🥈</span> :
                       idx === 2 ? <span className="text-xl">🥉</span> :
                       <span className="text-slate-500 dark:text-slate-400 font-bold">{idx + 1}</span>}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{user.student_name}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{user.student_class}</td>
                    <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-400 font-bold">
                      {user.total_exams}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="px-2 py-1 rounded-md text-xs font-black bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30">
                        {user.avg_score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
