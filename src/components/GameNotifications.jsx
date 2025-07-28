import React, { useState, useEffect } from 'react';
import { EventBus } from '../game/EventBus';

const GameNotifications = () => {
    const [currentNotification, setCurrentNotification] = useState(null);

    useEffect(() => {
        const handleWaveNotification = (data) => {
            const notification = {
                id: Date.now(),
                text: `WAVE ${data.wave || data.value || 1}`,
                timestamp: Date.now()
            };

            setCurrentNotification(notification);

            setTimeout(() => {
                setCurrentNotification(null);
            }, 3000);
        };

        EventBus.on('wave-notification', handleWaveNotification);

        return () => {
            EventBus.removeListener('wave-notification', handleWaveNotification);
        };
    }, []);

    if (!currentNotification) {
        return null;
    }

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '20vh',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '220px',
                height: '80px',
                zIndex: 10000,
                pointerEvents: 'none',
                backgroundImage: 'url(/assets/HUD/HUD_Timer_Shroud_Top_V01.png)',
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'simpleFade 3s ease-in-out forwards'
            }}
        >
            <div style={{
                color: '#FFD700',
                marginTop: '5vh',
                fontSize: '20px',
                fontWeight: 'bold',
                textShadow: '1px 1px 2px rgba(0,0,0,1)',
                letterSpacing: '1px',
                textAlign: 'center',
                whiteSpace: 'nowrap'
            }}>
                {currentNotification.text}
            </div>
            
            <style jsx>{`
                @keyframes simpleFade {
                    0% { opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default GameNotifications;