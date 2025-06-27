export interface Player {
  player: string;
  gameName?: string;
  tagLine?: string;
  champion: number;
  championName: string;
  isCurrentPicker: boolean;
  cellId: number;
  summonerId?: number;
  puuid?: string;
}

export interface Timer {
  timeLeftInPhase: number;
  totalTimeInPhase: number;
  phase: string;
}

export interface MatchupData {
  enemy: string;
  win_rate: string;
  games: string;
}

export interface ChampionMatchupResponse {
  champion: string;
  win_rate: string;
  pick_rate: string;
  matchups: MatchupData[];
}

export interface SuggestedPick {
  championName: string;
  championId: number;
  winRate: string;
  confidence: number;
  reason: string;
}

export interface Draft {
  blueSide: Player[];
  redSide: Player[];
  bans: {
    blue: number[];
    red: number[];
  };
  currentPicker: string | null;
  phase: string | null;
  timer: Timer | null;
  isMyTeamBlue: boolean;
}

export interface LCUCredentials {
  port: string;
  password: string;
  protocol: string;
}

export interface LoLStatus {
  isRunning: boolean;
  isConnected: boolean;
  inChampSelect: boolean;
}

export interface ChampionData {
  name: string;
  id: string;
}
