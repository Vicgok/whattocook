import { ReactNode, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSupabaseSession } from "@/context/SupabaseSessionContext";
import { clearUserScopedCache } from "@/lib/identity-cache";

export function IdentityCacheGuard({ children }: { children: ReactNode }) {
  const { userId } = useSupabaseSession();
  const client = useQueryClient();
  const prior = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (prior.current !== undefined && prior.current !== userId)
      clearUserScopedCache(client);
    prior.current = userId;
  }, [client, userId]);
  return <>{children}</>;
}
