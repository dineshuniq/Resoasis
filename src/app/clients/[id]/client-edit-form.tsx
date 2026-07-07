"use client";

import { useState } from "react";
import { updateClient } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

interface Client {
  id: string;
  name: string;
  industry: string;
  primaryContactName: string;
  phone: string;
  email: string;
  accountManager: string;
  status: string;
  remarks: string | null;
}

export function ClientEditForm({ client }: { client: Client }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateClient(client.id, formData);
    setIsPending(false);
    if (res.success) {
      setIsOpen(false);
    } else {
      alert(res.error);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Edit Client</Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Edit Client Details">
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Client Name</label>
              <input name="name" defaultValue={client.name} required className="w-full border border-slate-200 rounded p-2" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Industry</label>
              <input name="industry" defaultValue={client.industry} required className="w-full border border-slate-200 rounded p-2" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Primary Contact</label>
              <input name="primaryContactName" defaultValue={client.primaryContactName} required className="w-full border border-slate-200 rounded p-2" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Phone</label>
              <input name="phone" defaultValue={client.phone} required className="w-full border border-slate-200 rounded p-2" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Email</label>
              <input name="email" type="email" defaultValue={client.email} required className="w-full border border-slate-200 rounded p-2" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Account Manager</label>
              <input name="accountManager" defaultValue={client.accountManager} required className="w-full border border-slate-200 rounded p-2" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Status</label>
              <select name="status" defaultValue={client.status} className="w-full border border-slate-200 rounded p-2 bg-white">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="font-medium text-slate-700">Remarks</label>
            <textarea name="remarks" defaultValue={client.remarks || ""} className="w-full border border-slate-200 rounded p-2 h-24" />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save Changes"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
