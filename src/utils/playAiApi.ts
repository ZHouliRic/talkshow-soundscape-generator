
import { toast } from "@/hooks/use-toast";

// Backend server URL - defaults to local development server
// In production, this would be your deployed backend URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

/**
 * Generate speech using Play.ai API via our backend proxy
 */
export async function generateSpeechFromPlayAi(
  text: string, 
  progressCallback?: (progress: number) => void
): Promise<string> {
  // Get the debug logger if available (using dynamic import to avoid circular dependencies)
  const logToDebug = async (message: string, type: "info" | "error" | "success" | "warning" = "info") => {
    try {
      // Dynamically import to avoid circular dependency issues
      const { useDebugLog } = await import("@/contexts/DebugLogContext");
      // Only run this in a component context, ignore otherwise
      if (typeof window !== "undefined") {
        const debugLogger = window.__DEBUG_LOGGER__;
        if (debugLogger && debugLogger.addLog) {
          debugLogger.addLog(message, type);
        }
      }
    } catch (e) {
      // Silently fail if debug logger is not available
      console.log("Debug logger not available:", e);
    }
  };
  
  // Initialize window global for debug logger
  if (typeof window !== "undefined" && !window.__DEBUG_LOGGER__) {
    window.__DEBUG_LOGGER__ = { addLog: (message: string, type: string) => {} };
  }

  // Report initial progress
  if (progressCallback) progressCallback(10);

  // Log API call start
  logToDebug(`Starting Text-to-Speech API call to ${BACKEND_URL}`, "info");
  
  toast({
    title: "Starting Text-to-Speech Generation",
    description: `Sending request to backend server at ${BACKEND_URL}...`,
    duration: 5000,
  });

  try {
    console.log(`Using backend server at: ${BACKEND_URL}`);
    logToDebug(`Using backend server at: ${BACKEND_URL}`, "info");
    
    // Use our backend proxy to handle the Play.ai API call
    logToDebug("Sending POST request to /api/generate-speech", "info");
    logToDebug(`Request body: ${JSON.stringify({
      text,
      voiceId: "s3://voice-cloning-zero-shot/e040bd1b-f190-4bdb-83f0-75ef85b18f84/original/manifest.json"
    })}`, "info");
    
    const response = await fetch(`${BACKEND_URL}/api/generate-speech`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        voiceId: "s3://voice-cloning-zero-shot/e040bd1b-f190-4bdb-83f0-75ef85b18f84/original/manifest.json"
      }),
    });

    logToDebug(`Response status: ${response.status}`, response.ok ? "success" : "error");

    if (!response.ok) {
      const errorData = await response.json();
      logToDebug(`API error: ${JSON.stringify(errorData)}`, "error");
      
      toast({
        title: "Text-to-Speech Error",
        description: `Status: ${response.status}\n${errorData.message || errorData.error || 'Unknown error'}`,
        variant: "destructive",
        duration: 10000,
      });
      console.error("Backend API error details:", errorData);
      throw new Error(`API call failed: ${response.status} - ${errorData.message || errorData.error}`);
    }

    // Update progress as the backend processes the request
    if (progressCallback) progressCallback(40);
    
    // Get the task ID from the initial response
    const responseData = await response.json();
    const { taskId } = responseData;
    
    logToDebug(`Task ID received: ${taskId}`, "success");
    
    toast({
      title: "Speech Generation Started",
      description: `Task ID: ${taskId}`,
      duration: 5000,
    });

    // Poll for the audio generation status
    let audioUrl = null;
    let attempts = 0;
    const maxAttempts = 20;

    while (!audioUrl && attempts < maxAttempts) {
      // Update progress during polling (from 40% to 80%)
      if (progressCallback) {
        const pollProgress = 40 + Math.min(40, (attempts / maxAttempts) * 40);
        progressCallback(pollProgress);
      }
      
      logToDebug(`Polling status attempt ${attempts + 1}/${maxAttempts}`, "info");
      
      toast({
        title: "Checking Speech Status",
        description: `Attempt ${attempts + 1}/${maxAttempts}...`,
        duration: 3000,
      });

      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const statusUrl = `${BACKEND_URL}/api/speech-status/${taskId}`;
      logToDebug(`Checking status at: ${statusUrl}`, "info");
      
      const statusResponse = await fetch(statusUrl);
      logToDebug(`Status response: ${statusResponse.status}`, statusResponse.ok ? "success" : "error");

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        logToDebug(`Status data: ${JSON.stringify(statusData)}`, "info");
        console.log("Status response:", statusData);
        
        if (statusData.status === "completed") {
          audioUrl = statusData.audioUrl;
          logToDebug(`Audio URL received: ${audioUrl.substring(0, 30)}...`, "success");
          
          toast({
            title: "Speech Generation Complete",
            description: "Your audio is ready!",
            duration: 5000,
          });
          break;
        } else if (statusData.status === "failed") {
          const errorMsg = `Speech generation failed: ${statusData.error || 'Unknown error'}`;
          logToDebug(errorMsg, "error");
          throw new Error(errorMsg);
        }
      } else {
        const errorMsg = await statusResponse.text();
        logToDebug(`Error checking status: ${errorMsg}`, "error");
        console.error("Error checking status:", errorMsg);
      }
      
      attempts++;
    }

    if (!audioUrl) {
      const timeoutMsg = "Failed to get audio URL after multiple attempts.";
      logToDebug(timeoutMsg, "error");
      
      toast({
        title: "Speech Generation Timeout",
        description: timeoutMsg,
        variant: "destructive",
        duration: 8000,
      });
      throw new Error("Audio generation timed out");
    }

    // Update progress before downloading audio
    if (progressCallback) progressCallback(85);
    
    // Download the audio file
    const downloadUrl = `${BACKEND_URL}/api/download-audio?url=${encodeURIComponent(audioUrl)}`;
    logToDebug(`Downloading audio from: ${downloadUrl}`, "info");
    
    const audioResponse = await fetch(downloadUrl);
    logToDebug(`Audio download response: ${audioResponse.status}`, audioResponse.ok ? "success" : "error");
    
    if (!audioResponse.ok) {
      const errorMsg = `Failed to download audio: ${audioResponse.status}`;
      logToDebug(errorMsg, "error");
      throw new Error(errorMsg);
    }
    
    const audioBlob = await audioResponse.blob();
    logToDebug(`Audio blob received: ${audioBlob.size} bytes`, "success");
    
    // Final progress update
    if (progressCallback) progressCallback(95);
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (progressCallback) progressCallback(100);
        logToDebug("Audio data conversion complete", "success");
        resolve(reader.result as string);
      };
      reader.onerror = (error) => {
        logToDebug(`FileReader error: ${error}`, "error");
        reject(error);
      };
      reader.readAsDataURL(audioBlob);
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    logToDebug(`Error in generating speech: ${errorMsg}`, "error");
    console.error("Error in generating speech:", error);
    
    toast({
      title: "Speech Generation Error",
      description: `Error: ${errorMsg}`,
      variant: "destructive",
      duration: 10000,
    });
    throw error;
  }
}

// Add this type declaration to avoid TypeScript errors
declare global {
  interface Window {
    __DEBUG_LOGGER__?: {
      addLog: (message: string, type: "info" | "error" | "success" | "warning") => void;
    };
  }
}
