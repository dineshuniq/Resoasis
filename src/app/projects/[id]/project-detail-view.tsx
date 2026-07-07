"use client";

import { useState } from "react";
import { updateProject } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { projectStatusEnum, priorityLevelsEnum } from "@/db/schema";
import { SquadManager } from "./squad-manager";
import { EditableMilestones } from "./editable-milestones";
import Link from "next/link";
import { Save } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  designation: string;
  department: string;
  currentAllocation: number;
  availabilityStatus: string;
}

interface Resource {
  employee: Employee;
}

interface Milestone {
  id: string;
  projectId: string;
  title: string;
  owner: string;
  startDate: Date | string;
  dueDate: Date | string;
  progress: number;
  status: string;
  remarks: string | null;
}

interface DailyUpdate {
  id: string;
  date: Date;
  updatedBy: string;
  description: string;
}

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
  startDate: Date;
  expectedCompletionDate: Date;
  client: { name: string } | null;
  milestones: Milestone[];
  dailyUpdates: DailyUpdate[];
  resources: Resource[];
}

interface ProjectDetailViewProps {
  project: Project;
  allEmployees: Employee[];
}

export function ProjectDetailView({ project, allEmployees }: ProjectDetailViewProps) {
  const [isPending, setIsPending] = useState(false);
  const [progress, setProgress] = useState(project.progress);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    
    // Add progress to formData since disabled/manual inputs might not serialize
    formData.set("progress", progress.toString());

    const res = await updateProject(project.id, formData);
    setIsPending(false);
    if (res.success) {
      alert("Project details saved successfully!");
    } else {
      alert(res.error);
    }
  };

  const formatDateForInput = (dateVal: Date | string) => {
    if (!dateVal) return "";
    const d = new Date(dateVal);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="p-8 max-w-5xl w-full mx-auto space-y-8">
      {/* Structural Context Trail */}
      <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
        <Link href="/projects" className="hover:text-slate-600 transition-colors">PROJECTS</Link>
        <span>/</span>
        <span className="text-slate-600">{project.name.toUpperCase()}</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex-1 space-y-2">
            <input 
              name="name" 
              defaultValue={project.name} 
              required 
              placeholder="Project Name"
              className="text-2xl font-black tracking-tight text-slate-900 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none w-full py-1"
            />
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Client:</span>
              <span className="font-semibold text-slate-700">{project.client?.name || "Unlinked Client"}</span>
              <span className="text-slate-300">|</span>
              <span>Domain:</span>
              <input 
                name="domain" 
                defaultValue={project.domain} 
                required 
                placeholder="Domain"
                className="font-medium text-slate-700 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none px-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right flex flex-col items-end">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Completion Track</span>
              <div className="flex items-center gap-2 mt-1">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={progress}
                  onChange={(e) => setProgress(parseInt(e.target.value))}
                  className="w-24 accent-slate-900 h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-200" 
                />
                <span className="text-sm font-mono font-black text-slate-900 w-8">{progress}%</span>
              </div>
            </div>
            <Button type="submit" disabled={isPending} className="flex items-center gap-1.5 shadow-sm">
              <Save className="w-4 h-4" />
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status */}
          <div className="border border-slate-200 bg-white p-4 rounded-lg shadow-sm flex flex-col justify-between">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Operational Status</label>
            <select 
              name="status" 
              defaultValue={project.status} 
              className="text-xs font-bold text-slate-900 bg-transparent border border-slate-200 rounded p-1 w-full focus:outline-none focus:border-slate-400"
            >
              {projectStatusEnum.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="border border-slate-200 bg-white p-4 rounded-lg shadow-sm flex flex-col justify-between">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Priority Classification</label>
            <select 
              name="priority" 
              defaultValue={project.priority} 
              className="text-xs font-bold text-rose-600 bg-transparent border border-slate-200 rounded p-1 w-full focus:outline-none focus:border-slate-400"
            >
              {priorityLevelsEnum.map(priority => (
                <option key={priority} value={priority} className="text-slate-900">{priority}</option>
              ))}
            </select>
          </div>

          {/* Leadership */}
          <div className="border border-slate-200 bg-white p-4 rounded-lg shadow-sm space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Leadership Team</span>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-mono text-[10px]">PM:</span>
                <input 
                  name="projectManager" 
                  defaultValue={project.projectManager} 
                  required 
                  className="bg-transparent border border-slate-100 focus:border-slate-300 rounded px-1.5 py-0.5 text-xs w-full focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-mono text-[10px]">LD:</span>
                <input 
                  name="projectLead" 
                  defaultValue={project.projectLead} 
                  required 
                  className="bg-transparent border border-slate-100 focus:border-slate-300 rounded px-1.5 py-0.5 text-xs w-full focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Timeline Bounds (Read-only as they are set during initialization, but styled nicely) */}
          <div className="border border-slate-200 bg-white p-4 rounded-lg shadow-sm space-y-1 text-xs">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Timeline Bounds</span>
            <div className="flex items-center justify-between text-slate-600">
              <span>Start:</span>
              <span className="font-mono">{new Date(project.startDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>End:</span>
              <span className="font-mono">{new Date(project.expectedCompletionDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Project Target Definition / Description */}
        <div className="border border-slate-200 bg-white p-5 rounded-lg shadow-sm space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block border-b border-slate-100 pb-2 mb-1">Project Target Definition</label>
          <textarea 
            name="description" 
            defaultValue={project.description} 
            required 
            placeholder="Describe the project scope..."
            className="w-full text-xs text-slate-800 bg-transparent border border-slate-100 focus:border-slate-300 focus:outline-none rounded p-2 min-h-24 resize-y leading-relaxed font-sans"
          />
        </div>

        {/* Remarks Section */}
        <div className="border border-slate-200 bg-white p-5 rounded-lg shadow-sm space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block border-b border-slate-100 pb-2 mb-1">Remarks / Internal Notes</label>
          <textarea 
            name="remarks" 
            defaultValue={project.remarks || ""} 
            placeholder="Add internal execution comments or remarks..."
            className="w-full text-xs text-slate-800 bg-transparent border border-slate-100 focus:border-slate-300 focus:outline-none rounded p-2 min-h-16 resize-y leading-relaxed font-mono"
          />
        </div>
      </form>

      {/* Row 3: Assigned Workforce Node Matrix */}
      <SquadManager projectId={project.id} resources={project.resources} availableEmployees={allEmployees} />

      {/* Row 4: Milestones Realization Table */}
      <EditableMilestones milestones={project.milestones} projectId={project.id} />

      {/* Row 5: Chronological Activity Stream Logs */}
      <div className="border border-slate-200 bg-white rounded-lg shadow-sm p-5">
        <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 mb-4">Chronological Daily Updates Pipeline</h2>
        <div className="space-y-4">
          {project.dailyUpdates.length === 0 ? (
            <p className="text-xs text-slate-400 font-mono py-2 text-center">No structural timeline update statements submitted.</p>
          ) : (
            project.dailyUpdates.map((update) => (
              <div key={update.id} className="border-l-2 border-slate-200 pl-4 space-y-1">
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="font-mono font-bold text-slate-900">{new Date(update.date).toLocaleDateString('en-GB')}</span>
                  <span className="text-slate-400">|</span>
                  <span className="font-mono text-slate-500">Log By: {update.updatedBy}</span>
                </div>
                <p className="text-xs text-slate-800 leading-normal font-sans whitespace-pre-wrap">{update.description}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
