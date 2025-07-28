import React, { useState, useEffect } from 'react';
import { EventBus } from '../game/EventBus';

const Timer = () => {
    const [time, setTime] = useState('00:00');
    const [currentWave, setCurrentWave] = useState(1);

    useEffect(() => {
        const pollGameData = () => {
            const currentScene = window.game?.scene?.getScene('MainMapScene') || 
                                window.game?.scene?.scenes?.find(scene => scene.scene.key === 'MainMapScene') ||
                                window.currentGameScene;

            if (currentScene) {
                if (currentScene.uiManager && currentScene.uiManager.timer) {
                    const elapsed = currentScene.uiManager.timer.elapsed || 0;
                    const minutes = Math.floor(elapsed / 60);
                    const seconds = Math.floor(elapsed % 60);
                    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                    setTime(timeString);
                }

                let wave = 1;
                
                if (currentScene.uiManager && currentScene.uiManager.lastWave) {
                    wave = currentScene.uiManager.lastWave;
                }
                else if (currentScene.gameManager && currentScene.gameManager.currentWave) {
                    wave = currentScene.gameManager.currentWave;
                }
                else if (currentScene.currentWave !== undefined) {
                    wave = currentScene.currentWave;
                }
                else if (currentScene.gameplayManager?.mobManager) {
                    const mobStats = currentScene.gameplayManager.mobManager.getStatistics();
                    wave = mobStats.currentWave || 1;
                }

                setCurrentWave(wave);
            }
        };
        const interval = setInterval(pollGameData, 100);
        pollGameData();

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        window.reactTimerState = {
            time,
            currentWave,
            getGameScene: () => {
                return window.game?.scene?.getScene('MainMapScene') || 
                       window.game?.scene?.scenes?.find(scene => scene.scene.key === 'MainMapScene') ||
                       window.currentGameScene;
            }
        };

        return () => {
            delete window.reactTimerState;
        };
    }, [time, currentWave]);

    return (
        <div style={{
            position: 'fixed',
            top: '2vh',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999
        }}>
            <div style={{
                position: 'relative',
                width: '280px',
                height: '120px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                {/* Timer Top Shroud */}
                <div style={{
                    position: 'absolute',
                    top: '0px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '240px',
                    height: '80px',
                    backgroundImage: 'url(/assets/HUD/HUD_Timer_Shroud_Top_V01.png)',
                    backgroundSize: '100% 100%',
                    backgroundRepeat: 'no-repeat',
                    zIndex: 1
                }} />
                
                {/* Timer Display */}
                <div style={{
                    position: 'absolute',
                    top: '35%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 3
                }}>
                    <div style={{
                        color: 'white',
                        fontSize: '40px',
                        fontWeight: 'bold',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
                        letterSpacing: '1px'
                    }}>
                        {time}
                    </div>
                </div>

                {/* Wave Counter */}
                <div style={{
                    position: 'absolute',
                    top: '65%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 3
                }}>
                    <div style={{
                        color: '#FFD700',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
                        letterSpacing: '1px'
                    }}>
                        WAVE {currentWave}
                    </div>
                </div>

                {/* Timer Bottom Shroud */}
                <div style={{
                    position: 'absolute',
                    top: '80%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '200px',
                    height: '60px',
                    backgroundImage: 'url(/assets/HUD/HUD_Timer_Shroud_Bottom_V01.png)',
                    backgroundSize: '100% 100%',
                    backgroundRepeat: 'no-repeat',
                    zIndex: 1
                }} />
            </div>
        </div>
    );
};

export default Timer;