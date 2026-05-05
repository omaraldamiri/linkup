import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useWorkspace from "../hooks/useWorkspace";
import CreateWorkspaceDialog from "./CreateWorkspaceDialog";

function WorkspaceDropdown() {
  const navigate = useNavigate();
  // Workspace list comes from AuthContext (set on login/bootstrap)
  const { workspaces } = useAuth();
  // Current selection managed by WorkspaceContext
  const { currentWorkspace, selectWorkspace } = useWorkspace();

  const [isOpen, setIsOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const onSelectWorkspace = (id: string) => {
    selectWorkspace(id);
    setIsOpen(false);
    navigate("/");
  };

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative m-4" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between p-3 h-auto text-left rounded hover:bg-gray-100 dark:hover:bg-zinc-800"
      >
        <div className="flex items-center gap-3">
          {currentWorkspace?.imageUrl ? (
            <img
              src={currentWorkspace.imageUrl}
              alt={currentWorkspace.name}
              className="w-8 h-8 rounded shadow object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded shadow bg-[#1a3a2e] flex items-center justify-center text-white text-xs font-bold">
              {currentWorkspace?.name?.charAt(0).toUpperCase() ?? "?"}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">
              {currentWorkspace?.name ?? "Select Workspace"}
            </p>
            <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
              {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-zinc-400 flex-shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-64 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded shadow-lg top-full left-0">
          <div className="p-2">
            <p className="text-xs text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2 px-2">
              Workspaces
            </p>
            {workspaces.map((ws) => (
              <div
                key={ws.id}
                onClick={() => onSelectWorkspace(ws.id)}
                className="flex items-center gap-3 p-2 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                {ws.imageUrl ? (
                  <img
                    src={ws.imageUrl}
                    alt={ws.name}
                    className="w-6 h-6 rounded object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded bg-[#1a3a2e] flex items-center justify-center text-white text-xs font-bold">
                    {ws.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                    {ws.name}
                  </p>
                  {ws.description && (
                    <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                      {ws.description}
                    </p>
                  )}
                </div>
                {currentWorkspace?.id === ws.id && (
                  <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>

          <hr className="border-gray-200 dark:border-zinc-700" />

          <div className="p-2">
            <button
              onClick={() => {
                setIsOpen(false);
                setShowCreate(true);
              }}
              className="flex items-center text-xs gap-2 my-1 w-full text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
            >
              <Plus className="w-4 h-4" />
              Create Workspace
            </button>
          </div>
        </div>
      )}

      <CreateWorkspaceDialog
        open={showCreate}
        onOpenChange={setShowCreate}
      />
    </div>
  );
}

export default WorkspaceDropdown;
