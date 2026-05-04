'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuizStore } from '@/store/quiz-store';

export default function QuizEngine() {
    const { deck, currentIndex, status, autoGradeResult, submitAnswer, nextCard } = useQuizStore();
    const [input, setInput] = useState('');
    const [isFeedbackCorrect, setIsFeedbackCorrect] = useState<boolean | null>(null);

    // Track if the user has learned the hotkey
    const [hasSubmittedOnce, setHasSubmittedOnce] = useState(false);

    // NEW: Reference to directly control the input DOM element
    const inputRef = useRef<HTMLInputElement>(null);

    // NEW: Force focus back to the input field whenever we switch to 'typing' mode
    useEffect(() => {
        if (status === 'typing' && inputRef.current) {
            inputRef.current.focus();
        }
    }, [status]);

    if (deck.length === 0) return <div className="font-bold text-2xl">No words due today! 🔥</div>;
    if (status === 'completed') return <div className="font-bold text-2xl">Quiz Complete! XP Gained!</div>;

    const currentWord = deck[currentIndex];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (status !== 'typing' || !input.trim()) return;

        // Hide the helper text for all future words in this session
        if (!hasSubmittedOnce) setHasSubmittedOnce(true);

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
                    ref={inputRef} // Connect the input to our useRef hook
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
                    autoFocus // Still useful for the very first load
                />

                {status === 'typing' && (
                    <div className="flex flex-col gap-3 mt-2">
                        {/* OPTION 1: Disappears after the user's first submission */}
                        {!hasSubmittedOnce && (
                            <div className="flex justify-center animate-in fade-in duration-500">
                                <span className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase text-gray-400">
                                    Press <kbd className="border-2 border-gray-300 bg-gray-100 px-2 py-1 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">ENTER</kbd> to submit
                                </span>
                            </div>
                        )}

                        {/* OPTION 2: Permanent embedded hotkey in the button */}
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-3 border-4 border-black bg-yellow-400 hover:bg-yellow-500 py-3 font-black text-xl transition-transform active:translate-y-1"
                        >
                            <span>SUBMIT</span>
                            <kbd className="font-sans text-xs sm:text-sm font-bold bg-white text-black px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                ENTER ↵
                            </kbd>
                        </button>
                    </div>
                )}
            </form>

            {/* The Reveal: Root Word & Next Button */}
            {status === 'revealed' && (
                <div className="mt-6 border-t-4 border-black pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="text-center mb-4">
                        <span className="text-lg font-bold">Root Word: </span>
                        <span className="text-2xl font-black underline">{currentWord.rootWord || currentWord.word}</span>
                    </div>

                    <div className="text-center mb-6 text-sm font-bold text-gray-500">
                        AUTO-SCORE: <span className={`uppercase ${
                        autoGradeResult === 'again' ? 'text-red-600' :
                            autoGradeResult === 'easy' ? 'text-green-600' :
                                autoGradeResult === 'good' ? 'text-blue-600' : 'text-orange-600'
                    }`}>{autoGradeResult}</span>
                    </div>

                    <button
                        onClick={handleNext}
                        autoFocus // Automatically focuses the "NEXT WORD" button when it appears
                        className="w-full border-4 border-black bg-white hover:bg-gray-100 py-3 font-black text-xl transition-transform active:translate-y-1"
                    >
                        NEXT WORD ➔
                    </button>
                </div>
            )}
        </div>
    );
}