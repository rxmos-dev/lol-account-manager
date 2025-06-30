import axios from 'axios';

interface AccountData {
  region: string;
  username: string;
  password: string;
  summonerName: string;
  tagline: string;
  puuid?: string; // Adicionando campo opcional para PUUID
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

// Função para atualizar accounts com PUUIDs
export const updateAccountsWithPuuids = async (accounts: AccountData[]): Promise<AccountData[]> => {
  const updatedAccounts = await Promise.all(
    accounts.map(async (account) => {
      if (!account.puuid) {
        const puuid = await fetchPuuid(account.summonerName, account.tagline);
        return { ...account, puuid };
      }
      return account;
    })
  );
  
  return updatedAccounts;
};

// Função para buscar dados de rank usando PUUID
export const fetchRankData = async (puuid: string, region: string = 'br1'): Promise<any> => {
  try {
    // Primeiro busca o summoner ID usando o PUUID
    const summonerResponse = await axios.get(
      `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      {
        headers: {
          'X-Riot-Token': 'RIOT_API_KEY_AQUI' // Você precisará configurar isso
        }
      }
    );
    
    const summonerId = summonerResponse.data.id;
    
    // Depois busca os dados de ranked usando o summoner ID
    const rankResponse = await axios.get(
      `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`,
      {
        headers: {
          'X-Riot-Token': 'RIOT_API_KEY_AQUI' // Você precisará configurar isso
        }
      }
    );
    
    return rankResponse.data;
  } catch (error) {
    console.error('Erro ao buscar dados de rank:', error);
    return null;
  }
};

export type { AccountData };
