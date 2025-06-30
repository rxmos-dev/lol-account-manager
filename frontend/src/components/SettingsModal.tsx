import React, { useState, useEffect } from "react";
import { BiCheck, BiX, BiFolder, BiRefresh } from "react-icons/bi";
import { BsInfoCircleFill } from "react-icons/bs";
import { PiGearBold } from "react-icons/pi";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [accountsPath, setAccountsPath] = useState("");
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Verifica se está rodando no Electron
    const electronCheck = window && window.process && (window.process as any).type;
    setIsElectron(!!electronCheck);

    if (electronCheck) {
      // Carrega o caminho atual do arquivo de contas
      loadCurrentPath();
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

  const handleSave = async () => {
    try {
      if (isElectron) {
        const { ipcRenderer } = window.require("electron");
        const result = await ipcRenderer.invoke("set-accounts-path", accountsPath);

        if (result.success) {
          alert("Configurações salvas com sucesso!");
          onClose();
        } else {
          alert(`Erro ao salvar: ${result.error}`);
        }
      }
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      alert("Erro ao salvar configurações");
    }
  };

  const handleReset = async () => {
    try {
      if (isElectron) {
        const { ipcRenderer } = window.require("electron");
        const result = await ipcRenderer.invoke("reset-accounts-path");

        if (result.success) {
          setAccountsPath(result.defaultPath);
          alert("Caminho resetado para o padrão!");
        }
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
          <div>
            <div className="flex flex-col mb-3 gap-1.5">
              <label className="block text-sm font-bold text-primary">Folder to save accounts.json</label>
              <p className="flex flex-row items-center gap-1 text-xs text-foreground opacity-50">
                <BsInfoCircleFill />
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
                readOnly={!isElectron}
              />

              {isElectron && (
                <>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3 py-2 bg-primary/20 text-primary rounded-sm hover:bg-primary/30 transition-colors flex items-center gap-2 hover:cursor-pointer"
                    disabled={!isElectron}
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
                </>
              )}
            </div>
          </div>

          {!isElectron && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-500 text-sm">
                <BsInfoCircleFill className="inline mr-2" />
                Path settings are only available in the Electron version
              </p>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 flex flex-row justify-center items-center py-3 bg-primary text-background rounded-sm hover:opacity-70 hover:cursor-pointer transition-all"
              disabled={!isElectron}
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
