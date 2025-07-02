import { useState, useEffect, useCallback } from 'react';

type ViewMode = 'card' | 'list';

export const useViewMode = (defaultMode: ViewMode = 'list') => {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem("accountViewMode");
    return (saved as ViewMode) || defaultMode;
  });

  const updateViewMode = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  const toggleViewMode = useCallback(() => {
    setViewMode(current => current === 'card' ? 'list' : 'card');
  }, []);

  // Salva a preferência no localStorage
  useEffect(() => {
    localStorage.setItem("accountViewMode", viewMode);
  }, [viewMode]);

  return {
    viewMode,
    setViewMode: updateViewMode,
    toggleViewMode,
  };
};
