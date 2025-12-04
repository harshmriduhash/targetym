import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import { DashboardWidgets } from "@/components/dashboard/DashboardWidgets";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/sign-in");
  }

  // Get user profile from database (optional for demo mode)
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Future: Add onboarding flow if needed
  // if (profile && !profile.onboarding_completed) {
  //   redirect("/onboarding");
  // }

  return <DashboardWidgets userEmail={user.email} />;
}
