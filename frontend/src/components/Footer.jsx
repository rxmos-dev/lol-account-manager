import React from "react";
import { SiGithub, SiLeagueoflegends } from "react-icons/si";

const Footer = () => {
  const handleExternalLink = (e) => {
    e.preventDefault();
    window.electron.shell.openExternal("https://github.com/yurirxmos");
  };

  return (
    <nav className="bg-secondary p-2 border-b border-border shadow-sm justify-center flex items-center">
      <a href="#" onClick={handleExternalLink} className="flex items-center text-foreground gap-2 text-sm opacity-20">
        <SiGithub />
        <p>@yurirxmos</p>
      </a>
    </nav>
  );
};

export default Footer;
