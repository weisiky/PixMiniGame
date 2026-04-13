import React, { useEffect, useRef } from 'react';
import { Fighter } from '../game/Fighter';
import { rectangularCollision } from '../game/utils';
import { useGameStore } from '../store/gameStore';

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { status, setHealth, setWinner, setStatus } = useGameStore();
  const player1Ref = useRef<Fighter | null>(null);
  const player2Ref = useRef<Fighter | null>(null);

  useEffect(() => {
    if (status !== 'PLAYING') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const c = canvas.getContext('2d');
    if (!c) return;

    canvas.width = 1024;
    canvas.height = 576;

    c.fillRect(0, 0, canvas.width, canvas.height);

    const player1 = new Fighter({
      position: { x: 150, y: 0 },
      velocity: { x: 0, y: 0 },
      color: '#e11d48', // Tailwind rose-600
      facing: 'right',
      name: 'Player 1'
    });
    player1Ref.current = player1;

    const player2 = new Fighter({
      position: { x: canvas.width - 200, y: 0 },
      velocity: { x: 0, y: 0 },
      color: '#2563eb', // Tailwind blue-600
      facing: 'left',
      name: 'Player 2'
    });
    player2Ref.current = player2;

    const keys = {
      a: { pressed: false },
      d: { pressed: false },
      ArrowRight: { pressed: false },
      ArrowLeft: { pressed: false }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'd': keys.d.pressed = true; player1.lastKey = 'd'; break;
        case 'a': keys.a.pressed = true; player1.lastKey = 'a'; break;
        case 'w':
          if (player1.jumpCount < 2) {
            player1.velocity.y = -15;
            player1.jumpCount++;
          }
          break;
        case 'j': player1.attack(); break;
        case 'k': player1.isDefending = true; break;

        case 'ArrowRight': keys.ArrowRight.pressed = true; player2.lastKey = 'ArrowRight'; break;
        case 'ArrowLeft': keys.ArrowLeft.pressed = true; player2.lastKey = 'ArrowLeft'; break;
        case 'ArrowUp':
          if (player2.jumpCount < 2) {
            player2.velocity.y = -15;
            player2.jumpCount++;
          }
          break;
        case '1': player2.attack(); break;
        case '2': player2.isDefending = true; break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'd': keys.d.pressed = false; break;
        case 'a': keys.a.pressed = false; break;
        case 'k': player1.isDefending = false; break;

        case 'ArrowRight': keys.ArrowRight.pressed = false; break;
        case 'ArrowLeft': keys.ArrowLeft.pressed = false; break;
        case '2': player2.isDefending = false; break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let animationId: number;

    const animate = () => {
      animationId = window.requestAnimationFrame(animate);

      // Draw background
      c.fillStyle = '#0f172a'; // slate-900
      c.fillRect(0, 0, canvas.width, canvas.height);

      // Draw ground
      c.fillStyle = '#1e293b'; // slate-800
      c.fillRect(0, canvas.height - 80, canvas.width, 80);

      // Draw ground grid lines (retro feel)
      c.strokeStyle = '#334155';
      c.lineWidth = 2;
      for (let i = 0; i < canvas.width; i += 40) {
        c.beginPath();
        c.moveTo(i, canvas.height - 80);
        c.lineTo(i - 20, canvas.height);
        c.stroke();
      }
      c.beginPath();
      c.moveTo(0, canvas.height - 80);
      c.lineTo(canvas.width, canvas.height - 80);
      c.stroke();

      // Player 1 movement
      player1.velocity.x = 0;
      if (keys.a.pressed && player1.lastKey === 'a') {
        player1.velocity.x = -6;
        player1.facing = 'left';
      } else if (keys.d.pressed && player1.lastKey === 'd') {
        player1.velocity.x = 6;
        player1.facing = 'right';
      }

      // Player 2 movement
      player2.velocity.x = 0;
      if (keys.ArrowLeft.pressed && player2.lastKey === 'ArrowLeft') {
        player2.velocity.x = -6;
        player2.facing = 'left';
      } else if (keys.ArrowRight.pressed && player2.lastKey === 'ArrowRight') {
        player2.velocity.x = 6;
        player2.facing = 'right';
      }

      // Collision Detection: P1 attacks P2
      if (
        rectangularCollision({ rect1: player1, rect2: player2 }) &&
        player1.isAttacking
      ) {
        player1.isAttacking = false; // hit only once per attack frame
        player2.takeHit(10);
        setHealth(2, player2.health);
        
        // Knockback
        player2.velocity.x = player1.facing === 'right' ? 8 : -8;
        player2.velocity.y = -5;
      }

      // Collision Detection: P2 attacks P1
      if (
        rectangularCollision({ rect1: player2, rect2: player1 }) &&
        player2.isAttacking
      ) {
        player2.isAttacking = false;
        player1.takeHit(10);
        setHealth(1, player1.health);

        // Knockback
        player1.velocity.x = player2.facing === 'right' ? 8 : -8;
        player1.velocity.y = -5;
      }

      // End game based on health
      if (player1.health <= 0 || player2.health <= 0) {
        determineWinner({ player1, player2 });
      }

      player1.update(c, canvas.width, canvas.height);
      player2.update(c, canvas.width, canvas.height);
    };

    const determineWinner = ({ player1, player2 }: { player1: Fighter, player2: Fighter }) => {
      window.cancelAnimationFrame(animationId);
      if (player1.health === player2.health) {
        setWinner('TIE');
      } else if (player1.health > player2.health) {
        setWinner('PLAYER 1');
      } else {
        setWinner('PLAYER 2');
      }
      setStatus('GAMEOVER');
    };

    animate();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.cancelAnimationFrame(animationId);
    };
  }, [status, setHealth, setStatus, setWinner]); 

  // Empty canvas when not playing
  useEffect(() => {
    if (status !== 'PLAYING' && canvasRef.current) {
      const c = canvasRef.current.getContext('2d');
      if (c) {
        c.fillStyle = '#000';
        c.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, [status]);

  return (
    <div className="relative inline-block border-4 border-slate-700 shadow-[0_0_30px_rgba(0,0,0,0.8)] rounded overflow-hidden">
      <canvas ref={canvasRef} className="block w-full h-auto bg-black" style={{ maxWidth: '1024px', aspectRatio: '16/9' }} />
    </div>
  );
};
