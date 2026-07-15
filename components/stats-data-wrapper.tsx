import { getUserStats, getLeaderboard } from "@/app/actions/stats";
import { getDynamicGreeting } from "@/lib/date-utils";
import StatsDashboardClient from "@/components/stats-dashboard-client";

export default async function StatsDataWrapper() {
    const [stats, leaderboard] = await Promise.all([
        getUserStats(),
        getLeaderboard()
    ]);
    
    const greeting = getDynamicGreeting();

    return (
        <StatsDashboardClient 
            stats={stats} 
            leaderboard={leaderboard} 
            greeting={greeting} 
        />
    );
}
