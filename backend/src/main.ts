import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as fs from 'fs';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:3001',
  ];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('API CLIMAS')
    .setDescription('Documentación API CLIMAS')
    .setVersion('1.0')
    .addTag('Users', 'Operaciones con usuarios del sistema')
    .addTag('Auth', 'Autenticación y registro')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document, {
    explorer: true,
    customSiteTitle: 'CLIMAS API',
    swaggerOptions: {
      filter: true,
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
    },
  });

  fs.writeFileSync('./swagger.json', JSON.stringify(document, null, 2));

  await app.listen(process.env.PORT ?? 3001);

  const environment = process.env.NODE_ENV || 'development';

  console.log(`🌍 Entorno: ${environment}`);
  console.log(`🚀 API URL: http://${process.env.HOST}:${process.env.PORT}`);
  console.log(
    `📄 Swagger URL: http://${process.env.HOST}:${process.env.PORT}/api/docs`,
  );
}

bootstrap();
