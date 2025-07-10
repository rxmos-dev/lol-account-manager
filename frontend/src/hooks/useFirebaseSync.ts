import { useState, useCallback } from 'react';
import { ref, set, get } from 'firebase/database';
import { database } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { AccountData } from '../utils/accountsManager';

export const useFirebaseSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const { user } = useAuth();

  // Função simples para enviar dados para Firebase
  const uploadToFirebase = useCallback(async (accounts: AccountData[]): Promise<void> => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      const userAccountsRef = ref(database, `users/${user.uid}/accounts`);
      await set(userAccountsRef, accounts);
    } catch (error) {
      console.error('Erro ao enviar para Firebase:', error);
      setSyncError('Erro ao enviar para Firebase');
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [user]);

  const checkExistingData = useCallback(async (): Promise<AccountData[] | null> => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const userAccountsRef = ref(database, `users/${user.uid}/accounts`);
      const snapshot = await get(userAccountsRef);
      
      if (snapshot.exists()) {
        return snapshot.val();
      }
      return null;
    } catch (error) {
      console.error('Erro ao verificar dados existentes:', error);
      throw error;
    }
  }, [user]);

  return {
    uploadToFirebase,
    checkExistingData,
    isSyncing,
    syncError,
    isAuthenticated: !!user
  };
};