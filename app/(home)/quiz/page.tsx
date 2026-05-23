import { QuizModeClient } from "@/components/quiz";

export default function QuizModePage() {
  return (
    <div className="min-h-screen relative pb-24" style={{ fontFamily: "'Geist', 'Inter', sans-serif", background: "#FFFBF0" }}>
      {/* Dot background */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: `radial-gradient(circle, #00000010 1px, transparent 1px)`, backgroundSize: "28px 28px" }} />

      <main className="relative z-10 max-w-[1100px] mx-auto px-4 sm:px-8 pt-12 lg:pt-16">
        <QuizModeClient />
      </main>
    </div>
  );
}
