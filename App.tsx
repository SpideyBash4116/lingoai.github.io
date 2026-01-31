
import React, { useState, useEffect } from 'react';
import { ProgressState, AppLanguage, UserLevel, VocabularyWord, User, Lesson, LessonStep } from './types';
import { INITIAL_PROGRESS, LANGUAGES } from './constants.tsx';
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';
import VocabSection from './components/VocabSection';
import StatsPanel from './components/StatsPanel';
import { generateChallenge, generateLesson } from './services/geminiService';

declare global { interface Window { google: any; } }

const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch (e) { return null; }
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('lingo_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [progress, setProgress] = useState<ProgressState>(() => {
    const saved = localStorage.getItem('lingo_progress_v3');
    return saved ? JSON.parse(saved) : INITIAL_PROGRESS;
  });

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [lessonAnswer, setLessonAnswer] = useState('');
  const [lessonFeedback, setLessonFeedback] = useState<string | null>(null);
  const [isLangSelectorOpen, setIsLangSelectorOpen] = useState(false);
  const [activeChallenge, setActiveChallenge] = useState<{english: string, correct: string} | null>(null);
  const [challengeInput, setChallengeInput] = useState('');
  const [challengeFeedback, setChallengeFeedback] = useState<string | null>(null);
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);

  useEffect(() => {
    // If you have a real Client ID, replace this string.
    // If not, the "Guest" button is the intended path.
    const CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
    
    if (window.google && !user && CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com") {
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (res: any) => {
          const payload = decodeJwt(res.credential);
          if (payload) {
            const newUser = { id: payload.sub, name: payload.name, email: payload.email, picture: payload.picture };
            setUser(newUser);
            localStorage.setItem('lingo_user', JSON.stringify(newUser));
          }
        }
      });
      window.google.accounts.id.renderButton(document.getElementById("google-login-btn"), { theme: "outline", size: "large", width: 320, shape: "pill" });
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('lingo_progress_v3', JSON.stringify(progress));
  }, [progress]);

  const handleExperienceGain = (amount: number) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    setProgress(prev => ({
      ...prev,
      experience: prev.experience + amount,
      activityHistory: prev.activityHistory.map(d => d.day === today ? { ...d, xp: d.xp + amount } : d)
    }));
  };

  const startNewLesson = async (topic: string) => {
    setIsLoadingLesson(true);
    try {
      const lesson = await generateLesson(progress.language, progress.level, topic);
      setActiveLesson(lesson);
      setCurrentStepIdx(0);
      setLessonAnswer('');
      setLessonFeedback(null);
    } finally {
      setIsLoadingLesson(false);
    }
  };

  const handleNextStep = () => {
    if (!activeLesson) return;
    const step = activeLesson.steps[currentStepIdx];
    
    if (step.type === 'quiz' || step.type === 'practice') {
      const isCorrect = lessonAnswer.trim().toLowerCase() === step.correctAnswer?.trim().toLowerCase();
      if (!isCorrect) {
        setLessonFeedback(`Not quite! Try again.`);
        return;
      }
    }

    if (currentStepIdx < activeLesson.steps.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
      setLessonAnswer('');
      setLessonFeedback(null);
    } else {
      handleExperienceGain(100);
      setProgress(p => ({ ...p, completedLessons: [...p.completedLessons, activeLesson.id] }));
      setActiveLesson(null);
      alert("Lesson Complete! +100 XP");
    }
  };

  const calculateLevel = (xp: number) => Math.floor(xp / 1000) + 1;
  const currentLevel = calculateLevel(progress.experience);
  const levelProgress = (progress.experience % 1000) / 10;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white font-bold text-4xl mb-8 shadow-2xl animate-float">L</div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Stop playing, start <span className="text-indigo-600">learning.</span></h1>
        <p className="text-lg text-slate-500 max-w-md mb-12">The language app that actually challenges you with Gemini-powered situational lessons.</p>
        <div className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-xl w-full max-w-sm">
          <div id="google-login-btn" className="flex justify-center mb-6"></div>
          <button onClick={() => setUser({ id: 'guest', name: 'Guest Learner', email: '', picture: '' })}
            className="w-full py-4 px-6 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all shadow-lg">
            Start Learning as Guest
          </button>
          <p className="mt-4 text-[10px] text-slate-400 uppercase tracking-widest font-bold">No 401 errors here. Click above to begin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header language={progress.language} level={progress.level} experience={progress.experience} streak={progress.streak} user={user} onLogout={() => { setUser(null); localStorage.removeItem('lingo_user'); }} />

      {activeLesson && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-2xl w-full shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <span className="bg-indigo-100 text-indigo-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Step {currentStepIdx + 1} of {activeLesson.steps.length}</span>
              <button onClick={() => setActiveLesson(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{activeLesson.title}</h2>
            <div className="bg-slate-50 rounded-3xl p-6 mb-6 min-h-[200px] border border-slate-100">
              <p className="text-slate-700 text-lg leading-relaxed">{activeLesson.steps[currentStepIdx].content}</p>
              {activeLesson.steps[currentStepIdx].question && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <p className="font-bold text-slate-900 mb-4">{activeLesson.steps[currentStepIdx].question}</p>
                  {activeLesson.steps[currentStepIdx].options ? (
                    <div className="grid grid-cols-1 gap-3">
                      {activeLesson.steps[currentStepIdx].options.map(opt => (
                        <button key={opt} onClick={() => setLessonAnswer(opt)} 
                          className={`w-full p-4 rounded-2xl text-left font-medium transition-all border-2 ${lessonAnswer === opt ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input autoFocus className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-indigo-500 outline-none" placeholder="Your answer..." value={lessonAnswer} onChange={e => setLessonAnswer(e.target.value)} />
                  )}
                </div>
              )}
            </div>
            {lessonFeedback && <p className="text-orange-500 font-bold mb-4 text-center">{lessonFeedback}</p>}
            <button onClick={handleNextStep} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
              {currentStepIdx === activeLesson.steps.length - 1 ? 'Finish Lesson' : 'Continue'}
            </button>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-800">Learning Path</h2>
                <button onClick={() => setIsLangSelectorOpen(!isLangSelectorOpen)} className="text-indigo-600 font-semibold text-sm hover:underline">Change Lang</button>
              </div>
              <div className="space-y-3">
                {['Grammar Basics', 'Common Greetings', 'Ordering Food', 'Travel Vocabulary', 'Business Etiquette'].map(topic => (
                  <button key={topic} onClick={() => startNewLesson(topic)} disabled={isLoadingLesson}
                    className="w-full p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 rounded-2xl text-left transition-all group flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800 group-hover:text-indigo-900">{topic}</p>
                      <p className="text-xs text-slate-400">10-15 mins • 100 XP</p>
                    </div>
                    <span className="text-slate-300 group-hover:text-indigo-400">→</span>
                  </button>
                ))}
              </div>
            </div>
            <StatsPanel history={progress.activityHistory} />
            <VocabSection language={progress.language} masteredWords={progress.masteredVocabulary} onMasterWord={w => { handleExperienceGain(15); setProgress(p => ({ ...p, masteredVocabulary: [...p.masteredVocabulary, w] })); }} />
          </div>

          <div className="lg:col-span-8 space-y-8">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
              <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Next Step: Level {currentLevel + 1}</h2>
                <div className="bg-white/20 h-3 rounded-full overflow-hidden mb-2 backdrop-blur-sm"><div className="bg-white h-full transition-all duration-700" style={{ width: `${levelProgress}%` }} /></div>
                <p className="text-xs text-indigo-100 font-bold uppercase tracking-widest">{progress.experience} / {currentLevel * 1000} XP Earned</p>
              </div>
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            </div>

            <ChatInterface language={progress.language} level={progress.level} onExperienceGain={handleExperienceGain} />

            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><span>🏆</span> Recently Completed</h3>
              <div className="flex flex-wrap gap-4">
                {progress.completedLessons.length === 0 ? (
                  <p className="text-slate-400 italic text-sm">No lessons completed yet. Pick a topic to start!</p>
                ) : (
                  progress.completedLessons.map((lid, idx) => (
                    <div key={lid + idx} className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-5 py-2 rounded-2xl text-sm font-bold">
                      Lesson {idx + 1} Mastered
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
