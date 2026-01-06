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
    <div className="w-full max-w-[500px] bg-white rounded-xl p-3 border border-gray-200 shadow-lg text-gray-800 space-y-2">
      {/* Top Bar: Round & Timer */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-800 leading-tight">
            Round {currentRound + 1}{" "}
            <span className="text-sm text-gray-500">
              / {ROUND_CONFIGS.length}
            </span>
          </h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-wide">
            Collect {keysNeeded} Key{keysNeeded > 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
          <Timer className="w-3.5 h-3.5 text-orange-500" />
          <span
            className={`font-mono text-lg font-bold ${
              timeLeft < 30 ? "text-red-500 animate-pulse" : "text-gray-800"
            }`}
          >
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 justify-between items-center">
        <div className="flex items-center gap-2">
          <Settings className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={difficulty}
            onChange={(e) => onChangeDifficulty(e.target.value as Difficulty)}
            className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500 text-gray-600 font-medium"
          >
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="text-xs text-gray-400 font-mono">Moves: {attempts}</div>

        <button
          onClick={onShuffle}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 transition px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm"
        >
          <Shuffle className="w-3.5 h-3.5" />
          Shuffle
        </button>
      </div>
    </div>
  );
}
