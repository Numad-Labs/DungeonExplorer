import React, { createContext, useContext, useState } from "react";

const GameControlsContext = createContext();

export const useGameControls = () => {
  const context = useContext(GameControlsContext);
  return context || {}; // Return empty object if not in game route
};

export const GameControlsProvider = ({ children }) => {
  const [gameControls, setGameControls] = useState({});

  const value = {
    gameControls,
    setGameControls,
  };

  return (
    <GameControlsContext.Provider value={value}>
      {children}
    </GameControlsContext.Provider>
  );
};