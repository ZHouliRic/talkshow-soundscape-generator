
import { ProcessedScript } from "@/types";

// Words per minute for speech timing calculation
const WORDS_PER_MINUTE = 150;

// Parse the script to extract sound effect markers and clean the text
export function parseScript(script: string): ProcessedScript {
  const effectRegex = /\[(.*?)\]/g;
  const effects: { marker: string; position: number; original: string; timestamp: number }[] = [];
  let cleanedText = script;
  let match;

  // Find all effect markers
  while ((match = effectRegex.exec(script)) !== null) {
    // Calculate approximate timestamp based on word count before this point
    const textBeforeEffect = script.substring(0, match.index);
    const wordCount = countWords(textBeforeEffect);
    const timestamp = calculateTimestamp(wordCount);
    
    effects.push({
      marker: match[1].trim(),
      position: match.index,
      original: match[0],
      timestamp: timestamp,
    });
  }

  // Remove effect markers from text
  cleanedText = script.replace(effectRegex, "");
  
  return {
    originalText: script,
    cleanedText,
    effects,
  };
}

// Calculate approximate timestamp based on word count and speech rate
function calculateTimestamp(wordCount: number): number {
  // Convert words per minute to seconds per word and then calculate total seconds
  const secondsPerWord = 60 / WORDS_PER_MINUTE;
  return Math.round(wordCount * secondsPerWord * 10) / 10; // Round to 1 decimal place
}

// Count words in text
function countWords(text: string): number {
  // Remove brackets content and count words
  const cleanText = text.replace(/\[(.*?)\]/g, "");
  return cleanText.split(/\s+/).filter(word => word.length > 0).length;
}

// Check if a sound effect marker exists in the script
export function hasEffectInScript(script: string, effectName: string): boolean {
  const effectRegex = new RegExp(`\\[\\s*${effectName}\\s*\\]`, "i");
  return effectRegex.test(script);
}

// Get unique effect markers from a script
export function getUniqueEffectsFromScript(script: string): string[] {
  const effectRegex = /\[(.*?)\]/g;
  const effects = new Set<string>();
  let match;

  while ((match = effectRegex.exec(script)) !== null) {
    effects.add(match[1].trim());
  }

  return Array.from(effects);
}
