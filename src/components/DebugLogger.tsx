
import React, { useState } from "react";
import { useDebugLog } from "@/contexts/DebugLogContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Bug, X, ChevronsUpDown, Trash } from "lucide-react";

const DebugLogger: React.FC = () => {
  const { logs, clearLogs } = useDebugLog();
  const [isExpanded, setIsExpanded] = useState(false);

  // Format timestamp for display
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Format logs for display in textarea
  const getFormattedLogs = (): string => {
    return logs
      .map((log) => `[${formatTime(log.timestamp)}] [${log.type.toUpperCase()}] ${log.message}`)
      .join('\n');
  };

  // Get color class based on log type
  const getTypeColor = (type: string): string => {
    switch (type) {
      case "error":
        return "text-red-500";
      case "success":
        return "text-green-500";
      case "warning":
        return "text-yellow-500";
      default:
        return "text-blue-500";
    }
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${isExpanded ? 'h-80' : 'h-10'}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between bg-muted px-4 py-2 border-t border-border cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center space-x-2">
          <Bug className="h-4 w-4" />
          <span className="text-sm font-medium">API Debug Logs ({logs.length})</span>
        </div>
        <div className="flex items-center space-x-2">
          {isExpanded && (
            <Button variant="ghost" size="sm" onClick={(e) => {
              e.stopPropagation();
              clearLogs();
            }}>
              <Trash className="h-4 w-4" />
            </Button>
          )}
          <ChevronsUpDown className="h-4 w-4" />
        </div>
      </div>

      {/* Log content */}
      {isExpanded && (
        <div className="bg-card border-t border-border h-full overflow-hidden">
          <Textarea
            className="h-full font-mono text-xs p-4 resize-none"
            value={getFormattedLogs()}
            readOnly
          />
        </div>
      )}
    </div>
  );
};

export default DebugLogger;
