export interface ToneOption {
  label: string;
  prompt: string;
}

export type WeightedTone = {
  formality: string;
  emotion: string;
  style: string;
};

export type AxisLabels = {
  top: string;
  right: string;
  bottom: string;
  left: string;
};

export type PlaygroundPosition = {
  x: number;
  y: number;
};
