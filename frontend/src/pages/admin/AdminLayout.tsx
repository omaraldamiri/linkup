import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  ArrowLeft,
  LogOut,
  MoonIcon,
  SunIcon,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { toggleTheme } from "../../features/themeSlice";

const navItems = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users, end: false },
  { to: "/admin/workspaces", label: "Workspaces", icon: Building2, end: false },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.theme);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100">
      <aside className="w-56 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col">
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            LinkUp
          </p>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Admin
          </h1>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <ArrowLeft size={16} />
            Back to app
          </button>
          <button
            type="button"
            onClick={() => dispatch(toggleTheme())}
            className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {theme === "light" ? <MoonIcon size={16} /> : <SunIcon size={16} />}
            Toggle theme
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
        {user && (
          <p className="px-5 pb-4 text-xs text-zinc-500 truncate">{user.email}</p>
        )}
      </aside>
      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
