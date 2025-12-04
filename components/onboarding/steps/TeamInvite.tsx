"use client";
import React, { useState } from 'react';

export default function TeamInvite({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const [emails, setEmails] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    // send invites
    onNext();
  };

  return (
    <form onSubmit={submit}>
      <label className="block mb-2">Invite team members (comma separated emails)</label>
      <textarea value={emails} onChange={(e) => setEmails(e.target.value)} className="textarea textarea-bordered w-full mb-4" placeholder="alice@example.com, bob@example.com" />

      <div className="flex justify-between">
        <button type="button" onClick={onPrev} className="btn">Back</button>
        <button type="submit" className="btn btn-primary">Next</button>
      </div>
    </form>
  );
}
