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
