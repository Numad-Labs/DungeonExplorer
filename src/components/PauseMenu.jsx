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
      {/* Medieval Pause Menu Panel */}
      <div 
        className="relative flex flex-col justify-center items-center"
        style={{
          width: '500px',
          height: '580px',
          backgroundImage: 'url(/assets/HUD/PausedBackground.png)',
          backgroundSize: '100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          padding: '0px 40px 45px 40px',
          filter: 'drop-shadow(0 0 25px rgba(255, 215, 0, 0.4))',
        }}
      >
        {/* Game Paused Title */}
        <div 
          className="mb-8"
          style={{
            width: '280px',
            height: '45px',
            backgroundImage: 'url(/assets/HUD/TittleText.png)',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.8))',
          }}
        />

        {/* Menu Buttons Container */}
        <div className="flex flex-col gap-10 items-center">
          {/* Resume Button */}
          <button
            onClick={handleContinue}
            className="relative group transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              width: '280px',
              height: '45px',
              backgroundImage: 'url(/assets/HUD/ButtonBackgroundPause.png)',
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              border: 'none',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <div 
              style={{
                width: '100%',
                height: '100%',
                backgroundImage: 'url(/assets/HUD/ResumeText.png)',
                backgroundSize: 'auto',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/15 to-yellow-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </button>

          {/* Settings Button */}
          <button
            onClick={handleSettings}
            className="relative group transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              width: '280px',
              height: '45px',
              backgroundImage: 'url(/assets/HUD/ButtonBackgroundPause.png)',
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              border: 'none',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <div 
              style={{
                width: '100%',
                height: '100%',
                backgroundImage: 'url(/assets/HUD/SettingsText.png)',
                backgroundSize: 'auto',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/15 to-yellow-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </button>

          {/* Return to Menu Button */}
          <button
            onClick={handleMainMenu}
            className="relative group transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              width: '280px',
              height: '45px',
              backgroundImage: 'url(/assets/HUD/ButtonBackgroundPause.png)',
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              border: 'none',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <div 
              style={{
                width: '100%',
                height: '100%',
                backgroundImage: 'url(/assets/HUD/ReturnToMenuText.png)',
                backgroundSize: 'auto',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/15 to-yellow-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </button>
        </div>

        {/* ESC Hint - Styled to match medieval theme */}
        <div 
          className="absolute bottom-25 text-center"
          style={{
            color: '#D4AF37',
            fontSize: '13px',
            fontFamily: 'serif',
            textShadow: '1px 1px 3px rgba(0, 0, 0, 0.9)',
            fontWeight: '500',
            letterSpacing: '0.5px',
          }}
        >
          Press ESC again to continue
        </div>
      </div>
    </div>
  );
};

export default PauseMenu;