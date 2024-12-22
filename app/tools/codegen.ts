import { OpenApiGenerator } from '@goast/core';
import {
  TypeScriptModelsGenerator,
  TypeScriptAngularServicesGenerator,
} from '@goast/typescript';

async function main() {
  const generator = new OpenApiGenerator({ outputDir: 'src/shared/api/.api' })
    // Add a generator using a class
    .useType(TypeScriptModelsGenerator)
    .useType(TypeScriptAngularServicesGenerator);

  // Generate for one of more OpenAPI specification files
  await generator.parseAndGenerate('../api/swagger.json');
}

main();
