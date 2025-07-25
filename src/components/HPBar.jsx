import React, { useState, useEffect } from 'react';
import { EventBus } from '../game/EventBus';

const HPBar = ({ showGoldIcon = true }) => {
    const [playerStats, setPlayerStats] = useState({
        currentHP: 100,
        maxHP: 100,
        gold: 0
    });

    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const handlePlayerHealthUpdate = (healthData) => {
            console.log('HP Bar received health update:', healthData);
            
            setPlayerStats(prevStats => ({
                ...prevStats,
                currentHP: healthData.currentHP ?? healthData.health ?? healthData.hp ?? prevStats.currentHP,
                maxHP: healthData.maxHP ?? healthData.maxHealth ?? healthData.maxHp ?? prevStats.maxHP
            }));
        };

        const handlePlayerStatsUpdate = (statsData) => {
            console.log('HP Bar received stats update:', statsData);
            
            setPlayerStats(prevStats => ({
                ...prevStats,
                currentHP: statsData.currentHP ?? statsData.health ?? statsData.hp ?? prevStats.currentHP,
                maxHP: statsData.maxHP ?? statsData.maxHealth ?? statsData.maxHp ?? prevStats.maxHP,
                gold: statsData.gold ?? prevStats.gold
            }));
        };

        const handleGameStart = () => {
            console.log('Game started - showing HP bar');
            setIsVisible(true);
        };

        const handleGameStop = () => {
            console.log('Game stopped - hiding HP bar');
            setIsVisible(false);
        };

        const handlePlayerDeath = () => {
            console.log('Player died - hiding HP bar');
            setIsVisible(false);
        };

        // EventBus listeners
        EventBus.on('player-health-updated', handlePlayerHealthUpdate);
        EventBus.on('player-hp-changed', handlePlayerHealthUpdate);
        EventBus.on('player-stats-updated', handlePlayerStatsUpdate);
        EventBus.on('game-started', handleGameStart);
        EventBus.on('game-stopped', handleGameStop);
        EventBus.on('player-death', handlePlayerDeath);
        EventBus.on('main-scene-started', handleGameStart);

        // Window event listeners (backup)
        const handleWindowHealthUpdate = (event) => {
            if (event.detail) {
                handlePlayerHealthUpdate(event.detail);
            }
        };

        const handleWindowStatsUpdate = (event) => {
            if (event.detail) {
                handlePlayerStatsUpdate(event.detail);
            }
        };
        
        window.addEventListener('playerHealthUpdated', handleWindowHealthUpdate);
        window.addEventListener('playerHPChanged', handleWindowHealthUpdate);
        window.addEventListener('playerStatsUpdated', handleWindowStatsUpdate);
        window.addEventListener('playerDeath', handlePlayerDeath);

        return () => {
            // Remove EventBus listeners
            EventBus.removeListener('player-health-updated', handlePlayerHealthUpdate);
            EventBus.removeListener('player-hp-changed', handlePlayerHealthUpdate);
            EventBus.removeListener('player-stats-updated', handlePlayerStatsUpdate);
            EventBus.removeListener('game-started', handleGameStart);
            EventBus.removeListener('game-stopped', handleGameStop);
            EventBus.removeListener('player-death', handlePlayerDeath);
            EventBus.removeListener('main-scene-started', handleGameStart);

            // Remove window listeners
            window.removeEventListener('playerHealthUpdated', handleWindowHealthUpdate);
            window.removeEventListener('playerHPChanged', handleWindowHealthUpdate);
            window.removeEventListener('playerStatsUpdated', handleWindowStatsUpdate);
            window.removeEventListener('playerDeath', handlePlayerDeath);
        };
    }, []);

    // Don't render if not visible
    if (!isVisible) {
        return null;
    }

    const hpPercentage = Math.max(0, Math.min(100, (playerStats.currentHP / playerStats.maxHP) * 100));
    
    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        }}>
            {/* HP Bar Container */}
            <div style={{
                position: 'relative',
                width: '250px',
                height: '40px'
            }}>
                {/* HP Background */}
                <div style={{
                    position: 'absolute',
                    top: '0px',
                    left: '0px',
                    width: '200%',
                    height: '250%',
                    backgroundImage: 'url(/assets/HUD/HUD_HP_BG_V01.png)',
                    backgroundSize: '100% 100%',
                    backgroundRepeat: 'no-repeat',
                    zIndex: 1
                }} />
                
                {/* HP Fill */}
                <div style={{
                    position: 'absolute',
                    top: '22px',
                    left: '60px',
                    width: `calc((165% - 24px) * ${hpPercentage / 100})`,
                    height: 'calc(140% - 12px)',
                    backgroundColor: hpPercentage > 50 ? '#4CAF50' : hpPercentage > 25 ? '#FF9800' : '#F44336',
                    borderRadius: '3px',
                    zIndex: 2,
                    transition: 'width 0.3s ease-in-out, background-color 0.3s ease-in-out'
                }} />
                
                {/* HP Frame/Border */}
                <div style={{
                    position: 'absolute',
                    top: '22px',
                    left: '50px',
                    width: '160%',
                    height: '140%',
                    backgroundImage: 'url(/assets/HUD/HUD_HP_Indicator_Frame_V01.png)',
                    backgroundSize: '100% 100%',
                    backgroundRepeat: 'no-repeat',
                    zIndex: 3
                }} />
                
                {/* HP Text */}
                <div style={{
                    position: 'absolute',
                    top: '130%',
                    left: '100%',
                    transform: 'translate(-50%, -50%)',
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
                    zIndex: 4,
                    pointerEvents: 'none'
                }}>
                    {Math.ceil(playerStats.currentHP)}/{playerStats.maxHP}
                </div>
            </div>

            {/* Gold Display - Underneath HP Bar */}
            {showGoldIcon && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(0,0,0,0.7)',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    border: '2px solid #FFD700',
                    alignSelf: 'flex-start'
                }}>
                    <div style={{
                        width: '24px',
                        height: '24px',
                        backgroundImage: 'url(/assets/HUD/HUD_Gold_Icon_V01.png)',
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center'
                    }} />
                    <span style={{
                        color: '#FFD700',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                    }}>
                        {playerStats.gold.toLocaleString()}
                    </span>
                </div>
            )}
        </div>
    );
};

export default HPBar;