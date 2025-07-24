export const StartGame = ({ gameManager, onStartGame }) => {
  const startGame = () => {
    setShowDeathScreen(false);
    if (gameManager && gameManager.startNewRun) {
      gameManager.startNewRun();
    }
    if (onStartGame) {
      onStartGame();
    }
  };
  return (
    <div>
      <button
        onClick={startGame}
        style={{
          backgroundColor: "#3F8F3F",
          color: "white",
          border: "none",
          padding: "18px",
          borderRadius: "8px",
          width: "100%",
          fontSize: "20px",
          fontWeight: "bold",
          cursor: "pointer",
          textTransform: "uppercase",
        }}
      >
        {"🎮 Start Game"}
      </button>
    </div>
  );
};
