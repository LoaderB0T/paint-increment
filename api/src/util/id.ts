let nanoid: (size?: number) => string;

import('nanoid').then(nanoidModule => {
  nanoid = nanoidModule.nanoid;
});

export const id = () => nanoid(12).replace(/_/g, '-');
