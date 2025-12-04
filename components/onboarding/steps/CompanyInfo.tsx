"use client";
import React, { useState } from 'react';

export default function CompanyInfo({ onNext }: { onNext: () => void }) {
  const [company, setCompany] = useState('');
  const [size, setSize] = useState('1-10');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Save to server if needed
    onNext();
  };

  return (
    <form onSubmit={submit}>
      <label className="block mb-2">Company name</label>
      <input value={company} onChange={(e) => setCompany(e.target.value)} className="input input-bordered w-full mb-4" placeholder="Your company name" />

      <label className="block mb-2">Company size</label>
      <select value={size} onChange={(e) => setSize(e.target.value)} className="select select-bordered w-full mb-4">
        <option>1-10</option>
        <option>11-50</option>
        <option>51-200</option>
        <option>200+</option>
      </select>

      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary">Next</button>
      </div>
    </form>
  );
}
