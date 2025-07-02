import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface ChampionData {
  [key: string]: {
    key: string;
    name: string;
    image: {
      full: string;
    };
  };
}

export const useChampionData = () => {
  const [championMap, setChampionMap] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Busca dados dos campeões
  const fetchChampionData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(
        "https://ddragon.leagueoflegends.com/cdn/15.13.1/data/en_US/champion.json"
      );
      const champions: ChampionData = response.data.data;
      const newChampionMap: { [key: string]: string } = {};
      
      for (const key in champions) {
        newChampionMap[champions[key].key] = champions[key].name;
      }
      
      setChampionMap(newChampionMap);
      console.log('Champion data loaded:', Object.keys(newChampionMap).length, 'champions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar dados dos campeões');
      console.error("Error fetching champion data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obtém nome do campeão por ID
  const getChampionNameById = useCallback((championId: number): string => {
    return championMap[championId] || "?";
  }, [championMap]);

  // Obtém ícone do campeão por ID
  const getChampionIcon = useCallback((championId: number): string => {
    const championName = getChampionNameById(championId);
    if (!championName || championName === "?") {
      return "https://ddragon.leagueoflegends.com/cdn/15.13.1/img/champion/Ashe.png"; // fallback
    }
    return `https://ddragon.leagueoflegends.com/cdn/15.13.1/img/champion/${championName}.png`;
  }, [getChampionNameById]);

  // Calcula winrate simulado baseado nos pontos de maestria
  const calculateMasteryWinrate = useCallback((championPoints: number): number => {
    if (championPoints < 10000) return Math.floor(Math.random() * 20) + 40; // 40-60%
    if (championPoints < 50000) return Math.floor(Math.random() * 20) + 50; // 50-70%
    if (championPoints < 100000) return Math.floor(Math.random() * 20) + 55; // 55-75%
    return Math.floor(Math.random() * 20) + 60; // 60-80%
  }, []);

  // Carrega dados na inicialização
  useEffect(() => {
    fetchChampionData();
  }, [fetchChampionData]);

  return {
    championMap,
    isLoading,
    error,
    fetchChampionData,
    getChampionNameById,
    getChampionIcon,
    calculateMasteryWinrate,
  };
};

// Exporta as funções utilitárias para uso direto em outros componentes
export const getChampionNameById = (championMap: { [key: string]: string }) => 
  (championId: number): string => {
    return championMap[championId] || "?";
  };

export const getChampionIcon = (championMap: { [key: string]: string }) => 
  (championId: number): string => {
    const championName = championMap[championId] || "?";
    if (!championName || championName === "?") {
      return "https://ddragon.leagueoflegends.com/cdn/15.12.1/img/champion/Ashe.png"; // fallback
    }
    return `https://ddragon.leagueoflegends.com/cdn/15.12.1/img/champion/${championName}.png`;
  };

export const calculateMasteryWinrateUtil = (championPoints: number): number => {
  if (championPoints < 10000) return Math.floor(Math.random() * 20) + 40; // 40-60%
  if (championPoints < 50000) return Math.floor(Math.random() * 20) + 50; // 50-70%
  if (championPoints < 100000) return Math.floor(Math.random() * 20) + 55; // 55-75%
  return Math.floor(Math.random() * 20) + 60; // 60-80%
};
