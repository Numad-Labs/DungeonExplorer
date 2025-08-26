import React, { useState, useEffect, useRef } from 'react';
import { EventBus } from '../game/EventBus';
import { getBridge } from '../bridge/GameBridge';

const HPBar = ({ showGoldIcon = true }) => {
    const [playerStats, setPlayerStats] = useState({
        currentHP: 100,
        maxHP: 100,
        gold: 500,
        kills: 0
    });
    const [isVisible, setIsVisible] = useState(true);
    const [isGameActive, setIsGameActive] = useState(false);
    const isGameActiveRef = useRef(false);

    useEffect(() => {
        const handleHealthUpdate = (healthData) => {
            console.log('HPBar: Health update received:', healthData);
            
            setPlayerStats(prevStats => ({
                ...prevStats,
                currentHP: healthData.currentHP || healthData.health || healthData.hp || prevStats.currentHP,
                maxHP: healthData.maxHP || healthData.maxHealth || healthData.maxHp || prevStats.maxHP
            }));
            
            setIsGameActive(true);
            isGameActiveRef.current = true;
            setIsVisible(true);
        };

        const handleBridgeData = (data) => {
            setPlayerStats(prevStats => ({
                currentHP: data.health || prevStats.currentHP,
                maxHP: data.maxHealth || prevStats.maxHP,
                gold: data.gold || prevStats.gold,
                kills: data.kills || data.enemiesKilled || prevStats.kills
            }));
            
            const hasValidHealth = (data.health > 0 && data.maxHealth > 0);
            if (hasValidHealth) {
                setIsGameActive(true);
                isGameActiveRef.current = true;
                setIsVisible(true);
                return;
            }
            
            if (!isGameActiveRef.current && (data.isInGame === false || data.isAlive === false)) {
                setIsVisible(false);
                setIsGameActive(false);
                isGameActiveRef.current = false;
            } else if (data.isInGame !== false) {
                setIsVisible(true);
            }
        };

        const handleGoldUpdate = (goldData) => {
            setPlayerStats(prevStats => ({
                ...prevStats,
                gold: goldData.gold || goldData.totalGold || prevStats.gold
            }));
        };

        const handleKillUpdate = (killData) => {
            setPlayerStats(prevStats => ({
                ...prevStats,
                kills: killData.kills || killData.enemiesKilled || (prevStats.kills + 1)
            }));
        };

        const handleGameStateUpdate = (gameStateData) => {
            if (gameStateData && gameStateData.detail) {
                const { currentRunStats } = gameStateData.detail;
                if (currentRunStats) {
                    setPlayerStats(prevStats => ({
                        ...prevStats,
                        kills: currentRunStats.enemiesKilled || prevStats.kills
                    }));
                }
            }
        };

        EventBus.on('player-health-updated', handleHealthUpdate);
        EventBus.on('player-hp-changed', handleHealthUpdate);
        EventBus.on('bridge-player-data', handleBridgeData);
        EventBus.on('player-gold-updated', handleGoldUpdate);
        EventBus.on('bridge-gold-updated', handleGoldUpdate);
        EventBus.on('player-kill-updated', handleKillUpdate);
        EventBus.on('enemy-killed', handleKillUpdate);
        EventBus.on('game-state-updated', handleGameStateUpdate);
        
        const handleGameStart = () => {
            console.log('HPBar: Game started - showing HP bar and marking as active');
            setIsGameActive(true);
            isGameActiveRef.current = true;
            setIsVisible(true);
            setPlayerStats(prevStats => ({
                ...prevStats,
                kills: 0
            }));
        };
        
        const handleGameEnd = () => {
            console.log('HPBar: Game ended - marking as inactive');
            setIsGameActive(false);
            isGameActiveRef.current = false;
        };
        
        EventBus.on('game-started', handleGameStart);
        EventBus.on('main-scene-started', handleGameStart);
        EventBus.on('current-scene-ready', handleGameStart);
        EventBus.on('new-run-started', handleGameStart);
        
        EventBus.on('player-death', handleGameEnd);
        EventBus.on('game-ended', handleGameEnd);
        
        const bridge = getBridge();
        const initialData = bridge.getGameState();
        if (initialData && initialData.player) {
            handleBridgeData(initialData.player);
        }
        
        const fallbackTimer = setTimeout(() => {
            console.log('HPBar: Fallback timer - ensuring HP bar is visible');
            setIsVisible(true);
        }, 2000);
        
        return () => {
            clearTimeout(fallbackTimer);
            EventBus.off('player-health-updated', handleHealthUpdate);
            EventBus.off('player-hp-changed', handleHealthUpdate);
            EventBus.off('bridge-player-data', handleBridgeData);
            EventBus.off('player-gold-updated', handleGoldUpdate);
            EventBus.off('bridge-gold-updated', handleGoldUpdate);
            EventBus.off('player-kill-updated', handleKillUpdate);
            EventBus.off('enemy-killed', handleKillUpdate);
            EventBus.off('game-state-updated', handleGameStateUpdate);
            EventBus.off('game-started', handleGameStart);
            EventBus.off('main-scene-started', handleGameStart);
            EventBus.off('current-scene-ready', handleGameStart);
            EventBus.off('new-run-started', handleGameStart);
            EventBus.off('player-death', handleGameEnd);
            EventBus.off('game-ended', handleGameEnd);
        };
    }, []);

    if (!isVisible) {
        return null;
    }

    const hpPercentage = Math.max(0, Math.min(100, (playerStats.currentHP / playerStats.maxHP) * 100));
    const isLowHealth = hpPercentage < 25;
    const isCritical = hpPercentage < 10;
    
    return (
        <div>
            {isVisible && (
                <div style={{
                    position: 'fixed',
                    top: '2vh',
                    left: '2vw',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                }}>
            <div style={{
                position: 'relative',
                width: '300px',
                height: '50px'
            }}>
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
                
                <div style={{
                    position: 'absolute',
                    top: '26px',
                    left: '60px',
                    width: `calc((165% - 24px) * ${hpPercentage / 100})`,
                    height: 'calc(140% - 12px)',
                    backgroundColor: hpPercentage > 50 ? '#4CAF50' : hpPercentage > 25 ? '#FF9800' : '#F44336',
                    borderRadius: '3px',
                    zIndex: 2,
                    transition: 'width 0.3s ease-in-out, background-color 0.3s ease-in-out'
                }} />
                
                <div style={{
                    position: 'absolute',
                    top: '26px',
                    left: '60px',
                    width: '160%',
                    height: '140%',
                    backgroundImage: 'url(./assets/HUD/HUD_HP_Indicator_Frame_V01.png)',
                    backgroundSize: '100% 100%',
                    backgroundRepeat: 'no-repeat',
                    zIndex: 3
                }} />
                
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

                {isLowHealth && (
                    <div style={{
                        position: 'absolute',
                        top: '55px',
                        left: '150px',
                        transform: 'translateX(-50%)',
                        color: isCritical ? '#ff4444' : '#ff8844',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.9)',
                        zIndex: 4
                    }}>
                        {isCritical ? 'CRITICAL!' : 'LOW HEALTH!'}
                    </div>
                )}
            </div>

            {showGoldIcon && (
                <div style={{
                    display: 'flex',
                    alignItems: 'right',
                    gap: '15px',
                    marginTop: '65px',
                    marginLeft: '40px'
                }}>
                    {/* Gold Display */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: 'rgba(0,0,0,0.7)',
                        padding: '10px 25px',
                        borderRadius: '25px',
                        border: '2px solid #FFD700',
                        minWidth: '150px',
                        marginTop: "10px",
                    }}>
                        <div style={{
                            width: '30px',
                            height: '30px',
                            backgroundImage: 'url(./assets/HUD/HUD_Gold_Icon_V01.png)',
                            backgroundSize: 'contain',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                            marginTop: "0px",
                        }} />
                        <span style={{
                            color: '#FFD700',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                            marginTop: "4px",
                        }}>
                            {playerStats.gold.toLocaleString()}
                        </span>
                    </div>

                    {/* Kill Counter */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: 'rgba(0,0,0,0.7)',
                        padding: '10px 25px',
                        borderRadius: '25px',
                        border: '2px solid #ff6b6b',
                        marginTop: "10px",
                        minWidth: '150px'
                    }}>
                        <div style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            display: 'flex',
                            marginTop: "4px", 
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: 'white',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                        }}>
                            💀
                        </div>
                        <span style={{
                            color: '#ff6b6b',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                            minWidth: '80px',
                            marginTop: "4px",
                        }}>
                            {playerStats.kills.toLocaleString()}
                        </span>
                    </div>
                </div>
            )}
            </div>
            )}
        </div>
    );
};

export default HPBar;