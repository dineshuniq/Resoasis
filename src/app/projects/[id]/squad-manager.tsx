"use client";

import { useState } from "react";
import { assignResourceToProject, removeResourceFromProject } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Link from "next/link";

interface Employee {
  id: string;
  name: string;
  designation: string;
  department: string;
  currentAllocation: number;
}

interface Resource {
  employee: Employee;
}

interface SquadManagerProps {
  projectId: string;
  resources: Resource[];
  availableEmployees: Employee[];
}

export function SquadManager({ projectId, resources, availableEmployees }: SquadManagerProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleAssign = async () => {
    if (!selectedEmployeeId) return;
    setIsPending(true);
    const res = await assignResourceToProject(projectId, selectedEmployeeId);
    if (!res.success) alert(res.error);
    setIsPending(false);
    setSelectedEmployeeId("");
  };

  const handleRemove = async (employeeId: string) => {
    if (confirm("Are you sure you want to remove this team member from the project?")) {
      const res = await removeResourceFromProject(projectId, employeeId);
      if (!res.success) alert(res.error);
    }
  };

  return (
    <div className="border border-slate-200 bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400">Allocated Operational Squad</h2>
        <div className="flex items-center gap-2">
          <select 
            className="text-xs border border-slate-200 rounded p-1.5 w-48 bg-slate-50"
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
          >
            <option value="">-- Add Team Member --</option>
            {availableEmployees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name} ({emp.designation})</option>
            ))}
          </select>
          <Button 
            variant="secondary" 
            disabled={!selectedEmployeeId || isPending}
            onClick={handleAssign}
            className="h-8 text-xs"
          >
            Add
          </Button>
        </div>
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {resources.length === 0 ? (
          <div className="text-xs text-slate-400 font-mono py-2 col-span-full text-center">No assigned human resources mapped to this project scope.</div>
        ) : (
          resources.map(({ employee }) => (
            <div key={employee.id} className="border border-slate-100 bg-slate-50/50 p-3 rounded-md hover:bg-slate-50 transition-colors relative group">
              <Link href={`/employees/${employee.id}`} className="block pr-6">
                <div className="text-xs font-bold text-slate-900 truncate">{employee.name}</div>
                <div className="text-[11px] text-slate-500 truncate">{employee.designation} ({employee.department})</div>
                <div className="text-[10px] font-mono text-amber-600 font-bold mt-1">Internal Load: {employee.currentAllocation}%</div>
              </Link>
              <button 
                onClick={() => handleRemove(employee.id)}
                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                title="Remove Resource"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
