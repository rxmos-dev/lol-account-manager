import React, { useState, useEffect } from "react";
import { BiCheck, BiX, BiFolder, BiRefresh, BiPlay, BiDownload } from "react-icons/bi";
import { BsInfoCircleFill } from "react-icons/bs";
import { PiGearBold } from "react-icons/pi";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [accountsPath, setAccountsPath] = useState("");
  const [leaguePath, setLeaguePath] = useState("");
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(false);
  
  // Auto-updater states
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isUpdateDownloaded, setIsUpdateDownloaded] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Carrega o caminho atual do arquivo de contas
      loadCurrentPath();
      loadLeaguePath();
      
      // Setup auto-updater event listeners
      try {
        const { ipcRenderer } = window.require("electron");
        
        const handleUpdateAvailable = () => {
          setIsUpdateAvailable(true);
        };

        const handleUpdateNotAvailable = () => {
          setIsUpdateAvailable(false);
        };

        const handleDownloadProgress = (event: any, progress: any) => {
          setDownloadProgress(progress.percent);
        };

        const handleUpdateDownloaded = () => {
          setIsUpdateDownloaded(true);
        };

        const handleUpdaterError = (event: any, error: any) => {
          setUpdateError(error.message || 'Erro no auto-updater');
        };

        // Register listeners
        ipcRenderer.on('update-available', handleUpdateAvailable);
        ipcRenderer.on('update-not-available', handleUpdateNotAvailable);
        ipcRenderer.on('download-progress', handleDownloadProgress);
        ipcRenderer.on('update-downloaded', handleUpdateDownloaded);
        ipcRenderer.on('updater-error', handleUpdaterError);

        // Cleanup function
        return () => {
          ipcRenderer.removeListener('update-available', handleUpdateAvailable);
          ipcRenderer.removeListener('update-not-available', handleUpdateNotAvailable);
          ipcRenderer.removeListener('download-progress', handleDownloadProgress);
          ipcRenderer.removeListener('update-downloaded', handleUpdateDownloaded);
          ipcRenderer.removeListener('updater-error', handleUpdaterError);
        };
      } catch (error) {
        console.error("Erro ao configurar listeners do updater:", error);
      }
    }
  }, [isOpen]);

  const loadCurrentPath = async () => {
    try {
      const { ipcRenderer } = window.require("electron");
      const currentPath = await ipcRenderer.invoke("get-accounts-path");
      setAccountsPath(currentPath || "");
    } catch (error) {
      console.error("Erro ao carregar caminho atual:", error);
    }
  };

  const loadLeaguePath = async () => {
    try {
      const { ipcRenderer } = window.require("electron");
      const currentPath = await ipcRenderer.invoke("get-league-path");
      setLeaguePath(currentPath || "C:\\Riot Games\\Riot Client\\RiotClientServices.exe");
    } catch (error) {
      console.error("Erro ao carregar caminho do League:", error);
      // Set default path if error occurs
      setLeaguePath("C:\\Riot Games\\Riot Client\\RiotClientServices.exe");
    }
  };

  const handleSelectFolder = async () => {
    try {
      const { ipcRenderer } = window.require("electron");
      const result = await ipcRenderer.invoke("select-accounts-folder");

      if (result && !result.canceled) {
        setAccountsPath(result.filePath);
      }
    } catch (error) {
      console.error("Erro ao selecionar pasta:", error);
    }
  };

  const handleSelectLeagueExe = async () => {
    try {
      const { ipcRenderer } = window.require("electron");
      const result = await ipcRenderer.invoke("select-league-exe");

      if (result && !result.canceled) {
        setLeaguePath(result.filePath);
      }
    } catch (error) {
      console.error("Erro ao selecionar executável do League:", error);
    }
  };

  const handlePlayLeague = async () => {
    try {
      const { ipcRenderer } = window.require("electron");
      const result = await ipcRenderer.invoke("launch-league", leaguePath);

      if (!result.success) {
        alert(`Erro ao abrir League of Legends: ${result.error}`);
      }
    } catch (error) {
      console.error("Erro ao abrir League of Legends:", error);
      alert("Erro ao abrir League of Legends");
    }
  };

  const handleSave = async () => {
    try {
      const { ipcRenderer } = window.require("electron");
      const accountsResult = await ipcRenderer.invoke("set-accounts-path", accountsPath);
      const leagueResult = await ipcRenderer.invoke("set-league-path", leaguePath);

      if (accountsResult.success && leagueResult.success) {
        alert("Configurações salvas com sucesso!");
        onClose();
      } else {
        const errors = [];
        if (!accountsResult.success) errors.push(`Accounts: ${accountsResult.error}`);
        if (!leagueResult.success) errors.push(`League: ${leagueResult.error}`);
        alert(`Erro ao salvar: ${errors.join(", ")}`);
      }
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      alert("Erro ao salvar configurações");
    }
  };

  const handleCheckForUpdates = async () => {
    setIsCheckingUpdate(true);
    setUpdateError(null);
    try {
      const { ipcRenderer } = window.require("electron");
      const result = await ipcRenderer.invoke("check-for-updates");
      
      if (result.success) {
        // Update status will be handled by event listeners
      } else {
        setUpdateError(result.error);
      }
    } catch (error) {
      console.error("Erro ao verificar atualizações:", error);
      setUpdateError("Erro ao verificar atualizações");
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const handleDownloadUpdate = async () => {
    try {
      const { ipcRenderer } = window.require("electron");
      await ipcRenderer.invoke("download-update");
    } catch (error) {
      console.error("Erro ao baixar atualização:", error);
      setUpdateError("Erro ao baixar atualização");
    }
  };

  const handleInstallUpdate = () => {
    try {
      const { ipcRenderer } = window.require("electron");
      ipcRenderer.invoke("quit-and-install");
    } catch (error) {
      console.error("Erro ao instalar atualização:", error);
      setUpdateError("Erro ao instalar atualização");
    }
  };

  const handleReset = async () => {
    try {
      const { ipcRenderer } = window.require("electron");
      const result = await ipcRenderer.invoke("reset-accounts-path");

      if (result.success) {
        setAccountsPath(result.defaultPath);
        alert("Caminho resetado para o padrão!");
      }
    } catch (error) {
      console.error("Erro ao resetar caminho:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/90 flex items-center justify-center z-50">
      <div className="bg-secondary border rounded-lg p-6 w-full max-w-lg mx-4 shadow-xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute bg-background/50 rounded-md top-3 right-3 text-xl p-1 text-foreground hover:text-primary transition-colors hover:cursor-pointer hover:bg-red-600"
          aria-label="Fechar modal"
        >
          <BiX />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <PiGearBold className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-primary">Settings</h2>
        </div>

        <div className="space-y-6">
          <>
            <div className="flex flex-col mb-5 gap-1.5">
              <label className="block text-sm font-bold text-primary">League of Legends Executable Path</label>
              <p className="flex flex-row items-center gap-1 text-xs text-foreground opacity-30">
                <BsInfoCircleFill className="w-3 h-3" />
                Path to RiotClientServices.exe to launch League of Legends.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={leaguePath}
                onChange={(e) => setLeaguePath(e.target.value)}
                className="flex-1 p-3 bg-background/20 text-sm rounded-sm text-foreground"
                placeholder="C:\Riot Games\Riot Client\RiotClientServices.exe"
              />

              <button
                type="button"
                onClick={handleSelectLeagueExe}
                className="px-3 py-2 bg-primary/20 text-primary rounded-sm hover:bg-primary/30 transition-colors flex items-center gap-2 hover:cursor-pointer"
                title="Select League executable"
              >
                <BiFolder className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={handlePlayLeague}
                className="px-3 py-2 bg-green-600/20 text-green-400 rounded-sm hover:bg-green-600/30 transition-colors flex items-center gap-2 hover:cursor-pointer"
                title="Launch League of Legends"
              >
                <BiPlay className="w-5 h-5" />
              </button>
            </div>
          </>

          <>
            <div className="flex flex-col mb-5 gap-1.5">
              <label className="block text-sm font-bold text-primary">Folder to save accounts</label>
              <p className="flex flex-row items-center gap-1 text-xs text-foreground opacity-30">
                <BsInfoCircleFill className="w-3 h-3" />
                Keep calm all the passwords are encrypted and stored securely.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={accountsPath}
                onChange={(e) => setAccountsPath(e.target.value)}
                className="flex-1 p-3 bg-background/20 text-sm rounded-sm text-foreground"
                placeholder="Caminho do arquivo accounts.json"
              />

              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 bg-primary/20 text-primary rounded-sm hover:bg-primary/30 transition-colors flex items-center gap-2 hover:cursor-pointer"
              >
                <BiRefresh className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={handleSelectFolder}
                className="px-3 py-2 bg-primary/20 text-primary rounded-sm hover:bg-primary/30 transition-colors flex items-center gap-2 hover:cursor-pointer"
                title="Selecionar pasta"
              >
                <BiFolder className="w-5 h-5" />
              </button>
            </div>
          </>

          <>
            <div className="flex flex-col mb-5 gap-1.5">
              <label className="block text-sm font-bold text-primary">Do you want to enable automatic updates?</label>
              <p className="flex flex-row items-center gap-1 text-xs text-foreground opacity-30">
                <BsInfoCircleFill className="w-3 h-3" />
                All the updates will be downloaded automatically.
              </p>
            </div>

            <div className="flex flex-row items-center gap-2">
              <input
                type="checkbox"
                checked={autoUpdateEnabled}
                onChange={(e) => setAutoUpdateEnabled(e.target.checked)}
                className="h-5 w-5 text-primary border-foreground/30 rounded-md focus:ring-0 hover:cursor-pointer transition-all"
              />
              <span className="text-xs text-foreground">Enable Automatic Updates</span>
            </div>
          </>

          <>
            <div className="flex flex-col mb-5 gap-1.5">
              <label className="block text-sm font-bold text-primary">Update Management</label>
              <p className="flex flex-row items-center gap-1 text-xs text-foreground opacity-30">
                <BsInfoCircleFill className="w-3 h-3" />
                Check for updates manually or manage pending updates.
              </p>
            </div>

            <div className="space-y-3">
              {updateError && (
                <div className="p-2 bg-red-600/20 text-red-400 rounded-sm text-xs">
                  {updateError}
                </div>
              )}

              {isUpdateAvailable && !isUpdateDownloaded && (
                <div className="p-2 bg-blue-600/20 text-blue-400 rounded-sm text-xs">
                  Update available! Click download to get the latest version.
                </div>
              )}

              {isUpdateDownloaded && (
                <div className="p-2 bg-green-600/20 text-green-400 rounded-sm text-xs">
                  Update downloaded! Click install to apply the update.
                </div>
              )}

              {downloadProgress > 0 && downloadProgress < 100 && (
                <div className="space-y-1">
                  <div className="text-xs text-foreground">Downloading update: {Math.round(downloadProgress)}%</div>
                  <div className="w-full bg-background/20 rounded-sm h-2">
                    <div 
                      className="h-2 bg-primary rounded-sm transition-all duration-300"
                      style={{ width: `${downloadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCheckForUpdates}
                  disabled={isCheckingUpdate}
                  className="flex-1 px-3 py-2 bg-primary/20 text-primary rounded-sm hover:bg-primary/30 transition-colors flex items-center justify-center gap-2 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <BiRefresh className={`w-4 h-4 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                  {isCheckingUpdate ? 'Checking...' : 'Check for Updates'}
                </button>

                {isUpdateAvailable && !isUpdateDownloaded && (
                  <button
                    type="button"
                    onClick={handleDownloadUpdate}
                    className="flex-1 px-3 py-2 bg-blue-600/20 text-blue-400 rounded-sm hover:bg-blue-600/30 transition-colors flex items-center justify-center gap-2 hover:cursor-pointer"
                  >
                    <BiDownload className="w-4 h-4" />
                    Download Update
                  </button>
                )}

                {isUpdateDownloaded && (
                  <button
                    type="button"
                    onClick={handleInstallUpdate}
                    className="flex-1 px-3 py-2 bg-green-600/20 text-green-400 rounded-sm hover:bg-green-600/30 transition-colors flex items-center justify-center gap-2 hover:cursor-pointer"
                  >
                    <BiCheck className="w-4 h-4" />
                    Install & Restart
                  </button>
                )}
              </div>
            </div>
          </>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 flex flex-row justify-center items-center py-3 bg-primary text-background rounded-sm hover:opacity-70 hover:cursor-pointer transition-all"
            >
              <BiCheck />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
