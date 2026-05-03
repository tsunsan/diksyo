'use client';

import { useEffect } from 'react';
import QuizEngine from '@/components/quiz-engine';
import { useQuizStore } from '@/store/quiz-store';

// 1. The Dummy Data
const dummyDeck = [
    {
        id: '1',
        word: 'kain',
        englishPrompt: 'To eat',
        rootWord: 'kain',
        partOfSpeech: 'verb',
    },
    {
        id: '2',
        word: 'tumakbo',
        englishPrompt: 'Ran',
        rootWord: 'takbo',
        partOfSpeech: 'verb',
    },
    {
        id: '3',
        word: 'mabilis',
        englishPrompt: 'Fast',
        rootWord: 'bilis',
        partOfSpeech: 'adj',
    }
];

export default function QuizPage() {
    const { startQuiz, status } = useQuizStore();

    // 2. Load the dummy data into the Zustand store when the page mounts
    useEffect(() => {
        startQuiz(dummyDeck);
    }, [startQuiz]);

    return (
        <div className="min-h-screen bg-yellow-50 flex flex-col items-center justify-center p-4">
            <h1 className="text-5xl font-black uppercase mb-8 tracking-tighter drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                Daily Quest
            </h1>

            <div className="w-full max-w-2xl">
                {/* 3. Wait for the state to update before rendering the engine */}
                {status === 'idle' ? (
                    <p className="text-xl font-bold">Loading your deck...</p>
                ) : (
                    <QuizEngine />
                )}
            </div>
        </div>
    );
}