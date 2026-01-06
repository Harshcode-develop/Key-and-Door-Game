import React from "react";
import { Key, DoorClosed, User } from "lucide-react";
import type { CellType } from "../types";

interface CellProps {
  type: CellType;
  isVisible?: boolean; // For invisible walls
  isRevealed?: boolean; // For invisible walls that were hit (perm/endgame)
  isHit?: "up" | "down" | "left" | "right" | boolean | null; // Direction or boolean (for simplicity if just general hit)
  isPlayer?: boolean;
  isVisited?: boolean; // Path trace
}

function CellComponent({
  type,
  isVisible,
  isRevealed,
  isHit,
  isPlayer,
  isVisited,
}: CellProps) {
  // Tailwind border classes for hit direction
  // border-l-4 border-l-red-500 etc.
  let borderClass = "";
  if (typeof isHit === "string") {
    if (isHit === "left") borderClass = "border-l-4 border-l-red-500";
    if (isHit === "right") borderClass = "border-r-4 border-r-red-500";
    if (isHit === "up") borderClass = "border-t-4 border-t-red-500"; // 'up' maps to top border
    if (isHit === "down") borderClass = "border-b-4 border-b-red-500"; // 'down' maps to bottom border
  }

  // Base style: White cell with grey border
  // Rounded corners: "just little rounded on all corners"
  const baseClasses = `w-full h-full border border-gray-300 bg-white rounded-sm flex items-center justify-center transition-all duration-300 relative overflow-hidden ${borderClass}`;

  // Specific styles
  let content = null;
  // let bgClass = "bg-white"; // default

  // Path Trace
  // "when player is moved it should leave a trace like the cell should turn black"
  // "when collided... path should also be gone" (Handled by parent clearing visited state)
  const isPath = isVisited && !isPlayer && type !== "wall"; // Don't show path on top of player or if it's a wall (though wall implies reset)

  if (isPath) {
    content = <div className="w-full h-full bg-black/80" />;
  }

  if (type === "wall") {
    if (isHit) {
      // "show red only for 1 sec values" -> we rely on parent passing isHit=true for 1s
      // "showing a cross only when collided"
      content = (
        <div
          className={`absolute inset-0 z-20 ${borderClass} animate-shake bg-red-100/20`}
        />
      );
    } else if (isRevealed) {
      // End game reveal - "no cross must be displayed"
      // Use a solid grey/black block or border to indicate "This was a wall"
      content = <div className="w-full h-full bg-gray-400/50" />;
    } else if (isVisible) {
      // Debug/Edit mode if any
      content = <div className="w-2 h-2 bg-gray-300 rounded-full" />;
    }
  } else if (type === "key") {
    // Black Key
    content = (
      <Key className="text-black w-3/5 h-3/5 drop-shadow-sm animate-bounce" />
    );
  } else if (type === "door") {
    // Black Door
    content = <DoorClosed className="text-black w-3/5 h-3/5" />;
  }

  // Player Overlay
  // "player background black and logo of person white"
  const playerContent = isPlayer ? (
    <div className="absolute inset-0 flex items-center justify-center z-10 bg-black">
      <User className="text-white w-3/5 h-3/5" />
    </div>
  ) : null;

  return (
    <div className={baseClasses}>
      {content}
      {playerContent}
    </div>
  );
}

export const Cell = React.memo(CellComponent);
