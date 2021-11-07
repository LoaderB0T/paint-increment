export interface PaintIncrement {
  name: string;
  email: string;
  pixels: [number, number][];
  confirmed: boolean;
  confirmCode: string | null;
}
