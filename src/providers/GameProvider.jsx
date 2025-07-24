// import React, { createContext, useContext, useEffect, useState } from "react";
// import { gameIntegration } from "../GameIntegration.js";

// const GameContext = createContext();

// export const GameProvider = ({ children }) => {
//   const [gameManager, setGameManager] = useState(gameIntegration?.gameManager);

//   useEffect(() => {
//     console.log(
//       "GameProvider mount, gameIntegration.gameManager:",
//       gameIntegration?.gameManager
//     );
//     // Listen for updates (if your GameIntegration dispatches this event)
//     const handler = () => setGameManager(gameIntegration?.gameManager);
//     window.addEventListener("gameStateUpdated", handler);

//     // Optionally, update once after mount
//     setGameManager(gameIntegration?.gameManager);

//     return () => window.removeEventListener("gameStateUpdated", handler);
//   }, []);

//   const value = {
//     gameManager,
//     onStartGame: () => gameIntegration?.startGame(),
//   };
//   console.log("value", value);
//   return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
// };

// export const useGame = () => useContext(GameContext);
