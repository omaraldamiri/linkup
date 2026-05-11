import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FolderOpen, Calendar, UsersIcon } from "lucide-react";
import { format } from "date-fns";
import CreateProjectDialog from "./CreateProjectDialog";

// TODO: replace with real API call when projects/tasks domain is implemented
const MOCK_PROJECTS = [
  {
    id: "1",
    name: "Website Redesign",
    status: "IN_PROGRESS",
    description: "Redesign the company website",
    createdAt: "2026-01-15",
    progress: 75,
    end_date: "2026-06-15",
    members: [1, 2],
  },
  {
    id: "2",
    name: "Mobile App",
    status: "TODO",
    description: "Build the mobile application",
    createdAt: "2026-02-01",
    progress: 10,
    end_date: "2026-08-01",
    members: [1],
  },
  {
    id: "3",
    name: "API Integration",
    status: "COMPLETED",
    description: "Integrate third-party APIs",
    createdAt: "2026-01-20",
    progress: 100,
    end_date: "2026-03-20",
    members: [1, 2, 3],
  },
  {
    id: "4",
    name: "Database Migration",
    status: "IN_PROGRESS",
    description: "Migrate to new database schema",
    createdAt: "2026-03-01",
    progress: 40,
    end_date: "2026-05-01",
    members: [2],
  },
];

const ProjectOverview = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const projects = MOCK_PROJECTS;

  return (
    <div className="bg-white dark:bg-zinc-950 dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 rounded-lg overflow-hidden">
      <div className="border-b border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between">
        <h2 className="text-md text-zinc-800 dark:text-zinc-300">
          Project Overview
        </h2>
        <Link
          to={"/projects"}
          className="text-sm text-zinc-600 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 flex items-center"
        >
          View all <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>

      <div className="p-0">
        {projects.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-500 rounded-full flex items-center justify-center">
              <FolderOpen size={32} />
            </div>
            <p className="text-zinc-600 dark:text-zinc-400">No projects yet</p>
            <button
              onClick={() => setIsDialogOpen(true)}
              className="mt-4 px-4 py-2 text-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white dark:text-zinc-200 rounded hover:opacity-90 transition"
            >
              Create your First Project
            </button>
            <CreateProjectDialog
              isDialogOpen={isDialogOpen}
              setIsDialogOpen={setIsDialogOpen}
            />
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {projects.slice(0, 5).map((project) => (
              <Link
                key={project.id}
                to={`/projectsDetail?id=${project.id}&tab=tasks`}
                className="block p-6 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-zinc-800 dark:text-zinc-300 mb-1">
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      {project.members && project.members.length > 0 && (
                        <div className="flex items-center gap-1">
                          <UsersIcon className="w-3 h-3" />
                          {project.members.length} members
                        </div>
                      )}
                      {project.end_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(project.end_date), "MMM d, yyyy")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 dark:text-zinc-500">
                      Progress
                    </span>
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {project.progress || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded h-1.5">
                    <div
                      className="h-1.5 bg-blue-500 rounded"
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectOverview;
