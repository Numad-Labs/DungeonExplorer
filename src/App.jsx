import React, { useEffect, useRef, useState } from 'react';
import { EventBus } from './game/EventBus';
import PhaserGame from './game/PhaserGame';
import MainMenu from './MainMenu';
import GameManager from './managers/GameManager';
import HPBar from './components/HPBar';

function App() {
    const phaserRef = useRef();
    const [currentView, setCurrentView] = useState('menu');
    const [gameManager] = useState(() => new GameManager());
    
    const [gameState, setGameState] = useState({
        gold: gameManager.gold || 500,
        passiveUpgrades: gameManager.passiveUpgrades || {},
        allTimeStats: gameManager.allTimeStats || {},
        lastRunStats: gameManager.lastRunStats || null,
        currentRunStats: gameManager.currentRunStats || {}
    });

    useEffect(() => {
        const handleGameStateUpdate = () => {
            setGameState({
                gold: gameManager.gold || 500,
                passiveUpgrades: gameManager.passiveUpgrades || {},
                allTimeStats: gameManager.allTimeStats || {},
                lastRunStats: gameManager.lastRunStats || null,
                currentRunStats: gameManager.currentRunStats || {}
            });
        };

        const handlePlayerDeath = () => {
            setTimeout(() => setCurrentView('menu'), 2000);
        };

        EventBus.on('game-state-updated', handleGameStateUpdate);
        EventBus.on('player-death', handlePlayerDeath);
        EventBus.on('return-to-menu', () => setCurrentView('menu'));

        window.addEventListener('gameStateUpdated', handleGameStateUpdate);
        window.addEventListener('playerDeath', handlePlayerDeath);

        return () => {
            EventBus.removeListener('game-state-updated', handleGameStateUpdate);
            EventBus.removeListener('player-death', handlePlayerDeath);
            EventBus.removeListener('return-to-menu');
            window.removeEventListener('gameStateUpdated', handleGameStateUpdate);
            window.removeEventListener('playerDeath', handlePlayerDeath);
        };
    }, [gameManager]);

    const startGame = () => {
        if (gameManager) {
            gameManager.startNewRun();
        }
        setCurrentView('game');
    };

    const returnToMenu = () => {
        if (gameManager && gameManager.isGameRunning) {
            gameManager.handlePlayerDeath("Manual Exit");
        }
        setCurrentView('menu');
    };

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'Escape' && currentView === 'game') {
                returnToMenu();
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [currentView]);

    return (
        <div className="app" style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            {currentView === 'menu' && (
                <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%', 
                    zIndex: 1000 
                }}>
                    <MainMenu 
                        gameManager={gameManager} 
                        gameState={gameState}
                        onStartGame={startGame}
                    />
                </div>
            )}

            {currentView === 'game' && (
                <>
                    <div style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '100%' 
                    }}>
                        <PhaserGame 
                            ref={phaserRef} 
                            gameManager={gameManager}
                            onReturnToMenu={returnToMenu}
                        />
                    </div>

                    <HPBar/>
                </>
            )}
        </div>
    );
}

export default App;
