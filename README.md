# Diksyo 📖

Diksyo is a modern Tagalog/Filipino language learning application featuring a comprehensive dictionary, spaced-repetition (FSRS) learning, and a bold Neobrutalist design. 

## ✨ Features

- **Lexicon Explorer (Dictionary):** Search for Filipino words, discover root words, part of speech, formal meanings, and real-world usage examples.
- **Spaced Repetition System (SRS):** Built-in quiz engine utilizing Free Spaced Repetition Scheduler (`ts-fsrs`) algorithm for optimal memory retention.
- **Multiple Quiz Modes:** Practice vocabulary through Cloze tests, Affix breakdowns, and Time-attack modes.
- **Word Vault:** Save words you want to learn to your personal vault to study them later.
- **Neobrutalist UI:** High-contrast, bold blocks, and hard drop-shadows tailored for an engaging, game-like experience.

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4, [shadcn/ui](https://ui.shadcn.com/), and `tw-animate-css`
- **Database:** PostgreSQL via [Supabase](https://supabase.com/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication:** Supabase Auth (`@supabase/ssr`)
- **State Management:** Zustand
- **Form Validation:** Zod
- **Algorithm:** `ts-fsrs`
