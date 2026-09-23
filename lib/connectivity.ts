export type ConnectivityStatus = "unknown" | "offline" | "online";

type ConnectivitySnapshot = {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
};

/** Only explicit native connectivity failures put the app into offline mode. */
export function resolveConnectivityStatus({
  isConnected,
  isInternetReachable,
}: ConnectivitySnapshot): ConnectivityStatus {
  if (isConnected === false || isInternetReachable === false) return "offline";
  if (isConnected === true && isInternetReachable === true) return "online";
  return "unknown";
}
