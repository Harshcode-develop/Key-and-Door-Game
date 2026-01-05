import { ROUND_CONFIGS } from "./types";
import { useEffect } from "react";
import { useGameEngine } from "./hooks/useGameEngine";
import { GameBoard } from "./components/GameBoard";
import { GameControls } from "./components/GameControls";
import { TouchControls } from "./components/TouchControls";
import { ResultScreen } from "./components/ResultScreen";
import { MainMenu } from "./components/MainMenu";

import { Home } from "lucide-react"; // Import Home icon

function App() {
  const {
    gameState,
    movePlayer,
    shuffle,
    changeDifficulty,
    startGame,
    goToMenu,
  } = useGameEngine();

  // Keyboard controls
  useEffect(() => {
    if (gameState.status !== "playing") return; // Only listen when playing

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          movePlayer(0, -1);
          break;
        case "ArrowDown":
          movePlayer(0, 1);
          break;
        case "ArrowLeft":
          movePlayer(-1, 0);
          break;
        case "ArrowRight":
          movePlayer(1, 0);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [movePlayer, gameState.status]);

  // Handle Main Menu
  if (gameState.status === "idle") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <MainMenu
          onStartCampaign={() => startGame("campaign")}
          onStartPractice={(r) => startGame("practice", r)}
        />
      </div>
    );
  }

  // Handle Result Screen
  if (gameState.status === "finished") {
    // ... result code ...
  }

  // Render Game Board (playing OR transition or lost/timeout if we want to show it briefly?)
  // Actually lost/timeout usually goes to result?
  // For now let's just ensure if status is 'transition' we still show the board.
  // The default return below handles "anything else".
  // So 'transition' will fall through to render the board.
  // Just need to ensure inputs don't crash or weird stuff doesn't happen.
  // Inputs in App.tsx check `status === 'playing'`. So inputs DISABLED. Good.
  if (gameState.status === "finished") {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <ResultScreen
          gameState={gameState}
          onRestart={() =>
            startGame(
              gameState.mode === "campaign" ? "campaign" : "practice",
              gameState.mode === "practice" ? gameState.currentRound : 0
            )
          }
          // Note: For practice restart, we usually want same round.
          // But `startGame` 'practice' takes round arg.
          // For Campaign, round arg defaults to 0.
          // Let's safe check mode. If campaign -> restart from 0. If practice -> restart current.
          // Actually simplest is just:
          // startGame(mode, mode === 'practice' ? currentRound : 0)

          onMainMenu={goToMenu}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans select-none text-black">
      {/* Back to Menu Button */}
      <button
        onClick={goToMenu}
        className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 transition-all font-medium text-sm z-50"
      >
        <Home className="w-4 h-4" />
        Menu
      </button>

      {/* Background Decoration - simplified for light theme */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full bg-blue-300 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-purple-300 blur-[120px]" />
      </div>

      <div className="z-10 w-full max-w-lg flex flex-col gap-6 items-center">
        {/* Header */}
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-gray-800">
            Round {gameState.currentRound + 1}{" "}
            <span className="text-gray-400 text-lg">
              / {ROUND_CONFIGS.length}
            </span>
          </h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest">
            Cognitive Assessment Game
          </p>
        </div>

        <GameControls
          timeLeft={gameState.timeLeft}
          currentRound={gameState.currentRound}
          difficulty={gameState.difficulty}
          onShuffle={shuffle}
          onChangeDifficulty={changeDifficulty}
          attempts={gameState.attempts}
        />

        <GameBoard gameState={gameState} />

        <TouchControls onMove={movePlayer} />

        <div className="hidden sm:block text-xs text-gray-500 mt-4">
          Use <span className="font-bold text-gray-700">Arrow Keys</span> to
          Move
        </div>
      </div>
    </div>
  );
}

export default App;
