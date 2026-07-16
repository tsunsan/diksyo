import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { BookOpen, Search, Filter } from "lucide-react";

export function DictionarySkeleton() {
  return (
    <div className="w-full relative animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-[#7C3AED] border-[2px] border-black flex items-center justify-center opacity-70">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <h1
            className="uppercase tracking-tight text-black"
            style={{ fontWeight: 900, fontSize: "1.6rem", lineHeight: 1.1 }}
          >
            DICTIONARY ENGINE
          </h1>
        </div>
        <p className="text-[#666] text-xs uppercase tracking-widest ml-11" style={{ fontWeight: 600 }}>
          EXPLORE FILIPINO WORDS IN DEPTH
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar Skeleton */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {/* Search Bar Skeleton */}
          <div className="border-[2.5px] border-black bg-white flex items-center p-1 relative">
            <Search className="w-5 h-5 text-[#888] ml-2 absolute left-2" />
            <Skeleton className="h-10 w-full ml-8 mr-12 bg-zinc-100 border-none" />
            <div className="w-9 h-9 border-[2px] border-black bg-zinc-100 flex items-center justify-center absolute right-1">
                <Skeleton className="w-4 h-4 border-none bg-zinc-300" />
            </div>
          </div>

          {/* Word List Skeleton */}
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 border-[2.5px] border-black bg-white"
              >
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="w-7 h-7 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-6 lg:p-8 flex flex-col gap-6 min-h-[500px]">
            {/* Top row */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex flex-col gap-3 flex-1">
                <div className="flex gap-2">
                   <Skeleton className="h-6 w-20" />
                   <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-12 w-3/4 sm:w-1/2 mt-2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
              
              <div className="flex gap-2">
                <Skeleton className="w-10 h-10" />
                <Skeleton className="w-10 h-10" />
                <Skeleton className="w-24 h-10" />
              </div>
            </div>

            <div className="h-[3px] bg-black opacity-10" />

            {/* Definition Blocks */}
            <div className="flex flex-col gap-3 mt-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-6 bg-zinc-200" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6 mt-2" />
            </div>

            {/* Extra Box Skeleton (e.g. Etymology or Real Deal) */}
            <div className="mt-4 border-[2px] border-black p-4 flex flex-col gap-3">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            
            {/* Examples Skeleton */}
            <div className="mt-4 flex flex-col gap-3">
                <Skeleton className="h-5 w-48 mb-2" />
                {[1, 2].map(i => (
                    <div key={i} className="border-[2px] border-black p-3">
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-4/5" />
                    </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
