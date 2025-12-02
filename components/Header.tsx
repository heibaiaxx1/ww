import React from 'react';
import { DayProgress } from '../types';
import { Sparkles } from 'lucide-react';

interface HeaderProps {
  progress: DayProgress;
}

const Header: React.FC<HeaderProps> = ({ progress }) => {
  const date = new Date().toLocaleDateString('zh-CN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const circumference = 2 * Math.PI * 24; // r=24
  const strokeDashoffset = circumference - (progress.percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-b-3xl shadow-sm border-b border-slate-100 p-6 mb-6">
      <div className="flex justify-between items-center max-w-md mx-auto">
        <div>
          <h2 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">
            {date}
          </h2>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            今日补剂 <Sparkles className="w-5 h-5 text-emerald-500" />
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {progress.completed}/{progress.total} 已完成
          </p>
        </div>

        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="transform -rotate-90 w-16 h-16">
            <circle
              cx="32"
              cy="32"
              r="24"
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              className="text-slate-100"
            />
            <circle
              cx="32"
              cy="32"
              r="24"
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="text-emerald-500 transition-all duration-1000 ease-out"
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-xs font-bold text-slate-700">
            {Math.round(progress.percentage)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default Header;