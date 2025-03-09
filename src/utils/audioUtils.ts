
import { SoundEffect, ProcessedScript, GeneratedAudio } from "@/types";

// Play.ai credentials
const PLAY_AI_USER_ID = "6XHeaUTSxmfV1JcYGQwjqmGP63u1";
const PLAY_AI_SECRET_KEY = "ak-f2c7fd4b13954e5793237eb62d86d3da";
const PLAY_AI_VOICE = "s3://voice-cloning-zero-shot/e040bd1b-f190-4bdb-83f0-75ef85b18f84/original/manifest.json";
const PLAY_AI_VOICE2 = "s3://voice-cloning-zero-shot/baf1ef41-36b6-428c-9bdf-50ba54682bd8/original/manifest.json";

// Generate speech using Play.ai API
export async function generateSpeechFromText(text: string): Promise<string> {
  console.log("🔍 Starting Play.ai API call process for text:", text);
  console.log("📝 Play.ai API Credentials:");
  console.log(`- User ID: ${PLAY_AI_USER_ID}`);
  console.log(`- Secret Key: ${PLAY_AI_SECRET_KEY.substring(0, 5)}...${PLAY_AI_SECRET_KEY.substring(PLAY_AI_SECRET_KEY.length - 5)}`);
  console.log(`- Voice: ${PLAY_AI_VOICE}`);
  
  try {
    // Due to CORS limitations in the browser, we need a different approach
    // We'll use a mock response for demonstration
    const requestBody = {
      text: text,
      voice: PLAY_AI_VOICE,
      output_format: "mp3"
    };
    
    console.log("📤 Play.ai API Request that would be sent:");
    console.log("- URL: https://play.ht/api/v2/playnotes");
    console.log("- Method: POST");
    console.log("- Headers:", {
      "Authorization": `Bearer ${PLAY_AI_SECRET_KEY.substring(0, 5)}...${PLAY_AI_SECRET_KEY.substring(PLAY_AI_SECRET_KEY.length - 5)}`,
      "X-User-ID": PLAY_AI_USER_ID,
      "Content-Type": "application/json"
    });
    console.log("- Body:", requestBody);
    
    console.log("⏳ Simulating API call delay (3 seconds)...");
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log("🔄 Play.ai API response would be received here");
    console.log("🔄 Polling for completion would happen here");
    console.log("✅ Play.ai audio generation completed (simulated)");
    
    // Generate a sample audio file (this would come from the API in production)
    console.log("🎵 Generating fallback audio using Web Audio API");
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 440; // A4 note
    gainNode.gain.value = 0.5;
    
    const duration = 3; // seconds
    const sampleRate = audioContext.sampleRate;
    const frameCount = sampleRate * duration;
    const audioBuffer = audioContext.createBuffer(1, frameCount, sampleRate);
    const channelData = audioBuffer.getChannelData(0);
    
    for (let i = 0; i < frameCount; i++) {
      // Create a simple sine wave
      channelData[i] = Math.sin(i * 0.01) * 0.5;
    }
    
    // Convert buffer to WAV format
    const wavBuffer = bufferToWave(audioBuffer, frameCount);
    
    // Convert WAV buffer to base64
    const base64 = arrayBufferToBase64(wavBuffer);
    const audioDataUrl = `data:audio/wav;base64,${base64}`;
    
    console.log("✅ Generated mock audio data URL");
    console.log("📣 IMPORTANT: In a production environment, you would need to:");
    console.log("1. Create a backend API or serverless function to make the Play.ai API calls");
    console.log("2. Call your backend API instead of directly calling Play.ai API from the browser");
    console.log("3. Your backend would handle authentication securely");
    
    return audioDataUrl;
    
  } catch (error) {
    console.error("❌ Error in Play.ai API process:", error);
    console.log("⚠️ Using fallback audio generation due to error");
    // Simulating API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create a simple sine wave as fallback
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const frameCount = audioContext.sampleRate * 2; // 2 seconds
    const audioBuffer = audioContext.createBuffer(1, frameCount, audioContext.sampleRate);
    const channelData = audioBuffer.getChannelData(0);
    
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = Math.sin(i * 0.02) * 0.3;
    }
    
    const wavBuffer = bufferToWave(audioBuffer, frameCount);
    const base64 = arrayBufferToBase64(wavBuffer);
    return `data:audio/wav;base64,${base64}`;
  }
}

// Helper function to convert AudioBuffer to WAV format
function bufferToWave(audioBuffer: AudioBuffer, length: number) {
  const numOfChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numOfChannels * bytesPerSample;
  
  const buffer = new ArrayBuffer(44 + length * blockAlign);
  const view = new DataView(buffer);
  
  // RIFF chunk descriptor
  writeUTFBytes(view, 0, 'RIFF');
  view.setUint32(4, 36 + length * blockAlign, true);
  writeUTFBytes(view, 8, 'WAVE');
  
  // FMT sub-chunk
  writeUTFBytes(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // subchunk1size
  view.setUint16(20, format, true); // audio format
  view.setUint16(22, numOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // byte rate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  
  // data sub-chunk
  writeUTFBytes(view, 36, 'data');
  view.setUint32(40, length * blockAlign, true);
  
  // Write the PCM samples
  const data = view;
  const offset = 44;
  
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numOfChannels; channel++) {
      const sample = audioBuffer.getChannelData(channel)[i];
      // Clamp between -1 and 1
      const clampedSample = Math.max(-1, Math.min(1, sample));
      // Convert to 16-bit signed integer
      const int16 = clampedSample < 0 
        ? clampedSample * 0x8000 
        : clampedSample * 0x7FFF;
      data.setInt16(offset + (i * blockAlign) + (channel * bytesPerSample), int16, true);
    }
  }
  
  return buffer;
}

// Helper function to write UTF bytes
function writeUTFBytes(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return window.btoa(binary);
}

// Combine the voice audio with sound effects
export async function combineAudioWithEffects(
  voiceAudioUrl: string,
  script: ProcessedScript,
  effects: SoundEffect[]
): Promise<GeneratedAudio> {
  console.log("🔊 Combining audio with effects:", {
    voiceAudioUrl: voiceAudioUrl.substring(0, 30) + "...",
    script: {
      originalText: script.originalText.substring(0, 30) + "...",
      cleanedText: script.cleanedText.substring(0, 30) + "...",
      effects: script.effects.length
    },
    effectsCount: effects.length
  });
  
  // Check if we have at least one effect to use as fallback
  const hasFallbackEffect = effects.length > 0;
  const fallbackEffect = hasFallbackEffect ? effects[0] : null;
  
  // Process each effect in the script
  console.log("🔄 Processing script effects with fallback support");
  for (const scriptEffect of script.effects) {
    // Try to find matching effect
    const matchingEffect = effects.find(
      effect => effect.marker.toLowerCase() === scriptEffect.marker.toLowerCase()
    );
    
    if (matchingEffect) {
      console.log(`✅ Found matching effect for: [${scriptEffect.marker}]`);
    } else if (fallbackEffect) {
      console.log(`⚠️ Using fallback effect for: [${scriptEffect.marker}]`);
      // In a real implementation, this would apply the fallback effect at the specific position
    } else {
      console.log(`❌ No effect found for: [${scriptEffect.marker}] and no fallback available`);
    }
  }
  
  // Note: In a complete implementation, you would use the Web Audio API or a library
  // to process and combine the audio files. For simplicity, we're just returning the voice audio.
  
  // Simulating processing delay
  console.log("⏳ Simulating audio processing delay (3 seconds)...");
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log("✅ Audio processing complete (simulated)");
  
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
