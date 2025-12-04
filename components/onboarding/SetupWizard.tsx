"use client";
import React, { useState } from 'react';
import CompanyInfo from './steps/CompanyInfo';
import TeamInvite from './steps/TeamInvite';
import FirstGoal from './steps/FirstGoal';
import PricingSelection from './steps/PricingSelection';
import Success from './steps/Success';

const steps = [
  { id: 'company' },
  { id: 'team' },
  { id: 'goal' },
  { id: 'pricing' },
  { id: 'success' },
];

export default function SetupWizard() {
  const [index, setIndex] = useState(0);
  const step = steps[index];

  const next = () => setIndex((i) => Math.min(i + 1, steps.length - 1));
  const prev = () => setIndex((i) => Math.max(i - 1, 0));

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="mb-4">
        <div className="text-sm text-gray-500">Step {index + 1} of {steps.length}</div>
        <div className="text-2xl font-semibold">{step.id.toUpperCase()}</div>
      </div>

      <div className="mb-6">
        {step.id === 'company' && <CompanyInfo onNext={next} />}
        {step.id === 'team' && <TeamInvite onNext={next} onPrev={prev} />}
        {step.id === 'goal' && <FirstGoal onNext={next} onPrev={prev} />}
        {step.id === 'pricing' && <PricingSelection onNext={next} onPrev={prev} />}
        {step.id === 'success' && <Success />}
      </div>
    </div>
  );
}
