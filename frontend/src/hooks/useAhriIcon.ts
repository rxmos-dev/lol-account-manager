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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar ícone da Ahri');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const getIcon = async () => {
      try {
        const iconName = await window.electron.getAhriIcon();
        setAhriIcon(iconName);
      } catch (error) {
        // Error handling removed as per the change request
      }
    };
    getIcon();
  }, []);

  return { ahriIcon };
};
