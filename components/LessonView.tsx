
import React, { useState, useRef, useEffect } from 'react';
import { Lesson, LessonType, CourseType, CoachMessage } from '../types';
import { ArrowLeft, Check, X, AlertCircle, Lightbulb, ChevronRight, Bot, Send, Sparkles, MessageSquare, Minimize2, BookOpen } from 'lucide-react';
import { askLessonCoach } from '../constants';

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

  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // AI Coach State
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [coachMessages, setCoachMessages] = useState<CoachMessage[]>([
    { id: 'init', sender: 'coach', content: `你好，我是你的专属沟通教练。关于本节课《${lesson.title.split(':')[0]}》，你有什么想深入探讨的吗？` }
  ]);
  const [coachInput, setCoachInput] = useState('');
  const [isCoachThinking, setIsCoachThinking] = useState(false);
  
  const coachScrollRef = useRef<HTMLDivElement>(null);
  const coachPanelRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (coachScrollRef.current) {
      coachScrollRef.current.scrollTop = coachScrollRef.current.scrollHeight;
    }
  }, [coachMessages, isCoachThinking, isCoachOpen]);

  // Click outside to close
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

    // Pass lesson ID for context-aware simulation
    const context = lesson.content.theory || lesson.description;
    const response = await askLessonCoach(userMsg.content, context, lesson.id);
    
    setIsCoachThinking(false);
    setCoachMessages(prev => [...prev, response]);
  };

  const handleQuizSubmit = () => {
    if (quizSelected === null || !lesson.content.quiz_options) return;
    setQuizSubmitted(true);
    const correct = lesson.content.quiz_options[quizSelected].isCorrect;
    setIsCorrect(correct);
  };

  const renderContent = (text?: string) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => (
      line.trim() ? <p key={i} className="mb-6 text-lg leading-8 tracking-wide text-gray-200 font-light">{line}</p> : null
    ));
  };

  // 1. BOSS FIGHT VIEW (Unchanged)
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
            <button onClick={onBack} className="px-8 py-3.5 rounded-full border border-white/10 hover:bg-white/5 text-gray-400 transition font-medium">LATER</button>
            <button onClick={onStartSimulation} className={`px-12 py-3.5 rounded-full font-bold text-white shadow-xl hover:scale-105 transition-all ${themeBg}`}>ENTER ARENA</button>
          </div>
        </div>
      </div>
    );
  }

  // 2. THEORY & QUIZ VIEW
  return (
    <div className="w-full h-full flex flex-col bg-[#050505] overflow-y-auto font-sans relative selection:bg-white/20">
      {/* Background Ambience */}
      <div className={`fixed inset-0 pointer-events-none opacity-30 ${gradientOverlay}`}></div>
      <div className="fixed inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

      {/* Modern Navbar - Expanded & English Font */}
      <div className="h-24 flex items-center justify-between px-6 md:px-12 sticky top-0 z-50 backdrop-blur-xl bg-[#050505]/80 border-b border-white/5 shadow-2xl">
        <button onClick={onBack} className="group flex items-center gap-4 text-gray-400 hover:text-white transition">
          <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition">
            <ArrowLeft size={18} />
          </div>
          <div className="flex flex-col items-start">
             <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-gray-500 group-hover:text-white transition-colors">Return to</span>
             <span className="text-sm font-bold font-mono tracking-wider">CURRICULUM</span>
          </div>
        </button>
        <div className="flex flex-col items-end">
          <span className={`text-xs font-bold uppercase tracking-[0.2em] font-mono mb-1 ${themeText}`}>{courseType} INTELLIGENCE</span>
          <span className="text-[10px] text-gray-600 font-mono tracking-widest">LESSON {lesson.id.split('_').slice(1).join('.')}</span>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto w-full p-6 md:p-12 pb-40 animate-fade-in-up">
        {/* Header */}
        <div className="mb-16">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest mb-6 ${themeText}`}>
            <BookOpen size={12} />
            {lesson.type}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight tracking-tight font-sans">{lesson.title}</h1>
          <p className="text-xl md:text-2xl text-gray-400 font-light leading-relaxed border-l-2 border-white/10 pl-6">{lesson.description}</p>
        </div>

        {/* --- THEORY CONTENT --- */}
        {lesson.type === LessonType.THEORY && (
          <div className="space-y-16">
            
            {/* Main Theory Card */}
            <div className="bg-[#111]/80 backdrop-blur-md border border-white/10 rounded-[2rem] p-8 md:p-14 shadow-2xl relative overflow-hidden">
               {/* Decorative Element */}
               <div className={`absolute top-0 left-0 w-2 h-full ${themeBg}`}></div>
               <div className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:text-gray-300 prose-strong:text-white">
                  {renderContent(lesson.content.theory)}
               </div>
            </div>

            {/* Key Concepts Sidebar (Inline for mobile) */}
            {lesson.content.key_concepts && (
              <div className="flex flex-wrap gap-3">
                 {lesson.content.key_concepts.map((concept, idx) => (
                    <span key={idx} className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-xs font-mono uppercase tracking-wider text-gray-400 hover:text-white hover:border-white/30 transition-colors cursor-default">
                      # {concept}
                    </span>
                 ))}
              </div>
            )}

            {/* Examples Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[#1a0505] border border-red-500/20 rounded-[2rem] p-8 relative overflow-hidden group hover:border-red-500/40 transition-colors">
                <h3 className="text-red-400 font-bold mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em] font-mono">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span> Bad Example
                </h3>
                <p className="text-gray-300 italic text-lg leading-relaxed relative z-10 border-l border-red-500/30 pl-4">
                  "{lesson.content.bad_example}"
                </p>
              </div>
              <div className="bg-[#051a10] border border-green-500/20 rounded-[2rem] p-8 relative overflow-hidden group hover:border-green-500/40 transition-colors">
                <h3 className="text-green-400 font-bold mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em] font-mono">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span> Good Example
                </h3>
                <p className="text-white font-medium text-lg leading-relaxed relative z-10 border-l border-green-500/50 pl-4">
                  "{lesson.content.good_example}"
                </p>
              </div>
            </div>

            {/* Deep Dive */}
            <div className="bg-gradient-to-r from-blue-900/10 to-transparent border border-blue-500/20 rounded-[2rem] p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start">
              <div className="p-4 bg-blue-500/10 rounded-2xl shrink-0"><Lightbulb className="text-blue-400" size={32} /></div>
              <div>
                 <h3 className="text-blue-400 font-bold mb-3 text-sm uppercase tracking-[0.2em] font-mono">Psychological Principle</h3>
                 <p className="text-gray-300 leading-relaxed text-lg opacity-90">{lesson.content.why_it_works}</p>
              </div>
            </div>

            <button onClick={onComplete} className={`w-full py-6 rounded-[1.5rem] font-bold text-white text-lg mt-8 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl tracking-widest uppercase font-mono ${themeBg}`}>
              Mark as Mastered
            </button>
          </div>
        )}

        {/* --- QUIZ CONTENT --- */}
        {lesson.type === LessonType.QUIZ && (
          <div className="space-y-8 max-w-2xl mx-auto mt-12">
             <div className="bg-[#161616] border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-8 font-mono">Scenario Test</h3>
                <p className="text-2xl font-medium text-white mb-12 leading-relaxed">{lesson.content.quiz_question}</p>
                <div className="space-y-4">
                  {lesson.content.quiz_options?.map((option, idx) => (
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
               <button onClick={handleQuizSubmit} disabled={quizSelected === null} className={`w-full py-5 rounded-2xl font-bold text-white transition-all shadow-lg tracking-widest uppercase font-mono ${quizSelected !== null ? themeBg : 'bg-gray-800 cursor-not-allowed text-gray-500'}`}>Submit Answer</button>
             ) : (
               <div className={`p-8 rounded-[2rem] animate-fade-in ${isCorrect ? 'bg-green-900/10 border border-green-500/20' : 'bg-red-900/10 border border-red-500/20'}`}>
                 <h4 className={`text-xl font-bold mb-3 font-mono uppercase tracking-wider ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>{isCorrect ? 'Correct Analysis' : 'Incorrect Strategy'}</h4>
                 <p className="text-gray-300 text-lg mb-8 leading-relaxed">{lesson.content.quiz_options?.[quizSelected!].feedback}</p>
                 {isCorrect ? (
                   <button onClick={onComplete} className="flex items-center justify-center w-full gap-2 px-6 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition font-mono uppercase tracking-widest">Complete Lesson <ChevronRight size={20} /></button>
                 ) : (
                   <button onClick={() => { setQuizSubmitted(false); setQuizSelected(null); }} className="w-full py-4 text-gray-400 hover:text-white border border-white/10 hover:bg-white/5 rounded-xl transition font-mono uppercase tracking-widest">Try Again</button>
                 )}
               </div>
             )}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-20 pt-10 border-t border-white/5 text-center">
            <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">Insight Mind Academy v1.0.0 • All Rights Reserved</p>
        </div>
      </div>

      {/* 3. AI LESSON COACH (Floating Action Button & Popup) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end" ref={coachPanelRef}>
        
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
                <h3 className="text-sm font-bold text-white">Insight AI Coach</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">v1.0.0 CONNECTED</p>
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
                placeholder="Ask me anything about this lesson..."
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
          className={`w-14 h-14 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 border border-white/10
            ${isCoachOpen ? 'bg-[#222] text-white rotate-90' : `${themeBg} text-white`}`}
        >
          {isCoachOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </button>
      </div>

    </div>
  );
};

export default LessonView;
