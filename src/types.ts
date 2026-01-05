export type Position = {
  x: number;
  y: number;
};

export type Difficulty = 'medium' | 'hard';

export type GameStatus = 'idle' | 'playing' | 'finished' | 'lost' | 'timeout' | 'transition';

export type CellType = 'empty' | 'wall' | 'player' | 'key' | 'door';

export interface GridCell {
  pos: Position;
  type: CellType;
  isVisible: boolean; // For walls, initially false
  isRevealed: boolean; // For walls, becomes true when hit
  isKeyCollected?: boolean;
}

export interface GameState {
  currentRound: number;
  gridSize: number;
  playerPos: Position;
  startPos: Position;
  doorPos: Position;
  keyPos: Position[]; // Array because some levels have 2 keys
  collectedKeys: number;
  invisibleWalls: Position[];
  revealedWalls: Position[]; // For final result
  visitedCells: Position[]; // For path tracing
  lastHitWall: { pos: Position; direction: 'up' | 'down' | 'left' | 'right' } | null; // For momentary reveal
  status: GameStatus;
  mode: 'campaign' | 'practice';
  roundsWon: number;
  timeLeft: number;
  difficulty: Difficulty;
  attempts: number; // Count moves/bumps
  history: RoundHistory[];
}

export interface RoundHistory {
  round: number;
  gridSize: number;
  invisibleWalls: Position[];
  playerPos: Position;
  doorPos: Position;
  keyPos: Position[];
  result: 'win' | 'loss';
  moves: number;
  time: number;
}

export const ROUND_CONFIGS = [
  { size: 5, keys: 1 },
  { size: 7, keys: 2 },
  { size: 10, keys: 1 },
];
