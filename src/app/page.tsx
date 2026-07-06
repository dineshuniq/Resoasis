import { db } from "@/db";
import { clients, projects, employees, milestones } from "@/db/schema";
import { eq, and, isNull, gte, lte } from "drizzle-orm";
import Link from "next/link";

export const revalidate = 0; // Prevent server caching so dashboard stays live-updated

export default async function DashboardPage() {
  // Execute ultra-fast aggregated promises simultaneously
  const [allClients, allProjects, allEmployees, allMilestones] = await Promise.all([
    db.select().from(clients).where(isNull(clients.deletedAt)),
    db.select().from(projects).where(isNull(projects.deletedAt)),
    db.select().from(employees).where(isNull(employees.deletedAt)),
    db.select().from(milestones)
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfToday = new Date(today);
  endOfToday.setHours(23, 59, 59, 999);

  // Derive explicit operational data points
  const totalClients = allClients.length;
  const activeProjects = allProjects.filter(p => p.status === "In Progress").length;
  const completedProjects = allProjects.filter(p => p.status === "Completed").length;
  const delayedProjects = allProjects.filter(p => p.status === "Blocked" || p.status === "On Hold").length;
  const activeEmployees = allEmployees.filter(e => e.availabilityStatus !== "Inactive").length;
  const benchEmployees = allEmployees.filter(e => e.currentAllocation === 0 && e.availabilityStatus === "Available").length;
  
  const milestonesDueToday = allMilestones.filter(m => {
    const d = new Date(m.dueDate);
    return d >= today && d <= endOfToday;
  }).length;

  return (
    <div className="p-8 max-w-7xl w-full mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Operational Overview</h1>
        <p className="text-xs text-slate-500 mt-1">Real-time resource allocation and milestone execution matrix.</p>
      </div>

      {/* Grid Matrix of Clickable Performance Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/clients" className="block border border-slate-200 bg-white p-5 rounded-lg shadow-sm hover:border-slate-300 transition-all">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-500">Total Active Clients</div>
          <div className="text-3xl font-bold font-mono tracking-tight text-slate-900 mt-2">{totalClients}</div>
        </Link>

        <Link href="/projects" className="block border border-slate-200 bg-white p-5 rounded-lg shadow-sm hover:border-slate-300 transition-all">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-500">Active Progress Projects</div>
          <div className="text-3xl font-bold font-mono tracking-tight text-emerald-600 mt-2">{activeProjects}</div>
        </Link>

        <Link href="/projects" className="block border border-slate-200 bg-white p-5 rounded-lg shadow-sm hover:border-slate-300 transition-all">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-500">Delayed / Blocked</div>
          <div className="text-3xl font-bold font-mono tracking-tight text-rose-600 mt-2">{delayedProjects}</div>
        </Link>

        <Link href="/employees" className="block border border-slate-200 bg-white p-5 rounded-lg shadow-sm hover:border-slate-300 transition-all">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-500">Unallocated Resources (Bench)</div>
          <div className="text-3xl font-bold font-mono tracking-tight text-amber-600 mt-2">{benchEmployees}</div>
        </Link>
      </div>

      {/* Bottom Operational Priority Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-slate-200 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 font-mono uppercase tracking-wider">Critical Context Signals</h2>
          <div className="divide-y divide-slate-100 text-xs">
            <div className="flex justify-between py-3">
              <span className="text-slate-600">Milestones Due Today</span>
              <span className={`font-mono font-bold px-2 py-0.5 rounded ${milestonesDueToday > 0 ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-600"}`}>{milestonesDueToday}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-slate-600">Completed Lifecycle Projects</span>
              <span className="font-mono text-slate-900 font-medium">{completedProjects}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-slate-600">Total Monitored Workforce</span>
              <span className="font-mono text-slate-900 font-medium">{activeEmployees} resources</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}