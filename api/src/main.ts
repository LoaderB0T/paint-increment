import { writeFileSync } from 'fs';

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*'
  });
  const options = new DocumentBuilder()
    .setTitle('PaintIncrementApi')
    .setDescription('The API definition for Paint Increment')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  const outputPath = `${process.cwd()}/swagger.json`;
  writeFileSync(outputPath, JSON.stringify(document), { encoding: 'utf8' });
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
