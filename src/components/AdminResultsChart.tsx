import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';

interface Result {
  id: string;
  studentClass: string;
  score: number;
  totalPoints?: number;
  [key: string]: any;
}

interface AdminResultsChartProps {
  results: Result[];
}

export const AdminResultsChart: React.FC<AdminResultsChartProps> = ({ results }) => {
  const chartData = useMemo(() => {
    if (!results || results.length === 0) return [];

    const classStats: Record<string, { totalScore10: number; count: number }> = {};

    results.forEach(res => {
      const cls = res.studentClass?.trim() || 'Khác';
      if (!classStats[cls]) {
        classStats[cls] = { totalScore10: 0, count: 0 };
      }
      
      const totalP = res.totalPoints || 10;
      const score10 = (res.score / totalP) * 10;

      classStats[cls].totalScore10 += score10;
      classStats[cls].count += 1;
    });

    const data = Object.keys(classStats).map(cls => ({
      name: cls,
      "Điểm trung bình": Number((classStats[cls].totalScore10 / classStats[cls].count).toFixed(2)),
      "Số học sinh": classStats[cls].count
    })).sort((a, b) => a.name.localeCompare(b.name));

    return data;
  }, [results]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className={cn(
      "w-full h-80 p-6 rounded-3xl mb-8 shadow-xl border transition-colors duration-300",
      "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
    )}>
      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Biểu đồ Điểm Trung Bình Theo Lớp (Hệ số 10)</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="name" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#f8fafc' }}
            itemStyle={{ color: '#2dd4bf' }}
          />
          <Legend />
          <Bar dataKey="Điểm trung bình" fill="#14b8a6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
