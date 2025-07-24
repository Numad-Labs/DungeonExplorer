import React, { useState, useEffect } from 'react';
import { EventBus } from '../game/EventBus';

const HPBar = ({ showGoldIcon = true }) => {
    const [playerStats, setPlayerStats] = useState({
        currentHP: 100,
        maxHP: 100
    });

    useEffect(() => {
        const handlePlayerHealthUpdate = (healthData) => {
            setPlayerStats(prevStats => ({
                ...prevStats,
                currentHP: healthData.currentHP || healthData.health || healthData.hp || 100,
                maxHP: healthData.maxHP || healthData.maxHealth || healthData.maxHp || 100
            }));
        };

        // Listen for health events
        EventBus.on('player-health-updated', handlePlayerHealthUpdate);
        EventBus.on('player-hp-changed', handlePlayerHealthUpdate);
        EventBus.on('player-stats-updated', handlePlayerHealthUpdate);

        // Backup window events
        const handleWindowHealthUpdate = (event) => {
            handlePlayerHealthUpdate(event.detail);
        };
        
        window.addEventListener('playerHealthUpdated', handleWindowHealthUpdate);
        window.addEventListener('playerHPChanged', handleWindowHealthUpdate);

        return () => {
            EventBus.removeListener('player-health-updated', handlePlayerHealthUpdate);
            EventBus.removeListener('player-hp-changed', handlePlayerHealthUpdate);
            EventBus.removeListener('player-stats-updated', handlePlayerHealthUpdate);
            window.removeEventListener('playerHealthUpdated', handleWindowHealthUpdate);
            window.removeEventListener('playerHPChanged', handleWindowHealthUpdate);
        };
    }, []);

    const hpPercentage = Math.max(0, Math.min(100, (playerStats.currentHP / playerStats.maxHP) * 100));
    
    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
        }}>
            {/* Gold Icon */}
            {showGoldIcon && (
                <div style={{
                    width: '32px',
                    height: '32px',
                    backgroundImage: 'url(/assets/HUD/HUD_Gold_Icon_V01.png)',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center'
                }} />
            )}
            
            {/* HP Bar Container */}
            <div style={{
                position: 'relative',
                width: '200px',
                height: '32px'
            }}>
                {/* HP Background */}
                <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: '2px',
                    width: 'calc(250% - 4px)',
                    height: 'calc(300% - 4px)',
                    backgroundImage: 'url(/assets/HUD/HUD_HP_BG_V01.png)',
                    backgroundSize: '100% 100%',
                    backgroundRepeat: 'no-repeat',
                    zIndex: 1
                }} />
                
                {/* HP Fill */}
                <div style={{
                    position: 'absolute',
                    top: '24px',
                    left: '52px',
                    width: `calc((200% - 4px) * ${hpPercentage / 100})`,
                    height: 'calc(170% - 4px)',
                    backgroundImage: 'url(/assets/HUD/HUD_HP_Indicator_V10.png)',
                    backgroundSize: `${100 / (hpPercentage / 100)}% 100%`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'left center',
                    backgroundColor: '#FFD700',
                    zIndex: 2,
                    transition: 'width 0.3s ease-in-out',
                    overflow: 'hidden'
                }} />
                
                {/* HP Frame */}
                <div style={{
                    position: 'absolute',
                    top: '22px',
                    left: '52px',
                    width: '198%',
                    height: '165%',
                    backgroundImage: 'url(/assets/HUD/HUD_HP_Indicator_Frame_V01.png)',
                    backgroundSize: '100% 100%',
                    backgroundRepeat: 'no-repeat',
                    zIndex: 3
                }} />
                
                {/* HP Text */}
                <div style={{
                    position: 'absolute',
                    top: '150%',
                    left: '130%',
                    transform: 'translate(-50%, -50%)',
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                    zIndex: 4,
                    pointerEvents: 'none'
                }}>
                    {Math.ceil(playerStats.currentHP)}/{playerStats.maxHP}
                </div>
            </div>
        </div>
    );
};

export default HPBar;