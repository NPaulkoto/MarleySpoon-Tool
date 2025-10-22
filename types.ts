export interface LightSettings {
  angle: number;
  intensity: number;
  softness: number;
}

export type Tint = 'none' | 'warm' | 'cool';

export interface ExportOptions {
  svgContent: string;
  viewBox: string;
  lightSettings: LightSettings;
  iconColor: string;
  backgroundColor: string;
  tint: Tint;
  highContrast: boolean;
}
