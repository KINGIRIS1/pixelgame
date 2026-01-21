import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameCanvas from './components/GameCanvas';
import GameUI from './components/GameUI';
import VirtualJoystick from './components/VirtualJoystick';
import { Sword, Zap, Shield } from 'lucide-react';
import { GameRef } from './types';

export default function App() {
  const [inputVector, setInputVector] = useState({ x: 0, y: 0 });
  const gameRef = useRef<GameRef>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Game state cho UI (update ít thường xuyên hơn)
  const [playerStats, setPlayerStats] = useState({
    name: 'DragonSlayer',
    level: 12,
    health: 450,
    maxHealth: 600
  });

  // Desktop Keyboard
  useEffect(() => {
    const keys = { w: false, a: false, s: false, d: false };
    
    const updateVector = () => {
      let dx = 0;
      let dy = 0;
      if (keys.w) dy -= 1;
      if (keys.s) dy += 1;
      if (keys.a) dx -= 1;
      if (keys.d) dx += 1;
      if (dx !== 0 && dy !== 0) {
        const length = Math.sqrt(dx*dx + dy*dy);
        dx /= length;
        dy /= length;
      }
      setInputVector({ x: dx, y: dy });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keys) {
        keys[key as keyof typeof keys] = true;
        updateVector();
      }
      // Hotkey Skills
      if (e.code === 'Space') gameRef.current?.attack();
      if (e.key === '1') gameRef.current?.skill1();
      if (e.key === '2') gameRef.current?.skill2();
      if (e.key === 'm') setActiveModal(prev => prev === 'map' ? null : 'map');
      if (e.key === 'b') setActiveModal(prev => prev === 'bag' ? null : 'bag');
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keys) {
        keys[key as keyof typeof keys] = false;
        updateVector();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleJoystickMove = useCallback((dx: number, dy: number) => {
    setInputVector({ x: dx, y: dy });
  }, []);

  const handleJoystickStop = useCallback(() => {
    setInputVector({ x: 0, y: 0 });
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white select-none font-sans">
      
      {/* Lớp Render Game 2D */}
      <div className="absolute inset-0 z-0">
        <GameCanvas 
          ref={gameRef}
          inputVector={inputVector} 
          onPlayerUpdate={(p) => setPlayerStats(prev => ({ ...prev, health: p.health }))}
        />
      </div>

      {/* Lớp UI (Health, Chat, Map Modal, Bag Modal) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <GameUI 
          playerName={playerStats.name} 
          level={playerStats.level}
          health={playerStats.health}
          maxHealth={playerStats.maxHealth}
          activeModal={activeModal}
          onToggleModal={setActiveModal}
        />
      </div>

      {/* Controls Container (Mobile Only or Always Visible Style) */}
      {/* Ẩn control khi mở modal để tránh bấm nhầm */}
      {!activeModal && (
        <>
          <div className="absolute bottom-8 left-8 z-20 pointer-events-auto opacity-70 hover:opacity-100 transition-opacity">
            <VirtualJoystick onMove={handleJoystickMove} onStop={handleJoystickStop} />
          </div>

          <div className="absolute bottom-8 right-8 z-20 pointer-events-auto flex gap-6 items-end">
            
            {/* Skill 1: Shield */}
            <div className="flex flex-col items-center gap-1">
              <button 
                onClick={() => gameRef.current?.skill1()}
                className="w-14 h-14 bg-blue-900/80 rounded-full border-2 border-blue-400 flex items-center justify-center active:scale-95 transition-transform shadow-lg"
              >
                <Shield size={24} className="text-blue-200" />
              </button>
              <span className="text-[10px] font-bold bg-black/50 px-1 rounded border border-white/20">Skill 1</span>
            </div>

            {/* Skill 2: Fireball */}
            <div className="flex flex-col items-center gap-1 mb-6">
              <button 
                onClick={() => gameRef.current?.skill2()}
                className="w-16 h-16 bg-purple-900/80 rounded-full border-2 border-purple-400 flex items-center justify-center active:scale-95 transition-transform shadow-lg"
              >
                 <Zap size={28} className="text-yellow-300" />
              </button>
              <span className="text-[10px] font-bold bg-black/50 px-1 rounded border border-white/20">Skill 2</span>
            </div>

            {/* Attack Button (Big) */}
            <div className="flex flex-col items-center gap-1">
              <button 
                onClick={() => gameRef.current?.attack()}
                className="w-24 h-24 bg-red-900/90 rounded-full border-4 border-red-500 flex items-center justify-center active:bg-red-800 active:scale-90 transition-transform shadow-xl shadow-red-900/50"
              >
                <Sword size={40} className="text-white" />
              </button>
              <span className="text-xs font-bold text-red-400">ATTACK</span>
            </div>
          </div>
        </>
      )}

    </div>
  );
}