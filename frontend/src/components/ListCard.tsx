import React from "react";
import { AccountData } from "../utils/accountsManager";
import { formatEloData, getTierBorderColor, formatRoleName } from "../utils/gameUtils";
import { useChampion } from "../contexts/ChampionContext";
import { BiChevronRight } from "react-icons/bi";

interface ListCardProps {
  account: AccountData;
  index: number;
  onClick: (account: AccountData) => void;
  ahriIcon: string | null;
  isLoadingElo: boolean;
}

const ListCard: React.FC<ListCardProps> = ({ account, index, onClick, ahriIcon, isLoadingElo }) => {
  const { getChampionNameById, getChampionIcon } = useChampion();

  const eloInfo = formatEloData(account.eloData);

  // Função para verificar se os dados estão atualizados (últimas 24h)
  const isDataFresh = () => {
    if (!account.lastUpdated) return false;
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return now - account.lastUpdated < twentyFourHours;
  };

  const getHoursFromUpdate = () => {
    if (!account.lastUpdated) return 0;
    const now = Date.now();
    return Math.floor((now - account.lastUpdated) / (1000 * 60 * 60));
  };

  return (
    <div
      key={index}
      onClick={() => onClick(account)}
      className={`bg-secondary border-l-5 rounded-lg shadow-md py-3 px-5 w-full flex flex-row items-center justify-between hover:cursor-pointer hover:border-l-0 transition-all duration-50 relative ${getTierBorderColor(
        eloInfo.tier
      )}`}
    >
      {/* Indicador de cache */}
      {account.lastUpdated && (
        <div className="absolute top-3 right-3">
          <div
            className={`w-2 h-2 rounded-full ${isDataFresh() ? "bg-green-400" : "bg-yellow-400"}`}
            title={`Dados ${isDataFresh() ? "atualizados" : "desatualizados"} - ${getHoursFromUpdate()}h atrás`}
          />
        </div>
      )}

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
              <span className="text-sm font-semibold">
                {account.summonerLaneData?.mainRole ? formatRoleName(account.summonerLaneData.mainRole) : "FILL"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-row items-center gap-8">
        <div className="flex flex-col items-center">
          <span className="text-xs opacity-30 uppercase tracking-wide mb-2">Top Champions</span>
          <div className="flex flex-row items-center gap-2">
            {account.championMasteriesData && account.championMasteriesData.length > 0 ? (
              account.championMasteriesData.slice(0, 3).map((mastery, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-xs gap-1"
                >
                  <img
                    src={getChampionIcon(mastery.championId)}
                    alt={`Champion ${mastery.championId}`}
                    className="w-10 h-10 rounded-lg shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = ahriIcon || "";
                    }}
                  />
                  <p className="text-[8px] text-muted-foreground uppercase">
                    {getChampionNameById(mastery.championId)}
                  </p>
                </div>
              ))
            ) : (
              // Fallback para quando não há dados de maestria
              <>
                <p className="text-xs text-muted-foreground">Sem dados de maestria</p>
              </>
            )}
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
          <BiChevronRight className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default ListCard;
