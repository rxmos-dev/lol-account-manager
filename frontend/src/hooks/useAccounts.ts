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

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    isLoading: apiLoading,
    error: apiError 
  } = useRiotApi();

  const isLoadingCombined = isLoading || apiLoading;
  const errorCombined = error || apiError?.message || null;

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
    setAccounts,
  };
};
