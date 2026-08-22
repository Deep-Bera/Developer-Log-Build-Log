import { NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "../customHook/useThem";
import AuthContext from "../context/AuthContext";
import Logo from "../assets/favicon.svg";
import { useContext } from "react";
import {
  LayoutDashboard,
  FolderOpen,
  // ScrollText,
  Sparkles,
  Globe,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/Dashboard" },
  { label: "Projects", icon: FolderOpen, to: "/Projects" },
  // { label: "Logs", icon: ScrollText, to: "/Logs" },
  { label: "Ask AI", icon: Sparkles, to: "/AskAI" },
  { label: "Public feed", icon: Globe, to: "/PublicFeed" },
];

export default function Sidebar() {
  const { user } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // assinging the user name from the context ..
  const username = user?.user?.name || localStorage.getItem("username") || "U";
  const role = user?.role || localStorage.getItem("role") || "user";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/Login");
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-56 flex flex-col bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 z-50">
      {/* logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-neutral-200 dark:border-neutral-800">
        <img
          src={Logo}
          alt="Build Log"
          width={28}
          height={28}
          className="dark:brightness-200"
        />
        <span className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white">
          Build Log
        </span>
      </div>

      {/* nav items */}
      <nav className="flex flex-col gap-0.5 px-3 py-4 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-600 px-2 mb-2">
          Menu
        </p>
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${
                isActive
                  ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* bottom section */}
      <div className="px-3 pb-4 flex flex-col gap-0.5 border-t border-neutral-200 dark:border-neutral-800 pt-3">
        {/* dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors w-full"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>

        {/* logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400 transition-colors w-full"
        >
          <LogOut size={16} />
          Logout
        </button>

        {/* user info */}
        <div className="flex items-center gap-3 px-3 py-2 mt-1">
          <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xs font-semibold text-indigo-600 dark:text-indigo-300 uppercase shrink-0">
            {username.charAt(0)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium text-neutral-900 dark:text-white truncate capitalize">
              {username}
            </span>
            <span className="text-[11px] text-neutral-400 dark:text-neutral-500 capitalize">
              {role}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
