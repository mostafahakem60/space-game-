import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Award, Layers, Zap, Play, ChevronRight, Shield, Volume2 } from 'lucide-react';
import Shop from './Shop';
import { useLanguage } from '../contexts/LanguageContext';

// --- Simple Audio feedback ---
const playSound = (type: 'hover' | 'click' | 'warp') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'hover') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'click') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'warp') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.8);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    }
  } catch(e) {}
};

interface SciFiButtonProps {
  label: string;
  subLabel?: string;
  tooltip: string;
  theme: 'blue' | 'purple' | 'gold' | 'green' | 'gray';
  onClick: () => void;
  active?: boolean;
}

const SciFiButton = ({ label, subLabel, tooltip, theme, onClick, active }: SciFiButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isRtl } = useLanguage();

  const themeColors = {
    blue: 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] from-blue-900/40 text-blue-300',
    purple: 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)] from-purple-900/40 text-purple-300',
    gold: 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)] from-amber-900/40 text-amber-300',
    green: 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] from-emerald-900/40 text-emerald-300',
    gray: 'border-gray-500 shadow-[0_0_15px_rgba(156,163,175,0.5)] from-gray-900/40 text-gray-300',
  };

  const hoverColors = {
    blue: 'hover:shadow-[0_0_25px_rgba(59,130,246,0.8)] hover:bg-blue-500/20 text-white',
    purple: 'hover:shadow-[0_0_25px_rgba(168,85,247,0.8)] hover:bg-purple-500/20 text-white',
    gold: 'hover:shadow-[0_0_25px_rgba(245,158,11,0.8)] hover:bg-amber-500/20 text-white',
    green: 'hover:shadow-[0_0_25px_rgba(16,185,129,0.8)] hover:bg-emerald-500/20 text-white',
    gray: 'hover:shadow-[0_0_25px_rgba(156,163,175,0.8)] hover:bg-gray-500/20 text-white',
  };

  return (
    <div 
      className="relative group mb-4 w-64 md:w-80"
      onMouseEnter={() => { setIsHovered(true); playSound('hover'); }}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.button
        onClick={() => { playSound('click'); onClick(); }}
        whileHover={{ scale: 1.02, x: isRtl ? -10 : 10 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full relative overflow-hidden backdrop-blur-md bg-gradient-to-r to-transparent border-l-4 border-y border-r border-y-white/10 border-r-white/10 ${themeColors[theme]} ${hoverColors[theme]} px-6 py-3 transition-colors duration-300 text-left font-mono font-bold tracking-widest uppercase flex flex-col justify-center ${active ? 'bg-white/10' : ''}`}
        style={ isRtl 
            ? { clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))', textAlign: 'right' }
            : { clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' } 
        }
      >
        <span className={`relative z-10 flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
          <span className="text-xl drop-shadow-md">{label}</span>
          <ChevronRight size={20} className={`opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 ${isRtl ? 'rotate-180' : ''} ${isHovered ? 'translate-x-0' : (isRtl ? 'translate-x-2' : '-translate-x-2')}`} />
        </span>
        {subLabel && (
          <span className="block text-xs mt-1 text-white/50 group-hover:text-white/80 transition-colors uppercase font-sans tracking-normal">
            {subLabel}
          </span>
        )}
        
        {/* Animated Scanline Effect */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-[200%]"
          initial={{ y: "-100%" }}
          animate={isHovered ? { y: "100%" } : { y: "-100%" }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: isRtl ? -10 : 10 }}
            animate={{ opacity: 1, x: isRtl ? -20 : 20 }}
            exit={{ opacity: 0, x: isRtl ? -10 : 10 }}
            className={`absolute ${isRtl ? 'right-full mr-4' : 'left-full ml-4'} top-1/2 -translate-y-1/2 w-48 p-3 backdrop-blur-xl bg-black/60 border border-white/10 text-white/80 text-xs font-sans rounded-md pointer-events-none hidden md:block`}
          >
            <div className={`w-1 h-full absolute ${isRtl ? 'right-0' : 'left-0'} top-0 bg-${theme === 'blue' ? 'blue' : theme === 'purple' ? 'purple' : theme === 'gold' ? 'amber' : theme === 'gray' ? 'gray' : 'emerald'}-500/50`}></div>
            {tooltip}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function MainMenu({ onStart }: { onStart: () => void }) {
  const { t, language, setLanguage, isRtl } = useLanguage();
  const [activePanel, setActivePanel] = useState<'main' | 'upgrade' | 'settings' | 'achievements'>('main');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [difficulty, setDifficultyState] = useState<'easy'|'normal'|'hard'|'nightmare'>(() => {
    return (localStorage.getItem('gameDifficulty') as 'easy'|'normal'|'hard'|'nightmare') || 'normal';
  });

  const setDifficulty = (level: 'easy'|'normal'|'hard'|'nightmare') => {
    setDifficultyState(level);
    localStorage.setItem('gameDifficulty', level);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      const x = (e.clientX / clientWidth - 0.5) * 20;
      const y = (e.clientY / clientHeight - 0.5) * 20; 
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const launchGame = () => {
    playSound('warp');
    setTimeout(() => {
      onStart();
    }, 800);
  };

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 flex items-center justify-start px-8 md:px-20 bg-transparent text-white z-50 overflow-hidden ${isRtl ? 'font-arabic' : 'font-sans'}`}
    >
      {/* Dynamic Animated Space Background */}
      <div className="absolute inset-0 -z-20 bg-[#050508]">
         <motion.div 
           animate={{ x: mousePos.x * -2, y: mousePos.y * -2 }}
           transition={{ type: "spring", stiffness: 50, damping: 20 }}
           className="absolute inset-[-5%] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-screen"
         />
         <motion.div 
           animate={{ x: mousePos.x * -4, y: mousePos.y * -4 }}
           transition={{ type: "spring", stiffness: 40, damping: 20 }}
           className="absolute inset-[-10%] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-screen scale-150"
         />
         <motion.div 
           animate={{ x: mousePos.x * 3, y: mousePos.y * 3 }}
           className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-purple-600/10 rounded-full blur-[100px] -z-10 mix-blend-screen"
         />
         <motion.div 
           animate={{ x: mousePos.x * 2, y: mousePos.y * 2 }}
           className="absolute bottom-1/4 right-1/4 w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px] -z-10 mix-blend-screen"
         />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex h-full py-20 md:py-10">
        <AnimatePresence mode="wait">
          {activePanel === 'main' && (
            <motion.div 
              key="main-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
              transition={{ duration: 0.5 }}
              className={`w-full flex flex-col md:flex-row gap-12 items-center md:items-start h-full`}
            >
              {/* Left Nav Bar */}
              <div className={`flex flex-col flex-shrink-0 relative z-20 ${isRtl ? 'ml-auto text-right md:-ml-0' : ''}`}>
                <div className="mb-12 cursor-default">
                  <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.8)] uppercase">
                    Neon Strike
                  </h1>
                  <div className={`h-1 w-full bg-gradient-to-r ${isRtl ? 'from-transparent to-blue-500' : 'from-blue-500 to-transparent'} mt-2`}></div>
                  <p className="text-gray-400 text-xs mt-2 uppercase tracking-[0.3em] font-mono">v2.4.1 Nexus</p>
                </div>

                <SciFiButton 
                  label={t('startGame')} 
                  tooltip={t('launchNewMission')} 
                  theme="blue" 
                  onClick={launchGame} 
                />
                <SciFiButton 
                  label={t('continue')} 
                  subLabel="Sector 4 • 85%"
                  tooltip={t('resumeCheckpoint')} 
                  theme="purple" 
                  onClick={() => {}} 
                />
                <SciFiButton 
                  label={t('upgradeShip')} 
                  tooltip={t('enhanceWeapons')} 
                  theme="gold" 
                  onClick={() => setActivePanel('upgrade')} 
                />
                <SciFiButton 
                  label={t('settings')} 
                  tooltip={t('configureGame')} 
                  theme="gray" 
                  onClick={() => setActivePanel('settings')} 
                />
                <SciFiButton 
                  label={t('achievements')} 
                  tooltip={t('viewMedals')} 
                  theme="green" 
                  onClick={() => setActivePanel('achievements')} 
                />
              </div>

              {/* Right Abstract Ship */}
              <div className="flex-1 w-full h-[60vh] md:h-full relative flex items-center justify-center pointer-events-none md:pointer-events-auto mt-8 md:mt-0">
                <motion.div 
                  animate={{ y: [0, -15, 0], rotateX: [10, 15, 10] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-[300px] h-[250px] md:w-[400px] md:h-[300px] relative mix-blend-screen"
                  style={{ perspective: 1000 }}
                >
                  <div className="absolute inset-0 border border-blue-500/30 bg-blue-900/10 backdrop-blur-sm shadow-[0_0_50px_rgba(59,130,246,0.3)] rounded-full [transform:rotateX(60deg)] pointer-events-none" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(34,211,238,1)]" />
                  <div className="absolute top-1/2 left-1/4 w-3 h-20 bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,1)] filter blur-[2px]" />
                  <div className="absolute top-1/2 right-1/4 w-3 h-20 bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,1)] filter blur-[2px]" />
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* UPGRADE PANEL */}
          {activePanel === 'upgrade' && (
            <motion.div 
              key="upgrade-view"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 z-50 overflow-hidden"
            >
              <Shop onClose={() => setActivePanel('main')} />
            </motion.div>
          )}

          {/* SETTINGS PANEL */}
          {activePanel === 'settings' && (
            <motion.div 
              key="settings-view"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.4 }}
              className="w-full flex items-center justify-center"
            >
              <div className="w-full max-w-2xl backdrop-blur-xl bg-black/50 border border-gray-500/30 p-8 md:p-12 shadow-[0_0_40px_rgba(255,255,255,0.05)] relative overflow-hidden flex flex-col gap-6"
                   style={{ clipPath: 'polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)' }}>
                   
                   <h2 className="text-2xl font-black italic text-gray-300 uppercase tracking-widest flex items-center border-b border-white/10 pb-4">
                     <Volume2 className={`${isRtl ? 'ml-3' : 'mr-3'} text-cyan-400`} /> {t('settings')}
                   </h2>

                   <div className="space-y-4 font-mono text-sm text-gray-300">
                     <div className="flex items-center justify-between hover:bg-white/5 p-2 rounded cursor-pointer transition-colors">
                       <span>{t('audio')}</span>
                       <div className="w-48 h-2 bg-white/10"><div className="w-[80%] h-full bg-cyan-400"></div></div>
                     </div>
                     <div className="flex items-center justify-between hover:bg-white/5 p-2 rounded cursor-pointer transition-colors mt-4">
                       <span>{t('graphics')}</span>
                       <span className="text-cyan-400">ULTRA</span>
                     </div>
                     <div className="flex items-center justify-between hover:bg-white/5 p-2 rounded cursor-pointer transition-colors">
                       <span>{t('controls')}</span>
                       <div className="w-48 h-2 bg-white/10"><div className="w-[60%] h-full bg-cyan-400"></div></div>
                     </div>
                     
                     {/* LANGUAGE TOGGLE */}
                     <div className="flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-white/5 p-2 rounded cursor-pointer transition-colors mt-4 border-t border-white/5 pt-4">
                       <span className="mb-2 md:mb-0">{t('language')}</span>
                       <div className="flex gap-2">
                         <button 
                           onClick={() => setLanguage('en')} 
                           dir="ltr"
                           className={`px-4 py-1 border ${language === 'en' ? 'border-cyan-400 bg-cyan-900/40 text-white' : 'border-gray-600 text-gray-400 hover:text-white'} transition-colors font-sans`}>
                           {t('english')}
                         </button>
                         <button 
                           onClick={() => setLanguage('ar')} 
                           dir="rtl"
                           className={`px-4 py-1 border ${language === 'ar' ? 'border-cyan-400 bg-cyan-900/40 text-white' : 'border-gray-600 text-gray-400 hover:text-white'} transition-colors font-arabic`}>
                           {t('arabic')}
                         </button>
                       </div>
                     </div>

                     {/* DIFFICULTY TOGGLE */}
                     <div className="flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-white/5 p-2 rounded cursor-pointer transition-colors pt-2">
                       <span className="mb-2 md:mb-0">{t('difficulty')}</span>
                       <div className={`flex gap-2 flex-wrap ${isRtl ? 'flex-row-reverse' : ''}`}>
                         {(['easy', 'normal', 'hard', 'nightmare'] as const).map(level => {
                            const isSelected = difficulty === level;
                            const colors = level === 'nightmare' 
                                ? (isSelected ? 'border-red-500 bg-red-900/40 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'border-gray-600 text-red-400 hover:text-red-300')
                                : (isSelected ? 'border-cyan-400 bg-cyan-900/40 text-white' : 'border-gray-600 text-gray-400 hover:text-white');
                            return (
                              <button 
                                key={level}
                                onClick={() => setDifficulty(level)} 
                                className={`px-3 py-1 text-xs border ${colors} transition-colors tracking-widest`}>
                                {t(level as any)}
                              </button>
                            );
                         })}
                       </div>
                     </div>
                   </div>

                   <button onClick={() => setActivePanel('main')} className="mt-8 self-start text-sm text-gray-400 hover:text-white font-mono uppercase bg-transparent border border-gray-600 hover:border-gray-400 px-4 py-2 transition-colors">
                     {t('backToMain')}
                   </button>
                </div>
            </motion.div>
          )}
          
          {/* ACHIEVEMENTS PANEL */}
          {activePanel === 'achievements' && (
            <motion.div 
              key="achievements-view"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.4 }}
              className="w-full flex items-center justify-center"
            >
              <div className="w-full max-w-2xl backdrop-blur-xl bg-emerald-900/10 border border-emerald-500/30 p-8 md:p-12 shadow-[0_0_40px_rgba(16,185,129,0.1)] relative overflow-hidden"
                   style={{ clipPath: 'polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)' }}>
                   
                   <h2 className="text-2xl font-black italic text-emerald-400 mb-6 uppercase tracking-widest flex items-center border-b border-emerald-400/20 pb-4">
                     <Award className={`${isRtl ? 'ml-3' : 'mr-3'}`} /> {t('achievements')}
                   </h2>

                   <div className="space-y-3 h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                     {[
                       { title: 'First Blood', desc: 'Destroy 100 enemy scouts', done: true },
                       { title: 'Iron Clad', desc: 'Survive to level 10 without damage', done: true },
                       { title: 'Dreadnought Hunter', desc: 'Defeat the Abyssal Boss', done: false },
                       { title: 'Nova Core', desc: 'Collect 50 weapon powerups', done: true },
                       { title: 'Untouchable', desc: 'Dodge 1000 projectiles', done: false },
                     ].map((ach, i) => (
                       <div key={i} className={`flex items-start p-3 border ${ach.done ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-gray-700/50 opacity-50'} transition-colors gap-4`}>
                         <Shield className={`mt-1 flex-shrink-0 ${ach.done ? 'text-emerald-400' : 'text-gray-600'}`} size={24} />
                         <div>
                           <h3 className={`font-mono font-bold uppercase text-sm ${ach.done ? 'text-white' : 'text-gray-400'}`}>{ach.title}</h3>
                           <p className="text-xs text-gray-500 uppercase">{ach.desc}</p>
                         </div>
                       </div>
                     ))}
                   </div>

                   <button onClick={() => setActivePanel('main')} className="mt-6 self-start text-sm text-gray-400 hover:text-white font-mono uppercase bg-transparent border border-gray-600 hover:border-emerald-400 hover:text-emerald-300 px-4 py-2 transition-colors">
                     {t('backToMain')}
                   </button>
                </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
      
      {/* HUD Info Bottom Bar */}
      <div className="absolute bottom-0 left-0 w-full h-10 border-t border-white/5 bg-black/40 backdrop-blur-md flex items-center justify-between px-8 text-xs font-mono text-gray-500 tracking-widest uppercase z-10">
        <div className="flex gap-6">
          <span>Armor <span className="text-cyan-400">85%</span></span>
          <span className="hidden md:inline">Power Level <span className="text-purple-400">92%</span></span>
        </div>
        <div className="flex gap-6">
          <span>Server <span className="text-emerald-400">Online</span></span>
          <span>Ping <span className="text-white text-opacity-80">24ms</span></span>
        </div>
      </div>
    </div>
  );
}
