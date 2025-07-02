import { useState, useRef, useEffect } from "react";
import { HiMoon, HiSun } from "react-icons/hi";
import { useTheme } from "../contexts/ThemeContext";
import { SiLeagueoflegends } from "react-icons/si";
import { PiGearBold } from "react-icons/pi";
import { IoMdClose } from "react-icons/io";
import { BsTranslate } from "react-icons/bs";
import { HiChevronDown } from "react-icons/hi";
import SettingsModal from "./SettingsModal";
import { LuMaximize2 } from "react-icons/lu";
import { MdMinimize } from "react-icons/md";

const { ipcRenderer } = window.electron;

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("Português");
  const languageMenuRef = useRef(null);

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

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setIsLanguageMenuOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
        setIsLanguageMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-secondary p-2.5 border-b border-border shadow-sm justify-between flex items-center drag-region">
      <div className="flex font-semibold items-center text-foreground gap-2 text-sm">
        <SiLeagueoflegends />
        <p>ACCOUNT MANAGER</p>
        <p className="text-[9px] font-sans opacity-20">#buildinpublic</p>
      </div>

      <div className="flex items-center justify-between gap-2 no-drag">
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
                className={`flex flex-row gap-1 items-center w-full text-left px-3 py-2 text-xs font-medium hover:bg-sidebar/80 transition-colors ${
                  selectedLanguage === "English" ? "text-blue-500" : "text-foreground"
                }`}
              >
                English
                <p className="text-[9px] opacity-40">[en_US]</p>
              </button>
              <button
                onClick={() => handleLanguageSelect("Português")}
                className={`flex flex-row gap-1 items-center w-full text-left px-3 py-2 text-xs font-medium hover:bg-sidebar/80 transition-colors ${
                  selectedLanguage === "Português" ? "text-blue-500" : "text-foreground"
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
    </nav>
  );
};

export default Navbar;
