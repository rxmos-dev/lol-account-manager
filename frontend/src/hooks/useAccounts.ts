import { useState, useCallback } from 'react';
import { 
  AccountData, 
  loadAccounts, 
  loadAccountsRaw,
  saveAccounts, 
  updateAccountsWithPuuids,
  forceUpdateAccount,
  forceUpdateAllAccounts 
} from '../utils/accountsManager';
import { useRiotApi } from './useRiotApi';
import { useFirebaseSync } from './useFirebaseSync';

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    isLoading: apiLoading,
    error: apiError 
  } = useRiotApi();

  const { 
    uploadToFirebase,
    checkExistingData,
    isSyncing, 
    syncError 
  } = useFirebaseSync();

  // Combina loading states
  const isLoadingCombined = isLoading || apiLoading || isSyncing;
  const errorCombined = error || apiError?.message || syncError || null;

  // Carrega contas iniciais
  const loadInitialAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedAccounts = await loadAccounts();
      setAccounts(loadedAccounts);
      
      // Atualiza dados se necessário (respeitando cache de 24h)
      if (loadedAccounts.length > 0) {
        const accountsWithPuuids = await updateAccountsWithPuuids(loadedAccounts);
        setAccounts(accountsWithPuuids);
        await saveAccounts(accountsWithPuuids);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading accounts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Adiciona nova conta
  const addAccount = useCallback(async (accountData: AccountData) => {
    try {
      setIsLoading(true);
      setError(null);
      const accountsWithNewAccount = [...accounts, accountData];
      const updatedAccounts = await updateAccountsWithPuuids(accountsWithNewAccount);
      setAccounts(updatedAccounts);
      await saveAccounts(updatedAccounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding account');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [accounts]);  // Atualiza conta específica
  const updateAccount = useCallback(async (updatedAccount: AccountData) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedAccounts = accounts.map((acc) => 
        acc.username === updatedAccount.username ? updatedAccount : acc
      );
      setAccounts(updatedAccounts);
      await saveAccounts(updatedAccounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating account');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [accounts]);

  // Remove conta
  const removeAccount = useCallback(async (accountToDelete: AccountData) => {    try {
      setError(null);
      const updatedAccounts = accounts.filter(
        (account) => account.username !== accountToDelete.username
      );
      setAccounts(updatedAccounts);
      await saveAccounts(updatedAccounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error removing account');
      throw err;
    }
  }, [accounts]);

  // Força atualização de conta específica
  const forceUpdateSingleAccount = useCallback(async (account: AccountData) => {
    try {      setIsLoading(true);
      setError(null);
      const updatedAccount = await forceUpdateAccount(account);
      const updatedAccounts = accounts.map((acc) =>
        acc.username === account.username
          ? updatedAccount
          : acc
      );
      setAccounts(updatedAccounts);
      await saveAccounts(updatedAccounts);
      return updatedAccount;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating account');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [accounts]);

  // Força atualização de todas as contas
  const forceUpdateAll = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedAccounts = await forceUpdateAllAccounts(accounts);
      setAccounts(updatedAccounts);
      await saveAccounts(updatedAccounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating all accounts');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [accounts]);

  // Sincronização com Firebase (usando conteúdo bruto do arquivo)
  const syncWithFirebase = useCallback(async () => {
    try {
      setError(null);
      
      const existingData = await checkExistingData();
      const rawAccounts = await loadAccountsRaw();
      
      if (rawAccounts.length === 0) {
        return { success: false, message: 'No accounts to sync' };
      }
      
      if (!existingData || existingData.length === 0) {
        await uploadToFirebase(rawAccounts);
        return { success: true, message: 'Data sent to Firebase' };
      }
      
      const localAccountsMap = new Map(rawAccounts.map(acc => [acc.username, acc]));
      const remoteAccountsMap = new Map(existingData.map(acc => [acc.username, acc]));
      
      const conflicts = {
        localNewer: [] as string[],
        remoteNewer: [] as string[],
        onlyLocal: [] as string[],
        onlyRemote: [] as string[]
      };
      
      for (const [username, localAcc] of localAccountsMap) {
        const remoteAcc = remoteAccountsMap.get(username);
        if (!remoteAcc) {
          conflicts.onlyLocal.push(username);
        } else {
          const localTime = localAcc.lastUpdated || 0;
          const remoteTime = remoteAcc.lastUpdated || 0;
          if (localTime > remoteTime) {
            conflicts.localNewer.push(username);
          } else if (remoteTime > localTime) {
            conflicts.remoteNewer.push(username);
          }
        }
      }
      
      for (const [username] of remoteAccountsMap) {
        if (!localAccountsMap.has(username)) {
          conflicts.onlyRemote.push(username);
        }
      }
      
      const hasConflicts = conflicts.localNewer.length > 0 || 
                          conflicts.remoteNewer.length > 0 || 
                          conflicts.onlyLocal.length > 0 || 
                          conflicts.onlyRemote.length > 0;
      
      if (!hasConflicts) {
        return { success: true, message: 'Data already synced' };
      }
      
      if (conflicts.onlyLocal.length === rawAccounts.length && 
          conflicts.remoteNewer.length === 0 && 
          conflicts.onlyRemote.length === 0) {
        await uploadToFirebase(rawAccounts);
        return { success: true, message: 'New accounts uploaded to Firebase' };
      }
      
      return { 
        success: false, 
        requiresConfirmation: true,
        existingAccountsCount: existingData.length,
        localAccountsCount: rawAccounts.length,
        conflictDetails: conflicts
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error sending to Firebase';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [uploadToFirebase, checkExistingData]);

  const forceUploadToFirebase = useCallback(async () => {
    try {
      setError(null);
      const rawAccounts = await loadAccountsRaw();
      await uploadToFirebase(rawAccounts);
      return { success: true, message: 'Data sent to Firebase' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error sending to Firebase';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [uploadToFirebase]);

  return {
    accounts,
    isLoading: isLoadingCombined,
    error: errorCombined,
    loadInitialAccounts,
    addAccount,
    updateAccount,
    removeAccount,
    forceUpdateSingleAccount,
    forceUpdateAll,
    syncWithFirebase,
    forceUploadToFirebase,
    setAccounts,
  };
};
