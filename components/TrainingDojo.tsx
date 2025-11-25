
import React, { useState, useEffect, useRef } from 'react';
import { AppMode, Message, GeminiResponse, CourseType } from '../types';
import { Send, Mic, Smile, MoreHorizontal, ArrowLeft, BarChart2, AlertTriangle, Lightbulb, User, Bot, Zap, Skull, ShieldAlert } from 'lucide-react';
import { callGeminiAPI, generateTacticContent, INITIAL_MESSAGES, resetTrust } from '../constants';

interface TrainingDojoProps {
  mode: string; // Accepts string to handle 'RED_DOOR' | 'BLUE_DOOR' mapping easily
  onExit: () => void;
  onFinish: (msgs: Message[]) => void;
}

const TrainingDojo: React.FC<TrainingDojoProps> = ({ mode, onExit, onFinish }) => {
  const isRed = mode === 'RED_DOOR';
  const courseType = isRed ? CourseType.RED : CourseType.BLUE;
  
  // Theme Config
  const themeColor = isRed ? 'text-rose-400' : 'text-cyan-400';
  const themeBg = isRed ? 'bg-rose-500' : 'bg-cyan-500';
  const themeBorder = isRed ? 'border-rose-500/30' : 'border-cyan-500/30';
  const themeGradient = isRed ? 'from-rose-600 to-pink-700' : 'from-cyan-600 to-blue-700';
  const bubbleUserGradient = isRed ? 'from-rose-600 to-rose-700' : 'from-cyan-600 to-cyan-700';

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isGeneratingTactic, setIsGeneratingTactic] = useState(false);
  
  // HUD State
  const [trustLevel, setTrustLevel] = useState(50); // HP Bar
  const [isGameOver, setIsGameOver] = useState(false);

  // Button States
  const [isMicActive, setIsMicActive] = useState(false);
  const [showEmojiToast, setShowEmojiToast] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [currentAnalysis, setCurrentAnalysis] = useState<GeminiResponse['analysis']>({
    score: 50,
    trustLevel: 50,
    coach_comment: "等待对局开始...",
    suggestion: "请回忆上一章学到的核心理论。",
    suggested_reply_options: isRed ? ["曲解意图", "推拉技巧", "反向筛选"] : ["利益锚定", "风险转嫁", "数据支撑"],
    sentiment_tag: "实战考核中"
  });

  // Init
  useEffect(() => {
    resetTrust();
    setMessages(INITIAL_MESSAGES);
    setTrustLevel(50);
    setIsGameOver(false);
  }, [mode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Handle Tactic Click (Smart Compose)
  const handleTacticClick = async (tactic: string) => {
    setIsGeneratingTactic(true);
    setInputValue(""); // Clear current
    
    try {
      const response = await generateTacticContent(tactic);
      
      // Typewriter simulation
      const text = response.generatedText;
      let i = 0;
      const interval = setInterval(() => {
        setInputValue(text.substring(0, i + 1));
        i++;
        if (i === text.length) {
          clearInterval(interval);
          setIsGeneratingTactic(false);
          inputRef.current?.focus();
        }
      }, 20); 
    } catch (e) {
      setInputValue("系统生成失败，请重试"); 
      setIsGeneratingTactic(false);
    }
  };

  const handleSendMessage = async (text: string = inputValue) => {
    if (!text.trim() || isGameOver) return;

    // 1. User Message
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: text,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setIsTyping(true);

    // 2. API Call
    try {
      const result = await callGeminiAPI(text, courseType);
      
      // 3. Update HUD & HP
      setCurrentAnalysis(result.analysis);
      setTrustLevel(result.analysis.trustLevel);

      // 4. Check Game Over
      if (result.analysis.trustLevel <= 0) {
          setIsGameOver(true);
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            content: isRed ? "算了，没意思。" : "这个项目你不用跟了。",
            timestamp: Date.now(),
          }]);
          setIsTyping(false);
          return;
      }

      // 5. AI Reply
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: result.reply,
        timestamp: Date.now(),
      }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const insertEmoji = () => {
    const emojis = ["😂", "🤔", "🙄", "👍", "🤝", "🚩", "🐮", "🍺"];
    const random = emojis[Math.floor(Math.random() * emojis.length)];
    setInputValue(prev => prev + random);
    setShowEmojiToast(true);
    setTimeout(() => setShowEmojiToast(false), 1000);
  };

  return (
    <div className="flex h-screen w-full bg-[#080808] overflow-hidden font-sans text-white animate-fade-in relative z-20">
      
      {/* GAME OVER OVERLAY */}
      {isGameOver && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in">
              <div className="bg-[#1a1a1a] border border-red-500/30 p-8 rounded-3xl max-w-md text-center shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-600"></div>
                  <div className="mb-6 flex justify-center">
                      <div className="p-4 bg-red-500/10 rounded-full animate-pulse">
                        <Skull size={48} className="text-red-500" />
                      </div>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">考核失败</h2>
                  <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                     信任值归零。请返回课程重新学习理论知识。
                  </p>
                  <div className="flex gap-4 justify-center">
                      <button onClick={onExit} className="px-6 py-2.5 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition">
                          返回课程表
                      </button>
                      <button onClick={() => onFinish(messages)} className="px-6 py-2.5 border border-white/20 hover:bg-white/5 rounded-full transition text-gray-300">
                          分析死因
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* BACKGROUND ASSETS */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className={`absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] opacity-20 ${isRed ? 'bg-rose-600' : 'bg-cyan-600'} animate-pulse-slow`}></div>
        <div className={`absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] opacity-20 ${isRed ? 'bg-purple-600' : 'bg-blue-600'} animate-pulse-slow`} style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15"></div>
      </div>

      {/* ================= LEFT PANEL: CHAT STREAM (70%) ================= */}
      <div className="flex-1 flex flex-col relative z-10 border-r border-white/5 shadow-2xl">
        
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-black/40 backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <button onClick={onExit} className="p-2 hover:bg-white/10 rounded-full transition text-gray-400 hover:text-white active:scale-95">
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${themeGradient} shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
                 <Bot size={20} className="text-white drop-shadow-md" />
              </div>
              <div>
                <h2 className="font-bold text-sm tracking-wide text-white">
                  {isRed ? '模拟场景: 陌生社交' : '模拟场景: 商务谈判'}
                </h2>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isTyping ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></span>
                  <span className="text-xs text-gray-400 font-mono tracking-tight">
                    {isTyping ? '对方正在输入...' : '在线'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => onFinish(messages)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${themeBorder} ${themeColor} hover:bg-white/5 active:scale-95 flex items-center gap-2`}
          >
            结束考核
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-hide" ref={scrollRef}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex w-full animate-fade-in-up ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className="flex-shrink-0 mt-auto opacity-80">
                   {msg.sender === 'user' ? (
                     <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center border border-white/10">
                       <User size={14} className="text-gray-400" />
                     </div>
                   ) : (
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center border border-white/10 ${isRed ? 'bg-rose-950/50 text-rose-300' : 'bg-cyan-950/50 text-cyan-300'}`}>
                       <Bot size={14} />
                     </div>
                   )}
                </div>

                {/* Bubble */}
                <div 
                  className={`p-3.5 md:p-4 text-[15px] leading-relaxed shadow-lg backdrop-blur-md relative
                    ${msg.sender === 'user' 
                      ? `bg-gradient-to-br ${bubbleUserGradient} text-white rounded-2xl rounded-br-none border border-white/10` 
                      : 'bg-[#1a1a1a]/80 text-gray-200 border border-white/5 rounded-2xl rounded-bl-none'}`}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
             <div className="flex justify-start w-full animate-fade-in">
               <div className="flex items-center gap-3 max-w-[60%]">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center border border-white/10 ${isRed ? 'bg-rose-950/30' : 'bg-cyan-950/30'}`}>
                    <Bot size={14} className="opacity-50" />
                 </div>
                 <div className="bg-[#1a1a1a]/80 border border-white/5 px-4 py-3 rounded-2xl rounded-bl-none flex gap-1">
                   <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                   <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-75"></span>
                   <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                 </div>
               </div>
             </div>
          )}
          <div className="h-24"></div> 
        </div>

        {/* Floating Input Area */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl z-40">
           {showEmojiToast && (
             <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-1 rounded-full border border-white/10 animate-fade-in-up">
               表情已插入
             </div>
           )}

          <div className={`bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-[2rem] p-2 pl-4 flex items-center shadow-2xl ring-1 ${isGeneratingTactic ? 'ring-yellow-500/50' : 'ring-white/5'} transition-all duration-300`}>
             <button className="p-2 text-gray-400 hover:text-white transition rounded-full hover:bg-white/10 active:scale-95">
               <MoreHorizontal size={20} />
             </button>
             
             <div className="flex-1 relative">
                <input 
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={isGeneratingTactic ? "AI正在重组高情商话术..." : (isMicActive ? "正在倾听..." : "发送消息...")}
                  className={`w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-600 px-3 py-2 text-sm md:text-base transition-colors ${isGeneratingTactic ? 'text-yellow-400' : ''}`}
                  autoFocus
                  disabled={isGeneratingTactic || isGameOver}
                />
             </div>

             <div className="flex items-center gap-1 pr-1">
               <button 
                onClick={insertEmoji}
                className="p-2 text-gray-400 hover:text-yellow-400 transition rounded-full hover:bg-white/10 active:scale-90"
               >
                 <Smile size={20} />
               </button>
               <button 
                onClick={() => setIsMicActive(!isMicActive)}
                className={`p-2 transition rounded-full hover:bg-white/10 active:scale-90 ${isMicActive ? 'text-red-500 animate-pulse bg-red-900/20' : 'text-gray-400 hover:text-white'}`}
               >
                 <Mic size={20} />
               </button>
               <button 
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isGameOver}
                  className={`p-3 rounded-[1.5rem] transition-all flex items-center justify-center ml-1
                    ${inputValue.trim() 
                      ? `${themeBg} text-white shadow-[0_0_15px_rgba(0,0,0,0.3)] scale-100 hover:scale-105 active:scale-95` 
                      : 'bg-[#222] text-gray-600 scale-95 cursor-not-allowed'}`}
               >
                 <Send size={18} fill="currentColor" />
               </button>
             </div>
          </div>
        </div>
      </div>

      {/* ================= RIGHT PANEL: HUD (30%) ================= */}
      <div className="w-[320px] hidden md:flex flex-col border-l border-white/5 bg-[#050505]/80 backdrop-blur-2xl z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
        
        {/* HUD Header */}
        <div className="p-5 border-b border-white/10 bg-black/20 flex justify-between items-center">
           <h3 className="text-xs font-mono uppercase text-gray-500 tracking-widest flex items-center gap-2">
             <BarChart2 size={12} /> 实时战术分析
           </h3>
           <div className={`w-2 h-2 rounded-full ${isRed ? 'bg-rose-500' : 'bg-cyan-500'} animate-pulse`}></div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-8">
          
          {/* Module A: Trust Meter (HP Bar) */}
          <div>
            <div className="flex justify-between items-end mb-3">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert size={12} />
                {isRed ? "好感度 (HP)" : "信任值 (HP)"}
              </span>
              <span className={`text-3xl font-light tabular-nums ${
                trustLevel < 30 ? 'text-red-500 animate-pulse' : themeColor
              }`}>{trustLevel}%</span>
            </div>
            
            {/* Custom Progress Bar */}
            <div className="relative w-full h-3 bg-[#111] rounded-full overflow-hidden border border-white/5">
              <div 
                className={`h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden ${
                    trustLevel < 30 ? 'bg-red-600' : themeBg
                }`} 
                style={{ width: `${trustLevel}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            {trustLevel < 30 && (
                <p className="text-[10px] text-red-500 mt-2 font-mono uppercase blink">警告：即将谈崩 / WARNING: CRITICAL</p>
            )}
          </div>

          {/* Module B: Toxic Comment */}
          <div className="relative group perspective-1000">
             <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-700"></div>
             <div className="relative bg-[#0f0f0f] border border-red-500/10 rounded-xl p-5 shadow-xl">
                <div className="flex items-center gap-2 mb-3 text-orange-500">
                  <AlertTriangle size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">影子教练点评</span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed font-light italic border-l-2 border-red-500/30 pl-3">
                  "{currentAnalysis.coach_comment}"
                </p>
                
                {currentAnalysis.sentiment_tag && (
                  <div className="mt-4 flex">
                     <span className="inline-flex items-center px-2 py-1 rounded text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wide font-bold">
                       状态: {currentAnalysis.sentiment_tag}
                     </span>
                  </div>
                )}
             </div>
          </div>

          {/* Module C: Suggestions */}
          <div>
             <div className="flex items-center gap-2 mb-4 text-gray-400">
               <Lightbulb size={14} />
               <span className="text-[10px] font-bold uppercase tracking-widest">AI 战术支援</span>
             </div>
             
             <div className="mb-5 text-xs text-gray-500 leading-relaxed">
               建议策略: <span className="text-gray-300">{currentAnalysis.suggestion}</span>
             </div>

             {/* Smart Compose Chips */}
             <div className="space-y-2.5">
               {currentAnalysis.suggested_reply_options?.map((option, idx) => (
                 <button
                   key={idx}
                   onClick={() => handleTacticClick(option)}
                   disabled={isGeneratingTactic || isGameOver}
                   className={`w-full relative overflow-hidden text-left p-3.5 rounded-xl bg-[#111] hover:bg-[#161616] border border-white/5 hover:border-white/10 transition-all text-xs text-gray-300 flex items-center justify-between group active:scale-[0.98] ${isGeneratingTactic ? 'opacity-50 cursor-wait' : ''}`}
                 >
                   <div className="flex items-center gap-3 relative z-10">
                     <div className={`w-1.5 h-1.5 rounded-full ${themeBg} group-hover:scale-150 transition-transform`}></div>
                     <span className="font-medium">{option}</span>
                   </div>
                   <Zap size={14} className={`relative z-10 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 ${themeColor}`} />
                   
                   <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-r ${themeGradient}`}></div>
                 </button>
               ))}
             </div>
             <p className="text-[10px] text-gray-600 mt-3 text-center">
               点击上方战术卡片，AI将为您生成高情商回复
             </p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default TrainingDojo;
