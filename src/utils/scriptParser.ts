
import { ProcessedScript } from "@/types";

// Parse the script to extract sound effect markers and clean the text
export function parseScript(script: string): ProcessedScript {
  const effectRegex = /\[(.*?)\]/g;
  const effects: { marker: string; position: number; original: string }[] = [];
  let match;
  let cleanedText = script;

  // Find all effect markers
  while ((match = effectRegex.exec(script)) !== null) {
    effects.push({
      marker: match[1].trim(),
      position: match.index,
      original: match[0],
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
