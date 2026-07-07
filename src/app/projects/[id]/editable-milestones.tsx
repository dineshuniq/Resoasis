"use client";

import { useState } from "react";
import { updateMilestone, deleteMilestone, createMilestone } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Trash2, Edit2, Plus } from "lucide-react";

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

export function EditableMilestones({ milestones, projectId }: { milestones: Milestone[], projectId: string }) {
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this milestone?")) {
      await deleteMilestone(id, projectId);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingMilestone) return;
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateMilestone(editingMilestone.id, projectId, formData);
    setIsPending(false);
    if (res.success) {
      setEditingMilestone(null);
    } else {
      alert(res.error);
    }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    const res = await createMilestone(projectId, formData);
    setIsPending(false);
    if (res.success) {
      setIsCreating(false);
    } else {
      alert(res.error);
    }
  };

  // Helper to format date for input fields
  const formatDateForInput = (dateValue: Date | string) => {
    const d = new Date(dateValue);
    return d.toISOString().split('T')[0];
  };

  return (
    <div className="border border-slate-200 bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400">Execution Delivery Milestones</h2>
        <Button variant="secondary" onClick={() => setIsCreating(true)} className="h-8 text-xs flex items-center gap-1">
          <Plus className="w-3 h-3" /> Add Milestone
        </Button>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 font-mono text-[11px] text-slate-500 uppercase tracking-wider">
            <th className="py-2 px-4 font-semibold">Milestone Object Target</th>
            <th className="py-2 px-4 font-semibold">Owner Node</th>
            <th className="py-2 px-4 font-semibold">Target Target Window</th>
            <th className="py-2 px-4 font-semibold text-right">Completion Value</th>
            <th className="py-2 px-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs">
          {milestones.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-4 text-center text-slate-400 font-mono">No structural execution milestones configured.</td>
            </tr>
          ) : (
            milestones.map((milestone) => (
              <tr key={milestone.id} className="group hover:bg-slate-50/50">
                <td className="py-2.5 px-4 font-bold text-slate-900">{milestone.title}</td>
                <td className="py-2.5 px-4 text-slate-600">{milestone.owner}</td>
                <td className="py-2.5 px-4 font-mono text-slate-500 text-[11px]">
                  {new Date(milestone.startDate).toLocaleDateString()} &rarr; {new Date(milestone.dueDate).toLocaleDateString()}
                </td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{milestone.progress}%</td>
                <td className="py-2.5 px-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingMilestone(milestone)} className="text-slate-400 hover:text-indigo-600"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(milestone.id)} className="text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Edit Modal */}
      {editingMilestone && (
        <Modal isOpen={!!editingMilestone} onClose={() => setEditingMilestone(null)} title="Edit Milestone">
          <form onSubmit={handleUpdate} className="space-y-4 text-sm">
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="font-medium text-slate-700">Title</label>
                 <input name="title" defaultValue={editingMilestone.title} required className="w-full border border-slate-200 rounded p-2" />
               </div>
               <div className="space-y-1">
                 <label className="font-medium text-slate-700">Owner</label>
                 <input name="owner" defaultValue={editingMilestone.owner} required className="w-full border border-slate-200 rounded p-2" />
               </div>
               <div className="space-y-1">
                 <label className="font-medium text-slate-700">Start Date</label>
                 <input name="startDate" type="date" defaultValue={formatDateForInput(editingMilestone.startDate)} required className="w-full border border-slate-200 rounded p-2" />
               </div>
               <div className="space-y-1">
                 <label className="font-medium text-slate-700">Due Date</label>
                 <input name="dueDate" type="date" defaultValue={formatDateForInput(editingMilestone.dueDate)} required className="w-full border border-slate-200 rounded p-2" />
               </div>
               <div className="space-y-1">
                 <label className="font-medium text-slate-700">Status</label>
                 <input name="status" defaultValue={editingMilestone.status} required className="w-full border border-slate-200 rounded p-2" />
               </div>
               <div className="space-y-1">
                 <label className="font-medium text-slate-700 flex justify-between"><span>Progress</span><span className="font-mono">{editingMilestone.progress}%</span></label>
                 <input type="number" name="progress" defaultValue={editingMilestone.progress} min="0" max="100" className="w-full border border-slate-200 rounded p-2" />
               </div>
             </div>
             <div className="space-y-1">
               <label className="font-medium text-slate-700">Remarks</label>
               <textarea name="remarks" defaultValue={editingMilestone.remarks || ""} className="w-full border border-slate-200 rounded p-2 h-20" />
             </div>
             <div className="flex justify-end pt-2">
               <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save Changes"}</Button>
             </div>
          </form>
        </Modal>
      )}

      {/* Create Modal */}
      {isCreating && (
        <Modal isOpen={isCreating} onClose={() => setIsCreating(false)} title="Add Milestone">
          <form onSubmit={handleCreate} className="space-y-4 text-sm">
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="font-medium text-slate-700">Title</label>
                 <input name="title" required className="w-full border border-slate-200 rounded p-2" />
               </div>
               <div className="space-y-1">
                 <label className="font-medium text-slate-700">Owner</label>
                 <input name="owner" required className="w-full border border-slate-200 rounded p-2" />
               </div>
               <div className="space-y-1">
                 <label className="font-medium text-slate-700">Start Date</label>
                 <input name="startDate" type="date" required className="w-full border border-slate-200 rounded p-2" />
               </div>
               <div className="space-y-1">
                 <label className="font-medium text-slate-700">Due Date</label>
                 <input name="dueDate" type="date" required className="w-full border border-slate-200 rounded p-2" />
               </div>
               <div className="space-y-1">
                 <label className="font-medium text-slate-700">Status</label>
                 <input name="status" defaultValue="Pending" required className="w-full border border-slate-200 rounded p-2" />
               </div>
               <div className="space-y-1">
                 <label className="font-medium text-slate-700">Progress</label>
                 <input type="number" name="progress" defaultValue="0" min="0" max="100" className="w-full border border-slate-200 rounded p-2" />
               </div>
             </div>
             <div className="space-y-1">
               <label className="font-medium text-slate-700">Remarks</label>
               <textarea name="remarks" className="w-full border border-slate-200 rounded p-2 h-20" />
             </div>
             <div className="flex justify-end pt-2">
               <Button type="submit" disabled={isPending}>{isPending ? "Creating..." : "Create Milestone"}</Button>
             </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
