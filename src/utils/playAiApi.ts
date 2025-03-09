
import { toast } from "@/hooks/use-toast";

// Play.ai credentials
const PLAY_AI_USER_ID = "6XHeaUTSxmfV1JcYGQwjqmGP63u1";
const PLAY_AI_SECRET_KEY = "ak-f2c7fd4b13954e5793237eb62d86d3da";
const PLAY_AI_VOICE = "s3://voice-cloning-zero-shot/e040bd1b-f190-4bdb-83f0-75ef85b18f84/original/manifest.json";

/**
 * Generate speech using Play.ai API by making the actual API call
 * Note: This requires proper CORS handling, which typically requires a backend
 */
export async function generateSpeechFromPlayAi(
  text: string, 
  progressCallback?: (progress: number) => void
): Promise<string> {
  const API_ENDPOINT = "https://play.ht/api/v2/files";
  const fileName = `script_${Date.now()}.txt`;

  // Create FormData for file upload
  const formData = new FormData();
  formData.append("file", new Blob([text], {type: 'text/plain'}), fileName);
  formData.append("voice", PLAY_AI_VOICE);
  formData.append("output_format", "mp3");

  // Report initial progress
  if (progressCallback) progressCallback(10);

  // Log request details
  toast({
    title: "Starting Play.ai API Call",
    description: `Uploading text file to ${API_ENDPOINT}`,
    duration: 5000,
  });

  try {
    // Make the actual API call to upload the file
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PLAY_AI_SECRET_KEY}`,
        "X-User-ID": PLAY_AI_USER_ID,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      toast({
        title: "Play.ai API Error",
        description: `Status: ${response.status}\n${errorText.substring(0, 100)}${errorText.length > 100 ? '...' : ''}`,
        variant: "destructive",
        duration: 10000,
      });
      throw new Error(`API call failed: ${response.status}`);
    }

    const fileData = await response.json();
    
    // Update progress after file upload
    if (progressCallback) progressCallback(30);
    
    toast({
      title: "File Upload Successful",
      description: `File ID: ${fileData.file_id}\nFile Name: ${fileData.file_name}`,
      duration: 5000,
    });

    // Now make the API call to convert the file to speech
    const ttsEndpoint = "https://play.ht/api/v2/tts";
    const ttsBody = {
      text: text,
      voice: PLAY_AI_VOICE,
      quality: "premium",
      output_format: "mp3"
    };

    toast({
      title: "Converting Text to Speech",
      description: `API Endpoint: ${ttsEndpoint}`,
      duration: 5000,
    });
    
    // Update progress before TTS conversion
    if (progressCallback) progressCallback(40);

    const ttsResponse = await fetch(ttsEndpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PLAY_AI_SECRET_KEY}`,
        "X-User-ID": PLAY_AI_USER_ID,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(ttsBody),
    });

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      toast({
        title: "TTS Conversion Error",
        description: `Status: ${ttsResponse.status}\n${errorText.substring(0, 100)}${errorText.length > 100 ? '...' : ''}`,
        variant: "destructive",
        duration: 10000,
      });
      throw new Error(`TTS conversion failed: ${ttsResponse.status}`);
    }

    const ttsData = await ttsResponse.json();
    const articleId = ttsData.id;
    
    // Update progress after TTS request
    if (progressCallback) progressCallback(50);

    toast({
      title: "TTS Conversion Initiated",
      description: `Article ID: ${articleId}`,
      duration: 5000,
    });

    // Poll for the audio generation status
    let audioUrl = null;
    let attempts = 0;
    const maxAttempts = 20;

    while (!audioUrl && attempts < maxAttempts) {
      // Update progress during polling (from 50% to 80%)
      if (progressCallback) {
        const pollProgress = 50 + Math.min(30, (attempts / maxAttempts) * 30);
        progressCallback(pollProgress);
      }
      
      toast({
        title: "Checking Audio Status",
        description: `Attempt ${attempts + 1}/${maxAttempts}...`,
        duration: 3000,
      });

      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const statusResponse = await fetch(`https://play.ht/api/v2/tts/${articleId}`, {
        headers: {
          "Authorization": `Bearer ${PLAY_AI_SECRET_KEY}`,
          "X-User-ID": PLAY_AI_USER_ID,
        },
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        if (statusData.status === "completed") {
          audioUrl = statusData.url;
          toast({
            title: "Audio Generation Complete",
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
        title: "Audio Generation Timeout",
        description: "Failed to get audio URL after multiple attempts.",
        variant: "destructive",
        duration: 8000,
      });
      throw new Error("Audio generation timed out");
    }

    // Update progress before downloading audio
    if (progressCallback) progressCallback(85);
    
    // Download the audio file and convert to base64
    const audioResponse = await fetch(audioUrl);
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
    console.error("Error in Play.ai API call:", error);
    toast({
      title: "Play.ai API Error",
      description: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
      variant: "destructive",
      duration: 10000,
    });
    throw error;
  }
}
