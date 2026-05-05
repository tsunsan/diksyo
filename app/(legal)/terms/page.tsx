import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-3xl border-4 border-black bg-white shadow-[8px_8px_0_0_#000] p-6 md:p-10">

                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter italic">Terms of Service</h1>
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
                        <h2 className="text-xl font-black uppercase mb-2">1. Acceptance of Terms</h2>
                        <p>By creating an account on Diksyo, you agree to abide by these terms. If you do not agree, please do not use the application.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black uppercase mb-2">2. User Conduct</h2>
                        <p>You agree to use Diksyo for its intended purpose: learning and mastering the Filipino language. Any attempts to disrupt the service, manipulate the spaced repetition algorithm, or exploit the platform will result in account termination.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black uppercase mb-2">3. Account & Data</h2>
                        <p>You are responsible for maintaining the security of your account. We reserve the right to suspend accounts that violate our guidelines or remain inactive for extended periods.</p>
                    </section>

                    {/* Add more sections as needed */}
                </div>
            </div>
        </main>
    )
}