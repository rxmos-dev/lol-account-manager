import { FiAlertTriangle } from "react-icons/fi";
import { SiGithub } from "react-icons/si";
import { useAuth } from "../contexts/AuthContext";
import { BsFillCloudCheckFill } from "react-icons/bs";
import { useFirebaseAccounts } from "../hooks/useFirebaseAccounts";
import { useAccounts } from "../hooks/useAccounts";
import { useState, useEffect } from "react";

const Footer = () => {
  const { user } = useAuth();
  const { accounts: firebaseAccounts } = useFirebaseAccounts();
  const { accounts: localAccounts } = useAccounts();
  const [isSynced, setIsSynced] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsSynced(true);
      return;
    }

    const localAccountsMap = new Map(localAccounts.map(acc => [acc.username, acc.lastUpdated || 0]));
    const firebaseAccountsMap = new Map(firebaseAccounts.map(acc => [acc.username, acc.lastUpdated || 0]));

    if (localAccountsMap.size !== firebaseAccountsMap.size) {
      setIsSynced(false);
      return;
    }

    for (const [username, localTime] of localAccountsMap) {
      const firebaseTime = firebaseAccountsMap.get(username);
      if (firebaseTime === undefined || localTime !== firebaseTime) {
        setIsSynced(false);
        return;
      }
    }

    setIsSynced(true);
  }, [user, localAccounts, firebaseAccounts]);

  const handleExternalLink = (e) => {
    e.preventDefault();
    window.electron.shell.openExternal("https://github.com/yurirxmos");
  };

  return (
    <nav className="fixed bottom-0 w-full flex flex-row justify-between bg-secondary p-2 border-b border-border shadow-sm items-center">
      <a
        href="#"
        onClick={handleExternalLink}
        className="flex items-center text-foreground gap-2 text-sm opacity-10"
      >
        <SiGithub />
        <p>@yurirxmos</p>
      </a>

      {user ? (
        isSynced ? (
          <p className="flex items-center gap-1.5 justify-center opacity-70 text-blue-400">
            <BsFillCloudCheckFill className="w-3 h-3"/>
            <span className="text-[10px]">cloud synced</span>
          </p>
        ) : (
          <p className="flex items-center gap-1.5 justify-center opacity-70 animate-pulse text-yellow-500">
            <FiAlertTriangle className="w-3 h-3"/>
            <span className="text-[10px]">sync needed</span>
          </p>
        )
      ) : (
        <p className="flex space-x-2 opacity-70 animate-pulse">
          <span className="text-xs"> be careful! you're not using cloud storage</span>
          <FiAlertTriangle className=" text-yellow-500" />
        </p>
      )}
    </nav>
  );
};

export default Footer;
