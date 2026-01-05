import { Play, Grid } from "lucide-react";
import { ROUND_CONFIGS } from "../types";

interface MainMenuProps {
  onStartCampaign: () => void;
  onStartPractice: (roundIndex: number) => void;
}

export function MainMenu({ onStartCampaign, onStartPractice }: MainMenuProps) {
  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl space-y-8 text-center animate-fade-in border border-gray-100">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
          Key & Door
        </h1>
        <p className="text-gray-500 font-medium tracking-wide text-sm uppercase">
          Memory & Navigation Challenge
        </p>
      </div>

      <div className="space-y-6">
        {/* Campaign Mode */}
        <div className="space-y-3">
          <button
            onClick={onStartCampaign}
            className="w-full group relative flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-blue-500/30 active:scale-[0.98]"
          >
            <Play className="fill-current w-6 h-6 group-hover:scale-110 transition-transform" />
            Start Game
          </button>
          <p className="text-xs text-gray-400">
            Play through all {ROUND_CONFIGS.length} rounds. Clear{" "}
            {Math.ceil(ROUND_CONFIGS.length / 2)}+ to pass.
          </p>
        </div>

        <div className="w-full h-px bg-gray-100" />

        {/* Practice Mode */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm font-semibold uppercase tracking-wider">
            <Grid className="w-4 h-4" />
            <span>Practice Round</span>
          </div>

          <div className="flex justify-center gap-6">
            {ROUND_CONFIGS.map((config, idx) => (
              <button
                key={idx}
                onClick={() => onStartPractice(idx)}
                className="flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-blue-600 rounded-xl w-20 h-20 transition-all hover:border-blue-200 active:scale-95 shadow-sm hover:shadow-md"
              >
                <span className="font-bold text-xl leading-none">
                  {idx + 1}
                </span>
                <span className="text-[12px] opacity-70 leading-none">
                  {config.size}x{config.size}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
