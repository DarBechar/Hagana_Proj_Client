// Create a context to share emergency status across components
import { createContext, useContext } from "react";

export const EmergencyContext = createContext({
  hasActiveEmergency: false,
  activeEvent: null,
  setHasActiveEmergency: () => {},
  setActiveEvent: () => {},
  refreshEmergencyStatus: () => {},
});

export const useEmergency = () => useContext(EmergencyContext);
