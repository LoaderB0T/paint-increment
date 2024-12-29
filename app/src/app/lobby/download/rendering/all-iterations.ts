import { LobbyResponse } from '@shared/api';
import { safeLobbyName, throwExp } from '@shared/utils';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

import { DownloadSettings } from '../../../dialog/download-settings/download-settings.model';

export const downloadIterations = (
  lobby: LobbyResponse,
  settings: DownloadSettings,
  document: Document
) => {
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
    const ctx = el.getContext('2d') ?? throwExp('Canvas not supported');

    if (!settings.transparentBackground) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, size, size);
    }

    for (let j = 0; j <= i; j++) {
      ctx.fillStyle = j === i ? settings.accentColor : 'black';
      const iteration = lobby.pixelIterations[j];
      iteration.pixels.forEach(p => {
        ctx.fillRect(p.x * pixelSize, p.y * pixelSize, pixelSize, pixelSize);
      });
    }
    const imgString = el.toDataURL('image/png');

    zip.file(`${i}.png`, imgString.split('base64,')[1], { base64: true });
  }
  zip.generateAsync({ type: 'blob', compression: 'DEFLATE' }).then(content => {
    saveAs(
      content,
      `${safeLobbyName(lobby.name)}_${settings.accentColor}${settings.transparentBackground ? '_T' : ''}.zip`
    );
  });
};
