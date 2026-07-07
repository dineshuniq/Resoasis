"use client";

import { useState } from "react";
import { updateEmployee, softDeleteEmployee, restoreEmployee } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/ui/action-button";
import { employeeAvailabilityEnum } from "@/db/schema";
import Link from "next/link";
import { Save } from "lucide-react";

interface Project {
  id: string;
  name: string;
  domain: string;
  projectManager: string;
  progress: number;
}

interface ProjectAssignment {
  project: Project;
}

interface Employee {
  id: string;
  name: string;
  designation: string;
  department: string;
  phone: string;
  email: string;
  reportingManager: string;
  currentAllocation: number;
  availabilityStatus: string;
  remarks: string | null;
  deletedAt: Date | null;
  projects: ProjectAssignment[];
}

interface EmployeeDetailViewProps {
  employee: Employee;
}

export function EmployeeDetailView({ employee }: EmployeeDetailViewProps) {
  const [isPending, setIsPending] = useState(false);
  const [allocation, setAllocation] = useState(employee.currentAllocation);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    
    // Set allocation percentage to form data
    formData.set("currentAllocation", allocation.toString());

    const res = await updateEmployee(employee.id, formData);
    setIsPending(false);
    if (res.success) {
      alert("Employee details saved successfully!");
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="p-8 max-w-4xl w-full mx-auto space-y-8">
      {/* Structural Context Trail */}
      <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
        <Link href="/employees" className="hover:text-slate-600 transition-colors">EMPLOYEES</Link>
        <span>/</span>
        <span className="text-slate-600">{employee.name.toUpperCase()}</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex-1 space-y-2">
            <input 
              name="name" 
              defaultValue={employee.name} 
              required 
              placeholder="Full Name"
              className="text-2xl font-black tracking-tight text-slate-900 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none w-full py-1"
            />
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <input 
                name="designation" 
                defaultValue={employee.designation} 
                required 
                placeholder="Designation"
                className="font-medium text-slate-700 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none px-1"
              />
              <span className="text-slate-300">&mdash;</span>
              <input 
                name="department" 
                defaultValue={employee.department} 
                required 
                placeholder="Department"
                className="font-mono text-[11px] text-slate-600 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none px-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {employee.deletedAt ? (
              <ActionButton 
                action={restoreEmployee} 
                id={employee.id} 
                label="Restore Employee" 
                variant="primary"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              />
            ) : (
              <>
                <ActionButton 
                  action={softDeleteEmployee} 
                  id={employee.id} 
                  label="Archive Employee" 
                  variant="destructive"
                  confirmMessage="Are you sure you want to archive this employee? They will be marked as inactive."
                />
                <Button type="submit" disabled={isPending} className="flex items-center gap-1.5 shadow-sm">
                  <Save className="w-4 h-4" />
                  {isPending ? "Saving..." : "Save"}
                </Button>
              </>
            )}
          </div>
        </div>

        {employee.deletedAt && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm font-medium">
            This employee has been archived. Their profile is inactive and they are removed from standard availability pools.
          </div>
        )}

        {/* Operational Metadata Grid */}
        <div className="border border-slate-200 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 mb-4">Resource Operational Metadata</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs">
            {/* Line Manager */}
            <div className="space-y-1">
              <label className="text-slate-400 font-mono block mb-1">Line Manager</label>
              <input 
                name="reportingManager" 
                defaultValue={employee.reportingManager} 
                required 
                placeholder="Manager Name"
                className="bg-transparent border border-slate-200 rounded px-2 py-1 text-slate-900 font-semibold focus:outline-none focus:border-slate-400 w-full"
              />
            </div>

            {/* Availability */}
            <div className="space-y-1">
              <label className="text-slate-400 font-mono block mb-1">Availability Parameter</label>
              <select 
                name="availabilityStatus" 
                defaultValue={employee.availabilityStatus} 
                className="bg-transparent border border-slate-200 rounded px-2 py-1 text-slate-900 font-semibold focus:outline-none focus:border-slate-400 w-full"
              >
                {employeeAvailabilityEnum.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Allocation */}
            <div className="space-y-1">
              <label className="text-slate-400 font-mono flex justify-between">
                <span>Assigned Load</span>
                <span className="font-mono text-slate-950 font-bold">{allocation}%</span>
              </label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={allocation}
                onChange={(e) => setAllocation(parseInt(e.target.value))}
                className="w-full accent-slate-900 h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-200 mt-2" 
              />
            </div>

            {/* Communication Coordinates */}
            <div className="space-y-2">
              <label className="text-slate-400 font-mono block">Communication Coordinates</label>
              <input 
                name="email" 
                type="email"
                defaultValue={employee.email} 
                required 
                placeholder="Email Address"
                className="bg-transparent border border-slate-100 rounded px-1.5 py-0.5 text-slate-700 font-mono text-[10px] focus:outline-none focus:border-slate-300 w-full"
              />
              <input 
                name="phone" 
                defaultValue={employee.phone} 
                required 
                placeholder="Phone Number"
                className="bg-transparent border border-slate-100 rounded px-1.5 py-0.5 text-slate-700 font-mono text-[10px] focus:outline-none focus:border-slate-300 w-full"
              />
            </div>
          </div>
        </div>

        {/* Remarks Section */}
        <div className="border border-slate-200 bg-white rounded-lg shadow-sm p-6">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block border-b border-slate-100 pb-2 mb-3">Internal Profile Logs</label>
          <textarea 
            name="remarks" 
            defaultValue={employee.remarks || ""} 
            placeholder="Log details, skills, notes, or special circumstances for this resource..."
            className="w-full text-xs text-slate-800 bg-transparent border border-slate-100 focus:border-slate-300 focus:outline-none rounded p-2 min-h-20 resize-y leading-relaxed font-sans"
          />
        </div>
      </form>

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
    </div>
  );
}
