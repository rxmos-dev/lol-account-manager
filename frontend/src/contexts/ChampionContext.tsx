import React, { createContext, useContext, ReactNode } from 'react';
import { useChampionData } from '../hooks/useChampionData';

interface ChampionContextType {
  championMap: { [key: string]: string };
  championIdMap: { [key: string]: string };
  isLoading: boolean;
  error: string | null;
  getChampionNameById: (championId: number) => string;
  getChampionIcon: (championId: number) => string;
  calculateMasteryWinrate: (championPoints: number) => number;
}

const ChampionContext = createContext<ChampionContextType | undefined>(undefined);

interface ChampionProviderProps {
  children: ReactNode;
}

export const ChampionProvider: React.FC<ChampionProviderProps> = ({ children }) => {
  const championData = useChampionData();

  return (
    <ChampionContext.Provider value={championData}>
      {children}
    </ChampionContext.Provider>
  );
};

export const useChampion = (): ChampionContextType => {
  const context = useContext(ChampionContext);
  if (context === undefined) {
    throw new Error('useChampion must be used within a ChampionProvider');
  }
  return context;
};
