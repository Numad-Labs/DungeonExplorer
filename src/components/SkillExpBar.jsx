import React, { useState, useEffect, useRef } from 'react';
import { EventBus } from '../game/EventBus';

const SkillExpBar = () => {
    const [playerStats, setPlayerStats] = useState({
        currentExp: 0,
        maxExp: 100,
        level: 1
    });

    const [activeSkills, setActiveSkills] = useState([]);
    const [skillCooldowns, setSkillCooldowns] = useState({});
    const [skillMaxCooldowns, setSkillMaxCooldowns] = useState({});
    const [skillLevels, setSkillLevels] = useState({});
    const [isVisible, setIsVisible] = useState(true);
    
    const visualIntervals = useRef({});
    const ACTIONABLE_SKILLS = {
        slash: {
            name: "Slash Attack",
            icon: "./assets/Card/Icon/icon normal/icon_slash.png",
            glowIcon: "./assets/Card/Icon/glow effect/icon_slash_glow_effect.png",
            defaultCooldown: 1000,
            keybind: '1'
        },
        fireBullet: {
            name: "Fire Arrow",
            icon: "./assets/Card/Icon/icon normal/icon_fire_arrow.png",
            glowIcon: "./assets/Card/Icon/glow effect/icon_fire_arrow_glow_effect.png",
            defaultCooldown: 800,
            keybind: '2'
        },
        fireBomb: {
            name: "Fire Ball",
            icon: "./assets/Card/Icon/icon normal/icon_fire_ball.png",
            glowIcon: "./assets/Card/Icon/glow effect/icon_fire_ball_glow_effect.png",
            defaultCooldown: 2500,
            keybind: '3'
        },
        ice: {
            name: "Ice Shard",
            icon: "./assets/Card/Icon/icon normal/icon_ice_shard.png",
            glowIcon: "./assets/Card/Icon/glow effect/icon_ice_shard_glow_effect.png",
            defaultCooldown: 1600,
            keybind: '4'
        },
        lightning: {
            name: "Lightning Chain",
            icon: "./assets/Card/Icon/icon normal/icon_lightning_chain.png",
            glowIcon: "./assets/Card/Icon/glow effect/icon_lightning_chain_glow_effect.png",
            defaultCooldown: 2000,
            keybind: '5'
        },
        blindingLight: {
            name: "Holy Light",
            icon: "./assets/Card/Icon/icon normal/icon_holy_light-.png",
            glowIcon: "./assets/Card/Icon/glow effect/icon_holy_light_glow_effect.png",
            defaultCooldown: 6000,
            keybind: '6'
        },
        marksman: {
            name: "Marksman Shot",
            icon: "./assets/Card/Icon/icon normal/icon_marksman.png",
            glowIcon: "./assets/Card/Icon/glow effect/icon_marksman_glow_effect.png",
            defaultCooldown: 3300,
            keybind: '7'
        }
    };

    const clearAllVisualIntervals = () => {
        Object.keys(visualIntervals.current).forEach(skillKey => {
            if (visualIntervals.current[skillKey]) {
                clearInterval(visualIntervals.current[skillKey]);
                delete visualIntervals.current[skillKey];
            }
        });
    };

    const clearSkillVisualInterval = (skillKey) => {
        if (visualIntervals.current[skillKey]) {
            clearInterval(visualIntervals.current[skillKey]);
            delete visualIntervals.current[skillKey];
        }
    };

    const startVisualCooldownDisplay = (skillKey, initialCooldown) => {
        clearSkillVisualInterval(skillKey);

        const visualInterval = setInterval(() => {
            setSkillCooldowns(prev => {
                const currentCooldown = prev[skillKey];
                
                if (!currentCooldown || currentCooldown <= 0) {
                    clearSkillVisualInterval(skillKey);
                    const { [skillKey]: removed, ...rest } = prev;
                    return rest;
                }
                
                const newCooldown = Math.max(0, currentCooldown - 100);
                return { ...prev, [skillKey]: newCooldown };
            });
        }, 100);

        visualIntervals.current[skillKey] = visualInterval;
    };

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

        const handleSkillUpdate = (skillData) => {
            if (skillData.skillLevels) {
                setSkillLevels(skillData.skillLevels);
                updateActiveSkills(skillData.skillLevels);
            }
        };

        const handleSkillUsedForDisplay = (skillData) => {
            const { skillKey, cooldown } = skillData;
            if (skillKey && ACTIONABLE_SKILLS[skillKey] && cooldown && !isNaN(cooldown) && cooldown > 0) {
                setSkillMaxCooldowns(prev => ({
                    ...prev,
                    [skillKey]: cooldown
                }));
                
                setSkillCooldowns(prev => ({
                    ...prev,
                    [skillKey]: cooldown
                }));
                startVisualCooldownDisplay(skillKey, cooldown);
            }
        };

        const handleAttackUsedForDisplay = (attackData) => {
            const attackToSkillMap = {
                'slash': 'slash',
                'fireBullet': 'fireBullet',
                'fireBomb': 'fireBomb', 
                'ice': 'ice',
                'lightning': 'lightning',
                'blindingLight': 'blindingLight',
                'marksman': 'marksman'
            };

            const skillKey = attackToSkillMap[attackData.attackType || attackData.type];
            if (skillKey && ACTIONABLE_SKILLS[skillKey]) {
                const actualCooldown = attackData.cooldown || ACTIONABLE_SKILLS[skillKey].defaultCooldown;
                if (!isNaN(actualCooldown) && actualCooldown > 0) {
                    handleSkillUsedForDisplay({ 
                        skillKey, 
                        cooldown: actualCooldown
                    });
                }
            }
        };

        const handleGameStart = () => {
            setIsVisible(true);
        };

        const handleGameStop = () => {
            setIsVisible(false);
            clearAllVisualIntervals();
            setSkillCooldowns({});
            setSkillMaxCooldowns({});
        };

        const handlePlayerDeath = () => {
            setIsVisible(false);
            clearAllVisualIntervals();
            setSkillCooldowns({});
            setSkillMaxCooldowns({});
        };

        EventBus.on('player-exp-updated', handlePlayerExpUpdate);
        EventBus.on('player-experience-updated', handlePlayerExpUpdate);
        EventBus.on('player-stats-updated', handlePlayerStatsUpdate);
        EventBus.on('skill-levels-updated', handleSkillUpdate);
        EventBus.on('skill-used', handleSkillUsedForDisplay);
        EventBus.on('attack-used', handleAttackUsedForDisplay);
        EventBus.on('player-attack-used', handleAttackUsedForDisplay);
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

        const handleWindowSkillUpdate = (event) => {
            if (event.detail) {
                handleSkillUpdate(event.detail);
            }
        };

        const handleWindowAttackUsed = (event) => {
            if (event.detail) {
                handleAttackUsedForDisplay(event.detail);
            }
        };
        
        window.addEventListener('playerExpUpdated', handleWindowExpUpdate);
        window.addEventListener('playerExperienceUpdated', handleWindowExpUpdate);
        window.addEventListener('playerStatsUpdated', handleWindowStatsUpdate);
        window.addEventListener('skillLevelsUpdated', handleWindowSkillUpdate);
        window.addEventListener('playerDeath', handlePlayerDeath);
        window.addEventListener('attackUsed', handleWindowAttackUsed);
        window.addEventListener('playerAttackUsed', handleWindowAttackUsed);

        return () => {
            clearAllVisualIntervals();
            
            EventBus.removeListener('player-exp-updated', handlePlayerExpUpdate);
            EventBus.removeListener('player-experience-updated', handlePlayerExpUpdate);
            EventBus.removeListener('player-stats-updated', handlePlayerStatsUpdate);
            EventBus.removeListener('skill-levels-updated', handleSkillUpdate);
            EventBus.removeListener('skill-used', handleSkillUsedForDisplay);
            EventBus.removeListener('attack-used', handleAttackUsedForDisplay);
            EventBus.removeListener('player-attack-used', handleAttackUsedForDisplay);
            EventBus.removeListener('game-started', handleGameStart);
            EventBus.removeListener('game-stopped', handleGameStop);
            EventBus.removeListener('player-death', handlePlayerDeath);
            EventBus.removeListener('main-scene-started', handleGameStart);

            window.removeEventListener('playerExpUpdated', handleWindowExpUpdate);
            window.removeEventListener('playerExperienceUpdated', handleWindowExpUpdate);
            window.removeEventListener('playerStatsUpdated', handleWindowStatsUpdate);
            window.removeEventListener('skillLevelsUpdated', handleWindowSkillUpdate);
            window.removeEventListener('playerDeath', handlePlayerDeath);
            window.removeEventListener('attackUsed', handleWindowAttackUsed);
            window.removeEventListener('playerAttackUsed', handleWindowAttackUsed);
        };
    }, []);

    const updateActiveSkills = (currentSkillLevels) => {
        const unlockedActionableSkills = Object.keys(ACTIONABLE_SKILLS)
            .filter(skillKey => currentSkillLevels[skillKey] > 0)
            .slice(0, 7);

        setActiveSkills(unlockedActionableSkills);
    };

    const getCooldownPercentage = (skillKey) => {
        const currentCooldown = skillCooldowns[skillKey];
        const maxCooldown = skillMaxCooldowns[skillKey];
        
        if (!currentCooldown || !maxCooldown || isNaN(currentCooldown) || isNaN(maxCooldown) || 
            currentCooldown <= 0 || maxCooldown <= 0) {
            return 0;
        }
        
        return Math.min(100, Math.max(0, (currentCooldown / maxCooldown) * 100));
    };

    const formatCooldownTime = (skillKey) => {
        const milliseconds = skillCooldowns[skillKey];
        
        if (!milliseconds || milliseconds <= 0 || isNaN(milliseconds)) {
            return '';
        }
        
        const seconds = Math.ceil(milliseconds / 1000);
        return seconds > 0 ? seconds.toString() : '';
    };

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
                    backgroundImage: 'url(./assets/HUD/HUD_Skill_Table_XP_BG_V01.png)',
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
                    backgroundImage: 'url(./assets/HUD/HUD_Skill_Table_XP_Indicator_Animation_V01.png)',
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
                    {[1, 2, 3, 4, 5, 6, 7].map((slotNumber) => {
                        const skillKey = activeSkills[slotNumber - 1];
                        const skill = skillKey ? ACTIONABLE_SKILLS[skillKey] : null;
                        const isOnCooldown = skillKey && skillCooldowns[skillKey] && skillCooldowns[skillKey] > 0 && !isNaN(skillCooldowns[skillKey]);
                        const cooldownPercentage = skillKey ? getCooldownPercentage(skillKey) : 0;
                        const skillLevel = skillKey ? skillLevels[skillKey] : 0;
                        const cooldownText = skillKey ? formatCooldownTime(skillKey) : '';

                        return (
                            <div 
                                key={slotNumber} 
                                style={{
                                    position: 'relative',
                                    width: '60px',  
                                    height: '60px', 
                                    backgroundColor: skill ? 'rgba(30, 30, 30, 0.8)' : 'rgba(0,0,0,0.5)',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    transition: 'all 0.2s ease',
                                    boxShadow: skill && !isOnCooldown ? '0 0 10px rgba(255, 215, 0, 0.3)' : 'none'
                                }}
                                title={skill ? `${skill.name} (Auto) - Level ${skillLevel}` : `Skill Slot ${slotNumber}`}
                            >
                                {/* Skill Icon */}
                                {skill && (
                                    <img
                                        src={skill.icon}
                                        alt={skill.name}
                                        style={{
                                            width: '60px',
                                            height: '60px',
                                            opacity: isOnCooldown ? 0.5 : 1,
                                            filter: isOnCooldown ? 'grayscale(50%)' : 'none',
                                            transition: 'all 0.2s ease'
                                        }}
                                    />
                                )}

                                {/* Cooldown Overlay */}
                                {isOnCooldown && (
                                    <>
                                        {/* Cooldown Sweep Animation */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '0',
                                            left: '0',
                                            width: '100%',
                                            height: `${cooldownPercentage}%`,
                                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                            transition: 'height 0.1s ease-out',
                                            zIndex: 3
                                        }} />

                                        {/* Cooldown Text */}
                                        {cooldownText && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                color: '#FF6B6B',
                                                fontSize: '16px',
                                                fontWeight: 'bold',
                                                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                                                zIndex: 4
                                            }}>
                                                {cooldownText}
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Skill Level Indicator */}
                                {skill && skillLevel > 0 && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '-3px',
                                        right: '-3px',
                                        width: '18px',
                                        height: '18px',
                                        backgroundColor: '#4A90E2',
                                        border: '1px solid #FFD700',
                                        borderRadius: '50%',
                                        color: 'white',
                                        fontSize: '10px',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 5
                                    }}>
                                        {skillLevel}
                                    </div>
                                )}

                                {/* Skill Ready Glow Effect */}
                                {skill && !isOnCooldown && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '0',
                                        left: '0',
                                        width: '100%',
                                        height: '100%',
                                        backgroundImage: `url(${skill.glowIcon})`,
                                        backgroundSize: '80% 80%',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                        opacity: 0.3,
                                        animation: 'skillGlow 2s ease-in-out infinite alternate',
                                        pointerEvents: 'none',
                                        zIndex: 1
                                    }} />
                                )}
                            </div>
                        );
                    })}
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

            {/* CSS for glow animation */}
            <style jsx>{`
                @keyframes skillGlow {
                    0% { opacity: 0.1; }
                    100% { opacity: 0.4; }
                }
            `}</style>
        </div>
    );
};

export default SkillExpBar;