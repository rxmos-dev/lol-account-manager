import React from "react";
import { AccountData } from "../utils/accountsManager";
import { formatEloData, getTierBorderColor } from "../App";

interface ListCardProps {
  account: AccountData;
  index: number;
  onClick: (account: AccountData) => void;
  ahriIcon: string | null;
  isLoadingElo: boolean;
}

const ListCard: React.FC<ListCardProps> = ({ account, index, onClick, ahriIcon, isLoadingElo }) => {
  const eloInfo = formatEloData(account.eloData);
  
  return (
    <div
      key={index}
      onClick={() => onClick(account)}
      className={`bg-secondary border-l-4 rounded-lg shadow-md py-3 px-5 w-full flex flex-row items-center justify-between hover:cursor-pointer hover:bg-secondary/80 hover:shadow-lg hover:border-l-0 transition-all ${getTierBorderColor(
        eloInfo.tier
      )}`}
    >
      <div className="flex flex-row items-center gap-6">
        <div className="flex flex-col gap-1">
          <div className="flex flex-row items-baseline gap-1">
            <h3 className="text-xl font-bold text-primary">{account.summonerName}</h3>
            <span className="text-xs opacity-60 bg-secondary/50 rounded">#{account.tagline}</span>
          </div>

          <div className="flex flex-row items-center gap-6 mt-2">
            <div className="flex flex-col">
              <span className="text-[10px] opacity-30 uppercase tracking-wide">Rank</span>
              <span className="text-sm font-semibold">
                {eloInfo.tier === "UNRANKED" ? "UNRANKED" : `${eloInfo.tier} ${eloInfo.rank}`}
                {eloInfo.lp > 0 && ` (${eloInfo.lp} LP)`}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] opacity-30 uppercase tracking-wide">Region</span>
              <span className="text-sm font-semibold">{account.region}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] opacity-30 uppercase tracking-wide">MAIN ROLE</span>
              <span className="text-sm font-semibold">MID</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-row items-center gap-8">
        <div className="flex flex-col items-center">
          <span className="text-xs opacity-30 uppercase tracking-wide mb-2">Top Champions</span>
          <div className="flex flex-row items-center gap-2">
            <div className="flex flex-col items-center text-xs gap-1">
              <img
                src={ahriIcon}
                alt="Ahri Icon"
                className="w-10 h-10 rounded-lg shadow-sm"
              />
              <span className="font-bold text-green-400">55%</span>
            </div>
            <div className="flex flex-col items-center text-xs gap-1">
              <img
                src={ahriIcon}
                alt="Ahri Icon"
                className="w-10 h-10 rounded-lg shadow-sm"
              />
              <span className="font-bold text-green-400">55%</span>
            </div>
            <div className="flex flex-col items-center text-xs gap-1">
              <img
                src={ahriIcon}
                alt="Ahri Icon"
                className="w-10 h-10 rounded-lg shadow-sm"
              />
              <span className="font-bold text-green-400">55%</span>
            </div>
          </div>
        </div>

        {isLoadingElo && !account.eloData && (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
            <span className="text-xs text-blue-400 mt-1">Loading...</span>
          </div>
        )}

        {/* Seta indicando que é clicável */}
        <div className="text-primary/60">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ListCard;
