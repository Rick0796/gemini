
import React, { useState, useRef, useEffect } from 'react';
import { Lesson, LessonType, CourseType, CoachMessage, PracticeResult, LessonPage } from '../types';
import { ArrowLeft, Check, X, ChevronRight, ChevronLeft, Bot, Send, Sparkles, MessageSquare, Minimize2, BookOpen, Layers, Swords, Zap } from 'lucide-react';
import { askLessonCoach, evaluatePractice } from '../constants';

interface LessonViewProps {
  lesson: Lesson;
  courseType: CourseType;
  onBack: () => void;
  onComplete: () => void;
  onStartSimulation: () => void;
}

const LessonView: React.FC<LessonViewProps> = ({ lesson, courseType, onBack, onComplete, onStartSimulation }) => {
  const isRed = courseType === CourseType.RED;
  const themeBg = isRed ? 'bg-rose-600' : 'bg-cyan-600';
  const themeText = isRed ? 'text-rose-400' : 'text-cyan-400';
  const gradientOverlay = isRed 
    ? 'bg-gradient-to-br from-rose-900/40 via-[#050505] to-[#050505]' 
    : 'bg-gradient-to-br from-cyan-900/40 via-[#050505] to-[#050505]';

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(0);
  
  // Safe access to pages
  const pages: LessonPage[] = lesson.pages && lesson.pages.length > 0 ? lesson.pages : [{ title: "概览", content: lesson.description || "内容加载中...", type: "text" }];
  const totalPages = pages.length;
  const activePage = pages[currentPage];
  const progressPercent = ((currentPage + 1) / totalPages) * 100;

  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // AI Practice State
  const [practiceInput, setPracticeInput] = useState('');
  const [practiceResult, setPracticeResult] = useState<PracticeResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // AI Coach State
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [coachMessages, setCoachMessages] = useState<CoachMessage[]>([
    { id: 'init', sender: 'coach', content: `你好，我是你的专属沟通教练。关于本节课《${lesson.title.split(':')[0]}》，你有什么想深入探讨的吗？` }
  ]);
  const [coachInput, setCoachInput] = useState('');
  const [isCoachThinking, setIsCoachThinking] = useState(false);
  
  const coachScrollRef = useRef<HTMLDivElement>(null);
  const coachPanelRef = useRef<HTMLDivElement>(null);
  const contentScrollRef = useRef<HTMLDivElement>(null);

  // Reset page state when lesson changes
  useEffect(() => {
    setCurrentPage(0);
    setQuizSelected(null);
    setQuizSubmitted(false);
    setIsCorrect(false);
    setPracticeInput('');
    setPracticeResult(null);
    setIsEvaluating(false);
    setCoachMessages([{ id: 'init', sender: 'coach', content: `你好，我是你的专属沟通教练。关于本节课《${lesson.title.split(':')[0]}》，你有什么想深入探讨的吗？` }]);
  }, [lesson.id]);

  // Reset practice state when page changes
  useEffect(() => {
    setPracticeInput('');
    setPracticeResult(null);
    setIsEvaluating(false);
    if (contentScrollRef.current) {
        contentScrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [currentPage]);

  // Auto-scroll chat
  useEffect(() => {
    if (coachScrollRef.current) {
      coachScrollRef.current.scrollTop = coachScrollRef.current.scrollHeight;
    }
  }, [coachMessages, isCoachThinking, isCoachOpen]);

  // Click outside to close coach
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (coachPanelRef.current && !coachPanelRef.current.contains(event.target as Node)) {
        setIsCoachOpen(false);
      }
    };
    if (isCoachOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCoachOpen]);

  // Handle Coach Chat
  const handleCoachSend = async () => {
    if (!coachInput.trim()) return;
    const userMsg: CoachMessage = { id: Date.now().toString(), sender: 'user', content: coachInput };
    setCoachMessages(prev => [...prev, userMsg]);
    setCoachInput('');
    setIsCoachThinking(true);

    const currentPageContent = activePage.content;
    const context = `LESSON: ${lesson.title}\nCONTEXT: ${currentPageContent}`;
    
    const response = await askLessonCoach(userMsg.content, context, lesson.id);
    
    setIsCoachThinking(false);
    setCoachMessages(prev => [...prev, response]);
  };

  const handlePracticeSubmit = async () => {
      if (!practiceInput.trim() || !activePage.practice_id) return;
      setIsEvaluating(true);
      try {
          const result = await evaluatePractice(activePage.practice_id, practiceInput);
          setPracticeResult(result);
      } catch (e) {
          console.error(e);
      } finally {
          setIsEvaluating(false);
      }
  };

  const handleQuizSubmit = () => {
    if (quizSelected === null || !lesson.quiz_data) return;
    setQuizSubmitted(true);
    const correct = lesson.quiz_data.options[quizSelected].isCorrect;
    setIsCorrect(correct);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const renderTextContent = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} className="h-4"></div>;
      
      const parts = trimmed.split(/(\*\*.*?\*\*)/g);
      
      return (
        <p key={i} className="mb-4 text-lg md:text-xl leading-8 tracking-wide text-gray-200 font-light">
          {parts.map((part, idx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={idx} className="font-bold text-white">{part.slice(2, -2)}</strong>;
              }
              return part;
          })}
        </p>
      );
    });
  };

  // 1. BOSS FIGHT VIEW
  if (lesson.type === LessonType.BOSS_FIGHT) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 animate-fade-in relative overflow-hidden bg-[#050505]">
        <div className={`absolute inset-0 opacity-20 ${gradientOverlay}`}></div>
        <div className="relative z-10 max-w-2xl w-full bg-[#111]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 md:p-12 text-center shadow-2xl">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] ${isRed ? 'bg-rose-500' : 'bg-cyan-500'}`}>
            <Sparkles size={32} className="text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">{lesson.title}</h2>
          <p className="text-gray-400 mb-10 text-lg leading-relaxed font-light">{lesson.description}</p>
          <div className="flex gap-4 justify-center">
            <button onClick={onBack} className="px-8 py-3.5 rounded-full border border-white/10 hover:bg-white/5 text-gray-400 transition font-medium">稍后</button>
            <button onClick={onStartSimulation} className={`px-12 py-3.5 rounded-full font-bold text-white shadow-xl hover:scale-105 transition-all ${themeBg}`}>开始挑战</button>
          </div>
        </div>
      </div>
    );
  }

  // 2. BOOK / THEORY VIEW
  return (
    <div className="w-full h-full flex flex-col bg-[#050505] font-sans relative selection:bg-white/20 overflow-hidden">
      {/* Background Ambience */}
      <div className={`fixed inset-0 pointer-events-none opacity-30 ${gradientOverlay}`}></div>
      <div className="fixed inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

      {/* Navbar */}
      <div className="h-24 flex items-center justify-between px-6 md:px-12 shrink-0 z-40 backdrop-blur-xl bg-[#050505]/80 border-b border-white/5 shadow-2xl relative">
        <button onClick={onBack} className="group flex items-center gap-4 text-gray-400 hover:text-white transition">
          <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition">
            <ArrowLeft size={18} />
          </div>
          <div className="flex flex-col items-start hidden md:flex">
             <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-gray-500 group-hover:text-white transition-colors">返回</span>
             <span className="text-sm font-bold font-mono tracking-wider">课程大纲</span>
          </div>
        </button>
        
        {/* Reading Progress (Visual Only) */}
        <div className="flex flex-col items-center w-1/3">
           <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-500 ease-out ${themeBg}`} style={{ width: `${progressPercent}%` }}></div>
           </div>
        </div>

        <div className="flex flex-col items-end">
          <span className={`text-xs font-bold uppercase tracking-[0.2em] font-mono mb-1 ${themeText}`}>{courseType === CourseType.RED ? '情感' : '逻辑'}心智模型</span>
        </div>
      </div>

      {/* Main Content Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto relative z-10 scroll-smooth pb-32" ref={contentScrollRef}>
         <div className="max-w-4xl mx-auto w-full p-6 md:p-12 animate-fade-in-up">
            
            {/* Page Header */}
            <div className="mb-8" key={`header-${currentPage}`}>
               <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest mb-4 ${themeText}`}>
                 {activePage.type === 'case_analysis' && <Layers size={12} />}
                 {activePage.type === 'text' && <BookOpen size={12} />}
                 {activePage.type === 'ai_practice' && <Swords size={12} />}
                 {activePage.type === 'key_takeaway' && <Sparkles size={12} />}
                 
                 {activePage.type === 'case_analysis' ? '案例拆解' : 
                  activePage.type === 'ai_practice' ? '实战演练' :
                  activePage.type === 'key_takeaway' ? '核心总结' : '理论解析'}
               </div>
               <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight tracking-tight font-sans animate-fade-in">{activePage.title}</h1>
            </div>

            {/* AI PRACTICE CARD */}
            {activePage.type === 'ai_practice' ? (
                <div key={`practice-${currentPage}`} className="bg-[#111]/80 backdrop-blur-md border border-yellow-500/20 rounded-[2rem] p-8 md:p-14 shadow-2xl relative overflow-hidden min-h-[400px] animate-fade-in">
                    <div className="absolute top-0 left-0 w-2 h-full bg-yellow-500/50"></div>
                    
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500"><Swords size={20} /></div>
                        场景模拟
                    </h3>
                    <p className="text-lg text-gray-300 mb-8 leading-relaxed font-light border-l-2 border-white/10 pl-6">
                        {activePage.content}
                    </p>

                    <div className="space-y-4">
                        <textarea
                            value={practiceInput}
                            onChange={(e) => setPracticeInput(e.target.value)}
                            disabled={isEvaluating || !!practiceResult}
                            placeholder="在这里输入你的回复..."
                            className="w-full bg-black/50 border border-white/10 rounded-2xl p-6 text-white placeholder-gray-600 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all resize-none h-32"
                        />
                        
                        {!practiceResult ? (
                            <button 
                                onClick={handlePracticeSubmit}
                                disabled={!practiceInput.trim() || isEvaluating}
                                className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all
                                    ${practiceInput.trim() && !isEvaluating ? 'bg-yellow-600 hover:bg-yellow-500 text-black shadow-lg hover:shadow-yellow-500/20' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                            >
                                {isEvaluating ? 'AI 正在评分...' : '提交考核'}
                            </button>
                        ) : (
                            <div className="mt-8 animate-fade-in-up">
                                <div className={`p-6 rounded-2xl border ${practiceResult.sentiment === 'GOOD' ? 'bg-green-900/10 border-green-500/30' : practiceResult.sentiment === 'BAD' ? 'bg-red-900/10 border-red-500/30' : 'bg-gray-800/50 border-gray-600/30'}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`text-2xl font-bold ${practiceResult.sentiment === 'GOOD' ? 'text-green-500' : practiceResult.sentiment === 'BAD' ? 'text-red-500' : 'text-gray-400'}`}>
                                                {practiceResult.score}分
                                            </div>
                                            <div className="text-xs uppercase tracking-wider font-mono text-gray-500">AI 评分</div>
                                        </div>
                                        {practiceResult.sentiment === 'GOOD' && <Check className="text-green-500" />}
                                        {practiceResult.sentiment === 'BAD' && <X className="text-red-500" />}
                                    </div>
                                    <p className="text-gray-200 leading-relaxed italic">
                                        "{practiceResult.feedback}"
                                    </p>
                                </div>
                                <button 
                                    onClick={() => { setPracticeResult(null); setPracticeInput(''); }}
                                    className="mt-4 w-full py-3 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition uppercase text-xs tracking-widest"
                                >
                                    再试一次
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* STANDARD TEXT CONTENT */
                <div key={`content-${currentPage}`} className="bg-[#111]/80 backdrop-blur-md border border-white/10 rounded-[2rem] p-8 md:p-14 shadow-2xl relative overflow-hidden min-h-[400px] animate-fade-in">
                    <div className={`absolute top-0 left-0 w-2 h-full ${themeBg}`}></div>
                    <div className="prose prose-invert prose-lg max-w-none">
                        {renderTextContent(activePage.content)}
                    </div>
                </div>
            )}

            {/* --- QUIZ SECTION (Only on last page) --- */}
            {currentPage === totalPages - 1 && lesson.quiz_data && (
              <div className="mt-20 border-t border-white/10 pt-16 animate-fade-in">
                 <h2 className="text-2xl font-bold text-white mb-8 text-center">知识点考核</h2>
                 <div className="space-y-8 max-w-2xl mx-auto">
                     <div className="bg-[#161616] border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl relative">
                        <p className="text-xl font-medium text-white mb-10 leading-relaxed">{lesson.quiz_data.question}</p>
                        <div className="space-y-4">
                          {lesson.quiz_data.options.map((option, idx) => (
                            <button
                              key={idx}
                              onClick={() => !quizSubmitted && setQuizSelected(idx)}
                              disabled={quizSubmitted}
                              className={`w-full text-left p-6 rounded-2xl border transition-all duration-200 flex items-start justify-between group
                                ${quizSubmitted
                                  ? (option.isCorrect ? 'bg-green-500/10 border-green-500 text-white' : (quizSelected === idx ? 'bg-red-500/10 border-red-500 text-white' : 'bg-white/5 border-transparent opacity-40'))
                                  : (quizSelected === idx ? `bg-white/10 border-white text-white` : 'bg-white/5 border-white/5 hover:bg-white/10 text-gray-300 hover:border-white/20')}`}
                            >
                              <span className="text-lg leading-relaxed">{option.text}</span>
                              {quizSubmitted && option.isCorrect && <Check size={24} className="text-green-500 ml-4 shrink-0" />}
                              {quizSubmitted && !option.isCorrect && quizSelected === idx && <X size={24} className="text-red-500 ml-4 shrink-0" />}
                            </button>
                          ))}
                        </div>
                     </div>
                     {!quizSubmitted ? (
                       <button onClick={handleQuizSubmit} disabled={quizSelected === null} className={`w-full py-5 rounded-2xl font-bold text-white transition-all shadow-lg tracking-widest uppercase font-mono ${quizSelected !== null ? themeBg : 'bg-gray-800 cursor-not-allowed text-gray-500'}`}>提交答案</button>
                     ) : (
                       <div className={`p-8 rounded-[2rem] animate-fade-in ${isCorrect ? 'bg-green-900/10 border border-green-500/20' : 'bg-red-900/10 border border-red-500/20'}`}>
                         <h4 className={`text-xl font-bold mb-3 font-mono uppercase tracking-wider ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>{isCorrect ? '回答正确' : '回答错误'}</h4>
                         <p className="text-gray-300 text-lg mb-8 leading-relaxed">{lesson.quiz_data.options[quizSelected!].feedback}</p>
                         {isCorrect ? (
                           <button onClick={onComplete} className="flex items-center justify-center w-full gap-2 px-6 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition font-mono uppercase tracking-widest">完成本课 <Check size={20} /></button>
                         ) : (
                           <button onClick={() => { setQuizSubmitted(false); setQuizSelected(null); }} className="w-full py-4 text-gray-400 hover:text-white border border-white/10 hover:bg-white/5 rounded-xl transition font-mono uppercase tracking-widest">重试</button>
                         )}
                       </div>
                     )}
                  </div>
              </div>
            )}
            
            {/* Completion Button (Only on last page if no quiz) */}
            {currentPage === totalPages - 1 && !lesson.quiz_data && (
                <div className="mt-12 text-center pb-24">
                    <button onClick={onComplete} className={`px-12 py-5 rounded-full font-bold text-white text-lg hover:scale-105 active:scale-95 transition-all shadow-xl tracking-widest uppercase font-mono ${themeBg}`}>
                        标记为完成
                    </button>
                </div>
            )}
         </div>
      </div>

      {/* --- FIXED PAGINATION FOOTER (ALWAYS VISIBLE) --- */}
      <div className="h-20 shrink-0 bg-[#050505] border-t border-white/10 flex items-center justify-between px-6 md:px-12 z-50">
           <button 
             onClick={handlePrevPage}
             disabled={currentPage === 0}
             className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95
               ${currentPage === 0 
                 ? 'bg-gray-900 text-gray-600 cursor-not-allowed opacity-50' 
                 : 'bg-white text-black hover:bg-gray-200 hover:scale-105 cursor-pointer'}`}
           >
             <ChevronLeft size={16} /> 上一页
           </button>

           <div className="text-xs font-mono text-gray-500 uppercase tracking-widest hidden md:block">
             PAGE {currentPage + 1} / {totalPages}
           </div>

           <button 
             onClick={handleNextPage}
             disabled={currentPage >= totalPages - 1}
             className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95
               ${currentPage >= totalPages - 1 
                  ? 'bg-gray-900 text-gray-600 cursor-not-allowed opacity-50' 
                  : `${isRed ? 'bg-rose-500 hover:bg-rose-400' : 'bg-cyan-500 hover:bg-cyan-400'} text-black hover:scale-105 cursor-pointer`}`}
           >
             下一页 <ChevronRight size={16} />
           </button>
      </div>

      {/* 3. AI LESSON COACH (Adjusted Position) */}
      <div className="fixed bottom-24 right-6 z-[60] flex flex-col items-end" ref={coachPanelRef}>
        
        {/* Chat Popup */}
        <div className={`mb-4 w-[350px] md:w-[400px] bg-[#111]/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[2rem] overflow-hidden flex flex-col transition-all duration-300 origin-bottom-right
            ${isCoachOpen ? 'opacity-100 scale-100 translate-y-0 h-[500px]' : 'opacity-0 scale-90 translate-y-10 h-0 pointer-events-none'}`}>
          
          {/* Header */}
          <div className={`p-4 border-b border-white/5 flex items-center justify-between ${isRed ? 'bg-rose-950/40' : 'bg-cyan-950/40'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${themeBg} text-white shadow-lg`}>
                <Bot size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">AI 助教</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">v2.1.0 在线</p>
              </div>
            </div>
            <button onClick={() => setIsCoachOpen(false)} className="text-gray-400 hover:text-white"><Minimize2 size={18}/></button>
          </div>

          {/* Chat Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-[#080808]" ref={coachScrollRef}>
            {coachMessages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user' ? 'bg-white text-black rounded-br-sm' : 'bg-[#222] text-gray-200 border border-white/5 rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isCoachThinking && (
              <div className="flex justify-start">
                <div className="bg-[#222] border border-white/5 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 bg-[#0a0a0a] border-t border-white/5">
            <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-full px-4 py-2 border border-white/5 focus-within:border-white/20 transition-colors">
              <input 
                type="text" 
                value={coachInput}
                onChange={(e) => setCoachInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCoachSend()}
                placeholder="对本页内容有疑问？问我..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-white placeholder-gray-500"
              />
              <button onClick={handleCoachSend} disabled={!coachInput.trim() || isCoachThinking} className={`p-1.5 rounded-full transition-all ${coachInput.trim() ? 'bg-white text-black hover:scale-110' : 'bg-gray-800 text-gray-500'}`}>
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Floating Button */}
        <button 
          onClick={() => setIsCoachOpen(!isCoachOpen)}
          className={`w-14 h-14 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 border border-white/10 relative z-50
            ${isCoachOpen ? 'bg-[#222] text-white rotate-90' : `${themeBg} text-white`}`}
        >
          {isCoachOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </button>
      </div>

    </div>
  );
};

export default LessonView;
