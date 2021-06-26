export interface AddPixelsRequest {
  lobbyId: string;
  name: string;
  email: string;
  pixels: [number, number][];
}
