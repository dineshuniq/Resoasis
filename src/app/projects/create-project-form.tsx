"use client";

import { useState } from "react";
import { createProject } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { projectStatusEnum, priorityLevelsEnum } from "@/db/schema";
import { Plus } from "lucide-react";

interface Client {
  id: string;
  name: string;
}

export function CreateProjectForm({ clients }: { clients: Client[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    const res = await createProject(formData);
    setIsPending(false);
    if (res.success) {
      setIsOpen(false);
      setProgress(0);
    } else {
      alert(res.error);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="flex items-center gap-1.5">
        <Plus className="w-4 h-4" /> New Project
      </Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create New Project">
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Client <span className="text-rose-500">*</span></label>
              <select name="clientId" required className="w-full border border-slate-200 rounded p-2 text-sm bg-white focus:outline-none focus:border-slate-400">
                <option value="">-- Select Client --</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Project Name <span className="text-rose-500">*</span></label>
              <input name="name" required placeholder="e.g. Website Redesign" className="w-full border border-slate-200 rounded p-2 text-sm focus:outline-none focus:border-slate-400" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Domain <span className="text-rose-500">*</span></label>
              <input name="domain" required placeholder="e.g. Web Development" className="w-full border border-slate-200 rounded p-2 text-sm focus:outline-none focus:border-slate-400" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Project Manager <span className="text-rose-500">*</span></label>
              <input name="projectManager" required placeholder="PM's full name" className="w-full border border-slate-200 rounded p-2 text-sm focus:outline-none focus:border-slate-400" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Project Lead <span className="text-rose-500">*</span></label>
              <input name="projectLead" required placeholder="Tech lead's full name" className="w-full border border-slate-200 rounded p-2 text-sm focus:outline-none focus:border-slate-400" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Status</label>
              <select name="status" defaultValue="Not Started" className="w-full border border-slate-200 rounded p-2 text-sm bg-white focus:outline-none focus:border-slate-400">
                {projectStatusEnum.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Priority</label>
              <select name="priority" defaultValue="Medium" className="w-full border border-slate-200 rounded p-2 text-sm bg-white focus:outline-none focus:border-slate-400">
                {priorityLevelsEnum.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1 flex flex-col">
              <label className="font-medium text-slate-700 flex justify-between">
                <span>Progress</span>
                <span className="font-mono text-slate-500">{progress}%</span>
              </label>
              <input 
                type="range" 
                name="progress" 
                min="0" 
                max="100" 
                value={progress}
                onChange={(e) => setProgress(parseInt(e.target.value))}
                className="w-full mt-2" 
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Start Date <span className="text-rose-500">*</span></label>
              <input name="startDate" type="date" required className="w-full border border-slate-200 rounded p-2 text-sm focus:outline-none focus:border-slate-400" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Expected Completion <span className="text-rose-500">*</span></label>
              <input name="expectedCompletionDate" type="date" required className="w-full border border-slate-200 rounded p-2 text-sm focus:outline-none focus:border-slate-400" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="font-medium text-slate-700">Description <span className="text-rose-500">*</span></label>
            <textarea name="description" required placeholder="Project scope and objectives..." className="w-full border border-slate-200 rounded p-2 text-sm h-20 focus:outline-none focus:border-slate-400" />
          </div>
          <div className="space-y-1">
            <label className="font-medium text-slate-700">Remarks</label>
            <textarea name="remarks" placeholder="Internal notes..." className="w-full border border-slate-200 rounded p-2 text-sm h-16 focus:outline-none focus:border-slate-400" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Creating..." : "Create Project"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
