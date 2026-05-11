import { FolderOpen, CheckCircle, Users, AlertTriangle } from "lucide-react";

// TODO: replace with real API call when projects/tasks domain is implemented
const MOCK_PROJECTS = [
  { id: "1", name: "Website Redesign", status: "IN_PROGRESS", description: "Redesign the company website", createdAt: "2026-01-15" },
  { id: "2", name: "Mobile App", status: "TODO", description: "Build the mobile application", createdAt: "2026-02-01" },
  { id: "3", name: "API Integration", status: "COMPLETED", description: "Integrate third-party APIs", createdAt: "2026-01-20" },
  { id: "4", name: "Database Migration", status: "IN_PROGRESS", description: "Migrate to new database schema", createdAt: "2026-03-01" },
]

const MOCK_TASKS = [
  { id: "1", title: "Design mockups", status: "COMPLETED", priority: "HIGH", projectId: "1", assignee: "Jane Doe" },
  { id: "2", title: "Set up CI/CD pipeline", status: "IN_PROGRESS", priority: "MEDIUM", projectId: "2", assignee: "John Smith" },
  { id: "3", title: "Write unit tests", status: "TODO", priority: "LOW", projectId: "3", assignee: "Alice Johnson" },
  { id: "4", title: "Code review", status: "IN_PROGRESS", priority: "HIGH", projectId: "1", assignee: "Bob Wilson" },
  { id: "5", title: "Deploy to staging", status: "TODO", priority: "MEDIUM", projectId: "4", assignee: "Jane Doe" },
]

export default function StatsGrid() {
    const stats = {
        totalProjects: MOCK_PROJECTS.length,
        activeProjects: MOCK_PROJECTS.filter(
            (p) => p.status !== "CANCELLED" && p.status !== "COMPLETED"
        ).length,
        completedProjects: MOCK_PROJECTS.filter((p) => p.status === "COMPLETED").length,
        myTasks: MOCK_TASKS.length,
        overdueIssues: MOCK_TASKS.filter((t) => t.status !== "COMPLETED").length,
    };

    const statCards = [
        {
            icon: FolderOpen,
            title: "Total Projects",
            value: stats.totalProjects,
            subtitle: `projects in workspace`,
            bgColor: "bg-blue-500/10",
            textColor: "text-blue-500",
        },
        {
            icon: CheckCircle,
            title: "Completed Projects",
            value: stats.completedProjects,
            subtitle: `of ${stats.totalProjects} total`,
            bgColor: "bg-emerald-500/10",
            textColor: "text-emerald-500",
        },
        {
            icon: Users,
            title: "My Tasks",
            value: stats.myTasks,
            subtitle: "assigned to me",
            bgColor: "bg-purple-500/10",
            textColor: "text-purple-500",
        },
        {
            icon: AlertTriangle,
            title: "Overdue",
            value: stats.overdueIssues,
            subtitle: "need attention",
            bgColor: "bg-amber-500/10",
            textColor: "text-amber-500",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-9">
            {statCards.map(
                ({ icon: Icon, title, value, subtitle, bgColor, textColor }, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-950 dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition duration-200 rounded-md" >
                        <div className="p-6 py-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                                        {title}
                                    </p>
                                    <p className="text-3xl font-bold text-zinc-800 dark:text-white">
                                        {value}
                                    </p>
                                    {subtitle && (
                                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                                            {subtitle}
                                        </p>
                                    )}
                                </div>
                                <div className={`p-3 rounded-xl ${bgColor} bg-opacity-20`}>
                                    <Icon size={20} className={textColor} />
                                </div>
                            </div>
                        </div>
                    </div>
                )
            )}
        </div>
    );
}
