'use client';

import { useState } from 'react';
import { useQuizStore } from '@/store/quiz-store';
import { FSRSGrade } from '@/lib/fsrs-logic'; // 1. Import the grade type

export default function QuizEngine() {
    // 2. Pull gradeAnswer instead of nextCard
    const { deck, currentIndex, status, submitAnswer, gradeAnswer } = useQuizStore();
    const [input, setInput] = useState('');
    const [isFeedbackCorrect, setIsFeedbackCorrect] = useState<boolean | null>(null);

    // Fallbacks for empty or completed states
    if (deck.length === 0) return <div className="font-bold text-2xl">No words due today! 🔥</div>;
    if (status === 'completed') return <div className="font-bold text-2xl">Quiz Complete! XP Gained!</div>;

    const currentWord = deck[currentIndex];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (status !== 'typing' || !input.trim()) return;

        // Checks the answer in our Zustand store
        const correct = submitAnswer(input);
        setIsFeedbackCorrect(correct);
    };

    // 3. Update the parameter type and use the new action
    const handleGrade = (rating: FSRSGrade) => {
        // Send the rating to the Brain! It calculates the next review date AND moves to the next card.
        gradeAnswer(rating);

        // Reset local UI state for the next card
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

            {/* The Reveal & FSRS Controls */}
            {status === 'revealed' && (
                <div className="mt-6 border-t-4 border-black pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="text-center mb-6">
                        <span className="text-lg font-bold">Root Word: </span>
                        <span className="text-2xl font-black underline">{currentWord.rootWord || currentWord.word}</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        <button onClick={() => handleGrade('again')} className="border-2 border-black bg-gray-200 py-2 font-bold hover:bg-gray-300 active:translate-y-1">Again</button>
                        <button onClick={() => handleGrade('hard')} className="border-2 border-black bg-red-200 py-2 font-bold hover:bg-red-300 active:translate-y-1">Hard</button>
                        <button onClick={() => handleGrade('good')} className="border-2 border-black bg-blue-200 py-2 font-bold hover:bg-blue-300 active:translate-y-1">Good</button>
                        <button onClick={() => handleGrade('easy')} className="border-2 border-black bg-green-200 py-2 font-bold hover:bg-green-300 active:translate-y-1">Easy</button>
                    </div>
                </div>
            )}
        </div>
    );
}