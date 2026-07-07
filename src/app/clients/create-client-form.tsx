"use client";

import { useState } from "react";
import { createClient } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Plus } from "lucide-react";

export function CreateClientForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    const res = await createClient(formData);
    setIsPending(false);
    if (res.success) {
      setIsOpen(false);
    } else {
      alert(res.error);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="flex items-center gap-1.5">
        <Plus className="w-4 h-4" /> New Client
      </Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Register New Client">
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Client Name <span className="text-rose-500">*</span></label>
              <input name="name" required placeholder="e.g. Acme Corp" className="w-full border border-slate-200 rounded p-2 text-sm focus:outline-none focus:border-slate-400" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Industry <span className="text-rose-500">*</span></label>
              <input name="industry" required placeholder="e.g. Finance, Healthcare" className="w-full border border-slate-200 rounded p-2 text-sm focus:outline-none focus:border-slate-400" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Primary Contact Name <span className="text-rose-500">*</span></label>
              <input name="primaryContactName" required placeholder="Full name" className="w-full border border-slate-200 rounded p-2 text-sm focus:outline-none focus:border-slate-400" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Phone <span className="text-rose-500">*</span></label>
              <input name="phone" required placeholder="+91 98765 43210" className="w-full border border-slate-200 rounded p-2 text-sm focus:outline-none focus:border-slate-400" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Email <span className="text-rose-500">*</span></label>
              <input name="email" type="email" required placeholder="contact@client.com" className="w-full border border-slate-200 rounded p-2 text-sm focus:outline-none focus:border-slate-400" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Account Manager <span className="text-rose-500">*</span></label>
              <input name="accountManager" required placeholder="Assigned manager name" className="w-full border border-slate-200 rounded p-2 text-sm focus:outline-none focus:border-slate-400" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="font-medium text-slate-700">Remarks</label>
            <textarea name="remarks" placeholder="Any additional notes about this client..." className="w-full border border-slate-200 rounded p-2 text-sm h-20 focus:outline-none focus:border-slate-400" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Creating..." : "Create Client"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
