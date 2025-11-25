
import React, { useState } from 'react';
import ParticleCore from './components/ParticleCore';
import Dashboard from './components/Dashboard';
import LessonView from './components/LessonView';
import TrainingDojo from './components/TrainingDojo';
import ReviewPanel from './components/ReviewPanel';
import { AppMode, Message, SessionReport, Lesson, CourseType, LessonType } from './types';
import { generateSessionReport } from './constants';

const App: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>(AppMode.DASHBOARD);
  const [activeCourseType, setActiveCourseType] = useState<CourseType>(CourseType.RED);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [sessionReport, setSessionReport] = useState<SessionReport | null>(null);
  
  // State to track completed lesson IDs for unlocking logic
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  // 1. User Selects a Lesson from Dashboard
  const handleSelectLesson = (lesson: Lesson, courseType: CourseType) => {
    setCurrentLesson(lesson);
    setActiveCourseType(courseType);
    setAppMode(AppMode.LESSON);
  };

  // 2. User Completes a Theory/Quiz Lesson -> Back to Dashboard & Unlock Next
  const handleLessonComplete = (lessonId: string) => {
    setCompletedLessons(prev => {
      const newSet = new Set(prev);
      newSet.add(lessonId);
      return newSet;
    });
    setAppMode(AppMode.DASHBOARD);
    setCurrentLesson(null);
  };

  // 3. User Starts a Simulation (Boss Fight)
  const handleStartSimulation = () => {
    setAppMode(AppMode.SIMULATION);
  };

  // 4. User Finishes Simulation -> Review Screen
  const handleFinishSimulation = async (messages: Message[]) => {
    // If it was a boss fight, mark the current lesson as complete upon finishing
    if (currentLesson) {
       setCompletedLessons(prev => {
        const newSet = new Set(prev);
        newSet.add(currentLesson.id);
        return newSet;
      });
    }

    setAppMode(AppMode.REVIEW);
    setSessionReport(null);
    const report = await generateSessionReport(messages, activeCourseType);
    setSessionReport(report);
  };

  const handleExitToDashboard = () => {
    setAppMode(AppMode.DASHBOARD);
    setCurrentLesson(null);
  };

  return (
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden font-sans selection:bg-white/20 text-white">
      
      {/* Background: Visible on Dashboard and Review. Hidden during focus modes. */}
      {(appMode === AppMode.DASHBOARD || appMode === AppMode.REVIEW) && (
         <ParticleCore mode={activeCourseType === CourseType.RED ? 'RED_DOOR' : 'BLUE_DOOR'} onSwitchMode={() => {}} />
      )}

      <div className="relative z-10 w-full h-full">
        
        {appMode === AppMode.DASHBOARD && (
          <Dashboard 
            onSelectLesson={handleSelectLesson} 
            completedLessons={completedLessons}
          />
        )}

        {appMode === AppMode.LESSON && currentLesson && (
          <LessonView 
            lesson={currentLesson} 
            courseType={activeCourseType}
            onBack={handleExitToDashboard}
            onComplete={() => handleLessonComplete(currentLesson.id)}
            onStartSimulation={handleStartSimulation}
          />
        )}

        {appMode === AppMode.SIMULATION && (
          <TrainingDojo 
            mode={activeCourseType === CourseType.RED ? 'RED_DOOR' : 'BLUE_DOOR'}
            onExit={() => setAppMode(AppMode.LESSON)} // Back to briefing
            onFinish={handleFinishSimulation}
          />
        )}

        {appMode === AppMode.REVIEW && (
          <ReviewPanel 
            report={sessionReport}
            lastMode={activeCourseType === CourseType.RED ? 'RED_DOOR' : 'BLUE_DOOR'} 
            onRestart={handleExitToDashboard} 
          />
        )}
      </div>

      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
    </div>
  );
};

export default App;
