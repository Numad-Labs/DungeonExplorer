import React, { useState, useEffect } from 'react';
import { loadAudioSettings, saveAudioSettings } from '../GameStorage.js';

const VolumeSlider = ({ label, volume, onVolumeChange, backgroundImage }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [sliderRef, setSliderRef] = useState(null);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    updateVolume(e);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !sliderRef) return;
    updateVolume(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updateVolume = (e) => {
    if (!sliderRef) return;
    
    const rect = sliderRef.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const width = rect.width;
    const newVolume = x / width;
    onVolumeChange(Math.round(newVolume * 100) / 100);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, sliderRef]);

  const sliderWidth = 280;
  const pinPosition = volume * (sliderWidth - 20);

  return (
    <div className="flex flex-col items-center mb-8">
      <div 
        className="mb-4"
        style={{
          width: '200px',
          height: '40px',
          backgroundImage: `url(/assets/HUD/${backgroundImage})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.8))',
        }}
      />
      
      <div className="relative">
        <div 
          ref={setSliderRef}
          className="relative cursor-pointer"
          style={{
            width: `${sliderWidth}px`,
            height: '20px',
            backgroundImage: 'url(/assets/HUD/Sound_Scroll.png)',
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
          }}
          onMouseDown={handleMouseDown}
        >
          <div 
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: `${volume * 100}%`,
              height: '100%',
              backgroundImage: 'url(/assets/HUD/Sound_Scroll1.png)',
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
              pointerEvents: 'none',
            }}
          />
          
          <div 
            className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-75 hover:scale-110"
            style={{
              left: `${pinPosition}px`,
              width: '20px',
              height: '20px',
              backgroundImage: 'url(/assets/HUD/Sound_Scroll_Pin.png)',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              cursor: isDragging ? 'grabbing' : 'grab',
              filter: 'drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.6))',
              pointerEvents: 'none',
            }}
          />
        </div>
        
        <div 
          className="mt-2 text-center"
          style={{
            color: '#D4AF37',
            fontSize: '14px',
            fontFamily: 'serif',
            textShadow: '1px 1px 3px rgba(0, 0, 0, 0.9)',
            fontWeight: '500',
          }}
        >
          {Math.round(volume * 100)}%
        </div>
      </div>
    </div>
  );
};

const SoundSettings = ({ onBack }) => {
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [soundVolume, setSoundVolume] = useState(0.5);

  const getCurrentScene = () => {
    if (window.currentGameScene) {
      return window.currentGameScene;
    }
    if (window.currentScene) {
      return window.currentScene;
    }
    if (window.game && window.game.scene) {
      const scenes = window.game.scene.getScenes(true);
      return scenes.find(scene => scene.scene.isActive()) || scenes[0];
    }
    return null;
  };

  useEffect(() => {
    const settings = loadAudioSettings();
    if (settings) {
      setMusicVolume(settings.musicVolume ?? 0.5);
      setSoundVolume(settings.soundVolume ?? 0.5);
    }
  }, []);

  const handleMusicVolumeChange = (volume) => {
    setMusicVolume(volume);
    saveAudioSettings({ musicVolume: volume, soundVolume });
    const scene = getCurrentScene();
    if (scene && scene.sound) {
      scene.sound.sounds.forEach(sound => {
        if (sound.loop && sound.isPlaying) {
          sound.setVolume(volume);
        }
      });
    }
  };

  const handleSoundVolumeChange = (volume) => {
    setSoundVolume(volume);
    saveAudioSettings({ musicVolume, soundVolume: volume });
    const scene = getCurrentScene();
    if (scene && scene.sound) {
      scene.sound.volume = volume;
    }
    
    clearTimeout(window.soundTestTimeout);
    window.soundTestTimeout = setTimeout(() => {
      if (scene && scene.sound) {
        const testSounds = ['level-up', 'menu-selection', 'character-dying'];
        for (const soundKey of testSounds) {
          try {
            if (scene.cache.audio.exists(soundKey)) {
              scene.sound.play(soundKey, { volume: volume });
              break;
            }
          } catch (error) {
            console.log('Could not play:', soundKey);
          }
        }
      }
    }, 100);
  };

  const handleBack = () => {
    saveAudioSettings({ musicVolume, soundVolume });
    onBack();
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
        zIndex: 1001,
      }}
    >
      <div 
        className="relative flex flex-col justify-center items-center"
        style={{
          width: '500px',
          height: '650px',
          backgroundImage: 'url(/assets/HUD/PausedBackground.png)',
          backgroundSize: '100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          padding: '40px',
          filter: 'drop-shadow(0 0 25px rgba(255, 215, 0, 0.4))',
        }}
      >
        <div 
          className="mb-12"
          style={{
            width: '280px',
            height: '45px',
            backgroundImage: 'url(/assets/HUD/SettingsText.png)',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.8))',
          }}
        />

        <div className="flex flex-col items-center w-full">
          <VolumeSlider 
            label="Music Volume"
            volume={musicVolume}
            onVolumeChange={handleMusicVolumeChange}
            backgroundImage="SoundVolume.png"
          />

          <VolumeSlider 
            label="Master Volume"
            volume={soundVolume}
            onVolumeChange={handleSoundVolumeChange}
            backgroundImage="MusicVolume.png"
          />
        </div>

        <button
          onClick={handleBack}
          className="relative group transition-all duration-200 hover:scale-105 active:scale-95 mt-8"
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
            className="flex items-center justify-center text-white"
            style={{
              width: '100%',
              height: '100%',
              fontSize: '18px',
              fontFamily: 'serif',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
              letterSpacing: '1px',
            }}
          >
            BACK
          </div>
        </button>

        <div 
          className="absolute bottom-6 text-center"
          style={{
            color: '#D4AF37',
            fontSize: '12px',
            fontFamily: 'serif',
            textShadow: '1px 1px 3px rgba(0, 0, 0, 0.9)',
            fontWeight: '400',
            letterSpacing: '0.5px',
            maxWidth: '400px',
          }}
        >
          Drag the pins to adjust volume levels. Changes are saved automatically.
        </div>
      </div>
    </div>
  );
};

export default SoundSettings;