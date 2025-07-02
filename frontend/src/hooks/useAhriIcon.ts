import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const useAhriIcon = () => {
  const [ahriIcon, setAhriIcon] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAhriIcon = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(
        "https://ddragon.leagueoflegends.com/cdn/15.13.1/data/en_US/champion/Ahri.json"
      );
      const iconName = response.data.data.Ahri.image.full;
      setAhriIcon(`https://ddragon.leagueoflegends.com/cdn/15.13.1/img/champion/${iconName}`);
      console.log('Ahri icon loaded:', iconName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar ícone da Ahri');
      console.error("Error fetching Ahri icon:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAhriIcon();
  }, [fetchAhriIcon]);

  return {
    ahriIcon,
    isLoading,
    error,
    refetch: fetchAhriIcon,
  };
};
