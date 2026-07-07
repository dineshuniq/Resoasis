import { db } from "@/db";
import { projects, clients } from "@/db/schema";
import { isNull, ilike, or, and } from "drizzle-orm";
import Link from "next/link";
import { CreateProjectForm } from "./create-project-form";
import { syncAllEmployeeAvailabilities } from "@/app/actions";

interface Props {
  searchParams: { q?: string };
}

export default async function ProjectsListPage({ searchParams }: Props) {
  const query = searchParams.q || "";

  // Self-heal employee availability status inconsistencies in the DB
  await syncAllEmployeeAvailabilities();

  const projectData = await db.query.projects.findMany({
    where: and(
      isNull(projects.deletedAt),
      query 
        ? or(
            ilike(projects.name, `%${query}%`), 
            ilike(projects.domain, `%${query}%`), 
            ilike(projects.projectManager, `%${query}%`),
            ilike(projects.projectLead, `%${query}%`)
          ) 
        : undefined
    ),
    with: {
      client: true
    }
  });

  const activeClients = await db.query.clients.findMany({
    where: isNull(clients.deletedAt),
    columns: { id: true, name: true },
  });

  return (
    <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Active Projects Matrix</h1>
          <p className="text-xs text-slate-500 mt-1">Operational view of active client scopes and delivery pipelines.</p>
        </div>
        <CreateProjectForm clients={activeClients} />
      </div>

      {/* Instant Filter input */}
      <form method="GET" className="w-full">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Filter by project name, domain, manager, or lead... (Press Enter)"
          className="w-full max-w-md h-9 text-xs px-3 rounded-md border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
        />
      </form>

      {/* Main Data Layout */}
      <div className="border border-slate-200 bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 font-mono text-xs text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 font-semibold">Project Name</th>
              <th className="py-3 px-4 font-semibold">Client</th>
              <th className="py-3 px-4 font-semibold">Domain</th>
              <th className="py-3 px-4 font-semibold">Leadership Team</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold">Priority</th>
              <th className="py-3 px-4 font-semibold text-right">Progress</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {projectData.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 font-mono">No matching project allocations located.</td>
              </tr>
            ) : (
              projectData.map((project) => (
                <tr key={project.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <Link href={`/projects/${project.id}`} className="hover:underline block">
                      {project.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">{project.client?.name || "Unlinked Client"}</td>
                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{project.domain}</td>
                  <td className="py-3 px-4">
                    <div className="text-slate-900 font-medium">PM: {project.projectManager}</div>
                    <div className="text-slate-500 text-[11px]">Lead: {project.projectLead}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center font-mono font-semibold text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {project.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-mono font-bold text-[10px] uppercase tracking-wide ${
                      project.priority === 'Critical' ? 'text-rose-600' : project.priority === 'High' ? 'text-amber-600' : 'text-slate-500'
                    }`}>
                      {project.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">{project.progress}%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}