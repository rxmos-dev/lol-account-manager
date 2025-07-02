import { useCallback } from 'react';
import { AccountData } from '../utils/accountsManager';

interface EloData {
  tier: string;
  rank: string;
  lp: number;
}

export const useEloData = () => {
  // Formata dados de elo
  const formatEloData = useCallback((eloData: any): EloData => {
    if (!eloData || !eloData.elo || eloData.elo.length === 0) {
      return { tier: "UNRANKED", rank: "", lp: 0 };
    }

    // Prioriza RANKED_SOLO_5x5, senão pega o primeiro
    const soloQueue = eloData.elo.find((entry: any) => entry.queueType === "RANKED_SOLO_5x5");
    const rankData = soloQueue || eloData.elo[0];

    return {
      tier: rankData.tier || "UNRANKED",
      rank: rankData.rank || "",
      lp: rankData.leaguePoints || 0,
    };
  }, []);

  // Obtém cor da borda baseada no tier
  const getTierBorderColor = useCallback((tier: string): string => {
    switch (tier.toUpperCase()) {
      case "IRON":
        return "border-gray-600";
      case "BRONZE":
        return "border-amber-600";
      case "SILVER":
        return "border-gray-400";
      case "GOLD":
        return "border-yellow-400";
      case "PLATINUM":
        return "border-emerald-400";
      case "EMERALD":
        return "border-emerald-500";
      case "DIAMOND":
        return "border-blue-400";
      case "MASTER":
        return "border-purple-500";
      case "GRANDMASTER":
        return "border-red-500";
      case "CHALLENGER":
        return "border-amber-300";
      default:
        return "border-foreground";
    }
  }, []);

  // Ordena contas por elo (do mais alto para o mais baixo)
  const sortAccountsByElo = useCallback((accounts: AccountData[]): AccountData[] => {
    const tierOrder = {
      CHALLENGER: 8,
      GRANDMASTER: 7,
      MASTER: 6,
      DIAMOND: 5,
      EMERALD: 4,
      PLATINUM: 3,
      GOLD: 2,
      SILVER: 1,
      BRONZE: 0,
      IRON: -1,
      UNRANKED: -2,
    };

    const rankOrder = {
      I: 4,
      II: 3,
      III: 2,
      IV: 1,
      "": 0,
    };

    return [...accounts].sort((a, b) => {
      const eloA = formatEloData(a.eloData);
      const eloB = formatEloData(b.eloData);

      // Compara por tier primeiro
      const tierDiff =
        (tierOrder[eloB.tier as keyof typeof tierOrder] || -2) - 
        (tierOrder[eloA.tier as keyof typeof tierOrder] || -2);

      if (tierDiff !== 0) return tierDiff;

      // Se o tier for o mesmo, compara por rank
      const rankDiff =
        (rankOrder[eloB.rank as keyof typeof rankOrder] || 0) - 
        (rankOrder[eloA.rank as keyof typeof rankOrder] || 0);

      if (rankDiff !== 0) return rankDiff;

      // Se tier e rank forem iguais, compara por LP
      return eloB.lp - eloA.lp;
    });
  }, [formatEloData]);

  // Formata nome da role
  const formatRoleName = useCallback((role: string): string => {
    const roleMap: { [key: string]: string } = {
      TOP: "TOP",
      JUNGLE: "JNG",
      MIDDLE: "MID",
      BOTTOM: "ADC",
      UTILITY: "SUP",
    };

    return roleMap[role] || role;
  }, []);

  return {
    formatEloData,
    getTierBorderColor,
    sortAccountsByElo,
    formatRoleName,
  };
};

// Exporta as funções utilitárias para uso direto em outros componentes
export const formatEloDataUtil = (eloData: any) => {
  if (!eloData || !eloData.elo || eloData.elo.length === 0) {
    return { tier: "UNRANKED", rank: "", lp: 0 };
  }

  // Prioriza RANKED_SOLO_5x5, senão pega o primeiro
  const soloQueue = eloData.elo.find((entry: any) => entry.queueType === "RANKED_SOLO_5x5");
  const rankData = soloQueue || eloData.elo[0];

  return {
    tier: rankData.tier || "UNRANKED",
    rank: rankData.rank || "",
    lp: rankData.leaguePoints || 0,
  };
};

export const getTierBorderColorUtil = (tier: string): string => {
  switch (tier.toUpperCase()) {
    case "IRON":
      return "border-gray-600";
    case "BRONZE":
      return "border-amber-600";
    case "SILVER":
      return "border-gray-400";
    case "GOLD":
      return "border-yellow-400";
    case "PLATINUM":
      return "border-emerald-400";
    case "EMERALD":
      return "border-emerald-500";
    case "DIAMOND":
      return "border-blue-400";
    case "MASTER":
      return "border-purple-500";
    case "GRANDMASTER":
      return "border-red-500";
    case "CHALLENGER":
      return "border-amber-300";
    default:
      return "border-foreground";
  }
};

export const formatRoleNameUtil = (role: string): string => {
  const roleMap: { [key: string]: string } = {
    TOP: "TOP",
    JUNGLE: "JNG",
    MIDDLE: "MID",
    BOTTOM: "ADC",
    UTILITY: "SUP",
  };

  return roleMap[role] || role;
};
