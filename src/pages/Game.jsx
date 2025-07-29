import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainMenu from "./MainMenu";

const Game = () => {
  const navigate = useNavigate();

  // useEffect(() => {
  //   console.log("Redirecting to new game architecture...");
  //   navigate("/game", { replace: true });
  // }, [navigate]);

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
      <MainMenu />
    </div>
  );
};

export default Game;
