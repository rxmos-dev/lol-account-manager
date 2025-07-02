import axios from 'axios';

interface ChampionMastery {
  championId: number;
  championLevel: number;
  championPoints: number;
  lastPlayTime: number;
}

interface SummonerLaneData {
  mainRole: string;
  roleStatistics: {
    [key: string]: {
      matches: number;
      percentage: number;
    };
  };
  totalMatches: number;
  analysisNote: string;
}

interface AccountData {
  region: string;
  username: string;
  password: string;
  summonerName: string;
  tagline: string;
  puuid?: string; // Adicionando campo opcional para PUUID
  eloData?: any; // Adicionando campo opcional para dados de elo
  championMasteriesData?: ChampionMastery[]; // Adicionando campo opcional para maestrias de campeões
  summonerLaneData?: SummonerLaneData; // Adicionando campo opcional para dados de lane principal
}

// Verifica se estamos em ambiente Electron
const isElectron = () => {
  return window && window.process && (window.process as any).type;
};

// Função para salvar contas
export const saveAccounts = async (accounts: AccountData[]): Promise<boolean> => {
  try {
    if (isElectron()) {
      // Usando IPC do Electron
      const { ipcRenderer } = window.require("electron");
      const result = await ipcRenderer.invoke("save-accounts", accounts);
      return result.success;
    } else {
      // Fallback para localStorage em desenvolvimento
      localStorage.setItem("accounts", JSON.stringify(accounts));
      return true;
    }
  } catch (error) {
    console.error("Erro ao salvar contas:", error);
    return false;
  }
};

// Função para carregar contas
export const loadAccounts = async (): Promise<AccountData[]> => {
  try {
    if (isElectron()) {
      // Usando IPC do Electron
      const { ipcRenderer } = window.require("electron");
      return await ipcRenderer.invoke("load-accounts");
    } else {
      // Fallback para localStorage em desenvolvimento
      const stored = localStorage.getItem("accounts");
      return stored ? JSON.parse(stored) : [];
    }
  } catch (error) {
    console.error("Erro ao carregar contas:", error);
    return [];
  }
};

// Função para buscar PUUID via API hospedada
export const fetchPuuid = async (summonerName: string, tagline: string): Promise<string | null> => {
  try {
    const response = await axios.post('https://api-lol-account-manager.vercel.app/api/v1/puuid', {
      summonerName,
      tagline
    });
  
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar PUUID:', error);
    return null;
  }
};

// Função para atualizar accounts com PUUIDs e dados de elo
export const updateAccountsWithPuuids = async (accounts: AccountData[]): Promise<AccountData[]> => {
  const updatedAccounts = await Promise.all(
    accounts.map(async (account) => {
      let updatedAccount = { ...account };
      
      // Busca PUUID se não existe
      if (!account.puuid) {
        const puuid = await fetchPuuid(account.summonerName, account.tagline);
        updatedAccount.puuid = puuid;
      }
      
      // Busca dados de elo
      const eloData = await fetchEloData(account.summonerName, account.tagline);
      updatedAccount.eloData = eloData;
      
      // Busca maestrias de campeões
      const championMasteriesData = await fetchChampionMasteries(account.summonerName, account.tagline);
      updatedAccount.championMasteriesData = championMasteriesData;
      
      // Busca dados da lane principal
      const summonerLaneData = await fetchSummonerLane(account.summonerName, account.tagline);
      updatedAccount.summonerLaneData = summonerLaneData;
      
      return updatedAccount;
    })
  );
  
  return updatedAccounts;
};

// Função para buscar dados de elo via API hospedada
export const fetchEloData = async (summonerName: string, tagline: string): Promise<any> => {
  try {
    const response = await axios.post('https://api-lol-account-manager.vercel.app/api/v1/elo', {
      summonerName,
      tagline
    });
    
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dados de elo:', error);
    return null;
  }
};

// Função para buscar maestrias de campeões via API hospedada
export const fetchChampionMasteries = async (summonerName: string, tagline: string): Promise<ChampionMastery[] | null> => {
  try {
    const response = await axios.post('https://api-lol-account-manager.vercel.app/api/v1/champion-masteries', {
      summonerName,
      tagline
    });
    
    console.log('Champion Masteries Data:', response.data.championMasteriesData);
    
    return response.data.championMasteriesData;
  } catch (error) {
    console.error('Erro ao buscar maestrias de campeões:', error);
    return null;
  }
};

// Função para buscar dados da lane principal via API hospedada
export const fetchSummonerLane = async (summonerName: string, tagline: string): Promise<SummonerLaneData | null> => {
  try {
    const response = await axios.post('https://api-lol-account-manager.vercel.app/api/v1/summoner-lane', {
      summonerName,
      tagline
    });
    
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dados da lane principal:', error);
    return null;
  }
};

// Função para deletar uma conta
export const deleteAccount = async (accountToDelete: AccountData): Promise<boolean> => {
  try {
    const accounts = await loadAccounts();
    const updatedAccounts = accounts.filter(account => 
      !(account.username === accountToDelete.username && 
        account.summonerName === accountToDelete.summonerName && 
        account.tagline === accountToDelete.tagline)
    );
    
    return await saveAccounts(updatedAccounts);
  } catch (error) {
    console.error("Erro ao deletar conta:", error);
    return false;
  }
};

export type { AccountData, ChampionMastery, SummonerLaneData };
