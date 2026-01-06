import { Trophy, RefreshCcw } from "lucide-react";
import type { GameState } from "../types";

// Simple helper if not imported from utils

interface ResultScreenProps {
  gameState: GameState;
  onRestart: () => void;
  onMainMenu: () => void;
}

export function ResultScreen({
  gameState,
  onRestart,
  onMainMenu,
}: ResultScreenProps) {
  // We don't render the grid history anymore, so no need for 'allRounds' or logic to merge history.

  // Passed if won majority? Or specific count.
  // With 3 levels, let's say 2 is pass.
  const passed = gameState.roundsWon >= 2;
  const isPerfect = gameState.roundsWon === 3; // Or dynamic based on config length but we can hardcode for this simple change or import config.
  const isCampaign = gameState.mode === "campaign";

  // Practice context: "Round Cleared" if won, else "Generic Fail" (or simply "Round Over")
  // Since practice is single round, roundsWon is 0 or 1.
  const practiceWon = !isCampaign && gameState.roundsWon > 0;

  // Title Logic
  let title = "Assessment Failed";
  if (isCampaign) {
    if (isPerfect) title = "Perfect Score!";
    else if (passed) title = "Assessment Passed!";
  } else {
    // Practice
    if (practiceWon) title = "Round Cleared!";
    else title = "Round Failed";
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-8 animate-fade-in pb-20">
      <div className="text-center space-y-4">
        <Trophy
          className={`w-20 h-20 mx-auto animate-bounce ${
            (isCampaign && passed) || practiceWon
              ? "text-yellow-500"
              : "text-gray-400"
          }`}
        />

        <h1 className="text-4xl font-bold text-gray-800">{title}</h1>

        {isCampaign ? (
          <p className="text-gray-600 text-lg">
            You cleared{" "}
            <span className="font-bold text-gray-900">
              {Math.min(gameState.roundsWon, 3)}/3
            </span>{" "}
            rounds.
            {!passed && (
              <span className="block text-sm text-red-500 mt-1">
                (Need 2 to pass)
              </span>
            )}
            {isPerfect && (
              <span className="block text-sm text-blue-500 mt-1">
                Try again with increased difficulty!
              </span>
            )}
          </p>
        ) : (
          <p className="text-gray-600 text-lg">
            {practiceWon
              ? "Great job! Try another round or return to menu."
              : "Keep practicing!"}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onMainMenu}
            className="inline-flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl font-bold transition shadow-sm"
          >
            Main Menu
          </button>
          <button
            onClick={onRestart}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-bold transition shadow-lg text-white"
          >
            <RefreshCcw />{" "}
            {isCampaign ? (passed ? "Play Again" : "Try Again") : "Retry Round"}
          </button>
        </div>
      </div>

      {/* Grid section removed as per user request ("remove this other rounds images... remove all the hints") */}
    </div>
  );
}
