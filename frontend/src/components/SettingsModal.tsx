import React, { useState, useEffect } from "react";
import { BiCheck, BiX, BiFolder, BiRefresh, BiPlay, BiDownload, BiInfoCircle, BiMedal, BiChevronDown } from "react-icons/bi";
import { BsEyeFill } from "react-icons/bs";
import { LuFolderSearch } from "react-icons/lu";
import { PiGearBold } from "react-icons/pi";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [accountsPath, setAccountsPath] = useState("");
  const [leaguePath, setLeaguePath] = useState("");
  const [autoUpdateEnabled] = useState(true); // Sempre habilitado

  // Auto-updater states
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isUpdateDownloaded, setIsUpdateDownloaded] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [isDownloadingUpdate, setIsDownloadingUpdate] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Carrega o caminho atual do arquivo de contas
      loadCurrentPath();
      loadLeaguePath();

      // Setup auto-updater event listeners
      try {
        const { ipcRenderer } = window.electron;

        const handleUpdateAvailable = () => {
          setIsUpdateAvailable(true);
        };

        const handleUpdateNotAvailable = () => {
          setIsUpdateAvailable(false);
        };

        const handleDownloadProgress = (_event: any, progress: any) => {
          setDownloadProgress(progress.percent);
          if (!isDownloadingUpdate) {
            setIsDownloadingUpdate(true);
          }
        };

        const handleUpdateDownloaded = () => {
          setIsUpdateDownloaded(true);
          setIsDownloadingUpdate(false);
          setDownloadProgress(100);
        };

        const handleUpdaterError = (_event: any, error: any) => {
          setUpdateError(error.message || "Erro no auto-updater");
        };

        // Register listeners
        ipcRenderer.on("update-available", handleUpdateAvailable);
        ipcRenderer.on("update-not-available", handleUpdateNotAvailable);
        ipcRenderer.on("download-progress", handleDownloadProgress);
        ipcRenderer.on("update-downloaded", handleUpdateDownloaded);
        ipcRenderer.on("updater-error", handleUpdaterError);

        // Cleanup function
        return () => {
          ipcRenderer.removeListener("update-available", handleUpdateAvailable);
          ipcRenderer.removeListener("update-not-available", handleUpdateNotAvailable);
          ipcRenderer.removeListener("download-progress", handleDownloadProgress);
          ipcRenderer.removeListener("update-downloaded", handleUpdateDownloaded);
          ipcRenderer.removeListener("updater-error", handleUpdaterError);
        };
      } catch (error) {
        console.error("Erro ao configurar listeners do updater:", error);
      }
    }
  }, [isOpen]);

  const loadCurrentPath = async () => {
    try {
      const { ipcRenderer } = window.electron;
      const currentPath = await ipcRenderer.invoke("get-accounts-path");
      setAccountsPath(currentPath || "");

      // Se não há caminho customizado definido, mostra o caminho padrão onde as contas estão
      if (!currentPath) {
        // Opcional: pode-se adicionar uma lógica aqui se necessário
      }
    } catch (error) {
      console.error("Erro ao carregar caminho atual:", error);
    }
  };

  const loadLeaguePath = async () => {
    try {
      const { ipcRenderer } = window.electron;
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
      const { ipcRenderer } = window.electron;
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
      const { ipcRenderer } = window.electron;
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
      const { ipcRenderer } = window.electron;
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
      const { ipcRenderer } = window.electron;
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
    setIsDownloadingUpdate(false);
    setDownloadProgress(0);
    setIsUpdateAvailable(false);
    setIsUpdateDownloaded(false);
    try {
      const { ipcRenderer } = window.electron;
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
    setIsDownloadingUpdate(true);
    setUpdateError(null);
    setDownloadProgress(0);
    try {
      const { ipcRenderer } = window.electron;
      await ipcRenderer.invoke("download-update");
    } catch (error) {
      console.error("Erro ao baixar atualização:", error);
      setUpdateError("Erro ao baixar atualização");
      setIsDownloadingUpdate(false);
    }
  };

  const handleInstallUpdate = () => {
    try {
      const { ipcRenderer } = window.electron;
      ipcRenderer.invoke("quit-and-install");
    } catch (error) {
      console.error("Erro ao instalar atualização:", error);
      setUpdateError("Erro ao instalar atualização");
    }
  };

  const handleOpenAccountsFolder = async () => {
    try {
      const { ipcRenderer } = window.electron;
      const result = await ipcRenderer.invoke("open-accounts-folder");

      if (!result.success) {
        alert(`Erro ao abrir pasta: ${result.error}`);
      }
    } catch (error) {
      console.error("Erro ao abrir pasta:", error);
      alert("Erro ao abrir pasta");
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
            <div className="flex flex-col mb-2 gap-1">
              <label className="block text-sm font-bold text-primary">League of Legends Executable Path</label>
              <p className="flex flex-row items-center gap-1 text-[11px] text-foreground opacity-20">
                <BiInfoCircle className="w-3 h-3" />
                Path to RiotClientServices.exe to launch League of Legends.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={leaguePath}
                onChange={(e) => setLeaguePath(e.target.value)}
                className="flex-1 p-2 bg-background/20 text-sm rounded-sm text-foreground"
                placeholder="C:\Riot Games\Riot Client\RiotClientServices.exe"
              />

              <button
                type="button"
                onClick={handleSelectLeagueExe}
                className="px-3 py-2 bg-primary/20 text-primary rounded-sm hover:bg-primary/30 transition-colors flex items-center gap-2 hover:cursor-pointer"
                title="Select League executable"
              >
                <LuFolderSearch className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handlePlayLeague}
                className="px-3 py-2 bg-green-600/20 text-green-400 rounded-sm hover:bg-green-600/30 transition-colors flex items-center gap-2 hover:cursor-pointer"
                title="Launch League of Legends"
              >
                <BiPlay className="w-4 h-4" />
              </button>
            </div>
          </>

          <>
            <div className="flex flex-col mb-2 gap-1">
              <label className="block text-sm font-bold text-primary">Accounts Storage</label>
              <p className="flex flex-row items-center gap-1 text-[11px] text-foreground opacity-20">
                <BiInfoCircle className="w-3 h-3" />
                Keep calm all the passwords are encrypted and stored securely.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={accountsPath}
                  onChange={(e) => setAccountsPath(e.target.value)}
                  className="flex-1 p-2 bg-background/20 text-sm rounded-sm text-foreground"
                  placeholder="Caminho do arquivo accounts.json"
                />

                <button
                  type="button"
                  onClick={handleOpenAccountsFolder}
                  className="px-3 py-2 bg-primary/20 text-primary rounded-sm hover:bg-primary/30 transition-colors flex items-center gap-2 hover:cursor-pointer"
                  title="Abrir pasta do arquivo"
                >
                  <BsEyeFill className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleSelectFolder}
                  className="px-3 py-2 bg-primary/20 text-primary rounded-sm hover:bg-primary/30 transition-colors flex items-center gap-2 hover:cursor-pointer"
                  title="Selecionar pasta"
                >
                  <BiFolder className="w-4 h-4" />
                </button>
              </div>

              <p className="font-normal text-xs flex items-center gap-1 justify-self-center">or you can <BiChevronDown /></p>
              <button className="animate-pulse flex items-center gap-2 text-xs w-full justify-between px-3 py-2 bg-sidebar text-foreground rounded-sm hover:opacity-80 transition-all hover:cursor-pointer">
                <p className="text-[11px] text-primary ">Save your accounts on cloud</p>

                <div className="flex items-center justify-center gap-1 bg-blue-500 px-2 py-1 rounded-sm text-foreground text-[8px]">
                  <BiMedal className="w-2 h-2" />
                  PRO FEATURE
                </div>
              </button>
            </div>
          </>

          <>
            <div className="flex flex-col mb-2 gap-1">
              <label className="block text-sm font-bold text-primary">Automatic Updates</label>
              <p className="flex flex-row items-center gap-1 text-[11px] text-foreground opacity-20">
                <BiInfoCircle className="w-3 h-3" />
                Here you can check for updates, download and install them.
              </p>
            </div>

            <div className="flex flex-row items-center gap-2">
              <input
                type="checkbox"
                checked={autoUpdateEnabled}
                disabled={true}
                className="h-5 w-5 text-primary border-foreground/30 rounded-md focus:ring-0 cursor-not-allowed transition-all opacity-50"
              />
              <span className="text-xs text-foreground">Keep up to date</span>
            </div>

            <div className="space-y-3">
              {updateError && <div className="p-2 bg-red-600/20 text-red-400 rounded-sm text-xs">{updateError}</div>}

              {isUpdateAvailable && !isUpdateDownloaded && !isDownloadingUpdate && (
                <div className="p-2 bg-blue-600/20 text-blue-400 rounded-sm text-xs">
                  Update available! Click download to get the latest version.
                </div>
              )}

              {isDownloadingUpdate && (
                <div className="p-2 bg-yellow-600/20 text-yellow-400 rounded-sm text-xs">
                  Downloading update... Please wait.
                </div>
              )}

              {isUpdateDownloaded && (
                <div className="p-2 bg-green-600/20 text-green-400 rounded-sm text-xs">
                  Update downloaded! Click install to apply the update and restart the application.
                </div>
              )}

              {isDownloadingUpdate && downloadProgress > 0 && (
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
                  className="flex-1 px-3 py-2 bg-primary/20 text-primary rounded-sm hover:bg-primary/30 text-xs transition-colors flex items-center justify-center gap-2 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <BiRefresh className={`w-4 h-4 ${isCheckingUpdate ? "animate-spin" : ""}`} />
                  {isCheckingUpdate ? "Checking..." : "Check for Updates"}
                </button>

                {isUpdateAvailable && !isUpdateDownloaded && (
                  <button
                    type="button"
                    onClick={handleDownloadUpdate}
                    disabled={isDownloadingUpdate}
                    className="flex-1 px-3 py-2 bg-blue-600/20 text-blue-400 rounded-sm hover:bg-blue-600/30 transition-colors flex items-center justify-center gap-2 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDownloadingUpdate ? (
                      <>
                        <BiRefresh className="w-4 h-4 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <BiDownload className="w-4 h-4" />
                        Download Update
                      </>
                    )}
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
