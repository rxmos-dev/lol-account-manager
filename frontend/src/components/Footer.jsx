import { BsFillHeartFill } from "react-icons/bs";
import { SiGithub } from "react-icons/si";

const Footer = () => {
  const handleExternalLink = (e) => {
    e.preventDefault();
    window.electron.shell.openExternal("https://github.com/yurirxmos");
  };

  return (
    <nav className="flex flex-row justify-between bg-secondary p-2 border-b border-border shadow-sm items-center">
      <a
        href="#"
        onClick={handleExternalLink}
        className="flex items-center text-foreground gap-2 text-sm opacity-10"
      >
        <SiGithub />
        <p>@yurirxmos</p>
      </a>

      <button className="flex shadow-sm items-center text-foreground gap-2 bg-sidebar hover:bg-sidebar/80 p-2 hover:cursor-pointer rounded-md transition-colors animate-pulse">
        <BsFillHeartFill className="w-3 h-3 text-red-500" />
        <p className="text-xs font-bold">DONATE</p>
      </button>
    </nav>
  );
};

export default Footer;
