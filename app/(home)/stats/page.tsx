import { getUserStats, getLeaderboard } from "@/app/actions/stats";
import { getDynamicGreeting } from "@/lib/date-utils";
import StatsDashboardClient from "./stats-dashboard-client";

export default async function StatsPage() {
    const stats = await getUserStats();
    const leaderboard = await getLeaderboard();
    const greeting = getDynamicGreeting();

    return (
        <StatsDashboardClient 
            stats={stats} 
            leaderboard={leaderboard} 
            greeting={greeting} 
        />
    );
}