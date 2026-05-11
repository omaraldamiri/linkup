import {
  GitCommit,
  MessageSquare,
  Clock,
  Bug,
  Zap,
  Square,
} from "lucide-react";
import { format } from "date-fns";

// TODO: replace with real API call when projects/tasks domain is implemented
const MOCK_TASKS = [
  {
    id: "1",
    title: "Design mockups",
    status: "COMPLETED",
    priority: "HIGH",
    projectId: "1",
    assignee: "Jane Doe",
  },
  {
    id: "2",
    title: "Set up CI/CD pipeline",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    projectId: "2",
    assignee: "John Smith",
  },
  {
    id: "3",
    title: "Write unit tests",
    status: "TODO",
    priority: "LOW",
    projectId: "3",
    assignee: "Alice Johnson",
  },
  {
    id: "4",
    title: "Code review",
    status: "IN_PROGRESS",
    priority: "HIGH",
    projectId: "1",
    assignee: "Bob Wilson",
  },
  {
    id: "5",
    title: "Deploy to staging",
    status: "TODO",
    priority: "MEDIUM",
    projectId: "4",
    assignee: "Jane Doe",
  },
];

const typeIcons = {
  BUG: { icon: Bug, color: "text-red-500 dark:text-red-400" },
  FEATURE: { icon: Zap, color: "text-blue-500 dark:text-blue-400" },
  TASK: { icon: Square, color: "text-green-500 dark:text-green-400" },
  IMPROVEMENT: {
    icon: MessageSquare,
    color: "text-amber-500 dark:text-amber-400",
  },
  OTHER: { icon: GitCommit, color: "text-purple-500 dark:text-purple-400" },
};

const statusColors = {
  TODO: "bg-zinc-200 text-zinc-800 dark:bg-zinc-600 dark:text-zinc-200",
  IN_PROGRESS:
    "bg-amber-200 text-amber-800 dark:bg-amber-500 dark:text-amber-900",
  DONE: "bg-emerald-200 text-emerald-800 dark:bg-emerald-500 dark:text-emerald-900",
};

const RecentActivity = () => {
  const tasks = MOCK_TASKS;

  return (
    <div className="bg-white dark:bg-zinc-950 dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-lg transition-all overflow-hidden">
      <div className="border-b border-zinc-200 dark:border-zinc-800 p-4">
        <h2 className="text-lg text-zinc-800 dark:text-zinc-200">
          Recent Activity
        </h2>
      </div>

      <div className="p-0">
        {tasks.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-zinc-600 dark:text-zinc-500" />
            </div>
            <p className="text-zinc-600 dark:text-zinc-400">
              No recent activity
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {tasks.map((task) => {
              const TypeIcon = task.type
                ? typeIcons[task.type]?.icon || Square
                : Square;
              const iconColor = task.type
                ? typeIcons[task.type]?.color ||
                  "text-gray-500 dark:text-gray-400"
                : "text-gray-500 dark:text-gray-400";

              return (
                <div
                  key={task.id}
                  className="p-6 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg">
                      <TypeIcon className={`w-4 h-4 ${iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-zinc-800 dark:text-zinc-200 truncate">
                          {task.title}
                        </h4>
                        <span
                          className={`ml-2 px-2 py-1 rounded text-xs ${statusColors[task.status] || "bg-zinc-300 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"}`}
                        >
                          {task.status?.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                        {task.type && (
                          <span className="capitalize">
                            {task.type.toLowerCase()}
                          </span>
                        )}
                        {task.assignee && (
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 bg-zinc-300 dark:bg-zinc-700 rounded-full flex items-center justify-center text-[10px] text-zinc-800 dark:text-zinc-200">
                              {typeof task.assignee === "string"
                                ? task.assignee[0].toUpperCase()
                                : (task.assignee.name?.[0]?.toUpperCase() ??
                                  "?")}
                            </div>
                            {typeof task.assignee === "string"
                              ? task.assignee
                              : task.assignee.name}
                          </div>
                        )}
                        <span>
                          {task.updatedAt
                            ? format(new Date(task.updatedAt), "MMM d, h:mm a")
                            : "Just now"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
