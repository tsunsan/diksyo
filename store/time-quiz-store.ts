import { create } from 'zustand';

type FeedbackState = "idle" | "correct" | "incorrect" | "timeout";

interface TimeQuizResult {
  id: number;
  correct: boolean;
  timeBonus: boolean;
}

interface TimeQuizState {
  currentIndex: number;
  feedback: FeedbackState;
  totalXP: number;
  streak: number;
  maxStreak: number;
  results: TimeQuizResult[];
  quizDone: boolean;
  hasSubmittedOnce: boolean;
  
  setCurrentIndex: (index: number | ((prev: number) => number)) => void;
  setFeedback: (feedback: FeedbackState) => void;
  setTotalXP: (xp: number | ((prev: number) => number)) => void;
  setStreak: (streak: number | ((prev: number) => number)) => void;
  setMaxStreak: (maxStreak: number | ((prev: number) => number)) => void;
  setResults: (results: TimeQuizResult[] | ((prev: TimeQuizResult[]) => TimeQuizResult[])) => void;
  setQuizDone: (done: boolean) => void;
  setHasSubmittedOnce: (hasSubmitted: boolean) => void;
  resetQuiz: () => void;
}

export const useTimeQuizStore = create<TimeQuizState>((set) => ({
  currentIndex: 0,
  feedback: "idle",
  totalXP: 0,
  streak: 0,
  maxStreak: 0,
  results: [],
  quizDone: false,
  hasSubmittedOnce: false,

  setCurrentIndex: (index) => set((state) => ({ currentIndex: typeof index === 'function' ? index(state.currentIndex) : index })),
  setFeedback: (feedback) => set({ feedback }),
  setTotalXP: (xp) => set((state) => ({ totalXP: typeof xp === 'function' ? xp(state.totalXP) : xp })),
  setStreak: (streak) => set((state) => ({ streak: typeof streak === 'function' ? streak(state.streak) : streak })),
  setMaxStreak: (maxStreak) => set((state) => ({ maxStreak: typeof maxStreak === 'function' ? maxStreak(state.maxStreak) : maxStreak })),
  setResults: (results) => set((state) => ({ results: typeof results === 'function' ? results(state.results) : results })),
  setQuizDone: (done) => set({ quizDone: done }),
  setHasSubmittedOnce: (hasSubmitted) => set({ hasSubmittedOnce: hasSubmitted }),
  resetQuiz: () => set({
    currentIndex: 0,
    feedback: "idle",
    totalXP: 0,
    streak: 0,
    maxStreak: 0,
    results: [],
    quizDone: false,
    hasSubmittedOnce: false,
  }),
}));
