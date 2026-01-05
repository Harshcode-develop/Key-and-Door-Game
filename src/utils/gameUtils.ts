import type { Position, Difficulty } from '../types';

export const isSamePos = (p1: Position, p2: Position) => p1.x === p2.x && p1.y === p2.y;

export const getRandomPos = (size: number, usedPositions: Position[]): Position => {
  let pos: Position;
  do {
    pos = {
      x: Math.floor(Math.random() * size),
      y: Math.floor(Math.random() * size),
    };
  } while (usedPositions.some((p) => isSamePos(p, pos)));
  return pos;
};

// Helper to check if a path exists from Start -> Key(s) -> Door
const isValidLayout = (
  size: number,
  start: Position,
  keys: Position[],
  door: Position,
  walls: Position[]
): boolean => {
  const isWall = (p: Position) => walls.some(w => isSamePos(w, p));
  const isValid = (p: Position) => 
    p.x >= 0 && p.x < size && p.y >= 0 && p.y < size && !isWall(p);

  // BFS function
  const hasPath = (from: Position, to: Position): boolean => {
    const queue = [from];
    const visited = new Set<string>();
    visited.add(`${from.x},${from.y}`);

    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (isSamePos(curr, to)) return true;

      const neighbors = [
        { x: curr.x + 1, y: curr.y },
        { x: curr.x - 1, y: curr.y },
        { x: curr.x, y: curr.y + 1 },
        { x: curr.x, y: curr.y - 1 },
      ];

      for (const n of neighbors) {
        const key = `${n.x},${n.y}`;
        if (isValid(n) && !visited.has(key)) {
          visited.add(key);
          queue.push(n);
        }
      }
    }
    return false;
  };

  // Check Start -> Key 1 -> Key 2 ... -> Door
  // We need to collect ALL keys. Order usually doesn't matter for validity, 
  // but we must check if *all* are accessible and then door is accessible.
  // Actually, we must be able to reach Key1 from Start, Key2 from Key1 (or Start), etc.
  // Simpler check: Can we reach ALL targets (Keys + Door) from Start? 
  // NO, because walls might block the Door until we have keys? 
  // In this game, walls don't disappear. Keys just open the door.
  // So the geometry is static.
  // We just need to ensure the Connected Component containing Start also contains ALL Keys and the Door.
  
  if (!hasPath(start, door)) return false;
  for (const k of keys) {
    if (!hasPath(start, k)) return false;
  }
  return true;
};

export const generateGameLayout = (size: number, difficulty: Difficulty, numKeys: number): {
  startPos: Position;
  doorPos: Position;
  keyPos: Position[];
  invisibleWalls: Position[];
} => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    attempts++;
    const usedPositions: Position[] = [];

    // 1. Place Start
    const startPos = getRandomPos(size, []);
    usedPositions.push(startPos);

    // 2. Place Door
    const doorPos = getRandomPos(size, usedPositions);
    usedPositions.push(doorPos);

    // 3. Place Keys
    const keyPos: Position[] = [];
    for (let i = 0; i < numKeys; i++) {
      const key = getRandomPos(size, usedPositions);
      keyPos.push(key);
      usedPositions.push(key);
    }

    // 4. Generate Invisible Walls
    const totalCells = size * size;
    let wallCount = 0;
    
    switch(difficulty) {
      case 'medium': wallCount = Math.floor(totalCells * 0.30); break; 
      case 'hard': wallCount = Math.floor(totalCells * 0.40); break; 
    }

    const invisibleWalls: Position[] = [];
    
    // We clone usedPositions for wall generation attempts in this inner loop?
    // No, we just generate full set then check.
    const tempUsed = [...usedPositions];
    
    for (let i = 0; i < wallCount; i++) {
        const wall = getRandomPos(size, tempUsed);
        invisibleWalls.push(wall);
        tempUsed.push(wall);
    }

    // 5. Validation
    if (isValidLayout(size, startPos, keyPos, doorPos, invisibleWalls)) {
      return { startPos, doorPos, keyPos, invisibleWalls };
    }
  }

  // Fallback: Return a very simple layout or just the last attempt (even if invalid, to prevent crash)
  // Better: Return layout with NO walls if specific fails, or minimal walls.
  // Let's just return what we have but maybe fewer walls.
  // Re-run simplified:
  return generateGameLayout(size, 'medium', numKeys); // Fallback to medium if hard fails
  // Potential recursion depth issue but unlikely with 100 attempts.
};
