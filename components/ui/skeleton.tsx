import { cn } from "@/lib/utils"
import React from "react"

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border-[2px] border-black bg-yellow-100 animate-pulse", 
        className
      )}
      {...props}
    />
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 border-[3px] border-black shadow-[6px_6px_0_0_#000] bg-white flex flex-col gap-4 min-h-[300px]", className)}>
      <Skeleton className="h-10 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
      <div className="flex gap-2 mt-auto pt-4">
        <Skeleton className="h-10 w-24" /> 
        <Skeleton className="h-10 w-32" /> 
      </div>
    </div>
  )
}

export function StatSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 border-[3px] border-black shadow-[6px_6px_0_0_#000] bg-white flex flex-col min-h-[300px]", className)}>
      <Skeleton className="h-8 w-1/3 mb-8" />
      <div className="flex items-end gap-4 flex-1">
        {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
            <Skeleton key={i} className="w-full" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  )
}
