import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ChampionProvider } from "./contexts/ChampionContext";
import { BiPlus, BiPlusCircle, BiGridAlt, BiListUl } from "react-icons/bi";
import AddAccountModal from "./components/AddAccountModal";
import AccountDetailsModal from "./components/AccountDetailsModal";
import GridCard from "./components/GridCard";
import ListCard from "./components/ListCard";
import { AccountData } from "./utils/accountsManager";
import Footer from "./components/Footer";
import { useAccounts, useEloData, useAhriIcon, useViewMode, useModals } from "./hooks";
import { LuFileJson, LuFileJson2, LuRefreshCw } from "react-icons/lu";
import { SyncAlert, SyncControls } from "./components/SyncAlert";
import { useFirebaseSync } from "./hooks/useFirebaseSync";

// Re-exporta as funções utilitárias para uso em outros componentes
export {
  calculateMasteryWinrate,
  formatRoleName,
  formatEloData,
  getTierBorderColor,
  sortAccountsByElo,
  getChampionNameById,
  getChampionIcon,
} from "./utils/gameUtils";

function App(): React.JSX.Element {
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  
  // Hooks customizados
  const {
    accounts,
    isLoading: isLoadingAccounts,
    loadInitialAccounts,
    addAccount,
    updateAccount: updateAccountData,
    removeAccount,
    forceUpdateSingleAccount,
    forceUpdateAll,
    syncWithFirebase,
  } = useAccounts();

  const { 
    isAuthenticated 
  } = useFirebaseSync();

  const { sortAccountsByElo } = useEloData();

  const { ahriIcon } = useAhriIcon();
  const { viewMode, setViewMode } = useViewMode("list");
  const {
    isAddModalOpen,
    openAddModal,
    closeAddModal,
    isDetailsModalOpen,
    selectedAccount,
    openDetailsModal,
    closeDetailsModal,
  } = useModals();

  // Carrega dados iniciais
  useEffect(() => {
    loadInitialAccounts();
  }, [loadInitialAccounts]);

  const handleAddAccount = async (accountData: AccountData) => {
    setIsAddingAccount(true);
    try {
      await addAccount(accountData);
      loadInitialAccounts(); // Recarrega as contas
      closeAddModal(); // Fecha o modal
    } catch (error) {
      console.error("Error adding account:", error);
    } finally {
      setIsAddingAccount(false);
    }
  };

  const handleAccountClick = (account: AccountData) => {
    openDetailsModal(account);
  };

  const handleSaveAccount = async (updatedAccount: AccountData) => {
    try {
      await updateAccountData(updatedAccount);
    } catch (error) {
      console.error("Error updating account:", error);
    }
  };

  const handleDeleteAccount = async (accountToDelete: AccountData) => {
    try {
      await removeAccount(accountToDelete);
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  const handleRefreshAccount = async (accountToRefresh: AccountData) => {
    try {
      await forceUpdateSingleAccount(accountToRefresh);
    } catch (error) {
      console.error("Error refreshing account:", error);
    }
  };

  const handleRefreshAll = async () => {
    try {
      await forceUpdateAll();
    } catch (error) {
      console.error("Error refreshing all accounts:", error);
    }
  };

  // Função de sincronização
  const handleSyncRequest = async () => {
    try {
      setSyncMessage(null);
      const result = await syncWithFirebase();
      setSyncMessage(result.message);
    } catch (error) {
      console.error("Error syncing with Firebase:", error);
      setSyncMessage("Erro na sincronização");
    }
  };

  const handleExportAccounts = async () => {
    try {
      const { ipcRenderer } = window.electron;
      const result = await ipcRenderer.invoke("export-accounts");

      if (result.success) {
        alert(`Accounts exported successfully to: ${result.filePath}`);
      } else {
        alert(`Error exporting accounts: ${result.error}`);
      }
    } catch (error) {
      console.error("Error exporting accounts:", error);
      alert("Error exporting accounts");
    }
  };

  const handleImportAccounts = async () => {
    try {
      const { ipcRenderer } = window.electron;
      const result = await ipcRenderer.invoke("import-accounts");

      if (result.success) {
        // Reload accounts after successful import
        await loadInitialAccounts();
        alert(`${result.importedCount} accounts imported successfully!`);
      } else if (!result.canceled) {
        alert(`Error importing accounts: ${result.error}`);
      }
    } catch (error) {
      console.error("Error importing accounts:", error);
      alert("Error importing accounts");
    }
  };

  return (
    <AuthProvider>
      <ThemeProvider>
        <ChampionProvider>
          <div className="bg-background min-h-screen flex flex-col relative">
            <Navbar />

            <div className="flex-1 flex flex-col items-center justify-start px-5 pt-20 pb-80">
              {accounts.length === 0 ? (
                <>
                  <h1 className="text-4xl font-bold text-primary">Welcome!</h1>

                  <p className="mt-4 opacity-30 text-center max-w-md">
                    For start you need to add your account, don't worry all the password are encrypted.
                  </p>

                  <button
                    onClick={openAddModal}
                    className="flex flex-row items-center gap-2 mt-4 bg-primary text-background px-3 py-3 rounded-lg animate-pulse hover:cursor-pointer text-sm shadow-sm"
                  >
                    <BiPlus />
                  </button>
                </>
              ) : (
                <>
                  <div className="w-full flex flex-row justify-between items-center mb-6">
                    <div className="flex flex-col">
                      <p className="text-sm opacity-30">
                        {accounts.length} account{accounts.length !== 1 ? "s" : ""} configured
                      </p>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <button
                        onClick={handleImportAccounts}
                        className="flex flex-row items-center justify-center gap-1 text-[11px] px-2.5 py-2 rounded-sm hover:cursor-pointer transition-all bg-secondary hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Import accounts from JSON file"
                        disabled={isLoadingAccounts}
                      >
                        <LuFileJson2 className="w-4 h-4" />
                        import
                      </button>

                      <button
                        onClick={handleExportAccounts}
                        className="flex flex-row items-center justify-center gap-1 text-[11px] px-2.5 py-2 rounded-sm hover:cursor-pointer transition-all bg-secondary hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Export accounts to JSON file"
                        disabled={isLoadingAccounts}
                      >
                        <LuFileJson className="w-4 h-4" />
                        export
                      </button>

                      <hr className="border border-foreground/20 h-6 mx-2" />

                      <button
                        onClick={() => setViewMode("card")}
                        className={`flex flex-row items-center justify-center gap-1 px-2.5 py-2 rounded-sm hover:cursor-pointer transition-all ${
                          viewMode === "card"
                            ? "bg-primary text-background shadow-lg"
                            : "bg-secondary text-primary hover:bg-secondary/80"
                        }`}
                        title="Card View"
                      >
                        <BiGridAlt />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`flex flex-row items-center justify-center gap-1 px-2.5 py-2 rounded-sm hover:cursor-pointer transition-all ${
                          viewMode === "list"
                            ? "bg-primary text-background shadow-lg"
                            : "bg-secondary text-primary hover:bg-secondary/80"
                        }`}
                        title="List View"
                      >
                        <BiListUl className="w-5 h-5" />
                      </button>

                      <hr className="border border-foreground/20 h-6 mx-2" />

                      <button
                        onClick={handleRefreshAll}
                        className="flex flex-row items-center justify-center gap-1.5 text-[11px] px-2.5 py-2 rounded-sm hover:cursor-pointer transition-all bg-green-700 text-white hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Atualizar todas as contas"
                        disabled={isLoadingAccounts}
                      >
                        <LuRefreshCw className={`w-3 h-3 ${isLoadingAccounts ? "animate-spin" : ""}`} />
                        refresh
                      </button>

                      {/* Controles de Sincronização */}
                      {isAuthenticated && (
                        <>
                          <hr className="border border-foreground/20 h-6 mx-2" />
                          <SyncControls
                            onSyncRequested={handleSyncRequest}
                          />
                        </>
                      )}
                    </div>
                  </div>

                  {viewMode === "card" && (
                    <div className="w-full flex flex-wrap gap-4 justify-start items-start">
                      {sortAccountsByElo(accounts).map((account, index) => (
                        <GridCard
                          key={index}
                          account={account}
                          index={index}
                          onClick={handleAccountClick}
                          ahriIcon={ahriIcon}
                          isLoadingElo={isLoadingAccounts}
                        />
                      ))}

                      <button
                        onClick={openAddModal}
                        className="bg-secondary/30 border-b-5 border-green-500 rounded-lg shadow-md p-6 justify-center items-center max-w-xs w-50 h-70 flex flex-col hover:cursor-pointer hover:border-b-0 transition-all duration-50"
                      >
                        <BiPlusCircle className="w-10 h-10 mb-1" />
                      </button>
                    </div>
                  )}

                  {/* Visualização em Lista */}
                  {viewMode === "list" && (
                    <div className="w-full flex flex-col gap-3">
                      {sortAccountsByElo(accounts).map((account, index) => (
                        <ListCard
                          key={index}
                          account={account}
                          index={index}
                          onClick={handleAccountClick}
                          ahriIcon={ahriIcon}
                          isLoadingElo={isLoadingAccounts}
                        />
                      ))}

                      <button
                        onClick={openAddModal}
                        className="bg-secondary/30 border-l-5 border-r-5 border-green-500 rounded-lg shadow-md p-6 w-full self-center flex flex-row items-center justify-center gap-3 hover:cursor-pointer hover:bg-secondary/50 transition-all group"
                      >
                        <div className="flex flex-col items-center">
                          <span className="flex flex-row items-center gap-1 text-xl font-bold text-primary">
                            {" "}
                            <BiPlusCircle className="w-5 h-5 text-green-500" />
                          </span>
                        </div>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Mensagem de Sincronização */}
            {syncMessage && (
              <div className="fixed top-20 left-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
                <span className="text-sm">{syncMessage}</span>
                <button
                  onClick={() => setSyncMessage(null)}
                  className="ml-2 text-white hover:text-gray-200"
                >
                  ×
                </button>
              </div>
            )}

            {/* Alerta de Sincronização */}
            <SyncAlert
              onSyncRequested={handleSyncRequest}
            />

            <Footer />

            <AddAccountModal
              isOpen={isAddModalOpen}
              onClose={closeAddModal}
              onSubmit={handleAddAccount}
              isAdding={isAddingAccount}
            />

            <AccountDetailsModal
              isOpen={isDetailsModalOpen}
              onClose={closeDetailsModal}
              account={selectedAccount}
              onSave={handleSaveAccount}
              onDelete={handleDeleteAccount}
              onRefresh={handleRefreshAccount}
            />
          </div>
        </ChampionProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
