import { db } from "@/db";
import { clients, projects } from '../../db/schema';
import { and, or, ilike, isNull } from 'drizzle-orm';
import Link from "next/link";
import { CreateClientForm } from "./create-client-form";

interface Props {
  searchParams: { q?: string };
}

export default async function ClientsListPage({ searchParams }: Props) {
  const query = searchParams.q || "";

  // Perform localized database lookup filtering matching text inputs
  const clientData = await db.query.clients.findMany({
    where: and(
      isNull(clients.deletedAt),
      query ? or(ilike(clients.name, `%${query}%`), ilike(clients.industry, `%${query}%`), ilike(clients.accountManager, `%${query}%`)) : undefined
    ),
    with: {
      projects: {
        where: isNull(projects.deletedAt)
      }
    }
  });

  return (
    <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Clients</h1>
          <p className="text-xs text-slate-500 mt-1">Directory of active service relationships.</p>
        </div>
        <CreateClientForm />
      </div>

      {/* Global Search Input Box */}
      <form method="GET" className="w-full">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Filter by client name, industry, account manager... (Press Enter)"
          className="w-full max-w-md h-9 text-xs px-3 rounded-md border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
        />
      </form>

      {/* Table Representation */}
      <div className="border border-slate-200 bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 font-mono text-xs text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 font-semibold">Client Name</th>
              <th className="py-3 px-4 font-semibold">Industry</th>
              <th className="py-3 px-4 font-semibold">Primary Contact</th>
              <th className="py-3 px-4 font-semibold">Account Manager</th>
              <th className="py-3 px-4 font-semibold text-center">Projects</th>
              <th className="py-3 px-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {clientData.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 font-mono">No matching client records detected.</td>
              </tr>
            ) : (
              clientData.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <Link href={`/clients/${client.id}`} className="hover:underline block">
                      {client.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{client.industry}</td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-900">{client.primaryContactName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{client.email}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{client.accountManager}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">{client.projects.length}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-0.5 font-mono font-semibold text-[10px] rounded-full ${client.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {client.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}