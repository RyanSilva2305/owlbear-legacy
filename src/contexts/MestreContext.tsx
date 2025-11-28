import React, { useContext, useState, useEffect } from "react";
//MestreContext.tsx
const MestreContext = React.createContext<string>("");

export function MestreProvider({ children }: { children: React.ReactNode }) {
  const [mestreId, setMestreId] = useState<string>("");

  useEffect(() => {
    const storedMestreId = localStorage.getItem('owlbear_mestre_id') || '';
    setMestreId(storedMestreId);
    console.log("🎭 Mestre da sessão (Context):", storedMestreId);
  }, []);

  return (
    <MestreContext.Provider value={mestreId}>
      {children}
    </MestreContext.Provider>
  );
}

export function useMestreId() {
  const mestreId = useContext(MestreContext);
  if (mestreId === undefined) {
    throw new Error("useMestreId must be used within a MestreProvider");
  }
  return mestreId;
}