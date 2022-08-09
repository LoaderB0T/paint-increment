export interface PaintIncrement {
  name: string;
  id: string;
  email: string;
  pixels: [number, number][];
  confirmed: boolean;
  confirmCode: string | null;
}
