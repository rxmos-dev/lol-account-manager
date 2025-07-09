import { useState } from 'react';
import { ref, set, get } from 'firebase/database';
import { database } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { AccountData } from '../utils/accountsManager';

export const useFirebaseSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const { user } = useAuth();

  const syncAccountsToFirebase = async (accounts: AccountData[]) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setIsSyncing(true);
      setSyncError(null);

      // Preparar contas para Firebase (sem senhas por segurança)
      const firebaseAccounts = accounts.map(account => ({
        ...account,
        password: '***ENCRYPTED***',
        lastUpdated: Date.now(),
        userId: user.uid
      }));

      // Salvar no caminho: users/{id}/accounts
      const userAccountsRef = ref(database, `users/${user.uid}/accounts`);
      await set(userAccountsRef, firebaseAccounts);
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao sincronizar com Firebase';
      setSyncError(errorMessage);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  const syncAccountsFromFirebase = async (): Promise<AccountData[]> => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setIsSyncing(true);
      setSyncError(null);

      const userAccountsRef = ref(database, `users/${user.uid}/accounts`);
      const snapshot = await get(userAccountsRef);
      
      if (snapshot.exists()) {
        const firebaseAccounts = snapshot.val() as AccountData[];
        return firebaseAccounts || [];
      } else {
        return [];
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar do Firebase';
      setSyncError(errorMessage);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  const bidirectionalSync = async (localAccounts: AccountData[]): Promise<AccountData[]> => {
    if (!user) {
      throw new Error('Usuário não autenticado. Faça login para sincronizar.');
    }

    try {
      setIsSyncing(true);
      setSyncError(null);

      const firebaseAccounts = await syncAccountsFromFirebase();
      
      const localAccountsMap = new Map(localAccounts.map(acc => [acc.username, acc]));
      const firebaseAccountsMap = new Map(firebaseAccounts.map(acc => [acc.username, acc]));
      
      const mergedAccounts: AccountData[] = [];
      
      localAccounts.forEach(localAccount => {
        const firebaseAccount = firebaseAccountsMap.get(localAccount.username);
        if (firebaseAccount) {
          mergedAccounts.push({
            ...firebaseAccount,
            password: localAccount.password,
            lastUpdated: firebaseAccount.lastUpdated || localAccount.lastUpdated || Date.now()
          });
        } else {
          mergedAccounts.push(localAccount);
        }
      });
      
      firebaseAccounts.forEach(firebaseAccount => {
        if (!localAccountsMap.has(firebaseAccount.username)) {
          mergedAccounts.push({
            ...firebaseAccount,
            password: '',
          });
        }
      });

      await syncAccountsToFirebase(mergedAccounts);

      return mergedAccounts;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro na sincronização bidirecional';
      setSyncError(errorMessage);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isSyncing,
    syncError,
    syncAccountsToFirebase,
    syncAccountsFromFirebase,
    bidirectionalSync,
  };
};
