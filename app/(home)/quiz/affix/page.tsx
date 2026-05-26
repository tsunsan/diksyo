'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, ArrowRight, Check, X } from 'lucide-react';
import { useAffixStore } from '@/store/affix-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function AffixBuilderPage() {
  const store = useAffixStore();

  const handleZoneClick = (position: 'left' | 'right') => {
    if (store.selectedAffixId) {
      store.placeAffix(position);
    } else if (store.placedAffixes[position]) {
      store.removeAffix(position);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-black bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]">
      {/* Header */}
      <header className="w-full px-6 py-4 flex flex-col gap-4 bg-white border-b-4 border-black z-10 sticky top-0">
        <div className="flex items-center justify-between">
          <Link href="/quiz">
            <Button
              variant="default"
              size="icon"
              className="border-2 border-black rounded-none shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all bg-white text-black hover:bg-yellow-400"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-black text-2xl uppercase italic tracking-tighter text-center flex-1">
            Affix Builder
          </h1>
          <div className="w-[44px]"></div>
        </div>
        {/* Progress Bar */}
        <div className="w-full h-4 border-2 border-black bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-green-400 w-3/5 border-r-2 border-black transition-all"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-6 py-8 gap-8 max-w-5xl mx-auto w-full justify-center items-center">
        {/* Instruction */}
        <div className="w-full text-center mb-4">
          <h2 className="font-bold text-lg uppercase bg-white inline-block px-6 py-2 border-2 border-black shadow-[4px_4px_0_0_#000]">
            Build the word: "{store.targetMeaning}"
          </h2>
        </div>

        {/* Docking Area */}
        <section className="w-full max-w-2xl bg-white border-4 border-black p-8 shadow-[8px_8px_0_0_#000] flex flex-col items-center justify-center min-h-[300px] gap-6 relative">
          
          <div className="flex items-center justify-center gap-4 flex-wrap w-full">
            {/* Left Drop Zone */}
            <button
              onClick={() => handleZoneClick('left')}
              className={cn(
                "w-24 h-28 border-4 border-dashed flex items-center justify-center transition-all relative group",
                store.placedAffixes.left
                  ? `border-solid border-black ${store.placedAffixes.left.color} shadow-[4px_4px_0_0_#000]`
                  : store.selectedAffixId
                  ? "border-black bg-yellow-100 animate-pulse cursor-pointer"
                  : "border-gray-300 bg-gray-50 cursor-pointer hover:border-gray-400"
              )}
            >
              {store.placedAffixes.left ? (
                <span className="font-black text-2xl uppercase">{store.placedAffixes.left.text}</span>
              ) : (
                <Plus className={cn("w-8 h-8", store.selectedAffixId ? "text-black" : "text-gray-300")} />
              )}
              {store.placedAffixes.left && (
                <div className="absolute -top-3 -right-3 bg-red-400 border-2 border-black rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3 text-white" />
                </div>
              )}
            </button>

            {/* Root Word */}
            <div className="bg-white border-4 border-black px-8 py-6 shadow-[4px_4px_0_0_#000] z-10 flex items-center justify-center">
              <span className="font-black text-4xl uppercase tracking-wider">{store.rootWord}</span>
            </div>

            {/* Right Drop Zone */}
            <button
              onClick={() => handleZoneClick('right')}
              className={cn(
                "w-24 h-28 border-4 border-dashed flex items-center justify-center transition-all relative group",
                store.placedAffixes.right
                  ? `border-solid border-black ${store.placedAffixes.right.color} shadow-[4px_4px_0_0_#000]`
                  : store.selectedAffixId
                  ? "border-black bg-yellow-100 animate-pulse cursor-pointer"
                  : "border-gray-300 bg-gray-50 cursor-pointer hover:border-gray-400"
              )}
            >
              {store.placedAffixes.right ? (
                <span className="font-black text-2xl uppercase">{store.placedAffixes.right.text}</span>
              ) : (
                <Plus className={cn("w-8 h-8", store.selectedAffixId ? "text-black" : "text-gray-300")} />
              )}
              {store.placedAffixes.right && (
                <div className="absolute -top-3 -right-3 bg-red-400 border-2 border-black rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          </div>

          <p className="font-bold text-sm text-gray-500 uppercase mt-8 absolute bottom-4 right-4">
            Root: {store.rootMeaning}
          </p>
        </section>

        {/* Feedback Section (if checked) */}
        {store.hasChecked && (
          <div className={cn(
            "w-full max-w-2xl p-4 border-4 border-black font-black uppercase text-center text-xl shadow-[4px_4px_0_0_#000] flex items-center justify-center gap-2",
            store.isCorrect ? "bg-green-400" : "bg-red-400 text-white"
          )}>
            {store.isCorrect ? (
              <>
                <Check className="w-6 h-6" /> Correct! Tumpak!
              </>
            ) : (
              <>
                <X className="w-6 h-6" /> Not quite right. Try again.
              </>
            )}
          </div>
        )}

        {/* Affix Tray */}
        <section className="w-full max-w-3xl mt-auto lg:mt-8">
          <div className="bg-black text-white border-2 border-black px-4 py-2 font-bold uppercase text-center shadow-[4px_4px_0_0_#000] mb-4 transform -rotate-1 origin-bottom-left w-fit mx-auto text-sm">
            Select an Affix
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white border-4 border-black shadow-[8px_8px_0_0_#000]">
            {store.availableAffixes.map((affix) => {
              const isSelected = store.selectedAffixId === affix.id;
              const isPlaced = store.placedAffixes.left?.id === affix.id || store.placedAffixes.right?.id === affix.id;
              
              if (isPlaced) {
                return (
                  <div key={affix.id} className="h-24 border-4 border-dashed border-gray-300 bg-gray-50 opacity-50 flex items-center justify-center">
                    <span className="font-black text-xl text-gray-400 uppercase">{affix.text}</span>
                  </div>
                );
              }

              return (
                <button
                  key={affix.id}
                  onClick={() => store.selectAffix(affix.id)}
                  className={cn(
                    "border-4 border-black p-4 shadow-[4px_4px_0_0_#000] flex items-center justify-center h-24 relative group cursor-pointer transition-all",
                    affix.color,
                    isSelected ? "translate-x-[2px] translate-y-[2px] shadow-none ring-4 ring-black ring-offset-2" : "hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000]"
                  )}
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  <span className="font-black text-2xl text-black uppercase relative z-10">
                    {affix.text}
                  </span>
                  <span className="absolute top-1 left-1 bg-white border-2 border-black px-1 text-[10px] font-black uppercase">
                    {affix.type}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Action Area */}
        <div className="w-full flex justify-end mt-4 mb-8">
          <Button
            onClick={store.hasChecked && store.isCorrect ? store.reset : store.checkAnswer}
            disabled={!store.placedAffixes.left && !store.placedAffixes.right}
            className={cn(
              "border-4 border-black px-8 py-6 shadow-[6px_6px_0_0_#000] flex items-center gap-2 font-black text-xl uppercase transition-all rounded-none",
              (!store.placedAffixes.left && !store.placedAffixes.right) 
                ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none translateY-[2px] translateX-[2px]" 
                : "bg-yellow-400 hover:bg-green-400 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none text-black"
            )}
          >
            <span>{store.hasChecked && store.isCorrect ? 'Next' : 'Check'}</span>
            <ArrowRight className="w-6 h-6" />
          </Button>
        </div>
      </main>
    </div>
  );
}