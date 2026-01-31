
import React, { useState, useEffect } from 'react';
import { AppLanguage, VocabularyWord } from '../types';
import { getVocabulary } from '../services/geminiService';

interface VocabSectionProps {
  language: AppLanguage;
  masteredWords: VocabularyWord[];
  onMasterWord: (word: VocabularyWord) => void;
}

const VocabSection: React.FC<VocabSectionProps> = ({ language, masteredWords, onMasterWord }) => {
  const [discovered, setDiscovered] = useState<VocabularyWord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNewWords = async () => {
    setIsLoading(true);
    try {
      const words = await getVocabulary(language, 3);
      const formattedWords = words.map((w: any, i: number) => ({
        ...w,
        id: `vocab-${Date.now()}-${i}`
      }));
      setDiscovered(formattedWords);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNewWords();
  }, [language]);

  const handleLearn = (word: VocabularyWord) => {
    onMasterWord(word);
    setDiscovered(prev => prev.filter(w => w.id !== word.id));
  };

  return (
    <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Learn Words</h2>
          <p className="text-xs text-slate-500">{masteredWords.length} words mastered</p>
        </div>
        <button
          onClick={fetchNewWords}
          disabled={isLoading}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isLoading ? '...' : 'New Batch'}
        </button>
      </div>

      <div className="space-y-3 overflow-y-auto max-h-[450px] pr-2 custom-scrollbar">
        {discovered.length === 0 && !isLoading && (
          <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm">
            Mastered all discovered words!<br/>Fetch more to continue.
          </div>
        )}
        
        {discovered.map((item) => (
          <div key={item.id} className="group bg-slate-50 border border-slate-100 rounded-2xl p-4 transition-all">
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-bold text-lg text-slate-900">{item.word}</h4>
              <button 
                onClick={() => handleLearn(item)}
                className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-full font-bold uppercase tracking-wider hover:bg-indigo-700 active:scale-95 transition-all"
              >
                Master +15XP
              </button>
            </div>
            <p className="text-sm text-slate-600 font-medium mb-2">{item.translation}</p>
            <div className="text-xs text-slate-400 italic">
              "{item.example}"
            </div>
          </div>
        ))}

        {masteredWords.length > 0 && (
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Recently Mastered</h3>
            <div className="flex flex-wrap gap-2">
              {masteredWords.slice(-5).reverse().map(w => (
                <span key={w.id} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-xs font-semibold border border-emerald-100 flex items-center gap-1">
                  ✓ {w.word}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default VocabSection;
