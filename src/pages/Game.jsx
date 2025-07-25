import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Game = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Redirecting to new game architecture...");
    navigate("/game", { replace: true });
  }, [navigate]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#1a1a1a",
        color: "white",
      }}
    >
      <div>Redirecting to game...</div>
    </div>
  );
};

export default Game;