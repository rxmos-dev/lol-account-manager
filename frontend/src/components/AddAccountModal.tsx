import React, { useState } from "react";
import { BiCheck, BiX } from "react-icons/bi";
import { BsInfoCircleFill } from "react-icons/bs";
import { AccountData } from "../utils/accountsManager";
import { LuRefreshCw } from "react-icons/lu";

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (accountData: AccountData) => void;
  isAdding?: boolean;
}

const regions = [
  "BR1",
  "EUN1",
  "EUW1",
  "JP1",
  "KR",
  "LA1",
  "LA2",
  "NA1",
  "OC1",
  "PH2",
  "RU",
  "SG2",
  "TH2",
  "TR1",
  "TW2",
  "VN2",
];

const AddAccountModal: React.FC<AddAccountModalProps> = ({ isOpen, onClose, onSubmit, isAdding }) => {
  const [formData, setFormData] = useState<AccountData>({
    region: "BR1",
    username: "",
    password: "",
    summonerName: "",
    tagline: "",
  });
  const [riotId, setRiotId] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRiotIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRiotId(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Parse Riot ID to extract summoner name and tagline
    const hashIndex = riotId.indexOf("#");
    if (hashIndex === -1) {
      alert("Please use the format: SummonerName#Tagline");
      return;
    }

    const summonerName = riotId.substring(0, hashIndex);
    const tagline = riotId.substring(hashIndex + 1);

    if (!summonerName || !tagline) {
      alert("Please provide both summoner name and tagline in the format: SummonerName#Tagline");
      return;
    }

    const accountData = {
      ...formData,
      summonerName,
      tagline,
    };

    onSubmit(accountData);
    setFormData({
      region: "BR1",
      username: "",
      password: "",
      summonerName: "",
      tagline: "",
    });
    setRiotId("");
    onClose();
  };

  if (!isOpen) return null;

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

        <img
          src="./riot.svg"
          alt="League of Legends Logo"
          className="w-16 h-16 mx-auto mb-4"
        />

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <div className="flex flex-col mb-3 gap-1.5">
              <label className="block text-xs font-bold text-primary">Region</label>
              <p className="flex flex-row items-center gap-1 text-xs text-foreground opacity-50">
                <BsInfoCircleFill />
                For standard regions, we use the format: BR1, EUN1, EUW1, etc.
              </p>
            </div>
            <select
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              className="w-full p-3 bg-background/20 text-sm rounded-sm text-foreground"
              required
            >
              {regions.map((region) => (
                <option
                  key={region}
                  value={region}
                >
                  {region}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex flex-col mb-3 gap-1.5">
              <label className="block text-xs font-bold text-primary">Username</label>
              <p className="flex flex-row items-center gap-1 text-xs text-foreground opacity-50">
                <BsInfoCircleFill />
                This is your League of Legends username.
              </p>
            </div>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full p-2 text-sm rounded-sm bg-background/20 text-foreground"
              required
            />
          </div>

          <div>
            <div className="flex flex-col mb-3 gap-1.5">
              <label className="block text-xs font-bold text-primary">Password</label>
              <p className="flex flex-row items-center gap-1 text-xs text-foreground opacity-50">
                <BsInfoCircleFill />
                All passwords are stored securely and encrypted.
              </p>
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full p-2 text-sm rounded-sm bg-background/20 text-foreground"
              required
            />
          </div>

          <div>
            <div className="flex flex-col mb-3 gap-1.5">
              <label className="block text-xs font-bold text-primary">Riot ID</label>
              <p className="flex flex-row items-center gap-1 text-xs text-foreground opacity-50">
                <BsInfoCircleFill />
                Use in the format: SummonerName#Tagline
              </p>
            </div>
            <input
              type="text"
              value={riotId}
              onChange={handleRiotIdChange}
              className="w-full p-2 rounded-sm bg-background/20 text-foreground"
              required
            />
          </div>

          <div className="flex flex-col-reverse gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 flex flex-row justify-center items-center py-3 bg-primary text-background rounded-sm hover:opacity-70 hover:cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isAdding}
            >
              {isAdding ? <LuRefreshCw className="animate-spin" /> : <BiCheck />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAccountModal;
