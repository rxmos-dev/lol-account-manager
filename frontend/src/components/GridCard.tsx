import React from "react";
import { AccountData } from "../utils/accountsManager";
import { formatEloData, getTierBorderColor } from "../App";

interface GridCardProps {
  account: AccountData;
  index: number;
  onClick: (account: AccountData) => void;
  ahriIcon: string | null;
  isLoadingElo: boolean;
}

const GridCard: React.FC<GridCardProps> = ({ account, index, onClick, ahriIcon, isLoadingElo }) => (
  <div
    key={index}
    onClick={() => onClick(account)}
    className={`bg-secondary border-b-5 rounded-lg shadow-md p-6 justify-center items-center max-w-xs w-40 h-60 flex flex-col hover:cursor-pointer hover:border-b-0 hover:animate-pulse transition-all ${getTierBorderColor(
      formatEloData(account.eloData).tier
    )}`}
  >
    <div className="flex flex-col items-center text-sm font-semibold text-primary">
      {account.summonerName}
      <p className="opacity-30 text-xs font-normal">#{account.tagline}</p>
      {isLoadingElo && !account.eloData && <p className="text-xs text-blue-400 animate-pulse">Loading rank...</p>}
    </div>

    <div className="flex flex-row items-center justify-center gap-2 mt-4">
      {(() => {
        const eloInfo = formatEloData(account.eloData);
        return (
          <p className="text-xs font-bold">
            {eloInfo.tier === "UNRANKED" ? "UNRANKED" : `${eloInfo.tier} ${eloInfo.rank}`}
            {eloInfo.lp > 0 && ` ${eloInfo.lp} LP`}
          </p>
        );
      })()}
    </div>

    <div className="flex flex-row items-center justify-center gap-2 mt-4">
      <p className="text-xs">MID</p>
    </div>

    <div className="flex flex-row items-center justify-center gap-2 mt-4">
      <div className="flex flex-col items-center text-xs gap-1">
        <img
          src={ahriIcon}
          alt="Ahri Icon"
          className="w-8 h-8 rounded-sm"
        />
        55%
      </div>
      <div className="flex flex-col items-center text-xs gap-1">
        <img
          src={ahriIcon}
          alt="Ahri Icon"
          className="w-8 h-8 rounded-sm"
        />
        55%
      </div>
      <div className="flex flex-col items-center text-xs gap-1">
        <img
          src={ahriIcon}
          alt="Ahri Icon"
          className="w-8 h-8 rounded-sm"
        />
        55%
      </div>
    </div>
  </div>
);

export default GridCard;
