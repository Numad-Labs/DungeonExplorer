import React, { useState, useEffect } from 'react';
import { EventBus } from '../game/EventBus';

const SkillExpBar = () => {
    const [playerStats, setPlayerStats] = useState({
        currentExp: 0,
        maxExp: 100,
        level: 1
    });

    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const handlePlayerExpUpdate = (expData) => {
            setPlayerStats(prevStats => ({
                ...prevStats,
                currentExp: expData.currentExp ?? expData.experience ?? expData.exp ?? prevStats.currentExp,
                maxExp: expData.maxExp ?? expData.maxExperience ?? expData.maxExp ?? prevStats.maxExp,
                level: expData.level ?? expData.lvl ?? prevStats.level
            }));
        };

        const handlePlayerStatsUpdate = (statsData) => {
            setPlayerStats(prevStats => ({
                ...prevStats,
                currentExp: statsData.currentExp ?? statsData.experience ?? statsData.exp ?? prevStats.currentExp,
                maxExp: statsData.maxExp ?? statsData.maxExperience ?? statsData.maxExp ?? prevStats.maxExp,
                level: statsData.level ?? statsData.lvl ?? prevStats.level
            }));
        };

        const handleGameStart = () => {
            setIsVisible(true);
        };

        const handleGameStop = () => {
            setIsVisible(false);
        };

        const handlePlayerDeath = () => {
            setIsVisible(false);
        };

        // EventBus listeners
        EventBus.on('player-exp-updated', handlePlayerExpUpdate);
        EventBus.on('player-experience-updated', handlePlayerExpUpdate);
        EventBus.on('player-stats-updated', handlePlayerStatsUpdate);
        EventBus.on('game-started', handleGameStart);
        EventBus.on('game-stopped', handleGameStop);
        EventBus.on('player-death', handlePlayerDeath);
        EventBus.on('main-scene-started', handleGameStart);

        const handleWindowExpUpdate = (event) => {
            if (event.detail) {
                handlePlayerExpUpdate(event.detail);
            }
        };

        const handleWindowStatsUpdate = (event) => {
            if (event.detail) {
                handlePlayerStatsUpdate(event.detail);
            }
        };
        
        window.addEventListener('playerExpUpdated', handleWindowExpUpdate);
        window.addEventListener('playerExperienceUpdated', handleWindowExpUpdate);
        window.addEventListener('playerStatsUpdated', handleWindowStatsUpdate);
        window.addEventListener('playerDeath', handlePlayerDeath);

        return () => {
            EventBus.removeListener('player-exp-updated', handlePlayerExpUpdate);
            EventBus.removeListener('player-experience-updated', handlePlayerExpUpdate);
            EventBus.removeListener('player-stats-updated', handlePlayerStatsUpdate);
            EventBus.removeListener('game-started', handleGameStart);
            EventBus.removeListener('game-stopped', handleGameStop);
            EventBus.removeListener('player-death', handlePlayerDeath);
            EventBus.removeListener('main-scene-started', handleGameStart);

            window.removeEventListener('playerExpUpdated', handleWindowExpUpdate);
            window.removeEventListener('playerExperienceUpdated', handleWindowExpUpdate);
            window.removeEventListener('playerStatsUpdated', handleWindowStatsUpdate);
            window.removeEventListener('playerDeath', handlePlayerDeath);
        };
    }, []);

    if (!isVisible) {
        return null;
    }

    const expPercentage = Math.max(0, Math.min(100, (playerStats.currentExp / playerStats.maxExp) * 100));
    
    return (
        <div style={{
            position: 'fixed',
            bottom: '3vh',  
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999
        }}>
            {/* Main HUD Container */}
            <div style={{
                position: 'relative',
                width: '600px',
                height: '180px'
            }}>
                {/* Main HUD Background */}
                <div style={{
                    position: 'absolute',
                    top: '0px',
                    left: '0px',
                    width: '100%',
                    height: '100%',
                    backgroundImage: 'url(/assets/HUD/HUD_Skill_Table_XP_BG_V01.png)',
                    backgroundSize: '100% 100%',
                    backgroundRepeat: 'no-repeat',
                    zIndex: 2
                }} />
                
                {/* XP Bar Fill */}
                <div style={{
                    position: 'absolute',
                    left: '48px',
                    top: '26px', 
                    width: `calc((26.3vw) * ${expPercentage / 100})`,
                    height: '24px',
                    backgroundImage: 'url(/assets/HUD/HUD_Skill_Table_XP_Indicator_Animation_V01.png)',
                    backgroundSize: '100% 100%',
                    backgroundRepeat: 'no-repeat',
                    zIndex: 1,
                    transition: 'width 0.5s ease-in-out'
                }} />
                
                {/* Skill Slots */}
                <div style={{
                    position: 'absolute',
                    top: '60px', 
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '15px', 
                    zIndex: 2
                }}>
                    {/* 5 Empty Skill Slots for now */}
                    {[1, 2, 3, 4, 5,].map((slotNumber) => (
                        <div key={slotNumber} style={{
                            position: 'relative',
                            width: '60px',  
                            height: '60px', 
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            border: '2px solid #654321',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                        }}>
                            {/* Skill Slot Number */}
                            <div style={{
                                position: 'absolute',
                                bottom: '-3px',
                                right: '-3px', 
                                width: '20px', 
                                height: '20px',
                                backgroundColor: 'rgba(0,0,0,0.8)',
                                border: '1px solid #FFD700',
                                borderRadius: '50%',
                                color: '#FFD700',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 6
                            }}>
                                {slotNumber}
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Level Display */}
                <div style={{
                    position: 'absolute',
                    left: '24px',
                    color: '#FFD700',
                    fontSize: '20px',
                    top: '-5px',
                    fontWeight: 'bold',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
                    zIndex: 3,
                    pointerEvents: 'none'
                }}>
                    Lv.{playerStats.level}
                </div>
                
                {/* XP Text */}
                <div style={{
                    position: 'absolute',
                    top: '-5px',    
                    right: '24px',  
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
                    zIndex: 3,
                    pointerEvents: 'none'
                }}>
                    {Math.floor(playerStats.currentExp)}/{playerStats.maxExp}
                </div>
            </div>
        </div>
    );
};

export default SkillExpBar;