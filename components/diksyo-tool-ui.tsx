'use client';

import { makeAssistantToolUI } from "@assistant-ui/react";
import { Sparkles } from "lucide-react";

type LookupArgs = { word?: string };
type LookupResult = any;

export const LookupWordToolUI = makeAssistantToolUI<LookupArgs, LookupResult>({
  toolName: "lookupWord",
  render: ({ result, status }) => {
    // 1. Loading / Fetching State: Bubbly Animated Yellow Thinking Dots 🫧
    if (status.type !== 'complete' || !result) {
      return (
        <div className="flex items-center gap-2 border-2 border-black bg-white p-2.5 my-2 shadow-[2px_2px_0_0_#000] w-fit">
          <span className="text-xs font-black uppercase tracking-tight mr-1">Searching Diksyo DB</span>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full border border-black bg-yellow-400 animate-bounce [animation-delay:-0.3s]" />
            <div className="h-2 w-2 rounded-full border border-black bg-yellow-400 animate-bounce [animation-delay:-0.15s]" />
            <div className="h-2 w-2 rounded-full border border-black bg-yellow-400 animate-bounce" />
          </div>
        </div>
      );
    }

    // 2. Clean AI Fallback Badge when word is missing from Supabase DB
    if (result.notFound || result.error) {
      return (
        <div className="flex items-center gap-2 border-2 border-black bg-blue-100 p-2.5 text-xs font-bold my-2 shadow-[3px_3px_0_0_#000] text-blue-950">
          <Sparkles size={16} className="text-blue-700 font-black shrink-0" />
          <span className="font-black uppercase tracking-tight">
            ⚡ Not in DB — Explaining with AI General Knowledge:
          </span>
        </div>
      );
    }

    // 3. Found State: "pls do not make a card" -> return null so LLM markdown text streams directly
    return null;
  }
});
