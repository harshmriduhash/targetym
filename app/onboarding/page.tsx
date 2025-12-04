import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { createClient } from '@/src/lib/supabase/server';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Check if user has already completed onboarding
  if (user.user_metadata?.onboardingCompleted) {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-2xl bg-card rounded-xl shadow-lg p-8">
        <OnboardingWizard />
      </div>
    </div>
  );
}
