import { db } from "@/db";
import { employees } from "@/db/schema";
import { isNull, ilike, or, and } from "drizzle-orm";
import Link from "next/link";
import { CreateEmployeeForm } from "./create-employee-form";
import { syncAllEmployeeAvailabilities } from "@/app/actions";

interface Props {
  searchParams: { q?: string };
}

export default async function EmployeesListPage({ searchParams }: Props) {
  const query = searchParams.q || "";

  // Self-heal employee availability status inconsistencies in the DB
  await syncAllEmployeeAvailabilities();

  const employeeData = await db.query.employees.findMany({
    where: and(
      isNull(employees.deletedAt),
      query 
        ? or(
            ilike(employees.name, `%${query}%`), 
            ilike(employees.designation, `%${query}%`), 
            ilike(employees.department, `%${query}%`)
          ) 
        : undefined
    ),
    with: {
      projects: {
        with: {
          project: true
        }
      }
    }
  });

  return (
    <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Resource Matrix Directory</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time status tracking of structural utilization bounds.</p>
        </div>
        <CreateEmployeeForm />
      </div>

      <form method="GET" className="w-full">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Filter by name, designation, department... (Press Enter)"
          className="w-full max-w-md h-9 text-xs px-3 rounded-md border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
        />
      </form>

      <div className="border border-slate-200 bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 font-mono text-xs text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 font-semibold">Employee</th>
              <th className="py-3 px-4 font-semibold">Role Setup</th>
              <th className="py-3 px-4 font-semibold">Communication Coordinates</th>
              <th className="py-3 px-4 font-semibold">Reporting Node</th>
              <th className="py-3 px-4 font-semibold">Status State</th>
              <th className="py-3 px-4 font-semibold text-right">Current Allocation Load</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {employeeData.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 font-mono">No deployment resource profiles matched search criteria.</td>
              </tr>
            ) : (
              employeeData.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <Link href={`/employees/${emp.id}`} className="hover:underline block">
                      {emp.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-900 font-medium">{emp.designation}</div>
                    <div className="text-slate-400 text-[11px] font-mono">{emp.department}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                    <div>{emp.email}</div>
                    <div className="text-slate-400">{emp.phone}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{emp.reportingManager}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-0.5 font-mono text-[10px] font-bold rounded-full ${
                      emp.availabilityStatus === 'Available' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {emp.availabilityStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                    <span className={emp.currentAllocation > 100 ? "text-rose-600" : emp.currentAllocation === 0 ? "text-amber-600" : "text-slate-900"}>
                      {emp.currentAllocation}%
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