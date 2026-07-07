"use client";

import { useState } from "react";
import { updateEmployee } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { employeeAvailabilityEnum } from "@/db/schema";

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
}

export function EmployeeEditForm({ employee }: { employee: Employee }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [allocation, setAllocation] = useState(employee.currentAllocation);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateEmployee(employee.id, formData);
    setIsPending(false);
    if (res.success) {
      setIsOpen(false);
    } else {
      alert(res.error);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Edit Employee</Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Edit Employee Details">
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Full Name</label>
              <input name="name" defaultValue={employee.name} required className="w-full border border-slate-200 rounded p-2" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Designation</label>
              <input name="designation" defaultValue={employee.designation} required className="w-full border border-slate-200 rounded p-2" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Department</label>
              <input name="department" defaultValue={employee.department} required className="w-full border border-slate-200 rounded p-2" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Phone</label>
              <input name="phone" defaultValue={employee.phone} required className="w-full border border-slate-200 rounded p-2" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Email</label>
              <input name="email" type="email" defaultValue={employee.email} required className="w-full border border-slate-200 rounded p-2" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Reporting Manager</label>
              <input name="reportingManager" defaultValue={employee.reportingManager} required className="w-full border border-slate-200 rounded p-2" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Availability Status</label>
              <select name="availabilityStatus" defaultValue={employee.availabilityStatus} className="w-full border border-slate-200 rounded p-2 bg-white">
                {employeeAvailabilityEnum.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1 flex flex-col">
              <label className="font-medium text-slate-700 flex justify-between">
                <span>Current Allocation</span>
                <span className="font-mono">{allocation}%</span>
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
            <textarea name="remarks" defaultValue={employee.remarks || ""} className="w-full border border-slate-200 rounded p-2 h-20" />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save Changes"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
