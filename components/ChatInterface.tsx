
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, AppLanguage, UserLevel } from '../types';
import { chatWithTutor, analyzeConversation } from '../services/geminiService';

interface ChatInterfaceProps {
  language: AppLanguage;
  level: UserLevel;
  onExperienceGain: (amount: number) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ language, level, onExperienceGain }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Parallelize analysis and response for better UX
      const [response, analysis] = await Promise.all([
        chatWithTutor(messages.map(m => ({ role: m.role, text: m.text })), input, language, level),
        analyzeConversation(input, language)
      ]);

      const modelMessage: ChatMessage = {
        role: 'model',
        text: response,
        timestamp: Date.now(),
        grammarCorrection: analysis.includes("Excellent") ? undefined : analysis
      };

      setMessages(prev => [...prev, modelMessage]);
      onExperienceGain(10);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
      <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            🤖
          </div>
          <div>
            <h3 className="font-bold">Lingo Tutor</h3>
            <p className="text-xs text-indigo-100">Always online</p>
          </div>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50"
      >
        {messages.length === 0 && (
          <div className="text-center py-10">
            <div className="text-4xl mb-4">👋</div>
            <h4 className="font-bold text-slate-800">Ready to practice?</h4>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              Say hello in {language} and I'll help you practice your conversation skills.
            </p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={msg.timestamp + i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
            }`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
            </div>
            {msg.grammarCorrection && (
              <div className="mt-2 ml-2 bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-xs text-yellow-800 italic max-w-[80%]">
                💡 {msg.grammarCorrection}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 italic text-xs ml-2">
            <span className="animate-bounce">●</span>
            <span className="animate-bounce delay-100">●</span>
            <span className="animate-bounce delay-200">●</span>
            Lingo is thinking...
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Type in ${language}...`}
            className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500 transition-all outline-none"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-indigo-600 text-white rounded-xl px-6 py-3 font-bold text-sm hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
