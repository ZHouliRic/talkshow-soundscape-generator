
import { toast } from "@/hooks/use-toast";

// Play.ai credentials
const PLAY_AI_USER_ID = "6XHeaUTSxmfV1JcYGQwjqmGP63u1";
const PLAY_AI_SECRET_KEY = "ak-f2c7fd4b13954e5793237eb62d86d3da";
const PLAY_AI_VOICE = "s3://voice-cloning-zero-shot/e040bd1b-f190-4bdb-83f0-75ef85b18f84/original/manifest.json";

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
  // Report initial progress
  if (progressCallback) progressCallback(10);

  toast({
    title: "Starting Text-to-Speech Generation",
    description: "Sending request to backend server...",
    duration: 5000,
  });

  try {
    // Use our backend proxy to handle the Play.ai API call
    const response = await fetch(`${BACKEND_URL}/api/generate-speech`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        voiceId: PLAY_AI_VOICE,
        userId: PLAY_AI_USER_ID,
        apiKey: PLAY_AI_SECRET_KEY
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      toast({
        title: "Text-to-Speech Error",
        description: `Status: ${response.status}\n${errorText.substring(0, 100)}${errorText.length > 100 ? '...' : ''}`,
        variant: "destructive",
        duration: 10000,
      });
      throw new Error(`API call failed: ${response.status}`);
    }

    // Update progress as the backend processes the request
    if (progressCallback) progressCallback(40);
    
    // Get the task ID from the initial response
    const { taskId } = await response.json();
    
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
      
      toast({
        title: "Checking Speech Status",
        description: `Attempt ${attempts + 1}/${maxAttempts}...`,
        duration: 3000,
      });

      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const statusResponse = await fetch(`${BACKEND_URL}/api/speech-status/${taskId}`);

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        if (statusData.status === "completed") {
          audioUrl = statusData.audioUrl;
          toast({
            title: "Speech Generation Complete",
            description: "Your audio is ready!",
            duration: 5000,
          });
          break;
        }
      }
      
      attempts++;
    }

    if (!audioUrl) {
      toast({
        title: "Speech Generation Timeout",
        description: "Failed to get audio URL after multiple attempts.",
        variant: "destructive",
        duration: 8000,
      });
      throw new Error("Audio generation timed out");
    }

    // Update progress before downloading audio
    if (progressCallback) progressCallback(85);
    
    // Download the audio file
    const audioResponse = await fetch(`${BACKEND_URL}/api/download-audio?url=${encodeURIComponent(audioUrl)}`);
    const audioBlob = await audioResponse.blob();
    
    // Final progress update
    if (progressCallback) progressCallback(95);
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (progressCallback) progressCallback(100);
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });
  } catch (error) {
    console.error("Error in generating speech:", error);
    toast({
      title: "Speech Generation Error",
      description: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
      variant: "destructive",
      duration: 10000,
    });
    throw error;
  }
}
