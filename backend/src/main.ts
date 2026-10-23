import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Habilitar CORS para permitir peticiones desde Angular (http://localhost:4200)
  app.enableCors();

  // 2. Establecer el prefijo global '/api' para coincidir con las peticiones del frontend
  app.setGlobalPrefix('api');

  // 3. Configurar pipes de validación global para los DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 4. Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Clínica Médica API')
    .setDescription('Documentación del sistema de gestión de la clínica médica')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`\n==================================================`);
  console.log(`Servidor corriendo en: http://localhost:${port}/api`);
  console.log(`Documentación Swagger en: http://localhost:${port}/api/docs`);
  console.log(`==================================================\n`);
}

bootstrap();
