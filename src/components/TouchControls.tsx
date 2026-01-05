import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

interface TouchControlsProps {
  onMove: (dx: number, dy: number) => void;
}

export function TouchControls({ onMove }: TouchControlsProps) {
  const btnClass =
    "w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center active:bg-gray-300 active:scale-95 transition-all text-gray-800 border border-gray-300 shadow-sm";

  return (
    <div className="grid grid-cols-3 gap-2 w-max mx-auto mt-4 sm:hidden">
      <div />
      <button
        className={btnClass}
        onClick={() => onMove(0, -1)}
        aria-label="Up"
      >
        <ArrowUp />
      </button>
      <div />

      <button
        className={btnClass}
        onClick={() => onMove(-1, 0)}
        aria-label="Left"
      >
        <ArrowLeft />
      </button>
      <button
        className={btnClass}
        onClick={() => onMove(0, 1)}
        aria-label="Down"
      >
        <ArrowDown />
      </button>
      <button
        className={btnClass}
        onClick={() => onMove(1, 0)}
        aria-label="Right"
      >
        <ArrowRight />
      </button>
    </div>
  );
}
