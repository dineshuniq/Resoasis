"use client";

import { useState } from "react";
import { updateProject } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { projectStatusEnum, priorityLevelsEnum } from "@/db/schema";

interface Project {
  id: string;
  clientId: string;
  name: string;
  domain: string;
  projectManager: string;
  projectLead: string;
  status: string;
  priority: string;
  progress: number;
  description: string;
  remarks: string | null;
}

export function ProjectEditForm({ project }: { project: Project }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [progress, setProgress] = useState(project.progress);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateProject(project.id, formData);
    setIsPending(false);
    if (res.success) {
      setIsOpen(false);
    } else {
      alert(res.error);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Edit Project</Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Edit Project Details">
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Project Name</label>
              <input name="name" defaultValue={project.name} required className="w-full border border-slate-200 rounded p-2" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Domain</label>
              <input name="domain" defaultValue={project.domain} required className="w-full border border-slate-200 rounded p-2" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Project Manager</label>
              <input name="projectManager" defaultValue={project.projectManager} required className="w-full border border-slate-200 rounded p-2" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Project Lead</label>
              <input name="projectLead" defaultValue={project.projectLead} required className="w-full border border-slate-200 rounded p-2" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Status</label>
              <select name="status" defaultValue={project.status} className="w-full border border-slate-200 rounded p-2 bg-white">
                {projectStatusEnum.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Priority</label>
              <select name="priority" defaultValue={project.priority} className="w-full border border-slate-200 rounded p-2 bg-white">
                {priorityLevelsEnum.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1 col-span-2 flex flex-col">
              <label className="font-medium text-slate-700 flex justify-between">
                <span>Progress</span>
                <span className="font-mono">{progress}%</span>
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
          </div>
          <div className="space-y-1">
            <label className="font-medium text-slate-700">Target Description</label>
            <textarea name="description" defaultValue={project.description} required className="w-full border border-slate-200 rounded p-2 h-20" />
          </div>
          <div className="space-y-1">
            <label className="font-medium text-slate-700">Remarks</label>
            <textarea name="remarks" defaultValue={project.remarks || ""} className="w-full border border-slate-200 rounded p-2 h-16" />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save Changes"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
