import { Cell } from "./Cell";
import { isSamePos } from "../utils/gameUtils";
import type { GameState } from "../types";

interface GameBoardProps {
  gameState: GameState;
  showRevealed?: boolean; // Control whether to show permanently revealed walls (for Result Screen)
}

export function GameBoard({ gameState, showRevealed = false }: GameBoardProps) {
  const {
    gridSize,
    doorPos,
    keyPos,
    invisibleWalls,
    revealedWalls,
    lastHitWall,
  } = gameState;

  // Grid Style
  // Fluid layout: Use 1fr to fill available width, letting the container control size.
  // We apply aspect-square to the CONTAINER to ensure the grid itself remains square.
  const gridStyle = {
    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
    gridTemplateRows: `repeat(${gridSize}, 1fr)`,
  };

  // Generate cells
  const renderCells = () => {
    const cells = [];
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const currPos = { x, y };

        // Determine type
        let type: any = "empty";
        if (isSamePos(currPos, doorPos)) type = "door";
        else if (keyPos.some((k) => isSamePos(k, currPos))) type = "key";
        else if (invisibleWalls.some((w) => isSamePos(w, currPos)))
          type = "wall";

        // Check if revealed (momentary hit OR endgame reveal)
        // Only show 'isRevealed' if we are on the Result Screen (showRevealed=true)
        // OR if it's the specific momentary hit (handled by isHit separately).
        // During gameplay, walls should NOT be permanently revealed (return to default).
        const isRevealed =
          showRevealed && revealedWalls.some((w) => isSamePos(w, currPos));

        // Momentary hit?
        const hitData =
          lastHitWall && isSamePos(lastHitWall.pos, { x, y })
            ? lastHitWall
            : null;
        const isPlayer = isSamePos(gameState.playerPos, { x, y });
        const isVisited =
          gameState.visitedCells?.find((p) => isSamePos(p, { x, y })) !==
          undefined;
        // const isPlayer = isSamePos(gameState.playerPos, { x, y }); // Unused since we removed isPlayer prop? Or did we?
        // Wait, did I remove isPlayer prop from Cell? The original code had it.
        // Let's check Cell props usage in Render.

        // I will keep isPlayer logic but ensure it is used or remove it.
        // The lint said 'playerPos' unused. But Cell needs to know if it's a player?
        // Actually, 'type' can be 'player'?
        // The getCellType function might return 'player'.
        // In the previous version:
        // if (isSamePos(currPos, playerPos)) type = "player";
        // But my recent edit REMOVED that check and used `getCellType`.
        // If `getCellType` handles "player", then `isPlayer` prop on Cell might be redundant?
        // Let's look at Cell.tsx.
        // I can't look at it now efficiently without context switch.
        // But the lint said 'playerPos' is unused in GameBoard.
        // This means `gameState.playerPos` was destructured but not used.
        // But `gameState.playerPos` is used in `gameState.playerPos` usage inside loop?
        // "const isPlayer = isSamePos(gameState.playerPos, { x, y });"
        // Ah, I destructured `playerPos` at top, but used `gameState.playerPos` in loop?
        // If I remove the destructured one, it fixes that lint.

        // And 'visitedCells' is unused.
        // "const isVisited = gameState.visitedCells.find..."
        // If `isVisited` variable is unused, I should remove it.
        // Does Cell take `isVisited`?
        // "isVisited={isVisited}" in JSX.
        // So `isVisited` IS used in JSX.
        // Why did lint say `visitedCells` unused?
        // Because I destructured `visitedCells` at top but used `gameState.visitedCells` in loop!

        // So simply removing the unused destructuring at top (which I did in previous step) fixes the "unused variable" warnings for the destructured vars.

        // However, I still have 'isHit' unused warning in Step 342 feedback?
        // 'isHit' is declared but its value is never read.
        // "const isHit = !!hitData;"
        // And I used `hitData ? hitData.direction : null` for `isHit` prop in Cell.
        // So the BOOLEAN `isHit` variable is indeed unused.
        // I should remove `const isHit = !!hitData;`.

        cells.push(
          <Cell
            key={`${x}-${y}`}
            type={type}
            isVisible={false}
            isRevealed={isRevealed}
            isHit={hitData ? hitData.direction : null} // Pass direction
            isPlayer={isPlayer}
            isVisited={isVisited}
          />
        );
      }
    }
    return cells;
  };

  return (
    <div
      className="gap-1 mx-auto p-2 rounded-xl grid bg-gray-200/50 shadow-inner w-full max-w-[500px] aspect-square transition-all duration-300"
      style={gridStyle}
    >
      {renderCells()}
    </div>
  );
}
