import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { LeaderboardEntry } from '../types';
import { Trophy, Clock, User } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const [stats, setStats] = useState<{ mostExams: any[], highestAvg: any[] }>({ mostExams: [], highestAvg: [] });
  const [activeTab, setActiveTab] = useState<'mostExams' | 'highestAvg'>('mostExams');

  const load = async () => {
    const data = await api.getLeaderboardStats();
    setStats(data);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const currentBoard = activeTab === 'mostExams' ? stats.mostExams : stats.highestAvg;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-center mb-8">
        <div className="bg-slate-800 p-1 rounded-2xl flex items-center">
          <button
            onClick={() => setActiveTab('mostExams')}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'mostExams' ? 'bg-teal-glow text-dark-bg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Làm nhiều bài nhất
          </button>
          <button
            onClick={() => setActiveTab('highestAvg')}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'highestAvg' ? 'bg-teal-glow text-dark-bg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Điểm trung bình cao nhất
          </button>
          <button
            onClick={load}
            className="ml-4 px-4 py-3 rounded-xl font-bold text-slate-400 hover:text-teal-glow transition-all"
            title="Làm mới"
          >
            <Trophy size={20} />
          </button>
        </div>
      </div>

      <div className="bg-dark-card border border-slate-700 rounded-3xl overflow-hidden teal-border-glow">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-widest">
              <th className="px-6 py-4 font-semibold">Hạng</th>
              <th className="px-6 py-4 font-semibold">Thí sinh</th>
              <th className="px-6 py-4 font-semibold">Số bài làm</th>
              <th className="px-6 py-4 font-semibold">Điểm TB</th>
              <th className="px-6 py-4 font-semibold">Điểm cao nhất</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {currentBoard.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">Chưa có kết quả nào</td>
              </tr>
            ) : (
              currentBoard.map((entry, idx) => (
                <tr key={idx} className="hover:bg-teal-glow/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      idx === 0 ? 'bg-yellow-500 text-dark-bg' : 
                      idx === 1 ? 'bg-slate-300 text-dark-bg' : 
                      idx === 2 ? 'bg-orange-500 text-dark-bg' : 'text-slate-400'
                    }`}>
                      {idx + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-teal-glow">
                        <User size={20} />
                      </div>
                      <span className="font-bold text-slate-200">{entry.student_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-200">{entry.total_exams}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-2xl font-black text-teal-glow">{entry.avg_score.toFixed(1)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-200">{entry.max_score.toFixed(1)}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
