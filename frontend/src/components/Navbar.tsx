import { useState, useRef, useEffect } from "react";
import { HiMoon, HiSun } from "react-icons/hi";
import { useTheme } from "../contexts/ThemeContext";
import { SiLeagueoflegends } from "react-icons/si";
import { PiGearBold } from "react-icons/pi";
import { BsTranslate } from "react-icons/bs";
import { HiChevronDown } from "react-icons/hi";
import SettingsModal from "./SettingsModal";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const languageMenuRef = useRef(null);

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
    <nav className="fixed z-50 w-full bg-secondary px-5 py-1 justify-between flex items-center drag-region">
      <div className="flex font-semibold items-center text-foreground gap-2 text-sm">
        <SiLeagueoflegends className="text-green-500" />
        <p className="text-[9px] font-sans opacity-20">#buildinpublic</p>
      </div>

      <div className="flex items-center justify-between gap-2 no-drag">
        <div
          className="relative"
          ref={languageMenuRef}
        >
          <button
            onClick={toggleLanguageMenu}
            className="flex shadow-sm items-center text-foreground gap-2  hover:bg-sidebar/80 p-2 hover:cursor-pointer rounded-md transition-colors"
          >
            <BsTranslate className="w-3.5 h-3.5" />
            <HiChevronDown className={`w-3.5 h-3.5 transition-transform ${isLanguageMenuOpen ? "rotate-180" : ""}`} />
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
                onClick={() => handleLanguageSelect("Portuguese")}
                className={`flex flex-row gap-1 items-center w-full text-left px-3 py-2 text-xs font-medium hover:bg-sidebar/80 transition-colors hover:cursor-pointer ${
                  selectedLanguage === "Portuguese" ? "text-green-500" : "text-foreground"
                }`}
              >
                Portuguese
                <p className="text-[9px] opacity-40">[pt_BR]</p>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={toggleTheme}
          className="flex shadow-sm items-center text-foreground gap-2 hover:bg-sidebar/80 p-2 hover:cursor-pointer rounded-md transition-colors"
          title={`Alternar para modo ${theme === "dark" ? "claro" : "escuro"}`}
        >
          {theme === "dark" ? <HiSun className="w-3.5 h-3.5" /> : <HiMoon className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className="flex shadow-sm items-center text-foreground gap-2  hover:bg-sidebar/80 p-2 hover:cursor-pointer rounded-md transition-colors"
        >
          <PiGearBold className="w-3.5 h-3.5" />
        </button>
      </div>

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </nav>
  );
};

export default Navbar;
