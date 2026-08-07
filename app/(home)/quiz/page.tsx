import { QuizModeClient } from "@/components/quiz";
import React from "react";

export default function QuizModePage() {
  return (
    <div className="relative min-h-full" style={{ fontFamily: "'Geist', 'Inter', sans-serif", zoom: "80%" } as React.CSSProperties}>
      <main className="relative z-10 w-full pt-4">
        <QuizModeClient />
      </main>
    </div>
  );
}
