import React, { useState, useEffect } from 'react';
import { EventBus } from '../game/EventBus';
import { getBridge } from '../bridge/GameBridge';

const HPBar = ({ showGoldIcon = true }) => {
    const [playerStats, setPlayerStats] = useState({
        currentHP: 100,
        maxHP: 100,
        gold: 500
    });
    const [useBridge, setUseBridge] = useState(true);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Initialize bridge
        const bridge = getBridge();

        if (useBridge) {
            const handleBridgePlayerData = (data) => {
                setPlayerStats({
                    currentHP: data.health,
                    maxHP: data.maxHealth,
                    gold: data.gold
                });
                setIsVisible(data.isInGame || data.isAlive);
            };

            const handleBridgeHealthUpdate = (data) => {
                setPlayerStats(prevStats => ({
                    ...prevStats,
                    currentHP: data.currentHP,
                    maxHP: data.maxHP
                }));
            };

            const handleBridgeGoldUpdate = (data) => {
                setPlayerStats(prevStats => ({
                    ...prevStats,
                    gold: data.gold
                }));
            };

            EventBus.on('bridge-player-data', handleBridgePlayerData);
            EventBus.on('bridge-health-updated', handleBridgeHealthUpdate);
            EventBus.on('bridge-gold-updated', handleBridgeGoldUpdate);
            
            // Get initial data from bridge
            const initialGameState = bridge.getGameState();
            if (initialGameState?.player) {
                handleBridgePlayerData(initialGameState.player);
            }

            return () => {
                EventBus.off('bridge-player-data', handleBridgePlayerData);
                EventBus.off('bridge-health-updated', handleBridgeHealthUpdate);
                EventBus.off('bridge-gold-updated', handleBridgeGoldUpdate);
            };
        } else {
            // Fallback to original EventBus system
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
                    gold: statsData.gold ?? statsData.currentGold ?? prevStats.gold
                }));
            };

            const handlePlayerGoldUpdate = (goldData) => {
                console.log('HP Bar received gold update:', goldData);
                
                setPlayerStats(prevStats => ({
                    ...prevStats,
                    gold: goldData.gold ?? goldData.totalGold ?? prevStats.gold
                }));
            };

            const handleGameStart = () => {
                setIsVisible(true);
                EventBus.emit('request-initial-gold');
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
            EventBus.on('player-gold-updated', handlePlayerGoldUpdate);
            EventBus.on('game-started', handleGameStart);
            EventBus.on('game-stopped', handleGameStop);
            EventBus.on('player-death', handlePlayerDeath);
            EventBus.on('main-scene-started', handleGameStart);

            return () => {
                EventBus.removeListener('player-health-updated', handlePlayerHealthUpdate);
                EventBus.removeListener('player-hp-changed', handlePlayerHealthUpdate);
                EventBus.removeListener('player-stats-updated', handlePlayerStatsUpdate);
                EventBus.removeListener('player-gold-updated', handlePlayerGoldUpdate);
                EventBus.removeListener('game-started', handleGameStart);
                EventBus.removeListener('game-stopped', handleGameStop);
                EventBus.removeListener('player-death', handlePlayerDeath);
                EventBus.removeListener('main-scene-started', handleGameStart);
            };
        }
    }, [useBridge]);

    if (!isVisible) {
        return null;
    }

    const hpPercentage = Math.max(0, Math.min(100, (playerStats.currentHP / playerStats.maxHP) * 100));
    const isLowHealth = hpPercentage < 25;
    const isCritical = hpPercentage < 10;
    
    return (
        <div style={{
            position: 'fixed',
            top: '2vh',   
            left: '2vw',  
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        }}>
            {/* HP Bar Container */}
            <div style={{
                position: 'relative',
                width: 'min(300px, 25vw)',
                height: 'min(50px, 5vh)',  
                minWidth: '200px',         
                minHeight: '40px'          
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
                    top: '26px',
                    left: '60px',
                    width: `calc((165% - 24px) * ${hpPercentage / 100})`,
                    height: 'calc(140% - 12px)',
                    backgroundColor: hpPercentage > 50 ? '#4CAF50' : hpPercentage > 25 ? '#FF9800' : '#F44336',
                    borderRadius: '3px',
                    zIndex: 2,
                    transition: 'width 0.3s ease-in-out, background-color 0.3s ease-in-out',
                    animation: isCritical ? 'healthPulse 1s infinite' : 'none'
                }} />
                
                {/* HP Frame/Border */}
                <div style={{
                    position: 'absolute',
                    top: '26px',
                    left: '60px',
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
                    color: isLowHealth ? '#ff6b6b' : 'white',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
                    zIndex: 4,
                    pointerEvents: 'none'
                }}>
                    {Math.ceil(playerStats.currentHP)}/{playerStats.maxHP}
                </div>

                {/* Health status indicators */}
                {isLowHealth && (
                    <div style={{
                        position: 'absolute',
                        top: '110%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        color: isCritical ? '#ff4444' : '#ff8844',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.9)',
                        zIndex: 4,
                        animation: 'healthWarning 2s infinite'
                    }}>
                        {isCritical ? 'CRITICAL!' : 'LOW HEALTH!'}
                    </div>
                )}
            </div>

            {/* Gold Display - Enhanced with better formatting */}
            {showGoldIcon && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'min(10px, 1vw)', 
                    background: 'rgba(0,0,0,0.7)',
                    padding: 'min(10px, 1vh) min(15px, 1vw)',
                    borderRadius: 'min(25px, 2vw)',
                    border: '2px solid #FFD700',
                    marginTop: '6.5vh',
                    marginLeft: '1vw',
                }}>
                    <div style={{
                        width: 'min(30px, 3vw)', 
                        height: 'min(30px, 3vw)',
                        minWidth: '20px',      
                        minHeight: '20px',     
                        backgroundImage: 'url(/assets/HUD/HUD_Gold_Icon_V01.png)',
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center'
                    }} />
                    <span style={{
                        color: '#FFD700',
                        fontSize: 'min(20px, 2vw)',
                        minFontSize: '14px',
                        fontWeight: 'bold',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                    }}>
                        {playerStats.gold.toLocaleString()}
                    </span>
                </div>
            )}

            {/* Bridge Status (dev mode) */}
            {process.env.NODE_ENV === 'development' && (
                <div style={{
                    position: 'absolute',
                    top: '-15px',
                    right: '5px',
                    fontSize: '10px',
                    color: useBridge ? '#4CAF50' : '#FF9800',
                    background: 'rgba(0,0,0,0.7)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
                onClick={() => setUseBridge(!useBridge)}
                >
                    {useBridge ? 'BRIDGE' : 'LEGACY'}
                </div>
            )}

            {/* CSS styles moved to index.css or inline styles */}
            <style>{`
                @keyframes healthPulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }
                
                @keyframes healthWarning {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
};

export default HPBar;