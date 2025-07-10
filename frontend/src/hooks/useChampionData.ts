import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface ChampionData {
  [key: string]: {
    key: string;
    name: string;
    id: string;
    image: {
      full: string;
    };
  };
}

export const useChampionData = () => {
  const [championMap, setChampionMap] = useState<{ [key: string]: string }>({});
  const [championIdMap, setChampionIdMap] = useState<{ [key: string]: string }>({});
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
      const newChampionIdMap: { [key: string]: string } = {};
      
      for (const key in champions) {
        newChampionMap[champions[key].key] = champions[key].name;
        newChampionIdMap[champions[key].key] = champions[key].id;
      }
      
      setChampionMap(newChampionMap);
      setChampionIdMap(newChampionIdMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar dados dos campeões');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obtém nome do campeão por ID
  const getChampionNameById = useCallback((championId: number): string => {
    return championMap[championId.toString()] || "?";
  }, [championMap]);

  // Obtém ícone do campeão por ID
  const getChampionIcon = useCallback((championId: number): string => {
    const championInternalId = championIdMap[championId.toString()];
    if (!championInternalId) {
      return "https://ddragon.leagueoflegends.com/cdn/15.13.1/img/champion/Ashe.png";
    }
    return `https://ddragon.leagueoflegends.com/cdn/15.13.1/img/champion/${championInternalId}.png`;
  }, [championIdMap]);

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
    championIdMap,
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
    return championMap[championId.toString()] || "?";
  };

export const getChampionIcon = (championIdMap: { [key: string]: string }) => 
  (championId: number): string => {
    const championInternalId = championIdMap[championId.toString()];
    if (!championInternalId) {
      return "https://ddragon.leagueoflegends.com/cdn/15.13.1/img/champion/Ashe.png";
    }
    return `https://ddragon.leagueoflegends.com/cdn/15.13.1/img/champion/${championInternalId}.png`;
  };

export const calculateMasteryWinrateUtil = (championPoints: number): number => {
  if (championPoints < 10000) return Math.floor(Math.random() * 20) + 40; // 40-60%
  if (championPoints < 50000) return Math.floor(Math.random() * 20) + 50; // 50-70%
  if (championPoints < 100000) return Math.floor(Math.random() * 20) + 55; // 55-75%
  return Math.floor(Math.random() * 20) + 60; // 60-80%
};
