import { getSupabaseClient } from "@/lib/supabase";

export type Profile = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  onboardingCompleted: boolean;
  onboardingCompletedAt: string | null;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
};
const toProfile = (row: ProfileRow): Profile => ({
  id: row.id,
  displayName: row.display_name,
  avatarUrl: row.avatar_url,
  onboardingCompleted: row.onboarding_completed,
  onboardingCompletedAt: row.onboarding_completed_at,
});

export async function fetchOrCreateProfile(userId: string): Promise<Profile> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured.");
  const { data, error } = await client
    .from("profiles")
    .upsert({ id: userId }, { onConflict: "id", ignoreDuplicates: true })
    .select(
      "id, display_name, avatar_url, onboarding_completed, onboarding_completed_at",
    )
    .maybeSingle();
  if (error) throw error;
  // ignoreDuplicates can return no representation on some PostgREST versions.
  if (data) return toProfile(data as ProfileRow);
  const result = await client
    .from("profiles")
    .select(
      "id, display_name, avatar_url, onboarding_completed, onboarding_completed_at",
    )
    .eq("id", userId)
    .single();
  if (result.error) throw result.error;
  return toProfile(result.data as ProfileRow);
}

export async function completeOnboarding(userId: string): Promise<Profile> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured.");
  const { data, error } = await client
    .from("profiles")
    .upsert(
      {
        id: userId,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    )
    .select(
      "id, display_name, avatar_url, onboarding_completed, onboarding_completed_at",
    )
    .single();
  if (error) throw error;
  return toProfile(data as ProfileRow);
}
