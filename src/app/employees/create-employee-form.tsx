"use client";

import { useState } from "react";
import { createEmployee } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { employeeAvailabilityEnum } from "@/db/schema";
import { Plus } from "lucide-react";

export function CreateEmployeeForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [allocation, setAllocation] = useState(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    const res = await createEmployee(formData);
    setIsPending(false);
    if (res.success) {
      setIsOpen(false);
      setAllocation(0);
    } else {
      alert(res.error);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="flex items-center gap-1.5">
        <Plus className="w-4 h-4" /> New Employee
      </Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Onboard New Employee">
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Full Name <span className="text-rose-500">*</span></label>
              <input name="name" required placeholder="e.g. Rahul Sharma" className="w-full border border-slate-200 rounded p-2 text-sm focus:outline-none focus:border-slate-400" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Designation <span className="text-rose-500">*</span></label>
              <input name="designation" required placeholder="e.g. Senior Developer" className="w-full border border-slate-200 rounded p-2 text-sm focus:outline-none focus:border-slate-400" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Department <span className="text-rose-500">*</span></label>
              <input name="department" required placeholder="e.g. Engineering" className="w-full border border-slate-200 rounded p-2 text-sm focus:outline-none focus:border-slate-400" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Phone <span className="text-rose-500">*</span></label>
              <input name="phone" required placeholder="+91 98765 43210" className="w-full border border-slate-200 rounded p-2 text-sm focus:outline-none focus:border-slate-400" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Email <span className="text-rose-500">*</span></label>
              <input name="email" type="email" required placeholder="employee@company.com" className="w-full border border-slate-200 rounded p-2 text-sm focus:outline-none focus:border-slate-400" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Reporting Manager <span className="text-rose-500">*</span></label>
              <input name="reportingManager" required placeholder="Manager's full name" className="w-full border border-slate-200 rounded p-2 text-sm focus:outline-none focus:border-slate-400" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Availability Status</label>
              <select name="availabilityStatus" defaultValue="Available" className="w-full border border-slate-200 rounded p-2 text-sm bg-white focus:outline-none focus:border-slate-400">
                {employeeAvailabilityEnum.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1 flex flex-col">
              <label className="font-medium text-slate-700 flex justify-between">
                <span>Current Allocation</span>
                <span className="font-mono text-slate-500">{allocation}%</span>
              </label>
              <input 
                type="range" 
                name="currentAllocation" 
                min="0" 
                max="100" 
                value={allocation}
                onChange={(e) => setAllocation(parseInt(e.target.value))}
                className="w-full mt-2" 
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="font-medium text-slate-700">Remarks</label>
            <textarea name="remarks" placeholder="Skills, notes, or special considerations..." className="w-full border border-slate-200 rounded p-2 text-sm h-20 focus:outline-none focus:border-slate-400" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Creating..." : "Create Employee"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
