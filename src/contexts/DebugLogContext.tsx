
import React, { createContext, useContext, useState, useEffect } from "react";

type LogEntry = {
  id: string;
  timestamp: Date;
  message: string;
  type: "info" | "error" | "success" | "warning";
};

type DebugLogContextType = {
  logs: LogEntry[];
  addLog: (message: string, type?: "info" | "error" | "success" | "warning") => void;
  clearLogs: () => void;
};

const DebugLogContext = createContext<DebugLogContextType | undefined>(undefined);

export const DebugLogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Add a new log entry
  const addLog = (message: string, type: "info" | "error" | "success" | "warning" = "info") => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date(),
      message,
      type,
    };
    setLogs((prevLogs) => [...prevLogs, newLog]);
  };

  // Clear all logs
  const clearLogs = () => {
    setLogs([]);
  };

  // Initialize with a welcome message
  useEffect(() => {
    addLog("Debug logger initialized", "info");
  }, []);

  return (
    <DebugLogContext.Provider value={{ logs, addLog, clearLogs }}>
      {children}
    </DebugLogContext.Provider>
  );
};

export const useDebugLog = (): DebugLogContextType => {
  const context = useContext(DebugLogContext);
  if (context === undefined) {
    throw new Error("useDebugLog must be used within a DebugLogProvider");
  }
  return context;
};
