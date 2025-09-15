import React from 'react';
import PauseManager from '../managers/PauseManager.js';

const PauseMenu = ({ onContinue, onMainMenu, onSettings }) => {
  const handleContinue = () => {
    const pauseManager = PauseManager.get();
    pauseManager.resumeGame();
    onContinue();
  };

  const handleMainMenu = () => {
    const pauseManager = PauseManager.get();
    pauseManager.resumeGame();
    onMainMenu();
  };

  const handleSettings = () => {
    onSettings();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <div className="bg-gray-900 p-8 rounded-lg text-white text-center w-[500px] flex flex-col justify-center items-center gap-[30px] border border-gray-600">
        {/* Pause Title */}
        <div className="text-4xl font-bold text-gray-100">
          GAME PAUSED
        </div>

        {/* Menu Options */}
        <div className="flex flex-col gap-[15px] w-full max-w-[350px]">
          {/* Continue Button */}
          <button
            onClick={handleContinue}
            className="w-full h-[50px] border border-gray-500 cursor-pointer transition-all duration-200 hover:bg-gray-700 hover:border-gray-400 flex items-center justify-center text-white text-lg font-semibold bg-gray-800 rounded"
          >
            Continue
          </button>

          {/* Settings Button */}
          <button
            onClick={handleSettings}
            className="w-full h-[50px] border border-gray-500 cursor-pointer transition-all duration-200 hover:bg-gray-700 hover:border-gray-400 flex items-center justify-center text-white text-lg font-semibold bg-gray-800 rounded"
          >
            Settings
          </button>

          {/* Main Menu Button */}
          <button
            onClick={handleMainMenu}
            className="w-full h-[50px] border border-gray-500 cursor-pointer transition-all duration-200 hover:bg-gray-700 hover:border-gray-400 flex items-center justify-center text-white text-lg font-semibold bg-gray-800 rounded"
          >
            Main Menu
          </button>
        </div>

        {/* ESC Hint */}
        <div className="text-sm text-gray-400 mt-2">
          Press ESC again to continue
        </div>
      </div>
    </div>
  );
};

export default PauseMenu;