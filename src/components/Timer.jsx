import React, { useState, useEffect } from 'react';
import { EventBus } from '../game/EventBus';

const Timer = () => {
    const [time, setTime] = useState('00:00');
    const [currentWave, setCurrentWave] = useState(1);
    const [isGameRunning, setIsGameRunning] = useState(false);

    useEffect(() => {
        const handleTimerStart = () => {
            setIsGameRunning(true);
        };

        const handleTimerStop = () => {
            setIsGameRunning(false);
        };

        const handleTimerUpdate = (data) => {
            if (data.formattedTime) {
                setTime(data.formattedTime);
            }
            if (data.currentWave !== undefined) {
                setCurrentWave(data.currentWave);
            }
        };

        const handleWaveUpdate = (data) => {
            if (data.wave !== undefined) {
                setCurrentWave(data.wave);
            }
        };

        EventBus.on('timer-start', handleTimerStart);
        EventBus.on('timer-stop', handleTimerStop);
        EventBus.on('timer-updated', handleTimerUpdate);
        EventBus.on('wave-updated', handleWaveUpdate);
        EventBus.on('wave-notification', handleWaveUpdate);

        return () => {
            EventBus.off('timer-start', handleTimerStart);
            EventBus.off('timer-stop', handleTimerStop);
            EventBus.off('timer-updated', handleTimerUpdate);
            EventBus.off('wave-updated', handleWaveUpdate);
            EventBus.off('wave-notification', handleWaveUpdate);
        };
    }, []);

    useEffect(() => {
        window.reactTimerState = {
            time,
            currentWave,
            isGameRunning,
            getGameScene: () => {
                return window.game?.scene?.getScene('MainMapScene') || 
                       window.game?.scene?.scenes?.find(scene => scene.scene.key === 'MainMapScene') ||
                       window.currentGameScene;
            }
        };

        return () => {
            delete window.reactTimerState;
        };
    }, [time, currentWave, isGameRunning]);

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

                {/* Bridge Status */}
                {process.env.NODE_ENV === 'development' && (
                    <div style={{
                        position: 'absolute',
                        top: '-15px',
                        right: '5px',
                        fontSize: '10px',
                        color: isGameRunning ? '#4CAF50' : '#FF6B6B',
                        background: 'rgba(0,0,0,0.7)',
                        padding: '2px 6px',
                        borderRadius: '4px'
                    }}
                    >
                        {isGameRunning ? 'RUNNING' : 'STOPPED'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Timer;