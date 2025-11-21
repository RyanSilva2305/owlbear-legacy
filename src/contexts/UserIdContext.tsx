// Arquivo: owlbear-rodeo-legacy/src/contexts/UserIdContext.tsx

import React, { useEffect, useState, useContext } from "react";

import { useDatabase } from "./DatabaseContext";

const UserIdContext = React.createContext<string | undefined>(undefined);

export function UserIdProvider({ children }: { children: React.ReactNode }) {
  const { database, databaseStatus } = useDatabase();

  const [userId, setUserId] = useState<string | undefined>();
  
  useEffect(() => {
    if (!database || databaseStatus === "loading") {
      return;
    }
    
    async function loadUserId() {
      if (database) {
        // ========== PRIORIDADE 1: Usar userId do Laravel (localStorage) ==========
        const laravelUserId = localStorage.getItem('owlbear_user_id');
        
        if (laravelUserId) {
          console.log("🔵 Usando userId do Laravel:", laravelUserId);
          
          // Salva no IndexedDB para manter compatibilidade
          await database.table("user").put({
            key: "userId",
            value: laravelUserId
          });
          
          setUserId(laravelUserId);
          return;
        }
        
        // ========== FALLBACK: Usar userId do IndexedDB (comportamento original) ==========
        const storedUserId = await database.table("user").get("userId");
        if (storedUserId) {
          console.log("🟡 Usando userId do IndexedDB:", storedUserId.value);
          setUserId(storedUserId.value);
        }
      }
    }

    loadUserId();
  }, [database, databaseStatus]);

  return (
    <UserIdContext.Provider value={userId}>{children}</UserIdContext.Provider>
  );
}

export function useUserId() {
  return useContext(UserIdContext);
}

export default UserIdContext;