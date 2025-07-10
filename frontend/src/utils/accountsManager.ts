import axios from 'axios';
import { Account } from "../types";

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
  lastUpdated?: number; // Timestamp da última atualização dos dados da API
}

// Constantes de configuração
const API_BASE_URL = 'https://api-lol-account-manager.vercel.app/api/v1';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas em milissegundos

// Tipos auxiliares para melhor tipagem
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Enum para endpoints da API
enum ApiEndpoints {
  PUUID = '/puuid',
  ELO = '/elo',
  CHAMPION_MASTERIES = '/champion-masteries',
  SUMMONER_LANE = '/summoner-lane'
}

// Verifica se estamos em ambiente Electron
const isElectron = () => {
  return window && window.electron;
};

// Função para salvar contas
export const saveAccounts = async (accounts: AccountData[]): Promise<boolean> => {
  try {
    if (isElectron()) {
      // Usando IPC do Electron
      const { ipcRenderer } = window.electron;
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
      const { ipcRenderer } = window.electron;
      const accounts = await ipcRenderer.invoke("load-accounts");
      return accounts;
    } else {
      // Fallback para localStorage em desenvolvimento
      const stored = localStorage.getItem("accounts");
      const accounts = stored ? JSON.parse(stored) : [];
      return accounts;
    }
  } catch (error) {
    console.error("Erro ao carregar contas:", error);
    return [];
  }
};

// Função para carregar contas sem descriptografar (conteúdo bruto do arquivo)
export const loadAccountsRaw = async (): Promise<AccountData[]> => {
  try {
    if (isElectron()) {
      // Usando IPC do Electron para dados brutos
      const { ipcRenderer } = window.electron;
      const accounts = await ipcRenderer.invoke("load-accounts-raw");
      return accounts;
    } else {
      // Fallback para localStorage em desenvolvimento
      const stored = localStorage.getItem("accounts");
      const accounts = stored ? JSON.parse(stored) : [];
      return accounts;
    }
  } catch (error) {
    console.error("Erro ao carregar contas brutas:", error);
    return [];
  }
};

// Função para buscar PUUID via API hospedada
export const fetchPuuid = async (summonerName: string, tagline: string): Promise<string | null> => {
  try {
    const response = await axios.post(`${API_BASE_URL}${ApiEndpoints.PUUID}`, {
      summonerName,
      tagline
    });
  
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar PUUID:', error);
    return null;
  }
};

// Função para verificar se os dados precisam ser atualizados
const needsUpdate = (lastUpdated?: number): boolean => {
  if (!lastUpdated) return true;
  const now = Date.now();
  return (now - lastUpdated) > CACHE_DURATION;
};

// Função para atualizar accounts com PUUIDs e dados de elo
export const updateAccountsWithPuuids = async (accounts: AccountData[]): Promise<AccountData[]> => {
  const updatedAccounts = await Promise.all(
    accounts.map(async (account) => {
      let updatedAccount = { ...account };
      
      // Verifica se precisa atualizar os dados
      const shouldUpdate = needsUpdate(account.lastUpdated);
      
      if (shouldUpdate) {
        
        // Busca PUUID se não existe
        if (!account.puuid) {
          const puuid = await fetchPuuid(account.summonerName, account.tagline);
          if (puuid) {
            updatedAccount.puuid = puuid;
          }
        }
        
        // Busca dados de elo
        const eloData = await fetchEloData(account.summonerName, account.tagline);
        if (eloData) {
          updatedAccount.eloData = eloData;
        }
        
        // Busca maestrias de campeões
        const championMasteriesData = await fetchChampionMasteries(account.summonerName, account.tagline);
        if (championMasteriesData) {
          updatedAccount.championMasteriesData = championMasteriesData;
        }
        
        // Busca dados da lane principal
        const summonerLaneData = await fetchSummonerLane(account.summonerName, account.tagline);
        if (summonerLaneData) {
          updatedAccount.summonerLaneData = summonerLaneData;
        }
        
        // Atualiza o timestamp
        updatedAccount.lastUpdated = Date.now();
      } 
      
      return updatedAccount;
    })
  );
  
  return updatedAccounts;
};

// Função para buscar dados de elo via API hospedada
export const fetchEloData = async (summonerName: string, tagline: string): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}${ApiEndpoints.ELO}`, {
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
    const response = await axios.post(`${API_BASE_URL}${ApiEndpoints.CHAMPION_MASTERIES}`, {
      summonerName,
      tagline
    });
    
    return response.data.championMasteriesData;
  } catch (error) {
    console.error('Erro ao buscar maestrias de campeões:', error);
    return null;
  }
};

// Função para buscar dados da lane principal via API hospedada
export const fetchSummonerLane = async (summonerName: string, tagline: string): Promise<SummonerLaneData | null> => {
  try {
    const response = await axios.post(`${API_BASE_URL}${ApiEndpoints.SUMMONER_LANE}`, {
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
export const deleteAccount = async (username: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (isElectron()) {
      const { ipcRenderer } = window.electron;
      ipcRenderer.send("delete-account", username);
      ipcRenderer.once("delete-account-success", () => {
        resolve();
      });
      ipcRenderer.once("delete-account-error", (_event, error) => {
        reject(error);
      });
    } else {
      // Fallback para desenvolvimento
      const accounts = JSON.parse(localStorage.getItem("accounts") || "[]");
      const updatedAccounts = accounts.filter((account: AccountData) => account.username !== username);
      localStorage.setItem("accounts", JSON.stringify(updatedAccounts));
      resolve();
    }
  });
};

// Função para atualizar uma conta
export const updateAccount = async (updatedAccount: Account): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (isElectron()) {
      const { ipcRenderer } = window.electron;
      ipcRenderer.send("update-account", updatedAccount);
      ipcRenderer.once("update-account-success", () => {
        resolve();
      });
      ipcRenderer.once("update-account-error", (_event, error) => {
        reject(error);
      });
    } else {
      // Fallback para desenvolvimento
      const accounts = JSON.parse(localStorage.getItem("accounts") || "[]");
      const accountIndex = accounts.findIndex((account: AccountData) => account.username === updatedAccount.username);
      if (accountIndex !== -1) {
        accounts[accountIndex] = updatedAccount;
        localStorage.setItem("accounts", JSON.stringify(accounts));
        resolve();
      } else {
        reject(new Error("Conta não encontrada"));
      }
    }
  });
}

// Função para forçar atualização dos dados de uma conta específica
export const forceUpdateAccount = async (account: AccountData): Promise<AccountData> => {
  let updatedAccount = { ...account };
  
  // Busca PUUID se não existe
  if (!account.puuid) {
    const puuid = await fetchPuuid(account.summonerName, account.tagline);
    if (puuid) {
      updatedAccount.puuid = puuid;
    }
  }
  
  // Busca dados de elo
  const eloData = await fetchEloData(account.summonerName, account.tagline);
  if (eloData) {
    updatedAccount.eloData = eloData;
  }
  
  // Busca maestrias de campeões
  const championMasteriesData = await fetchChampionMasteries(account.summonerName, account.tagline);
  if (championMasteriesData) {
    updatedAccount.championMasteriesData = championMasteriesData;
  }
  
  // Busca dados da lane principal
  const summonerLaneData = await fetchSummonerLane(account.summonerName, account.tagline);
  if (summonerLaneData) {
    updatedAccount.summonerLaneData = summonerLaneData;
  }
  
  // Atualiza o timestamp
  updatedAccount.lastUpdated = Date.now();
  
  return updatedAccount;
};

// Função para forçar atualização de todas as contas
export const forceUpdateAllAccounts = async (accounts: AccountData[]): Promise<AccountData[]> => {

  const updatedAccounts = await Promise.all(
    accounts.map(async (account) => {
      try {
        const updatedData = await window.electron.getAccountData(account.username, account.password, account.region);
        return { ...account, ...updatedData, lastUpdated: Date.now() };
      } catch (error) {
        console.error(`Erro ao atualizar dados para ${account.summonerName}#${account.tagline}:`, error);
        return account; // Retorna os dados originais em caso de erro
      }
    })
  );

  // Salva as contas atualizadas
  await saveAccounts(updatedAccounts);

  return updatedAccounts;
};

export type { AccountData, ChampionMastery, SummonerLaneData };
