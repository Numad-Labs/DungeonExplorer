import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

const DeathLoadingScreen = ({ isVisible, deathData, onComplete }) => {
  const [showReturnButton, setShowReturnButton] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setShowReturnButton(false);
      return;
    }

    // Show the return button after 2 seconds
    const timer = setTimeout(() => {
      setShowReturnButton(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isVisible]);

  const handleReturnToMenu = () => {
    // Call the onComplete function to trigger return to menu
    if (onComplete) {
      onComplete();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="death-screen-overlay">
      <div className="death-screen-container">
        {/* Game Over SVG */}
        <div className="game-over-svg">
          <img
            src="/gameOver.svg"
            alt="Game Over"
            className="svg-image game-over-image"
          />
        </div>

        {/* Death info */}
        {deathData && (
          <div className="death-info">
            {deathData.score && (
              <p className="death-score">Final Score: {deathData.score}</p>
            )}
          </div>
        )}

        {/* Return to Menu SVG - appears after delay */}
        {showReturnButton && (
          <div className="return-menu-svg">
            <img
              src="/returnToMenu.svg"
              alt="returnToMenu"
              className="svg-image return-menu-image"
              onClick={handleReturnToMenu}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        .death-screen-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: linear-gradient(45deg, #1a1a1a, #2d1b1b, #1a1a1a);
          background-size: 400% 400%;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          animation: backgroundShift 4s ease-in-out infinite;
        }

        .death-screen-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 40px;
          max-width: 800px;
          width: 90%;
          height: 100%;
        }

        .return-menu-svg {
          margin-top: 40px;
          animation: returnButtonEntrance 0.8s ease-out;
        }

        .svg-image {
          max-width: 100%;
          height: auto;
          display: block;
        }

        .return-menu-image {
          max-width: 300px;
          cursor: pointer;
          transition: all 0.3s ease;
          filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.2));
        }

        .return-menu-image:active {
          transform: scale(0.95);
        }

        .death-reason {
          color: #ff8888;
          font-size: 1.4rem;
          margin-bottom: 15px;
          font-weight: bold;
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
        }

        .death-score {
          color: #cccccc;
          font-size: 1.2rem;
          font-weight: bold;
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
        }

        @keyframes backgroundShift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes gameOverEntrance {
          0% {
            opacity: 0;
            transform: translateY(-50px) scale(0.5);
          }
          50% {
            opacity: 0.8;
            transform: translateY(-10px) scale(1.1);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes returnButtonEntrance {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDelayed {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes pulseGlow {
          0%,
          100% {
            filter: drop-shadow(0 0 20px rgba(255, 68, 68, 0.3));
          }
          50% {
            filter: drop-shadow(0 0 30px rgba(255, 68, 68, 0.6));
          }
        }

        @media (max-width: 768px) {
          .death-screen-container {
            padding: 20px;
          }

          .game-over-image {
            max-width: 350px;
          }

          .return-menu-image {
            max-width: 250px;
          }

          .death-reason {
            font-size: 1.2rem;
          }

          .death-score {
            font-size: 1rem;
          }
        }

        @media (max-width: 480px) {
          .game-over-image {
            max-width: 280px;
          }

          .return-menu-image {
            max-width: 200px;
          }

          .death-reason {
            font-size: 1rem;
          }

          .death-score {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

DeathLoadingScreen.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  deathData: PropTypes.object,
  onComplete: PropTypes.func.isRequired,
};

export default DeathLoadingScreen;
