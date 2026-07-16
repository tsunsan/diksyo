import { BookMarked, Search, ArrowDownUp, Filter, Maximize } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function VaultSkeleton() {
  return (
    <div className="w-full relative animate-in fade-in duration-500" style={{ fontFamily: "'Geist', 'Inter', sans-serif" }}>
      <div className="flex flex-col gap-5">
        {/* Vault Header Static Replica */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <BookMarked className="w-5 h-5 text-[#7C3AED]" />
              <h2 className="uppercase tracking-tight text-black" style={{ fontWeight: 900, fontSize: "1.4rem" }}>
                PERSONAL VOCABULARY VAULT
              </h2>
            </div>
            <div className="flex items-center gap-2 mt-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-5 py-3 bg-white border-[2.5px] border-black shadow-[4px_4px_0_#000] uppercase tracking-widest text-sm font-black text-[#ccc]">
              MANAGE
            </div>
            <div className="flex items-center gap-2 px-5 py-3 bg-[#7C3AED] text-white border-[2.5px] border-black shadow-[4px_4px_0_#000] uppercase tracking-widest text-sm font-black opacity-80">
              ADD WORD
            </div>
          </div>
        </div>

        {/* Search & Sort Static Replica */}
        <div className="flex flex-col sm:flex-row gap-4 h-auto sm:h-12">
          <div className="relative flex-1 h-14 sm:h-full bg-white border-[2.5px] border-black flex items-center px-3">
            <Search className="w-5 h-5 text-[#888] mr-3" />
            <span className="text-[#888] uppercase text-sm font-bold">SEARCH YOUR VAULT...</span>
          </div>
          <div className="flex shrink-0 h-14 sm:h-full w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial sm:w-[220px] h-full bg-white border-[2.5px] border-black flex items-center px-3 justify-between">
              <div className="flex items-center gap-3">
                 <ArrowDownUp className="w-5 h-5 text-[#888]" />
                 <span className="uppercase text-sm font-bold">RECENTLY ADDED</span>
              </div>
            </div>
            <div className="flex items-center justify-center w-12 h-full border-[2.5px] border-l-0 border-black bg-white">
            </div>
          </div>
        </div>

        {/* Filter Bar Static Replica */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5 shrink-0">
              <Filter className="w-4 h-4 text-[#888]" />
              <span className="text-[10px] uppercase tracking-widest text-[#888]" style={{ fontWeight: 800 }}>FILTERS</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 border-[2px] border-black bg-white text-black text-[10px] uppercase tracking-widest shadow-[2px_2px_0_transparent]" style={{ fontWeight: 900 }}>
              <Maximize className="w-3.5 h-3.5" />
              <span>MAXIMIZE</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:flex lg:flex-wrap lg:items-center gap-2 w-full">
             {["ROOT", "POS", "LEVEL", "FREQ"].map(label => (
                 <div key={label} className="flex items-center justify-between gap-1.5 px-2.5 py-2 w-full lg:w-[160px] border-[2.5px] border-black bg-white">
                    <span className="text-xs uppercase tracking-widest font-bold">{label}: ALL</span>
                 </div>
             ))}
          </div>
        </div>

        {/* Word Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border-[2.5px] border-black shadow-[4px_4px_0_#000] p-5 gap-3 flex flex-col min-h-[160px]">
              <div className="flex items-start justify-between gap-2">
                 <div className="flex flex-col gap-2 w-full">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-3 w-48" />
                 </div>
                 <Skeleton className="h-5 w-12 border-[1.5px] border-black shrink-0" />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-auto mb-2">
                 <Skeleton className="h-4 w-16 border-[1.5px] border-black" />
                 <Skeleton className="h-4 w-20 border-[1.5px] border-black" />
              </div>
              <div className="flex items-end justify-between pt-4 border-t-[2px] border-black">
                 <Skeleton className="h-6 w-24 border-[1.5px] border-black" />
                 <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
