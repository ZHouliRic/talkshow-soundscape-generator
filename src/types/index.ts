
export interface SoundEffect {
  id: string;
  name: string;
  file: File;
  marker: string;
}

export interface ProcessedScript {
  originalText: string;
  cleanedText: string;
  effects: {
    marker: string;
    position: number;
    original: string;
  }[];
}

export interface GeneratedAudio {
  id: string;
  url: string;
  duration: number;
}
