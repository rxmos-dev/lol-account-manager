import { BsFillHeartFill } from "react-icons/bs";
import { FiAlertTriangle } from "react-icons/fi";
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

      <p className="flex space-x-2 opacity-70 animate-pulse">
        <span className="text-xs"> be careful! you're not using cloud storage</span>
        <FiAlertTriangle className=" text-yellow-500" />
      </p>
    </nav>
  );
};

export default Footer;
