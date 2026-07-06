import { db } from '../../../db';
import { employees } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";

interface Props {
  params: { id: string };
}

export default async function EmployeeDetailPage({ params }: Props) {
  const employee = await db.query.employees.findFirst({
    where: and(eq(employees.id, params.id), isNull(employees.deletedAt)),
    with: {
      projects: {
        with: {
          project: true
        }
      }
    }
  });

  if (!employee) {
    notFound();
  }

  return (
    <div className="p-8 max-w-4xl w-full mx-auto space-y-8">
      <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
        <Link href="/employees" className="hover:text-slate-600 transition-colors">EMPLOYEES</Link>
        <span>/</span>
        <span className="text-slate-600">{employee.name.toUpperCase()}</span>
      </div>

      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">{employee.name}</h1>
        <p className="text-xs text-slate-500 mt-1">{employee.designation} &mdash; <span className="font-mono text-[11px]">{employee.department}</span></p>
      </div>

      <div className="space-y-6">
        {/* Core Attributes Profile */}
        <div className="border border-slate-200 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 mb-4">Resource Operational Metadata</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs">
            <div>
              <div className="text-slate-400 font-mono mb-0.5">Line Manager</div>
              <div className="font-semibold text-slate-900">{employee.reportingManager}</div>
            </div>
            <div>
              <div className="text-slate-400 font-mono mb-0.5">Availability Parameter</div>
              <div className="mt-0.5">
                <span className="px-2 py-0.5 font-mono text-[10px] font-bold rounded-full bg-slate-100 text-slate-800">{employee.availabilityStatus}</span>
              </div>
            </div>
            <div>
              <div className="text-slate-400 font-mono mb-0.5">Total Assigned Load</div>
              <div className="font-mono text-base font-black text-slate-900">{employee.currentAllocation}%</div>
            </div>
            <div>
              <div className="text-slate-400 font-mono mb-0.5">Communication Trunk</div>
              <div className="font-mono text-slate-600 text-[11px]">{employee.email}<br />{employee.phone}</div>
            </div>
          </div>
        </div>

        {/* Assigned Engagements Cross-Reference Table */}
        <div className="border border-slate-200 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 bg-white border-b border-slate-100">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400">Active Operational Commitments</h2>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-mono text-[11px] text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-4 font-semibold">Project Code Scope</th>
                <th className="py-2.5 px-4 font-semibold">Domain Segment</th>
                <th className="py-2.5 px-4 font-semibold">Delivery Owner (PM)</th>
                <th className="py-2.5 px-4 font-semibold text-right">Project Execution Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {employee.projects.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-400 font-mono">Resource currently unallocated (Bench Asset).</td>
                </tr>
              ) : (
                employee.projects.map(({ project }) => (
                  <tr key={project.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-slate-900">
                      <Link href={`/projects/${project.id}`} className="hover:underline">
                        {project.name}
                      </Link>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">{project.domain}</td>
                    <td className="py-2.5 px-4 text-slate-600">{project.projectManager}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{project.progress}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Remarks Entry */}
        <div className="border border-slate-200 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 mb-3">Internal Profile Logs</h2>
          <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
            {employee.remarks || "No raw profile exceptions logged."}
          </p>
        </div>
      </div>
    </div>
  );
}