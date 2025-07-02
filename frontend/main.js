import { app, BrowserWindow, ipcMain } from 'electron';
import pkg from 'electron-updater';
const { autoUpdater } = pkg;
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import axios from 'axios';
import https from 'https';
import { Buffer } from 'buffer';
import CryptoJS from 'crypto-js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure auto-updater
autoUpdater.checkForUpdatesAndNotify();

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Update available.');
  // Send event to renderer
  BrowserWindow.getAllWindows().forEach(win => {
    win.webContents.send('update-available', info);
  });
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available.');
  // Send event to renderer
  BrowserWindow.getAllWindows().forEach(win => {
    win.webContents.send('update-not-available', info);
  });
});

autoUpdater.on('error', (err) => {
  console.log('Error in auto-updater. ' + err);
  // Send event to renderer
  BrowserWindow.getAllWindows().forEach(win => {
    win.webContents.send('updater-error', err);
  });
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  console.log(log_message);
  // Send event to renderer
  BrowserWindow.getAllWindows().forEach(win => {
    win.webContents.send('download-progress', progressObj);
  });
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded');
  // Send event to renderer
  BrowserWindow.getAllWindows().forEach(win => {
    win.webContents.send('update-downloaded', info);
  });
  // Don't auto-install, let user decide
  // autoUpdater.quitAndInstall();
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 700,
    frame: false,
    maximizable: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  } else {
    win.loadURL('http://localhost:5173');
  }
}

ipcMain.handle('check-lol-process', async () => {
  return new Promise((resolve) => {
    const checkLeagueClient = new Promise((resolveClient) => {
      exec('tasklist /FI "IMAGENAME eq LeagueClient.exe" /FO CSV', (error, stdout) => {
        if (error) {
          resolveClient(false);
        } else {
          console.log('LeagueClient.exe output:', stdout);
          resolveClient(stdout.includes('LeagueClient.exe'));
        }
      });
    });

    const checkLeagueClientUx = new Promise((resolveUx) => {
      exec('tasklist /FI "IMAGENAME eq LeagueClientUxRender.exe" /FO CSV', (error, stdout) => {
        if (error) {
          resolveUx(false);
        } else {
          console.log('LeagueClientUxRender.exe output:', stdout);
          resolveUx(stdout.includes('LeagueClientUxRender.exe'));
        }
      });
    });

    Promise.all([checkLeagueClient, checkLeagueClientUx])
      .then(([hasClient, hasClientUx]) => {
        console.log(`LeagueClient.exe: ${hasClient}, LeagueClientUxRender.exe: ${hasClientUx}`);
        resolve(hasClient || hasClientUx);
      })
      .catch(() => {
        resolve(false);
      });
  });
});

ipcMain.handle('get-lcu-credentials', async () => {
  try {
    const lockfilePath = path.join(os.homedir(), 'AppData', 'Local', 'Riot Games', 'League of Legends', 'lockfile');
    console.log('Procurando lockfile em:', lockfilePath);
    
    if (fs.existsSync(lockfilePath)) {
      console.log('Lockfile encontrado, lendo conteúdo...');
      const lockfileContent = fs.readFileSync(lockfilePath, 'utf8');
      console.log('Conteúdo do lockfile:', lockfileContent);
      const parts = lockfileContent.split(':');
      
      if (parts.length >= 5) {
        const credentials = {
          port: parts[2],
          password: parts[3],
          protocol: parts[4]
        };
        console.log('Credenciais extraídas:', { port: credentials.port, protocol: credentials.protocol });
        return credentials;
      } else {
        console.log('Formato do lockfile inválido, partes encontradas:', parts.length);
      }
    } else {
      console.log('Lockfile não encontrado no caminho padrão');
      
      const processLockfile = await findLockfileFromProcess();
      if (processLockfile) {
        const lockfileContent = fs.readFileSync(processLockfile, 'utf8');
        const parts = lockfileContent.split(':');
        
        if (parts.length >= 5) {
          return {
            port: parts[2],
            password: parts[3],
            protocol: parts[4]
          };
        }
      }
      
      const alternatePaths = [
        path.join('C:', 'Riot Games', 'League of Legends', 'lockfile'),
        path.join('C:', 'Program Files', 'Riot Games', 'League of Legends', 'lockfile'),
        path.join('C:', 'Program Files (x86)', 'Riot Games', 'League of Legends', 'lockfile')
      ];
      
      for (const altPath of alternatePaths) {
        console.log('Tentando caminho alternativo:', altPath);
        if (fs.existsSync(altPath)) {
          console.log('Lockfile encontrado em caminho alternativo:', altPath);
          const lockfileContent = fs.readFileSync(altPath, 'utf8');
          const parts = lockfileContent.split(':');
          
          if (parts.length >= 5) {
            return {
              port: parts[2],
              password: parts[3],
              protocol: parts[4]
            };
          }
        }
      }
    }
    return null;
  } catch (error) {
    console.error('Erro ao ler lockfile:', error);
    return null;
  }
});

const findLockfileFromProcess = () => {
  return new Promise((resolve) => {
    exec('wmic process where "name=\'LeagueClient.exe\'" get ExecutablePath /format:csv', (error, stdout) => {
      if (error) {
        console.log('Erro ao obter caminho do processo:', error);
        resolve(null);
        return;
      }
      
      console.log('WMIC output:', stdout);
      
      const lines = stdout.split('\n').filter(line => line.trim() && !line.includes('ExecutablePath'));
      for (const line of lines) {
        const parts = line.split(',');
        if (parts.length >= 2) {
          const execPath = parts[1].trim();
          if (execPath && execPath !== '') {
            const lockfilePath = path.join(path.dirname(execPath), 'lockfile');
            console.log('Tentando lockfile em:', lockfilePath);
            
            if (fs.existsSync(lockfilePath)) {
              console.log('Lockfile encontrado via processo:', lockfilePath);
              resolve(lockfilePath);
              return;
            }
          }
        }
      }
      resolve(null);
    });
  });
};

const createAxiosInstance = (credentials) => {
  return axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false
    }),
    auth: {
      username: 'riot',
      password: credentials.password
    },
    timeout: 5000
  });
};

ipcMain.handle('test-lcu-connection', async (event, credentials) => {
  console.log('Testando conexão LCU...');
  if (!credentials) return false;
  
  try {
    const axiosInstance = createAxiosInstance(credentials);
    const response = await axiosInstance.get(`https://127.0.0.1:${credentials.port}/lol-summoner/v1/current-summoner`);
    console.log('Conexão LCU:', response.status === 200 ? 'Sucesso' : 'Falhou');
    return response.status === 200;
  } catch (error) {
    console.log('Erro na conexão LCU:', error.message);
    return false;
  }
});

ipcMain.handle('check-champion-select', async (event, credentials) => {
  console.log('Verificando Champion Select...');
  if (!credentials) return false;
  
  try {
    const axiosInstance = createAxiosInstance(credentials);
    const response = await axiosInstance.get(`https://127.0.0.1:${credentials.port}/lol-champ-select/v1/session`);
    const inChampSelect = response.status === 200 && response.data;
    console.log('Em Champion Select:', !!inChampSelect);
    return inChampSelect;
  } catch (error) {
    console.log('Erro ao verificar Champion Select:', error.message);
    return false;
  }
});

ipcMain.handle('get-champion-select-data', async (event, credentials) => {
  console.log('Buscando dados do Champion Select...');
  if (!credentials) return null;
  
  try {
    const axiosInstance = createAxiosInstance(credentials);
    const response = await axiosInstance.get(`https://127.0.0.1:${credentials.port}/lol-champ-select/v1/session`);
    
    if (response.status === 200) {
      console.log('Dados do Champion Select obtidos com sucesso');
      const champSelectData = response.data;
      
      const myTeam = champSelectData.myTeam || [];
      const theirTeam = champSelectData.theirTeam || [];
      const actions = champSelectData.actions || [];
      const timer = champSelectData.timer || {};
      
      const localPlayerCellId = champSelectData.localPlayerCellId || 0;
      const isMyTeamBlue = localPlayerCellId < 5;
      
      const currentAction = actions.flat().find(action => 
        action.isInProgress && (action.type === 'pick' || action.type === 'ban')
      );
      
      let currentPicker = null;
      if (currentAction) {
        const allPlayers = [...myTeam, ...theirTeam];
        const pickingPlayer = allPlayers.find(player => player.cellId === currentAction.actorCellId);
        currentPicker = pickingPlayer?.gameName || pickingPlayer?.summonerName || `Player ${currentAction.actorCellId + 1}`;
      }
      
      const myTeamBans = champSelectData.bans?.myTeamBans || [];
      const theirTeamBans = champSelectData.bans?.theirTeamBans || [];
      
      const getChampionName = (championId) => {
        if (!championId || championId === 0) return "None";
        return championMap[championId] || `Champion ${championId}`;
      };
      
      const processedData = {
        blueSide: (isMyTeamBlue ? myTeam : theirTeam).map(player => ({
          player: player.gameName || player.summonerName || `Player ${player.cellId + 1}`,
          champion: player.championId || 0,
          championName: getChampionName(player.championId),
          isCurrentPicker: currentAction && player.cellId === currentAction.actorCellId,
          cellId: player.cellId
        })),
        redSide: (isMyTeamBlue ? theirTeam : myTeam).map(player => ({
          player: player.gameName || player.summonerName || `Player ${player.cellId + 1}`,
          champion: player.championId || 0,
          championName: getChampionName(player.championId),
          isCurrentPicker: currentAction && player.cellId === currentAction.actorCellId,
          cellId: player.cellId
        })),
        bans: {
          blue: isMyTeamBlue ? myTeamBans : theirTeamBans,
          red: isMyTeamBlue ? theirTeamBans : myTeamBans
        },
        currentPicker: currentPicker,
        phase: timer.phase || 'PLANNING',
        timer: {
          timeLeftInPhase: timer.adjustedTimeLeftInPhase || timer.timeLeftInPhase || 0,
          totalTimeInPhase: timer.totalTimeInPhase || 0,
          phase: timer.phase || 'PLANNING'
        },
        isMyTeamBlue: isMyTeamBlue
      };
      
      console.log('Dados processados:', JSON.stringify(processedData, null, 2));
      return processedData;
    }
    return null;
  } catch (error) {
    console.error('Erro ao obter dados do champion select:', error);
    return null;
  }
});

ipcMain.handle('get-champion-info', async (event, credentials, championId) => {
  if (!credentials || !championId) return null;
  
  try {
    const axiosInstance = createAxiosInstance(credentials);
    const response = await axiosInstance.get(`https://127.0.0.1:${credentials.port}/lol-champions/v1/champions/${championId}`);
    
    if (response.status === 200) {
      return {
        id: response.data.id,
        name: response.data.name,
        alias: response.data.alias,
        squarePortraitPath: response.data.squarePortraitPath,
        loadScreenPath: response.data.loadScreenPath
      };
    }
    return null;
  } catch {
    return null;
  }
});

let championCache = null;

ipcMain.handle('get-champion-data', async (event, credentials) => {
  if (!credentials) return null;

  if (championCache) {
    return championCache;
  }

  try {
    const axiosInstance = createAxiosInstance(credentials);
    const response = await axiosInstance.get(`https://127.0.0.1:${credentials.port}/lol-game-data/assets/v1/champions.json`);

    if (response.status === 200) {
      championCache = response.data;
      return championCache;
    }

    return null;
  } catch (error) {
    console.error('Erro ao obter dados dos campeões:', error);
    return null;
  }
});

ipcMain.handle('check-league-login', async (event, credentials) => {
  if (!credentials) return false;
  
  try {
    const axiosInstance = createAxiosInstance(credentials);
    
    const endpoints = [
      '/lol-summoner/v1/current-summoner',
      '/lol-login/v1/session',
      '/lol-platform-config/v1/namespaces'
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Testando endpoint: ${endpoint}`);
        const response = await axiosInstance.get(`https://127.0.0.1:${credentials.port}${endpoint}`);
        console.log(`Endpoint ${endpoint} retornou status:`, response.status);
        
        if (response.status === 200) {
          console.log(`Sucesso no endpoint ${endpoint}:`, response.data);
          return true;
        }
      } catch (endpointError) {
        console.log(`Erro no endpoint ${endpoint}:`, endpointError.message);
      }
    }
    
    return false;
  } catch (error) {
    console.log('Erro geral ao verificar login:', error.message);
    return false;
  }
});

ipcMain.handle('close-app', async () => {
  app.quit();
});

ipcMain.handle('minimize-app', async () => {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    focusedWindow.minimize();
  }
});

ipcMain.handle('maximize-app', async () => {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    if (focusedWindow.isMaximized()) {
      focusedWindow.unmaximize();
    } else {
      focusedWindow.maximize();
    }
  }
});

// Handlers para gerenciamento de contas
const encryptionKey = 'LoL-Account-Manager-2025'; // Em produção, use uma chave mais segura

ipcMain.handle('save-accounts', async (event, accounts) => {
  try {
    const accountsFilePath = getAccountsFilePath();
    
    // Criptografar senhas antes de salvar
    const encryptedAccounts = accounts.map(account => ({
      ...account,
      password: CryptoJS.AES.encrypt(account.password, encryptionKey).toString()
    }));
    
    // Cria o diretório se não existir
    const dir = path.dirname(accountsFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(accountsFilePath, JSON.stringify(encryptedAccounts, null, 2));
    return { success: true };
  } catch (error) {
    console.error('Erro ao salvar contas:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-accounts', async () => {
  try {
    const accountsFilePath = getAccountsFilePath();
    
    if (!fs.existsSync(accountsFilePath)) {
      return [];
    }
    
    const data = fs.readFileSync(accountsFilePath, 'utf8');
    const accounts = JSON.parse(data);
    
    // Descriptografar senhas
    const decryptedAccounts = accounts.map(account => ({
      ...account,
      password: CryptoJS.AES.decrypt(account.password, encryptionKey).toString(CryptoJS.enc.Utf8)
    }));
    
    return decryptedAccounts;
  } catch (error) {
    console.error('Erro ao carregar contas:', error);
    return [];
  }
});

// Handlers para configurações
let customAccountsPath = null;
let customLeaguePath = null;

const getAccountsFilePath = () => {
  return customAccountsPath || path.join(app.getPath('userData'), 'accounts.json');
};

ipcMain.handle('get-accounts-path', async () => {
  return getAccountsFilePath();
});

ipcMain.handle('set-accounts-path', async (event, newPath) => {
  try {
    // Valida se o diretório existe
    const dir = path.dirname(newPath);
    if (!fs.existsSync(dir)) {
      return { success: false, error: 'Diretório não existe' };
    }

    // Se há um arquivo atual, move para o novo local
    const currentPath = getAccountsFilePath();
    if (fs.existsSync(currentPath) && currentPath !== newPath) {
      try {
        // Tenta mover o arquivo diretamente
        fs.renameSync(currentPath, newPath);
      } catch {
        // Se falhar (possivelmente entre diferentes drives), copia e remove
        const data = fs.readFileSync(currentPath, 'utf8');
        fs.writeFileSync(newPath, data);
        fs.unlinkSync(currentPath);
      }
    }

    customAccountsPath = newPath;
    
    // Salva a configuração
    const configPath = path.join(app.getPath('userData'), 'config.json');
    let config = {};
    
    // Carrega configuração existente se houver
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    
    config.accountsPath = newPath;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    return { success: true };
  } catch (error) {
    console.error('Erro ao definir caminho:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('reset-accounts-path', async () => {
  try {
    const defaultPath = path.join(app.getPath('userData'), 'accounts.json');
    
    // Move arquivo atual para o local padrão se necessário
    const currentPath = getAccountsFilePath();
    if (fs.existsSync(currentPath) && currentPath !== defaultPath) {
      try {
        // Tenta mover o arquivo diretamente
        fs.renameSync(currentPath, defaultPath);
      } catch {
        // Se falhar (possivelmente entre diferentes drives), copia e remove
        const data = fs.readFileSync(currentPath, 'utf8');
        fs.writeFileSync(defaultPath, data);
        fs.unlinkSync(currentPath);
      }
    }

    customAccountsPath = null;
    
    // Remove configuração customizada, mas preserva outras configurações
    const configPath = path.join(app.getPath('userData'), 'config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      delete config.accountsPath;
      
      // Se há outras configurações, mantem o arquivo, senão remove
      if (Object.keys(config).length > 0) {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      } else {
        fs.unlinkSync(configPath);
      }
    }

    return { success: true, defaultPath };
  } catch (error) {
    console.error('Erro ao resetar caminho:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('select-accounts-folder', async () => {
  try {
    const { dialog } = await import('electron');
    const result = await dialog.showSaveDialog({
      title: 'Selecionar local para salvar accounts.json',
      defaultPath: 'accounts.json',
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    return result;
  } catch (error) {
    console.error('Erro ao abrir dialog:', error);
    return { canceled: true };
  }
});

// League path management functions
const getLeaguePath = () => {
  return customLeaguePath || "C:\\Riot Games\\Riot Client\\RiotClientServices.exe";
};

ipcMain.handle('get-league-path', async () => {
  return getLeaguePath();
});

ipcMain.handle('set-league-path', async (event, newPath) => {
  try {
    // Valida se o arquivo existe
    if (!fs.existsSync(newPath)) {
      return { success: false, error: 'Arquivo executável não encontrado' };
    }

    customLeaguePath = newPath;
    
    // Salva a configuração
    const configPath = path.join(app.getPath('userData'), 'config.json');
    let config = {};
    
    // Carrega configuração existente se houver
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    
    config.leaguePath = newPath;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    return { success: true };
  } catch (error) {
    console.error('Erro ao definir caminho do League:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('select-league-exe', async () => {
  try {
    const { dialog } = await import('electron');
    const result = await dialog.showOpenDialog({
      title: 'Selecionar RiotClientServices.exe',
      defaultPath: 'C:\\Riot Games\\Riot Client\\RiotClientServices.exe',
      filters: [
        { name: 'Executable Files', extensions: ['exe'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    if (!result.canceled && result.filePaths.length > 0) {
      return { canceled: false, filePath: result.filePaths[0] };
    }
    
    return { canceled: true };
  } catch (error) {
    console.error('Erro ao abrir dialog:', error);
    return { canceled: true };
  }
});

ipcMain.handle('launch-league', async (event, leaguePath) => {
  try {
    const execPath = leaguePath || getLeaguePath();
    
    // Verifica se o arquivo existe
    if (!fs.existsSync(execPath)) {
      return { success: false, error: 'Arquivo executável não encontrado: ' + execPath };
    }

    // Comando para abrir League of Legends
    const command = `"${execPath}" --launch-product=league_of_legends --launch-patchline=live`;
    
    return new Promise((resolve) => {
      exec(command, (error) => {
        if (error) {
          console.error('Erro ao executar League:', error);
          resolve({ success: false, error: error.message });
        } else {
          console.log('League executado com sucesso');
          resolve({ success: true });
        }
      });
    });
  } catch (error) {
    console.error('Erro ao abrir League of Legends:', error);
    return { success: false, error: error.message };
  }
});

// Auto-updater IPC handlers
ipcMain.handle('check-for-updates', async () => {
  try {
    const result = await autoUpdater.checkForUpdates();
    return { success: true, updateInfo: result };
  } catch (error) {
    console.error('Error checking for updates:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('download-update', async () => {
  try {
    await autoUpdater.downloadUpdate();
    return { success: true };
  } catch (error) {
    console.error('Error downloading update:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('quit-and-install', () => {
  autoUpdater.quitAndInstall();
});

ipcMain.handle('get-update-status', () => {
  return {
    isUpdateAvailable: autoUpdater.updateAvailable,
    isUpdateDownloaded: autoUpdater.updateDownloaded
  };
});

// Carrega configuração na inicialização
const loadConfig = () => {
  try {
    const configPath = path.join(app.getPath('userData'), 'config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.accountsPath) {
        customAccountsPath = config.accountsPath;
      }
      if (config.leaguePath) {
        customLeaguePath = config.leaguePath;
      }
    }
  } catch (error) {
    console.error('Erro ao carregar configuração:', error);
  }
};

app.whenReady().then(() => {
  loadConfig();
  createWindow();
  
  // Check for updates after app is ready
  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify();
  }, 3000); // Wait 3 seconds before checking for updates
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

const championMap = {
  1: "Annie", 2: "Olaf", 3: "Galio", 4: "Twisted Fate", 5: "Xin Zhao",
  6: "Urgot", 7: "LeBlanc", 8: "Vladimir", 9: "Fiddlesticks", 10: "Kayle",
  11: "Master Yi", 12: "Alistar", 13: "Ryze", 14: "Sion", 15: "Sivir",
  16: "Soraka", 17: "Teemo", 18: "Tristana", 19: "Warwick", 20: "Nunu",
  21: "Miss Fortune", 22: "Ashe", 23: "Tryndamere", 24: "Jax", 25: "Morgana",
  26: "Zilean", 27: "Singed", 28: "Evelynn", 29: "Twitch", 30: "Karthus",
  31: "Cho'Gath", 32: "Amumu", 33: "Rammus", 34: "Anivia", 35: "Shaco",
  36: "Dr. Mundo", 37: "Sona", 38: "Kassadin", 39: "Irelia", 40: "Janna",
  41: "Gangplank", 42: "Corki", 43: "Karma", 44: "Taric", 45: "Veigar",
  48: "Trundle", 50: "Swain", 51: "Caitlyn", 53: "Blitzcrank", 54: "Malphite",
  55: "Katarina", 56: "Nocturne", 57: "Maokai", 58: "Renekton", 59: "Jarvan IV",
  60: "Elise", 61: "Orianna", 62: "Wukong", 63: "Brand", 64: "Lee Sin",
  67: "Vayne", 68: "Rumble", 69: "Cassiopeia", 72: "Skarner", 74: "Heimerdinger",
  75: "Nasus", 76: "Nidalee", 77: "Udyr", 78: "Poppy", 79: "Gragas",
  80: "Pantheon", 81: "Ezreal", 82: "Mordekaiser", 83: "Yorick", 84: "Akali",
  85: "Kennen", 86: "Garen", 89: "Leona", 90: "Malzahar", 91: "Talon",
  92: "Riven", 96: "Kog'Maw", 98: "Shen", 99: "Lux", 101: "Xerath",
  102: "Shyvana", 103: "Ahri", 104: "Graves", 105: "Fizz", 106: "Volibear",
  107: "Rengar", 110: "Varus", 111: "Nautilus", 112: "Viktor", 113: "Sejuani",
  114: "Fiora", 115: "Ziggs", 117: "Lulu", 119: "Draven", 120: "Hecarim",
  121: "Kha'Zix", 122: "Darius", 123: "Darius", 126: "Jayce", 127: "Lissandra",
  131: "Diana", 133: "Quinn", 134: "Syndra", 136: "Aurelion Sol", 141: "Kayn",
  142: "Zoe", 143: "Zyra", 145: "Kai'Sa", 147: "Seraphine", 150: "Gnar",
  154: "Zac", 157: "Yasuo", 161: "Vel'Koz", 163: "Taliyah", 164: "Camille",
  166: "Akshan", 200: "Bel'Veth", 201: "Braum", 202: "Jhin", 203: "Kindred",
  221: "Zeri", 222: "Jinx", 223: "Tahm Kench", 234: "Viego", 235: "Senna",
  236: "Lucian", 238: "Zed", 240: "Kled", 245: "Ekko", 246: "Qiyana",
  254: "Vi", 266: "Aatrox", 267: "Nami", 268: "Azir", 412: "Thresh",
  420: "Illaoi", 421: "Rek'Sai", 427: "Ivern", 429: "Kalista", 432: "Bard",
  497: "Rakan", 498: "Xayah", 516: "Ornn", 517: "Sylas", 518: "Neeko",
  523: "Aphelios", 526: "Rell", 555: "Pyke", 711: "Vex", 777: "Yone",
  875: "Sett", 876: "Lillia", 887: "Gwen", 888: "Renata Glasc", 895: "Nilah",
  897: "K'Sante", 901: "Smolder", 910: "Hwei", 950: "Naafiri"
};
