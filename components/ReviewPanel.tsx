import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { SessionReport } from '../types';
import { RefreshCcw, Share2, Award, AlertOctagon, TrendingUp, Target } from 'lucide-react';

interface ReviewPanelProps {
  report: SessionReport | null;
  onRestart: () => void;
  lastMode: string;
}

const ReviewPanel: React.FC<ReviewPanelProps> = ({ report, onRestart, lastMode }) => {
  const isRed = lastMode === 'RED_DOOR';
  const themeColor = isRed ? '#f43f5e' : '#06b6d4'; // Rose vs Cyan
  
  if (!report) return <div className="flex items-center justify-center h-screen text-white bg-black">
    <div className="flex flex-col items-center gap-4">
      <div className={`w-12 h-12 rounded-full border-2 border-t-transparent animate-spin ${isRed ? 'border-rose-500' : 'border-cyan-500'}`}></div>
      <p className="text-gray-400 text-sm tracking-widest animate-pulse">正在生成深度诊断报告...</p>
    </div>
  </div>;

  return (
    <div className="relative z-30 flex flex-col items-center min-h-screen w-full p-4 md:p-8 animate-fade-in bg-[#050505] overflow-y-auto">
      
      {/* Header */}
      <div className="text-center mb-8 mt-4">
        <h1 className="text-3xl md:text-4xl font-light text-white mb-2">训练诊断报告</h1>
        <div className="flex items-center justify-center gap-2 text-xs font-mono text-gray-500 uppercase tracking-widest">
           <span>Session ID: {Date.now().toString().slice(-6)}</span>
           <span>•</span>
           <span className={isRed ? 'text-rose-500' : 'text-cyan-500'}>{isRed ? '感性训练 (RED)' : '理性训练 (BLUE)'}</span>
        </div>
      </div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        
        {/* COLUMN 1: RADAR & SCORE */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className={`absolute top-0 w-full h-1 ${isRed ? 'bg-rose-500' : 'bg-cyan-500'}`}></div>
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-6">能力六维模型</h2>
            
            <div className="w-full h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={report.radarData}>
                  <PolarGrid stroke="#333" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="表现"
                    dataKey="A"
                    stroke={themeColor}
                    strokeWidth={2}
                    fill={themeColor}
                    fillOpacity={0.2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 flex flex-col items-center">
               <div className="text-5xl font-thin text-white mb-1">{Math.round(report.score)}</div>
               <div className={`text-xs px-2 py-1 rounded bg-white/5 border border-white/10 ${isRed ? 'text-rose-400' : 'text-cyan-400'}`}>
                 最终得分 / Final Score
               </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2: DIAGNOSTICS */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Top 3 Errors */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-red-900/20 rounded-lg text-red-500 border border-red-500/20">
                 <AlertOctagon size={20} />
               </div>
               <h3 className="text-lg text-white font-medium">致命失误 TOP 3</h3>
            </div>
            <div className="space-y-4">
              {report.fatal_errors.map((error, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition">
                  <span className="font-mono text-red-500/50 text-xl font-bold">0{idx + 1}</span>
                  <p className="text-gray-300 text-sm leading-relaxed">{error}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* MVP Line */}
            <div className="bg-gradient-to-br from-yellow-900/10 to-transparent border border-yellow-500/20 rounded-3xl p-6">
               <div className="flex items-center gap-2 mb-4 text-yellow-500">
                  <Award size={18} />
                  <h3 className="text-sm font-bold uppercase tracking-wide">全场最佳金句</h3>
               </div>
               <p className="text-white text-lg font-light italic leading-relaxed">
                 {report.mvp_line}
               </p>
            </div>

            {/* Next Steps */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
               <div className="flex items-center gap-2 mb-4 text-green-500">
                  <TrendingUp size={18} />
                  <h3 className="text-sm font-bold uppercase tracking-wide">后续训练计划</h3>
               </div>
               <p className="text-gray-400 text-sm leading-relaxed">
                 {report.training_plan}
               </p>
            </div>
          </div>

        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-6 pb-12">
        <button 
          onClick={onRestart}
          className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-full hover:bg-gray-200 transition font-medium shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-95"
        >
          <RefreshCcw size={18} />
          开启新训练
        </button>
        <button className="flex items-center gap-2 px-8 py-3 bg-transparent border border-white/20 text-white rounded-full hover:bg-white/5 transition font-medium active:scale-95">
          <Share2 size={18} />
          保存报告
        </button>
      </div>
    </div>
  );
};

export default ReviewPanel;