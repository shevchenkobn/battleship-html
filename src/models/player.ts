import { as, DeepReadonly } from '../app/types';
import { routes } from '../components/AppRouter';

export enum PlayerKind {
  Human = 'human',
  Computer = 'computer',
}

export const playerKinds = Object.values(PlayerKind) as ReadonlyArray<PlayerKind>;

export type Player = HumanPlayer | ComputerPlayer;

export interface HumanPlayer {
  kind: PlayerKind.Human;
  name: string;
  password: string;
}

export enum ComputerPlayerType {
  Random = 'random',
  Heuristic = 'heuristic',
}

export interface ComputerPlayer {
  kind: PlayerKind.Computer;
  type: ComputerPlayerType;
}

export type PlayerIndex = 0 | 1;

export function isValidPlayerIndex(index: unknown): index is PlayerIndex {
  return Number.isInteger(index) && as<number>(index) && index >= 0 && index <= 1;
}

export function parsePlayerIndex(index: any) {
  return Number.parseInt(index);
}

export function hasPassword(player: DeepReadonly<Player>): player is HumanPlayer {
  return player.kind === PlayerKind.Human && player.password !== '';
}
