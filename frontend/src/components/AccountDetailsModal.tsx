import React, { useState } from "react";
import { BiX, BiCopy, BiCheck, BiShow, BiHide, BiTrash, BiRefresh } from "react-icons/bi";
import { BsInfoCircleFill } from "react-icons/bs";
import { AccountData } from "../utils/accountsManager";
import { formatEloData } from "../utils/gameUtils";
import { FaPlay } from "react-icons/fa";
import { CgSpinner } from "react-icons/cg";
import { FiMoreHorizontal } from "react-icons/fi";

interface AccountDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: AccountData | null;
  onSave?: (updatedAccount: AccountData) => void;
  onDelete?: (accountToDelete: AccountData) => void;
  onRefresh?: (accountToRefresh: AccountData) => void;
}

const AccountDetailsModal: React.FC<AccountDetailsModalProps> = ({
  isOpen,
  onClose,
  account,
  onSave,
  onDelete,
  onRefresh,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [editableAccount, setEditableAccount] = useState<AccountData | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [leaguePath, setLeaguePath] = useState("");
  const [isLaunching, setIsLaunching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  const handlePlayLeague = async () => {
    setIsLaunching(true);
    try {
      const { ipcRenderer } = window.require("electron");
      const result = await ipcRenderer.invoke("launch-league", leaguePath);

      if (!result.success) {
        alert(`Erro ao abrir League of Legends: ${result.error}`);
      }
    } catch (error) {
      console.error("Erro ao abrir League of Legends:", error);
      alert("Erro ao abrir League of Legends");
    } finally {
      setTimeout(() => {
        setIsLaunching(false);
      }, 3000);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 5000);
  };

  // Inicializa o estado editável quando a conta muda
  React.useEffect(() => {
    if (account) {
      setEditableAccount({ ...account });
      setHasUnsavedChanges(false);
    }

    const loadLeaguePath = async () => {
      try {
        const { ipcRenderer } = window.require("electron");
        const currentPath = await ipcRenderer.invoke("get-league-path");
        setLeaguePath(currentPath || "");
      } catch (error) {
        console.error("Erro ao carregar caminho do League:", error);
      }
    };

    if (isOpen) {
      loadLeaguePath();
    }
  }, [account, isOpen]);

  // Fecha o menu quando clicar fora dele
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showOptionsMenu && !target.closest(".options-menu-container")) {
        setShowOptionsMenu(false);
      }
    };

    if (showOptionsMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOptionsMenu]);

  const handleInputChange = (field: keyof AccountData, value: string) => {
    if (editableAccount) {
      setEditableAccount({ ...editableAccount, [field]: value });
      setHasUnsavedChanges(true);
    }
  };

  const handleSave = () => {
    if (editableAccount && onSave) {
      onSave(editableAccount);
      setHasUnsavedChanges(false);
    }
    onClose();
  };

  const handleDelete = () => {
    if (account && onDelete) {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete the account "${account.summonerName}#${account.tagline}"? This action cannot be undone.`
      );
      if (confirmDelete) {
        onDelete(account);
        onClose();
      }
    }
  };

  const handleRefresh = async () => {
    if (!account || !onRefresh) return;

    setIsRefreshing(true);
    try {
      onRefresh(account);
    } catch (error) {
      console.error("Erro ao atualizar dados da conta:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm("You have unsaved changes. Are you sure you want to close without saving?");
      if (!confirm) return;
    }
    setHasUnsavedChanges(false);
    onClose();
  };

  if (!isOpen || !account || !editableAccount) return null;

  return (
    <div className="fixed inset-0 bg-background/90 flex items-center justify-center z-50">
      <div className="bg-secondary border rounded-lg p-6 w-full max-w-md mx-4 shadow-xl relative">
        {hasUnsavedChanges && (
          <div className="absolute top-0 left-0 right-0 bg-yellow-500/20 border-b border-yellow-500/30 rounded-t-lg p-2 text-center">
            <p className="text-yellow-600 text-xs font-medium">⚠️ Unsaved changes - Click save to keep your changes</p>
          </div>
        )}
        <div className={`flex items-center justify-end gap-2 ${hasUnsavedChanges ? "mt-8" : ""}`}>
          <div className="relative options-menu-container">
            <button
              type="button"
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className="rounded-md p-2 bg-sidebar transition-colors hover:cursor-pointer hover:bg-background"
              aria-label="Options menu"
              title="Menu de opções"
            >
              <FiMoreHorizontal />
            </button>

            {showOptionsMenu && (
              <div className="absolute left-0 top-full mt-1 bg-sidebar rounded-sm shadow-lg z-10 min-w-[120px]">
                <button
                  type="button"
                  onClick={() => {
                    handleRefresh();
                    setShowOptionsMenu(false);
                  }}
                  disabled={isRefreshing}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-t-lg hover:cursor-pointer"
                >
                  <BiRefresh className={isRefreshing ? "animate-spin" : ""} />
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDelete();
                    setShowOptionsMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-red-400 hover:text-red-600 hover:bg-background transition-colors rounded-b-lg hover:cursor-pointer"
                >
                  <BiTrash />
                  Delete
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="ml-auto bg-background/50 rounded-md top-3 right-3 text-xl p-1 text-foreground hover:text-primary transition-colors hover:cursor-pointer hover:bg-red-600"
            aria-label="Close modal"
          >
            <BiX />
          </button>
        </div>
        <div className="text-start flex flex-col gap-3 my-4">
          <div className="flex flex-row gap-2 items-center border-b border-foreground/10 pb-5">
            <div className="flex flex-col">
              <div className="flex flex-row items-baseline gap-1">
                <h1 className="text-xl font-bold">{account.summonerName}</h1>
                <p className="text-[10px] text-foreground opacity-50">#{account.tagline}</p>
              </div>
              {account.lastUpdated && (
                <p className="text-[10px] text-foreground opacity-30">
                  Última atualização: {new Date(account.lastUpdated).toLocaleString("pt-BR")}
                </p>
              )}
            </div>

            <p className="text-xs text-foreground opacity-50 ml-auto">
              {(() => {
                const eloInfo = formatEloData(editableAccount.eloData);
                return (
                  <>
                    {eloInfo.tier === "UNRANKED" ? "UNRANKED" : `${eloInfo.tier} ${eloInfo.rank}`}
                    {eloInfo.lp > 0 && ` ${eloInfo.lp} LP`}
                  </>
                );
              })()}
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {/* Riot ID */}
          <div>
            <div className="flex flex-col mb-2 gap-1">
              <label className="block text-sm font-bold text-primary">Riot ID</label>
              <p className="flex flex-row items-center gap-1 text-xs text-foreground opacity-50">
                <BsInfoCircleFill />
                Edit the summoner name and tagline or use the copy button
              </p>
            </div>
            <div className="flex gap-2 w-full">
              <div className="flex-1 flex gap-1 items-center p-3 bg-background/20 rounded-sm border border-transparent focus-within:border-primary/50">
                <select
                  value={editableAccount.region}
                  onChange={(e) => handleInputChange("region", e.target.value)}
                  className="ml-auto text-xs text-foreground bg-secondary rounded-sm"
                >
                  <option value="BR1">BR</option>
                  <option value="NA1">NA</option>
                  <option value="EUW1">EUW</option>
                  <option value="EUNE1">EUNE</option>
                  <option value="KR">KR</option>
                  <option value="JP1">JP</option>
                  <option value="OC1">OCE</option>
                  <option value="TR1">TR</option>
                  <option value="RU">RU</option>
                  <option value="LA1">LAN</option>
                  <option value="LA2">LAS</option>
                </select>
                <input
                  type="text"
                  value={editableAccount.summonerName}
                  onChange={(e) => handleInputChange("summonerName", e.target.value)}
                  className="bg-transparent text-sm text-foreground text-center truncate focus:outline-none"
                  placeholder="Summoner Name"
                />
                <span className="text-sm text-foreground opacity-50">#</span>
                <input
                  type="text"
                  value={editableAccount.tagline}
                  onChange={(e) => handleInputChange("tagline", e.target.value)}
                  className="w-10 bg-transparent text-sm text-foreground focus:outline-none"
                  placeholder="TAG"
                />
              </div>
              <button
                onClick={() => copyToClipboard(`${editableAccount.summonerName}#${editableAccount.tagline}`, "riotId")}
                className="h-[46px] px-4 bg-primary/20 text-primary rounded-sm hover:bg-primary/30 transition-colors flex items-center gap-2 hover:cursor-pointer"
                title="Copy Riot ID"
              >
                {copiedField === "riotId" ? (
                  <BiCheck className="w-4 h-4 text-green-500" />
                ) : (
                  <BiCopy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <div className="flex flex-col mb-2 gap-1">
              <label className="block text-sm font-bold text-primary">Username</label>
              <p className="flex flex-row items-center gap-1 text-xs text-foreground opacity-50">
                <BsInfoCircleFill />
                Edit the username or use the copy button
              </p>
            </div>
            <div className="flex gap-2 justify-between items-center">
              <input
                type="text"
                value={editableAccount.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                className="flex-1 p-3 bg-background/20 text-sm rounded-sm text-foreground border border-transparent focus:border-primary/50 focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(editableAccount.username, "username")}
                className="h-[46px] px-4 bg-primary/20 text-primary rounded-sm hover:bg-primary/30 transition-colors flex items-center gap-2 hover:cursor-pointer"
                title="Copy username"
              >
                {copiedField === "username" ? (
                  <BiCheck className="w-4 h-4 text-green-500" />
                ) : (
                  <BiCopy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex flex-col mb-2 gap-1">
              <label className="block text-sm font-bold text-primary">Password</label>
              <p className="flex flex-row items-center gap-1 text-xs text-foreground opacity-50">
                <BsInfoCircleFill />
                Edit the password or use the copy button
              </p>
            </div>
            <div className="flex gap-2 justify-between items-center">
              <input
                type={showPassword ? "text" : "password"}
                value={editableAccount.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="flex-1 p-3 bg-background/20 text-sm rounded-sm text-foreground border border-transparent focus:border-primary/50 focus:outline-none"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="h-[46px] px-4 bg-background/20 text-foreground rounded-sm hover:bg-background/30 transition-colors flex items-center gap-2 hover:cursor-pointer"
                title={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <BiHide className="w-4 h-4" /> : <BiShow className="w-4 h-4" />}
              </button>
              <button
                onClick={() => copyToClipboard(editableAccount.password, "password")}
                className="h-[46px] px-4 bg-primary/20 text-primary rounded-sm hover:bg-primary/30 transition-colors flex items-center gap-2 hover:cursor-pointer"
                title="Copy senha"
              >
                {copiedField === "password" ? (
                  <BiCheck className="w-4 h-4 text-green-500" />
                ) : (
                  <BiCopy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
        {copiedField && (
          <div className="mt-3 p-2 bg-green-500/10 border border-green-500/30 rounded-sm text-center">
            <p className="text-green-500 text-sm">
              ✓ {copiedField === "username" ? "Username" : copiedField === "password" ? "Password" : "Riot ID"} saved to
              clipboard!
            </p>
          </div>
        )}{" "}
        <div>
          <button
            onClick={hasUnsavedChanges ? handleSave : handlePlayLeague}
            disabled={isLaunching}
            className={`w-full mt-8 flex justify-center py-3 rounded-sm transition-colors text-background hover:cursor-pointer ${
              hasUnsavedChanges ? "bg-foreground hover:bg-primary/80" : "bg-green-700 hover:opacity-85 text-foreground"
            } ${isLaunching ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span className="text-xs">
              {hasUnsavedChanges ? (
                "Save Changes"
              ) : isLaunching ? (
                <div className="flex items-center gap-2 flex-row">
                  <CgSpinner className="animate-spin h-4 w-4" />
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-row">
                  <FaPlay />
                  <p>PLAY</p>
                </div>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountDetailsModal;
