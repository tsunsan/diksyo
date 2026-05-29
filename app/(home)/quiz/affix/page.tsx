'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, ArrowRight, Check, X, Blocks } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="max-w-4xl mx-auto p-4 md:p-8 pt-4 pb-24 md:pb-32">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-6">
        <Link href="/quiz">
          <Button
            variant="default"
            size="icon"
            className="border-[3px] h-12 w-12 border-black rounded-none shadow-[4px_4px_0_0_#000] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all bg-white text-black hover:bg-[#FFE500]"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </Link>
        <div className="flex-1 flex items-center justify-center gap-3 md:gap-4">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-[#4361EE] border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0_#000] transform -rotate-6">
            <Blocks className="w-6 h-6 md:w-7 md:h-7 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col items-start justify-center">
            <h1 className="font-black text-2xl md:text-3xl lg:text-4xl uppercase italic tracking-tighter leading-none text-black">
              Affix Builder
            </h1>
          </div>
        </div>
        <div className="w-[48px]"></div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white h-4 border-[3px] border-black mb-10 shadow-[4px_4px_0_#000] overflow-hidden">
        <div className="h-full bg-black w-3/5 transition-all"></div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col gap-6 md:gap-8 w-full justify-center items-center">
        {/* Instruction / Feedback */}
        <div className="w-full flex justify-center min-h-[64px] md:min-h-[72px]">
          <AnimatePresence mode="wait">
            {!store.hasChecked ? (
              <motion.h2 
                key="instruction"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="font-black text-lg md:text-xl uppercase bg-white inline-flex items-center px-6 py-3 border-[4px] border-black shadow-[6px_6px_0_0_#000]"
              >
                Build the word: "{store.targetMeaning}"
              </motion.h2>
            ) : (
              <motion.div
                key={store.isCorrect ? 'correct' : 'incorrect'}
                initial={{ opacity: 0, scale: 0.8, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -15 }}
                className={cn(
                  "font-black uppercase text-center text-lg md:text-xl px-8 py-3 border-[4px] border-black shadow-[6px_6px_0_0_#000] flex items-center justify-center gap-3",
                  store.isCorrect ? "bg-[#32CD32] text-black" : "bg-[#FF1744] text-white"
                )}
              >
                {store.isCorrect ? (
                  <>
                    <Check className="w-6 h-6 md:w-8 md:h-8" strokeWidth={3} /> CORRECT! TUMPAK!
                  </>
                ) : (
                  <>
                    <X className="w-6 h-6 md:w-8 md:h-8" strokeWidth={3} /> NOT QUITE RIGHT. TRY AGAIN.
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Docking Area */}
        <section className="w-full max-w-2xl bg-white border-[4px] border-black p-6 md:p-12 shadow-[12px_12px_0_0_#000] flex flex-col items-center justify-center min-h-[250px] gap-8 relative mt-4">
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 w-full">
            {/* Left Drop Zone */}
            <button
              onClick={() => handleZoneClick('left')}
              className={cn(
                "w-full md:w-36 h-24 md:h-36 border-[4px] border-dashed flex items-center justify-center transition-all relative group",
                store.placedAffixes.left
                  ? `border-solid border-black ${store.placedAffixes.left.color} shadow-[6px_6px_0_0_#000]`
                  : store.selectedAffixId
                  ? "border-black bg-[#FFE500] bg-opacity-30 cursor-pointer"
                  : "border-black bg-white cursor-pointer hover:bg-gray-50"
              )}
            >
              {store.placedAffixes.left ? (
                <span className="font-black text-3xl uppercase">{store.placedAffixes.left.text}</span>
              ) : (
                <Plus className={cn("w-10 h-10", store.selectedAffixId ? "text-black animate-pulse" : "text-gray-300")} strokeWidth={3} />
              )}
              {store.placedAffixes.left && (
                <div className="absolute -top-4 -right-4 bg-[#FF1744] border-[3px] border-black p-1 shadow-[4px_4px_0_0_#000] opacity-0 group-hover:opacity-100 transition-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none hover:scale-110">
                  <X className="w-5 h-5 text-white" strokeWidth={3} />
                </div>
              )}
            </button>

            {/* Root Word */}
            <div className="bg-[#FF6D00] border-[4px] border-black px-8 py-5 md:px-12 md:py-10 shadow-[6px_6px_0_0_#000] z-10 flex items-center justify-center min-w-[200px] transform -rotate-1">
              <span className="font-black text-4xl md:text-5xl uppercase tracking-widest text-white text-center drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">{store.rootWord}</span>
            </div>

            {/* Right Drop Zone */}
            <button
              onClick={() => handleZoneClick('right')}
              className={cn(
                "w-full md:w-36 h-24 md:h-36 border-[4px] border-dashed flex items-center justify-center transition-all relative group",
                store.placedAffixes.right
                  ? `border-solid border-black ${store.placedAffixes.right.color} shadow-[6px_6px_0_0_#000]`
                  : store.selectedAffixId
                  ? "border-black bg-[#FFE500] bg-opacity-30 cursor-pointer"
                  : "border-black bg-white cursor-pointer hover:bg-gray-50"
              )}
            >
              {store.placedAffixes.right ? (
                <span className="font-black text-3xl uppercase">{store.placedAffixes.right.text}</span>
              ) : (
                <Plus className={cn("w-10 h-10", store.selectedAffixId ? "text-black animate-pulse" : "text-gray-300")} strokeWidth={3} />
              )}
              {store.placedAffixes.right && (
                <div className="absolute -top-4 -right-4 bg-[#FF1744] border-[3px] border-black p-1 shadow-[4px_4px_0_0_#000] opacity-0 group-hover:opacity-100 transition-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none hover:scale-110">
                  <X className="w-5 h-5 text-white" strokeWidth={3} />
                </div>
              )}
            </button>
          </div>

          <p className="font-black text-sm text-gray-400 uppercase mt-4 md:mt-10 md:absolute md:bottom-4 md:right-6 text-center tracking-widest">
            Root: {store.rootMeaning}
          </p>
        </section>

        {/* Affix Tray */}
        <section className="w-full max-w-3xl lg:mt-4 mb-20 md:mb-32 flex flex-col items-center w-full">
          <AnimatePresence mode="wait">
            <motion.button
              key={(!store.placedAffixes.left && !store.placedAffixes.right) ? 'select' : store.hasChecked && store.isCorrect ? 'next' : 'check'}
              initial={{ scale: 0.8, opacity: 0, y: 15, rotate: (!store.placedAffixes.left && !store.placedAffixes.right) ? -2 : 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                y: 0,
                rotate: (!store.placedAffixes.left && !store.placedAffixes.right) ? -2 : 0 
              }}
              exit={{ scale: 0.8, opacity: 0, y: -15 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={store.hasChecked && store.isCorrect ? store.reset : store.checkAnswer}
              disabled={!store.placedAffixes.left && !store.placedAffixes.right}
              className={cn(
                "border-[4px] border-black py-3 font-black tracking-widest uppercase text-center shadow-[6px_6px_0_0_#000] mb-8 origin-center w-fit flex items-center justify-center gap-3 transition-none",
                (!store.placedAffixes.left && !store.placedAffixes.right) 
                  ? "bg-[#4361EE] text-white cursor-default px-8 text-[16px]" 
                  : store.hasChecked && store.isCorrect
                    ? "bg-[#FFE500] text-black hover:bg-[#FFD500] px-10 text-[18px] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_0_#000] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none cursor-pointer"
                    : "bg-[#32CD32] text-black hover:bg-[#28A428] px-10 text-[18px] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_0_#000] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none cursor-pointer"
              )}
            >
              {(!store.placedAffixes.left && !store.placedAffixes.right) ? (
                "Select an Affix"
              ) : store.hasChecked && store.isCorrect ? (
                <>
                  NEXT WORD <ArrowRight className="w-6 h-6 z-10" strokeWidth={3} />
                </>
              ) : (
                <>
                  <Check className="w-6 h-6 z-10" strokeWidth={3} /> CHECK ANSWER
                </>
              )}
            </motion.button>
          </AnimatePresence>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 p-6 md:p-8 bg-white border-[4px] border-black shadow-[12px_12px_0_0_#000] w-full">
            {store.availableAffixes.map((affix) => {
              const isSelected = store.selectedAffixId === affix.id;
              const isPlaced = store.placedAffixes.left?.id === affix.id || store.placedAffixes.right?.id === affix.id;
              
              if (isPlaced) {
                return (
                  <div key={affix.id} className="h-24 border-[4px] border-dashed border-black bg-gray-100 opacity-40 flex items-center justify-center">
                    <span className="font-black text-xl text-black uppercase">{affix.text}</span>
                  </div>
                );
              }

              return (
                <button
                  key={affix.id}
                  onClick={() => store.selectAffix(affix.id)}
                  className={cn(
                    "border-[4px] border-black p-4 shadow-[6px_6px_0_0_#000] flex items-center justify-center h-24 relative group cursor-pointer transition-none",
                    affix.color,
                    isSelected 
                      ? "translate-x-[6px] translate-y-[6px] shadow-none bg-[#FFE500]" 
                      : "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_0_#000] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none"
                  )}
                >
                  <span className="font-black text-2xl lg:text-3xl text-black uppercase relative z-10">
                    {affix.text}
                  </span>
                  <span className="absolute top-1 left-1 bg-white border-[3px] border-black px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                    {affix.type}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

      </main>
    </div>
  );
}