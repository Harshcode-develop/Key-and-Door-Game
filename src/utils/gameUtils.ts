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

// Manhattan distance
const getDistance = (p1: Position, p2: Position) => Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);

// Add strictMode param defaulting to true
export const generateGameLayout = (size: number, difficulty: Difficulty, numKeys: number, strictMode: boolean = true): {
  startPos: Position;
  doorPos: Position;
  keyPos: Position[];
  invisibleWalls: Position[];
} => {
  let attempts = 0;
  // If strict, try more; if not strict, try less (should find one quickly)
  const maxAttempts = strictMode ? 500 : 50; 

  while (attempts < maxAttempts) {
    attempts++;
    const usedPositions: Position[] = [];

    // 1. Place Start
    const startPos = getRandomPos(size, []);
    usedPositions.push(startPos);

    // 2. Place Door
    // Strict: Min distance at least half board. Non-strict: Random.
    const minDist = strictMode ? Math.floor(size / 1.5) : 1; 
    let doorPos: Position;
    let validDoor = false;
    
    // Attempt to place door matching criteria
    for(let i=0; i<50; i++) {
        doorPos = getRandomPos(size, usedPositions);
        // In strict mode check distance. In non-strict, any pos not used is fine.
        if (!strictMode || getDistance(startPos, doorPos) >= minDist) {
            validDoor = true;
            break;
        }
    }
    
    // If we couldn't place strict door, and we are distinct, maybe we retry?
    // If !validDoor, we just continue to next attempt if we want to be strict.
    if (!validDoor && strictMode) continue; 
    // If non-strict and failed (unlikely), just take the last generated random pos if unique
    // Actually simplicity: if !validDoor and strict, we failed this attempt.
    
    usedPositions.push(doorPos!); 

    // 3. Place Keys
    const keyPos: Position[] = [];
    let keysPlaced = 0;
    while (keysPlaced < numKeys) {
      let key: Position = { x: 0, y: 0 };
      let validKey = false;
      for(let i=0; i<50; i++) {
          key = getRandomPos(size, usedPositions);
          if (!strictMode) {
              validKey = true;
              break;
          }
          // Strict checks
          const distToDoor = getDistance(doorPos!, key);
          const distToStart = getDistance(startPos, key);
          const minKeyDist = Math.floor(size / 2);

          if (distToDoor >= minKeyDist && distToStart >= minKeyDist) {
             validKey = true;
             break;
          }
      }
      if (!validKey) {
         if (strictMode) {
             // If we can't place a strict key, fail this layout attempt
             break; 
         }
         key = getRandomPos(size, usedPositions); // Fallback
      }
      keyPos.push(key);
      usedPositions.push(key);
      keysPlaced++;
    }
    
    // If we broke out of key loop due to strict failure
    if (keyPos.length < numKeys) continue;

    // 4. Generate Invisible Walls
    const totalCells = size * size;
    let wallCount = 0;
    
    switch(difficulty) {
      case 'medium': wallCount = Math.floor(totalCells * 0.60); break; // Increased 55->60
      case 'hard': wallCount = Math.floor(totalCells * 0.75); break;   // Increased 70->75
    }

    const invisibleWalls: Position[] = [];
    
    // DOOR GUARDS
    // Strict: Block all but 1. Non-strict: Block 1 or 2 random.
    const doorNeighbors = [
      { x: doorPos!.x + 1, y: doorPos!.y },
      { x: doorPos!.x - 1, y: doorPos!.y },
      { x: doorPos!.x, y: doorPos!.y + 1 },
      { x: doorPos!.x, y: doorPos!.y - 1 },
    ].filter(p => 
      p.x >= 0 && p.x < size && p.y >= 0 && p.y < size &&
      !isSamePos(p, startPos) && 
      !keyPos.some(k => isSamePos(k, p)) &&
      !isSamePos(p, doorPos!)
    );

    // Shuffle neighbors
    for (let i = doorNeighbors.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [doorNeighbors[i], doorNeighbors[j]] = [doorNeighbors[j], doorNeighbors[i]];
    }

    const numGuards = (strictMode && doorNeighbors.length > 0) 
        ? Math.max(1, doorNeighbors.length - 1) // Block all but 1
        : Math.floor(Math.random() * 2); // 0 or 1 for easy/fallback

    for (let i = 0; i < numGuards; i++) {
        invisibleWalls.push(doorNeighbors[i]);
        usedPositions.push(doorNeighbors[i]); 
    }

    // Random Walls
    // For coverage, we want to reach target wallCount.
    let remainingWalls = wallCount - invisibleWalls.length;
    // ensure non-negative
    if (remainingWalls < 0) remainingWalls = 0;

    const tempUsed = [...usedPositions];
    
    for (let i = 0; i < remainingWalls; i++) {
        const wall = getRandomPos(size, tempUsed);
        invisibleWalls.push(wall);
        tempUsed.push(wall);
    }

    // 5. Validation
    if (isValidLayout(size, startPos, keyPos, doorPos!, invisibleWalls)) {
      return { startPos, doorPos: doorPos!, keyPos, invisibleWalls };
    }
  }

  // Fallback: If strict generation failed 200 times, try NON-STRICT.
  // This ensures we always return a valid playable board, even if it's "easier" than requested.
  // This prevents infinite loops or crashes.
  if (strictMode) {
      console.warn("Strict generation failed, falling back to relaxed constraints.");
      return generateGameLayout(size, difficulty, numKeys, false);
  }
  
  // If even non-strict fails (extremely unlikely), return basic layout
  // We throw or return distinct positions with 0 walls.
  // Minimal fallback:
  return {
      startPos: {x:0, y:0},
      doorPos: {x: size-1, y: size-1},
      keyPos: [{x: size-1, y:0}],
      invisibleWalls: []
  };
};
