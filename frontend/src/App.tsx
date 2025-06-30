import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import { ThemeProvider } from "./contexts/ThemeContext";
import { BiPlus, BiPlusCircle, BiGridAlt, BiListUl } from "react-icons/bi";
import AddAccountModal from "./components/AddAccountModal";
import AccountDetailsModal from "./components/AccountDetailsModal";
import GridCard from "./components/GridCard";
import ListCard from "./components/ListCard";
import { saveAccounts, loadAccounts, AccountData, updateAccountsWithPuuids } from "./utils/accountsManager";

// Função para formatar dados de elo
export const formatEloData = (eloData: any) => {
  if (!eloData || !eloData.elo || eloData.elo.length === 0) {
    return { tier: "UNRANKED", rank: "", lp: 0 };
  }

  // Prioriza RANKED_SOLO_5x5, senão pega o primeiro
  const soloQueue = eloData.elo.find((entry: any) => entry.queueType === "RANKED_SOLO_5x5");
  const rankData = soloQueue || eloData.elo[0];

  return {
    tier: rankData.tier || "UNRANKED",
    rank: rankData.rank || "",
    lp: rankData.leaguePoints || 0,
  };
};

// Função para determinar a cor da borda baseada no tier
export const getTierBorderColor = (tier: string): string => {
  switch (tier.toUpperCase()) {
    case "IRON":
      return "border-gray-600";
    case "BRONZE":
      return "border-amber-600";
    case "SILVER":
      return "border-gray-400";
    case "GOLD":
      return "border-yellow-400";
    case "PLATINUM":
      return "border-emerald-400";
    case "EMERALD":
      return "border-emerald-500";
    case "DIAMOND":
      return "border-blue-400";
    case "MASTER":
      return "border-purple-500";
    case "GRANDMASTER":
      return "border-red-500";
    case "CHALLENGER":
      return "border-amber-300";
    default:
      return "border-foreground";
  }
};

// Função para ordenar contas por elo (do mais alto para o mais baixo)
export const sortAccountsByElo = (accounts: AccountData[]): AccountData[] => {
  const tierOrder = {
    "CHALLENGER": 8,
    "GRANDMASTER": 7,
    "MASTER": 6,
    "DIAMOND": 5,
    "EMERALD": 4,
    "PLATINUM": 3,
    "GOLD": 2,
    "SILVER": 1,
    "BRONZE": 0,
    "IRON": -1,
    "UNRANKED": -2
  };

  const rankOrder = {
    "I": 4,
    "II": 3,
    "III": 2,
    "IV": 1,
    "": 0
  };

  return [...accounts].sort((a, b) => {
    const eloA = formatEloData(a.eloData);
    const eloB = formatEloData(b.eloData);

    // Compara por tier primeiro
    const tierDiff = (tierOrder[eloB.tier as keyof typeof tierOrder] || -2) - 
                    (tierOrder[eloA.tier as keyof typeof tierOrder] || -2);
    
    if (tierDiff !== 0) return tierDiff;

    // Se o tier for o mesmo, compara por rank
    const rankDiff = (rankOrder[eloB.rank as keyof typeof rankOrder] || 0) - 
                    (rankOrder[eloA.rank as keyof typeof rankOrder] || 0);
    
    if (rankDiff !== 0) return rankDiff;

    // Se tier e rank forem iguais, compara por LP
    return eloB.lp - eloA.lp;
  });
};

function App(): React.JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountData | null>(null);
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [isLoadingElo, setIsLoadingElo] = useState(false);
  const [ahriIcon, setAhriIcon] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    const saved = localStorage.getItem("accountViewMode");
    return (saved as "grid" | "list") || "list";
  });

  // Carrega as contas na inicialização
  useEffect(() => {
    const initAccounts = async () => {
      const loadedAccounts = await loadAccounts();
      setAccounts(loadedAccounts);

      // Busca PUUIDs e dados de elo para contas que não possuem
      if (loadedAccounts.length > 0) {
        setIsLoadingElo(true);
        const accountsWithPuuids = await updateAccountsWithPuuids(loadedAccounts);
        setAccounts(accountsWithPuuids);
        // Salva as contas atualizadas com PUUIDs e elo
        await saveAccounts(accountsWithPuuids);
        setIsLoadingElo(false);
      }
    };
    initAccounts();
  }, []);

  useEffect(() => {
    // Busca o ícone da Ahri do DataDragon
    fetch("https://ddragon.leagueoflegends.com/cdn/15.12.1/data/en_US/champion/Ahri.json")
      .then((res) => res.json())
      .then((data) => {
        const iconName = data.data.Ahri.image.full;
        setAhriIcon(`https://ddragon.leagueoflegends.com/cdn/15.12.1/img/champion/${iconName}`);
      });
  }, []);

  useEffect(() => {
    // Salva no arquivo JSON sempre que mudar
    if (accounts.length > 0) {
      saveAccounts(accounts);
    }
  }, [accounts]);

  // Salva a preferência de visualização
  useEffect(() => {
    localStorage.setItem("accountViewMode", viewMode);
  }, [viewMode]);

  const handleAddAccount = async (accountData: AccountData) => {
    // Busca o PUUID e dados de elo para a nova conta
    setIsLoadingElo(true);
    const accountsWithNewAccount = [...accounts, accountData];
    const updatedAccounts = await updateAccountsWithPuuids(accountsWithNewAccount);
    setAccounts(updatedAccounts);
    await saveAccounts(updatedAccounts);
    setIsLoadingElo(false);
    console.log("Account added:", accountData);
  };

  const handleAccountClick = (account: AccountData) => {
    setSelectedAccount(account);
    setIsDetailsModalOpen(true);
  };

  const handleSaveAccount = (updatedAccount: AccountData) => {
    const updatedAccounts = accounts.map((account) =>
      account.summonerName === updatedAccount.summonerName && account.tagline === updatedAccount.tagline
        ? updatedAccount
        : account
    );
    setAccounts(updatedAccounts);
    // A função saveAccounts será chamada automaticamente pelo useEffect
    console.log("Account updated:", updatedAccount);
  };

  const handleDeleteAccount = (accountToDelete: AccountData) => {
    const updatedAccounts = accounts.filter(
      (account) =>
        !(
          account.username === accountToDelete.username &&
          account.summonerName === accountToDelete.summonerName &&
          account.tagline === accountToDelete.tagline
        )
    );
    setAccounts(updatedAccounts);
    // A função saveAccounts será chamada automaticamente pelo useEffect
    console.log("Account deleted:", accountToDelete);
  };



  return (
    <ThemeProvider>
      <div className="bg-background min-h-screen flex flex-col relative">
        <Navbar />

        <div className="flex-1 flex flex-col items-center justify-start p-4">
          {accounts.length === 0 ? (
            <>
              <h1 className="text-4xl font-bold text-primary">Welcome!</h1>

              <p className="mt-4 opacity-30 text-center max-w-md">
                For start you need to add your account, don't worry all the password are encrypted.
              </p>

              <button
                onClick={() => setIsModalOpen(true)}
                className="flex flex-row items-center gap-2 mt-4 bg-primary text-background px-3 py-3 rounded-lg animate-pulse hover:cursor-pointer text-sm shadow-sm"
              >
                <BiPlus />
              </button>
            </>
          ) : (
            <>
              <div className="w-full flex flex-row justify-between items-center mb-6">
                <div className="flex flex-col">
                  <h2 className="text-2xl font-bold text-primary">My Accounts</h2>
                  <p className="text-sm opacity-30">
                    {accounts.length} account{accounts.length !== 1 ? "s" : ""} configured
                  </p>
                </div>
                <div className="flex flex-row gap-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2.5 rounded-sm hover:cursor-pointer transition-all ${
                      viewMode === "grid"
                        ? "bg-primary text-background shadow-lg"
                        : "bg-secondary text-primary hover:bg-secondary/80"
                    }`}
                    title="Grid View"
                  >
                    <BiGridAlt className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2.5 rounded-sm hover:cursor-pointer transition-all ${
                      viewMode === "list"
                        ? "bg-primary text-background shadow-lg"
                        : "bg-secondary text-primary hover:bg-secondary/80"
                    }`}
                    title="List View"
                  >
                    <BiListUl className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {viewMode === "grid" && (
                <div className="w-full flex flex-wrap gap-4 justify-start items-start">
                  {sortAccountsByElo(accounts).map((account, index) => (
                    <GridCard
                      key={index}
                      account={account}
                      index={index}
                      onClick={handleAccountClick}
                      ahriIcon={ahriIcon}
                      isLoadingElo={isLoadingElo}
                    />
                  ))}

                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-secondary/30 border-b-5 border-green-500 rounded-lg shadow-md p-6 justify-center items-center max-w-xs w-40 h-60 flex flex-col hover:cursor-pointer hover:border-b-0 hover:animate-pulse transition-all"
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
                      isLoadingElo={isLoadingElo}
                    />
                  ))}

                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-secondary/30 border-l-4 border-green-500 rounded-lg shadow-md p-6 w-full flex flex-row items-center justify-center gap-3 hover:cursor-pointer hover:bg-secondary/50 hover:shadow-lg transition-all group"
                  >
                    <div className="flex flex-col items-center">
                      <span className="flex flex-row items-center gap-1 text-xl font-bold text-primary">
                        {" "}
                        <BiPlusCircle className="w-5 h-5 text-green-500" />
                        Add New Account
                      </span>
                      <span className="text-sm opacity-60">Click to add another League of Legends account</span>
                    </div>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <AddAccountModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddAccount}
        />

        <AccountDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          account={selectedAccount}
          onSave={handleSaveAccount}
          onDelete={handleDeleteAccount}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
