
export interface SoundEffect {
  id: string;
  name: string;
  file: File;
  marker: string;
  timestamp?: number; // 添加可选的时间戳字段
}

export interface ProcessedScript {
  originalText: string;
  cleanedText: string;
  effects: {
    marker: string;
    position: number;
    original: string;
    timestamp: number; // 新增的时间戳字段
  }[];
}

export interface GeneratedAudio {
  id: string;
  url: string;
  duration: number;
}
