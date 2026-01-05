import { Timer, Shuffle, Settings } from "lucide-react";
import { ROUND_CONFIGS } from "../types";
import type { Difficulty } from "../types";

interface GameControlsProps {
  timeLeft: number;
  currentRound: number;
  difficulty: Difficulty;
  onShuffle: () => void;
  onChangeDifficulty: (diff: Difficulty) => void;
  attempts: number;
}

export function GameControls({
  timeLeft,
  currentRound,
  difficulty,
  onShuffle,
  onChangeDifficulty,
  attempts,
}: GameControlsProps) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const currentRoundConfig = ROUND_CONFIGS[currentRound];
  const keysNeeded = currentRoundConfig ? currentRoundConfig.keys : 0;

  return (
    <div className="w-full max-w-[500px] bg-white rounded-xl p-4 border border-gray-200 shadow-lg text-gray-800 space-y-4">
      {/* Top Bar: Round & Timer */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Round {currentRound + 1}{" "}
            <span className="text-sm text-gray-500">
              / {ROUND_CONFIGS.length}
            </span>
          </h2>
          <p className="text-xs text-gray-500">
            Collect {keysNeeded} Key{keysNeeded > 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg border border-gray-200">
          <Timer className="w-4 h-4 text-orange-500" />
          <span
            className={`font-mono text-xl ${
              timeLeft < 30 ? "text-red-500 animate-pulse" : "text-gray-800"
            }`}
          >
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 justify-between items-center">
        {/* Difficulty */}
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-gray-500" />
          <select
            value={difficulty}
            onChange={(e) => onChangeDifficulty(e.target.value as Difficulty)}
            className="bg-gray-100 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500 text-gray-700"
          >
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Shuffle Button */}
        <button
          onClick={onShuffle}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-95 transition px-4 py-2 rounded-lg font-semibold text-white shadow-md"
        >
          <Shuffle className="w-4 h-4" />
          Shuffle
        </button>
      </div>

      <div className="text-center text-xs text-gray-400">
        Moves/Bumps: {attempts}
      </div>
    </div>
  );
}
