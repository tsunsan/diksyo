import { create } from 'zustand';

export type QuizWord = {
    id: string;
    word: string;
    englishPrompt: string;
    rootWord?: string;
    partOfSpeech: string;
    fsrsData?: any;
    usageExamples?: { sentence: string; translation: string }[];
    level?: string;
    xp?: number;
    answer?: string;
    acceptedAnswers?: string[];
    hint?: string;
    rootDefinition?: string;
    example?: string;
};

interface QuizState {
    deck: QuizWord[];
    currentIndex: number;
    status: 'idle' | 'typing' | 'revealed' | 'completed';
    correctCount: number;
    questionStartTime: number;
    quizStartTime: number;

    startQuiz: (words: QuizWord[]) => void;
    applyAnswerResult: (isCorrect: boolean) => void;
    nextCard: () => void;
    resetQuiz: () => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
    deck: [],
    currentIndex: 0,
    status: 'idle',
    correctCount: 0,
    questionStartTime: 0,
    quizStartTime: 0,

    startQuiz: (words) => set({
        deck: words,
        currentIndex: 0,
        status: 'typing',
        correctCount: 0,
        questionStartTime: Date.now(),
        quizStartTime: Date.now()
    }),

    applyAnswerResult: (isCorrect) => set((state) => ({
        status: 'revealed',
        correctCount: isCorrect ? state.correctCount + 1 : state.correctCount
    })),

    nextCard: () => {
        const state = get();
        const nextIndex = state.currentIndex + 1;
        const isDone = nextIndex >= state.deck.length;

        set({
            currentIndex: nextIndex,
            status: isDone ? 'completed' : 'typing',
            questionStartTime: Date.now()
        });
    },

    resetQuiz: () => set({ deck: [], currentIndex: 0, status: 'idle', correctCount: 0, questionStartTime: 0, quizStartTime: 0 }),
}));