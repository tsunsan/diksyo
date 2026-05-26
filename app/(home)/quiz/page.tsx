import { QuizModeClient } from "@/components/quiz";

export default function QuizModePage() {
  return (
    <div className="relative min-h-full" style={{ fontFamily: "'Geist', 'Inter', sans-serif" }}>
      <main className="relative z-10 w-full pt-4">
        <QuizModeClient />
      </main>
    </div>
  );
}
