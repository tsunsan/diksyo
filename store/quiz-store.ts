import { create } from 'zustand';
import { calculateNextReview, FSRSGrade } from '@/lib/fsrs-logic';

export type QuizWord = {
    id: string;
    word: string;
    englishPrompt: string;
    rootWord?: string;
    partOfSpeech: string;
    // Adding optional FSRS properties so we can track them in state
    fsrsData?: any;
};

interface QuizState {
    deck: QuizWord[];
    currentIndex: number;
    status: 'idle' | 'typing' | 'revealed' | 'completed';
    correctCount: number;

    startQuiz: (words: QuizWord[]) => void;
    submitAnswer: (userTyped: string) => boolean;
    gradeAnswer: (rating: FSRSGrade) => void; // NEW ACTION
    resetQuiz: () => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
    deck: [],
    currentIndex: 0,
    status: 'idle',
    correctCount: 0,

    startQuiz: (words) => set({ deck: words, currentIndex: 0, status: 'typing', correctCount: 0 }),

    submitAnswer: (userTyped) => {
        const currentWord = get().deck[get().currentIndex];
        const isCorrect = userTyped.trim().toLowerCase() === currentWord.word.toLowerCase();
        set((state) => ({
            status: 'revealed',
            correctCount: isCorrect ? state.correctCount + 1 : state.correctCount,
        }));
        return isCorrect;
    },

    // NEW: The FSRS Integration
    gradeAnswer: (rating) => {
        const state = get();
        const currentWord = state.deck[state.currentIndex];

        // 1. Calculate the new review date and stats
        const newFsrsStats = calculateNextReview(rating, currentWord.fsrsData);

        // TODO: Eventually, we will trigger a Supabase DB update right here!
        console.log(`[Database Sync] Word: ${currentWord.word} | Next Review: ${newFsrsStats.nextReviewDate}`);

        // 2. Move to the next card
        const nextIndex = state.currentIndex + 1;
        const isDone = nextIndex >= state.deck.length;

        set({
            currentIndex: nextIndex,
            status: isDone ? 'completed' : 'typing',
        });
    },

    resetQuiz: () => set({ deck: [], currentIndex: 0, status: 'idle', correctCount: 0 }),
}));