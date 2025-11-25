
import React from 'react';
import { CourseModule, CourseType, Lesson, LessonType } from '../types';
import { RED_COURSE_DATA, BLUE_COURSE_DATA } from '../constants';
import { Lock, CheckCircle, Play, BookOpen, Swords, BrainCircuit, Star } from 'lucide-react';

interface DashboardProps {
  onSelectLesson: (lesson: Lesson, courseType: CourseType) => void;
  completedLessons: Set<string>;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelectLesson, completedLessons }) => {
  const [activeTab, setActiveTab] = React.useState<CourseType>(CourseType.RED);
  const currentData = activeTab === CourseType.RED ? RED_COURSE_DATA : BLUE_COURSE_DATA;
  const themeColor = activeTab === CourseType.RED ? 'text-rose-500' : 'text-cyan-500';
  const themeBg = activeTab === CourseType.RED ? 'bg-rose-600' : 'bg-cyan-600';
  const themeBorder = activeTab === CourseType.RED ? 'border-rose-500/20' : 'border-cyan-500/20';

  // Helper to flatten lessons for sequential unlocking logic
  const getAllLessons = () => currentData.flatMap(m => m.lessons);

  return (
    <div className="relative z-10 w-full h-full flex flex-col p-6 md:p-12 overflow-y-auto">
      
      {/* Header */}
      <div className="mb-10 text-center animate-fade-in-down">
        <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
           <BrainCircuit className="text-white mr-2" size={24} />
           <span className="font-bold text-lg tracking-wider">INSIGHT MIND ACADEMY</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">心智进化路径</h1>
        <p className="text-gray-400 max-w-xl mx-auto text-sm">
          系统化的社交与逻辑训练体系。<br/>
          <span className={themeColor}>当前进度: {completedLessons.size} / {getAllLessons().length} 课时</span>
        </p>
      </div>

      {/* Course Toggles */}
      <div className="flex justify-center mb-12 animate-fade-in sticky top-0 z-30 pt-4 pb-4 bg-[#050505]/80 backdrop-blur-xl">
        <div className="bg-[#111] p-1.5 rounded-full border border-white/10 flex shadow-2xl">
          <button 
            onClick={() => setActiveTab(CourseType.RED)}
            className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === CourseType.RED ? 'bg-rose-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.4)]' : 'text-gray-500 hover:text-white'}`}
          >
            感性心智 (Emotional)
          </button>
          <button 
            onClick={() => setActiveTab(CourseType.BLUE)}
            className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === CourseType.BLUE ? 'bg-cyan-600 text-white shadow-[0_0_20px_rgba(8,145,178,0.4)]' : 'text-gray-500 hover:text-white'}`}
          >
            理性逻辑 (Logical)
          </button>
        </div>
      </div>

      {/* Skill Tree Nodes */}
      <div className="max-w-5xl mx-auto w-full space-y-16 pb-20">
        {currentData.map((module, mIdx) => (
          <div key={module.id} className="relative pl-8 md:pl-0 animate-fade-in-up" style={{ animationDelay: `${mIdx * 100}ms` }}>
            
            {/* Connecting Line (Vertical) between Modules */}
            {mIdx < currentData.length - 1 && (
               <div className="absolute left-[31px] md:left-1/2 top-full w-0.5 h-16 bg-gradient-to-b from-white/10 to-transparent -translate-x-1/2 z-0"></div>
            )}
            
            <div className="relative z-10 bg-[#121212] border border-white/5 rounded-[2rem] p-6 md:p-10 hover:border-white/10 transition-colors shadow-2xl">
              
              {/* Module Header */}
              <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8 pb-8 border-b border-white/5">
                 <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-3xl ${themeBg} text-white shadow-lg`}>
                   {mIdx + 1}
                 </div>
                 <div>
                   <h2 className="text-2xl font-bold text-white mb-2">{module.title}</h2>
                   <div className="flex gap-4 text-xs font-mono uppercase tracking-widest text-gray-500">
                     <span>Phase {module.level}</span>
                     <span>•</span>
                     <span>{module.lessons.length} Lessons</span>
                   </div>
                 </div>
              </div>

              {/* Lessons Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {module.lessons.map((lesson, lIdx) => {
                   // Calculate Unlock Status
                   // Find global index of this lesson
                   const allLessons = getAllLessons();
                   const globalIndex = allLessons.findIndex(l => l.id === lesson.id);
                   
                   // It is unlocked if it's the first one OR the previous one is in completedLessons
                   const isUnlocked = globalIndex === 0 || completedLessons.has(allLessons[globalIndex - 1].id);
                   const isCompleted = completedLessons.has(lesson.id);

                   return (
                     <button
                       key={lesson.id}
                       onClick={() => isUnlocked && onSelectLesson(lesson, activeTab)}
                       disabled={!isUnlocked}
                       className={`relative group flex flex-col p-6 rounded-2xl border text-left transition-all duration-300 h-full min-h-[180px]
                         ${!isUnlocked 
                           ? 'bg-black/40 border-white/5 opacity-40 cursor-not-allowed grayscale' 
                           : isCompleted
                             ? `bg-green-900/10 border-green-500/30 hover:bg-green-900/20`
                             : `bg-white/5 border-white/5 hover:bg-white/10 hover:${themeBorder} active:scale-[0.98] shadow-lg`}`}
                     >
                       <div className="flex justify-between items-start mb-4">
                          <div className={`p-3 rounded-xl ${!isUnlocked ? 'bg-white/5 text-gray-600' : (isCompleted ? 'bg-green-500 text-white shadow-lg shadow-green-900/50' : 'bg-white/10 text-white')}`}>
                            {isCompleted ? <CheckCircle size={20} /> : (
                              <>
                                {lesson.type === LessonType.THEORY && <BookOpen size={20} />}
                                {lesson.type === LessonType.CASE_STUDY && <BrainCircuit size={20} />}
                                {lesson.type === LessonType.QUIZ && <Star size={20} />}
                                {lesson.type === LessonType.BOSS_FIGHT && <Swords size={20} />}
                              </>
                            )}
                          </div>
                          
                          {!isUnlocked ? (
                            <Lock size={18} className="text-gray-600" />
                          ) : isCompleted ? (
                             <span className="text-xs font-bold text-green-500 bg-green-900/20 px-2 py-1 rounded">COMPLETED</span>
                          ) : (
                            <div className={`text-xs font-bold ${themeColor} opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 px-2 py-1 rounded`}>START</div>
                          )}
                       </div>
                       
                       <h3 className={`font-bold text-lg mb-2 ${isCompleted ? 'text-green-100' : 'text-gray-100'} group-hover:text-white`}>{lesson.title}</h3>
                       <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{lesson.description}</p>
                       
                       {/* Connection Line to Next Lesson (Horizontal) */}
                       {lIdx < module.lessons.length - 1 && (
                         <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-white/5 z-0"></div>
                       )}
                     </button>
                   );
                 })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
