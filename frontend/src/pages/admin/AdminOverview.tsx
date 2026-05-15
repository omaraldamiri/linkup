import { useEffect } from "react";
import { Users, Building2, FolderOpen, ListTodo, UserPlus } from "lucide-react";
import useAdmin from "../../hooks/useAdmin";

const AdminOverview = () => {
  const { stats, statsLoading, fetchStats } = useAdmin();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const cards = [
    {
      label: "Total users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      iconColor: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Workspaces",
      value: stats?.totalWorkspaces ?? 0,
      icon: Building2,
      iconColor: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Projects",
      value: stats?.totalProjects ?? 0,
      icon: FolderOpen,
      iconColor: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Tasks",
      value: stats?.totalTasks ?? 0,
      icon: ListTodo,
      iconColor: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Signups (7 days)",
      value: stats?.signupsLast7Days ?? 0,
      icon: UserPlus,
      iconColor: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
    {
      label: "Signups (30 days)",
      value: stats?.signupsLast30Days ?? 0,
      icon: UserPlus,
      iconColor: "text-pink-500",
      bg: "bg-pink-500/10",
    },
  ];

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
          Platform overview
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          System-wide health and growth metrics
        </p>
      </div>

      {statsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(({ label, value, icon: Icon, iconColor, bg }) => (
            <div
              key={label}
              className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
            >
              <div className={`inline-flex p-2 rounded-lg mb-3 ${bg}`}>
                <Icon size={20} className={iconColor} />
              </div>
              <p className="text-2xl font-semibold text-zinc-900 dark:text-white">
                {value.toLocaleString()}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                {label}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOverview;
