import { useState, useEffect, useCallback } from 'react';
import { ref, get, set, onValue, off } from 'firebase/database';
import { database } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { AccountData } from '../utils/accountsManager';

export const useFirebaseAccounts = () => {
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Função para buscar contas do Firebase
  const fetchAccounts = useCallback(async () => {
    if (!user) {
      setAccounts([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userAccountsRef = ref(database, `users/${user.uid}/accounts`);
      const snapshot = await get(userAccountsRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        setAccounts(data.accounts || []);
      } else {
        setAccounts([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar contas';
      setError(errorMessage);
      console.error('Erro ao buscar contas do Firebase:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Função para salvar contas no Firebase
  const saveAccounts = useCallback(async (accountsToSave: AccountData[]) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    setIsLoading(true);
    setError(null);

    try {
      const userAccountsRef = ref(database, `users/${user.uid}/accounts`);
      const dataToSave = {
        accounts: accountsToSave,
        lastModified: Date.now(),
        version: Date.now() // Usando timestamp como versão simples
      };

      await set(userAccountsRef, dataToSave);
      setAccounts(accountsToSave);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar contas';
      setError(errorMessage);
      console.error('Erro ao salvar contas no Firebase:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Função para adicionar uma conta
  const addAccount = useCallback(async (newAccount: AccountData) => {
    const updatedAccounts = [...accounts, newAccount];
    await saveAccounts(updatedAccounts);
  }, [accounts, saveAccounts]);

  // Função para atualizar uma conta
  const updateAccount = useCallback(async (updatedAccount: AccountData) => {
    const updatedAccounts = accounts.map(acc => 
      acc.username === updatedAccount.username ? updatedAccount : acc
    );
    await saveAccounts(updatedAccounts);
  }, [accounts, saveAccounts]);

  // Função para remover uma conta
  const removeAccount = useCallback(async (accountToRemove: AccountData) => {
    const updatedAccounts = accounts.filter(
      acc => acc.username !== accountToRemove.username
    );
    await saveAccounts(updatedAccounts);
  }, [accounts, saveAccounts]);

  // Listener em tempo real para mudanças
  useEffect(() => {
    if (!user) {
      setAccounts([]);
      return;
    }

    const userAccountsRef = ref(database, `users/${user.uid}/accounts`);
    
    const unsubscribe = onValue(userAccountsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setAccounts(data.accounts || []);
      } else {
        setAccounts([]);
      }
    }, (error) => {
      console.error('Erro no listener do Firebase:', error);
      setError(error.message);
    });

    return () => off(userAccountsRef, 'value', unsubscribe);
  }, [user]);

  // Busca inicial
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return {
    accounts,
    isLoading,
    error,
    fetchAccounts,
    saveAccounts,
    addAccount,
    updateAccount,
    removeAccount,
    isAuthenticated: !!user
  };
};