import { SiGithub } from "react-icons/si";

const Footer = () => {
  const handleExternalLink = (e) => {
    e.preventDefault();
    window.electron.shell.openExternal("https://github.com/yurirxmos");
  };

  return (
    <nav className="fixed bottom-0 w-full flex flex-row justify-between  p-2 border-b border-border shadow-sm items-center">
      <a
        href="#"
        onClick={handleExternalLink}
        className="flex items-center text-foreground gap-2 text-sm opacity-10"
      >
        <SiGithub />
        <p>@yurirxmos</p>
      </a>
    </nav>
  );
};

export default Footer;
