import React, { useState } from "react";
import { BiX, BiCopy, BiCheck, BiShow, BiHide } from "react-icons/bi";
import { BsInfoCircleFill } from "react-icons/bs";
import { AccountData } from "../utils/accountsManager";

interface AccountDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: AccountData | null;
}

const AccountDetailsModal: React.FC<AccountDetailsModalProps> = ({ isOpen, onClose, account }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 5000);
    } catch (error) {
      console.error("Erro ao copiar:", error);
      // Fallback para navegadores mais antigos
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 5000);
    }
  };

  if (!isOpen || !account) return null;

  return (
    <div className="fixed inset-0 bg-background/90 flex items-center justify-center z-50">
      <div className="bg-secondary border rounded-lg p-6 w-full max-w-md mx-4 shadow-xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute bg-background/50 rounded-md top-3 right-3 text-xl p-1 text-foreground hover:text-primary transition-colors hover:cursor-pointer hover:bg-red-600"
          aria-label="Fechar modal"
        >
          <BiX />
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="text-center">
            <div className="flex flex-row gap-1 items-center">
              <p className="text-lg font-semibold text-primary">{account.summonerName}</p>
              <p className="text-sm opacity-50">#{account.tagline}</p>
            </div>

          <p className="text-xs text-foreground mt-1 opacity-70">{account.region} | {account.elo} </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex flex-col mb-2 gap-1">
              <label className="block text-sm font-bold text-primary">Username</label>
              <p className="flex flex-row items-center gap-1 text-xs text-foreground opacity-50">
                <BsInfoCircleFill />
                Click to copy the username
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={account.username}
                readOnly
                className="flex-1 p-3 bg-background/20 text-sm rounded-sm text-foreground cursor-pointer"
                onClick={() => copyToClipboard(account.username, "username")}
              />
              <button
                onClick={() => copyToClipboard(account.username, "username")}
                className="px-4 py-3 bg-primary/20 text-primary rounded-sm hover:bg-primary/30 transition-colors flex items-center gap-2 hover:cursor-pointer"
                title="Copiar username"
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
                Click to copy the password
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type={showPassword ? "text" : "password"}
                value={account.password}
                readOnly
                className="flex-1 p-3 bg-background/20 text-sm rounded-sm text-foreground cursor-pointer"
                onClick={() => copyToClipboard(account.password, "password")}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="px-4 py-3 bg-background/20 text-foreground rounded-sm hover:bg-background/30 transition-colors flex items-center gap-2 hover:cursor-pointer"
                title={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <BiHide className="w-4 h-4" /> : <BiShow className="w-4 h-4" />}
              </button>
              <button
                onClick={() => copyToClipboard(account.password, "password")}
                className="px-4 py-3 bg-primary/20 text-primary rounded-sm hover:bg-primary/30 transition-colors flex items-center gap-2 hover:cursor-pointer"
                title="Copiar senha"
              >
                {copiedField === "password" ? (
                  <BiCheck className="w-4 h-4 text-green-500" />
                ) : (
                  <BiCopy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Riot ID */}
          <div>
            <div className="flex flex-col mb-2 gap-1">
              <label className="block text-sm font-bold text-primary">Riot ID</label>
              <p className="flex flex-row items-center gap-1 text-xs text-foreground opacity-50">
                <BsInfoCircleFill />
                Click to copy the full Riot ID
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={`${account.summonerName}#${account.tagline}`}
                readOnly
                className="flex-1 p-3 bg-background/20 text-sm rounded-sm text-foreground cursor-pointer"
                onClick={() => copyToClipboard(`${account.summonerName}#${account.tagline}`, "riotId")}
              />
              <button
                onClick={() => copyToClipboard(`${account.summonerName}#${account.tagline}`, "riotId")}
                className="px-4 py-3 bg-primary/20 text-primary rounded-sm hover:bg-primary/30 transition-colors flex items-center gap-2 hover:cursor-pointer"
                title="Copiar Riot ID"
              >
                {copiedField === "riotId" ? (
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
        )}
      </div>
    </div>
  );
};

export default AccountDetailsModal;
