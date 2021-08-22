import { writeFileSync } from 'fs';

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { ConfigService } from './services/config.service';
import { WsService } from './services/ws.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const cfgService = app.get(ConfigService);
  const wsService = app.get(WsService);
  const origins = cfgService.config.origins;
  console.info('Enabled origins:');
  console.info(origins);
  app.enableCors({
    origin: cfgService.config.origins
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

  const s = app.getHttpServer();
  wsService.init(s);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
