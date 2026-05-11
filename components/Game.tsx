import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import { useLanguage } from '../contexts/LanguageContext';
import { Aperture } from 'lucide-react';

interface GameProps {
  onGameOver: () => void;
}

export default function Game({ onGameOver }: GameProps) {
  const { t, isRtl } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeStr, setTimeStr] = useState('00:00');
  const [hp, setHp] = useState(100);
  const [isGameOver, setIsGameOver] = useState(false);
  
  // Black Hole Ability State
  const [bhCooldown, setBhCooldown] = useState(0);
  const BH_MAX_COOLDOWN = 15; // 15 seconds cooldown

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    
    // Resize the canvas to fit the container
    const resizeCanvas = () => {
      if (containerRef.current) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const gameOpts = {
      onScoreUpdate: setScore,
      onLevelUpdate: setLevel,
      onTimeUpdate: (sec: number) => {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        setTimeStr(`${m}:${s}`);
      },
      onHpUpdate: setHp,
      onGameOver: () => {
        setIsGameOver(true);
      }
    };

    const engine = new GameEngine(canvas, gameOpts);
    
    // Read difficulty from localStorage for spawning rates and enemy HP config if needed
    // (Here we just let engine handle it, or we could pass difficulty into gameOpts)
    const difficultyStr = localStorage.getItem('gameDifficulty') || 'normal';
    // Engine scaling could be hooked up here if we want global scaling
    
    engineRef.current = engine;
    engine.start();

    // Cooldown generic timer
    const interval = setInterval(() => {
        setBhCooldown(c => Math.max(0, c - 1));
    }, 1000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
      engine.stop();
    };
  }, []);

  const handleUseBlackHole = () => {
    if (bhCooldown > 0 || !engineRef.current || isGameOver) return;
    
    // Black hole level can be pulled from upgrades, let's use a base level + something
    const bhLevel = 1; // You can link this to localStorage or shop upgrades
    engineRef.current.useBlackHole(bhLevel);
    setBhCooldown(BH_MAX_COOLDOWN);
  };

  return (
    <div ref={containerRef} className={`relative w-full h-full bg-black overflow-hidden object-contain touch-none select-none ${isRtl ? 'font-arabic' : 'font-sans'}`}>
      <canvas ref={canvasRef} className="block w-full h-full pointer-events-auto" />
      
      {/* HUD overlay */}
      <div className={`absolute top-0 left-0 w-full p-4 flex justify-between items-start pointer-events-none z-10 text-white font-mono text-xs md:text-sm drop-shadow-md ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
        <div className={`flex flex-col gap-1 ${isRtl ? 'items-end' : ''}`}>
          <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <span className="text-gray-400 uppercase tracking-widest">{t('time')}</span>
            <span className="text-cyan-400 font-bold">{timeStr}</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-24 md:w-32 h-3 bg-gray-800 rounded-full border border-gray-600 overflow-hidden relative ${isRtl ? 'rotate-180' : ''}`}>
              <div 
                className="absolute top-0 left-0 h-full bg-cyan-500 shadow-[0_0_10px_#22d3ee] transition-all duration-200" 
                style={{ width: `${Math.max(0, hp)}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className={`flex flex-col items-end gap-1 ${isRtl ? 'items-start' : ''}`}>
          <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <span className="text-gray-400 uppercase tracking-widest">{t('score')}</span>
            <span className="text-yellow-400 font-bold">{score.toString().padStart(6, '0')}</span>
          </div>
          <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <span className="text-gray-400 uppercase tracking-widest">{t('levelLabel')}</span>
            <span className="text-purple-400 font-bold">{level}</span>
          </div>
        </div>
      </div>

      {/* ABILITIES OVERLAY */}
      <div className={`absolute bottom-8 ${isRtl ? 'left-8' : 'right-8'} z-20 pointer-events-auto`}>
        <button 
           onClick={(e) => { e.stopPropagation(); handleUseBlackHole(); }}
           disabled={bhCooldown > 0}
           className="relative group flex items-center justify-center w-16 h-16 rounded-full border-2 border-purple-500/50 bg-black/60 shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] hover:bg-purple-900/40 hover:border-purple-400 transition-all disabled:opacity-50 disabled:grayscale overflow-hidden"
        >
          <Aperture className={`w-8 h-8 text-purple-400 ${bhCooldown === 0 ? 'animate-[spin_4s_linear_infinite]' : ''}`} />
          {bhCooldown > 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center font-mono font-bold text-lg text-white">
               {bhCooldown}
            </div>
          )}
        </button>
      </div>

      {isGameOver && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 text-white pointer-events-auto">
           <h2 className="text-4xl md:text-6xl font-black italic mb-4 neon-text-pink uppercase tracking-widest text-[#22d3ee] drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">{t('gameOver')}</h2>
           <p className={`text-xl mb-2 flex gap-2 ${isRtl ? 'flex-row-reverse font-arabic' : 'font-mono'}`}>
             <span className="uppercase">{t('score')}:</span> <span className="text-yellow-400 font-mono">{score}</span>
           </p>
           <p className={`text-xl mb-8 flex gap-2 ${isRtl ? 'flex-row-reverse font-arabic' : 'font-mono'}`}>
             <span className="uppercase">{t('levelLabel')}:</span> <span className="text-purple-400 font-mono">{level}</span>
           </p>
           <button
            onClick={onGameOver}
            className={`px-8 py-3 outline outline-1 outline-cyan-500 text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500 hover:text-white font-bold uppercase tracking-widest transition-all duration-300 ${isRtl ? 'font-arabic transform skew-x-[-15deg]' : 'transform skew-x-[15deg]'}`}
           >
             <span className={`block ${isRtl ? 'transform skew-x-[15deg]' : 'transform skew-x-[-15deg]'}`}>{t('returnToMenu')}</span>
           </button>
        </div>
      )}
    </div>
  );
}
