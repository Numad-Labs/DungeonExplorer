import React, { useEffect, useRef } from "react";
import { useGame } from "../context/GameContext";

const GameCanvas = () => {
  const canvasRef = useRef(null);
  const { initializeGameContainer } = useGame();

  useEffect(() => {
    // Initialize the game container when this component mounts
    const container = initializeGameContainer();

    // Make sure the canvas is in the right place
    const canvas = document.querySelector("canvas");
    if (canvas && canvasRef.current) {
      canvasRef.current.appendChild(canvas);
    }

    return () => {
      // Cleanup if needed
      console.log("GameCanvas component unmounting");
    };
  }, [initializeGameContainer]);

  return (
    <div
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
      }}
    />
  );
};

export default GameCanvas;
