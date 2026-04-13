import React, { useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { useGameStore } from './store/gameStore';

function App() {
  const { status, p1Health, p2Health, timer, winner, setStatus, setTimer, setWinner, resetGame } = useGameStore();

  useEffect(() => {
    let intervalId: number;
    if (status === 'PLAYING' && timer > 0) {
      intervalId = window.setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
    } else if (timer === 0 && status === 'PLAYING') {
      setStatus('GAMEOVER');
      if (p1Health === p2Health) setWinner('TIE');
      else if (p1Health > p2Health) setWinner('PLAYER 1');
      else setWinner('PLAYER 2');
    }
    return () => window.clearInterval(intervalId);
  }, [timer, status, p1Health, p2Health, setTimer, setStatus, setWinner]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 select-none overflow-hidden font-pixel">
      <h1 className="text-3xl md:text-5xl text-cyan-400 mb-8 mt-4 drop-shadow-[0_0_12px_rgba(34,211,238,0.8)] tracking-widest">
        MECHA COMBAT
      </h1>

      <div className="relative w-full max-w-5xl px-4 flex-1 flex flex-col justify-center pb-12">
        {/* The Game Canvas */}
        <div className="flex justify-center">
          <GameCanvas />
        </div>

        {/* UI Overlay: Health Bars & Timer */}
        {status !== 'MENU' && (
          <div className="absolute top-4 left-0 w-full px-8 flex items-center justify-between pointer-events-none z-20">
            {/* Player 1 Health */}
            <div className="w-5/12 flex flex-col items-start">
              <div className="text-rose-500 mb-3 text-xs sm:text-sm drop-shadow-[0_0_4px_rgba(225,29,72,1)] tracking-widest">PLAYER 1</div>
              <div className="w-full h-8 border-4 border-slate-400 bg-slate-800 p-0.5">
                <div
                  className="h-full bg-rose-600 transition-all duration-200"
                  style={{ width: `${p1Health}%` }}
                />
              </div>
            </div>

            {/* Timer */}
            <div className="w-2/12 flex justify-center mt-6">
              <div className="w-20 h-20 bg-slate-800 border-4 border-slate-400 flex items-center justify-center text-2xl text-yellow-400 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                {timer}
              </div>
            </div>

            {/* Player 2 Health */}
            <div className="w-5/12 flex flex-col items-end">
              <div className="text-blue-500 mb-3 text-xs sm:text-sm drop-shadow-[0_0_4px_rgba(37,99,235,1)] tracking-widest">PLAYER 2</div>
              <div className="w-full h-8 border-4 border-slate-400 bg-slate-800 p-0.5 flex justify-end">
                <div
                  className="h-full bg-blue-600 transition-all duration-200"
                  style={{ width: `${p2Health}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Menu Overlay */}
        {status === 'MENU' && (
          <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center backdrop-blur-sm z-30 m-4 rounded border-4 border-slate-700">
            <button
              onClick={() => setStatus('PLAYING')}
              className="px-10 py-5 bg-yellow-400 text-slate-900 text-xl md:text-2xl border-b-8 border-r-8 border-yellow-600 hover:translate-y-2 hover:border-b-0 hover:border-r-0 transition-all mb-12 shadow-[0_0_20px_rgba(250,204,21,0.5)] tracking-widest"
            >
              START GAME
            </button>

            <div className="flex flex-col md:flex-row gap-8 md:gap-16 text-xs md:text-sm leading-loose text-slate-300">
              <div className="bg-slate-800 p-6 border-4 border-slate-600 rounded">
                <div className="text-rose-400 mb-4 text-center border-b-4 border-slate-600 pb-2">PLAYER 1</div>
                <div className="flex justify-between gap-8"><span>MOVE:</span> <span className="text-white">W A S D</span></div>
                <div className="flex justify-between gap-8"><span>ATTACK:</span> <span className="text-white">J</span></div>
                <div className="flex justify-between gap-8"><span>DEFEND:</span> <span className="text-white">K</span></div>
              </div>
              <div className="bg-slate-800 p-6 border-4 border-slate-600 rounded">
                <div className="text-blue-400 mb-4 text-center border-b-4 border-slate-600 pb-2">PLAYER 2</div>
                <div className="flex justify-between gap-8"><span>MOVE:</span> <span className="text-white">ARROWS</span></div>
                <div className="flex justify-between gap-8"><span>ATTACK:</span> <span className="text-white">1</span></div>
                <div className="flex justify-between gap-8"><span>DEFEND:</span> <span className="text-white">2</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {status === 'GAMEOVER' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-md z-30 m-4 rounded border-4 border-slate-700">
            <div className="text-5xl md:text-7xl text-yellow-400 mb-12 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)] animate-pulse tracking-widest">
              {winner === 'TIE' ? 'DRAW!' : `${winner} WINS!`}
            </div>
            <button
              onClick={resetGame}
              className="px-10 py-5 bg-white text-slate-900 text-xl md:text-2xl border-b-8 border-r-8 border-slate-400 hover:translate-y-2 hover:border-b-0 hover:border-r-0 transition-all tracking-widest"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
