import { create } from 'zustand';

export interface Affix {
  id: string;
  text: string;
  type: 'prefix' | 'infix' | 'suffix';
  color: string;
}

interface AffixGameState {
  rootWord: string;
  targetMeaning: string;
  rootMeaning: string;
  availableAffixes: Affix[];
  selectedAffixId: string | null;
  placedAffixes: {
    left: Affix | null;
    right: Affix | null;
  };
  hasChecked: boolean;
  isCorrect: boolean;
  selectAffix: (id: string) => void;
  placeAffix: (position: 'left' | 'right') => void;
  removeAffix: (position: 'left' | 'right') => void;
  checkAnswer: () => void;
  reset: () => void;
}

const initialAffixes: Affix[] = [
  { id: '1', text: '-um-', type: 'infix', color: 'bg-green-400' },
  { id: '2', text: 'mag-', type: 'prefix', color: 'bg-yellow-400' },
  { id: '3', text: '-in', type: 'suffix', color: 'bg-blue-400' },
  { id: '4', text: '-an', type: 'suffix', color: 'bg-purple-400' },
];

export const useAffixStore = create<AffixGameState>((set, get) => ({
  rootWord: 'Kain',
  targetMeaning: 'To Eat',
  rootMeaning: 'Eat',
  availableAffixes: initialAffixes,
  selectedAffixId: null,
  placedAffixes: {
    left: null,
    right: null,
  },
  hasChecked: false,
  isCorrect: false,

  selectAffix: (id) => set({ selectedAffixId: id, hasChecked: false }),

  placeAffix: (position) => {
    const { selectedAffixId, availableAffixes, placedAffixes } = get();
    if (!selectedAffixId) return;

    const affix = availableAffixes.find((a) => a.id === selectedAffixId);
    if (!affix) return;

    set({
      placedAffixes: {
        ...placedAffixes,
        [position]: affix,
      },
      selectedAffixId: null,
      hasChecked: false,
    });
  },

  removeAffix: (position) => {
    const { placedAffixes } = get();
    set({
      placedAffixes: {
        ...placedAffixes,
        [position]: null,
      },
      hasChecked: false,
    });
  },

  checkAnswer: () => {
    const { placedAffixes } = get();
    // Simple logic for this specific word: infix '-um-' is placed correctly?
    // In our simplified UI, if they place it in the left or right, let's say they need to place "-um-" in the left zone for "kumain" simulation, 
    // or specifically check if they selected the infix.
    // Let's just say "um" in the left is correct for this demo.
    const isCorrect = placedAffixes.left?.id === '1' && placedAffixes.right === null;
    
    set({
      hasChecked: true,
      isCorrect,
    });
  },

  reset: () => set({
    selectedAffixId: null,
    placedAffixes: { left: null, right: null },
    hasChecked: false,
    isCorrect: false,
  }),
}));
