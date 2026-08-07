import { QuizModeClient } from "@/components/quiz";
import React from "react";

export default function QuizModePage() {
  return (
    <div className="relative min-h-full" style={{ fontFamily: "'Geist', 'Inter', sans-serif" }}>
      <main className="relative z-10 w-full pt-4 mx-auto" style={{ zoom: "80%" } as React.CSSProperties}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <QuizModeClient />
        </div>
      </main>
    </div>
  );
}
