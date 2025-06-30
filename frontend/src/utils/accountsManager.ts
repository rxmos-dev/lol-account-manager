interface AccountData {
  region: string;
  username: string;
  password: string;
  summonerName: string;
  tagline: string;
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

export type { AccountData };
