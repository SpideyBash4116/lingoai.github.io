
import { AppLanguage, UserLevel, ProgressState } from './types';

export const LANGUAGES = [
  { id: AppLanguage.SPANISH, flag: '🇪🇸', native: 'Español' },
  { id: AppLanguage.FRENCH, flag: '🇫🇷', native: 'Français' },
  { id: AppLanguage.GERMAN, flag: '🇩🇪', native: 'Deutsch' },
  { id: AppLanguage.JAPANESE, flag: '🇯🇵', native: '日本語' },
  { id: AppLanguage.CHINESE, flag: '🇨🇳', native: '中文' },
];

const INITIAL_HISTORY = [
  { day: 'Mon', xp: 40 },
  { day: 'Tue', xp: 120 },
  { day: 'Wed', xp: 90 },
  { day: 'Thu', xp: 210 },
  { day: 'Fri', xp: 150 },
  { day: 'Sat', xp: 0 },
  { day: 'Sun', xp: 0 },
];

export const INITIAL_PROGRESS: ProgressState = {
  language: AppLanguage.SPANISH,
  level: UserLevel.BEGINNER,
  experience: 450,
  streak: 3,
  masteredVocabulary: [],
  completedLessons: [],
  activityHistory: INITIAL_HISTORY,
  lastStudyDate: new Date().toLocaleDateString(),
};

export const SYSTEM_PROMPTS = {
  CHAT_TUTOR: (lang: string, level: string) => `
    You are a friendly language tutor named Lingo. Your goal is to help a ${level} student practice ${lang}.
    1. Respond in ${lang} most of the time.
    2. If the user makes a grammatical mistake, gently correct them in English.
    3. Keep the conversation natural and encouraging.
  `,
  VOCAB_GEN: (lang: string, count: number) => `
    Generate ${count} essential vocabulary words for a ${lang} learner.
    Return JSON array: [{ "word": "...", "translation": "...", "example": "..." }]
  `,
  CHALLENGE_GEN: (lang: string, level: string) => `
    Generate a translation challenge for a ${level} student learning ${lang}.
    Return JSON: { "english": "...", "correct": "..." }
  `,
  LESSON_GEN: (lang: string, level: string, topic: string) => `
    Create a structured language lesson for ${lang} (${level} level) about "${topic}".
    Return a JSON object with:
    - title: A catchy title.
    - topic: The core concept.
    - steps: An array of 3 objects, each with 'type' (explanation, practice, quiz), 'content' (the text/info), 'question' (if quiz), 'correctAnswer' (if quiz/practice), 'options' (if quiz, array of 3 strings).
    Ensure the content is actually educational and challenging.
  `
};
