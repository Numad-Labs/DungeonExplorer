import React, { useState, useEffect } from 'react';
import { EventBus } from '../game/EventBus';
import { getUpgrades } from '../services/api/gameApiService';

const PlayerStatsPanel = () => {
    const [playerStats, setPlayerStats] = useState([]);
    const [isVisible, setIsVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isGameActive, setIsGameActive] = useState(false);

    useEffect(() => {
        const loadPlayerStats = async () => {
            try {
                const response = await getUpgrades();
                const stats = response.data || response;
                setPlayerStats(stats);
            } catch (error) {
                console.error('Failed to load player stats:', error);
            }
        };

        const handleGameStart = () => {
            setIsGameActive(true);
            setIsVisible(true);
            loadPlayerStats();
        };
        
        const handleGameEnd = () => {
            setIsGameActive(false);
            setIsVisible(false);
        };

        EventBus.on('game-started', handleGameStart);
        EventBus.on('main-scene-started', handleGameStart);
        EventBus.on('current-scene-ready', handleGameStart);
        EventBus.on('new-run-started', handleGameStart);
        
        EventBus.on('player-death', handleGameEnd);
        EventBus.on('game-ended', handleGameEnd);

        return () => {
            EventBus.off('game-started', handleGameStart);
            EventBus.off('main-scene-started', handleGameStart);
            EventBus.off('current-scene-ready', handleGameStart);
            EventBus.off('new-run-started', handleGameStart);
            EventBus.off('player-death', handleGameEnd);
            EventBus.off('game-ended', handleGameEnd);
        };
    }, []);

    const getStatIcon = (type) => {
        const iconMap = {
            'MAX_HEALTH': '💪',
            'MOVESPEED': '⚡',
            'COOLDOWN_REDUCTION': '🧠',
            'DAMAGE_BOOST': '⚔️',
            'ATTACK_RANGE': '🎯',
            'PICKUP_RADIUS': '🧲',
            'HP_REGEN': '❤️'
        };
        return iconMap[type] || '📊';
    };

    const getStatColor = (type) => {
        const colorMap = {
            'MAX_HEALTH': '#4CAF50',
            'MOVESPEED': '#2196F3', 
            'COOLDOWN_REDUCTION': '#9C27B0',
            'DAMAGE_BOOST': '#F44336',
            'ATTACK_RANGE': '#FF9800',
            'PICKUP_RADIUS': '#00BCD4',
            'HP_REGEN': '#E91E63'
        };
        return colorMap[type] || '#607D8B';
    };

    if (!isVisible || !isGameActive) {
        return null;
    }

    return (
        <div style={{
            position: 'fixed',
            top: '2vh',
            right: '2vw',
            zIndex: 9998,
            background: 'rgba(0,0,0,0.85)',
            border: '2px solid #FFD700',
            borderRadius: '10px',
            padding: isExpanded ? '15px' : '10px',
            minWidth: isExpanded ? '280px' : '60px',
            maxHeight: '80vh',
            overflowY: 'auto',
            transition: 'all 0.3s ease-in-out'
        }}>
            {/* Toggle Button */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: isExpanded ? '10px' : '0px'
            }}>
                <div style={{
                    color: '#FFD700',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                }}>
                    {isExpanded ? 'Player Stats' : '📊'}
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#FFD700',
                        fontSize: '14px',
                        cursor: 'pointer',
                        padding: '2px 5px'
                    }}
                >
                    {isExpanded ? '−' : '+'}
                </button>
            </div>

            {/* Stats List */}
            {isExpanded && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {playerStats.map((stat) => (
                        <div key={stat.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'rgba(255,255,255,0.1)',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: `1px solid ${getStatColor(stat.type)}40`
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '16px' }}>
                                    {getStatIcon(stat.type)}
                                </span>
                                <div>
                                    <div style={{
                                        color: 'white',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                                    }}>
                                        {stat.name}
                                    </div>
                                    <div style={{
                                        color: '#AAA',
                                        fontSize: '10px'
                                    }}>
                                        {stat.description}
                                    </div>
                                </div>
                            </div>
                            <div style={{
                                color: getStatColor(stat.type),
                                fontSize: '14px',
                                fontWeight: 'bold',
                                textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                            }}>
                                Lv.{stat.level}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PlayerStatsPanel;