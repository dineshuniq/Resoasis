import { db } from "@/db";
import { clients, projects } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";

interface Props {
  params: { id: string };
}

export default async function ClientDetailPage({ params }: Props) {
  const client = await db.query.clients.findFirst({
    where: and(eq(clients.id, params.id), isNull(clients.deletedAt)),
    with: {
      projects: {
        where: isNull(projects.deletedAt)
      }
    }
  });

  if (!client) {
    notFound();
  }

  return (
    <div className="p-8 max-w-5xl w-full mx-auto space-y-8">
      {/* Top Header Breadcrumb context trail */}
      <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
        <Link href="/clients" className="hover:text-slate-600 transition-colors">CLIENTS</Link>
        <span>/</span>
        <span className="text-slate-600">{client.name.toUpperCase()}</span>
      </div>

      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">{client.name}</h1>
        <p className="text-xs text-slate-500 mt-1">Core relationship payload data profile.</p>
      </div>

      {/* Main Dense Scroll Stack Layout */}
      <div className="space-y-6">
        {/* Section 1: Demographics Card */}
        <div className="border border-slate-200 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 mb-4">Client Overview Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div>
              <div className="text-slate-400 font-mono mb-0.5">Industry Segment</div>
              <div className="font-semibold text-slate-900">{client.industry}</div>
            </div>
            <div>
              <div className="text-slate-400 font-mono mb-0.5">Assigned Account Manager</div>
              <div className="font-semibold text-slate-900">{client.accountManager}</div>
            </div>
            <div>
              <div className="text-slate-400 font-mono mb-0.5">Relationship Operational Status</div>
              <div className="mt-1">
                <span className={`px-2 py-0.5 font-mono text-[10px] font-bold rounded-full ${client.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {client.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Contact Information Card */}
        <div className="border border-slate-200 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 mb-4">Primary Stakeholder Communication Node</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div>
              <div className="text-slate-400 font-mono mb-0.5">Contact Name</div>
              <div className="font-semibold text-slate-900">{client.primaryContactName}</div>
            </div>
            <div>
              <div className="text-slate-400 font-mono mb-0.5">Phone Number</div>
              <div className="font-mono font-medium text-slate-900">{client.phone}</div>
            </div>
            <div>
              <div className="text-slate-400 font-mono mb-0.5">Email Address</div>
              <div className="font-mono font-medium text-slate-900">{client.email}</div>
            </div>
          </div>
        </div>

        {/* Section 3: Connected Running Operations Table */}
        <div className="border border-slate-200 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 bg-white border-b border-slate-100">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400">Associated Managed Project Allocations</h2>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-mono text-[11px] text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-6 font-semibold">Project Code/Name</th>
                <th className="py-2.5 px-6 font-semibold">Domain</th>
                <th className="py-2.5 px-6 font-semibold">Project Manager</th>
                <th className="py-2.5 px-6 font-semibold">Status Execution</th>
                <th className="py-2.5 px-6 font-semibold text-right">Completion metrics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {client.projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 font-mono">No active execution pipelines found linked to this account object.</td>
                </tr>
              ) : (
                client.projects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-6 font-bold text-slate-900">
                      <Link href={`/projects/${proj.id}`} className="hover:underline">
                        {proj.name}
                      </Link>
                    </td>
                    <td className="py-3 px-6 text-slate-600">{proj.domain}</td>
                    <td className="py-3 px-6 text-slate-600">{proj.projectManager}</td>
                    <td className="py-3 px-6">
                      <span className="font-mono font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {proj.status}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right font-mono font-bold text-slate-900">{proj.progress}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Section 4: External Operational Plain Text Remarks Block */}
        <div className="border border-slate-200 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 mb-3">Internal Logged Context Remarks</h2>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
            {client.remarks || "No raw context remarks documentation mapped to this client entry."}
          </p>
        </div>
      </div>
    </div>
  );
}