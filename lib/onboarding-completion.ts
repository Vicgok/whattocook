import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const KEY = "WHATTOCOOK_ONBOARDING_COMPLETED_V1";
type StoredCompletion = { userId: string; completed: true };

/** Used after a successful server completion when React state has not rerendered yet. */
export async function markDeviceOnboardingCompleted(userId: string) {
  await AsyncStorage.setItem(
    KEY,
    JSON.stringify({ userId, completed: true } satisfies StoredCompletion),
  );
}

export function useDeviceOnboardingCompletion(userId?: string) {
  const [ready, setReady] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    let active = true;
    setReady(false);
    AsyncStorage.getItem(KEY)
      .then((value) => {
        let stored: StoredCompletion | null = null;
        try {
          stored = value ? (JSON.parse(value) as StoredCompletion) : null;
        } catch {
          /* Legacy boolean marker is intentionally ignored. */
        }
        if (active) {
          setCompleted(
            Boolean(userId && stored?.completed && stored.userId === userId),
          );
          setReady(true);
        }
      })
      .catch((reason) => {
        if (__DEV__)
          console.warn("[BOOTSTRAP] onboarding storage read failed", reason);
        if (active) {
          setError(
            reason instanceof Error
              ? reason
              : new Error("onboarding storage read failed"),
          );
          setReady(true);
        }
      });
    return () => {
      active = false;
    };
  }, [userId]);
  const markCompleted = async () => {
    if (!userId) return;
    await markDeviceOnboardingCompleted(userId);
    setCompleted(true);
  };
  return { ready, completed, error, markCompleted };
}
