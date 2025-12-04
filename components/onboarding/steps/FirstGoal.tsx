"use client";
import React, { useState } from 'react';

export default function FirstGoal({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    // create goal
    onNext();
  };

  return (
    <form onSubmit={submit}>
      <label className="block mb-2">First goal</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} className="input input-bordered w-full mb-2" placeholder="Increase customer retention by 10%" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="textarea textarea-bordered w-full mb-4" placeholder="Add supporting details..." />

      <div className="flex justify-between">
        <button type="button" onClick={onPrev} className="btn">Back</button>
        <button type="submit" className="btn btn-primary">Next</button>
      </div>
    </form>
  );
}
