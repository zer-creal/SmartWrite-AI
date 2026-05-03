'use client';

import { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { useFileManager } from '@/context/FileManagerContext';

function generateLast7Days(): { date: string; label: string; count: number }[] {
  const days = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toDateString();
    days.push({
      date: dateStr,
      label: date.toLocaleDateString('zh-CN', { weekday: 'short', day: 'numeric' }),
      count: 0,
    });
  }

  return days;
}

export default function UsageTrend() {
  const { files } = useFileManager();

  const chartData = useMemo(() => {
    const last7Days = generateLast7Days();

    files.forEach((file) => {
      const fileDate = new Date(file.updatedAt).toDateString();
      const dayIndex = last7Days.findIndex((d) => d.date === fileDate);
      if (dayIndex !== -1) {
        last7Days[dayIndex].count++;
      }
    });

    return last7Days;
  }, [files]);

  const maxCount = Math.max(...chartData.map((d) => d.count), 1);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-gray-400" />
        7 天编辑趋势
      </h2>
      <div className="flex items-end justify-between gap-2 h-40">
        {chartData.map((day, index) => {
          const heightPercent = (day.count / maxCount) * 100;
          const isToday = index === chartData.length - 1;

          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col items-center justify-end h-32">
                <div
                  className={`w-full max-w-8 rounded-t-md transition-all ${
                    isToday ? 'bg-blue-600' : 'bg-blue-300 hover:bg-blue-400'
                  }`}
                  style={{ height: `${Math.max(heightPercent, 4)}%` }}
                  title={`${day.label}: ${day.count} 篇`}
                />
              </div>
              <span className={`text-xs ${isToday ? 'font-medium text-blue-600' : 'text-gray-500'}`}>
                {day.label.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>0</span>
        <span>编辑文档数 / 天</span>
        <span>{maxCount} 篇</span>
      </div>
    </div>
  );
}
