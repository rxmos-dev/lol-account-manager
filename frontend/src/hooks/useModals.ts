import { useState, useCallback } from 'react';
import { AccountData } from '../utils/accountsManager';

export const useModals = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountData | null>(null);

  const openAddModal = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);

  const closeAddModal = useCallback(() => {
    setIsAddModalOpen(false);
  }, []);

  const openDetailsModal = useCallback((account: AccountData) => {
    setSelectedAccount(account);
    setIsDetailsModalOpen(true);
  }, []);

  const closeDetailsModal = useCallback(() => {
    setIsDetailsModalOpen(false);
    setSelectedAccount(null);
  }, []);

  const closeAllModals = useCallback(() => {
    setIsAddModalOpen(false);
    setIsDetailsModalOpen(false);
    setSelectedAccount(null);
  }, []);

  return {
    // Add Modal
    isAddModalOpen,
    openAddModal,
    closeAddModal,
    
    // Details Modal
    isDetailsModalOpen,
    selectedAccount,
    openDetailsModal,
    closeDetailsModal,
    
    // Utility
    closeAllModals,
  };
};
