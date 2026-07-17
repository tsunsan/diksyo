import { getProfileStats, getActivityStats, getFSRSStats, getAchievementsStats, getLeaderboard } from "@/app/actions/stats";
import { getDynamicGreeting } from "@/lib/date-utils";
import StatsDashboardClient from "@/components/stats-dashboard-client";

export default async function StatsDataWrapper() {
    // Actually this wrapper might not be needed if StatsDashboardClient does client fetching,
    // but if used, we pass undefined to trigger client fetching.
    const greeting = getDynamicGreeting();

    return (
        <StatsDashboardClient 
            greeting={greeting} 
        />
    );
}
