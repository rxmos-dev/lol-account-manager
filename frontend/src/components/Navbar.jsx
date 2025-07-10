import { useState, useRef, useEffect } from "react";
import { HiMoon, HiSun } from "react-icons/hi";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { SiLeagueoflegends } from "react-icons/si";
import { PiGearBold } from "react-icons/pi";
import { IoMdClose } from "react-icons/io";
import { BsTranslate } from "react-icons/bs";
import { HiChevronDown } from "react-icons/hi";
import SettingsModal from "./SettingsModal";
import OverwriteConfirmationModal from "./OverwriteConfirmationModal";
import { LuMaximize2 } from "react-icons/lu";
import { MdMinimize } from "react-icons/md";
import { BiCloud, BiUser, BiLogOut, BiStar } from "react-icons/bi";
import { FcGoogle } from "react-icons/fc";
import { signOut, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase/config";
import { useAccounts } from "../hooks/useAccounts";
import { WiCloudRefresh } from "react-icons/wi";

const { ipcRenderer } = window.electron;

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { syncWithFirebase, forceUploadToFirebase, isLoading: accountsLoading } = useAccounts();
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isAuthMenuOpen, setIsAuthMenuOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncModalData, setSyncModalData] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const languageMenuRef = useRef(null);
  const authMenuRef = useRef(null);

  const handleCloseApp = async () => {
    try {
      await ipcRenderer.invoke("close-app");
    } catch (error) {
      console.error("Erro ao fechar aplicação:", error);
    }
  };

  const handleMinimizeApp = async () => {
    try {
      await ipcRenderer.invoke("minimize-app");
    } catch (error) {
      console.error("Erro ao minimizar aplicação:", error);
    }
  };

  const handleMaximizeApp = async () => {
    try {
      await ipcRenderer.invoke("maximize-app");
    } catch (error) {
      console.error("Erro ao maximizar aplicação:", error);
    }
  };

  const toggleLanguageMenu = () => {
    setIsLanguageMenuOpen(!isLanguageMenuOpen);
  };

  const toggleAuthMenu = () => {
    setIsAuthMenuOpen(!isAuthMenuOpen);
  };

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setIsLanguageMenuOpen(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setIsAuthMenuOpen(false);

    try {
      const provider = new GoogleAuthProvider();
      // Force account selection even if user is cached
      provider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log("Google login successful:", {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });
    } catch (error) {
      console.error("Google login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAuthMenuOpen(false);
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSyncWithFirebase = async () => {
    if (!user) {
      setSyncStatus('Login to sync');
      setTimeout(() => setSyncStatus(null), 3000);
      return;
    }

    try {
      console.log('🔄 Starting sync...');
      console.log('👤 User UID:', user.uid);
      
      setSyncStatus('Checking...');
      const result = await syncWithFirebase();
      
      if (result && result.requiresConfirmation) {
        setSyncModalData({
          existingAccountsCount: result.existingAccountsCount,
          localAccountsCount: result.localAccountsCount
        });
        setIsSyncModalOpen(true);
        setSyncStatus(null);
      } else if (result && result.success) {
        setSyncStatus('Synced!');
        
        setTimeout(() => setSyncStatus(null), 3000);
      } else {
        setSyncStatus('No accounts');
        setTimeout(() => setSyncStatus(null), 3000);
      }
    } catch (error) {
      setSyncStatus('Sync error');
      console.error('❌ Error:', error.message);
      setTimeout(() => setSyncStatus(null), 5000);
    }
  };

  const handleConfirmSync = async () => {
    try {
      setSyncStatus('Syncing...');
      setIsSyncModalOpen(false);
      await forceUploadToFirebase();
      setSyncStatus('Synced!');
      setTimeout(() => setSyncStatus(null), 3000);
    } catch (error) {
      setSyncStatus('Sync error');
      console.error('❌ Error:', error.message);
      setTimeout(() => setSyncStatus(null), 5000);
    }
  };

  const handleCancelSync = () => {
    setIsSyncModalOpen(false);
    setSyncModalData(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
        setIsLanguageMenuOpen(false);
      }
      if (authMenuRef.current && !authMenuRef.current.contains(event.target)) {
        setIsAuthMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="fixed z-50 w-full bg-secondary p-2.5 border-b border-border shadow-sm justify-between flex items-center drag-region">
      <div className="flex font-semibold items-center text-foreground gap-2 text-sm">
        <SiLeagueoflegends className="text-green-500" />
        <p>ACCOUNT MANAGER</p>
        <p className="text-[9px] font-sans opacity-20">#buildinpublic</p>
      </div>

      <div className="flex items-center justify-between gap-2 no-drag">
        <div
          className="relative"
          ref={authMenuRef}
        >
          <button
            onClick={toggleAuthMenu}
            disabled={isLoading}
            className="flex shadow-sm items-center text-foreground gap-2 border-foreground/20 hover:bg-sidebar/80 p-2 hover:cursor-pointer rounded-md transition-colors disabled:opacity-50"
          >
            {user ? (
              <div className="flex items-center gap-2 justify-center">
                <div className="flex items-center gap-1 text-[9px] bg-yellow-500/10 px-1.5 py-1 rounded-sm">
                  <BiStar className="text-yellow-400 w-2 h-2" />
                  premium
                </div>
                <span className="text-xs font-normal truncate">{user.displayName || user.email}</span>
                <HiChevronDown className={`w-3 h-3 transition-transform ${isAuthMenuOpen ? "rotate-180" : ""}`} />
              </div>
            ) : (
              <>
                <span className="text-xs">Login</span>
                <HiChevronDown className={`w-3 h-3 transition-transform ${isAuthMenuOpen ? "rotate-180" : ""}`} />
              </>
            )}
          </button>

          {isAuthMenuOpen && (
            <div className="absolute top-full left-0 mt-1 bg-sidebar border border-border rounded-md shadow-lg py-1 z-50 min-w-[180px]">
              {user ? (
                <>
                  <div className="px-3 py-2 border-b border-border">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-foreground">{user.displayName}</span>
                        <span className="text-[10px] text-foreground/60">{user.email}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleSyncWithFirebase}
                    disabled={isLoading || accountsLoading}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs font-medium hover:bg-sidebar/80 transition-colors hover:cursor-pointer text-foreground disabled:opacity-50"
                  >
                    <WiCloudRefresh className={`w-4 h-4 ${(isLoading || accountsLoading) ? 'animate-spin' : ''}`} />
                    {syncStatus || 'Sync'}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs font-medium hover:bg-sidebar/80 transition-colors hover:cursor-pointer text-foreground"
                  >
                    <BiLogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs font-medium hover:bg-sidebar/80 transition-colors hover:cursor-pointer text-foreground disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <FcGoogle className="w-4 h-4" />
                      Sign in with Google
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        <div
          className="relative"
          ref={languageMenuRef}
        >
          <button
            onClick={toggleLanguageMenu}
            className="flex shadow-sm items-center text-foreground gap-2 border border-foreground/20 hover:bg-sidebar/80 p-2 hover:cursor-pointer rounded-md transition-colors"
          >
            <BsTranslate className="w-3 h-3" />
            <HiChevronDown className={`w-3 h-3 transition-transform ${isLanguageMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {isLanguageMenuOpen && (
            <div className="absolute top-full right-0 mt-1 bg-sidebar border border-border rounded-md shadow-lg py-1 z-50 min-w-[120px]">
              <button
                onClick={() => handleLanguageSelect("English")}
                className={`flex flex-row gap-1 items-center w-full text-left px-3 py-2 text-xs font-medium hover:bg-sidebar/80 transition-colors hover:cursor-pointer ${
                  selectedLanguage === "English" ? "text-green-500" : "text-foreground"
                }`}
              >
                English
                <p className="text-[9px] opacity-40">[en_US]</p>
              </button>
              <button
                onClick={() => handleLanguageSelect("Português")}
                className={`flex flex-row gap-1 items-center w-full text-left px-3 py-2 text-xs font-medium hover:bg-sidebar/80 transition-colors hover:cursor-pointer ${
                  selectedLanguage === "Português" ? "text-green-500" : "text-foreground"
                }`}
              >
                Português
                <p className="text-[9px] opacity-40">[pt_BR]</p>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={toggleTheme}
          className="flex shadow-sm items-center text-foreground gap-2 border-1 border-foreground/20 hover:bg-sidebar/80 p-2 hover:cursor-pointer rounded-md transition-colors"
          title={`Alternar para modo ${theme === "dark" ? "claro" : "escuro"}`}
        >
          {theme === "dark" ? <HiSun className="w-3 h-3" /> : <HiMoon className="w-3 h-3" />}
        </button>

        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className="flex shadow-sm items-center text-foreground gap-2 border border-foreground/20 hover:bg-sidebar/80 p-2 hover:cursor-pointer rounded-md transition-colors"
        >
          <PiGearBold className="w-3 h-3" />
        </button>

        <div className="flex flex-row gap-2 items-center border border-foreground/20 rounded-md py-0.5">
          <button
            onClick={handleMinimizeApp}
            className="flex items-center text-foreground gap-2 p-2 hover:cursor-pointer hover:bg-background/50 rounded-md transition-all"
          >
            <MdMinimize className="w-3 h-3 " />
          </button>
          <button
            onClick={handleMaximizeApp}
            className="flex items-center text-foreground gap-2 p-2 hover:cursor-pointer hover:bg-background/50 rounded-md transition-all"
          >
            <LuMaximize2 className="w-3 h-3" />
          </button>
          <button
            onClick={handleCloseApp}
            className="flex items-center text-foreground gap-2 p-2 hover:cursor-pointer hover:bg-red-600 rounded-md transition-all"
          >
            <IoMdClose className="w-3 h-3" />
          </button>
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
      
      <OverwriteConfirmationModal
        isOpen={isSyncModalOpen}
        onClose={handleCancelSync}
        onConfirm={handleConfirmSync}
        localAccountsCount={syncModalData?.localAccountsCount || 0}
        existingAccountsCount={syncModalData?.existingAccountsCount || 0}
      />
    </nav>
  );
};

export default Navbar;
