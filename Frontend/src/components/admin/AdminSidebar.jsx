import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "../../customHook/useThem";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  LogOut,
  ShieldCheck,
  Moon,
  Sun,
  UserRound,
} from "lucide-react";
import Logo from "../../assets/favicon.svg";
import ProfileModal from "../ProfileModal";

export default function AdminSidebar() {
  const { user, dispatch } = useContext(AuthContext);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const username =
    user?.name ||
    user?.user?.name ||
    localStorage.getItem("username") ||
    "Admin";
  // capitalize first letter..
  const displayName = username.charAt(0).toUpperCase() + username.slice(1);

  const navItems = [
    { label: "Overview", icon: LayoutDashboard, to: "/Admin" },
    { label: "Users", icon: Users, to: "/Admin/users" },
    { label: "Projects", icon: FolderOpen, to: "/Admin/projects" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/Login");
  };

  const handleProfileUpdated = (updatedUser) => {
    if (updatedUser?.name) {
      localStorage.setItem("username", updatedUser.name);
    }
    dispatch({
      type: "Reload",
      payload: {
        ...user,
        ...updatedUser,
      },
    });
  };
  return (
    <aside className="fixed top-0 left-0 h-screen w-56 flex flex-col bg-slate-950 border-r border-amber-900/30 z-50">
      {/* logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-amber-900/30">
        <img
          src={Logo}
          alt="Build Log"
          width={28}
          height={28}
          className="brightness-200"
        />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white tracking-tight">
            Build Log
          </span>
          <div className="flex items-center gap-1">
            <ShieldCheck size={10} className="text-amber-400" />
            <span className="text-[10px] text-amber-400 font-medium tracking-wide uppercase">
              Admin
            </span>
          </div>
        </div>
      </div>

      {/* nav */}
      <nav className="flex flex-col gap-0.5 px-3 py-4 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 px-2 mb-2">
          Menu
        </p>
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={label}
            to={to}
            end={to === "/Admin"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-amber-500/15 text-amber-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* bottom */}
      <div className="px-3 pb-4 border-t border-amber-900/30 pt-3 flex flex-col gap-0.5">
        {/* dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors w-full"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
        {/* profile button */}
        <button
          onClick={() => setShowProfileModal(true)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors w-full"
        >
          <UserRound size={16} />
          Profile
        </button>
        {/* logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-950/50 hover:text-red-400 transition-colors w-full"
        >
          <LogOut size={16} />
          Logout
        </button>

        {/* user info */}
        <div className="flex items-center gap-3 px-3 py-2 mt-1">
          <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-semibold text-amber-400 uppercase shrink-0">
            {displayName.charAt(0)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium text-white truncate">
              {displayName}
            </span>
            <span className="text-[11px] text-amber-500">Administrator</span>
          </div>
        </div>
      </div>
      {showProfileModal && (
        <ProfileModal
          user={user?.user || user}
          onClose={() => setShowProfileModal(false)}
          onUpdated={handleProfileUpdated}
        />
      )}
    </aside>
  );
}
