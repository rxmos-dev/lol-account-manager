import { useState, useCallback } from 'react';
import axios from 'axios';

// Constantes da API
const API_BASE_URL = 'https://api-lol-account-manager.vercel.app/api/v1';

// Tipos
interface ApiError {
  message: string;
  status?: number;
}

interface SummonerRequest {
  summonerName: string;
  tagline: string;
}

export const useRiotApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Função genérica para fazer requisições
  const makeRequest = useCallback(async <T>(
    endpoint: string, 
    data: SummonerRequest
  ): Promise<T | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError({ message: errorMessage });
      console.error(`Erro na API ${endpoint}:`, err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Busca PUUID
  const fetchPuuid = useCallback(async (summonerName: string, tagline: string): Promise<string | null> => {
    return await makeRequest<string>('/puuid', { summonerName, tagline });
  }, [makeRequest]);

  // Busca dados de elo
  const fetchEloData = useCallback(async (summonerName: string, tagline: string): Promise<any> => {
    return await makeRequest('/elo', { summonerName, tagline });
  }, [makeRequest]);

  // Busca maestrias de campeões
  const fetchChampionMasteries = useCallback(async (summonerName: string, tagline: string) => {
    const result = await makeRequest<{ championMasteriesData: any[] }>('/champion-masteries', { summonerName, tagline });
    return result?.championMasteriesData || null;
  }, [makeRequest]);

  // Busca dados da lane principal
  const fetchSummonerLane = useCallback(async (summonerName: string, tagline: string) => {
    return await makeRequest('/summoner-lane', { summonerName, tagline });
  }, [makeRequest]);

  // Limpa erros
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    fetchPuuid,
    fetchEloData,
    fetchChampionMasteries,
    fetchSummonerLane,
    clearError,
  };
};
