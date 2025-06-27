import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import { ThemeProvider } from "./contexts/ThemeContext";
import { BiPlus, BiPlusCircle, BiUser, BiUserCircle } from "react-icons/bi";
import AddAccountModal from "./components/AddAccountModal";
import { PiLockers } from "react-icons/pi";
import { MdLock } from "react-icons/md";

interface AccountData {
  region: string;
  username: string;
  password: string;
  summonerName: string;
  tagline: string;
}

function App(): React.JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accounts, setAccounts] = useState<AccountData[]>(() => {
    // Carrega do localStorage ao iniciar
    const stored = localStorage.getItem("accounts");
    return stored ? JSON.parse(stored) : [];
  });

  const [ahriIcon, setAhriIcon] = useState<string | null>(null);

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
    // Salva no localStorage sempre que mudar
    localStorage.setItem("accounts", JSON.stringify(accounts));
  }, [accounts]);

  const handleAddAccount = (accountData: AccountData) => {
    setAccounts((prev) => [...prev, accountData]);
    console.log("Account added:", accountData);
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
            <div className="w-full flex flex-wrap gap-4 justify-start items-start mt-4">
              {accounts.map((account, index) => (
                <>
                  <div
                    key={index}
                    className="bg-secondary border-b-5 border-red-500 rounded-lg shadow-md p-6 justify-center items-center max-w-xs w-40 h-60 flex flex-col hover:cursor-pointer hover:border-b-0 hover:animate-pulse transition-all"
                  >
                    <div className="flex flex-col items-center text-sm font-semibold text-primary">
                      {account.summonerName}
                      <p className="opacity-30 text-xs font-normal">#{account.tagline}</p>
                    </div>

                    <div className="flex flex-row items-center justify-center gap-2 mt-4">
                      <p className="text-sm font-bold">DIAMOND I</p>
                    </div>

                    <div className="flex flex-row items-center justify-center gap-2 mt-4">
                      <p className="text-xs">MID</p>
                    </div>

                    <div className="flex flex-row items-center justify-center gap-2 mt-4">
                      <div className="flex flex-col items-center text-xs gap-1">
                        <img
                          src={ahriIcon}
                          alt="Ahri Icon"
                          className="w-8 h-8 rounded-sm"
                        />
                        55%
                      </div>
                      <div className="flex flex-col items-center text-xs gap-1">
                        <img
                          src={ahriIcon}
                          alt="Ahri Icon"
                          className="w-8 h-8 rounded-sm"
                        />
                        55%
                      </div>
                      <div className="flex flex-col items-center text-xs gap-1">
                        <img
                          src={ahriIcon}
                          alt="Ahri Icon"
                          className="w-8 h-8 rounded-sm"
                        />
                        55%
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsModalOpen(true)}
                    key={`plus-${index}`}
                    className="bg-secondary/30 border border-background/20 rounded-lg shadow-md p-6 justify-center items-center max-w-xs w-40 h-60 flex flex-col hover:cursor-pointer hover:scale-105 transition-transform duration-200"
                  >
                    <BiPlusCircle className="w-10 h-10 mb-1" />
                  </button>
                </>
              ))}
            </div>
          )}
        </div>

        <AddAccountModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddAccount}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
