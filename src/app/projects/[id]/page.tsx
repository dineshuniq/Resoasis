import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";

interface Props {
  params: { id: string };
}

export default async function ProjectDetailPage({ params }: Props) {
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, params.id), isNull(projects.deletedAt)),
    with: {
      client: true,
      milestones: true,
      dailyUpdates: {
        orderBy: (updates, { desc }) => [desc(updates.date)]
      },
      resources: {
        with: {
          employee: true
        }
      }
    }
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="p-8 max-w-5xl w-full mx-auto space-y-8">
      {/* Structural Context Trail */}
      <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
        <Link href="/projects" className="hover:text-slate-600 transition-colors">PROJECTS</Link>
        <span>/</span>
        <span className="text-slate-600">{project.name.toUpperCase()}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">{project.name}</h1>
          <p className="text-xs text-slate-500 mt-1">Client Domain: <span className="font-medium text-slate-700">{project.client?.name}</span></p>
        </div>
        <div className="flex items-center gap-4 text-right">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Completion Track</div>
            <div className="text-2xl font-mono font-black text-slate-900">{project.progress}%</div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Row 1: Key Metadata Vectors */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border border-slate-200 bg-white p-4 rounded-lg shadow-sm">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Operational Status</span>
            <span className="text-xs font-bold text-slate-900 block mt-1 font-mono">{project.status}</span>
          </div>
          <div className="border border-slate-200 bg-white p-4 rounded-lg shadow-sm">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Priority Classification</span>
            <span className="text-xs font-bold text-rose-600 block mt-1 font-mono">{project.priority}</span>
          </div>
          <div className="border border-slate-200 bg-white p-4 rounded-lg shadow-sm">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Project Leadership Team</span>
            <span className="text-xs text-slate-900 block mt-1">PM: {project.projectManager}<br />Lead: {project.projectLead}</span>
          </div>
          <div className="border border-slate-200 bg-white p-4 rounded-lg shadow-sm">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Target Timeline Bounds</span>
            <span className="text-xs font-mono text-slate-600 block mt-1">
              Start: {new Date(project.startDate).toLocaleDateString()}<br />
              End: {new Date(project.expectedCompletionDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Row 2: Description Scope Block */}
        <div className="border border-slate-200 bg-white p-5 rounded-lg shadow-sm">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 mb-3">Project Target Definition</h2>
          <p className="text-xs text-slate-700 leading-relaxed font-sans">{project.description}</p>
        </div>

        {/* Row 3: Assigned Workforce Node Matrix */}
        <div className="border border-slate-200 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 bg-white border-b border-slate-100">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400">Allocated Operational Allocation Squad</h2>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {project.resources.length === 0 ? (
              <div className="text-xs text-slate-400 font-mono py-2 col-span-full text-center">No assigned human resources mapped to this project scope.</div>
            ) : (
              project.resources.map(({ employee }) => (
                <Link href={`/employees/${employee.id}`} key={employee.id} className="border border-slate-100 bg-slate-50/50 p-3 rounded-md hover:bg-slate-50 transition-colors block">
                  <div className="text-xs font-bold text-slate-900">{employee.name}</div>
                  <div className="text-[11px] text-slate-500">{employee.designation} ({employee.department})</div>
                  <div className="text-[10px] font-mono text-amber-600 font-bold mt-1">Internal Load: {employee.currentAllocation}%</div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Row 4: Milestones Realization Table */}
        <div className="border border-slate-200 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 bg-white border-b border-slate-100">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400">Execution Delivery Milestones</h2>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-mono text-[11px] text-slate-500 uppercase tracking-wider">
                <th className="py-2 px-4 font-semibold">Milestone Object Target</th>
                <th className="py-2 px-4 font-semibold">Owner Node</th>
                <th className="py-2 px-4 font-semibold">Target Target Window</th>
                <th className="py-2 px-4 font-semibold text-right">Completion Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {project.milestones.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-400 font-mono">No structural execution milestones configured.</td>
                </tr>
              ) : (
                project.milestones.map((milestone) => (
                  <tr key={milestone.id}>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{milestone.title}</td>
                    <td className="py-2.5 px-4 text-slate-600">{milestone.owner}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-500 text-[11px]">
                      {new Date(milestone.startDate).toLocaleDateString()} &rarr; {new Date(milestone.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{milestone.progress}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Row 5: Chronological Activity Stream Logs */}
        <div className="border border-slate-200 bg-white rounded-lg shadow-sm p-5">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 mb-4">Chronological Daily Updates Pipeline</h2>
          <div className="space-y-4">
            {project.dailyUpdates.length === 0 ? (
              <p className="text-xs text-slate-400 font-mono py-2 text-center">No structural timeline update statements submitted.</p>
            ) : (
              project.dailyUpdates.map((update) => (
                <div key={update.id} className="border-l-2 border-slate-200 pl-4 space-y-1">
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="font-mono font-bold text-slate-900">{new Date(update.date).toLocaleDateString('en-GB')}</span>
                    <span className="text-slate-400">|</span>
                    <span className="font-mono text-slate-500">Log By: {update.updatedBy}</span>
                  </div>
                  <p className="text-xs text-slate-800 leading-normal font-sans whitespace-pre-wrap">{update.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}