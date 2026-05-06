# Design System: diksyo

This document outlines the visual identity and UI/UX standards for the `diksyo` project. The design is heavily inspired by **Neobrutalism**, characterized by bold lines, high-contrast colors, and rigid, square shapes.

## Visual Identity

### Aesthetic: Neobrutalism
- **Borders:** Thick, black borders (usually `2px` or `4px`) on almost all interactive elements.
- **Shadows:** Hard, non-blurred shadows (e.g., `shadow-[4px_4px_0_0_#000]`).
- **Radius:** Zero to minimal border radius (`rounded-none` preferred).
- **Typography:** Bold, uppercase, and often italicized for emphasis. High tracking (e.g., `tracking-tighter`).

## Color Palette

The project uses OKLCH-based colors with a focus on high contrast.

- **Primary Background:** White (`oklch(1 0 0)`) / Dark Gray (`oklch(0.145 0 0)` in dark mode).
- **Accent (Yellow):** Used for primary actions, buttons, and highlights (e.g., `bg-yellow-400`).
- **Destructive (Red):** Used for errors and critical alerts (e.g., `bg-red-400`).
- **Foreground/Borders:** Deep Black (`oklch(0.145 0 0)`).

## Typography

- **Primary Sans:** `Geist Sans` & `Inter`.
- **Primary Mono:** `Geist Mono`.
- **Headings:** Should be `font-black`, `uppercase`, `italic`, and `tracking-tighter`.
- **Body/Labels:** Bold, uppercase, `text-xs` or `text-sm` for secondary information.

## UI Components

### 1. Buttons
- **Style:** `rounded-none`, `border-2`, `border-black`, `font-bold`.
- **Shadow:** Hard shadow that disappears on hover/active states to simulate "pressing".
- **Interaction:** `hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all`.

### 2. Inputs & Forms
- **Style:** `rounded-none`, `border-2`, `border-black`.
- **Focus State:** `focus-visible:ring-0 focus-visible:bg-yellow-100`.
- **Labels:** `font-bold`, `uppercase`, `text-xs`.

### 3. Cards & Alerts
- **Style:** `rounded-none`, `border-2`, `border-black`.
- **Alerts:** High-contrast backgrounds (e.g., red for errors) with bold icon placement.

## Layout Patterns

- **Root Layout:** `flex flex-col min-h-full`.
- **Containers:** Center-aligned with consistent gap spacing (`gap-4`, `gap-6`).
- **Spacing:** Generous use of white space to balance the "heavy" neobrutalist elements.

## Animations

- Powered by `tw-animate-css`.
- Use subtle transitions for hover states to maintain the "rigid" feel while providing tactile feedback.
