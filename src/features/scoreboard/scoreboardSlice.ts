import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LocalStorageKeys, StoreSliceName } from '../../app/constants';
import { GuardedMap } from '../../app/map';
import { as, DeepReadonly } from '../../app/types';
import { Player, PlayerIndex, PlayerKind } from '../../models/player';

export interface ScoreboardEntry {
  playerName: string;
  totalScore: number;
  gamesWon: number;
  gamesLost: number;
}

export function isScoreboardEntry(value: unknown): value is ScoreboardEntry {
  // noinspection SuspiciousTypeOfGuard
  return (
    value instanceof Object &&
    as<ScoreboardEntry>(value) &&
    typeof value.playerName === 'string' &&
    typeof value.totalScore === 'number' &&
    typeof value.gamesWon === 'number' &&
    typeof value.gamesLost === 'number'
  );
}

export interface ScoreboardSlice {
  list: ScoreboardEntry[];
}

export function isScoreboardSlice(value: unknown): value is ScoreboardSlice {
  return (
    value instanceof Object &&
    as<ScoreboardSlice>(value) &&
    Array.isArray(value.list) &&
    value.list.every((e) => isScoreboardEntry(e))
  );
}

const initialState: ScoreboardSlice = {
  list: [],
};

export interface PlayerScore {
  player: Player;
  scores: number;
}

export interface AddGameResultActionPayload {
  winner: PlayerIndex;
  players: [PlayerScore, PlayerScore];
}

const scoreboardSlice = createSlice({
  name: StoreSliceName.Scoreboard,
  initialState,
  reducers: {
    addGameResult(state, action: PayloadAction<AddGameResultActionPayload>) {
      reconcileWithSavedStore(state);
      const result = action.payload;

      for (let i = 0; i < result.players.length; i += 1) {
        trySavePlayerResult(result.players[i], i === result.winner, state.list);
      }

      saveScoreboard(state);
    },

    clearScoreboard() {
      const newState = { list: [] };
      saveScoreboard(newState);
      return newState;
    },
  },
});

export const { addGameResult, clearScoreboard } = scoreboardSlice.actions;

export default scoreboardSlice.reducer;

function trySavePlayerResult(score: PlayerScore, isWinner: boolean, list: ScoreboardEntry[]) {
  if (score.player.kind === PlayerKind.Computer) {
    return null;
  }
  let updated = false;
  for (const entry of list) {
    if (score.player.name === entry.playerName) {
      if (isWinner) {
        entry.gamesWon += 1;
      } else {
        entry.gamesLost += 1;
      }
      entry.totalScore += score.scores;
      updated = true;
      break;
    }
  }
  if (!updated) {
    const entry = {
      playerName: score.player.name,
      gamesWon: 0,
      gamesLost: 0,
      totalScore: score.scores,
    };
    entry[isWinner ? 'gamesWon' : 'gamesLost'] = 1;
    list.push(entry);
    return entry;
  }
}

/**
 * There is a more robust solution - [redux-persist](https://www.npmjs.com/package/redux-persist), but for better control I use own solution.
 */
function saveScoreboard(state: DeepReadonly<ScoreboardSlice>) {
  localStorage.setItem(LocalStorageKeys.Scoreboard, JSON.stringify(state));
}

function tryLoadScoreboard(): ScoreboardSlice {
  let state: ScoreboardSlice;
  try {
    state = JSON.parse(localStorage.getItem(LocalStorageKeys.Scoreboard) ?? '');
  } catch (error) {
    console.error(
      `Invalid scoreboard found: "${localStorage.getItem(
        LocalStorageKeys.Scoreboard
      )}". Returning empty scoreboard...`
    );
    return { list: [] };
  }
  if (!isScoreboardSlice(state)) {
    console.error(
      `Invalid scoreboard type: "${localStorage.getItem(
        LocalStorageKeys.Scoreboard
      )}". Returning empty scoreboard...`
    );
    return { list: [] };
  }
  return { list: state.list };
}

/**
 * Mutates argument, doesn't sort.
 */
function reconcileWithSavedStore(state: ScoreboardSlice) {
  const savedState = tryLoadScoreboard();

  const entries = toEntryMap(state.list);
  const savedEntries = toEntryMap(savedState.list);
  const list: ScoreboardEntry[] = [];
  for (const [playerName, entry] of entries.entries()) {
    const savedEntry = savedEntries.get(playerName);
    if (savedEntry) {
      entry.totalScore = Math.max(entry.totalScore, savedEntry.totalScore);
      entry.gamesWon = Math.max(entry.gamesWon, savedEntry.gamesWon);
      entry.gamesLost = Math.max(entry.gamesLost, savedEntry.gamesLost);
      savedEntries.delete(playerName);
    }
    list.push(entry);
    entries.delete(playerName);
  }
  for (const entry of savedEntries.values()) {
    list.push(entry);
  }
  state.list = list;

  return state;
}

function toEntryMap(list: DeepReadonly<ScoreboardEntry[]>) {
  const map = new GuardedMap<string, DeepReadonly<ScoreboardEntry>[]>();
  for (const entry of list) {
    let entries: DeepReadonly<ScoreboardEntry>[];
    if (!map.has(entry.playerName)) {
      entries = [];
      map.set(entry.playerName, entries);
    } else {
      entries = map.get(entry.playerName);
    }
    entries.push(entry);
  }
  const mergedMap = new Map<string, ScoreboardEntry>();
  for (const entries of map.values()) {
    const mergedEntry = { ...entries[0] };
    for (let i = 1; i < entries.length; i += 1) {
      mergedEntry.totalScore += entries[i].totalScore;
      mergedEntry.gamesWon += entries[i].gamesWon;
      mergedEntry.gamesLost += entries[i].gamesLost;
    }
    mergedMap.set(mergedEntry.playerName, mergedEntry);
  }
  return mergedMap;
}

export function compareScoreboardEntriesDesc(
  entry1: DeepReadonly<ScoreboardEntry>,
  entry2: DeepReadonly<ScoreboardEntry>
): number {
  return entry1.totalScore > entry2.totalScore
    ? 1
    : entry1.totalScore < entry2.totalScore
    ? -1
    : entry1.gamesWon > entry2.gamesWon
    ? 1
    : entry1.gamesWon < entry2.gamesWon
    ? -1
    : entry1.gamesLost < entry2.gamesLost
    ? 1
    : entry1.gamesLost > entry2.gamesLost
    ? -1
    : 0;
}
