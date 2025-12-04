"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { completeOnboarding, skipOnboarding } from "@/app/onboarding/actions";

type OnboardingStep = 
  | "welcome" 
  | "profile" 
  | "organization" 
  | "integrations" 
  | "complete";

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    companyName: "",
    companySize: "",
    industry: "",
    integrations: [] as string[]
  });
  const router = useRouter();

  const handleNext = () => {
    const steps: OnboardingStep[] = [
      "welcome", 
      "profile", 
      "organization", 
      "integrations", 
      "complete"
    ];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const steps: OnboardingStep[] = [
      "welcome", 
      "profile", 
      "organization", 
      "integrations", 
      "complete"
    ];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleSkip = async () => {
    try {
      await skipOnboarding();
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to skip onboarding:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      await completeOnboarding(formData);
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case "welcome":
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Welcome to Targetym</h2>
            <p className="text-gray-600 mb-8">Let's set up your account and get you started</p>
            <Button onClick={handleNext}>Get Started</Button>
            <Button variant="link" onClick={handleSkip}>Skip for now</Button>
          </div>
        );
      case "profile":
        return (
          <div>
            <h2>Complete Your Profile</h2>
            {/* Add profile form fields */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePrevious}>Previous</Button>
              <Button onClick={handleNext}>Next</Button>
            </div>
          </div>
        );
      case "organization":
        return (
          <div>
            <h2>Your Organization</h2>
            {/* Add organization form fields */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePrevious}>Previous</Button>
              <Button onClick={handleNext}>Next</Button>
            </div>
          </div>
        );
      case "integrations":
        return (
          <div>
            <h2>Connect Your Tools</h2>
            {/* Add integration selection */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePrevious}>Previous</Button>
              <Button onClick={handleNext}>Next</Button>
            </div>
          </div>
        );
      case "complete":
        return (
          <div className="text-center">
            <h2>You're All Set!</h2>
            <p>Welcome to Targetym AI</p>
            <Button onClick={handleSubmit}>Go to Dashboard</Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="onboarding-wizard">
      {renderStep()}
    </div>
  );
}
