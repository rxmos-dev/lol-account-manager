// Utilitários para serem usados em outros componentes sem precisar do hook
import { AccountData } from '../utils/accountsManager';

// Função para calcular winrate baseado nos pontos de maestria (mock)
export const calculateMasteryWinrate = (championPoints: number): number => {
  // Simulação de winrate baseada nos pontos de maestria
  // Quanto mais pontos, maior a "experiência" com o campeão
  if (championPoints < 10000) return Math.floor(Math.random() * 20) + 40; // 40-60%
  if (championPoints < 50000) return Math.floor(Math.random() * 20) + 50; // 50-70%
  if (championPoints < 100000) return Math.floor(Math.random() * 20) + 55; // 55-75%
  return Math.floor(Math.random() * 20) + 60; // 60-80%
};

// Função para formatar o nome da role
export const formatRoleName = (role: string): string => {
  const roleMap: { [key: string]: string } = {
    TOP: "TOP",
    JUNGLE: "JNG",
    MIDDLE: "MID",
    BOTTOM: "ADC",
    UTILITY: "SUP",
  };

  return roleMap[role] || role;
};

// Função para formatar dados de elo
export const formatEloData = (eloData: any) => {
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

// Função para determinar a cor da borda baseada no tier
export const getTierBorderColor = (tier: string): string => {
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

export const sortAccountsByElo = (accounts: AccountData[]): AccountData[] => {
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
      (tierOrder[eloB.tier as keyof typeof tierOrder] || -2) - (tierOrder[eloA.tier as keyof typeof tierOrder] || -2);

    if (tierDiff !== 0) return tierDiff;

    // Se o tier for o mesmo, compara por rank
    const rankDiff =
      (rankOrder[eloB.rank as keyof typeof rankOrder] || 0) - (rankOrder[eloA.rank as keyof typeof rankOrder] || 0);

    if (rankDiff !== 0) return rankDiff;

    // Se tier e rank forem iguais, compara por LP
    return eloB.lp - eloA.lp;
  });
};

// Função para obter o nome do campeão pelo ID
export const getChampionNameById = (championId: number, championMap: { [key: string]: string } = {}): string => {
  return championMap[championId] || "?";
};

// Função para obter o ícone do campeão baseado no championId
export const getChampionIcon = (championId: number, championMap: { [key: string]: string } = {}): string => {
  const championName = championMap[championId] || "?";
  if (!championName || championName === "?") {
    return "https://ddragon.leagueoflegends.com/cdn/15.13.1/img/champion/Ashe.png"; // fallback
  }
  return `https://ddragon.leagueoflegends.com/cdn/15.13.1/img/champion/${championName}.png`;
};
