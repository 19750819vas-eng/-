
export interface AnalysisResult {
  ageRange: string;
  psychotype: string;
  description: string;
  traits: string[];
  vibe: string;
  confidence: number;
}

export interface AppState {
  image: string | null;
  analyzing: boolean;
  result: AnalysisResult | null;
  error: string | null;
}
