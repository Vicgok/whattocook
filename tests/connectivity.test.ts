import { resolveConnectivityStatus } from "../lib/connectivity";

const expect = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

expect(
  resolveConnectivityStatus({ isConnected: false, isInternetReachable: true }) === "offline",
  "an explicit disconnected state is offline",
);
expect(
  resolveConnectivityStatus({ isConnected: true, isInternetReachable: false }) === "offline",
  "an explicit unreachable internet state is offline",
);
expect(
  resolveConnectivityStatus({ isConnected: true, isInternetReachable: true }) === "online",
  "a connected and reachable device is online",
);
expect(
  resolveConnectivityStatus({ isConnected: null, isInternetReachable: null }) === "unknown",
  "an unknown native state is not offline",
);
expect(
  resolveConnectivityStatus({ isConnected: true, isInternetReachable: null }) === "unknown",
  "an unresolved reachability state is not offline",
);
