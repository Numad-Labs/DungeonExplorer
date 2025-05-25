import React, { useState, useEffect } from 'react';

const passiveUpgrades = [
  {
    id: 'maxHealth',
    name: 'Max Health',
    description: 'Increase your maximum health points',
    icon: '❤️',
    baseValue: 100,
    valuePerLevel: 20,
    baseCost: 100,
    costMultiplier: 1.5,
    maxLevel: 15,
    category: 'survival'
  },
  {
    id: 'baseDamage',
    name: 'Base Damage',
    description: 'Increase your base weapon damage',
    icon: '⚔️',
    baseValue: 10,
    valuePerLevel: 2,
    baseCost: 150,
    costMultiplier: 1.6,
    maxLevel: 15,
    category: 'combat'
  },
  {
    id: 'moveSpeed',
    name: 'Move Speed',
    description: 'Increase your movement speed',
    icon: '💨',
    baseValue: 200,
    valuePerLevel: 15,
    baseCost: 125,
    costMultiplier: 1.4,
    maxLevel: 12,
    category: 'mobility'
  },
  {
    id: 'attackSpeed',
    name: 'Attack Speed',
    description: 'Increase your attack rate',
    icon: '⚡',
    baseValue: 1,
    valuePerLevel: 0.1,
    baseCost: 175,
    costMultiplier: 1.7,
    maxLevel: 10,
    category: 'combat'
  },
  {
    id: 'critChance',
    name: 'Critical Chance',
    description: 'Increase chance for critical hits',
    icon: '💥',
    baseValue: 5,
    valuePerLevel: 2,
    baseCost: 200,
    costMultiplier: 1.8,
    maxLevel: 10,
    category: 'combat'
  },
  {
    id: 'critDamage',
    name: 'Critical Damage',
    description: 'Increase critical hit damage multiplier',
    icon: '🔥',
    baseValue: 150,
    valuePerLevel: 25,
    baseCost: 250,
    costMultiplier: 1.9,
    maxLevel: 8,
    category: 'combat'
  },
  {
    id: 'pickupRange',
    name: 'Pickup Range',
    description: 'Increase item pickup range',
    icon: '🧲',
    baseValue: 50,
    valuePerLevel: 10,
    baseCost: 120,
    costMultiplier: 1.3,
    maxLevel: 12,
    category: 'utility'
  },
  {
    id: 'armor',
    name: 'Armor',
    description: 'Reduce damage taken from enemies',
    icon: '🛡️',
    baseValue: 0,
    valuePerLevel: 2,
    baseCost: 180,
    costMultiplier: 1.6,
    maxLevel: 10,
    category: 'survival'
  },
  {
    id: 'expMultiplier',
    name: 'EXP Gain',
    description: 'Increase experience gained from enemies',
    icon: '📈',
    baseValue: 100,
    valuePerLevel: 10,
    baseCost: 300,
    costMultiplier: 2.0,
    maxLevel: 8,
    category: 'progression'
  },
  {
    id: 'goldMultiplier',
    name: 'Gold Gain',
    description: 'Increase gold earned from enemies',
    icon: '💰',
    baseValue: 100,
    valuePerLevel: 20,
    baseCost: 350,
    costMultiplier: 2.2,
    maxLevel: 8,
    category: 'progression'
  }
];

const MainMenu = ({ gameManager, onStartGame }) => {
  const [activeTab, setActiveTab] = useState('upgrades');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showTooltip, setShowTooltip] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeathScreen, setShowDeathScreen] = useState(false);
  const [gameState, setGameState] = useState({
    gold: 500,
    passiveUpgrades: {},
    allTimeStats: {},
    lastRunStats: null,
    currentRunStats: {}
  });

  useEffect(() => {
    // Load game state
    if (gameManager) {
      setGameState({
        gold: gameManager.gold || 500,
        passiveUpgrades: gameManager.passiveUpgrades || {},
        allTimeStats: gameManager.allTimeStats || {},
        lastRunStats: gameManager.lastRunStats || null,
        currentRunStats: gameManager.currentRunStats || {}
      });
    }
    
    // Listen for game state updates
    const handleGameStateUpdate = (event) => {
      if (event.detail) {
        setGameState(event.detail);
      } else if (gameManager) {
        setGameState({
          gold: gameManager.gold || 500,
          passiveUpgrades: gameManager.passiveUpgrades || {},
          allTimeStats: gameManager.allTimeStats || {},
          lastRunStats: gameManager.lastRunStats || null,
          currentRunStats: gameManager.currentRunStats || {}
        });
      }
    };
    
    // Listen for death events
    const handlePlayerDeath = (event) => {
      setShowDeathScreen(true);
      setActiveTab('death');
    };
    
    window.addEventListener('gameStateUpdated', handleGameStateUpdate);
    window.addEventListener('playerDeath', handlePlayerDeath);
    
    return () => {
      window.removeEventListener('gameStateUpdated', handleGameStateUpdate);
      window.removeEventListener('playerDeath', handlePlayerDeath);
    };
  }, [gameManager]);

  const categories = ['all', 'combat', 'survival', 'mobility', 'utility', 'progression'];
  
  const filteredUpgrades = selectedCategory === 'all' 
    ? passiveUpgrades 
    : passiveUpgrades.filter(upgrade => upgrade.category === selectedCategory);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const purchaseUpgrade = (upgradeId) => {
    const upgrade = passiveUpgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;

    const currentLevel = gameState.passiveUpgrades[upgradeId]?.level || 0;
    
    if (currentLevel >= upgrade.maxLevel) {
      showNotification('Already at maximum level!');
      return;
    }

    const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
    
    if (gameState.gold < cost) {
      showNotification('Not enough gold!');
      return;
    }

    console.log(`Attempting to purchase ${upgradeId} for ${cost} gold`);

    if (gameManager && gameManager.purchaseUpgrade) {
      const success = gameManager.purchaseUpgrade(upgradeId, cost);
      if (success) {
        const newLevel = currentLevel + 1;
        console.log(`Successfully purchased ${upgrade.name} level ${newLevel}`);
        showNotification(`${upgrade.name} upgraded to level ${newLevel}!`);
        
        const newGameState = {
          ...gameState,
          gold: gameManager.gold,
          passiveUpgrades: { ...gameManager.passiveUpgrades }
        };
        setGameState(newGameState);
      } else {
        showNotification('Purchase failed!');
      }
    } else {
      console.error('GameManager or purchaseUpgrade method not available');
      showNotification('Error: Game system not ready');
    }
  };

  const resetProgress = () => {
    if (gameManager && gameManager.resetProgress) {
      gameManager.resetProgress();
      setShowResetConfirm(false);
      showNotification('Progress has been reset!');
    }
  };

  const startGame = () => {
    setShowDeathScreen(false);
    if (gameManager && gameManager.startNewRun) {
      gameManager.startNewRun();
    }
    if (onStartGame) {
      onStartGame();
    }
  };

  const continueAfterDeath = () => {
    setShowDeathScreen(false);
    setActiveTab('upgrades');
  };

  const formatValue = (upgrade, value) => {
    if (upgrade.id === 'critChance') return `${value}%`;
    if (upgrade.id === 'critDamage') return `${value}%`;
    if (upgrade.id === 'expMultiplier' || upgrade.id === 'goldMultiplier') return `${value}%`;
    return value;
  };

  // Death screen
  if (showDeathScreen && gameState.lastRunStats) {
    return (
      <div style={{
        backgroundColor: '#1a1a1a',
        color: 'white',
        height: '100%',
        width: '100%',
        padding: '20px',
        boxSizing: 'border-box',
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: '#333333',
          padding: '30px',
          borderRadius: '10px',
          maxWidth: '600px',
          width: '100%',
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#ff6666', marginBottom: '30px', fontSize: '48px' }}>💀 YOU DIED 💀</h1>
          
          <div style={{
            backgroundColor: '#444444',
            padding: '20px',
            borderRadius: '5px',
            marginBottom: '20px'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px' }}>📊 Last Run Statistics</h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '15px',
              textAlign: 'left'
            }}>
              <div>
                <strong>⏱️ Survival Time:</strong><br />
                <span style={{ color: '#00ff88' }}>{formatTime(gameState.lastRunStats.survivalTime)}</span>
              </div>
              <div>
                <strong>📈 Level Reached:</strong><br />
                <span style={{ color: '#ffaa00' }}>{gameState.lastRunStats.maxLevel}</span>
              </div>
              <div>
                <strong>⚔️ Enemies Killed:</strong><br />
                <span style={{ color: '#ff6666' }}>{gameState.lastRunStats.enemiesKilled}</span>
              </div>
              <div>
                <strong>💰 Gold Earned:</strong><br />
                <span style={{ color: '#ffff00' }}>{gameState.lastRunStats.goldEarned}</span>
              </div>
              <div>
                <strong>🎯 Experience Gained:</strong><br />
                <span style={{ color: '#8888ff' }}>{formatNumber(gameState.lastRunStats.experienceGained)}</span>
              </div>
              <div>
                <strong>💥 Damage Dealt:</strong><br />
                <span style={{ color: '#ff8800' }}>{formatNumber(gameState.lastRunStats.damageDealt)}</span>
              </div>
            </div>
            
            {gameState.lastRunStats.causeOfDeath && (
              <div style={{ marginTop: '15px', color: '#ff9999' }}>
                <strong>☠️ Cause of Death: Skill Issue</strong> 
                {/* {gameState.lastRunStats.causeOfDeath} */}
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button
              onClick={continueAfterDeath}
              style={{
                backgroundColor: '#3F8F3F',
                color: 'white',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '5px',
                fontSize: '18px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🏠 Continue to Menu
            </button>
            
            <button
              onClick={startGame}
              style={{
                backgroundColor: '#8F3F3F',
                color: 'white',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '5px',
                fontSize: '18px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🔄 Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#242424',
      color: 'white',
      height: '100%',
      width: '100%',
      padding: '20px',
      boxSizing: 'border-box',
      fontFamily: 'Arial, sans-serif',
      overflow: 'auto'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h1 style={{ margin: 0 }}>🎮 SURVIVOR GAME</h1>
        
        <div style={{
          backgroundColor: '#333333',
          padding: '10px 15px',
          borderRadius: '5px',
          fontWeight: 'bold'
        }}>
          💰 GOLD: <span style={{ color: '#ffff00' }}>{formatNumber(gameState.gold)}</span>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #555',
        marginBottom: '20px'
      }}>
        {['upgrades', 'stats', 'settings'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              backgroundColor: activeTab === tab ? '#555555' : 'transparent',
              color: activeTab === tab ? 'white' : '#aaaaaa',
              border: 'none',
              padding: '10px 20px',
              cursor: 'pointer',
              fontSize: '16px',
              textTransform: 'capitalize'
            }}
          >
            {tab === 'upgrades' && '⚡'} {tab === 'stats' && '📊'} {tab === 'settings' && '⚙️'} {tab}
          </button>
        ))}
      </div>
      
      {/* Main Content */}
      <div style={{
        backgroundColor: '#333333',
        padding: '20px',
        borderRadius: '5px',
        marginBottom: '20px',
        minHeight: '400px'
      }}>
        {/* Upgrades Tab */}
        {activeTab === 'upgrades' && (
          <div>
            {/* Category Filter */}
            <div style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '20px',
              flexWrap: 'wrap'
            }}>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    backgroundColor: selectedCategory === category ? '#666666' : '#444444',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
            
            {/* Upgrades Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '15px'
            }}>
              {filteredUpgrades.map(upgrade => {
                const currentLevel = gameState.passiveUpgrades[upgrade.id]?.level || 0;
                const currentValue = gameState.passiveUpgrades[upgrade.id]?.value || upgrade.baseValue;
                const nextValue = currentLevel < upgrade.maxLevel 
                  ? upgrade.baseValue + (upgrade.valuePerLevel * (currentLevel + 1))
                  : null;
                const cost = currentLevel < upgrade.maxLevel 
                  ? Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel))
                  : null;
                
                return (
                  <div 
                    key={upgrade.id} 
                    style={{
                      backgroundColor: '#444444',
                      padding: '15px',
                      borderRadius: '8px',
                      position: 'relative',
                      border: currentLevel > 0 ? '2px solid #666666' : 'none'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '24px' }}>{upgrade.icon}</span>
                        <h3 style={{ margin: 0 }}>{upgrade.name}</h3>
                        
                        <button
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#aaaaaa',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                          onMouseEnter={() => setShowTooltip(upgrade.id)}
                          onMouseLeave={() => setShowTooltip(null)}
                        >
                          ⓘ
                        </button>
                      </div>
                      
                      <div style={{
                        backgroundColor: '#333333',
                        padding: '5px 10px',
                        borderRadius: '15px',
                        fontSize: '14px'
                      }}>
                        {currentLevel}/{upgrade.maxLevel}
                      </div>
                    </div>
                    
                    {showTooltip === upgrade.id && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '0',
                        backgroundColor: '#222222',
                        padding: '10px',
                        borderRadius: '5px',
                        marginTop: '5px',
                        zIndex: 10,
                        width: '100%',
                        boxSizing: 'border-box',
                        border: '1px solid #555'
                      }}>
                        {upgrade.description}
                      </div>
                    )}
                    
                    <div style={{ marginBottom: '15px', fontSize: '14px' }}>
                      <div style={{ marginBottom: '5px' }}>
                        <span>Current: </span>
                        <span style={{ color: '#88ff88', fontWeight: 'bold' }}>
                          {formatValue(upgrade, currentValue)}
                        </span>
                      </div>
                      
                      {nextValue !== null && (
                        <div>
                          <span>Next: </span>
                          <span style={{ color: '#88ffff', fontWeight: 'bold' }}>
                            {formatValue(upgrade, nextValue)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      {currentLevel < upgrade.maxLevel ? (
                        <>
                          <div style={{ color: '#ffff00', fontWeight: 'bold' }}>
                            💰 {formatNumber(cost)}
                          </div>
                          
                          <button
                            onClick={() => gameState.gold >= cost && purchaseUpgrade(upgrade.id)}
                            disabled={gameState.gold < cost}
                            style={{
                              backgroundColor: gameState.gold >= cost ? '#3F8F3F' : '#555555',
                              color: gameState.gold >= cost ? 'white' : '#777777',
                              border: 'none',
                              padding: '10px 20px',
                              borderRadius: '5px',
                              cursor: gameState.gold >= cost ? 'pointer' : 'not-allowed',
                              fontWeight: 'bold'
                            }}
                          >
                            ⬆️ UPGRADE
                          </button>
                        </>
                      ) : (
                        <div style={{
                          width: '100%',
                          textAlign: 'center',
                          color: '#00ff00',
                          fontWeight: 'bold',
                          fontSize: '18px'
                        }}>
                          ✅ MAXED
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div>
            <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>📊 STATISTICS</h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {/* All-Time Stats */}
              <div style={{
                backgroundColor: '#444444',
                padding: '20px',
                borderRadius: '8px'
              }}>
                <h3 style={{
                  marginTop: 0,
                  borderBottom: '2px solid #666666',
                  paddingBottom: '10px',
                  color: '#ffaa00'
                }}>
                  🏆 All-Time Records
                </h3>
                
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>🎮 Total Runs:</span>
                    <span style={{ color: '#88ff88' }}>{gameState.allTimeStats.totalRuns || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>📈 Highest Level:</span>
                    <span style={{ color: '#ffaa00' }}>{gameState.allTimeStats.highestLevel || 1}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>⏱️ Longest Survival:</span>
                    <span style={{ color: '#00ff88' }}>
                      {formatTime(gameState.allTimeStats.longestSurvivalTime || 0)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>💰 Total Gold Earned:</span>
                    <span style={{ color: '#ffff00' }}>
                      {formatNumber(gameState.allTimeStats.totalGoldEarned || 0)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>⚔️ Enemies Killed:</span>
                    <span style={{ color: '#ff6666' }}>
                      {formatNumber(gameState.allTimeStats.totalEnemiesKilled || 0)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>📊 Average Survival:</span>
                    <span style={{ color: '#88ddff' }}>
                      {formatTime(gameState.allTimeStats.averageSurvivalTime || 0)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Current Upgrades */}
              <div style={{
                backgroundColor: '#444444',
                padding: '20px',
                borderRadius: '8px'
              }}>
                <h3 style={{
                  marginTop: 0,
                  borderBottom: '2px solid #666666',
                  paddingBottom: '10px',
                  color: '#88ff88'
                }}>
                  ⚡ Current Upgrades
                </h3>
                
                <div style={{ display: 'grid', gap: '8px' }}>
                  {passiveUpgrades.map(upgrade => {
                    const level = gameState.passiveUpgrades[upgrade.id]?.level || 0;
                    const value = gameState.passiveUpgrades[upgrade.id]?.value || upgrade.baseValue;
                    
                    return (
                      <div key={upgrade.id} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        opacity: level > 0 ? 1 : 0.5
                      }}>
                        <span>{upgrade.icon} {upgrade.name}:</span>
                        <div>
                          <span style={{ fontWeight: 'bold' }}>
                            {formatValue(upgrade, value)}
                          </span>
                          <span style={{ color: '#777777', fontSize: '12px', marginLeft: '8px' }}>
                            (Lv {level})
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '30px'
          }}>
            <h2>⚙️ SETTINGS</h2>
            
            <div style={{
              backgroundColor: '#444444',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#ff6666', marginBottom: '15px' }}>⚠️ Danger Zone</h3>
              <p style={{ marginBottom: '20px', color: '#cccccc' }}>
                This will reset all your progress including upgrades and statistics.
                <br />You will receive 25,000 gold to test upgrades.
              </p>
              
              <button
                onClick={() => setShowResetConfirm(true)}
                style={{
                  backgroundColor: '#8F3F3F',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                🗑️ RESET ALL PROGRESS
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Start Game Button */}
      <button
        onClick={startGame}
        style={{
          backgroundColor: '#3F8F3F',
          color: 'white',
          border: 'none',
          padding: '18px',
          borderRadius: '8px',
          width: '100%',
          fontSize: '20px',
          fontWeight: 'bold',
          cursor: 'pointer',
          textTransform: 'uppercase'
        }}
      >
        🎮 Start Game
      </button>

      {/* Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#333333',
          color: 'white',
          padding: '15px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 1000,
          border: '2px solid #666666'
        }}>
          {notification}
        </div>
      )}
      
      {/* Reset Confirmation */}
      {showResetConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#333333',
            padding: '30px',
            borderRadius: '10px',
            maxWidth: '400px',
            textAlign: 'center'
          }}>
            <h3 style={{ marginTop: 0, color: '#ff6666' }}>⚠️ Reset Progress?</h3>
            <p style={{ color: '#ff9999', marginBottom: '25px' }}>
              This action cannot be undone!<br />
              All upgrades and statistics will be lost.
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
              <button
                onClick={() => setShowResetConfirm(false)}
                style={{
                  backgroundColor: '#555555',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                CANCEL
              </button>
              
              <button
                onClick={resetProgress}
                style={{
                  backgroundColor: '#8F3F3F',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                RESET
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainMenu;