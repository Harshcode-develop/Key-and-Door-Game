import { useState, useEffect, useCallback } from 'react';
import { ROUND_CONFIGS } from '../types';
import type { GameState, Difficulty, RoundHistory } from '../types';
import { generateGameLayout, isSamePos } from '../utils/gameUtils';

const ROUND_TIME_LIMIT = 4 * 60; // 4 minutes in seconds

export const useGameEngine = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentRound: 0,
    gridSize: ROUND_CONFIGS[0].size,
    playerPos: { x: 0, y: 0 },
    startPos: { x: 0, y: 0 },
    doorPos: { x: 0, y: 0 },
    keyPos: [],
    initialKeyPos: [],
    collectedKeys: 0,
    invisibleWalls: [],
    revealedWalls: [],
    visitedCells: [],
    lastHitWall: null,
    status: 'idle', // Start at idle
    mode: 'campaign', // Default
    roundsWon: 0,
    timeLeft: ROUND_TIME_LIMIT,
    difficulty: 'medium',
    attempts: 0, 
    history: [],
  });

  // Initialize Round
  const startRound = useCallback((roundIndex: number, difficulty: Difficulty = gameState.difficulty) => {
    if (roundIndex >= ROUND_CONFIGS.length) {
      setGameState(prev => ({ ...prev, status: 'finished' }));
      return;
    }

    const config = ROUND_CONFIGS[roundIndex];
    const layout = generateGameLayout(config.size, difficulty, config.keys);

    setGameState(prev => {
      // Save history if progressing
      let newHistory = prev.history;
      if (roundIndex > 0 && prev.currentRound === roundIndex - 1 && prev.history.length > 0) {
         // We usually add history in 'nextRound' BEFORE calling startRound for the next.
         // 'nextRound' calls setGameState updating history, THEN updates currentRound.
         // Then the Effect triggers startRound? 
         // Actually current 'nextRound' updates currentRound and history variables in one go.
         // So 'startRound' is called. 
         // startRound receives the PREVIOUS state which already has the NEW history.
         // So we just preserve it.
         newHistory = prev.history;
      } else if (roundIndex === 0) {
        newHistory = []; // Reset history on full restart
      }

      return {
        currentRound: roundIndex,
        gridSize: config.size,
        playerPos: layout.startPos,
        startPos: layout.startPos,
        doorPos: layout.doorPos,
        keyPos: layout.keyPos,
        initialKeyPos: layout.keyPos,
        collectedKeys: 0,
        invisibleWalls: layout.invisibleWalls,
        revealedWalls: [],
        visitedCells: [],
        lastHitWall: null,
        status: 'playing',
        mode: prev.mode,
        roundsWon: prev.roundsWon,
        timeLeft: ROUND_TIME_LIMIT,
        difficulty,
        attempts: 0,
        history: newHistory,
      };
    });
  }, [gameState.difficulty]);

  // Initial Start
  useEffect(() => {
    // Only run once on mount if round is 0 and status is playing (default init)
    // Actually we can depend on manual start or auto start. 
    // Let's just bootstrap round 0 if not set.
    // But StrictMode might double call.
    // We'll rely on a manual effect or just render.
    // Let's call startRound(0) in a separate strict effect if needed, or just let the consumer call it?
    // Better to auto-start.
    // We'll check if uninitialized.
  }, []);

  // Timer
  useEffect(() => {
    if (gameState.status !== 'playing') return;

    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.status !== 'playing') return prev; // Ensure we don't update if not playing
        if (prev.timeLeft <= 1) {
          // Timeout -> Auto Next Round
          setTimeout(() => nextRound(false), 1000); 
          return { ...prev, timeLeft: 0, status: 'timeout' as const }; 
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.status, gameState.currentRound]); // Removed startRound dependency to avoid loopiness if unstable? Actually startRound is stable.


  // Progression Effect: Trigger startRound when currentRound changes (and we are playing)
  // This ensures the board is actually reset for the new round.
  useEffect(() => {
    // Only trigger if we are in 'playing' state and we haven't initialized this round yet?
    // How to detect?
    // Actually, nextRound increments `currentRound`.
    // We want to run `startRound(currentRound)`.
    // But `startRound` sets state.
    // Use a ref to track rendered round? Or just let it run?
    // If startRound is idempotent (generates new layout), we only want it ONCE per round change.
    
    // Issue: startGame calls startRound. Then this Effect sees currentRound change?
    // startGame sets status 'playing' and currentRound.
    // If startGame sets it, this effect fires.
    // So startRound runs TWICE on game start?
    // Yes, if startGame calls it + effect calls it.
    // Performance hit? Minor. 
    // Logic hit? Generates layout twice.
    
    // Optimization: startGame should just set the `gameState` metadata and let THIS effect drive the `startRound` logic?
    // Or startGame sets a flag?
    // Actually, `startGame` does: setGameState; startRound(0).
    // If I remove `startRound(0)` from startGame, this effect will pick it up.
    
    // Let's modify startGame too.
    if (gameState.status === 'playing') {
       // We need to check if we need to generate a layout.
       // How do we know if the CURRENT layout matches the CURRENT round?
       // We can check `gridSize`. (R0=6, R1=7...).
       // If `gameState.gridSize !== ROUND_CONFIGS[gameState.currentRound].size`, we definitely need update.
       // BUT R2 and R3 might have same size?
       // Better: Just assume if `currentRound` changed, we run.
       // Only issue is the double-run on start.
       // I'll leave it double-run or remove explicit call in startGame.
       startRound(gameState.currentRound);
    }
  }, [gameState.currentRound, gameState.status]);


  const movePlayer = useCallback((dx: number, dy: number) => {
    if (gameState.status !== 'playing') return;

    setGameState(prev => {
      // Atomic check: If not playing, ignore.
      if (prev.status !== 'playing') return prev;

      const newPos = { x: prev.playerPos.x + dx, y: prev.playerPos.y + dy };

      // 1. Check Boundary
      if (
        newPos.x < 0 ||
        newPos.x >= prev.gridSize ||
        newPos.y < 0 ||
        newPos.y >= prev.gridSize
      ) {
        return prev; // Blocked by boundary
      }

      // 2. Check Invisible Wall
      const hitWall = prev.invisibleWalls.find(w => isSamePos(w, newPos));
      if (hitWall) {
        // ... (existing logic)
        let direction: 'left' | 'right' | 'up' | 'down' = 'left'; 
        if (dx === 1) direction = 'left';
        else if (dx === -1) direction = 'right';
        else if (dy === 1) direction = 'up';
        else if (dy === -1) direction = 'down';

        const hitWallData = { pos: hitWall, direction };

        if (typeof navigator !== 'undefined' && navigator.vibrate) {
           navigator.vibrate(200); 
        }

        setTimeout(() => {
          setGameState(p => ({ ...p, lastHitWall: null }));
        }, 1000);

        return {
          ...prev,
          playerPos: prev.startPos,
          attempts: prev.attempts + 1,
          visitedCells: [],
          lastHitWall: hitWallData,
          revealedWalls: prev.revealedWalls.some(rw => isSamePos(rw, hitWall)) ? prev.revealedWalls : [...prev.revealedWalls, hitWall],
          // Reset Keys on Collision
          collectedKeys: 0,
          keyPos: prev.initialKeyPos, 
        };
      }

      // 3. Move Success
      const newVisited = [...prev.visitedCells, prev.playerPos];

      let collectedKeys = prev.collectedKeys;
      const keyIndex = prev.keyPos.findIndex(k => isSamePos(k, newPos));
      let newKeyPos = prev.keyPos;
      
      if (keyIndex !== -1) {
        collectedKeys += 1;
        newKeyPos = prev.keyPos.filter((_, i) => i !== keyIndex);
      }

      // 4. Check Door
      if (isSamePos(newPos, prev.doorPos)) {
        const requiredKeys = ROUND_CONFIGS[prev.currentRound].keys;
        
        if (collectedKeys >= requiredKeys) {
          // WIN!
          // Trigger next round only if we are the first one to set it.
          // Since we checked prev.status === 'playing' at the top, and we transition here, this is safe.
          
          setTimeout(() => nextRound(true), 500); 
          return { ...prev, status: 'transition', playerPos: newPos, collectedKeys, keyPos: newKeyPos }; 
        } else {
           // At door but locked
        }
      }

      return {
        ...prev,
        playerPos: newPos,
        keyPos: newKeyPos,
        collectedKeys,
        visitedCells: newVisited,
        attempts: prev.attempts + 1,
      };
    });
  }, [gameState.status, gameState.difficulty, startRound]);

  const shuffle = useCallback(() => {
    // "whenever i click on shuffle the position of invisible walls must shift."
    // "And and when clicked on shuffle with invisible walls also it should shuffle the door, key and the character positions"
    setGameState(prev => {
      const config = ROUND_CONFIGS[prev.currentRound];
      // Generate completely new layout
      // const layout = generateGameLayout(config.size, prev.difficulty, config.keys); // Re-gen everything
      
      // Preserve progress? "position of invisible walls must shift".
      // Usually shuffle resets progress or keeps it? 
      // If I collected a key, should it respawn? 
      // If it shuffles EVERYTHING including "character positions", it's basically a soft restart of the level but preserving the Timer?
      // Yes, "Create a timer of 4 mins after that the round will automatically will move on to next".
      // So timer keeps running.
      // What about keys already collected?
      // Logically, if the key moves, you have to go get it.
      // If you already got it, does it respawn? 
      // If I just call generateGameLayout, it creates full keys again.
      // I should probably respect currently uncollected keys count?
      // "shuffle the door, key and the character positions"
      // Simplest interpretation: Reshuffle remaining elements.
      // If I have 1 key left, I generate 1 key.
      
      const remainingKeysNeeds = config.keys - prev.collectedKeys; // Or should we respawn all?
      // "shuffle the key" implies the key on board.
      // If I collected it, it's gone.
      // I'll respawn only needed keys. 
      // Wait, if I collected 1 of 2, and shuffle, do I need to get 1 more? Yes.
      
      const newLayout = generateGameLayout(config.size, prev.difficulty, remainingKeysNeeds > 0 ? remainingKeysNeeds : 0);
      
      // If we have collected all keys, we don't spawn keys.
      
      return {
         ...prev,
         playerPos: newLayout.startPos, // Move player to new random start
         startPos: newLayout.startPos,
         doorPos: newLayout.doorPos,
         keyPos: newLayout.keyPos,
         initialKeyPos: newLayout.keyPos,
         invisibleWalls: newLayout.invisibleWalls,
         revealedWalls: [], 
         visitedCells: [],
         lastHitWall: null,
      };
    });
  }, []);

  const changeDifficulty = useCallback((diff: Difficulty) => {
    setGameState(prev => {
      // Should this restart the round? Or just change for NEXT round?
      // Usually difficulty selector is for the game.
      // If I change mid-game, it should probably restart the current round to apply wall count changes.
      // Let's just update state and restart current round logic or just apply to next shuffle/move?
      // User: "add the difficulty level to select as it will increase a invisible wall count"
      // Let's trigger a reshuffle/restart with new difficulty to be immediate.
      
      // We'll just set it. And maybe trigger a layout regen?
      // Let's restart the round to be fair + clean.
      
      // BUT we must keep the timer? 
      // Let's just update the difficulty setting for future shuffles/rounds?
      // Or auto-shuffle?
      // Let's auto-restart round with same timer?
      // I'll just set difficulty and call startRound(prev.currentRound, diff) ?? 
      // But startRound resets timer? No, let's fix startRound or make a specific "updateDifficulty" function.
      
      // Hack: Just set difficulty. The user can click shuffle to apply? 
      // Or effective immediately?
      // Better: Restart round layout but keep timer.
      return { ...prev, difficulty: diff };
    });
    // And Trigger shuffle immediately to apply changes? 
    // Wait, the state update is async.
    // I will useEffect to trigger layout change if difficulty changes? 
    // Or just let user hit shuffle?
    // Let's make it apply on next round or shuffle.
    // Actually, "whenever i click on shuffle... shift". 
    // Maybe difficulty just applies then?
    // "add the difficulty level... it will increase a invisible wall count".
    // I will allow changing it, and it applies on next Shuffle or Round.
    // That seems safest unless I want to complexify state.
  }, []);

  const startGame = useCallback((mode: 'campaign' | 'practice', round: number = 0) => {
    setGameState(prev => ({
       ...prev,
       status: 'playing',
       mode,
       roundsWon: 0,
       history: [],
       currentRound: round // This change will trigger the useEffect
    }));
  }, []);

  const nextRound = useCallback((won: boolean) => {
    setGameState((prev) => {
      // Guard: If we are already playing, we shouldn't be advancing. 
      // This prevents double-triggers (e.g. from rapid inputs or race conditions).
      if (prev.status === 'playing') return prev;

      const isCampaign = prev.mode === 'campaign';
      const maxRounds = ROUND_CONFIGS.length;
      const newRoundsWon = won ? Math.min(prev.roundsWon + 1, maxRounds) : prev.roundsWon;
      
      // Record current round's outcome for history
      // Record current round's outcome for history
      const roundHistoryEntry: RoundHistory = {
        round: prev.currentRound,
        gridSize: prev.gridSize,
        playerPos: prev.playerPos,
        doorPos: prev.doorPos,
        keyPos: prev.keyPos,
        invisibleWalls: prev.invisibleWalls,
        result: won ? 'win' : 'loss',
        moves: prev.attempts,
        time: ROUND_TIME_LIMIT - prev.timeLeft, // Time taken
      };
      const newHistory = [...prev.history, roundHistoryEntry];

      if (!isCampaign) {
         // Practice mode: Finish after one round
         return {
            ...prev,
            status: 'finished',
            roundsWon: newRoundsWon,
            history: newHistory,
         };
      }

      // Campaign Mode
      const nextRoundIdx = prev.currentRound + 1;
      if (nextRoundIdx >= ROUND_CONFIGS.length) {
        // Finished all rounds
        return {
           ...prev,
           status: 'finished',
           roundsWon: newRoundsWon,
           history: newHistory,
        };
      }

      // Go to next round
      // Update roundsWon and currentRound. The actual board setup will be handled by startRound
      // which is called by the timer effect or explicitly.
      return {
          ...prev, 
          status: 'playing', // Ensure we are back to playing state so the Effect fires
          roundsWon: newRoundsWon,
          currentRound: nextRoundIdx, // This will trigger the useEffect
          history: newHistory,
      };
    });
  }, []);

  const goToMenu = useCallback(() => {
    setGameState(prev => ({
       ...prev,
       status: 'idle',
       mode: 'campaign', // Reset to default
       roundsWon: 0,
       history: [],
       currentRound: 0,
       timeLeft: ROUND_TIME_LIMIT
    }));
  }, []);

  return {
    gameState,
    movePlayer,
    shuffle,
    changeDifficulty,
    startRound, // Expose for manual start if needed
    startGame,
    nextRound,
    goToMenu,
  };
};

