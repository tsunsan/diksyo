import { create } from 'zustand';
import { calculateNextReview, FSRSGrade } from '@/lib/fsrs-logic';

export type QuizWord = {
    id: string;
    word: string;
    englishPrompt: string;
    rootWord?: string;
    partOfSpeech: string;
    fsrsData?: any;
    usageExamples?: { sentence: string; translation: string }[];
};

interface QuizState {
    deck: QuizWord[];
    currentIndex: number;
    status: 'idle' | 'typing' | 'revealed' | 'completed';
    correctCount: number;

    // NEW: Timer and Auto-Grade states
    questionStartTime: number;
    autoGradeResult: FSRSGrade | null;

    startQuiz: (words: QuizWord[]) => void;
    submitAnswer: (userTyped: string) => boolean;
    nextCard: () => void; // Replaces manual gradeAnswer
    resetQuiz: () => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
    deck: [],
    currentIndex: 0,
    status: 'idle',
    correctCount: 0,
    questionStartTime: 0,
    autoGradeResult: null,

    startQuiz: (words) => set({
        deck: words,
        currentIndex: 0,
        status: 'typing',
        correctCount: 0,
        questionStartTime: Date.now(), // Start the timer!
        autoGradeResult: null
    }),

    submitAnswer: (userTyped) => {
        const state = get();
        const currentWord = state.deck[state.currentIndex];

        // 1. Check Correctness
        const isCorrect = userTyped.trim().toLowerCase() === currentWord.word.toLowerCase();

        // 2. Calculate Time Taken (in milliseconds)
        const timeTakenMs = Date.now() - state.questionStartTime;

        // 3. Auto-Grade Logic
        let calculatedGrade: FSRSGrade = 'again'; // Default to 'again' if wrong

        if (isCorrect) {
            if (timeTakenMs < 3000) calculatedGrade = 'easy';           // < 3 seconds
            else if (timeTakenMs < 8000) calculatedGrade = 'good';      // 3 to 8 seconds
            else calculatedGrade = 'hard';                              // > 8 seconds
        }

        // 4. Process FSRS Instantly
        const newFsrsStats = calculateNextReview(calculatedGrade, currentWord.fsrsData);

        // TODO: Trigger Supabase DB update here using newFsrsStats
        console.log(`[DB Sync] Word: ${currentWord.word} | Time: ${timeTakenMs}ms | Grade: ${calculatedGrade} | Next: ${newFsrsStats.nextReviewDate}`);

        set((state) => ({
            status: 'revealed',
            correctCount: isCorrect ? state.correctCount + 1 : state.correctCount,
            autoGradeResult: calculatedGrade // Save so UI can show them how they did
        }));

        return isCorrect;
    },

    nextCard: () => {
        const state = get();
        const nextIndex = state.currentIndex + 1;
        const isDone = nextIndex >= state.deck.length;

        set({
            currentIndex: nextIndex,
            status: isDone ? 'completed' : 'typing',
            questionStartTime: Date.now(), // Reset timer for the next word
            autoGradeResult: null
        });
    },

    resetQuiz: () => set({ deck: [], currentIndex: 0, status: 'idle', correctCount: 0, questionStartTime: 0, autoGradeResult: null }),
}));