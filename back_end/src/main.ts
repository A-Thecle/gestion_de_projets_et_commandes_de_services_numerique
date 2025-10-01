import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';
import { GlobalExceptionFilter } from './notifications/exception.filter';
import * as fs from 'fs';
import 'reflect-metadata';



async function bootstrap() {
  const app = await NestFactory.create(AppModule);

;app.enableCors({
    origin: 'http://localhost:4200', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  const uploadDir = join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

  app.use('/uploads', express.static(uploadDir));

  
app.useGlobalFilters(new GlobalExceptionFilter());



  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
