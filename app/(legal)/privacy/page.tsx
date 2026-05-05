import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-3xl border-4 border-black bg-white shadow-[8px_8px_0_0_#000] p-6 md:p-10">

                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter italic">Privacy Policy</h1>
                        <p className="font-bold text-zinc-500 uppercase mt-2">Last Updated: May 2026</p>
                    </div>
                    <Link href="/signup">
                        <Button variant="outline" className="rounded-none border-2 border-black bg-yellow-400 font-bold shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase">
                            Back
                        </Button>
                    </Link>
                </div>

                <div className="space-y-6 text-sm font-medium text-zinc-800 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-black uppercase mb-2">1. Data We Collect</h2>
                        <p>When you create an account, we collect your email address and name. If you choose to log in using Google, we receive your basic profile information (Name, Email Address, and Profile Picture) directly from Google.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black uppercase mb-2">2. How We Use Your Data</h2>
                        <p>We use your email and name strictly for account creation, secure login, and personalizing your learning dashboard. Your learning progress (XP, streaks, and word mastery) is saved to calculate your Spaced Repetition (FSRS) intervals.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black uppercase mb-2">3. Google User Data</h2>
                        <p>Diksyo's use and transfer of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements. We do not sell, share, or distribute your Google account data to any third parties.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black uppercase mb-2">4. Data Deletion</h2>
                        <p>You have the right to request the deletion of your account and all associated data at any time by contacting our support team.</p>
                    </section>
                </div>
            </div>
        </main>
    )
}