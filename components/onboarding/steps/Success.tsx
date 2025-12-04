"use client";
import React from 'react';

export default function Success() {
  return (
    <div className="text-center p-6">
      <h2 className="text-2xl font-bold mb-2">You're all set!</h2>
      <p className="text-gray-600 mb-4">Your workspace is ready. You can invite more teammates or explore the dashboard.</p>
      <a href="/dashboard" className="btn btn-primary">Go to Dashboard</a>
    </div>
  );
}
