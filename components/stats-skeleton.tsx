import { Skeleton } from "@/components/ui/skeleton";

export function StatsSkeleton() {
  return (
    <div className="w-full relative" style={{ fontFamily: "'Geist', 'Inter', sans-serif" }}>
      {/* Header and 4 Badges Skeleton */}
      <div className="flex flex-col gap-5 mb-8">
        <div>
          <Skeleton className="h-3 w-32 mb-1" />
          <Skeleton className="h-10 w-48 sm:h-12 sm:w-64" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border-[3px] border-black p-4 flex flex-col justify-between relative bg-white min-h-[100px] shadow-[5px_5px_0_#000]">
              <div className="flex items-center gap-1.5 mb-2">
                <Skeleton className="w-4 h-4 rounded-full shrink-0" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-2 w-12 mt-2" />
            </div>
          ))}
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="inline-flex overflow-hidden border-[3px] border-black shadow-[5px_5px_0_#000] bg-white mb-8">
        {[1, 2, 3].map((i, index) => (
          <div key={i} className={`px-6 sm:px-8 py-3.5 ${index !== 0 ? "border-l-[3px] border-black" : ""}`}>
             <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>

      {/* Main Content Skeleton (Your Journey + Heatmap) */}
      <div className="flex flex-col gap-6">
        <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000] overflow-hidden">
          <div className="p-5 sm:p-6 pb-0 flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-8 w-24 border-[2px] border-black" />
          </div>
          <div className="p-5 sm:p-6 pb-0">
             <Skeleton className="h-3 w-64 mb-4" />
          </div>
          <div className="h-[200px] w-full bg-zinc-100 flex items-center justify-center border-y-[3px] border-black">
              <Skeleton className="h-full w-full opacity-50" />
          </div>
          <div className="bg-[#FFFBF0] p-4 sm:p-5">
             <div className="flex justify-between items-center mb-3">
                 <Skeleton className="h-6 w-32" />
                 <Skeleton className="h-4 w-20" />
             </div>
             <Skeleton className="h-6 w-full border-[2.5px] border-black" />
             <Skeleton className="h-3 w-48 mt-3" />
          </div>
        </div>

        {/* Your Year Skeleton */}
        <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-5 sm:p-6">
           <div className="flex justify-between items-center mb-5">
               <Skeleton className="h-6 w-32" />
               <div className="flex gap-4">
                   <Skeleton className="h-4 w-24" />
                   <Skeleton className="h-4 w-24" />
               </div>
           </div>
           <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}
