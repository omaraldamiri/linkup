import { useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import { NavLink } from "react-router-dom";
import MyTasksSidebar from "./MyTasksSidebar";
import ProjectSidebar from "./ProjectsSidebar";
import WorkspaceDropdown from "./WorkspaceDropdown";
import { FolderOpenIcon, LayoutDashboardIcon, UsersIcon } from "lucide-react";

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }: SidebarProps) => {
  const menuItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboardIcon },
    { name: "Projects", href: "/projects", icon: FolderOpenIcon },
    { name: "Team", href: "/team", icon: UsersIcon },
  ];

  // HTMLDivElement tells TS exactly what type the ref points to
  // so .contains() and other DOM methods are available
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsSidebarOpen]);

  return (
    <div
      ref={sidebarRef}
      className={`z-10 bg-white dark:bg-zinc-900 min-w-68 flex flex-col h-screen border-r border-gray-200 dark:border-zinc-800 max-sm:absolute transition-all ${isSidebarOpen ? "left-0" : "-left-full"}`}
    >
      <WorkspaceDropdown />
      <hr className="border-gray-200 dark:border-zinc-800" />
      <div className="flex-1 overflow-y-scroll no-scrollbar flex flex-col">
        <div>
          <div className="p-4">
            {menuItems.map((item) => (
              <NavLink
                to={item.href}
                key={item.name}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-2 px-4 text-gray-800 dark:text-zinc-100 cursor-pointer rounded transition-all ${
                    isActive
                      ? "bg-gray-100 dark:bg-gradient-to-br dark:from-zinc-800 dark:to-zinc-800/50"
                      : "hover:bg-gray-50 dark:hover:bg-zinc-800/60"
                  }`
                }
              >
                <item.icon size={16} />
                <p className="text-sm truncate">{item.name}</p>
              </NavLink>
            ))}
          </div>
          <MyTasksSidebar />
          <ProjectSidebar />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
