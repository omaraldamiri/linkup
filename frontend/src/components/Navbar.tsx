import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  SearchIcon,
  PanelLeft,
  LogOut,
  Settings,
  UserCircle,
} from "lucide-react";
import { MoonIcon, SunIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { toggleTheme } from "../features/themeSlice";
import useAuth from "../hooks/useAuth";
import UserProfileDialog from "./Userprofiledialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

const Navbar = ({ setIsSidebarOpen }: NavbarProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useAppSelector((state) => state.theme.theme);
  const { user, logout } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const getInitial = () => user?.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <>
      <div className="w-full bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-6 xl:px-16 py-3 flex-shrink-0">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="sm:hidden p-2 rounded-lg transition-colors text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              <PanelLeft size={20} />
            </button>
            <div className="relative flex-1 max-w-sm">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-400 size-3.5" />
              <input
                type="text"
                placeholder="Search projects, tasks..."
                className="pl-8 pr-4 py-2 w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme — Redux */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="size-8 flex items-center justify-center bg-white dark:bg-zinc-800 shadow rounded-lg transition hover:scale-105 active:scale-95"
            >
              {theme === "light" ? (
                <MoonIcon className="size-4 text-gray-800" />
              ) : (
                <SunIcon className="size-4 text-yellow-400" />
              )}
            </button>

            {/* User dropdown — Context */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none rounded-full transition hover:ring-2 hover:ring-emerald-600 hover:ring-offset-2 dark:hover:ring-offset-zinc-900">
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="size-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="size-8 rounded-full bg-[#1a3a2e] flex items-center justify-center text-white text-xs font-bold">
                      {getInitial()}
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-56 mt-2"
                align="end"
                sideOffset={6}
              >
                <DropdownMenuLabel className="pb-2">
                  <div className="flex items-center gap-2.5">
                    {user?.image ? (
                      <img
                        src={user.image}
                        alt=""
                        className="size-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="size-8 rounded-full bg-[#1a3a2e] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {getInitial()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {user?.name ?? "User"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                        {user?.email ?? ""}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="cursor-pointer gap-2"
                    onClick={() => setProfileOpen(true)}
                  >
                    <UserCircle size={15} /> View profile
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem
                    className="cursor-pointer gap-2"
                    onClick={() => setProfileOpen(true)}
                  >
                    <Settings size={15} /> Manage account
                  </DropdownMenuItem> */}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="cursor-pointer gap-2 text-red-600 dark:text-red-400 focus:text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut size={15} /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <UserProfileDialog
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </>
  );
};

export default Navbar;
