import * as saveAs from 'file-saver';
import * as JSZip from 'jszip';
import { LobbyResponse } from '../../.api/models/lobby-response';

export const downloadIterations = (lobby: LobbyResponse, color: string, transparent: boolean) => {
  const targetSize = 2048;
  let size = 0;
  while (size < targetSize) {
    size += lobby.settings.width;
  }
  const pixelSize = size / lobby.settings.width;
  const zip = new JSZip();
  for (let i = 0; i < lobby.pixelIterations.length; i++) {
    const el = document.createElement('canvas');
    el.width = size;
    el.height = size;
    const ctx = el.getContext('2d')!;

    if (!transparent) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, size, size);
    }

    for (let j = 0; j <= i; j++) {
      ctx.fillStyle = j === i ? color : 'black';
      const iteration = lobby.pixelIterations[j];
      iteration.pixels.forEach(p => {
        ctx.fillRect(p.x * pixelSize, p.y * pixelSize, pixelSize, pixelSize);
      });
    }
    const imgString = el.toDataURL('image/png');

    zip.file(`${i}.png`, imgString.split('base64,')[1], { base64: true });
  }
  zip.generateAsync({ type: 'blob' }).then(content => {
    saveAs(content, `${lobby.name}_${color}${transparent ? '_T' : ''}.zip`);
  });
};
