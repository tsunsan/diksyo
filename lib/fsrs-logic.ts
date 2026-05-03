import { fsrs, Rating, createEmptyCard } from 'ts-fsrs';

// Initialize the FSRS algorithm with default parameters
const scheduler = fsrs();

export type FSRSGrade = 'again' | 'hard' | 'good' | 'easy';

// 1. Explicitly define the 4 valid scheduling ratings (Excluding 'Manual')
type ActiveRating = Rating.Again | Rating.Hard | Rating.Good | Rating.Easy;

/**
 * 2. Force the return type to ActiveRating so TS knows
 * it's mathematically impossible to return Rating.Manual or an Iterator function.
 */
const mapGradeToRating = (grade: FSRSGrade): ActiveRating => {
    switch (grade) {
        case 'again': return Rating.Again;
        case 'hard': return Rating.Hard;
        case 'good': return Rating.Good;
        case 'easy': return Rating.Easy;
    }
};

export const calculateNextReview = (
    grade: FSRSGrade,
    previousCard: any = null
) => {
    const cardToGrade = previousCard ? previousCard : createEmptyCard();
    const rating = mapGradeToRating(grade);
    const now = new Date();

    const schedulingInfo = scheduler.repeat(cardToGrade, now);

    // 3. Because 'rating' is strictly typed, we can directly access the card!
    const nextCardState = schedulingInfo[rating].card;

    return {
        nextReviewDate: nextCardState.due,
        stability: nextCardState.stability,
        difficulty: nextCardState.difficulty,
        reps: nextCardState.reps,
        fsrsData: nextCardState
    };
};