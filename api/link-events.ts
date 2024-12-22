import { exec } from 'child_process';
import { platform } from 'os';
import { exit } from 'process';

import * as fs from 'fs-extra';

const execAsync = (command: string) => {
  return new Promise<void>((resolve, reject) => {
    exec(command, error => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

const createFileLink = async (linkPath: string, realPath: string): Promise<void> => {
  if (platform() === 'win32') {
    const cmd = `mklink /h "${linkPath}" "${realPath}"`;
    execAsync(cmd).then(() => {
      console.log(`Created link ${linkPath} -> ${realPath}`);
    });
  } else {
    await fs.ensureSymlink(realPath, linkPath, 'file');
    console.log(`Created link ${linkPath} -> ${realPath}`);
  }
};

fs.remove('./src/models/ws-event-definitions.model.ts').then(() => {
  createFileLink(
    './src/models/ws-event-definitions.model.ts',
    '../app/src/app/models/ws-event-definitions.model.ts'
  ).catch(error => {
    console.error(error);
    exit(1);
  });
});
