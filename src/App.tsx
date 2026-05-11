/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Game from './components/Game';
import MainMenu from './components/MainMenu';
import { LanguageProvider } from './contexts/LanguageContext';

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <LanguageProvider>
      <div className="relative w-full h-screen bg-black overflow-hidden select-none touch-none">
        {!isPlaying ? (
          <MainMenu onStart={() => setIsPlaying(true)} />
        ) : (
          <Game onGameOver={() => setIsPlaying(false)} />
        )}
      </div>
    </LanguageProvider>
  );
}
