import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ChampionProvider } from "./contexts/ChampionContext";
import { BiPlus, BiPlusCircle, BiGridAlt, BiListUl } from "react-icons/bi";
import AddAccountModal from "./components/AddAccountModal";
import AccountDetailsModal from "./components/AccountDetailsModal";
import GridCard from "./components/GridCard";
import ListCard from "./components/ListCard";
import { AccountData } from "./utils/accountsManager";
import Footer from "./components/Footer";
import { useAccounts, useEloData, useViewMode, useModals } from "./hooks";
import { LuFileJson, LuFileJson2, LuRefreshCw } from "react-icons/lu";

function App(): React.JSX.Element {
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const {
    accounts,
    isLoading: isLoadingAccounts,
    loadInitialAccounts,
    addAccount,
    updateAccount: updateAccountData,
    removeAccount,
    forceUpdateSingleAccount,
    forceUpdateAll,
    setAccounts,
  } = useAccounts();

  const { sortAccountsByElo } = useEloData();

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
    loadInitialAccounts().then(() => {
      setLastUpdated(new Date());
    });
  }, [loadInitialAccounts]);

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return null;
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleAddAccount = async (accountData: AccountData) => {
    setIsAddingAccount(true);
    try {
      setAccounts((prev: AccountData[]) => [...prev, { ...accountData, isLoading: true }]);
      closeAddModal();

      await addAccount(accountData);
      loadInitialAccounts();
    } catch (error) {
      console.error("Error adding account:", error);
      setAccounts((prev: AccountData[]) => prev.filter((acc: AccountData) => acc.username !== accountData.username));
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
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error refreshing all accounts:", error);
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
        await loadInitialAccounts();
        setLastUpdated(new Date());
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
    <ThemeProvider>
      <ChampionProvider>
        <div className="bg-background min-h-screen flex flex-col relative">
          <Navbar />
          <div className="flex-1 flex flex-col items-center justify-start px-5 pt-13 pb-80">
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
                  <div className="flex flex-col items-start">
                    <p className="text-sm opacity-30">
                      {accounts.length} account{accounts.length !== 1 ? "s" : ""} configured
                    </p>
                    {lastUpdated && (
                      <div className="w-full flex justify-center mb-4">
                        <p className="text-xs opacity-50">Last updated: {formatLastUpdated(lastUpdated)}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row items-center gap-2">
                    <button
                      onClick={handleImportAccounts}
                      className="flex flex-row items-center justify-center gap-1 text-[11px] px-2.5 py-2 rounded-sm hover:cursor-pointer transition-all bg-secondary hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Import accounts from JSON file"
                      disabled={isLoadingAccounts}
                    >
                      <LuFileJson2 className="w-4 h-4" />
                      import .json
                    </button>

                    <button
                      onClick={handleExportAccounts}
                      className="flex flex-row items-center justify-center gap-1 text-[11px] px-2.5 py-2 rounded-sm hover:cursor-pointer transition-all bg-secondary hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Export accounts to JSON file"
                      disabled={isLoadingAccounts}
                    >
                      <LuFileJson className="w-4 h-4" />
                      export .json
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
                      title="Refresh all accounts"
                      disabled={isLoadingAccounts}
                    >
                      <LuRefreshCw className={`w-3 h-3 ${isLoadingAccounts ? "animate-spin" : ""}`} />
                      refresh
                    </button>
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
          />{" "}
        </div>
      </ChampionProvider>
    </ThemeProvider>
  );
}

export default App;
