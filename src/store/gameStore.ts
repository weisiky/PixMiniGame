import { create } from 'zustand';

interface GameState {
  status: 'MENU' | 'PLAYING' | 'GAMEOVER';
  p1Health: number;
  p2Health: number;
  timer: number;
  winner: string | null;
  setStatus: (status: 'MENU' | 'PLAYING' | 'GAMEOVER') => void;
  setHealth: (player: 1 | 2, health: number) => void;
  setTimer: (time: number) => void;
  setWinner: (winner: string | null) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  status: 'MENU',
  p1Health: 100,
  p2Health: 100,
  timer: 60,
  winner: null,
  setStatus: (status) => set({ status }),
  setHealth: (player, health) => set((state) => ({
    ...state,
    [player === 1 ? 'p1Health' : 'p2Health']: health
  })),
  setTimer: (time) => set({ timer: time }),
  setWinner: (winner) => set({ winner }),
  resetGame: () => set({ status: 'PLAYING', p1Health: 100, p2Health: 100, timer: 60, winner: null })
}));
