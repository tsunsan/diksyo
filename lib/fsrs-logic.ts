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
    let cardToGrade = createEmptyCard();
    if (previousCard) {
        // Map database fields to literal FSRS Card properties securely
        cardToGrade = {
            ...cardToGrade,
            due: previousCard.due ? new Date(previousCard.due) : (previousCard.nextReview ? new Date(previousCard.nextReview) : cardToGrade.due),
            stability: previousCard.stability ?? cardToGrade.stability,
            difficulty: previousCard.difficulty ?? cardToGrade.difficulty,
            reps: previousCard.reps ?? cardToGrade.reps,
            lapses: previousCard.lapses ?? cardToGrade.lapses,
            state: previousCard.state ?? cardToGrade.state,
            elapsed_days: previousCard.elapsedDays ?? previousCard.elapsed_days ?? cardToGrade.elapsed_days,
            scheduled_days: previousCard.scheduledDays ?? previousCard.scheduled_days ?? cardToGrade.scheduled_days,
        };
        const lastReview = previousCard.last_review || previousCard.lastReview;
        if (lastReview) {
            cardToGrade.last_review = new Date(lastReview);
        }
    }
    
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