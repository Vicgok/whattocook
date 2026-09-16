export type IdentityQueryState = {
  isReady: boolean;
  validation: "verified" | "offline_unverified" | "error";
  userId: string | null;
};

/** User-owned queries may only dispatch for the currently verified identity. */
export function canQueryCurrentIdentity(
  callerReady: boolean,
  requestedUserId: string | undefined,
  identity: IdentityQueryState,
) {
  return Boolean(
    callerReady &&
      identity.isReady &&
      identity.validation === "verified" &&
      requestedUserId &&
      requestedUserId === identity.userId,
  );
}
