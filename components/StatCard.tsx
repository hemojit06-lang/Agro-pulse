
import React from 'react';

interface StatCardProps {
  label: string;
  value: number;
  prefix?: string;
  colorClass?: string;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, prefix = '₹', colorClass = 'text-white', icon }) => {
  return (
    <div className="glass rounded-[1.5rem] p-6 group hover:border-white/20 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">{label}</span>
        <div className={`p-2 rounded-lg bg-white/5 border border-white/5 group-hover:scale-110 transition-transform ${colorClass.replace('text-', 'text-opacity-50 text-')}`}>
          {icon}
        </div>
      </div>
      <div className={`text-2xl font-bold font-mono tracking-tight ${colorClass}`}>
        {prefix}{value.toLocaleString('en-IN')}
      </div>
      <div className="mt-2 h-[2px] w-8 bg-white/5 group-hover:w-full group-hover:bg-current transition-all duration-500 opacity-20" />
    </div>
  );
};
