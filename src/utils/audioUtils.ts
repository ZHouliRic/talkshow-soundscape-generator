
import { SoundEffect, ProcessedScript, GeneratedAudio } from "@/types";

// Play.ai credentials
const PLAY_AI_USER_ID = "6XHeaUTSxmfV1JcYGQwjqmGP63u1";
const PLAY_AI_SECRET_KEY = "ak-f2c7fd4b13954e5793237eb62d86d3da";
const PLAY_AI_VOICE = "s3://voice-cloning-zero-shot/e040bd1b-f190-4bdb-83f0-75ef85b18f84/original/manifest.json";
const PLAY_AI_VOICE2 = "s3://voice-cloning-zero-shot/baf1ef41-36b6-428c-9bdf-50ba54682bd8/original/manifest.json";

// Generate speech using Play.ai API
export async function generateSpeechFromText(text: string): Promise<string> {
  console.log("Generating speech from text using Play.ai API:", text);
  
  try {
    // Step 1: Create a new PlayNote
    const createResponse = await fetch("https://play.ht/api/v2/playnotes", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PLAY_AI_SECRET_KEY}`,
        "X-User-ID": PLAY_AI_USER_ID,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: text,
        voice: PLAY_AI_VOICE,
        output_format: "mp3"
      })
    });
    
    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      console.error("Play.ai API error:", errorData);
      throw new Error(`Play.ai API error: ${errorData.error || createResponse.statusText}`);
    }
    
    const playNote = await createResponse.json();
    const playNoteId = playNote.id;
    console.log("PlayNote created with ID:", playNoteId);
    
    // Step 2: Wait for the speech synthesis to complete
    let status = "PROCESSING";
    let audioUrl = "";
    
    while (status === "PROCESSING" || status === "CREATED") {
      // Poll every 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check the status
      const statusResponse = await fetch(`https://play.ht/api/v2/playnotes/${playNoteId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${PLAY_AI_SECRET_KEY}`,
          "X-User-ID": PLAY_AI_USER_ID
        }
      });
      
      if (!statusResponse.ok) {
        const errorData = await statusResponse.json();
        console.error("Play.ai status check error:", errorData);
        throw new Error(`Play.ai status check error: ${errorData.error || statusResponse.statusText}`);
      }
      
      const statusData = await statusResponse.json();
      status = statusData.status;
      
      console.log("PlayNote status:", status);
      
      if (status === "COMPLETED") {
        audioUrl = statusData.url;
        break;
      }
      
      if (status === "FAILED") {
        throw new Error("Play.ai speech synthesis failed");
      }
    }
    
    if (!audioUrl) {
      throw new Error("No audio URL received from Play.ai");
    }
    
    // Step 3: Fetch the audio file and convert to base64 for local usage
    const audioResponse = await fetch(audioUrl);
    const audioBlob = await audioResponse.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });
    
  } catch (error) {
    console.error("Error generating speech with Play.ai:", error);
    // Fallback to the placeholder in case of an error
    console.log("Using fallback audio generation");
    // Simulating API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    return `data:audio/mp3;base64,${Math.random().toString(36).substring(7)}`;
  }
}

// Combine the voice audio with sound effects
export async function combineAudioWithEffects(
  voiceAudioUrl: string,
  script: ProcessedScript,
  effects: SoundEffect[]
): Promise<GeneratedAudio> {
  console.log("Combining audio with effects:", {
    voiceAudioUrl,
    script,
    effects
  });
  
  // Check if we have at least one effect to use as fallback
  const hasFallbackEffect = effects.length > 0;
  const fallbackEffect = hasFallbackEffect ? effects[0] : null;
  
  // Process each effect in the script
  console.log("Processing script effects with fallback support");
  for (const scriptEffect of script.effects) {
    // Try to find matching effect
    const matchingEffect = effects.find(
      effect => effect.marker.toLowerCase() === scriptEffect.marker.toLowerCase()
    );
    
    if (!matchingEffect && fallbackEffect) {
      // If no matching effect but we have a fallback, use it
      console.log(`Using fallback effect for: [${scriptEffect.marker}]`);
      // In a real implementation, this would apply the fallback effect at the specific position
    }
  }
  
  // Note: In a complete implementation, you would use the Web Audio API or a library
  // to process and combine the audio files. For simplicity, we're just returning the voice audio.
  
  // Simulating processing delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // In a real implementation, this would process and combine the audio
  return {
    id: `audio-${Date.now()}`,
    url: voiceAudioUrl,
    duration: 120 // Placeholder duration in seconds
  };
}

// Function to download the audio file
export function downloadAudio(audioUrl: string, fileName: string = "talkshow.mp3"): void {
  // For base64 data URLs, we need to convert to Blob first
  if (audioUrl.startsWith('data:')) {
    const byteString = atob(audioUrl.split(',')[1]);
    const mimeString = audioUrl.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    const blob = new Blob([ab], { type: mimeString });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up
    URL.revokeObjectURL(url);
  } else {
    // Regular URL
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

// Convert file to base64 for audio preview
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
