import { existsSync } from 'node:fs';

import { OpenApiGenerator } from '@goast/core';
import { TypeScriptModelsGenerator, TypeScriptAngularServicesGenerator } from '@goast/typescript';

async function main() {
  const generator = new OpenApiGenerator({ outputDir: 'src/shared/api/.api' })
    .useType(TypeScriptModelsGenerator)
    .useType(TypeScriptAngularServicesGenerator);

  const filePathLocal = '../api/swagger.json';
  const filePathDocker = 'api/swagger.json';

  const filePath = existsSync(filePathLocal) ? filePathLocal : filePathDocker;

  await generator.parseAndGenerate(filePath);
}

main();
