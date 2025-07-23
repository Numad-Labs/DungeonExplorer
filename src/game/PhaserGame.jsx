import React, { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import StartGame from '../main';
import { EventBus } from './EventBus';

const PhaserGame = forwardRef(function PhaserGame({ gameManager, onReturnToMenu }, ref) {
    const game = useRef();

    useLayoutEffect(() => {
        if (game.current === undefined) {
            game.current = StartGame("game-container", gameManager);

            if (ref !== null) {
                ref.current = { 
                    game: game.current,
                    scene: null,
                    destroy: () => {
                        if (game.current) {
                            game.current.destroy(true);
                            game.current = undefined;
                        }
                    }
                };
            }
        }

        return () => {
            if (game.current) {
                game.current.destroy(true);
                game.current = undefined;
            }
        };
    }, [ref, gameManager]);

    useEffect(() => {
        EventBus.on('current-scene-ready', (currentScene) => {
            if (ref && ref.current) {
                ref.current.scene = currentScene;
            }
        });

        return () => EventBus.removeListener('current-scene-ready');
    }, [ref]);

    return (
        <div 
            id="game-container" 
            className="game-container"
            style={{ 
                width: '100%', 
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#242424'
            }}
        ></div>
    );
});

export default PhaserGame;
