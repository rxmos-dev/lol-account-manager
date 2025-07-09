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

export interface UpdateInfo {
  version: string;
  releaseDate: string;
  releaseNotes?: string;
}

export interface UpdateStatus {
  isUpdateAvailable: boolean;
  isUpdateDownloaded: boolean;
  updateInfo?: UpdateInfo;
  downloadProgress?: number;
}

export interface ChampionData {
  name: string;
  id: string;
}

export interface Account {
  username: string;
  password?: string;
  server: string;
  puuid?: string;
  championMasteriesData?: ChampionMastery[];
  summonerLaneData?: SummonerLaneData;
}

export interface ChampionMastery {
  championId: number;
  championLevel: number;
  championPoints: number;
  lastPlayTime: number;
  championPointsSinceLastLevel: number;
  championPointsUntilNextLevel: number;
  chestGranted: boolean;
  tokensEarned: number;
  summonerId: string;
}

export interface SummonerLaneData {
  lane: string;
  games: number;
}
