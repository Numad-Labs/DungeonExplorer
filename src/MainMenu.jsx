import React, { useState, useEffect } from 'react';
import { saveToLocalStorage, loadFromLocalStorage, clearLocalStorage } from './GameStorage';

const passiveUpgrades = [
  {
    id: 'maxHealth',
    name: 'Max Health',
    description: 'Increase your maximum health',
    baseValue: 100,
    valuePerLevel: 20,
    baseCost: 100,
    costMultiplier: 1.5,
    maxLevel: 10
  },
  {
    id: 'baseDamage',
    name: 'Base Damage',
    description: 'Increase your base damage',
    baseValue: 10,
    valuePerLevel: 2,
    baseCost: 150,
    costMultiplier: 1.6,
    maxLevel: 10
  },
  {
    id: 'moveSpeed',
    name: 'Move Speed',
    description: 'Increase your movement speed',
    baseValue: 200,
    valuePerLevel: 15,
    baseCost: 125,
    costMultiplier: 1.4,
    maxLevel: 10
  },
  {
    id: 'expMultiplier',
    name: 'EXP Gain',
    description: 'Increase experience gained',
    baseValue: 1,
    valuePerLevel: 0.1,
    baseCost: 200,
    costMultiplier: 1.8,
    maxLevel: 5
  },
  {
    id: 'goldMultiplier',
    name: 'Gold Gain',
    description: 'Increase gold gained',
    baseValue: 1,
    valuePerLevel: 0.2,
    baseCost: 250,
    costMultiplier: 2,
    maxLevel: 5
  }
];

const MainMenu = ({ gameManager, onStartGame }) => {
  const [activeTab, setActiveTab] = useState('upgrades');
  const [showTooltip, setShowTooltip] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [gameState, setGameState] = useState({
    gold: 500,
    passiveUpgrades: {},
    gameStats: {
      totalGoldEarned: 0,
      totalEnemiesKilled: 0,
      totalExperienceGained: 0,
      highestLevel: 1,
      longestSurvivalTime: 0
    }
  });
  
  useEffect(() => {
    const savedData = loadFromLocalStorage();
    
    if (savedData) {
      console.log("Found saved data in local storage");
      setGameState({
        gold: savedData.gold || 500,
        passiveUpgrades: savedData.passiveUpgrades || {},
        gameStats: savedData.gameStats || gameState.gameStats
      });
      
      if (gameManager) {
        gameManager.gold = savedData.gold;
        gameManager.passiveUpgrades = {...savedData.passiveUpgrades};
        gameManager.gameStats = {...savedData.gameStats};
        console.log("Updated GameManager with saved data");
      }
    }
    else if (gameManager) {
      console.log("No saved data, using GameManager data");
      setGameState({
        gold: gameManager.gold || 500,
        passiveUpgrades: gameManager.passiveUpgrades || {},
        gameStats: gameManager.gameStats || gameState.gameStats
      });
    }
  }, []);
  
  useEffect(() => {
    if (gameManager) {
      const handleGameStateUpdated = () => {
        const newState = {
          gold: gameManager.gold || 500,
          passiveUpgrades: gameManager.passiveUpgrades || {},
          gameStats: gameManager.gameStats || gameState.gameStats
        };
        
        setGameState(newState);
        
        saveToLocalStorage(newState);
      };
      
      window.addEventListener('gameStateUpdated', handleGameStateUpdated);
      
      return () => {
        window.removeEventListener('gameStateUpdated', handleGameStateUpdated);
      };
    }
  }, [gameManager]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
    
    const newLevel = currentLevel + 1;
    const newValue = upgrade.baseValue + (upgrade.valuePerLevel * newLevel);
    
    const newGameState = {
      ...gameState,
      gold: gameState.gold - cost,
      passiveUpgrades: {
        ...gameState.passiveUpgrades,
        [upgradeId]: { level: newLevel, value: newValue }
      }
    };
    setGameState(newGameState);
    
    saveToLocalStorage(newGameState);
    
    if (gameManager) {
      gameManager.gold = newGameState.gold;
      
      if (!gameManager.passiveUpgrades) {
        gameManager.passiveUpgrades = {};
      }
      
      gameManager.passiveUpgrades[upgradeId] = {
        level: newLevel,
        value: newValue
      };
      
      if (gameManager.saveGame) {
        gameManager.saveGame();
      }
    }
    
    showNotification(`${upgrade.name} upgraded to level ${newLevel}!`);
  };
  
  const resetProgress = () => {
    const resetState = {
      gold: 25000,
      passiveUpgrades: passiveUpgrades.reduce((acc, upgrade) => {
        acc[upgrade.id] = { level: 0, value: upgrade.baseValue };
        return acc;
      }, {}),
      gameStats: {
        totalGoldEarned: 0,
        totalEnemiesKilled: 0,
        totalExperienceGained: 0,
        highestLevel: 1,
        longestSurvivalTime: 0
      }
    };
    
    setGameState(resetState);
    clearLocalStorage();
    
    if (gameManager) {
      gameManager.gold = resetState.gold;
      gameManager.passiveUpgrades = {...resetState.passiveUpgrades};
      gameManager.gameStats = {...resetState.gameStats};
    
      if (gameManager.saveGame) {
        gameManager.saveGame();
      }
    }
    
    setShowResetConfirm(false);
    showNotification('Progress has been reset!');
  };
  
  const startGame = () => {
    saveToLocalStorage(gameState);
    
    if (onStartGame) {
      onStartGame();
    }
  };
  
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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h1 style={{ margin: 0 }}>MAIN MENU</h1>
        
        <div style={{
          backgroundColor: '#333333',
          padding: '10px 15px',
          borderRadius: '5px',
          fontWeight: 'bold'
        }}>
          GOLD: <span style={{ color: '#ffff00' }}>{gameState.gold}</span>
        </div>
      </div>
      
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
            {tab}
          </button>
        ))}
      </div>
      
      <div style={{
        backgroundColor: '#333333',
        padding: '20px',
        borderRadius: '5px',
        marginBottom: '20px',
        minHeight: '400px'
      }}>
        {activeTab === 'upgrades' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {passiveUpgrades.map(upgrade => {
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
                    borderRadius: '5px',
                    position: 'relative'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <h3 style={{ margin: 0 }}>{upgrade.name}</h3>
                      
                      <button
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#aaaaaa',
                          cursor: 'pointer',
                          marginLeft: '5px',
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
                      Level: {currentLevel}/{upgrade.maxLevel}
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
                      boxSizing: 'border-box'
                    }}>
                      {upgrade.description}
                    </div>
                  )}
                  
                  <div style={{ marginBottom: '10px', fontSize: '14px' }}>
                    <span>Current: {typeof currentValue === 'number' && currentValue % 1 !== 0 
                      ? currentValue.toFixed(1) 
                      : currentValue}</span>
                    
                    {nextValue !== null && (
                      <span style={{ color: '#88ff88', marginLeft: '10px' }}>
                        Next: {typeof nextValue === 'number' && nextValue % 1 !== 0 
                          ? nextValue.toFixed(1) 
                          : nextValue}
                      </span>
                    )}
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    {currentLevel < upgrade.maxLevel ? (
                      <>
                        <div style={{ color: '#ffff00' }}>
                          Cost: {cost}
                        </div>
                        
                        <button
                          onClick={() => gameState.gold >= cost && purchaseUpgrade(upgrade.id)}
                          disabled={gameState.gold < cost}
                          style={{
                            backgroundColor: gameState.gold >= cost ? '#3F8F3F' : '#555555',
                            color: gameState.gold >= cost ? 'white' : '#777777',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            cursor: gameState.gold >= cost ? 'pointer' : 'not-allowed'
                          }}
                        >
                          Upgrade
                        </button>
                      </>
                    ) : (
                      <div style={{
                        width: '100%',
                        textAlign: 'center',
                        color: '#00ff00',
                        fontWeight: 'bold'
                      }}>
                        MAXED
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {activeTab === 'stats' && (
          <div>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>GAME STATISTICS</h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px'
            }}>
              <div style={{
                backgroundColor: '#444444',
                padding: '15px',
                borderRadius: '5px'
              }}>
                <h3 style={{
                  marginTop: 0,
                  borderBottom: '1px solid #555555',
                  paddingBottom: '10px'
                }}>
                  Gameplay Stats
                </h3>
                
                <div style={{ display: 'grid', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total Gold Earned:</span>
                    <span style={{ color: '#ffff00' }}>{gameState.gameStats.totalGoldEarned || 0}</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Enemies Killed:</span>
                    <span>{gameState.gameStats.totalEnemiesKilled || 0}</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Experience Gained:</span>
                    <span>{gameState.gameStats.totalExperienceGained || 0}</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Highest Level:</span>
                    <span>{gameState.gameStats.highestLevel || 1}</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Longest Survival:</span>
                    <span>{formatTime(gameState.gameStats.longestSurvivalTime || 0)}</span>
                  </div>
                </div>
              </div>
              
              <div style={{
                backgroundColor: '#444444',
                padding: '15px',
                borderRadius: '5px'
              }}>
                <h3 style={{
                  marginTop: 0,
                  borderBottom: '1px solid #555555',
                  paddingBottom: '10px'
                }}>
                  Current Upgrades
                </h3>
                
                <div style={{ display: 'grid', gap: '10px' }}>
                  {passiveUpgrades.map(upgrade => (
                    <div key={upgrade.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{upgrade.name}:</span>
                      <div>
                        <span>
                          {typeof gameState.passiveUpgrades[upgrade.id]?.value === 'number' && 
                           gameState.passiveUpgrades[upgrade.id].value % 1 !== 0 
                            ? gameState.passiveUpgrades[upgrade.id].value.toFixed(1) 
                            : (gameState.passiveUpgrades[upgrade.id]?.value || upgrade.baseValue)}
                        </span>
                        <span style={{ color: '#777777', fontSize: '12px', marginLeft: '5px' }}>
                          (Lv {gameState.passiveUpgrades[upgrade.id]?.level || 0})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <h2 style={{ marginBottom: '20px' }}>SETTINGS</h2>
            
            <button
              onClick={() => setShowResetConfirm(true)}
              style={{
                backgroundColor: '#8F3F3F',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              RESET PROGRESS
            </button>
          </div>
        )}
      </div>
      
      <button
        onClick={startGame}
        style={{
          backgroundColor: '#3F8F3F',
          color: 'white',
          border: 'none',
          padding: '15px',
          borderRadius: '5px',
          width: '100%',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        START GAME
      </button>

      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#333333',
          color: 'white',
          padding: '10px 15px',
          borderRadius: '5px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
        }}>
          {notification}
        </div>
      )}
      
      {showResetConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: '#333333',
            padding: '20px',
            borderRadius: '5px',
            maxWidth: '400px',
            textAlign: 'center'
          }}>
            <h3 style={{ marginTop: 0 }}>Reset all progress?</h3>
            <p style={{ color: '#ff6666', marginBottom: '20px' }}>This cannot be undone!</p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button
                onClick={() => setShowResetConfirm(false)}
                style={{
                  backgroundColor: '#555555',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer'
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
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer'
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