
import { useEffect } from 'react';
import { useDebugLog } from '@/contexts/DebugLogContext';

/**
 * This hook connects the global debug logger to our context
 * to allow non-React code to log to our debug console
 */
export function useDebugLogger() {
  const debugLog = useDebugLog();
  
  useEffect(() => {
    // Set up global access to debug logger
    if (typeof window !== 'undefined') {
      window.__DEBUG_LOGGER__ = {
        addLog: debugLog.addLog
      };
      
      // Log successful initialization
      debugLog.addLog("Debug logger connected to global context", "success");
    }
    
    // Clean up on unmount
    return () => {
      if (typeof window !== 'undefined') {
        window.__DEBUG_LOGGER__ = undefined;
      }
    };
  }, [debugLog]);
  
  return debugLog;
}
