import { SignupForm } from "@/components/signup-form"

export default function SignupPage() {
    return (
        <div className="relative min-h-svh flex flex-col items-center justify-center p-6 md:p-10 font-mono bg-zinc-50 overflow-hidden">
            <div
                className="absolute inset-0 z-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, #000 2px, transparent 0)',
                    backgroundSize: '40px 40px'
                }}
            ></div>
            <div className="relative z-10 flex w-full max-w-sm flex-col gap-6">
                <div className="flex items-center gap-2 self-center font-medium">
                    <div
                        className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <a href="#" className="flex items-center gap-3 font-bold uppercase tracking-tighter text-xl">
                            <img
                                src="/icon.svg"
                                alt="Diksyo Logo"
                                className="size-8 object-contain"
                            />
                        </a>
                    </div>
                    Diksyo
                </div>
                <SignupForm/>
            </div>
        </div>
    )
}