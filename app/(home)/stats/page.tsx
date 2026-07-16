import { Suspense } from "react";
import StatsDataWrapper from "@/components/stats-data-wrapper";
import { StatsSkeleton } from "@/components/stats-skeleton";

export default function StatsPage() {
    return (
        <Suspense fallback={<StatsSkeleton />}>
            <StatsDataWrapper />
        </Suspense>
    );
}