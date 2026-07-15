import { Suspense } from "react";
import StatsDataWrapper from "@/components/stats-data-wrapper";
import { StatSkeleton } from "@/components/ui/skeleton";

export default function StatsPage() {
    return (
        <Suspense fallback={<div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto"><StatSkeleton /></div>}>
            <StatsDataWrapper />
        </Suspense>
    );
}