'use client';

import { useState } from 'react';
import { useQuizStore } from '@/store/quiz-store';

export default function QuizEngine() {
    const { deck, currentIndex, status, autoGradeResult, submitAnswer, nextCard } = useQuizStore();
    const [input, setInput] = useState('');
    const [isFeedbackCorrect, setIsFeedbackCorrect] = useState<boolean | null>(null);

    if (deck.length === 0) return <div className="font-bold text-2xl">No words due today! 🔥</div>;
    if (status === 'completed') return <div className="font-bold text-2xl">Quiz Complete! XP Gained!</div>;

    const currentWord = deck[currentIndex];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (status !== 'typing' || !input.trim()) return;

        // submitAnswer now automatically handles the FSRS calculation based on time
        const correct = submitAnswer(input);
        setIsFeedbackCorrect(correct);
    };

    const handleNext = () => {
        nextCard();
        setInput('');
        setIsFeedbackCorrect(null);
    };

    return (
        <div className="max-w-md mx-auto p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">

            {/* Top Bar: Progress & Part of Speech */}
            <div className="mb-6 flex items-center justify-between font-bold">
                <span className="bg-black text-white px-3 py-1">
                  {currentIndex + 1} / {deck.length}
                </span>
                <span className="uppercase text-sm border-2 border-black px-2 py-1 bg-purple-200">
                  {currentWord.partOfSpeech}
                </span>
            </div>

            {/* The Prompt */}
            <div className="text-center my-8">
                <h2 className="text-4xl font-black mb-2">{currentWord.englishPrompt}</h2>
                <p className="text-gray-600 font-bold uppercase tracking-widest text-sm">Type the Filipino translation</p>
            </div>

            {/* Typing Mode Input */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={status === 'revealed'}
                    className={`border-4 border-black p-4 text-2xl font-black focus:outline-none focus:ring-0 text-center uppercase ${
                        status === 'revealed'
                            ? isFeedbackCorrect
                                ? 'bg-green-400'
                                : 'bg-red-400'
                            : 'bg-gray-100'
                    }`}
                    placeholder="ENTER WORD..."
                    autoFocus
                />

                {status === 'typing' && (
                    <button
                        type="submit"
                        className="w-full border-4 border-black bg-yellow-400 hover:bg-yellow-500 py-3 font-black text-xl transition-transform active:translate-y-1"
                    >
                        SUBMIT
                    </button>
                )}
            </form>

            {/* The Reveal: Root Word & Next Button */}
            {status === 'revealed' && (
                <div className="mt-6 border-t-4 border-black pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="text-center mb-4">
                        <span className="text-lg font-bold">Root Word: </span>
                        <span className="text-2xl font-black underline">{currentWord.rootWord || currentWord.word}</span>
                    </div>

                    {/* Show the user how the system graded them based on their speed */}
                    <div className="text-center mb-6 text-sm font-bold text-gray-500">
                        AUTO-SCORE: <span className={`uppercase ${
                        autoGradeResult === 'again' ? 'text-red-600' :
                            autoGradeResult === 'easy' ? 'text-green-600' :
                                autoGradeResult === 'good' ? 'text-blue-600' : 'text-orange-600'
                    }`}>{autoGradeResult}</span>
                    </div>

                    <button
                        onClick={handleNext}
                        autoFocus
                        className="w-full border-4 border-black bg-white hover:bg-gray-100 py-3 font-black text-xl transition-transform active:translate-y-1"
                    >
                        NEXT WORD ➔
                    </button>
                </div>
            )}
        </div>
    );
}