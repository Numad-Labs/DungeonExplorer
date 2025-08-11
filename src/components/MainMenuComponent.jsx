import React, { useState, useEffect } from "react";

const MainMenu = ({ onStartGame }) => {
  const [countdown, setCountdown] = useState(3);
  const [fillProgress, setFillProgress] = useState(0);

  useEffect(() => {
    const fillTimer = setInterval(() => {
      setFillProgress((prev) => {
        if (prev >= 100) {
          clearInterval(fillTimer);
          return 100;
        }
        const randomIncrement = Math.random() * 1.3 + 0.2;
        return Math.min(prev + randomIncrement, 100);
      });
    }, 16);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onStartGame) {
            onStartGame();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(fillTimer);
    };
  }, [onStartGame]);

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-dark-secondary">
      <div className="relative">
        <div className="relative p-10 h-132 w-162">
          <img
            src="LogoBlack.svg"
            alt="Game Logo"
            className="absolute inset-0 w-full h-full object-contain"
          />
          <div
            className="absolute inset-0 overflow-hidden transition-all duration-75 ease-linear"
            style={{
              clipPath: `polygon(0% ${100 - fillProgress}%, 100% ${
                100 - fillProgress
              }%, 100% 100%, 0% 100%)`,
            }}
          >
            <img
              src="LogoColor.svg"
              alt="Game Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        <div className="text-center mt-4">
          <div className="text-white text-lg font-semibold">
            Loading... {Math.round(fillProgress)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
