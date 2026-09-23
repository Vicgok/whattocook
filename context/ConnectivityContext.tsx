import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import { onlineManager } from "@tanstack/react-query";
import {
  resolveConnectivityStatus,
  type ConnectivityStatus,
} from "@/lib/connectivity";

const ConnectivityContext = createContext<ConnectivityStatus>("unknown");

/** Shares native connectivity with UI and keeps React Query paused only when offline is explicit. */
export function ConnectivityProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ConnectivityStatus>("unknown");

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const nextStatus = resolveConnectivityStatus(state);
      setStatus(nextStatus);
      // NetInfo can initially report unknown. That must not pause queries or
      // be presented as an offline device.
      onlineManager.setOnline(nextStatus !== "offline");
    });
    return unsubscribe;
  }, []);

  return (
    <ConnectivityContext.Provider value={status}>
      {children}
    </ConnectivityContext.Provider>
  );
}

export const useConnectivityStatus = () => useContext(ConnectivityContext);
