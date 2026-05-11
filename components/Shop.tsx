import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Zap, Crosshair, Box, Rocket, Package, Paintbrush, 
  ChevronDown, CheckCircle2, Home, Crosshair as MissionsIcon, 
  Plane as HangarIcon, ShoppingCart, Trophy, Settings, Plus,
  Hexagon, Target, X
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// --- Simple Audio feedback ---
const playSound = (type: 'hover' | 'click' | 'buy') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'hover') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'click') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'buy') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(1600, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }
  } catch(e) {}
};

type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';
type Category = 'WEAPONS' | 'DEFENSE' | 'ENGINES' | 'ABILITIES' | 'SKINS' | 'BUNDLES';

interface ShopItem {
  id: string;
  nameKey: any; // We'll map to t later
  rarity: ItemRarity;
  category: Category;
  damage?: number;
  fireRate?: string;
  energy?: number;
  price: number;
  descKey: any;
}

const WEAPONS_DATA: ShopItem[] = [
  { id: 'w1', nameKey: 'laserCannon', rarity: 'common', category: 'WEAPONS', damage: 120, fireRate: '8.0/s', energy: 15, price: 12000, descKey: 'laserCannonDesc' },
  { id: 'w2', nameKey: 'plasmaGun', rarity: 'rare', category: 'WEAPONS', damage: 250, fireRate: '4.5/s', energy: 25, price: 35000, descKey: 'plasmaGunDesc' },
  { id: 'w3', nameKey: 'missileLauncher', rarity: 'epic', category: 'WEAPONS', damage: 750, fireRate: '1.2/s', energy: 40, price: 75000, descKey: 'missileLauncherDesc' },
  { id: 'w4', nameKey: 'ionBeam', rarity: 'epic', category: 'WEAPONS', damage: 600, fireRate: '2.0/s', energy: 35, price: 80000, descKey: 'ionBeamDesc' },
  { id: 'w5', nameKey: 'empBlast', rarity: 'legendary', category: 'WEAPONS', damage: 1000, fireRate: '0.8/s', energy: 60, price: 150000, descKey: 'empBlastDesc' },
];

const rarityColors: Record<ItemRarity, string> = {
  common: 'text-blue-200 border-blue-400/40 shadow-[0_0_15px_rgba(59,130,246,0.2)] bg-[#0c1428]',
  rare: 'text-purple-300 border-purple-400/40 shadow-[0_0_15px_rgba(168,85,247,0.2)] bg-[#100720]',
  epic: 'text-amber-400 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.3)] bg-[#1a1103]',
  legendary: 'text-yellow-300 border-yellow-400/50 shadow-[0_0_25px_rgba(250,204,21,0.4)] bg-[#170e17]'
};

const raritySolidColors: Record<ItemRarity, string> = {
  common: '#60a5fa', 
  rare: '#a855f7', 
  epic: '#f59e0b', 
  legendary: '#fde047' 
};

export default function Shop({ onClose }: { onClose: () => void }) {
  const { t, isRtl } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<Category>('WEAPONS');
  const [selectedItem, setSelectedItem] = useState<ShopItem>(WEAPONS_DATA[2]);
  const [credits, setCredits] = useState(125450);
  const [premiumCredits, setPremiumCredits] = useState(2350);
  const [power, setPower] = useState(9850);
  const [purchased, setPurchased] = useState<string[]>([]);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const stats = { damage: 1250, defense: 1100, speed: 1350, energy: 1000 };

  const menuItems: { id: Category; labelKey: any; icon: any }[] = [
    { id: 'WEAPONS', labelKey: 'weapons', icon: Crosshair },
    { id: 'DEFENSE', labelKey: 'defense', icon: Shield },
    { id: 'ENGINES', labelKey: 'engines', icon: Rocket },
    { id: 'ABILITIES', labelKey: 'abilities', icon: Zap },
    { id: 'SKINS', labelKey: 'skins', icon: Paintbrush },
    { id: 'BUNDLES', labelKey: 'bundles', icon: Package },
  ];

  const handlePurchase = (item: ShopItem) => {
    if (purchased.includes(item.id) || credits < item.price || isPurchasing) return;
    playSound('buy');
    setIsPurchasing(true);
    
    let currentCredits = credits;
    const interval = setInterval(() => {
      currentCredits -= Math.ceil(item.price / 20);
      if (currentCredits <= credits - item.price) {
        clearInterval(interval);
        setCredits(credits - item.price);
        setPurchased([...purchased, item.id]);
        setPower(p => p + Math.floor(item.price / 100));
        setIsPurchasing(false);
      } else {
        setCredits(currentCredits);
      }
    }, 20);
  };

  return (
    <div className={`absolute inset-0 bg-[#02040b] text-white flex flex-col z-50 overflow-hidden select-none ${isRtl ? 'font-arabic' : 'font-sans'}`}>
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,#101633_0%,#02040b_70%)] opacity-80" />
      <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-screen" />
      
      {/* Scrollable Container */}
      <div className="relative z-10 w-full h-full flex flex-col overflow-y-auto overflow-x-hidden custom-scrollbar">
        
        {/* --- TOP BAR --- */}
        <div className="w-full flex items-center justify-between px-6 md:px-10 py-5 border-b border-blue-900/40 bg-black/40 backdrop-blur-md sticky top-0 z-50">
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-black italic tracking-widest text-[#e2e8f0] drop-shadow-[0_0_10px_rgba(96,165,250,0.5)] leading-none uppercase">
              {t('shopTitle')}
            </h1>
            <span className="text-blue-300/80 text-[10px] md:text-xs tracking-[0.2em] uppercase font-bold mt-1">
              {t('upgradeYourShipTitle')}
            </span>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6">
            <div className={`flex items-center gap-2 md:gap-3 bg-[#0a1120]/80 border border-blue-500/30 px-3 md:px-4 py-1.5 shadow-[0_0_15px_rgba(59,130,246,0.15)] ${isRtl ? 'transform skew-x-[15deg] flex-row-reverse' : 'transform skew-x-[-15deg]'}`}>
              <Hexagon className={`text-blue-400 w-4 h-4 md:w-5 md:h-5 fill-blue-500/20 ${isRtl ? 'transform skew-x-[-15deg]' : 'transform skew-x-[15deg]'}`} />
              <div className={`flex flex-col -mt-1 ${isRtl ? 'transform skew-x-[-15deg] text-right' : 'transform skew-x-[15deg]'}`}>
                <span className="text-[8px] md:text-[10px] text-blue-300 font-bold uppercase tracking-widest leading-none mt-1">{t('credits')}</span>
                <span className="font-mono font-bold tracking-wider text-white text-sm md:text-base leading-none">
                  {credits.toLocaleString()}
                </span>
              </div>
            </div>
            <div className={`flex items-center gap-2 md:gap-3 bg-[#171108]/80 border border-amber-500/30 px-3 md:px-4 py-1.5 shadow-[0_0_15px_rgba(245,158,11,0.1)] ${isRtl ? 'transform skew-x-[15deg] flex-row-reverse' : 'transform skew-x-[-15deg]'}`}>
              <Hexagon className={`text-amber-400 w-4 h-4 md:w-5 md:h-5 fill-amber-500/20 ${isRtl ? 'transform skew-x-[-15deg]' : 'transform skew-x-[15deg]'}`} />
              <div className={`flex flex-col -mt-1 ${isRtl ? 'transform skew-x-[-15deg] text-right' : 'transform skew-x-[15deg]'}`}>
                <span className="text-[8px] md:text-[10px] text-amber-300 font-bold uppercase tracking-widest leading-none mt-1">{t('premium')}</span>
                <span className="font-mono font-bold tracking-wider text-white text-sm md:text-base leading-none">
                  {premiumCredits.toLocaleString()}
                </span>
              </div>
            </div>
            <button className={`bg-blue-600/20 hover:bg-blue-500/40 border border-blue-500/50 p-1.5 md:p-2 transition-colors ${isRtl ? 'transform skew-x-[15deg]' : 'transform skew-x-[-15deg]'}`}>
              <Plus className={`w-5 h-5 text-blue-100 ${isRtl ? 'transform skew-x-[-15deg]' : 'transform skew-x-[15deg]'}`} />
            </button>
          </div>
        </div>

        {/* --- UPPER SECTION (Hero, Ship, Stats) --- */}
        <div className="w-full max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-[200px_1fr_250px] gap-6 px-6 pt-10 pb-6 relative">
          
          {/* TITLE OVERLAY (Centered) */}
          <div className="absolute top-4 left-0 w-full flex flex-col items-center pointer-events-none z-20">
            <h2 className="text-2xl md:text-3xl font-black italic tracking-widest text-[#f1f5f9] drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">VOID HUNTER</h2>
            <p className="text-gray-400 tracking-[0.2em] uppercase text-xs mt-1 font-mono">{t('classInterceptor')}</p>
          </div>

          {/* Left Vertical Menu */}
          <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible z-20 pt-8 pb-4 md:py-0 px-2 md:px-0 scrollbar-hide">
            {menuItems.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onMouseEnter={() => playSound('hover')}
                  onClick={() => { playSound('click'); setActiveCategory(cat.id); }}
                  className={`flex items-center gap-3 px-4 py-3 transition-all duration-300 border backdrop-blur-sm whitespace-nowrap min-w-[150px] md:min-w-0
                    ${isRtl ? 'transform skew-x-[10deg] mr-0 md:mr-4 flex-row-reverse' : 'transform skew-x-[-10deg] ml-0 md:ml-4'} 
                    ${active ? 'border-blue-400 bg-blue-900/40 text-white shadow-[inset_0_0_20px_rgba(59,130,246,0.3),0_0_15px_rgba(59,130,246,0.4)]' 
                             : 'border-blue-900/50 bg-[#050b1a]/60 text-blue-300/60 hover:text-blue-200 hover:border-blue-500/50 hover:bg-blue-900/20'}`}
                  style={active ? { [isRtl ? 'marginRight' : 'marginLeft']: '0px' } : {}}
                >
                  <div className={`flex items-center justify-center w-6 ${isRtl ? 'transform skew-x-[-10deg]' : 'transform skew-x-[10deg]'}`}>
                    <cat.icon className={`w-5 h-5 ${active ? 'text-blue-300' : 'text-blue-500/50'}`} />
                  </div>
                  <span className={`font-bold tracking-[0.15em] text-xs md:text-sm uppercase ${isRtl ? 'transform skew-x-[-10deg]' : 'transform skew-x-[10deg]'}`}>
                    {t(cat.labelKey)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Center 3D Space (Ship & Hologram) */}
          <div className="relative h-[300px] md:h-[400px] flex items-center justify-center pointer-events-none mt-4 md:-mt-8">
            <motion.div 
              animate={{ y: [0, -15, 0], rotateY: [15, 20, 15] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-full h-full max-w-[400px]"
              style={{ perspective: 1200, transformStyle: 'preserve-3d' }}
            >
              {/* Holographic Base */}
              <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[120%] h-[120px] rounded-[50%] border border-cyan-500/40 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.2)_0%,transparent_60%)] [transform:rotateX(75deg)] shadow-[0_0_40px_rgba(34,211,238,0.3)]">
                 <div className="absolute inset-2 rounded-[50%] border-2 border-dashed border-cyan-400/30 animate-[spin_60s_linear_infinite]"></div>
                 <div className="absolute inset-8 rounded-[50%] border border-blue-400/20"></div>
                 <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(34,211,238,0.1)_0deg,transparent_10deg,transparent_350deg,rgba(34,211,238,0.1)_360deg)] animate-[spin_10s_linear_infinite]"></div>
              </div>

              {/* 3D Ship Component (No text, pure CSS shapes) */}
              <div className={`absolute inset-0 flex items-center justify-center [transform:rotateX(15deg)_rotateZ(${isRtl ? '5' : '-5'}deg)]`}>
                <div className="w-[80%] h-[70px] bg-gradient-to-r from-gray-800 via-gray-600 to-gray-800 border border-gray-500 rounded-[100%_40%_40%_100%] shadow-[inset_0_-10px_20px_rgba(0,0,0,0.8),0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                   <div className="absolute top-2 left-[20%] w-[50%] h-1 bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></div>
                   <div className="absolute bottom-2 left-[30%] w-[40%] h-1 bg-purple-500 shadow-[0_0_10px_#a855f7]"></div>
                   <div className="absolute top-[-5px] left-[35%] w-[30%] h-[25px] rounded-full bg-black border border-gray-600 shadow-[inset_0_2px_15px_rgba(168,85,247,0.6)] [transform:skewX(-25deg)]"></div>
                </div>
                <div className="absolute top-[20%] left-[10%] w-[60%] h-[50px] bg-gray-800 border-l border-t border-gray-500 [clip-path:polygon(20%_0%,100%_100%,0%_100%)] shadow-2xl flex items-end justify-center pb-2 z-10">
                  <div className={`w-[80%] h-1.5 ${selectedItem ? `bg-[${raritySolidColors[selectedItem.rarity]}] shadow-[0_0_15px_${raritySolidColors[selectedItem.rarity]}]` : 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]'}`}></div>
                </div>
                <div className="absolute bottom-[20%] left-[15%] w-[50%] h-[40px] bg-gray-900 border-l border-b border-gray-700 [clip-path:polygon(0%_0%,100%_0%,20%_100%)] shadow-2xl flex items-start justify-center pt-1 -z-10">
                  <div className={`w-[70%] h-1 ${selectedItem ? `bg-[${raritySolidColors[selectedItem.rarity]}] opacity-60` : 'bg-cyan-600'}`}></div>
                </div>
              </div>
            </motion.div>
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto cursor-pointer group">
               <span className="text-[10px] uppercase font-bold tracking-widest text-blue-300 group-hover:text-blue-100 transition-colors">{t('viewShipStats')}</span>
               <ChevronDown className="w-4 h-4 text-blue-400 group-hover:translate-y-1 transition-transform" />
            </div>
          </div>

          {/* Right Stats & Badge */}
          <div className="flex flex-col gap-6 z-20 pt-8">
            <div className={`self-end relative ${isRtl ? 'self-start' : ''}`}>
              <div className={`bg-[#1a0b26]/90 border border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.3)] px-6 py-2 flex items-center gap-3 ${isRtl ? 'transform skew-x-[15deg] flex-row-reverse' : 'transform skew-x-[-15deg]'}`}>
                <div className={`flex flex-col items-end ${isRtl ? 'transform skew-x-[-15deg] items-start' : 'transform skew-x-[15deg]'}`}>
                  <span className="text-purple-300 text-[9px] tracking-widest font-bold uppercase leading-none mt-1">{t('power')}</span>
                  <div className="text-2xl md:text-3xl font-mono font-black text-white leading-none mt-1">
                    {power.toLocaleString()}
                  </div>
                </div>
                <div className={`${isRtl ? 'transform skew-x-[-15deg]' : 'transform skew-x-[15deg]'}`}>
                   <Shield className="w-6 h-6 text-purple-400 fill-purple-500/20" />
                </div>
              </div>
            </div>

            <div className={`bg-[#050a14]/80 border border-blue-900/50 backdrop-blur-md p-4 max-w-[250px] ${isRtl ? 'mr-auto' : 'ml-auto'}`}>
              <h3 className="text-[10px] font-bold tracking-[0.2em] text-blue-200 mb-4 uppercase border-b border-blue-900/50 pb-2">{t('currentStats')}</h3>
              <div className="space-y-4">
                {[
                  { label: t('damage'), val: stats.damage, color: 'bg-orange-500', shadow: 'shadow-[0_0_8px_#f97316]' },
                  { label: t('armor'), val: stats.defense, color: 'bg-green-500', shadow: 'shadow-[0_0_8px_#22c55e]' },
                  { label: t('speed'), val: stats.speed, color: 'bg-blue-500', shadow: 'shadow-[0_0_8px_#3b82f6]' },
                  { label: t('energy'), val: stats.energy, color: 'bg-cyan-500', shadow: 'shadow-[0_0_8px_#06b6d4]' },
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <div className={`flex justify-between text-[10px] font-mono uppercase text-gray-300 items-baseline ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <span>{stat.label}</span> 
                      <span className="font-bold text-white text-xs">{stat.val.toLocaleString()}</span>
                    </div>
                    <div className={`w-full bg-[#101726] h-1.5 overflow-hidden flex border border-white/5 ${isRtl ? 'justify-end' : ''}`}>
                       <div className={`h-full ${stat.color} ${stat.shadow}`} style={{ width: `${(stat.val/2000)*100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- MIDDLE WEAPONS GRID --- */}
        <div className="w-full max-w-[1200px] mx-auto px-6 mt-2 relative z-20">
          <div className={`flex justify-between items-end mb-4 border-b border-blue-900/30 pb-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <h2 className="text-lg font-bold tracking-widest text-[#e2e8f0] uppercase">{t(activeCategory.toLowerCase() as any) || activeCategory}</h2>
            <div className={`flex items-center gap-2 text-xs text-blue-300/70 border border-blue-900/50 px-3 py-1 bg-[#050b1a] cursor-pointer hover:text-blue-200 hover:border-blue-700/50 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <span className="uppercase text-[9px] tracking-wider">{t('sortByRarity')}</span>
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>

          <div className={`flex gap-4 overflow-x-auto pb-6 pt-2 snap-x custom-scrollbar ${isRtl ? 'flex-row-reverse' : ''}`}>
            {WEAPONS_DATA.map((item) => {
              const isSelected = selectedItem.id === item.id;
              const isOwned = purchased.includes(item.id);
              const rColorClasses = rarityColors[item.rarity];
              const rHex = raritySolidColors[item.rarity];
              
              return (
                <div
                  key={item.id}
                  onClick={() => { playSound('click'); setSelectedItem(item); }}
                  onMouseEnter={() => playSound('hover')}
                  className={`snap-center flex-shrink-0 w-64 border transition-all duration-300 cursor-pointer p-4 flex flex-col justify-between relative group
                    ${isSelected ? `border-[${rHex}]/60 shadow-[0_0_20px_${rHex}40] bg-[${rHex}10]` : rColorClasses}
                    ${isSelected ? 'translate-y-[-4px]' : 'hover:translate-y-[-2px]'}
                  `}
                  style={isSelected ? { borderColor: rHex, backgroundColor: `${rHex}10`, boxShadow: `0 0 20px ${rHex}40` } : {}}
                >
                  <div className="text-center mb-6">
                    <h4 className="font-bold tracking-wider uppercase text-sm text-[#f8fafc] leading-tight mb-1">{t(item.nameKey)}</h4>
                    <span className="text-[9px] uppercase font-bold tracking-widest" style={{ color: rHex }}>{t(item.rarity as any)}</span>
                  </div>

                  <div className="w-full aspect-[4/3] flex items-center justify-center mb-6 relative">
                    <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-1/2 bg-[radial-gradient(ellipse_at_center,currentColor,transparent_70%)] opacity-20" style={{ color: rHex }}></div>
                    <Target className="w-16 h-16 opacity-80" style={{ color: rHex }} />
                  </div>
                  
                  <div className="space-y-1.5 mb-6 font-mono text-[10px] border-t border-white/5 pt-4">
                    {item.damage && <div className={`flex justify-between ${isRtl ? 'flex-row-reverse' : ''}`}><span className="uppercase text-gray-400">{t('damage')}</span> <span className="text-[#e2e8f0] font-bold">{item.damage}</span></div>}
                    {item.fireRate && <div className={`flex justify-between ${isRtl ? 'flex-row-reverse' : ''}`}><span className="uppercase text-gray-400">{t('fireRate')}</span> <span className="text-[#e2e8f0] font-bold">{item.fireRate}</span></div>}
                    {item.energy && <div className={`flex justify-between ${isRtl ? 'flex-row-reverse' : ''}`}><span className="uppercase text-gray-400">{t('energy')}</span> <span className="text-[#e2e8f0] font-bold">{item.energy}</span></div>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className={`flex items-center justify-center gap-2 border px-3 py-1.5 bg-black/40 ${isRtl ? 'flex-row-reverse' : ''}`} style={{ borderColor: `${rHex}30` }}>
                       <Hexagon fill={`${rHex}20`} className="w-3 h-3" style={{ color: rHex }} />
                       <span className="font-mono font-bold text-sm tracking-wider" style={{ color: isSelected ? '#fff' : rHex }}>
                         {item.price.toLocaleString()}
                       </span>
                    </div>
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); handlePurchase(item); }}
                      disabled={isOwned || credits < item.price || isPurchasing}
                      className={`w-full py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                        isOwned 
                          ? 'bg-[#0f172a] text-gray-500 border border-gray-700' 
                          : `border hover:brightness-125 hover:text-white`
                      }`}
                      style={!isOwned ? { borderColor: rHex, color: rHex, backgroundColor: isSelected ? `${rHex}20` : 'transparent', textShadow: isSelected ? `0 0 5px ${rHex}` : 'none'} : {}}
                    >
                      {isOwned ? t('equipped') : t('buy')}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* --- LOWER SECTION (Detail & Compare) --- */}
        <AnimatePresence mode="wait">
        {selectedItem && (
          <motion.div 
            key={selectedItem.id}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className={`w-full max-w-[1200px] mx-auto px-6 mt-4 relative z-20 mb-8`}
          >
            <div className={`w-full bg-[#030712] border border-gray-800 flex flex-col shadow-[0_10px_30px_rgba(0,0,0,0.8)] relative ${isRtl ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
              
              <div className={`w-full md:w-[40%] border-b md:border-b-0 p-8 flex items-center justify-center relative overflow-hidden min-h-[250px] ${isRtl ? 'md:border-l border-gray-800' : 'md:border-r border-gray-800'}`}>
                <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, ${raritySolidColors[selectedItem.rarity]}15 0%, transparent 70%)` }}></div>
                
                {purchased.includes(selectedItem.id) && (
                  <div className={`absolute top-4 ${isRtl ? 'right-4' : 'left-4'} flex items-center gap-2 text-green-400 border border-green-500/40 bg-green-900/20 px-3 py-1 text-xs font-bold tracking-widest uppercase rounded-full`}>
                    <CheckCircle2 className="w-4 h-4" /> {t('equipped')}
                  </div>
                )}
                <Crosshair className="w-32 h-32 md:w-48 md:h-48 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]" style={{ color: raritySolidColors[selectedItem.rarity] }} />
              </div>

              <div className={`flex-1 p-6 md:p-8 flex flex-col justify-center border-b md:border-b-0 border-gray-800 ${isRtl ? 'md:border-l' : 'md:border-r'}`}>
                <h3 className="text-xl font-black uppercase italic tracking-wider text-[#f1f5f9] mb-1">{t(selectedItem.nameKey)}</h3>
                <span className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: raritySolidColors[selectedItem.rarity] }}>{t(selectedItem.rarity)}</span>
                <p className="text-gray-400 text-[11px] leading-relaxed max-w-sm mb-6">{t(selectedItem.descKey)}</p>
                
                <div className="space-y-4 max-w-sm">
                  {selectedItem.damage && (
                    <div className={`flex items-center gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <span className={`text-[10px] text-gray-500 uppercase font-mono w-16 ${isRtl ? 'text-right' : ''}`}>{t('damage')}</span>
                      <div className={`flex-1 flex gap-1 h-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                         {Array.from({length: 10}).map((_, i) => (
                            <div key={i} className={`flex-1 ${i < (selectedItem.damage! / 150) ? 'bg-orange-500 shadow-[0_0_5px_#f97316]' : 'bg-gray-800'}`}></div>
                         ))}
                      </div>
                      <div className={`flex items-center gap-2 font-mono text-xs w-20 justify-end ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <span className="font-bold text-white">{selectedItem.damage}</span>
                        <span className="text-green-400 text-[9px] font-bold">▲ 250</span>
                      </div>
                    </div>
                  )}
                  {selectedItem.fireRate && (
                    <div className={`flex items-center gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <span className={`text-[10px] text-gray-500 uppercase font-mono w-16 ${isRtl ? 'text-right' : ''}`}>{t('fireRate')}</span>
                      <div className={`flex-1 flex gap-1 h-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                         {Array.from({length: 10}).map((_, i) => (
                            <div key={i} className={`flex-1 ${i < (parseFloat(selectedItem.fireRate!) / 1.5) ? 'bg-red-500 shadow-[0_0_5px_#ef4444]' : 'bg-gray-800'}`}></div>
                         ))}
                      </div>
                      <div className={`flex items-center gap-2 font-mono text-xs w-20 justify-end ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <span className="font-bold text-white">{selectedItem.fireRate}</span>
                        <span className="text-red-400 text-[9px] font-bold">▼ 0.6</span>
                      </div>
                    </div>
                  )}
                  {selectedItem.energy && (
                    <div className={`flex items-center gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <span className={`text-[10px] text-gray-500 uppercase font-mono w-16 ${isRtl ? 'text-right' : ''}`}>{t('energy')}</span>
                      <div className={`flex-1 flex gap-1 h-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                         {Array.from({length: 10}).map((_, i) => (
                            <div key={i} className={`flex-1 ${i < (selectedItem.energy! / 10) ? 'bg-blue-500 shadow-[0_0_5px_#3b82f6]' : 'bg-gray-800'}`}></div>
                         ))}
                      </div>
                      <div className={`flex items-center gap-2 font-mono text-xs w-20 justify-end ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <span className="font-bold text-white">{selectedItem.energy}</span>
                        <span className="text-red-400 text-[9px] font-bold">▼ 10</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full md:w-[250px] p-6 flex flex-col justify-between bg-[#050814]">
                <div>
                  <h4 className="text-[10px] font-bold text-gray-300 tracking-widest uppercase mb-1">{t('compare')}</h4>
                  <p className="text-[9px] text-gray-500 tracking-wider uppercase mb-4 border-b border-gray-800 pb-2">{t('currentEquipped')}</p>
                  <div className="space-y-2 mb-6 font-mono text-[10px]">
                    <div className={`flex justify-between text-gray-400 ${isRtl ? 'flex-row-reverse' : ''}`}><span>{t('damage')}</span> <span className="text-[#f1f5f9]">500</span></div>
                    <div className={`flex justify-between text-gray-400 ${isRtl ? 'flex-row-reverse' : ''}`}><span>{t('fireRate')}</span> <span className="text-[#f1f5f9]">1.8/s</span></div>
                    <div className={`flex justify-between text-gray-400 ${isRtl ? 'flex-row-reverse' : ''}`}><span>{t('energy')}</span> <span className="text-[#f1f5f9]">50</span></div>
                  </div>
                </div>

                <div className="mt-auto">
                  <div className={`flex items-center justify-center gap-2 border border-blue-900/50 bg-[#0a1120] py-2 mb-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <Hexagon fill="#3b82f640" className="w-4 h-4 text-blue-400" />
                    <span className="font-mono font-bold text-lg text-white">{selectedItem.price.toLocaleString()}</span>
                  </div>
                  <button 
                     onClick={() => handlePurchase(selectedItem)}
                     disabled={purchased.includes(selectedItem.id) || credits < selectedItem.price || isPurchasing}
                     className="w-full py-3 bg-[linear-gradient(to_bottom,#f59e0b,#d97706)] text-black font-black uppercase text-sm tracking-widest border border-yellow-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:brightness-110 disabled:opacity-50 disabled:grayscale transition-all"
                  >
                    {purchased.includes(selectedItem.id) ? t('equipped') : t('buy')}
                  </button>
                </div>
              </div>
              
            </div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* --- SPECIAL OFFERS --- */}
        <div className="w-full max-w-[1200px] mx-auto px-6 mt-4 mb-24 relative z-20">
          <div className={`flex justify-between items-end border-b border-blue-900/30 pb-2 mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
             <h2 className="text-sm md:text-base font-bold tracking-widest text-cyan-400 uppercase">{t('specialOffers')}</h2>
             <span className="text-[9px] md:text-[10px] text-gray-400 font-mono tracking-wider">{t('newOffersIn')} <span className={`text-white font-bold ${isRtl ? 'mr-1' : 'ml-1'}`}>12:45:30</span></span>
          </div>

          <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${isRtl ? 'direction-rtl' : ''}`}>
            {[
              { titleKey: 'starterPack', subKey: 'starterPackSub', price: '$4.99', color: 'border-purple-500', bg: 'bg-[#150f28]', highlight: 'text-purple-300' },
              { titleKey: 'elitePack', subKey: 'elitePackSub', price: '$9.99', color: 'border-fuchsia-500', bg: 'bg-[#1d0b26]', highlight: 'text-fuchsia-300' },
              { titleKey: 'galacticPack', subKey: 'galacticPackSub', price: '$14.99', color: 'border-blue-500', bg: 'bg-[#0b1626]', highlight: 'text-blue-300' },
              { titleKey: 'legendaryPack', subKey: 'legendaryPackSub', price: '$29.99', color: 'border-amber-500', bg: 'bg-[#261c0b]', highlight: 'text-amber-300' },
            ].map((pack, idx) => (
              <div key={idx} className={`p-4 border ${pack.color} ${pack.bg} flex flex-col items-center justify-between text-center min-h-[160px] cursor-pointer hover:brightness-125 transition-all shadow-lg shadow-black/50`}>
                 <div>
                   <h4 className={`text-[10px] font-bold tracking-widest uppercase mb-1 ${pack.highlight}`}>{t(pack.titleKey as any)}</h4>
                   <p className="text-[8px] text-white/60 tracking-wider uppercase">{t(pack.subKey as any)}</p>
                 </div>
                 <div className="flex-1 flex items-center justify-center my-2">
                   <Package className={`w-10 h-10 ${pack.highlight} opacity-80`} />
                 </div>
                 <div className={`w-full py-1.5 border ${pack.color} bg-black/40 text-white font-bold font-mono text-sm`}>
                   {pack.price}
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- BOTTOM NAVIGATION BAR --- */}
      <div className="absolute bottom-0 left-0 w-full bg-[#050814]/90 backdrop-blur-lg border-t border-blue-900/50 flex justify-center z-50">
         <div className={`w-full max-w-[800px] flex justify-between items-center px-4 py-2 md:py-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
            {[
              { labelKey: 'home', icon: Home, active: false },
              { labelKey: 'missions', icon: MissionsIcon, active: false },
              { labelKey: 'hangar', icon: HangarIcon, active: false },
              { labelKey: 'shopTitle', icon: ShoppingCart, active: true },
              { labelKey: 'achievements', icon: Trophy, active: false },
              { labelKey: 'settings', icon: Settings, active: false },
            ].map((nav, i) => (
               <div key={i} className={`flex flex-col items-center gap-1 cursor-pointer transition-colors p-2 ${nav.active ? 'text-blue-400' : 'text-gray-500 hover:text-blue-200'}`}>
                 <nav.icon className={`w-5 h-5 md:w-6 md:h-6 ${nav.active ? 'drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]' : ''}`} />
                 <span className={`text-[8px] md:text-[9px] font-bold tracking-widest uppercase ${nav.active ? 'text-blue-200' : ''}`}>{t(nav.labelKey as any)}</span>
                 {nav.active && <div className="absolute bottom-0 w-8 h-0.5 bg-blue-400 shadow-[0_0_10px_#60a5fa]" />}
               </div>
            ))}
         </div>
      </div>

      {/* Close button layered on top securely */}
      <button onClick={onClose} className={`absolute top-6 ${isRtl ? 'left-6 md:left-10' : 'right-6 md:right-10'} z-[60] bg-black/50 border border-white/20 p-2 text-gray-400 hover:text-white hover:border-white transition-colors backdrop-blur-md cursor-pointer`}>
        <X className="w-6 h-6" />
      </button>

    </div>
  );
}
